# Correção: "Nenhum lote de inscrições aberto no momento"

## Diagnóstico

Consultei o banco. A causa **não** é o InfinitePay — os links e o handle `ii-corrida-das-familias` já estão salvos corretamente em `settings` (`checkout_adulto`, `checkout_crianca`, `infinitepay_checkout_adulto_url`, `infinitepay_checkout_crianca_url`) desde a atualização anterior.

O problema real: o único lote ativo tem `ends_at = 2026-07-01 02:59:59+00` e hoje é **2026-07-02**. Como `createRegistration` exige `ends_at >= now()`, nenhum lote é encontrado e a inscrição falha antes mesmo de chegar ao checkout.

```
Lote 1: is_active=true, starts_at=2026-05-15, ends_at=2026-07-01 ← expirado
        price_cents=6800 (adulto), child_price_cents=4800 (criança)
```

## Alteração (apenas dados, nenhum arquivo do repo muda)

Um `UPDATE` em `public.lots` estendendo a validade do Lote 1 até a véspera do evento:

```sql
UPDATE public.lots
SET ends_at = '2026-11-30 23:59:59+00'
WHERE id = '07842ff0-709d-4b3c-b671-6433522b1ba5';
```

(Se preferir outra data de encerramento — por exemplo, uma semana antes do evento — me diga o dia e eu ajusto.)

## Commit / Push no GitHub

Como a correção é 100% em dados (linha da tabela `lots`), **não haverá commit no repositório** — o GitHub espelha o código, não o banco. Os links do InfinitePay já foram atualizados anteriormente também via dados, então o repo já está sincronizado com o estado atual.

Se quiser forçar um commit vazio só para marcar a data da correção em produção via VPS, me avise que crio.

## Validação pós-execução

1. `SELECT ends_at FROM lots WHERE id = '07842ff0-...'` → nova data.
2. Abrir `/inscricao`, preencher e enviar → deve redirecionar para `/inscricao/sucesso?protocol=...`.
3. Clicar em "Realizar pagamento" → abre `https://checkout.infinitepay.io/ii-corrida-das-familias/kr7CYkVtI9` (adulto) ou `.../REUPP20zRX` (criança ≤ 9 anos).

## Fora de escopo

- Nenhuma alteração em `infinitepay.functions.ts`, `registrations.functions.ts` ou em qualquer arquivo do repositório.
- Não estou tocando em preços, categorias ou regras de idade.
