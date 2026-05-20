## Objetivo

Na página `/admin/inscricoes`:
1. Ao alterar o Status da inscrição, refletir em Dashboard, Pagamentos e na tabela `payments` do banco.
2. "Detalhes" abre um modal com todas as informações cadastradas do inscrito (em vez de navegar para outra rota).
3. Paginação: 10 inscritos por página, centralizada, com seta esquerda, número da página editável, seta direita.

---

## Mudanças

### 1. Sincronização de Status (backend) — `src/lib/admin.functions.ts`

Atualizar `updateRegistrationStatus` para também atualizar todos os registros em `payments` vinculados à inscrição:

- Após `UPDATE registrations SET status = X WHERE id = $id`, executar:
  - `UPDATE payments SET status = mappedStatus, paid_at = (X = 'paid' ? now() : null) WHERE registration_id = $id`
- Mapeamento `registration_status → payment_status`:
  - `pending → pending`
  - `processing → processing`
  - `paid → paid` (+ `paid_at = now()` se ainda null)
  - `canceled → canceled`
  - `refunded → refunded`
- Invalidar cache no frontend (já existe `qc.invalidateQueries({ queryKey: ["admin"] })` que cobre dashboard, pagamentos e inscrições).

Isso garante que Dashboard (KPIs e "Pagas/Pendentes/Receita") e a página `/admin/pagamentos` mostrem o status correto e o DB fique consistente.

### 2. Detalhes em Modal — `src/routes/_authenticated/admin.inscricoes.tsx`

- Substituir os `<Link to="/admin/inscricoes/$id">` por um botão "Detalhes" que abre um `<Dialog>` (shadcn).
- O Dialog usa `useQuery` com `getRegistrationDetail({ id })` quando aberto, e exibe todos os campos: protocolo, nome, e-mail, whatsapp, CPF, nascimento, gênero, categoria, camiseta, contato de emergência, notas médicas, status, valor, criada em, e tabela de pagamentos vinculados.
- O nome do inscrito na coluna deixa de ser link.
- A rota `admin.inscricoes.$id.tsx` é mantida (não removida) para acesso direto via URL, mas a UX padrão passa pelo modal.

### 3. Paginação centralizada (10 por página) — `src/routes/_authenticated/admin.inscricoes.tsx`

- Alterar `pageSize` de `25` para `10`.
- Substituir o rodapé "Anterior / Próxima" por um controle centralizado:
  - `ChevronLeft` (desabilitado em `page <= 1`)
  - `<input type="number">` editável mostrando a página atual; ao alterar (onBlur/Enter) faz `setPage(clamp(value, 1, totalPages))`
  - `ChevronRight` (desabilitado em `page >= totalPages`)
  - Texto "de {totalPages}" ao lado
- Mesmo padrão visual já usado no Dashboard, para consistência.

---

## Detalhes técnicos

- Usar `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle` de `@/components/ui/dialog`.
- Estado: `const [detailId, setDetailId] = useState<string | null>(null)`; modal aberto quando `detailId !== null`.
- Reusar `getRegistrationDetail` (já existe).
- Sem migrations de banco — apenas UPDATE via server function existente, ampliado.
- Sem alteração em RLS (a policy "Admins can update payments" já permite).

## Fora de escopo

- Não tocar em webhook InfinityPay (continua escrevendo seu próprio status quando chega).
- Não reconciliar pagamentos órfãos históricos.
