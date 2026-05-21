
# Deploy do projeto em VPS Hetzner (SSR Node + Nginx + PM2)

Objetivo: rodar este projeto TanStack Start em modo SSR Node em uma VPS Hetzner CX33 (Ubuntu), atrás do Nginx com SSL Let's Encrypt, com deploy por `git pull` + `pm2 reload`.

## 1. Ajustes no projeto (commits que farei após aprovação)

Hoje o projeto está configurado para Cloudflare Workers (`@cloudflare/vite-plugin` + `src/server.ts` em formato Worker). Para rodar SSR em Node, preciso:

1. **`vite.config.ts`** — desativar o plugin Cloudflare quando `TARGET=node`, mantendo o build atual quando `TARGET` não estiver setado (preview Lovable continua funcionando).
2. **`src/server.node.ts`** — novo entry Node usando `@tanstack/react-start/server-entry` exposto via `http.createServer`, ouvindo em `process.env.PORT` (default 3000). Mantém o `src/server.ts` Cloudflare atual intacto.
3. **`package.json`** — scripts:
   - `build:node`: `TARGET=node vite build`
   - `start:node`: `node .output/server/index.mjs` (ou o arquivo gerado conforme adapter)
   - Mantém `dev`, `build`, `start` atuais.
4. **`ecosystem.config.cjs`** (PM2) — `name: corridadasfamilias`, `script: npm`, `args: run start:node`, `instances: 2` (cluster), `env: NODE_ENV=production, PORT=3000`.
5. **`.env.production.example`** — lista de variáveis exigidas pelo SSR (não commitar valores reais).
6. **`DEPLOY-VPS.md`** — passo a passo completo (abaixo).

Não vou tocar em código de produto (rotas, componentes, server functions). Apenas configuração de build/runtime.

## 2. Webhook InfinitePay

O webhook `src/routes/api/webhooks/infinitepay.ts` continua funcionando normalmente em SSR Node — não precisa migrar para Edge Function. URL final: `https://www.corridadasfamilias.com.br/api/webhooks/infinitepay`. A Edge Function `infinitepay-webhook` que já está deployada pode ser removida ou mantida como fallback (sua escolha).

## 3. Preparação da VPS Hetzner

SSH como root e:

```bash
apt update && apt upgrade -y
apt install -y curl git build-essential nginx ufw
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2
ufw allow OpenSSH && ufw allow 'Nginx Full' && ufw --force enable
```

Criar usuário não-root para a app:
```bash
adduser --disabled-password --gecos "" deploy
usermod -aG sudo deploy
mkdir -p /home/deploy/.ssh && cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh && chmod 700 /home/deploy/.ssh
```

## 4. Clonar e configurar o app

Como `deploy`:
```bash
cd ~
git clone https://github.com/<seu-usuario>/corridadasfamilias.git app
cd app
npm ci
cp .env.production.example .env
nano .env   # preencher VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY,
            # SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, INFINITEPAY_*, PUBLIC_SITE_URL etc.
npm run build:node
pm2 start ecosystem.config.cjs
pm2 save
sudo pm2 startup systemd -u deploy --hp /home/deploy
```

## 5. Nginx (reverse proxy + SSL)

`/etc/nginx/sites-available/corridadasfamilias`:
```
server {
  listen 80;
  server_name corridadasfamilias.com.br www.corridadasfamilias.com.br;

  client_max_body_size 20m;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
```
```bash
sudo ln -s /etc/nginx/sites-available/corridadasfamilias /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## 6. DNS + SSL

1. No painel do registrador, criar registros A:
   - `corridadasfamilias.com.br` → IP da VPS
   - `www.corridadasfamilias.com.br` → IP da VPS
2. Aguardar propagação (5–30 min).
3. Emitir SSL:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d corridadasfamilias.com.br -d www.corridadasfamilias.com.br
```
Renovação automática já vem configurada via systemd timer.

## 7. Atualizações futuras (deploy manual)

```bash
ssh deploy@<ip>
cd ~/app
git pull
npm ci
npm run build:node
pm2 reload corridadasfamilias
```

## 8. Variáveis de ambiente necessárias

- `NODE_ENV=production`
- `PORT=3000`
- `PUBLIC_SITE_URL=https://www.corridadasfamilias.com.br`
- `VITE_PUBLIC_SITE_URL=https://www.corridadasfamilias.com.br`
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`
- `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `INFINITEPAY_HANDLE`, `INFINITEPAY_WEBHOOK_SECRET` (se aplicável)
- `LOVABLE_API_KEY` (se usar Lovable AI)

## 9. Riscos e observações

- **Adapter Node do TanStack Start:** o template foi gerado para Worker. O entry Node (`src/server.node.ts`) precisa ser validado após o primeiro build — se o `vite-tanstack-config` não emitir bundle Node, troco para `vite preview` (ainda Node, sem Worker) como fallback de start.
- **Preview Lovable:** todas as mudanças preservam o build padrão. O preview continua usando Cloudflare.
- **Edge Function `infinitepay-webhook`:** posso removê-la após confirmar que o webhook em `/api/webhooks/infinitepay` funciona em produção.
- **Backup do `.env`:** guarde fora da VPS — ele contém o `SUPABASE_SERVICE_ROLE_KEY`.
- **Recursos:** CX33 (4 vCPU / 8 GB) é folgado; PM2 cluster com 2 instâncias deixa CPU sobrando para picos.

Após aprovação, implemento os ajustes em código (vite.config, server.node.ts, package.json, ecosystem, .env example, DEPLOY-VPS.md) em uma única iteração e te entrego o repositório pronto para `git push` → `git pull` na VPS.
