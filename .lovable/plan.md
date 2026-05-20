# Plano — /admin/configuracoes com Tabs (Pagamento, Contatos, Usuários)

Objetivo: transformar a página em uma área administrativa profissional com 3 abas, persistindo tudo no banco e integrando às páginas públicas. Reaproveitar a tabela `settings` (key/value JSONB) já existente — sem criar novas tabelas — exceto para usuários (Supabase Auth).

---

## Arquitetura geral

- UI com `Tabs` do shadcn (já disponível) em `src/routes/_authenticated/admin.configuracoes.tsx`.
- Cada aba vira um componente em `src/components/admin/configuracoes/`:
  - `tab-pagamento.tsx`
  - `tab-contatos.tsx`
  - `tab-usuarios.tsx`
- Server functions em `src/lib/admin.functions.ts` (para CRUD admin) e `src/lib/public.functions.ts` (leitura pública dos contatos).
- Aba ativa controlada por `?tab=pagamento|contatos|usuarios` (URL search param) para deep-link.

---

## Aba 1 — Configuração de Pagamento

### 1.1 URLs do projeto (somente leitura, com botão Copiar)
- Webhook: `${origin}/api/webhooks/infinitepay`
- Redirecionamento: `${origin}/pagamento`
- Redirecionamento de Sucesso: `${origin}/sucesso`  ← **novo campo** (adicionar ao bloco que já existe).

### 1.2 Links dos Checkouts — Adulto e Criança (cards separados)
Cada card terá: Nome do Produto, Lote (`Lote 1|2|3`), Valor (R$), Link do Checkout, Status (badge "Checkout Ativo" se URL preenchida, senão "Pendente"), Data da última atualização (`DD/MM/AAAA HH:mm` a partir de `settings.updated_at`).

Persistência via `settings` (uma única chave por checkout, valor JSON estruturado):
- `checkout_adulto` → `{ nome_produto, lote, valor_cents, checkout_url, status }`
- `checkout_crianca` → `{ nome_produto, lote, valor_cents, checkout_url, status }`

Botões `Salvar Checkout Adulto/Criança` chamam `updateSettingAdmin` (já existe). Após salvar, `invalidateQueries` em `["public", "checkout-config"]` para refletir em `/inscricao`.

### 1.3 Integração em /inscricao
- Nova server fn pública `getCheckoutConfig` em `public.functions.ts` retornando os dois objetos (lê `settings` com `is_public=true`).
- `/inscricao` consome via `useQuery` e renderiza Nome do Produto, Lote e Valor dinâmicos. Regra de idade (≤9 → criança, >9 → adulto) já existe em `resolvePrice`; ajustar para escolher a `checkout_url` do objeto retornado em vez das chaves antigas. As chaves legadas `infinitepay_checkout_adulto_url` / `_crianca_url` deixam de ser lidas (mantém compatibilidade lendo o nested `checkout_url`).

### 1.4 Pagamento/sucesso/falha
Sem mudanças funcionais — as rotas `/api/webhooks/infinitepay`, `/pagamento`, `/sucesso`, `/falhanopagamento` já existem. Confirmação continua dependendo do webhook.

---

## Aba 2 — Configuração de Contatos

Hoje os contatos estão hardcoded em `src/lib/site-config.ts` (`SITE.whatsapp`, `email`, `location` etc.) e usados em Footer, WhatsAppFab, header e várias páginas. Vamos manter `SITE` como fallback e ler os valores reais de `settings`.

### 2.1 Persistência
Uma chave em `settings`: `site_contacts` (is_public=true), com JSON:
```
{ local, email_oficial, whatsapp_oficial, instagram_url, instagram_usuario }
```
- `whatsapp_oficial`: armazenado como dígitos puros (formato wa.me).
- `instagram_usuario`: normalizado removendo `@` inicial.
- Validação Zod no server fn `updateSiteContacts` (email válido, URL válida, whatsapp 10–13 dígitos).

### 2.2 Leitura pública
- Hook `useSiteContacts()` em `src/hooks/use-site-contacts.ts` que usa `useQuery(["public","contacts"], getPublicSettings)` e retorna merge com defaults de `SITE`.
- Atualizar consumidores: `src/components/site/footer.tsx`, `src/components/site/whatsapp-fab.tsx`, header (links sociais), páginas que mostram local/email, e qualquer `wa.me/...`. Quem renderiza no SSR sem hook continua usando o fallback de `SITE`.

### 2.3 UI
Form único com campos acima, botão `Salvar Contatos`, toasts de sucesso/erro, validação inline.

