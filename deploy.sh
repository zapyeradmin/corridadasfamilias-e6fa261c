#!/usr/bin/env bash
# Deploy script para VPS Hetzner — Corrida das Famílias
# Uso: ./deploy.sh
#
# Executa pull do GitHub, instala dependências, faz build Node SSR
# e recarrega o PM2 com zero-downtime.

set -euo pipefail

APP_NAME="corridadasfamilias"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$APP_DIR"

echo "==> [1/5] Verificando branch e working tree..."
if [[ -n "$(git status --porcelain)" ]]; then
  echo "ERRO: há mudanças locais não commitadas em $APP_DIR"
  git status --short
  exit 1
fi

echo "==> [2/5] git pull --ff-only"
git pull --ff-only

echo "==> [3/5] npm ci (instalando dependências exatas do lockfile)"
npm ci

echo "==> [4/5] npm run build:node (build SSR Node)"
npm run build:node

echo "==> [5/5] pm2 reload $APP_NAME (zero-downtime)"
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  pm2 reload "$APP_NAME" --update-env
else
  echo "Processo $APP_NAME não existe ainda — iniciando do ecosystem.config.cjs"
  pm2 start ecosystem.config.cjs
  pm2 save
fi

echo ""
echo "Deploy concluído com sucesso."
pm2 status "$APP_NAME"
