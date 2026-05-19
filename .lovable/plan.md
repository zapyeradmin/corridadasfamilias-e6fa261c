## Contexto

Hoje existem duas rotas:
- `/inscricao` — formulário de 3 passos. Ao enviar, cria o registro no banco (status `pending`) e redireciona para `/inscricao/sucesso?protocol=XYZ`.
- `/inscricao/sucesso` — apenas mostra "Inscrição registrada!" e um texto genérico sobre pagamento, sem CTA real nem dados da inscrição.

Não há duplicação de inscrição: o `POST` só acontece uma vez (no submit do formulário). O que existe é uma falta de clareza visual — a página de sucesso parece "outra inscrição" porque não comunica que é o passo seguinte (pagamento).

## Objetivo

Transformar `/inscricao/sucesso` numa página de **confirmação parcial + chamada para pagamento**, deixando claro que:
1. Os dados foram registrados (Etapa 1 concluída).
2. A vaga só é garantida após o pagamento (Etapa 2 pendente).
3. Existe uma ação principal: **Pagar agora** (abre `checkout_url` da `payments`).

## Mudanças

### 1. `src/lib/registrations.functions.ts`
Estender `getRegistrationByProtocol` para também retornar o pagamento mais recente associado (status + `checkout_url` + `amount_cents`). Assim a página de sucesso busca tudo em uma chamada.

```text
return {
  protocol, full_name, status, amount_cents, created_at,
  payment: { status, checkout_url, amount_cents } | null
}
```

### 2. `src/routes/inscricao.sucesso.tsx` — reescrever
- Buscar dados via `useServerFn(getRegistrationByProtocol)` + `useQuery`.
- Layout em 2 blocos:
  - **Stepper de 2 etapas**: "1. Dados ✓ concluído" / "2. Pagamento • pendente".
  - **Card de resumo**: protocolo, nome, valor formatado (BRL).
  - **CTA primário**: botão "Pagar agora" → abre `payment.checkout_url` em nova aba (quando InfinityPay estiver integrado).
  - **CTAs secundários**: WhatsApp da organização e voltar para `/`.
- Mensagem clara: "Sua inscrição foi registrada, mas a vaga só será confirmada após a aprovação do pagamento."
- Tratar estados: loading (skeleton), protocolo inválido (mensagem + link para `/inscricao`), `status = paid` (mostrar "Pagamento confirmado" em vez do botão).

### 3. Sem mudanças em `src/routes/inscricao.tsx`
O redirect atual (`navigate({ to: "/inscricao/sucesso", search: { protocol } })`) continua válido — apenas o destino fica útil.

## Detalhes técnicos

- Não cria nova rota nem deleta nenhuma; mantém URLs estáveis.
- A query usa o `protocol` da search param como `queryKey`.
- Mantém o `head()` com título "Inscrição registrada — falta o pagamento" para refletir o novo conteúdo.
- Usa tokens de design já existentes (`--color-brand-orange`, `gradient-orange`, `shadow-orange`).
