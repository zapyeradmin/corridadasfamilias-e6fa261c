# Deploy em VPS Hetzner (Ubuntu) — 2ª Corrida Natalina | Corre +

Guia passo a passo para subir a **2ª Corrida Natalina | Corre +** em uma VPS Hetzner
com Node 20, Python 3.13 / FastAPI, Nginx (reverse proxy), PM2 (cluster, zero-downtime) e SSL Let's Encrypt para os 3 domínios.

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
git clone https://github.com/zapyeradmin/corridadasfamilias-e6fa261c.git app
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
- `PUBLIC_SITE_URL` e `VITE_PUBLIC_SITE_URL` (`https://corridascorremais.com.br`)
- `INFINITEPAY_HANDLE`, `INFINITEPAY_CHECKOUT_URL`
- `RESEND_API_KEY` e `RESEND_FROM_EMAIL` (para envio automático dos e-mails de confirmação de inscrição)
- `LOVABLE_API_KEY` (opcional)

> **Importante:** o `SUPABASE_SERVICE_ROLE_KEY` é secreto. Nunca commite o `.env`
> e guarde um backup em local seguro fora da VPS.

---

## 4. Build de produção (target Node)

```bash
npm run build:node
```

Saída: `.output/server/index.mjs` (entry SSR standalone em Node) e `.output/public` (assets estáticos).

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

### 6. Nginx (reverse proxy com redirecionamento de domínios)

Crie `/etc/nginx/sites-available/corridascorremais`:

```nginx
# 1. Redirecionamento de domínios secundários e www para o domínio principal (HTTPS)
server {
    listen 80;
    listen [::]:80;
    server_name www.corridascorremais.com.br
                corridascorremais.com www.corridascorremais.com
                corridascorremais.online www.corridascorremais.online;

    return 301 https://corridascorremais.com.br$request_uri;
}

# 2. Servidor da Aplicação Principal
server {
    listen 80;
    listen [::]:80;
    server_name corridascorremais.com.br;

    root /home/deploy/app/.output/public;
    client_max_body_size 20m;

    # Cache agressivo para assets estáticos e versionados
    location /assets/ {
        try_files $uri @ssr;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Toda a aplicação (SSR + Server Functions + Webhook /api/webhooks/infinitepay)
    location / {
        try_files $uri @ssr;
    }

    location @ssr {
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
sudo ln -s /etc/nginx/sites-available/corridascorremais /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

---

## 7. DNS

> VPS Hetzner IP: **`2.29.30.46`**

No painel de DNS de cada domínio (Cloudflare, Registro.br, etc.), configure os registros tipo `A`:

### Domínio Principal: `corridascorremais.com.br`
| Tipo | Nome | Valor |
| :--- | :--- | :--- |
| **A** | `@` | `2.29.30.46` |
| **A** | `www` | `2.29.30.46` |

### Domínio Secundário: `corridascorremais.com`
| Tipo | Nome | Valor |
| :--- | :--- | :--- |
| **A** | `@` | `2.29.30.46` |
| **A** | `www` | `2.29.30.46` |

### Domínio Terceiro: `corridascorremais.online`
| Tipo | Nome | Valor |
| :--- | :--- | :--- |
| **A** | `@` | `2.29.30.46` |
| **A** | `www` | `2.29.30.46` |

---

## 8. SSL com Let's Encrypt (Certbot)

Emita o certificado SSL gratuito para todos os domínios de uma só vez:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx \
  -d corridascorremais.com.br \
  -d www.corridascorremais.com.br \
  -d corridascorremais.com \
  -d www.corridascorremais.com \
  -d corridascorremais.online \
  -d www.corridascorremais.online
```

Selecione a opção de redirecionar todo o tráfego HTTP para HTTPS quando solicitado.

---

## 9. URLs Oficiais da InfinitePay

Configure no painel da **InfinitePay**:

- **URL do Webhook InfinitePay:**
  ```text
  https://corridascorremais.com.br/api/webhooks/infinitepay
  ```
- **URL de Redirecionamento InfinitePay:**
  ```text
  https://corridascorremais.com.br/pagamento
  ```
- **URL de Redirecionamento de Sucesso InfinitePay:**
  ```text
  https://corridascorremais.com.br/sucesso
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
