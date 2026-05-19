## Objetivo

Refazer a página `/percurso` reaproveitando o design da seção "Percurso completo da corrida" da Home, mantendo identidade visual consistente (tipografia, cores roxo/laranja, layout em duas colunas com mapa + lista de infos).

## Estrutura proposta da página `/percurso`

Arquivo: `src/routes/percurso.tsx`

1. **Hero superior (PageHeader já existente, refinado)**
   - Manter `PageHeader` com gradient hero roxo, eyebrow "5 quilômetros", título "Percurso oficial" e descrição curta.
   - Mantém coerência com as outras páginas internas (premiação, kit, etc.).

2. **Seção principal "Percurso completo" (espelha a Home)**
   - Fundo branco, container `max-w-[1200px]`, padding `py-20 md:py-28`.
   - Eyebrow: "Percurso completo da corrida".
   - H2: "Fique por dentro do percurso, para não errar no dia da corrida".
   - Parágrafo introdutório justificado.
   - Grid 2 colunas (md):
     - Coluna esquerda: imagem do mapa (`percursoMapa` de `@/assets`, mesmo asset usado na Home), `aspect-[4/3]`, `object-contain`.
     - Coluna direita: subtítulo "O trajeto passa pelas principais ruas da Cidade", parágrafo descritivo e a lista `PERCURSO_INFOS` (Percurso Oficial, Sinalização e Apoio, Distância, Altimetria) renderizada com o mesmo padrão visual de `PercursoInfoItem` (ícone em círculo laranja translúcido + título uppercase + texto).

3. **Faixa CTA final (reaproveitando estilo de outras páginas)**
   - Bloco roxo (`bg-[color:var(--color-brand-purple)]`) com texto branco: "Pronto para correr com a sua família?" + botão laranja "Inscreva-se Já!" linkando para `/inscricao`.
   - Garante encerramento com conversão, alinhado com o padrão visual do restante do site.

## Detalhes técnicos

- Extrair `PERCURSO_INFOS` e `PercursoInfoItem` para `src/components/site/percurso-info.tsx` e reutilizar tanto em `src/routes/index.tsx` quanto em `src/routes/percurso.tsx` — evita duplicação de dados/markup.
- Importar `percursoMapa` do mesmo caminho usado em `index.tsx` (confirmar com leitura do import na Home antes da implementação).
- Atualizar `head()` do route:
  - title: "Percurso 5km — II Corrida das Famílias"
  - description: enfatiza largada/chegada na Igreja Matriz e ruas do trajeto.
  - og:title, og:description e og:image (usar o mapa como og:image, já que é a imagem de capa real).
- Remover o bloco antigo "Mapa do percurso em breve" e os 3 cards (Largada/Distância/Chegada) — substituídos pelo novo layout.
- Manter tokens semânticos (`--color-brand-*`) — nenhuma cor hardcoded fora de tokens já em uso.
- Sem mudanças de backend, rotas, ou dependências.

## Arquivos afetados

- `src/components/site/percurso-info.tsx` (novo) — componente + constante compartilhada.
- `src/routes/index.tsx` — importa do novo módulo, remove definições locais.
- `src/routes/percurso.tsx` — reescrita conforme acima.
