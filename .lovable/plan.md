# Plano de Continuação — II Corrida das Famílias

## Estado atual
- Clients Supabase (`client.ts`, `client.server.ts`, `auth-middleware.ts`, `auth-attacher.ts`) já existem.
- Apenas `src/routes/__root.tsx` e `src/routes/index.tsx` (placeholder).
- Nenhuma tabela criada no banco. Nenhum token de Design System aplicado.

## Pendências de você (bloqueantes para alguns sprints)
- **Infinity Pay**: chaves (sandbox/produção) e `WEBHOOK_SECRET` — necessárias para Sprints 6 e 7. Posso implementar a estrutura com modo "mock" e plugar quando você fornecer.
- **WhatsApp do evento** (número) — para o botão fixo. Vou usar placeholder se não tiver.
- **Email do admin inicial** — para criar o primeiro usuário com role `admin` após Sprint 2.

Vou seguir adiante. Onde faltar dado, uso placeholders claramente marcados.

## Sequência de execução

### Agora — Sprint 1 (Design System + Shell)
- Tokens CSS oficiais (paleta, tipografia, radius, sombras, gradientes) em `src/styles.css`.
- Importar fontes do Design System.
- Layout em `__root.tsx`: `QueryClientProvider`, `Toaster` (sonner), Header com nav, Footer, `WhatsAppFAB` fixo, listener `onAuthStateChange` invalidando router/queries.
- Stubs de rotas vazias para evitar erros de tipos do Link: `regulamento`, `percurso`, `kit`, `premiacao`, `faq`, `patrocinadores`, `galeria`, `inscricao`, `inscricao.sucesso`, `politica-privacidade`, `login`, `_authenticated.tsx`, `_authenticated/_admin.tsx`, `_authenticated/_admin/dashboard.tsx`.

### Sprint 2 — Banco e segurança
Migration única criando:
- Enum `app_role` (`admin`, `staff`).
- Enum `registration_status` (`pending`, `processing`, `paid`, `failed`, `canceled`, `refunded`).
- Tabelas: `events`, `lots`, `registrations` (com `cpf_normalized`), `payments`, `sponsors`, `gallery_items`, `settings`, `user_roles`, `access_logs`.
- Função `has_role(uuid, app_role)` SECURITY DEFINER.
- Função `normalize_cpf(text)` + trigger preenchendo `cpf_normalized` em `registrations`.
- Trigger `updated_at`.
- Índice único parcial `(event_id, cpf_normalized) WHERE status IN ('pending','processing','paid')`.
- RLS habilitado em todas; policies públicas só de leitura nas tabelas públicas (`events`, `lots` ativos, `sponsors` publicados, `gallery_items` publicados, settings públicos). Escrita só via server functions admin/role.
- Bucket Storage `gallery` (público) e `sponsors` (público).
- Seed do evento "II Corrida das Famílias" e lote inicial.

### Sprint 3 — Site público
Cada rota com `head()` próprio (title/description/og). Componentes em `src/components/site/`:
- **Home** (`/`): Hero com slogan, contagem regressiva até 09/08/2026, CTA inscrição, Pilares (Fé/Esporte/Saúde/Solidariedade), bloco lote atual, faixa de patrocinadores, prévia da galeria, FAQ resumido.
- **Regulamento, Percurso, Kit, Premiação, FAQ, Patrocinadores, Galeria, Política de Privacidade**.
- Animações Framer Motion sóbrias; skeletons; mobile first.

### Sprint 4 — Formulário de inscrição
- React Hook Form + Zod multi-step (Dados Pessoais → Corrida → Revisão).
- Validações: CPF (máscara + DV), data de nascimento → cálculo automático de categoria, WhatsApp, e-mail, gênero, camisa, contato emergência, aceite termos + LGPD.
- Verificação de CPF duplicado via server function antes de submeter.

### Sprint 5 — `createRegistration`
Server function autenticada-livre (público), Zod server-side, recalcula valor pelo lote vigente, garante unicidade por CPF (índice + verificação), grava `registrations` (status `pending`) e `payments` inicial. Retorna `registrationId`.

### Sprint 6 — `createCheckout` (Infinity Pay)
Server function admin-elevada que cria sessão de checkout com `external_reference = registrationId`, `redirect_url = /inscricao/sucesso?id=...`. Modo mock se a chave não estiver configurada (retorna URL fake e marca `payments.provider = 'mock'`).

### Sprint 7 — Webhook
Server route `POST /api/public/payment-webhook`:
- Verifica HMAC com `INFINITY_PAY_WEBHOOK_SECRET` (timing-safe).
- Idempotente por `provider_event_id`.
- Atualiza `payments` e `registrations.status` conforme evento.
- Loga em `access_logs`.

### Sprint 8 — Dashboard administrativo
- `/login` (Supabase Auth email/senha).
- `_authenticated.tsx` → redireciona se não logado.
- `_authenticated/_admin.tsx` → exige `has_role(auth.uid(), 'admin')` (server fn `getMyRole` em `beforeLoad`).
- Páginas em `_authenticated/_admin/`:
  - `dashboard` — KPIs (inscritos, pagos, receita, distribuição por categoria/sexo/camisa) com Recharts.
  - `inscricoes` — tabela com filtros (status, lote, busca por nome/CPF), paginação.
  - `inscricoes.$id` — detalhe + ações (marcar pago manual, cancelar, reembolsar, reenviar checkout) — todas logadas.
  - `patrocinadores` — CRUD + upload de logo.
  - `galeria` — upload e ordenação.
  - `lotes` — preço e janelas.
  - `logs` — `access_logs`.

### Sprint 9 — Exportação e observabilidade
- Server function `exportRegistrationsCSV` (admin) com filtros, retorno como Blob para download.
- Toasts padronizados; tratamento de erros com `errorComponent` por rota.

### Sprint 10 — QA, SEO e deploy
- Sitemap, robots, JSON-LD `SportsEvent`.
- Acessibilidade (focus rings, contraste, labels).
- Checklist completo dos critérios de aceite do PRD.
- Instruções para configurar webhook no painel da Infinity Pay com URL `project--{id}.lovable.app/api/public/payment-webhook`.

## Próximo passo imediato
Aprovado o plano, começo agora pelo **Sprint 1** (Design System + shell de layout + stubs de rotas). Sprints 2 em diante seguem em sequência sem novas perguntas, exceto se você quiser fornecer agora os secrets da Infinity Pay e o número do WhatsApp.