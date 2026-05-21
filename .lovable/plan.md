# Plano — Preparar deploy VPS (4 ajustes + nota Cloudflare)

## 1. Limpar arquivos obsoletos

- Remover `DEPLOY-HOSTINGER.md` (substituído por `DEPLOY-VPS.md`).
- Remover `supabase/functions/infinitepay-webhook/` (webhook agora roda nativamente em `src/routes/api/webhooks/infinitepay.ts`).
- Remover a entrada `[functions.infinitepay-webhook]` de `supabase/config.toml`.

## 2. Criar `ARQUITETURA.md`

Documento na raiz explicando, para quem for fazer o deploy:

- Por que **não existe** pasta `frontend/` e `backend/` separadas (TanStack Start é isomórfico — separar quebra o build/SSR).
- Tabela mostrando o que vira **só servidor** vs **só client** vs **ambos** (`*.functions.ts`, `*.server.ts`, `client.server.ts`, `routes/api/**`, componentes React).
- Mapa de pastas comentado (`src/routes/`, `src/lib/`, `src/integrations/supabase/`, `.output/`).
- Fluxo de uma requisição em produção: `Browser → Nginx :443 → Node PM2 :3000 → (SSR | server route | server fn)`.
- Tabela de variáveis de ambiente (quais vão para o browser, quais são secretas).
- Comandos PM2 essenciais (`start`, `reload`, `logs`, `restart`).
- Toggle dual-build: `npm run build` (Cloudflare/preview Lovable) vs `npm run build:node` (VPS).

## 3. Garantir `.env` no `.gitignore`

`.gitignore` atual **não tem** `.env` listado. Adicionar bloco:

```
# Environment variables (secrets — NEVER commit)
.env
.env.local
.env.production
.env.*.local
```

## 4. Verificação de env vars no boot

Criar `src/lib/env-check.server.ts` com função `verifyServerEnv()` que:

- Lista as vars **obrigatórias**: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `PUBLIC_SITE_URL`.
- Lista **opcionais** (warning, não falha): `INFINITEPAY_WEBHOOK_SECRET`, `LOVABLE_API_KEY`.
- Em `NODE_ENV=production` → `throw` (PM2 reinicia e o erro fica visível em `pm2 logs`).
- Em dev → só warning no console, não derruba.

Invocar uma única vez em `src/start.ts` (entry global do servidor).

## Nota sobre Cloudflare + SSL na VPS

O domínio já está atrás da Cloudflare. No passo do Let's Encrypt do `DEPLOY-VPS.md`, **desligue o proxy (nuvem cinza)** temporariamente para o `certbot --nginx` validar via HTTP-01, depois religue se quiser cache/WAF — nesse caso ajuste **SSL/TLS = Full (strict)** no painel da Cloudflare. Alternativa: usar o plugin DNS-01 do certbot com token de API da Cloudflare (sem precisar desligar proxy). Vou adicionar essa seção curta ao `DEPLOY-VPS.md` junto com o IP `178.104.101.145` nos exemplos de DNS.

## Detalhes técnicos

- Nenhuma alteração de build/runtime (apenas docs, gitignore e um check de boot).
- Sem nova dependência npm.
- `src/lib/env-check.server.ts` segue a convenção `*.server.ts` (excluído do bundle do client automaticamente).
- `src/start.ts` já é server-only e roda antes de qualquer request.
