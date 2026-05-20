## Contexto e ponto crítico

O projeto hoje roda em **TanStack Start + Cloudflare Workers** (`@cloudflare/vite-plugin`, `wrangler.jsonc`, `src/server.ts` no formato Module Worker `export default { fetch }`). A preview/publicação na Lovable usa esse runtime.

A Hostinger Web App Node.js roda **Node tradicional** (espera `npm start`, `process.env.PORT`, `node server.js`). O artefato atual **não inicia em Node**.

Além disso, o preset `@lovable.dev/vite-tanstack-config` injeta o plugin do Cloudflare e o entry de servidor por padrão. Mexer no adapter conflita com a preview da Lovable.

Por isso a estratégia é **dual target**: manter o build Cloudflare intacto para a Lovable continuar funcionando, e adicionar um build Node paralelo para a Hostinger. Nada do código de aplicação muda — só configuração e um entry alternativo.

Refatoração: conservadora (sem mover pastas, só limpeza e melhorias internas).

---

## 1. Adapter Node para Hostinger (paralelo ao Cloudflare)

Criar arquivos novos sem remover os atuais:

- `server.node.ts` (raiz) — servidor Node usando `http.createServer`, que importa o handler SSR construído pelo TanStack (`@tanstack/react-start/server-entry`) e o adapta para `IncomingMessage`/`ServerResponse` via `@whatwg-node/server` (ou via `Hono`'s node adapter, dependendo do que o build produzir). Escuta `process.env.PORT || 3000` em `0.0.0.0`.
- `vite.config.node.ts` — config Vite separado que **não** carrega `@cloudflare/vite-plugin`. Importa o mesmo preset mas sobrescreve `tanstackStart.server` (entry node) e desativa o cloudflare plugin via `plugins` filter.
- `package.json` ganha scripts adicionais (sem remover os existentes):
  - `build:node` → `vite build --config vite.config.node.ts`
  - `start` → `node dist/server/server.node.js`
  - `start:node` (alias do start)
- `.nvmrc` com Node 20.
- `wrangler.jsonc` permanece como está (Lovable continua publicando normal).

Risco: o preset da Lovable é opinativo. Se o override do plugin cloudflare falhar, plano B é gerar bundle SPA puro (`build:spa`) e servir com um Express minimal em `server.node.ts` — mas isso **perde SSR e o webhook InfinitePay** (que vira Supabase Edge Function). Vou tentar o caminho SSR primeiro.

## 2. URLs configuráveis via env (sem hardcode)

- `src/lib/site-config.ts` passa a expor `getPublicSiteUrl()` que lê:
  - servidor: `process.env.PUBLIC_SITE_URL`
  - cliente: `import.meta.env.VITE_PUBLIC_SITE_URL`
  - fallback: `https://www.corridadasfamilias.com.br`
- `src/lib/infinitepay.functions.ts` remove o hardcode `corridadasfamilias.lovable.app` e usa `getPublicSiteUrl()` para montar `redirect_url`.
- A aba **Pagamento** em `/admin/configuracoes` ganha um bloco "URLs de Produção (InfinitePay)" com 3 campos read-only + botão copiar:
  - Webhook: `{PUBLIC_SITE_URL}/api/webhooks/infinitepay`
  - Redirect: `{PUBLIC_SITE_URL}/pagamento`
  - Sucesso: `{PUBLIC_SITE_URL}/sucesso`
  As URLs são derivadas em tempo de render usando uma server fn que devolve `PUBLIC_SITE_URL` resolvido no servidor.

## 3. Refatoração conservadora

Sem mover pastas. Mudanças cirúrgicas:

- Remover imports não utilizados (rg + revisão manual nos arquivos com mais churn: `admin.configuracoes.tsx`, `admin.logs.tsx`, `home-patrocinadores.tsx`, `infinitepay.functions.ts`, `public.functions.ts`, `admin.functions.ts`).
- Padronizar mensagens de erro/loading nas server functions já existentes (retorno `{ ok, error }` consistente).
- Garantir que toda server fn sensível em `admin.functions.ts` use `requireSupabaseAuth` + checagem de role `admin` (auditoria rápida, sem reescrever).
- Validar com Zod payloads dos endpoints públicos que ainda não validam.

## 4. Documentação e arquivos de deploy

- `README.md` reescrito com:
  - Stack, requisitos, scripts.
  - Como rodar local (`bun dev`).
  - Deploy Lovable (atual, continua funcionando).
  - **Deploy Hostinger Web App Node.js via GitHub** passo a passo: criar Web App no painel → conectar repo → setar `NODE_VERSION=20`, `Build Command: npm install && npm run build:node`, `Start Command: npm start`, `Port: 3000` → preencher env vars → deploy.
  - URLs InfinitePay produção.
  - Como testar webhook (`curl -X POST` para `/api/webhooks/infinitepay`).
- `.env.example` na raiz com **só nomes**:
  ```
  NODE_ENV=production
  PORT=3000
  PUBLIC_SITE_URL=https://www.corridadasfamilias.com.br
  VITE_PUBLIC_SITE_URL=https://www.corridadasfamilias.com.br
  VITE_SUPABASE_URL=
  VITE_SUPABASE_PUBLISHABLE_KEY=
  VITE_SUPABASE_PROJECT_ID=
  SUPABASE_URL=
  SUPABASE_PUBLISHABLE_KEY=
  SUPABASE_SERVICE_ROLE_KEY=
  LOVABLE_API_KEY=
  ```
- `.gitignore` auditado (`.env`, `dist/`, `.wrangler/`, `node_modules/`, `*.log`).

## 5. Validação

- `bun run build` (Cloudflare) — Lovable não pode quebrar.
- `bun run build:node` — gera bundle Node.
- `node dist/server/server.node.js` localmente, hit em `/`, `/inscricao`, `/admin`, `/api/webhooks/infinitepay` (GET health-check).
- Smoke test do checkout: chamar `getCheckoutUrlForRegistration` e verificar que o `redirect_url` usa `www.corridadasfamilias.com.br`.

---

## Entregáveis

**Novos:** `server.node.ts`, `vite.config.node.ts`, `.nvmrc`, `.env.example`, `README.md` (reescrito).
**Editados:** `package.json` (scripts + 1-2 deps Node adapter), `src/lib/site-config.ts`, `src/lib/infinitepay.functions.ts`, `src/components/admin/configuracoes/tab-pagamento.tsx`, `.gitignore`, alguns arquivos com imports não usados.
**Não tocados:** rotas, componentes UI, schema do banco, fluxo de inscrição, regra de idade, webhook (lógica), Supabase clients, `wrangler.jsonc`, `src/server.ts`.

## O que precisa ser feito manualmente por você

1. Conectar o repo no GitHub via Lovable (botão + → GitHub).
2. No painel da Hostinger, criar a Web App Node.js apontando para o repo.
3. Preencher as env vars listadas no `.env.example` no painel da Hostinger (especialmente `SUPABASE_SERVICE_ROLE_KEY` e `PUBLIC_SITE_URL`).
4. Apontar o DNS de `www.corridadasfamilias.com.br` para a Hostinger.
5. Atualizar webhook URL no painel da InfinitePay para `https://www.corridadasfamilias.com.br/api/webhooks/infinitepay`.

## Riscos conhecidos

- Se o preset Lovable não permitir override limpo do adapter, vamos cair no plano B (SPA + Express) e mover o webhook InfinitePay para uma Supabase Edge Function — você terá uma URL diferente (`https://ljquyrrprrwqpmaomwsh.supabase.co/functions/v1/infinitepay-webhook`) para configurar na InfinitePay. Vou avisar imediatamente se isso acontecer.