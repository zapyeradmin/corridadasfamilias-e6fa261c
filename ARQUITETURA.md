# Arquitetura — Corrida das Famílias

Este documento explica como o projeto está organizado e por que **frontend e
backend vivem no mesmo codebase**. Leia antes de fazer deploy em VPS.

---

## TL;DR

- Stack: **TanStack Start** (React 19 + Vite + SSR Node) — framework
  isomórfico. Não existe `frontend/` e `backend/` separados.
- O build gera **dois bundles** dentro de `dist/`:
  - `dist/server/server.js` → servidor Node (SSR + APIs + server functions)
  - `dist/client/` → assets estáticos (JS, CSS, imagens) servidos pelo Node
- **PM2** roda `dist/server/server.js` em cluster (2 workers).
- **Nginx** faz reverse proxy do `:80/:443` para `127.0.0.1:3000`.

---

## Estrutura de pastas

```
.
├── src/
│   ├── routes/                 ← Páginas (file-based routing TanStack)
│   │   ├── __root.tsx          ← Layout raiz (html/head/body)
│   │   ├── index.tsx           ← /
│   │   ├── inscricao.tsx       ← /inscricao
│   │   ├── _authenticated/     ← Rotas protegidas (admin)
│   │   └── api/
│   │       └── webhooks/
│   │           └── infinitepay.ts   ← POST /api/webhooks/infinitepay (BACKEND)
│   │
│   ├── lib/                    ← Server functions + libs compartilhadas
│   │   ├── *.functions.ts      ← Server functions (RPC tipado, roda no servidor)
│   │   ├── env-check.server.ts ← Verificação de env vars no boot
│   │   └── ...
│   │
│   ├── integrations/supabase/
│   │   ├── client.ts           ← Cliente browser (anon key, RLS aplica)
│   │   ├── client.server.ts    ← Cliente admin (service role, BYPASSA RLS)
│   │   ├── auth-middleware.ts  ← Middleware p/ server functions autenticadas
│   │   └── auth-attacher.ts    ← Anexa JWT do usuário em chamadas RPC
│   │
│   ├── components/             ← React UI (frontend)
│   ├── hooks/                  ← React hooks (frontend)
│   ├── start.ts                ← Bootstrap do servidor (middlewares globais)
│   ├── server.ts               ← Entry SSR para Cloudflare (preview Lovable)
│   └── styles.css              ← Design tokens (Tailwind v4)
│
├── supabase/
│   ├── config.toml
│   └── migrations/             ← SQL migrations (rodadas no Supabase remoto)
│
├── .env                        ← SECRETO — NUNCA commitar (está no .gitignore)
├── .env.production.example     ← Template das env vars (commitado)
├── ecosystem.config.cjs        ← Config PM2 (cluster, port 3000)
├── vite.config.ts              ← Build (TARGET=node ⇒ build Node SSR)
├── package.json                ← scripts: build:node, start:node
├── DEPLOY-VPS.md               ← Guia passo a passo de deploy na VPS
└── ARQUITETURA.md              ← este arquivo
```

---

## Por que NÃO separar frontend e backend em pastas?

**Resposta curta:** o framework é isomórfico por design. Separar quebraria o build.

**Explicação:**

1. **Server functions** (`src/lib/*.functions.ts`) são **importadas por
   componentes React** (`useServerFn(...)`). O transformador do TanStack remove
   automaticamente o código do servidor do bundle do client. Mover para
   `backend/` quebra essa importação tipada.

2. **Server routes** (`src/routes/api/**`) são roteadas pelo mesmo file-based
   routing das páginas. O webhook InfinitePay em
   `src/routes/api/webhooks/infinitepay.ts` é o **backend**, mas mora em
   `src/routes/` porque é assim que o framework descobre rotas.

3. **SSR** — o servidor renderiza os mesmos componentes React do client. Para
   funcionar, eles precisam viver no mesmo grafo de módulos.

**Separação real** (já feita pelo build):

| Arquivo no código             | Roda em                     | Vai pro bundle... |
| ----------------------------- | --------------------------- | ----------------- |
| `*.tsx` (componentes React)   | servidor + browser          | server + client   |
| `*.functions.ts`              | só servidor                 | só server         |
| `*.server.ts` / `.server.tsx` | só servidor                 | só server         |
| `client.server.ts`            | só servidor (service role!) | só server         |
| `api/**/*.ts`                 | só servidor                 | só server         |

---

## Fluxo de uma requisição em produção (VPS)

```
[Browser] ──HTTPS──> [Nginx :443] ──HTTP──> [Node PM2 :3000]
                                              │
                                              ├─ Rota /inscricao
                                              │   → renderiza React SSR → HTML
                                              │
                                              ├─ Rota /api/webhooks/infinitepay
                                              │   → server route handler (POST)
                                              │
                                              └─ Server fn (RPC interno)
                                                  → /_serverFn/... → handler
                                                  → Supabase admin client
```

---

## Variáveis de ambiente

Ficam no arquivo `.env` **na raiz do projeto** (não em subpastas). O Node lê
automaticamente quando o PM2 starta `dist/server/server.js`.

| Variável                        | Quem usa            | Onde fica         |
| ------------------------------- | ------------------- | ----------------- |
| `VITE_SUPABASE_URL`             | Browser + build     | bundled no client |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Browser + build     | bundled no client |
| `SUPABASE_URL`                  | Server functions    | só no servidor    |
| `SUPABASE_PUBLISHABLE_KEY`      | Server functions    | só no servidor    |
| `SUPABASE_SERVICE_ROLE_KEY`     | Server admin client | **SECRETO**       |
| `PUBLIC_SITE_URL`               | Server (redirects)  | só no servidor    |
| `INFINITEPAY_WEBHOOK_SECRET`    | Webhook handler     | **SECRETO**       |
| `LOVABLE_API_KEY`               | Server (IA, opc.)   | **SECRETO**       |

**Verificação no boot:** `src/lib/env-check.server.ts` roda automaticamente
quando o servidor sobe e falha (em produção) se faltar alguma var obrigatória.
Olhe `pm2 logs corridadasfamilias` se a app não subir.

---

## Comandos importantes na VPS

```bash
# Build de produção
npm run build:node                 # gera dist/

# Rodar
pm2 start ecosystem.config.cjs     # primeira vez
pm2 reload corridadasfamilias      # deploy zero-downtime
pm2 logs corridadasfamilias        # ver logs
pm2 restart corridadasfamilias     # restart completo

# Deploy de atualização
git pull && npm ci && npm run build:node && pm2 reload corridadasfamilias
```

---

## Build dual: preview Lovable vs VPS

O `vite.config.ts` tem um toggle:

```ts
const isNodeTarget = process.env.TARGET === "node";
```

- `npm run build` → build Cloudflare Workers (preview/publish Lovable)
- `npm run build:node` → build Node SSR (VPS Hetzner)

Os dois targets compartilham 100% do código. Só muda o runtime de SSR.

---

## Referências

- Deploy passo a passo: [`DEPLOY-VPS.md`](./DEPLOY-VPS.md)
- Template de env vars: [`.env.production.example`](./.env.production.example)
- TanStack Start docs: https://tanstack.com/start