---

## Aba 3 — Usuários

Gerenciar usuários do Supabase Auth + papéis em `public.user_roles` (enum `app_role` já tem `admin`/`user`). Operações privilegiadas usam `supabaseAdmin` (service role) dentro de server fns gateadas por `assertAdmin`.

### 3.1 Server fns novas (admin.functions.ts)
- `listAdminUsers()` → usa `supabaseAdmin.auth.admin.listUsers()` + join com `user_roles` por `user_id`. Retorna `{ id, email, full_name (raw_user_meta_data.full_name), role, created_at }`.
- `createAdminUser({ name, email, password, role })` → `supabaseAdmin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name } })` e em seguida `insert` em `user_roles` com role escolhido. Senha validada por Zod (min 8, regra de complexidade leve).
- `updateAdminUser({ id, name?, email?, role? })` → `supabaseAdmin.auth.admin.updateUserById` + upsert/replace em `user_roles` (delete antigos e insert novo).
- `deleteAdminUser({ id })` → bloqueia se `id === context.userId` (não excluir a si mesmo) e se for o último admin; depois `supabaseAdmin.auth.admin.deleteUser(id)` (cascata derruba `user_roles` via FK ON DELETE CASCADE — confirmar; se não existir cascade, deletar `user_roles` manualmente antes).

Todas as fns registram em `access_logs`.

### 3.2 UI
- Tabela com Nome, E-mail, Função (badge), Criado em, Ações (Editar / Excluir com confirmação).
- Botão `Adicionar Usuário` → `Dialog` com form (Nome, E-mail, Senha com toggle de visibilidade, Select Função `Usuário|Administrador`).
- Editar abre o mesmo Dialog pré-preenchido (sem senha; campo separado opcional "Nova senha" para reset).
- Toasts e validação por `react-hook-form` + Zod.

### 3.3 Permissões
- Frontend: `_authenticated.tsx` já valida sessão; a página `admin.configuracoes` precisa checar role admin (usar `getCurrentUserRoles`) e renderizar a aba Usuários apenas para admins. Para usuário comum logado, mostrar mensagem "Acesso restrito" nas abas sensíveis.
- Backend: todas as fns admin já chamam `assertAdmin` → mantém a barreira real.

---

## Mudanças de arquivo (resumo)

```text
src/routes/_authenticated/admin.configuracoes.tsx     (refatorar: Tabs + montar 3 sub-componentes)
src/components/admin/configuracoes/tab-pagamento.tsx  (novo)
src/components/admin/configuracoes/tab-contatos.tsx   (novo)
src/components/admin/configuracoes/tab-usuarios.tsx   (novo)
src/components/admin/configuracoes/user-dialog.tsx    (novo — form criar/editar)
src/lib/admin.functions.ts                            (+ listAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser, updateSiteContacts, updateCheckoutConfig opcional)
src/lib/public.functions.ts                           (+ getCheckoutConfig, ampliar getPublicSettings se preciso)
src/hooks/use-site-contacts.ts                        (novo)
src/components/site/footer.tsx                        (consumir contatos dinâmicos)
src/components/site/whatsapp-fab.tsx                  (idem)
src/components/site/header/*.tsx                      (idem — links sociais)
src/routes/inscricao.tsx                              (ler checkout config dinâmico)
```

Sem novas tabelas. Sem migrações — apenas inserts/upserts em `settings` e operações do Supabase Auth Admin API.

---

## Bonus — corrigir hydration error já presente
Nas mesmas mexidas, `home-patrocinadores.tsx` está renderizando um `<a>` no client e um `<span>`/`<img>` diferente no SSR para os mesmos slots ("Alexsandro Supermercados", "Zap Chat"). Vou unificar a árvore — sempre renderizar o mesmo wrapper, independente do estado de carga — para parar o erro 418 que aparece no console.

---

## Como testar (depois de implementar)
1. Abrir `/admin/configuracoes` → ver 3 abas.
2. Aba Pagamento: editar nome/lote/valor/link do Checkout Adulto → Salvar → recarregar `/inscricao` → ver dados novos; status do card vira "Checkout Ativo".
3. Mesmo para Criança; testar idade ≤9 e >9 redirecionando para o link certo.
4. Aba Contatos: trocar whatsapp/email/instagram → Salvar → footer, FAB e header refletem sem rebuild.
5. Aba Usuários: criar usuário comum (não vê aba Usuários ao logar); criar admin (acesso total); editar role; excluir; bloqueio ao excluir a si mesmo / último admin.
6. Verificar `access_logs` registrando cada ação.
