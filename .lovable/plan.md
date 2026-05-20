# Deploy do projeto na Hostinger Web App Node.js

## Por que o erro 403 acontece hoje

O domínio `corridadasfamilias.com.br` já está apontando o DNS para a Hostinger, mas a Web App Node.js ainda **não tem nenhum app rodando** (ou o `public_html` está vazio). O servidor da Hostinger responde **403 Forbidden** porque não encontra nada para servir. A solução é concluir o deploy.

## Limitação técnica importante (decisão do plano)

O build atual gera bundle para **Cloudflare Workers** (`wrangler.jsonc` + `@cloudflare/vite-plugin`). Hostinger Node.js roda **Node.js tradicional**, que é incompatível. Mudar o adapter do TanStack Start para Node quebra o preview do Lovable.

**Estratégia:** rodar na Hostinger como **SPA (Single Page App) servida por `vite preview`**, que é compatível com Node.js puro e já está configurada (`npm start`). Como SPA não executa server functions nem server routes, o **webhook da InfinitePay precisa migrar** para uma **Supabase Edge Function** (URL fixa e pública, ideal para webhooks).

O resto da lógica do app (consultas, login, admin) continua funcionando porque já usa Supabase diretamente do cliente via RLS, ou via server functions que serão substituídas por chamadas diretas ao Supabase no modo SPA.

> ⚠️ **Alerta:** rodar como SPA significa **perder SSR**. As páginas continuam funcionando, mas o SEO/og:image dinâmico do TanStack Start não roda. As metas estáticas (title, description) seguem normalmente.

## Etapas

### 1. Migrar webhook InfinitePay para Supabase Edge Function
- Criar `supabase/functions/infinitepay-webhook/index.ts` replicando a lógica de `src/routes/api/webhooks/infinitepay.ts` (validação de assinatura, update em `payments` e `registrations`, log em `access_logs`).
- Configurar `verify_jwt = false` no `supabase/config.toml` (webhook público).
- Nova URL pública: `https://ljquyrrprrwqpmaomwsh.supabase.co/functions/v1/infinitepay-webhook` — usuário precisa cadastrar essa URL no painel da InfinitePay.

### 2. Ajustar URLs em `src/lib/infinitepay.functions.ts`
- O `redirect_url` continua usando `PUBLIC_SITE_URL`, agora apontando para `https://www.corridadasfamilias.com.br`.
- Como SPA não roda server functions, refatorar `getCheckoutUrlForRegistration` e `checkPaymentStatus` para chamadas **diretas ao Supabase** (RLS já protege as tabelas `registrations` e `payments`). Hooks e rotas que usam `useServerFn(...)` passam a chamar funções `async` normais.

### 3. Refatorar todos os `createServerFn` para chamadas Supabase diretas
Arquivos afetados:
- `src/lib/admin.functions.ts` → mover para `src/lib/admin.client.ts` usando `supabase` autenticado
- `src/lib/registrations.functions.ts` → idem
- `src/lib/public.functions.ts` → idem (settings, contatos)
- `src/lib/infinitepay.functions.ts` → idem
- Atualizar todos os `useServerFn(...)` nos componentes para chamar diretamente as novas funções

> Operações que exigem service role (bypass RLS) **não podem** rodar no cliente — precisam estar na Edge Function. Identificar quais funções precisam disso e migrá-las.

### 4. Build script Hostinger-friendly
- Garantir que `npm run build` gera saída SPA em `dist/`.
- Remover/condicional `@cloudflare/vite-plugin` quando `TARGET=node` (variável de ambiente do build).
- `package.json`:
  - `build`: comando atual (mantém preview Lovable)
  - `build:hostinger`: `TARGET=node vite build` (SPA puro, sem worker)
  - `start`: `vite preview --host 0.0.0.0 --port ${PORT:-3000}` (já existe)

### 5. Subir código no GitHub
- Lovable → **Plus (+) → GitHub → Connect project** → criar repo `corridadasfamilias`.
- Sync automático bidirecional já fica ativo.

### 6. Configurar Web App Node.js na Hostinger
1. Painel Hostinger → **Avançado → Node.js** → criar aplicação:
   - **Node version:** 20.x
   - **Application root:** `corridadasfamilias`
   - **Application URL:** `www.corridadasfamilias.com.br`
   - **Startup file:** vazio (usar `npm start`)
