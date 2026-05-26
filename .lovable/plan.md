## Diagnóstico

O site publicado (`corridadasfamilias.lovable.app`) está retornando 500 no SSR. Logs do Worker mostram dois estágios:

1. Até 13:17 → `Error: Missing required environment variables` (env-check derrubava o processo).
2. Após 13:17 → `Error: h3 swallowed SSR error` (sem stack trace). Ou seja: o env-check parou de falhar, mas algo dentro do render SSR ainda lança.

A causa raiz mais provável é o **`verifyServerEnv()` em `src/start.ts`**, que roda no top-level do módulo e faz `throw new Error(...)` quando `NODE_ENV=production` e qualquer variável "obrigatória" estiver ausente. No Worker da Lovable Cloud, variáveis como `SUPABASE_SERVICE_ROLE_KEY` não ficam em `process.env` no momento da inicialização do módulo — só ficam disponíveis dentro do `fetch()`. Isso faz o módulo do servidor falhar antes mesmo do error handler ser registrado, e o h3 engole sem stack útil.

A mesma checagem está correta para a VPS (Node + PM2 + `.env` no disco), onde as variáveis existem no boot. Só na Lovable Cloud é que isso é tóxico.

## Plano

### 1. Tornar `verifyServerEnv()` não-fatal

`src/lib/env-check.server.ts`:
- Trocar o `throw` em produção por apenas `console.error`. Variáveis ausentes vão aparecer no log; quando o código realmente precisar delas (por ex. supabase admin client), o erro vai estourar no ponto de uso, com stack útil.
- Manter a listagem de obrigatórias x opcionais só para fins de log.

### 2. Blindar o loader da home

`src/routes/index.tsx`:
- O loader já usa `prefetchQuery` (não bloqueia render se falhar), então provavelmente não é a causa direta. Manter.

### 3. Validar

Após a mudança:
- Esperar o auto-deploy do backend (mudanças server-side fazem deploy automático).
- Abrir `https://corridadasfamilias.lovable.app` e confirmar 200.
- Se ainda 500, ler os logs novamente — agora qualquer erro real vai trazer stack trace (via error-capture + normalizer já instalados em `src/server.ts`).

## Detalhes técnicos

- O wrapper em `src/server.ts` já tem `consumeLastCapturedError()` + listeners globais (`error`, `unhandledrejection`). Erros agora capturáveis vão imprimir stack.
- Na VPS, a verificação continua válida: como `.env` é carregado pelo `server-node.mjs` antes de importar o handler, todas as vars estão em `process.env` no boot e o log "OK" aparece.
- Nenhuma mudança no comportamento de runtime das server functions — elas continuam lendo `process.env.SUPABASE_URL` etc. dentro dos handlers, onde o Worker injeta corretamente.

## Arquivos afetados

- `src/lib/env-check.server.ts` — remover `throw` em produção; manter logs.
