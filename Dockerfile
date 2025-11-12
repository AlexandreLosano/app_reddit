FROM node:18-alpine

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install --production

# Copiar código da aplicação
COPY . .

# Expor porta 3333
EXPOSE 3333

# Comando para iniciar a aplicação
CMD ["node", "server.js"]
