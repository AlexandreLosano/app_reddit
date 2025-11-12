const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
const mysql = require('mysql2/promise');
const redis = require('redis');

const app = express();
const PORT = process.env.PORT || 3333;
const CACHE_TTL = 40 * 60; // 40 minutos em segundos

// Configuração do banco de dados
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'reddit_user',
  password: process.env.DB_PASSWORD || 'reddit_pass',
  database: process.env.DB_NAME || 'reddit_viewer',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;
let redisClient;

// Inicializar conexão com o banco
async function initDB() {
  try {
    pool = mysql.createPool(dbConfig);
    const connection = await pool.getConnection();
    console.log('✅ Conectado ao MySQL com sucesso!');
    connection.release();
  } catch (error) {
    console.error('❌ Erro ao conectar ao MySQL:', error.message);
    process.exit(1);
  }
}

// Inicializar Redis
async function initRedis() {
  try {
    redisClient = redis.createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
      }
    });

    redisClient.on('error', (err) => console.error('❌ Redis Error:', err));
    await redisClient.connect();
    console.log('✅ Conectado ao Redis com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao conectar ao Redis:', error.message);
    // Não vamos fazer exit - o app pode funcionar sem cache
  }
}

// Permitir requisições do frontend
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname)));

// ========== ROTAS DE SUBREDDITS ==========

// Listar todos os subreddits
app.get('/api/subreddits', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, visible FROM subreddits ORDER BY name ASC'
    );
    // Converter visible de 1/0 para true/false
    const subreddits = rows.map(row => ({
      ...row,
      visible: Boolean(row.visible)
    }));
    res.json(subreddits);
  } catch (error) {
    console.error('Erro ao listar subreddits:', error);
    res.status(500).json({ error: 'Erro ao listar subreddits' });
  }
});

// Adicionar novo subreddit
app.post('/api/subreddits', async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Nome do subreddit é obrigatório' });
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO subreddits (name, visible) VALUES (?, TRUE)',
      [name]
    );

    res.json({
      id: result.insertId,
      name,
      visible: true,
      message: 'Subreddit adicionado com sucesso'
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Subreddit já existe' });
    }
    console.error('Erro ao adicionar subreddit:', error);
    res.status(500).json({ error: 'Erro ao adicionar subreddit' });
  }
});

// Atualizar visibilidade do subreddit
app.patch('/api/subreddits/:id', async (req, res) => {
  const { id } = req.params;
  const { visible } = req.body;

  if (visible === undefined) {
    return res.status(400).json({ error: 'Campo visible é obrigatório' });
  }

  try {
    const [result] = await pool.execute(
      'UPDATE subreddits SET visible = ? WHERE id = ?',
      [visible, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Subreddit não encontrado' });
    }

    res.json({ message: 'Visibilidade atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar subreddit:', error);
    res.status(500).json({ error: 'Erro ao atualizar subreddit' });
  }
});

// Remover subreddit
app.delete('/api/subreddits/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.execute(
      'DELETE FROM subreddits WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Subreddit não encontrado' });
    }

    res.json({ message: 'Subreddit removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover subreddit:', error);
    res.status(500).json({ error: 'Erro ao remover subreddit' });
  }
});

// ========== ROTAS DO REDDIT ==========

// Rota para buscar posts do Reddit (com cache)
app.get('/api/reddit/:subreddit/:sort', async (req, res) => {
  const { subreddit, sort } = req.params;
  const limit = req.query.limit || 100;
  const nsfw = req.query.nsfw || 'all'; // sfw, nsfw, all
  const cacheKey = `reddit:${subreddit}:${sort}:${limit}:${nsfw}`;

  try {
    // Tentar buscar do cache primeiro
    if (redisClient && redisClient.isOpen) {
      try {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          console.log(`⚡ CACHE HIT - r/${subreddit}/${sort} (nsfw:${nsfw})`);
          return res.json(JSON.parse(cached));
        }
      } catch (cacheError) {
        console.log('⚠️ Erro ao ler cache, buscando do Reddit:', cacheError.message);
      }
    }

    console.log(`[${new Date().toLocaleTimeString()}] Buscando r/${subreddit}/${sort} do Reddit`);

    const redditUrl = `https://www.reddit.com/r/${subreddit}/${sort}.json?limit=${limit}&raw_json=1`;

    const response = await fetch(redditUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Reddit API retornou status ${response.status}`);
    }

    const data = await response.json();

    console.log(`✅ ${data.data.children.length} posts recebidos de r/${subreddit}`);

    // Salvar no cache
    if (redisClient && redisClient.isOpen) {
      try {
        await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(data));
        console.log(`💾 Cached r/${subreddit} por ${CACHE_TTL / 60} minutos`);
      } catch (cacheError) {
        console.log('⚠️ Erro ao salvar cache:', cacheError.message);
      }
    }

    res.json(data);

  } catch (error) {
    console.error('❌ Erro ao buscar do Reddit:', error.message);
    res.status(500).json({
      error: 'Erro ao buscar dados do Reddit',
      message: error.message
    });
  }
});

// Rota de status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    message: 'Backend Reddit funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Rota principal - servir o index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar servidor
async function startServer() {
  await initDB();
  await initRedis();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔═══════════════════════════════════════════════╗
║   🚀 Backend Reddit rodando!                 ║
║                                              ║
║   URL: http://0.0.0.0:${PORT}                     ║
║   Frontend: http://0.0.0.0:${PORT}/               ║
║   Status: http://0.0.0.0:${PORT}/api/status       ║
║                                              ║
║   Endpoints disponíveis:                     ║
║   GET /api/reddit/:subreddit/:sort           ║
║   GET /api/subreddits                        ║
║   POST /api/subreddits                       ║
║   PATCH /api/subreddits/:id                  ║
║   DELETE /api/subreddits/:id                 ║
║                                              ║
║   👉 Acesse de qualquer IP na porta ${PORT}      ║
╚═══════════════════════════════════════════════╝
  `);
  });
}

startServer().catch(console.error);
