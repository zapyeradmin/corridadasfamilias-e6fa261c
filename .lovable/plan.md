## Objetivo

Integrar a **InfinitePay** ao fluxo de inscrição da II Corrida das Famílias com dois checkouts (Adulto/Criança), webhook público que confirma o pagamento e a página `/pagamento` atuando como retorno/validação que redireciona para `/sucesso` ou `/falhanopagamento`. Os links dos checkouts ficam configuráveis (vazios até você informar).

## Regras-chave (vindas dos arquivos)

- Idade ≤ 9 anos → checkout **Criança** (R$ 48,00 / 4800 centavos)
- Idade > 9 anos → checkout **Adulto** (R$ 68,00 / 6800 centavos)
- Inscrição vira **paid** **somente** via webhook validado — nunca pelo retorno do usuário
- Rotas existentes mantidas: `/pagamento`, `/sucesso`, `/falhanopagamento`
- Endpoint do webhook: `POST /api/webhooks/infinitepay`

## 1. Migração no banco

1. **`settings`** — inserir 2 chaves públicas vazias:
   - `infinitepay_checkout_adulto_url` = `""`
   - `infinitepay_checkout_crianca_url` = `""`
2. **`registrations`** — adicionar:
   - `order_nsu text unique` (gerado no `createRegistration`: `inscricao_{adulto|crianca}_lote1_{uuid}`)
   - `participant_type text` (`adulto` | `crianca`) derivado da idade no evento
3. **`payments`** — adicionar colunas vindas do retorno InfinitePay:
   - `transaction_nsu text unique`
   - `invoice_slug text`
   - `receipt_url text`
   - `capture_method text` (pix, credit_card…)
   - `installments int`
   - `paid_amount_cents int`
4. **Nova tabela `infinitepay_events`** (auditoria + idempotência):
   - `id`, `received_at`, `transaction_nsu`, `order_nsu`, `payload jsonb`, `processed bool`, `match_status text` (`matched`/`unmatched`), `registration_id uuid nullable`
   - RLS: admins leem; insert apenas via service role (server route)

## 2. Server functions / rotas

### A. `src/lib/infinitepay.functions.ts`
- `getCheckoutUrlForRegistration({ protocol })` → lê `registrations.participant_type` + `settings`. Retorna `{ checkoutUrl: string | null, participantType, amountCents }`. Se URL vazia → `null` (botão exibe "Checkout em configuração. Tente novamente em instantes.").
- `checkPaymentStatus({ protocol })` → retorna status atual (`pending` / `paid` / etc) lido de `registrations` + último `payments`. Usado por `/pagamento` em polling.

### B. `src/routes/api/webhooks/infinitepay.ts` (rota pública, `supabaseAdmin`)
- `POST` aceita o payload da InfinitePay.
- Sempre grava `infinitepay_events` (auditoria), mesmo sem match.
- Validações: presença de `transaction_nsu`; `amount` ∈ {6800, 4800}; idempotência via `transaction_nsu` único.
- Match por `order_nsu` → `registrations.order_nsu`:
  - confere `participant_type` × `amount` (adulto=6800, criança=4800)
  - cria/atualiza `payments` com status `paid`, `paid_at`, `transaction_nsu`, `invoice_slug`, `receipt_url`, `capture_method`, `installments`, `paid_amount_cents`
  - atualiza `registrations.status = 'paid'`
  - marca evento `processed=true`, `match_status='matched'`
- Sem match (checkout estático sem `order_nsu`) → `match_status='unmatched'` (conferência manual no futuro)
- Responde `200 OK` em sucesso, `400` em payload inválido.

## 3. Frontend

### `src/routes/inscricao_.sucesso.tsx` (botão "Realizar pagamento")
- Substituir `navigate({ to: '/pagamento' })` por chamada a `getCheckoutUrlForRegistration`:
  - se `checkoutUrl` definido → `window.location.href = checkoutUrl`
  - se vazio → botão desabilitado com mensagem "Checkout em configuração. Tente novamente em instantes."

### `src/routes/pagamento.tsx` (página de retorno da InfinitePay)
- Aceita search params da InfinitePay: `protocol`, `order_nsu?`, `transaction_nsu?`, `slug?`, `receipt_url?`, `capture_method?`.
- UI: spinner + "Validando seu pagamento..."
- Polling: chama `checkPaymentStatus` a cada 2s por até ~30s.
- Decisão:
  - `status === 'paid'` → `navigate({ to: '/sucesso', search: { protocol } })`
  - timeout / `failed`/`canceled` → `navigate({ to: '/falhanopagamento', search: { protocol, reason } })`
- **Nunca** marca como paga no cliente.

### `src/lib/registrations.functions.ts`
- No insert, gerar `order_nsu` e `participant_type` (com base em `ageAtEvent <= 9`).
- `checkout_url` em `payments` deixa de apontar para `/inscricao/sucesso` — fluxo de redirect ao checkout agora vive na tela de sucesso.

## 4. Admin (mínimo)

Em `src/routes/_authenticated/admin.configuracoes.tsx`, adicionar dois campos editáveis (reuso do padrão atual de settings):
- URL Checkout Adulto Lote 1
- URL Checkout Criança Lote 1

## 5. URLs que você vai configurar na InfinitePay

Após o deploy:

```
URL do Webhook InfinitePay:
https://corridadasfamilias.lovable.app/api/webhooks/infinitepay

URL de Redirecionamento InfinitePay:
https://corridadasfamilias.lovable.app/pagamento
```

Depois você cola, no admin, os 2 links de checkout (Adulto/Criança) gerados pela InfinitePay.

## Fora de escopo (fase 2)

- Geração dinâmica de link via `POST https://api.checkout.infinitepay.io/links` (requer `handle` + token)
- Chamada server-to-server `payment_check` (hoje confiamos só no webhook + leitura do banco)
- Tela admin para vincular manualmente pagamentos `unmatched` (a tabela já fica pronta)
