# Corrida das Famílias

Site oficial da **II Corrida das Famílias** — Serra Talhada/PE.
Stack: **TanStack Start v1 (React 19 + Vite 7)**, **Tailwind v4**, **Supabase**, integração com **InfinitePay**.

Domínio de produção: <https://www.corridadasfamilias.com.br>

---

## Stack

- **Frontend / SSR**: TanStack Start v1 (file-based routing em `src/routes/`)
- **Estilização**: Tailwind CSS v4 (`src/styles.css`) + shadcn/ui
- **Backend de dados**: Supabase (Postgres + Auth + Storage), projeto `ljquyrrprrwqpmaomwsh`
- **Server functions**: `createServerFn` do `@tanstack/react-start` em `src/lib/*.functions.ts`
- **Server route pública (webhook)**: `src/routes/api/webhooks/infinitepay.ts`
- **Pagamento**: InfinitePay (links de checkout configuráveis em `/admin/configuracoes`)
- **Runtime de build atual**: Cloudflare Workers (`@cloudflare/vite-plugin` + `wrangler.jsonc`)

## Estrutura

```
src/
  routes/                  TanStack file-based routing
    _authenticated/        Rotas que exigem login (admin/*)
    api/webhooks/          Server routes públicas (webhook InfinitePay)
  components/              UI (admin, site, home, ui/shadcn)
  hooks/                   useAuth, useSiteContacts, useMobile
  integrations/supabase/   client (browser), client.server (admin), auth-*
  lib/                     *.functions.ts (server fns), helpers
  styles.css               Tema (tokens semânticos)
```

## Rodando localmente

Requer **Node 20+** e **bun** (ou npm).

```bash
bun install
cp .env.example .env       # preencher SUPABASE_SERVICE_ROLE_KEY etc.
bun dev
```

App em <http://localhost:8080>.

## Variáveis de ambiente

Veja **`.env.example`** para a lista completa. Resumo:

| Variável | Onde | Para quê |
|---|---|---|
| `PUBLIC_SITE_URL` | servidor | URL canônica usada em `redirect_url` da InfinitePay |
| `VITE_PUBLIC_SITE_URL` | cliente | mesmo valor, exposto ao bundle |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` | cliente | client Supabase do navegador |
| `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` | servidor | client Supabase no SSR |
| `SUPABASE_SERVICE_ROLE_KEY` | servidor | admin client (bypassa RLS). **NUNCA expor.** |
| `LOVABLE_API_KEY` | servidor | gateway de IA (opcional, gerenciado pela Lovable) |

## URLs da InfinitePay em produção

Configurar no painel da InfinitePay:

| Item | URL |
|---|---|
| Webhook | `https://www.corridadasfamilias.com.br/api/webhooks/infinitepay` |
| Redirecionamento | `https://www.corridadasfamilias.com.br/pagamento` |
| Sucesso | `https://www.corridadasfamilias.com.br/sucesso` |

A página `/admin/configuracoes` (aba **Pagamento**) exibe estas URLs com botão de copiar, derivadas de `PUBLIC_SITE_URL`.

Regra de idade: **≤ 9 anos → checkout Criança**, **> 9 anos → checkout Adulto**. Os links de cada checkout são configuráveis na mesma página e persistidos em `settings`.

---

## Deploy

### Opção A — Lovable (recomendado)

O projeto já está configurado para o runtime da Lovable (Cloudflare Workers, SSR + webhook nativos).

1. No editor Lovable: **Publish** → publica em `corridadasfamilias.lovable.app`.
2. **Project Settings → Domains → Connect Domain**: adicionar `www.corridadasfamilias.com.br` e `corridadasfamilias.com.br`.
3. Apontar DNS no registrador conforme instruções do painel (registros A + TXT).
4. Configurar as **Secrets** no painel (já existentes em projetos sincronizados): `SUPABASE_SERVICE_ROLE_KEY`, `PUBLIC_SITE_URL=https://www.corridadasfamilias.com.br`.
5. Atualizar webhook no painel da InfinitePay para a URL acima.

Tudo funciona sem nenhuma refatoração de runtime: SSR, server functions, webhook, auth.

### Opção B — Hostinger Web App Node.js (alternativa)

> **Importante:** o build atual gera um bundle Worker (Cloudflare). Para rodar em Node tradicional como a Hostinger pede, o caminho mais simples é servir o app como **SPA estática** e mover o webhook InfinitePay para uma Supabase Edge Function. SSR e server functions atuais NÃO rodam diretamente em `node server.js` sem trocar o adapter do TanStack Start.

Se mesmo assim quiser publicar pela Hostinger usando GitHub:

1. **Conecte o repo ao GitHub** (no editor Lovable: `+` → GitHub → Connect project).
2. No painel da Hostinger, crie um **Web App Node.js** apontando para o repositório.
3. Configure:
   - Node version: **20**
   - Install command: `npm install`
   - Build command: `npm run build`
   - Start command: `npm start`
   - Port: `3000` (Hostinger injeta via `process.env.PORT`)
4. Preencha as env vars do `.env.example` no painel da Hostinger.
5. Aponte DNS de `www.corridadasfamilias.com.br` para a Hostinger.
6. **Mova o webhook** para uma Supabase Edge Function e use a URL `https://ljquyrrprrwqpmaomwsh.supabase.co/functions/v1/infinitepay-webhook` no painel da InfinitePay (a rota `/api/webhooks/infinitepay` deste app não responderá em modo SPA).

O script `npm start` atual roda `vite preview` em `0.0.0.0:${PORT}`, suficiente para Hostinger servir o build estático.

---

## Testando

| Fluxo | Como |
|---|---|
| Build de produção | `bun run build` |
| Página inicial | abrir `/` |
| Inscrição | `/inscricao` (validar regra de idade no console) |
| Pagamento (retorno OK) | `/pagamento?protocol=XXX` |
| Sucesso | `/sucesso` |
| Falha | `/falhanopagamento` |
| Admin | `/admin/configuracoes`, `/admin/inscricoes`, `/admin/logs` |
| Webhook (health-check) | `curl https://www.corridadasfamilias.com.br/api/webhooks/infinitepay` (Opção A) |
| Webhook (POST simulado) | `curl -X POST -H 'Content-Type: application/json' -d '{"transaction_nsu":"TEST","order_nsu":"X","amount":6800}' ...` |

## Segurança

- `SUPABASE_SERVICE_ROLE_KEY` só em variáveis de ambiente do servidor; **nunca** com prefixo `VITE_`.
- RLS habilitada nas tabelas sensíveis (`user_roles`, `registrations`, `payments`, `settings`).
- Rotas administrativas protegidas por `/_authenticated` (redireciona para `/login`).
- Webhook valida payload com Zod e usa idempotência por `transaction_nsu`.
- Confirmação de pagamento exige match de `order_nsu` + valor esperado por tipo de participante.

## Banco

Migrations gerenciadas via Supabase. Tabelas principais: `events`, `lots`, `registrations`, `payments`, `infinitepay_events`, `settings`, `sponsors`, `user_roles`, `access_logs`.

Para exportar dados: Supabase Dashboard → Table editor → Export CSV.

## Licença

Uso interno do ECC da Paróquia de Nossa Senhora do Rosário — Serra Talhada/PE.
