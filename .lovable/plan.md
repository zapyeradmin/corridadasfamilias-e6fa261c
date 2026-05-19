# Página /falhanopagamento — Falha no Pagamento

Criar nova rota top-level `/falhanopagamento` para o retorno pós-checkout quando o pagamento não é concluído. Mesmo design system do site (gradiente roxo no hero, tokens da marca, tipografia, botões), espelhando a estrutura da página `/sucesso` mas com tom de alerta/recuperação em vez de celebração. NÃO será adicionada ao `NAV_LINKS`.

## Conteúdo da página

1. **Hero (PageHeader gradiente roxo)**
   - Eyebrow: "Pagamento não concluído"
   - Título: "Não foi possível confirmar seu pagamento"
   - Descrição: mensagem tranquilizadora explicando que nenhuma cobrança foi efetivada e que o participante pode tentar novamente.

2. **Bloco principal (fundo branco)**
   - Ícone grande de alerta em círculo (cor vermelha/âmbar suave, baseada nos tokens da marca) com animação de entrada.
   - Título: "Algo deu errado com a sua transação"
   - Texto explicativo curto + cards opcionais exibindo `protocol` e/ou `reason` lidos via `validateSearch` (`?protocol=XYZ&reason=...`), quando presentes na URL.
   - Card "Possíveis motivos" em grid (3 itens com ícones lucide):
     - **Dados do cartão** — número, validade, CVV ou nome incorretos.
     - **Limite ou saldo** — limite insuficiente ou compra recusada pelo banco emissor.
     - **Conexão interrompida** — instabilidade durante o pagamento.
   - Bloco de orientação: "O que fazer agora" com passos: revisar os dados, tentar outra forma de pagamento (PIX/cartão), ou falar com a organização.

3. **Faixa de ações (CTAs)**
   - Botão principal (laranja, estilo `shadow-orange`): "Tentar novamente" → `/inscricao`.
   - Botão WhatsApp (verde `#25D366`) com mensagem pré-preenchida citando o protocolo quando disponível: "Falar com a organização".
   - Botão secundário: "Voltar ao início" → `/`.

4. **Faixa final roxa**
   - Mensagem de apoio: "Estamos aqui para ajudar você a completar sua inscrição."
   - Reforço do contato (WhatsApp e e-mail via `SITE`).

## Detalhes técnicos

- Novo arquivo: `src/routes/falhanopagamento.tsx`.
- `createFileRoute("/falhanopagamento")` com:
  - `validateSearch` aceitando `protocol?: string` e `reason?: string`.
  - `head()` com title "Falha no pagamento — II Corrida das Famílias", description, og tags e `robots: noindex,nofollow`.
  - `component: Page`.
- Reuso de `PageHeader` de `@/components/site/page-shell`.
- Tokens semânticos: `--color-brand-purple`, `--color-brand-purple-title`, `--color-brand-purple-text`, `--color-brand-orange`, `--color-brand-soft`, `bg-gradient-hero`, `shadow-orange`, `heading-section`, `heading-display`.
- Ícones lucide: `XCircle` / `AlertTriangle`, `CreditCard`, `WifiOff`, `ShieldAlert`, `RefreshCw`, `MessageCircle`, `Home`, `Mail`.
- Dados de contato via `SITE` (whatsapp, whatsappLabel, email).
- Sem alterações em backend, header, `NAV_LINKS` ou outras rotas. Sem novas dependências.

## Arquivos afetados

- **Novo**: `src/routes/falhanopagamento.tsx`

Após aprovação, `routeTree.gen.ts` é regenerado automaticamente pelo plugin do TanStack Router.
