# Sprint 8 — Login + Dashboard Admin

Usuário admin já existe no Supabase Auth:
- E-mail: `corridadasfamiliaseccdorosario@gmail.com`
- UID: `c82fbe1f-f164-4518-80e8-4d94fc80aa05`

## Etapa 1 — Provisionar role admin (migration)

Inserir o vínculo `user_roles` para o UID acima:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('c82fbe1f-f164-4518-80e8-4d94fc80aa05', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

## Etapa 2 — `/login` funcional (Supabase Auth, e-mail+senha)

Reescrever `src/routes/login.tsx`:
- Formulário e-mail+senha (sem signup público — admin é criado manualmente).
- `supabase.auth.signInWithPassword`.
- Em caso de sucesso, `navigate({ to: search.redirect ?? '/admin/dashboard' })`.
- Mostrar erros amigáveis (credenciais inválidas, e-mail não confirmado).
- `validateSearch` para aceitar `?redirect=...` (já vem do `_authenticated`).
- `beforeLoad`: se já logado, redireciona para `/admin/dashboard`.
- Layout dentro do `PageShell` existente (consistência visual).
- Link "Esqueci minha senha" → chamará `supabase.auth.resetPasswordForEmail` com `redirectTo: ${origin}/reset-password`.

Criar `src/routes/reset-password.tsx`:
- Detecta `type=recovery` no hash.
- Form de nova senha → `supabase.auth.updateUser({ password })`.
- Sucesso → redireciona `/admin/dashboard`.

## Etapa 3 — Guard de admin no layout `_admin`

Atualizar `src/routes/_authenticated/_admin.tsx` para verificar role no `beforeLoad`:
- Server function `getCurrentUserRoles()` (`createServerFn` + `requireSupabaseAuth`) que lê `user_roles` do usuário autenticado.
- Se não tiver role `admin`, redirect para `/` com toast "Acesso restrito".
- Componente: shell admin com sidebar (Dashboard, Inscrições, Pagamentos, Eventos/Lotes, Patrocinadores, Galeria, Configurações, Logs) + topbar com nome do usuário + botão Sair.

Sidebar usa `<Link>` do TanStack; rota ativa marcada via `activeProps`.

## Etapa 4 — Server functions admin (`src/lib/admin.functions.ts`)

Todas com `.middleware([requireSupabaseAuth])` + verificação de role admin via helper `assertAdmin(userId)` que consulta `user_roles`. Cada handler também grava `access_logs` (action, entity_type, entity_id, actor_id, actor_email).

KPIs e listagens (Sprint 8):
- `getDashboardKPIs()` → total inscrições por status, receita confirmada (sum `payments.amount_cents` paid), inscrições por lote, últimas 10 inscrições.
- `listRegistrations({ status?, search?, page, pageSize })` → join com `payments` (status mais recente).
- `listPayments({ status?, page, pageSize })`.
- `listEvents()`, `listLots(eventId)`.
- `listSponsors()`, `listGalleryItems()`, `listSettings()`.

CRUD que entra agora:
- `updateRegistrationStatus({ id, status })` — admin pode mudar para `confirmed`/`cancelled` (útil enquanto Infinity Pay está mock).
- Reaproveita `simulatePaymentApproval(protocol)` já planejado (mover para esse arquivo).

CRUD pleno (eventos, lotes, sponsors, gallery, settings) fica para Sprint 8.5/9 — esta sprint entrega leitura + ação mínima (status de inscrição + simulate payment) para destravar testes.

## Etapa 5 — Páginas do dashboard

Estrutura de rotas (cria os arquivos, todas sob `/_authenticated/_admin/`):

```
src/routes/_authenticated/_admin/
├── dashboard.tsx          (KPIs + últimas inscrições)
├── inscricoes.tsx         (lista paginada + filtros + ação mudar status)
├── inscricoes.$id.tsx     (detalhe da inscrição + payments)
├── pagamentos.tsx         (lista de payments + simulate approval em DEV)
├── eventos.tsx            (lista read-only + lotes)
├── patrocinadores.tsx     (lista read-only)
├── galeria.tsx            (lista read-only)
├── configuracoes.tsx      (lista read-only de settings)
└── logs.tsx               (últimos access_logs)
```

Cada página:
- `loader` chama a server function correspondente (gate `_authenticated` já hidrata sessão).
- `errorComponent` + `notFoundComponent` simples.
- `head()` com `title` específico ("Admin · Inscrições — II Corrida das Famílias").
- Tabelas usando `@/components/ui/table`, paginação e filtros em `useSearch`.

## Etapa 6 — Header do site público

Adicionar atalho "Admin" no header **apenas** se sessão ativa + role admin (consulta server fn `getCurrentUserRoles` cacheada em React Query). Caso contrário, esconde.

Botão "Sair" no shell admin → `supabase.auth.signOut()` + `router.invalidate()` + redirect `/`.

## Etapa 7 — Cache invalidation no auth state

Confirmar/adicionar em `__root.tsx` o `onAuthStateChange` global que dispara `router.invalidate()` + `queryClient.invalidateQueries()` (necessário para o admin badge sumir/aparecer ao logar/deslogar).

## Etapa 8 — Validação

- `bun run build` automático (harness).
- Smoke manual: login com a conta admin, navegar todas as páginas admin, mudar status de uma inscrição teste, conferir KPIs.

## Detalhes técnicos

- **Sem signup público** nesta sprint. Provisionamento de novos admins continua via SQL (Sprint 9.5 pode adicionar UI).
- **`assertAdmin` reutilizável**: helper interno em `admin.functions.ts` que recebe `supabase` (do middleware) + `userId` e usa `has_role(userId, 'admin')` via `.rpc('has_role', ...)` ou direct select em `user_roles`. Lança `Response('Forbidden', { status: 403 })`.
- **`access_logs`**: insert via `supabaseAdmin` (RLS bloqueia insert direto pelo usuário). Helper `logAdminAction({ actorId, actorEmail, action, entityType, entityId, details })`.
- **Datas/moeda**: helpers em `src/lib/format.ts` (`formatCents`, `formatDateBR`).
- **Fora de escopo**: CRUD completo de eventos/lotes/sponsors/gallery/settings (Sprint 9), Infinity Pay real (Sprint 6/7 reordenado), export CSV (Sprint 10), sitemap/robots (Sprint 10).

Posso começar pela **Etapa 1** (migration do role admin) e seguir na sequência?
