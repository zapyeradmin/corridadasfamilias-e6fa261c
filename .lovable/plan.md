## Objetivo

1. Mostrar 28 espaços (em vez de 24) na seção "Quem apoia a corrida" da home (`/`) e na página `/patrocinadores`, adicionando os placeholders **Patrocinador 25, 26, 27 e 28**.
2. Garantir que ambas as páginas sejam atualizadas **em tempo real** quando um patrocinador for criado, editado, despublicado ou removido em `/admin/patrocinadores`.

## Situação atual (já mapeada no código)

- `src/components/home/home-patrocinadores.tsx` e `src/routes/patrocinadores.tsx` **já consomem a mesma fonte de dados** (`getPublishedSponsors`) com a mesma `queryKey: ["sponsors"]`. Ou seja, qualquer invalidação propaga para os dois lugares automaticamente.
- Ambos os arquivos têm uma constante `const TOTAL = 24` que controla quantos cards/placeholders aparecem.
- Hoje a atualização só acontece após `staleTime` (5 min) ou refetch manual — não é "em tempo real".

## Mudanças propostas

### 1. Aumentar para 28 espaços

- Em `src/components/home/home-patrocinadores.tsx`: trocar `const TOTAL = 24` por `const TOTAL = 28`.
- Em `src/routes/patrocinadores.tsx`: trocar `const TOTAL = 24` por `const TOTAL = 28`.

Os placeholders "Patrocinador 25/26/27/28" aparecem automaticamente porque a lógica `placeholders` já preenche todo espaço vazio até `TOTAL`. Quando o admin cadastrar novos patrocinadores reais, eles ocuparão esses espaços e os placeholders recuam.

### 2. Sincronização em tempo real (Supabase Realtime)

Criar um hook compartilhado `src/hooks/use-sponsors-realtime.ts` que:

- Abre um channel Supabase em `postgres_changes` na tabela `public.sponsors` (eventos `INSERT`, `UPDATE`, `DELETE`).
- A cada evento chama `queryClient.invalidateQueries({ queryKey: ["sponsors"] })`.
- Faz cleanup do channel no `unmount`.

Usar esse hook nos três pontos que renderizam patrocinadores para o público:

- `src/components/home/home-patrocinadores.tsx`
- `src/routes/patrocinadores.tsx`
- `src/components/site/sponsors-marquee.tsx` (carrossel diamante na home — também se beneficia)

Como todos compartilham `queryKey: ["sponsors"]`, uma única invalidação atualiza os três componentes simultaneamente.

### 3. Habilitar Realtime na tabela `sponsors` (migration)

Por padrão, a tabela `sponsors` não está na publication do Realtime. É preciso uma migration que:

```sql
ALTER TABLE public.sponsors REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sponsors;
```

Sem isso, o channel conecta mas nunca recebe eventos. As RLS atuais (`Anyone can view published sponsors`) já permitem que o cliente anônimo receba apenas linhas publicadas — nenhuma mudança de política é necessária.

## Detalhes técnicos

- Não há mudança de schema da tabela `sponsors`, apenas configuração de replicação.
- O hook usa `supabase` do cliente browser (`@/integrations/supabase/client`) — seguro no browser, sem secrets.
- Mantém o `staleTime` atual como fallback de cache; Realtime só dispara invalidações pontuais.
- Sem mudanças na UI/estilo dos cards — apenas o número de espaços passa de 24 para 28.

## Fora de escopo

- Não vamos mexer no formulário de admin (`/admin/patrocinadores`) — ele já insere/atualiza via Supabase normalmente, e o Realtime fará o resto.
- Não vamos alterar tier "diamond" / marquee logic.
