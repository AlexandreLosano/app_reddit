#!/bin/bash

echo "========================================"
echo "  Reddit Visual Viewer - Deploy"
echo "========================================"
echo ""

# Parar e remover containers existentes
echo "🛑 Parando containers antigos..."
docker compose down

# Construir e iniciar containers
echo "🔨 Construindo e iniciando containers..."
docker compose up -d --build

# Aguardar os serviços ficarem prontos
echo "⏳ Aguardando serviços iniciarem..."
sleep 10

# Verificar status
echo ""
echo "📊 Status dos containers:"
docker compose ps

echo ""
echo "========================================"
echo "  ✅ Deploy concluído!"
echo "========================================"
echo ""
echo "  Acesse:"
echo "  - Local: http://localhost:3333"
echo "  - Externo: http://SEU_IP:3333"
echo ""
echo "  Logs:"
echo "  - docker compose logs -f app"
echo "  - docker compose logs -f mysql"
echo ""
echo "  Parar:"
echo "  - docker compose down"
echo ""
