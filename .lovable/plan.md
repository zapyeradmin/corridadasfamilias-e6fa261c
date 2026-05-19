# Página /sucesso — Confirmação de pagamento

A rota `/sucesso` ainda não existe como arquivo (apenas `/inscricao/sucesso`). Vou criar uma nova página dedicada para o retorno após o pagamento confirmado, mantendo o mesmo design system do site (PageHeader gradiente roxo, tokens de cor da marca, tipografia e botões consistentes). A página NÃO será adicionada ao `NAV_LINKS`, ficando acessível apenas via redirecionamento pós-checkout.

## O que a página vai conter

1. **Hero (PageHeader gradiente roxo)**
   - Eyebrow: "Pagamento confirmado"
   - Título: "Sua inscrição está garantida!"
   - Descrição: mensagem de boas-vindas confirmando que a vaga na II Corrida das Famílias está confirmada.

2. **Bloco principal (fundo branco)**
   - Ícone grande de check em círculo com cor da marca (laranja/âmbar) e leve animação de entrada.
   - Card de destaque com o **protocolo da inscrição** (lido via `validateSearch` — `?protocol=XYZ`) caso presente na URL.
   - Card "Próximos passos" com 3 itens em grid (ícones lucide):
     - **Confirmação por e-mail** — comprovante enviado para o e-mail cadastrado.
     - **Retirada do kit** — datas 04, 05 e 06/08/2026, 19h30–21h30, Salão Paroquial.
     - **Dia da corrida** — 09 de agosto de 2026, Igreja Matriz de Nossa Senhora do Rosário, Serra Talhada/PE.
   - Aviso solidário: lembrete de levar 1kg de alimento não perecível.

3. **Faixa de ações (CTA)**
   - Botão WhatsApp (verde `#25D366`) com mensagem pré-preenchida incluindo o protocolo.
   - Botão "Ver regulamento" → `/regulamento`.
   - Botão "Voltar ao início" → `/`.

4. **Faixa final roxa (mesma do `/kit`)**
   - Mensagem de agradecimento: "Obrigado por correr com a gente!"
   - Compartilhamento social (links para compartilhar a participação — opcional, abrindo WhatsApp).

## Detalhes técnicos

- Novo arquivo: `src/routes/sucesso.tsx` (rota top-level `/sucesso`).
- `createFileRoute("/sucesso")` com:
  - `validateSearch` aceitando `protocol?: string` (e opcional `email?: string` para exibir destinatário do comprovante).
  - `head()` com title "Pagamento confirmado — II Corrida das Famílias", description, og:title/description e `robots: noindex` (página de pós-checkout, não deve ser indexada).
  - `component: Page`.
- Reuso de `PageHeader` de `@/components/site/page-shell`.
- Tokens semânticos: `--color-brand-purple`, `--color-brand-purple-title`, `--color-brand-purple-text`, `--color-brand-orange`, `--color-brand-amber`, `--color-brand-soft`, classe `bg-gradient-hero`, `shadow-orange`, `heading-section`, `heading-display`.
- Ícones lucide: `CheckCircle2`, `Mail`, `Package`, `CalendarDays`, `MessageCircle`, `Home`, `FileText`, `HandHeart`.
- Dados de evento via `SITE` de `@/lib/site-config` (whatsapp, eventDateLabel, location, city).
- Sem alterações em backend, navegação, header ou outras rotas. `NAV_LINKS` permanece inalterado.
- Sem novas dependências.

## Arquivos afetados

- **Novo**: `src/routes/sucesso.tsx`

Após aprovação, o `routeTree.gen.ts` é regenerado automaticamente pelo plugin do TanStack Router.
