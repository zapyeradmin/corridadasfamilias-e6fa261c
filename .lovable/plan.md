## Página /admin/pagamentos — Reformulação

### 1. Remover modo de testes
- Remover o bloco "Modo de testes (Infinity Pay desativado)" + input de protocolo + botão "Simular aprovação" de `src/routes/_authenticated/admin.pagamentos.tsx`.
- Remover o import e uso de `simulatePaymentApproval`.
- Manter a função `simulatePaymentApproval` em `src/lib/admin.functions.ts` por enquanto (não referenciada na UI). Opcional: posso remover também — confirme se quer apagar do backend.

### 2. Status somente via /admin/inscricoes ou webhook
- A página de Pagamentos vira **somente leitura**. Sem ações de mutação.
- O fluxo de atualização de status já está centralizado em `updateRegistrationStatus` (chamado a partir de `/admin/inscricoes`), que sincroniza `payments`. Nenhuma outra rota da UI altera `payments`.
- O webhook `src/routes/api/webhooks/infinitepay.ts` continua sendo a única outra fonte de escrita (entrada externa de pagamento).

### 3. Filtro de status em PT-BR + busca
- Mapa de labels: `all→Todos`, `pending→Pendente`, `processing→Processando`, `paid→Pago`, `canceled→Cancelado`, `refunded→Reembolsado`. Remover `failed` da lista (não pedido).
- Adicionar `<Input>` de busca "Nome ou CPF" ao lado do Select de status.
- Backend `listPayments` em `src/lib/admin.functions.ts`: adicionar parâmetro opcional `search`. Como `payments` não tem `full_name`/`cpf`, fazer JOIN via `select("..., registrations!inner(full_name, cpf, cpf_normalized)")` e usar `.or("full_name.ilike.%x%,cpf_normalized.ilike.%x%", { referencedTable: "registrations" })`. Também trazer `full_name` e `cpf` no retorno.

### 4. Colunas Nome + CPF na tabela
- Adicionar colunas "Inscrito" e "CPF" antes de "Status". Formatar CPF com máscara usando helper existente em `src/lib/cpf.ts`.

### 5. Paginação centralizada (10 por página)
- `pageSize = 10`.
- Mesmo padrão visual já usado em `/admin/dashboard` e `/admin/inscricoes`: `ChevronLeft` + `<input type="number">` editável (com clamp, Enter e onBlur) + `ChevronRight` + texto "de {totalPages}".
- Resetar página ao mudar status ou busca.

### Arquivos alterados
- `src/lib/admin.functions.ts` — `listPayments` ganha `search` e JOIN com `registrations`.
- `src/routes/_authenticated/admin.pagamentos.tsx` — reescrita: sem modo de testes, filtro PT-BR, busca, colunas Nome/CPF, paginação centralizada.

### Fora do escopo
- Mudanças no webhook InfinityPay.
- Remover `simulatePaymentApproval` do backend (mantido por padrão; confirme se quer apagar).
