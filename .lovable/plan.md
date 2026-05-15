# Plano — Site Oficial II Corrida das Famílias

## Observações importantes antes de começar

1. **Stack do template**: este projeto Lovable usa **TanStack Start (SSR) + Vite + React 19 + Tailwind v4**, e não "Vite SPA puro" como descrito nos documentos. Funcionalmente cobre tudo o que o PRD pede (rotas, SEO, formulários, dashboard). Vou adaptar:
   - "Edge Functions" → **TanStack Server Functions** (`createServerFn`) para `create-registration`, `create-checkout`, e **TanStack server route** em `/api/public/payment-webhook` para o webhook do Infinity Pay (precisa URL pública estável).
   - Supabase PostgreSQL + Auth + RLS são usados normalmente (Lovable Cloud).
   - shadcn/ui, Radix, Lucide, Framer Motion, TanStack Query, React Hook Form, Zod: todos compatíveis.
2. **Dependências externas que preciso de você**:
   - **Infinity Pay**: chave de API (sandbox e produção), `WEBHOOK_SECRET` para verificar assinatura, e confirmação do formato do payload do webhook (link da doc).
   - **Conteúdo real**: textos finais de regulamento, FAQ, percurso, premiação, lotes/preços, kit, lista de patrocinadores e logos, fotos da edição anterior para a galeria. Posso começar com placeholders do Design System e você substitui.
   - **WhatsApp oficial** do evento (número) para o botão fixo.
   - **E-mail do(s) admin(s)** para criar conta inicial no Supabase Auth.
   - **Domínio final** (para `redirect_uri` do checkout e CORS do webhook).
3. **LGPD**: vou implementar política de privacidade, aceite explícito de termos, e logs de acesso administrativo conforme PRD Parte 2. Texto jurídico final deve ser revisado por você.

## Sprints

### Sprint 1 — Preparação técnica e Design System
- Tokens CSS (cores, tipografia, radius, sombras, gradientes) em `src/styles.css` conforme Design System.
- Configurar fontes oficiais e Tailwind v4.
- Layout root: header, footer, botão fixo de WhatsApp, providers (QueryClient, Toaster).
- Estrutura de rotas em `src/routes/` (home, regulamento, percurso, kit, premiação, faq, patrocinadores, galeria, inscricao, sucesso, politica-privacidade, login, dashboard/*).

### Sprint 2 — Banco de dados e segurança (Supabase)
Migrations criando o schema do Documento de Arquitetura:
- `events`, `lots` (lotes com preço e datas), `registrations`, `payments`, `sponsors`, `gallery_items`, `settings`, `admin_profiles`, `user_roles` (enum `app_role`), `access_logs`.
- Função `has_role(uuid, app_role)` SECURITY DEFINER.
- RLS em todas as tabelas: público lê apenas `events`, `lots` ativos, `sponsors` publicados, `gallery_items` publicados, `settings` públicos. Escrita só via server functions/admin.
- Triggers `updated_at`, normalização de CPF, índice único parcial em (`event_id`, `cpf_normalized`) para status ativos.

### Sprint 3 — Site público
Páginas com SSR e SEO (title, description, og:image por rota):
- **Home**: hero com slogan, CTA inscrição, contagem regressiva, pilares (Fé, Esporte, Saúde, Solidariedade), highlights, lote atual, patrocinadores, prévia da galeria, FAQ resumido.
- **Regulamento**, **Percurso** (com mapa), **Kit do Atleta**, **Premiação**, **FAQ**, **Patrocinadores**, **Galeria**, **Política de Privacidade**.
- Animações Framer Motion sóbrias, mobile first, skeletons em listas dinâmicas.

### Sprint 4 — Formulário de inscrição
- React Hook Form + Zod com validações: nome, CPF (máscara + dígito verificador), nascimento (faixa etária → categoria automática), email, WhatsApp, gênero, tamanho da camisa, contato de emergência, aceite de termos e LGPD.
- Multi-step com revisão antes de enviar.
- Bloqueio client-side por CPF já inscrito (consulta server function).

### Sprint 5 — Server function `createRegistration`
- Validação Zod server-side.
- Verifica duplicidade por CPF normalizado + status ativo (`pending`, `paid`, `processing`).
- Calcula valor pelo lote vigente.
- Insere `registrations` (status `pending`) + `payments` inicial.
- Retorna ID da inscrição.

### Sprint 6 — Checkout Infinity Pay
- Server function `createCheckout`: cria sessão de checkout no Infinity Pay com valor, dados mínimos do pagador, `external_reference = registration.id`, `redirect_url = /inscricao/sucesso?id=...`.
- Frontend redireciona para a URL retornada.
- Página de sucesso consulta status atual da inscrição e exibe instruções (PIX/cartão).

### Sprint 7 — Webhook de pagamento
- Server route `POST /api/public/payment-webhook`:
  - Verifica assinatura HMAC com `WEBHOOK_SECRET`.
  - Idempotente (dedup por `event_id` do provedor em `payments`).
  - Atualiza `payments` e `registrations.status` (`paid` / `failed` / `refunded` / `canceled`).
  - Loga em `access_logs`.

### Sprint 8 — Dashboard administrativo
- `/login` com Supabase Auth (email/senha).
- Layout `_authenticated/_admin` protegido por `has_role(auth.uid(), 'admin')`.
- Páginas: visão geral (KPIs: inscritos, pagos, receita, por categoria/sexo/camisa), lista de inscrições com filtros e busca, detalhe da inscrição (com histórico de pagamentos e ações: marcar pago manual, cancelar, reembolsar — registradas em `access_logs`), patrocinadores (CRUD), galeria (upload via Supabase Storage), lotes/configurações, logs de acesso.

### Sprint 9 — Exportação e observabilidade
- Server function `exportRegistrationsCSV` (admin): CSV com filtros aplicados.
- `access_logs` para todas as ações sensíveis.
- Tratamento de erros e toasts padronizados.

### Sprint 10 — QA e deploy
- Checklist de critérios de aceite do PRD (CPF duplicado, LGPD, estados, RLS).
- Teste manual ponta a ponta em sandbox do Infinity Pay.
- SEO: sitemap, robots, meta tags, JSON-LD do evento.
- Acessibilidade (foco, contraste, labels).
- Publicação e configuração do webhook na Infinity Pay com a URL `project--{id}.lovable.app/api/public/payment-webhook`.

## O que preciso de você para começar
1. Confirmar que posso seguir com **TanStack Start** no lugar de "Vite SPA puro" (mesmas libs, mesma UX).
2. Posso **habilitar Lovable Cloud** (Supabase) agora?
3. **Infinity Pay**: você já tem conta e chaves? Quer que eu comece em **modo sandbox** com placeholders e plugamos as chaves depois via secrets?
4. **WhatsApp oficial** do evento e **e-mail do admin** inicial.
5. Para Sprints 3 (site público), posso usar **textos e imagens placeholder** seguindo o Design System enquanto você fornece o conteúdo final?

Assim que confirmar, começo pelo Sprint 1.