# Plano — Sprints 3 a 5

Com as respostas confirmadas:
- Admin inicial: `corridadasfamiliaseccdorosario@gmail.com`
- WhatsApp oficial: `5587981149806`
- Infinity Pay: integração real fica para o final (Sprint 6/7); por enquanto modo mock.

## Etapa A — Configurações iniciais (rápido)

1. **Migration de dados** (via insert tool, não schema):
   - `UPDATE settings SET value = '"5587981149806"' WHERE key = 'whatsapp_number'`
   - Atualizar `site-config.ts` para puxar do banco quando possível, mas manter fallback hardcoded `5587981149806` / `(87) 98114-9806`.
2. **Provisionar admin**: após o usuário criar a conta `corridadasfamiliaseccdorosario@gmail.com` em `/login` (Supabase Auth — email/senha), rodar insert:
   `INSERT INTO user_roles (user_id, role) SELECT id, 'admin' FROM auth.users WHERE email = '...';`
   - Documentar isso no plano e executar quando o usuário avisar que criou a conta.

## Etapa B — Sprint 3: Conteúdo do site público

Substituir os placeholders nas rotas já criadas por conteúdo real, mobile-first, com `head()` SEO por rota (title, description, og:image quando houver hero):

- **`/` (Home)** — hero com slogan "Juntos no Rosário, Famílias unidas na Fé", countdown para 09/08/2026, CTA Inscreva-se, blocos: sobre o evento, lote vigente (consulta a `lots` via serverFn público), destaques (5km, kit, premiação), galeria preview, patrocinadores em faixa, footer.
- **`/regulamento`** — texto longo estruturado (categorias, idade mínima, regras de percurso, cancelamento, LGPD).
- **`/percurso`** — descrição do trajeto, mapa estático (placeholder de imagem por enquanto), pontos de hidratação, largada/chegada na Igreja Matriz.
- **`/kit`** — composição (camiseta, número, chip, sacochila), tabela de tamanhos PP–GG, datas/local de retirada.
- **`/premiacao`** — pódios geral M/F + faixas etárias + categoria família, medalha finisher para todos.
- **`/galeria`** — grid responsivo lendo `gallery_items` publicados via serverFn público.
- **`/patrocinadores`** — grid por tier (`diamond`, `gold`, `silver`, `standard`) lendo `sponsors` publicados.
- **`/faq`** — accordion com 8–12 perguntas (inscrição, kit, retirada, reembolso, menores, cães, estacionamento, contato).
- **`/politica-privacidade`** — texto LGPD padrão, citando dados coletados, finalidade, retenção, contato DPO.

ServerFns públicos novos (em `src/lib/public.functions.ts`, usando `supabaseAdmin` com WHERE explícitos por `is_active`/`is_published`):
- `getActiveEvent()` → evento + lotes ativos ordenados.
- `getCurrentLot()` → primeiro lote ativo cuja janela `starts_at..ends_at` cobre `now()`.
- `getPublishedSponsors()` / `getPublishedGallery()` / `getPublicSettings()`.

## Etapa C — Sprint 4–5: Formulário de inscrição

- **`/inscricao`**: React Hook Form + Zod multi-step (3 passos):
  1. Dados pessoais: nome, CPF (máscara + validação dígito), e-mail, WhatsApp, data nasc., gênero, categoria.
  2. Kit & saúde: tamanho da camiseta, contato de emergência (nome+fone), notas médicas.
  3. Revisão + termos (`accepted_terms`, `accepted_lgpd`) + resumo do valor (lote vigente).
- **ServerFn `createRegistration`** (`src/lib/registrations.functions.ts`, `supabaseAdmin`, sem auth):
  - Recalcula `amount_cents` a partir do `lot_id` no banco (nunca confia no cliente).
  - Verifica unicidade pelo índice parcial `cpf_normalized` + status ativo; se duplicado, retorna erro amigável.
  - Insere `registrations` (status `pending`) + `payments` (status `pending`, provider `infinitypay`, `checkout_url` mock apontando para `/inscricao/sucesso?protocol=...`).
  - Retorna `{ protocol, checkout_url }`.
- **`/inscricao/sucesso`**: lê `?protocol=` via search params, mostra protocolo, próximos passos e CTA WhatsApp.
- Modo mock do pagamento: ao chegar em `/inscricao/sucesso`, chamar serverFn `simulatePaymentApproval(protocol)` apenas em DEV (botão "Simular pagamento aprovado") — em prod, esse botão fica oculto até integrarmos Infinity Pay.

## Etapa D — Validação

- `bun run build` automático (lovable harness) após cada bloco.
- Smoke manual no preview: navegar todas as rotas, abrir formulário, submeter um cadastro de teste.
- Confirmar que dados públicos carregam sem 401 (loaders públicos chamam serverFns admin-elevadas com filtros).

## Fora deste plano (próximos sprints)

- Sprint 6/7: Infinity Pay real + webhook `/api/public/payment-webhook`.
- Sprint 8: dashboard admin (KPIs, CRUD, logs).
- Sprint 9/10: export CSV, sitemap/robots/JSON-LD, QA final, deploy.

Posso começar pela **Etapa A** (atualizar WhatsApp no banco + preparar instrução do admin) e seguir direto para o conteúdo do Sprint 3?
