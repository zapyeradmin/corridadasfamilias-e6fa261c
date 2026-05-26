#!/usr/bin/env bash
# Deploy script para VPS Hetzner — Corrida das Famílias
# Uso: ./deploy.sh
#
# Faz pull do GitHub, instala dependências, builda o SSR Node e recarrega o PM2
# com zero-downtime. Verifica cada etapa e aborta com mensagem clara se algo falhar.

set -Eeuo pipefail

APP_NAME="corridadasfamilias"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HEALTH_URL="http://127.0.0.1:3000"
HEALTH_TIMEOUT=30   # segundos

cd "$APP_DIR"

log()  { printf "\n\033[1;36m==> %s\033[0m\n" "$*"; }
fail() { printf "\n\033[1;31m[deploy] ERRO: %s\033[0m\n" "$*" >&2; exit 1; }

trap 'fail "Deploy abortado na linha $LINENO (último comando: ${BASH_COMMAND})"' ERR

# ---------------------------------------------------------------------------
log "[1/7] Verificando working tree limpo"
if [[ -n "$(git status --porcelain)" ]]; then
  git status --short
  fail "Há mudanças locais não commitadas em $APP_DIR. Faça stash/reset antes."
fi

# ---------------------------------------------------------------------------
log "[2/7] git pull --ff-only"
BEFORE_SHA="$(git rev-parse HEAD)"
git pull --ff-only
AFTER_SHA="$(git rev-parse HEAD)"
if [[ "$BEFORE_SHA" == "$AFTER_SHA" ]]; then
  echo "Nenhum commit novo (HEAD = ${AFTER_SHA:0:7}). Seguindo com rebuild mesmo assim."
else
  echo "Atualizado: ${BEFORE_SHA:0:7} -> ${AFTER_SHA:0:7}"
fi

# ---------------------------------------------------------------------------
log "[3/7] Verificando .env"
[[ -f .env ]] || fail "Arquivo .env não encontrado em $APP_DIR. Restaure-o antes de continuar."

# ---------------------------------------------------------------------------
log "[4/7] npm ci (instalando dependências exatas do lockfile)"
npm ci --no-audit --no-fund

# ---------------------------------------------------------------------------
log "[5/7] npm run build:node (build SSR Node)"
# Limpa build anterior para garantir que falha de build não vá ao ar.
rm -rf dist
npm run build:node

# Verifica que o artefato esperado existe — se não, NÃO recarrega o PM2.
BUILD_OUT="dist/server/server.js"
if [[ ! -f "$BUILD_OUT" ]]; then
  echo "Conteúdo de dist/ após build:"
  ls -la dist/ dist/server/ 2>/dev/null || true
  fail "Build terminou mas $BUILD_OUT não existe. PM2 NÃO foi recarregado (versão anterior continua no ar)."
fi
echo "OK: $BUILD_OUT gerado ($(stat -c%s "$BUILD_OUT") bytes)"

# ---------------------------------------------------------------------------
log "[6/7] pm2 reload $APP_NAME (zero-downtime)"
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  pm2 reload "$APP_NAME" --update-env
else
  echo "Processo $APP_NAME não existe — iniciando do ecosystem.config.cjs"
  pm2 start ecosystem.config.cjs
  pm2 save
fi

# ---------------------------------------------------------------------------
log "[7/7] Health check em $HEALTH_URL (timeout ${HEALTH_TIMEOUT}s)"
ok=0
for i in $(seq 1 "$HEALTH_TIMEOUT"); do
  if curl -fsS -o /dev/null -m 2 "$HEALTH_URL"; then
    ok=1
    echo "OK: app respondeu em ${i}s"
    break
  fi
  sleep 1
done

if [[ "$ok" -ne 1 ]]; then
  echo ""
  echo "---- pm2 status ----"
  pm2 status "$APP_NAME" || true
  echo "---- últimos logs ----"
  pm2 logs "$APP_NAME" --lines 40 --nostream || true
  fail "App não respondeu em $HEALTH_URL após ${HEALTH_TIMEOUT}s. Investigue os logs acima."
fi

echo ""
printf "\033[1;32mDeploy concluído com sucesso (HEAD = %s).\033[0m\n" "${AFTER_SHA:0:7}"
pm2 status "$APP_NAME"
