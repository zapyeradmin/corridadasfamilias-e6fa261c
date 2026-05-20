# Plano — Página `/admin/logs`

Melhorar a página de Logs de Acesso com paginação centralizada e exportação em PDF.

---

## 1. Paginação (10 itens por página)

Arquivo: `src/routes/_authenticated/admin.logs.tsx`

- Manter o `useQuery` que chama `listAccessLogs` (já retorna todos os registros, ordenados por `created_at desc`).
- Adicionar estado local `const [page, setPage] = useState(1)` e constante `PAGE_SIZE = 10`.
- Calcular `totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE))` e fatiar `data.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE)` para renderizar a tabela.
- Resetar `page` para 1 sempre que `data?.length` mudar (via `useEffect`) e fazer clamp se o usuário estiver numa página inexistente após refetch.

### UI da paginação (centralizada, abaixo da tabela)

Reusar `src/components/ui/pagination.tsx` (já no projeto):

```text
[<-]   [ 2 ]   [->]
```

- Container: `<Pagination>` → `<PaginationContent>` centralizado.
- Item 1: seta esquerda (`ChevronLeft`) — botão `ghost` icon, `disabled` quando `page === 1`, `onClick={() => setPage(p => Math.max(1, p-1))}`.
- Item 2: input numérico editável estilizado (campo pequeno `w-16 text-center`) mostrando a página atual; ao alterar (onChange + onBlur/Enter), faz clamp entre 1 e `totalPages` e atualiza `page`. Ao lado, em texto secundário, `"de {totalPages}"`.
- Item 3: seta direita (`ChevronRight`) — `disabled` quando `page === totalPages`, `onClick={() => setPage(p => Math.min(totalPages, p+1))}`.
- Esconder a paginação quando `totalPages <= 1`.

---

## 2. Botão "Exportar Logs de Acesso" (PDF)

Posição: canto superior direito do header da página (mesma linha do `<h1>`), usando flex `justify-between`.

### Bibliotecas

Usar `jspdf` + `jspdf-autotable` (puro JS, funciona no browser sem dependência nativa). Instalar via `bun add jspdf jspdf-autotable`.

### Comportamento

- Botão `<Button>` com ícone `Download` (lucide) e label "Exportar Logs de Acesso".
- Estado `isExporting` para desabilitar e mostrar spinner durante a geração.
- Ao clicar:
  1. Usa **todos** os logs já carregados em `data` (não apenas a página atual). Como `listAccessLogs` retorna a lista completa, não precisa nova chamada.
  2. Cria `new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" })`.
  3. Cabeçalho: título "Relatório de Logs de Acesso — Corrida das Famílias", data/hora de geração (`formatDateTimeBR(new Date())`), total de registros.
  4. `autoTable` com colunas: **Quando**, **Ator** (email ou id), **Ação**, **Entidade** (`entity_type · entity_id` truncado), **Detalhes** (JSON stringificado, com quebra de linha, fonte mono pequena 7pt).
  5. Rodapé com numeração `Página X de Y` em cada página.
  6. Nome do arquivo: `logs-acesso-YYYY-MM-DD-HHmm.pdf`, salvo via `doc.save(filename)`.
- Toast de sucesso (`sonner`) ao concluir; toast de erro em `catch`.
- Desabilitar o botão se `!data || data.length === 0`.

### Helper

Criar `src/lib/export-logs-pdf.ts` exportando `exportAccessLogsToPdf(logs: AccessLog[])` para isolar a lógica de geração e manter o componente enxuto.

---

## Arquivos afetados

```text
package.json                                  (+ jspdf, jspdf-autotable)
src/routes/_authenticated/admin.logs.tsx      (header com botão + paginação + slice)
src/lib/export-logs-pdf.ts                    (novo — helper de geração de PDF)
```

Sem mudanças de schema, server functions ou RLS.

---

## Como testar

1. Abrir `/admin/logs` com mais de 10 registros → ver apenas 10 linhas + paginação centralizada com `← [1] de N →`.
2. Clicar nas setas e digitar número manualmente no campo → tabela atualiza.
3. Com 0 ou ≤10 registros → paginação some, botão exportar fica desabilitado se 0.
4. Clicar em "Exportar Logs de Acesso" → download de `logs-acesso-*.pdf` com **todos** os registros, tabela legível em paisagem, numeração de página, JSON dos detalhes preservado.
