const mysql = require('mysql2/promise');

// Configuração do banco de dados
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'reddit_user',
  password: process.env.DB_PASSWORD || 'reddit_pass',
  database: process.env.DB_NAME || 'reddit_viewer'
};

async function set50Visible() {
  let connection;

  try {
    console.log('🔌 Conectando ao banco de dados...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado ao MySQL!\n');

    // Primeiro, ocultar todos
    console.log('👁️ Ocultando todos os subreddits...');
    await connection.execute('UPDATE subreddits SET visible = FALSE');
    console.log('✅ Todos ocultados!\n');

    // Buscar todos os subreddits
    const [subreddits] = await connection.execute(
      'SELECT id, name FROM subreddits ORDER BY RAND() LIMIT 50'
    );

    console.log('📝 Tornando 50 subreddits aleatórios visíveis...\n');

    for (const sub of subreddits) {
      await connection.execute(
        'UPDATE subreddits SET visible = TRUE WHERE id = ?',
        [sub.id]
      );
      console.log(`✅ Visível: r/${sub.name}`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMO:');
    console.log('='.repeat(50));
    console.log(`✅ 50 subreddits agora estão visíveis`);
    console.log(`👁️ Os demais estão ocultos`);
    console.log('='.repeat(50));

    // Mostrar contagem final
    const [counts] = await connection.execute(
      'SELECT visible, COUNT(*) as count FROM subreddits GROUP BY visible'
    );

    console.log('\n📊 Estatísticas finais:');
    counts.forEach(row => {
      const status = row.visible ? 'Visíveis' : 'Ocultos';
      console.log(`   ${status}: ${row.count}`);
    });

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexão com o banco encerrada.');
    }
  }
}

// Executar
set50Visible();
