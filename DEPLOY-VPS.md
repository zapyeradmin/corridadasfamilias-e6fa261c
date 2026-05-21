# Deploy em VPS Hetzner (Ubuntu) — SSR Node + Nginx + PM2

Guia passo a passo para subir o **Corrida das Famílias** em uma VPS Hetzner
CX33 (4 vCPU / 8 GB RAM / Ubuntu) com Node 20, Nginx (reverse proxy),
PM2 (cluster, zero-downtime) e SSL Let's Encrypt.

---

## 1. Preparar a VPS (uma única vez)

SSH como `root`:

```bash
apt update && apt upgrade -y
apt install -y curl git build-essential nginx ufw

# Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# PM2 global
npm install -g pm2

# Firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
```

Criar usuário não-root para a app:

```bash
adduser --disabled-password --gecos "" deploy
usermod -aG sudo deploy
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
```

A partir daqui faça SSH como `deploy@<ip>`.

---

## 2. Clonar o projeto e instalar dependências

```bash
cd ~
git clone https://github.com/<seu-usuario>/corridadasfamilias.git app
cd app
npm ci
```

---

## 3. Configurar variáveis de ambiente

```bash
cp .env.production.example .env
nano .env
```

Preencha:

- `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`
- `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `PUBLIC_SITE_URL` e `VITE_PUBLIC_SITE_URL` (ex.: `https://www.corridadasfamilias.com.br`)
- `INFINITEPAY_HANDLE`, `INFINITEPAY_WEBHOOK_SECRET`
- `LOVABLE_API_KEY` (se usar Lovable AI)

> **Importante:** o `SUPABASE_SERVICE_ROLE_KEY` é secreto. Nunca commite o `.env`
> e guarde um backup em local seguro fora da VPS.

---

## 4. Build de produção (target Node)

```bash
npm run build:node
```

Saída: `dist/server/server.js` (entry SSR) + assets estáticos.

---

## 5. Subir com PM2

```bash
pm2 start ecosystem.config.cjs
pm2 save

# Habilitar start automático no boot
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u deploy --hp /home/deploy
```

Verificar:

```bash
pm2 status
pm2 logs corridadasfamilias --lines 50
curl -I http://127.0.0.1:3000
```

---

## 6. Nginx (reverse proxy)

Crie `/etc/nginx/sites-available/corridadasfamilias`:

```nginx
server {
    listen 80;
    server_name corridadasfamilias.com.br www.corridadasfamilias.com.br;

    client_max_body_size 20m;

    # Cache agressivo para assets versionados
    location /_build/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 60s;
    }
}
```

Ativar:

```bash
sudo ln -s /etc/nginx/sites-available/corridadasfamilias /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

---

## 7. DNS

> Este projeto usa **Cloudflare** como DNS. IP da VPS: **`178.104.101.145`**.

No painel da Cloudflare → DNS → Records, crie/edite:

| Tipo | Nome | Valor              | Proxy            |
|------|------|--------------------|--------------------|
| A    | @    | `178.104.101.145`  | 🟠 ver passo 8     |
| A    | www  | `178.104.101.145`  | 🟠 ver passo 8     |

Aguarde propagação (5–30 min). Confirme com:

```bash
dig +short corridadasfamilias.com.br
dig +short www.corridadasfamilias.com.br
```

---

## 8. SSL com Let's Encrypt (atrás da Cloudflare)

Como o domínio está atrás da Cloudflare, o certbot HTTP-01 só consegue validar
se o **proxy estiver desligado** (nuvem cinza) durante a emissão.

**Opção A — recomendada (HTTP-01, simples):**

1. Na Cloudflare, **desligue o proxy** dos dois A records (clique na nuvem
   laranja → fica cinza / "DNS only"). Aguarde ~1 min para o DNS atualizar.
2. Emita o certificado na VPS:
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx \
     -d corridadasfamilias.com.br \
     -d www.corridadasfamilias.com.br
   ```
   Aceite redirecionamento HTTP→HTTPS quando perguntado.
3. (Opcional) Religue o proxy da Cloudflare (nuvem laranja) para ganhar
   cache/CDN/WAF. Se religar, vá em **SSL/TLS → Overview** no painel da
   Cloudflare e selecione **Full (strict)** — qualquer outro modo causa loop
   de redirect ou erro de certificado.
4. Renovação automática já vem configurada via timer systemd
   (`systemctl list-timers | grep certbot`). Para a renovação funcionar com
   proxy ligado, ative o desafio HTTP-01 via `.well-known` na Cloudflare
   (Rules → Page Rules: `*.corridadasfamilias.com.br/.well-known/*` → Cache
   Level: Bypass) **ou** use a Opção B abaixo.

**Opção B — DNS-01 via API da Cloudflare (sem desligar proxy):**

1. No painel Cloudflare → My Profile → API Tokens → "Create Token", template
   **Edit zone DNS**, escopo apenas `corridadasfamilias.com.br`.
2. Na VPS:
   ```bash
   sudo apt install -y certbot python3-certbot-dns-cloudflare
   sudo mkdir -p /etc/letsencrypt
   echo "dns_cloudflare_api_token = SEU_TOKEN_AQUI" | \
     sudo tee /etc/letsencrypt/cloudflare.ini
   sudo chmod 600 /etc/letsencrypt/cloudflare.ini
   sudo certbot certonly --dns-cloudflare \
     --dns-cloudflare-credentials /etc/letsencrypt/cloudflare.ini \
     -d corridadasfamilias.com.br -d www.corridadasfamilias.com.br
   ```
3. Depois ajuste seu site Nginx para apontar `ssl_certificate` /
   `ssl_certificate_key` para `/etc/letsencrypt/live/corridadasfamilias.com.br/`
   e adicione `listen 443 ssl;` (o `certbot --nginx` da Opção A faz isso
   automaticamente; aqui é manual).



---

## 9. Webhook InfinitePay

Configure no painel InfinitePay:

```
https://www.corridadasfamilias.com.br/api/webhooks/infinitepay
```

Esse endpoint é uma server route do TanStack Start (`src/routes/api/webhooks/infinitepay.ts`)
e roda nativamente no Node SSR. Não é necessário usar a Edge Function do Supabase.

---

## 10. Deploys futuros

Sempre que houver mudanças no GitHub:

```bash
ssh deploy@<ip>
cd ~/app
git pull
npm ci
npm run build:node
pm2 reload corridadasfamilias
```

`pm2 reload` faz reload zero-downtime — usuários ativos não percebem.

---

## 11. Troubleshooting

**`pm2 logs` mostra erro "PORT in use":**
Outra instância está rodando. `pm2 delete all && pm2 start ecosystem.config.cjs`.

**Nginx retorna 502 Bad Gateway:**
A app não está respondendo. Verifique `pm2 status` e `pm2 logs corridadasfamilias`.

**Página em branco mas sem erro 5xx:**
Provavelmente faltou variável `VITE_*` no build. Confirme `.env` e refaça `npm run build:node`.

**Webhook InfinitePay retorna 401/403:**
Verifique `INFINITEPAY_WEBHOOK_SECRET` no `.env` e reinicie: `pm2 reload corridadasfamilias`.

**Certificado SSL expirado:**
`sudo certbot renew --force-renewal && sudo systemctl reload nginx`.

**Atualizar Node:**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install -y nodejs
pm2 reload all
```

---

## 12. Backup

- **Banco de dados:** Supabase já cuida (dashboard → Database → Backups).
- **Arquivos da app:** estão no GitHub. A VPS é descartável.
- **`.env`:** copie para um gerenciador de senhas seguro.
