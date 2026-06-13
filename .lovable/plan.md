# Atualização da Conta InfinitePay

O handle antigo (`patricia-luciana-7b3`) está armazenado **apenas no banco de dados** (tabela `settings`), não há referência no código. A mudança é 100% via dados — nenhum arquivo precisa ser editado.

## Alterações no banco (tabela `settings`)

Atualizar 4 registros, substituindo as URLs antigas pelas novas com o handle `ii-corrida-das-familias`:

| key | Novo valor |
|---|---|
| `infinitepay_checkout_adulto_url` | `https://checkout.infinitepay.io/ii-corrida-das-familias/kr7CYkVtI9` |
| `infinitepay_checkout_crianca_url` | `https://checkout.infinitepay.io/ii-corrida-das-familias/REUPP20zRX` |
| `checkout_adulto` (JSON `checkout_url`) | `https://checkout.infinitepay.io/ii-corrida-das-familias/kr7CYkVtI9` |
| `checkout_crianca` (JSON `checkout_url`) | `https://checkout.infinitepay.io/ii-corrida-das-familias/REUPP20zRX` |

Valores, lotes, nomes de produto e demais campos permanecem inalterados.

## Commit / Push no GitHub

Como nenhum arquivo do repositório é alterado, **não haverá commit/push** — o GitHub espelha o código, e mudanças em dados do Supabase não geram commits. A configuração nova já fica ativa em produção (preview e published) imediatamente após o UPDATE no banco, sem necessidade de novo deploy.

Se quiser que o deploy seja forçado mesmo assim (ex.: para registrar a data da mudança), posso criar um commit vazio de marcação — me avise.

## Validação pós-execução

1. `SELECT key, value FROM settings WHERE key LIKE '%checkout%'` para confirmar os 4 valores.
2. Abrir `/admin/configuracoes?tab=pagamento` e conferir que os dois cards mostram os novos links com selo "Checkout Ativo".
3. Simular `/inscricao` → checkout deve redirecionar para `checkout.infinitepay.io/ii-corrida-das-familias/...`.
