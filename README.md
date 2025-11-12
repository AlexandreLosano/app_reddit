# Reddit Visual Viewer

Visualizador de posts do Reddit com imagens e vídeos, containerizado com Docker.

## 🚀 Quick Start

```bash
# Iniciar aplicação
./deploy.sh

# Ou manualmente
docker compose up -d
```

Acesse: **http://localhost:3333**

## 📋 Requisitos

- Docker
- Docker Compose

## 🛠️ Comandos Úteis

### Gerenciamento

```bash
# Iniciar
docker compose up -d

# Parar
docker compose down

# Rebuild
docker compose up -d --build

# Ver logs
docker compose logs -f app
docker compose logs -f mysql
```

### Acesso

- **Local**: http://localhost:3333
- **Externo**: http://SEU_IP:3333
- **API Status**: http://localhost:3333/api/status

## 🗄️ Banco de Dados

O projeto usa MySQL 8.0 para armazenar:
- Lista de subreddits
- Visibilidade de cada subreddit

Os dados são persistidos em um volume Docker (`mysql_data`).

## 📡 API Endpoints

```
GET    /api/subreddits          - Listar todos os subreddits
POST   /api/subreddits          - Adicionar novo subreddit
PATCH  /api/subreddits/:id      - Alterar visibilidade
DELETE /api/subreddits/:id      - Remover subreddit
GET    /api/reddit/:sub/:sort   - Buscar posts do Reddit
```

## 🏗️ Estrutura do Projeto

```
.
├── docker-compose.yml    # Orquestração dos containers
├── Dockerfile           # Imagem da aplicação Node.js
├── deploy.sh            # Script de deploy automatizado
├── init.sql             # Schema inicial do banco
├── server.js            # Backend API (Express + MySQL)
├── index.html           # Frontend (React)
├── package.json         # Dependências Node.js
└── .dockerignore        # Arquivos ignorados no build
```

## ⚙️ Configuração

O projeto é configurado via variáveis de ambiente no `docker-compose.yml`:

```yaml
# MySQL
MYSQL_ROOT_PASSWORD: reddit_root_pass
MYSQL_DATABASE: reddit_viewer
MYSQL_USER: reddit_user
MYSQL_PASSWORD: reddit_pass

# App
PORT: 3333
DB_HOST: mysql
```

## 🔧 Desenvolvimento

Para desenvolvimento local sem Docker:

```bash
# Instalar dependências
npm install

# Configurar banco MySQL local
mysql -u root -p < init.sql

# Configurar variáveis de ambiente
export DB_HOST=localhost
export DB_USER=reddit_user
export DB_PASSWORD=reddit_pass
export DB_NAME=reddit_viewer

# Iniciar servidor
npm start
```

## 📝 Features

- ✅ Visualização de posts do Reddit (imagens e vídeos)
- ✅ Gerenciamento de subreddits favoritos
- ✅ Controle de visibilidade (mostrar/ocultar subreddits)
- ✅ Slideshow automático
- ✅ Filtros NSFW
- ✅ Ordenação (hot, new, top, rising)
- ✅ Persistência em banco de dados
- ✅ Containerizado com Docker
- ✅ Acesso por IP externo

## 🐛 Troubleshooting

### Container não inicia

```bash
# Ver logs
docker compose logs app

# Verificar status do MySQL
docker compose logs mysql
```

### Banco de dados não conecta

```bash
# Aguardar health check do MySQL
docker compose ps

# Reiniciar containers
docker compose down && docker compose up -d
```

### Porta 3333 já em uso

Edite `docker-compose.yml` e altere a porta:

```yaml
ports:
  - "NOVA_PORTA:3333"
```

## 📦 Stack

- **Frontend**: React (via CDN), Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: MySQL 8.0
- **Container**: Docker, Docker Compose
- **Proxy**: Node-fetch para bypass CORS

## 📄 Licença

MIT
# ser_reddit
