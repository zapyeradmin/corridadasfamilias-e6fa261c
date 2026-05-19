## Diagnóstico

O webhook **está chegando** e sendo gravado em `infinitepay_events`, mas como `unmatched`:

```
notes: "order_nsu sem inscrição correspondente"
order_nsu: 3e245ee5-22a8-4b65-a31f-ac9bf15a1916   ← UUID gerado pela InfinitePay
```

**Causa raiz:** o link de checkout da InfinitePay é estático (`https://checkout.infinitepay.io/.../5L9Nn6VwPN`) e nós redirecionamos o usuário direto para ele, **sem anexar nosso `order_nsu`**. Quando o pagamento acontece, a InfinitePay envia um `order_nsu` **gerado por ela** no webhook — que nunca vai casar com o `inscricao_adulto_lote1_<uuid>` salvo em `registrations.order_nsu`.

Resultado: o pagamento é processado na InfinitePay, mas a inscrição nunca é marcada como `paid` e o `/pagamento` fica em polling até dar timeout.

## Correção

A InfinitePay aceita query params no link de checkout para passar o pedido e a URL de retorno:

```
https://checkout.infinitepay.io/<slug>/<id>
  ?order_nsu=<nosso_order_nsu>
  &redirect_url=https://corridadasfamilias.lovable.app/pagamento?protocol=<PROTOCOLO>
  &customer_name=...&customer_email=...&customer_cellphone=...
```

### 1. `src/lib/infinitepay.functions.ts` — anexar query params

Em `getCheckoutUrlForRegistration`, depois de carregar a inscrição, ler também `order_nsu`, `full_name`, `email`, `whatsapp`, e montar a URL final assim:

```ts
const url = new URL(baseCheckoutUrl);
url.searchParams.set("order_nsu", reg.order_nsu);
url.searchParams.set(
  "redirect_url",
  `https://corridadasfamilias.lovable.app/pagamento?protocol=${reg.protocol}`,
);
url.searchParams.set("customer_name", reg.full_name);
url.searchParams.set("customer_email", reg.email);
url.searchParams.set("customer_cellphone", reg.whatsapp.replace(/\D/g, ""));
return { ok: true, checkoutUrl: url.toString(), ... };
```

Assim o webhook receberá o **nosso** `order_nsu` e o match passa a funcionar.

### 2. (Opcional) Reprocessar o evento órfão atual

O evento `117a23cf-…` ficou `unmatched` porque foi feito antes da correção. Não tem como recuperar — a InfinitePay não conhece nosso `order_nsu` daquela tentativa. A inscrição correspondente continua `pending`. Posso:

- (a) marcar manualmente a inscrição como `paid` (preciso que você me diga qual protocolo é) **ou**
- (b) deixar como está e pedir um novo teste depois da correção.

### 3. Validar com novo teste

Após o deploy:
1. Fazer uma nova inscrição.
2. Clicar em "Realizar pagamento" e concluir o checkout.
3. Conferir em `Admin → Pagamentos` que o status mudou para `paid` e que `/pagamento` redireciona para `/sucesso`.

## Fora do escopo

- Mudanças no painel da InfinitePay (Webhook URL e Redirect URL continuam corretas).
- Estrutura do webhook (já funciona, só falta o `order_nsu` certo chegar).
- Tela de admin de configurações.