2. **Git Version Control** → conectar repositório GitHub criado no passo 5.
3. **Environment Variables** (painel Node.js):
   ```
   NODE_ENV=production
   PORT=3000
   PUBLIC_SITE_URL=https://www.corridadasfamilias.com.br
   VITE_PUBLIC_SITE_URL=https://www.corridadasfamilias.com.br
   VITE_SUPABASE_URL=https://ljquyrrprrwqpmaomwsh.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=<valor do .env>
   VITE_SUPABASE_PROJECT_ID=ljquyrrprrwqpmaomwsh
   ```
4. **Build command:** `npm install && npm run build:hostinger`
5. **Start command:** `npm start`
6. Clicar **Deploy / Restart**.

### 7. DNS
Confirmar no registrador (Registro.br) que os registros A do domínio apontam para o IP indicado pelo painel Node.js da Hostinger. Aguardar propagação (~15min a algumas horas).

### 8. SSL
Painel Hostinger → **SSL** → **Install Free SSL** para `www.corridadasfamilias.com.br` e raiz `corridadasfamilias.com.br`.

### 9. Webhook InfinitePay
No painel da InfinitePay, atualizar URL do webhook para:
```
https://ljquyrrprrwqpmaomwsh.supabase.co/functions/v1/infinitepay-webhook
```

### 10. Como testar após deploy
1. Acessar `https://www.corridadasfamilias.com.br` → home carrega
2. Acessar `/admin/dashboard` → login funciona, dados carregam
3. Fazer uma inscrição de teste com valor mínimo → confirmar checkout abre
4. Após pagamento, verificar:
   - Edge Function logs no Supabase
   - Registro atualizou para `paid` na tabela `registrations`
   - Página `/sucesso?protocol=...` exibe confirmação

## Pontos que exigem ação manual do usuário

| Ação | Onde |
|------|------|
| Conectar projeto ao GitHub | Lovable (Plus → GitHub) |
| Criar Web App Node.js | Painel Hostinger |
| Definir env vars de produção | Painel Hostinger → Node.js |
| Apontar DNS (A records) | Registrador do domínio |
| Ativar SSL Let's Encrypt | Painel Hostinger → SSL |
| Trocar URL do webhook | Painel InfinitePay |

## Arquivos que serão criados/modificados

**Criados**
- `supabase/functions/infinitepay-webhook/index.ts`
- `src/lib/admin.client.ts`, `src/lib/registrations.client.ts`, `src/lib/public.client.ts`, `src/lib/infinitepay.client.ts` (versões cliente)
- `DEPLOY-HOSTINGER.md` (passo a passo detalhado)

**Modificados**
- `package.json` — adicionar `build:hostinger`
- `vite.config.ts` — condicional cloudflare plugin via `TARGET`
- `supabase/config.toml` — registrar nova function
- `README.md` — instruções finais
- Todos os arquivos que importam `*.functions.ts` (componentes admin, pagamento, inscrição) — trocar `useServerFn` por chamadas diretas

**Removidos do bundle de produção SPA**
- `src/routes/api/webhooks/infinitepay.ts` (substituído pela Edge Function — mantém arquivo no repo para Lovable preview)
- `src/server.ts` (não usado no modo SPA)

## Resumo do que muda na arquitetura

```text
ANTES                                      DEPOIS (Hostinger SPA)
─────────────────────────────────         ─────────────────────────────────
Cloudflare Workers                        Node.js + vite preview (Hostinger)
SSR + Server Functions                    SPA + Supabase client direto
Webhook em /api/webhooks/infinitepay  →   Webhook em Supabase Edge Function
```

> ⚠️ **Última chance de reconsiderar:** se SSR/SEO dinâmico for crítico, ou se a quantidade de refatoração para tirar `useServerFn` de toda a base assustar, a **Opção A (Lovable + domínio próprio)** resolve o 403 em ~10 minutos sem mexer no código. Posso preparar esse plano alternativo se preferir.

Diga **"implementar"** para eu executar este plano, ou **"alterar para Lovable"** para fazer o caminho mais rápido.
