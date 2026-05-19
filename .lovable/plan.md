Update payment methods on `/inscricao/sucesso` page.

## Change

In `src/routes/inscricao_.sucesso.tsx`, replace the 3 `PayMethod` items in the "Formas de pagamento" grid:

- **PIX** (`QrCode`) — "Aprovação imediata"
- **Cartão à vista** (`CreditCard`) — "Crédito em 1x"
- **Cartão parcelado** (`CreditCard`) — "Até 12x"

Remove the Boleto entry (and unused `Receipt` import).

No other files affected.
