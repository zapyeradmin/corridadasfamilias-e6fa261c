## Objetivo

Refazer `/premiacao` espelhando o design da seção "Categorias e premiações" da Home (fundo laranja com cards brancos por categoria, sub-blocos masculino/feminino, pódios 1º/2º/3º), mantendo o mesmo padrão visual já usado em `/percurso` e `/kit`.

## Estrutura proposta

Arquivo: `src/routes/premiacao.tsx`

1. **PageHeader** (hero atual mantido)
   - eyebrow: "Reconhecimento"
   - title: "Premiação"
   - description: enfatiza premiação em dinheiro, troféus e medalhas por categoria.

2. **Seção principal "Categorias e premiações" (espelha a Home)**
   - Fundo laranja idêntico (`linear-gradient(180deg, #e9591b 0%, #ff5300 12%, #ff5300 100%)`) com container `max-w-[1200px]`, padding `pt-6 pb-20 md:pt-8 md:pb-28` (mesmo ritmo de `/percurso` e `/kit`).
   - Cabeçalho com eyebrow + H2 + parágrafo (texto reaproveitado da Home).
   - Grid 3 colunas (`md:grid-cols-3`) com cards brancos, cada um contendo dois `SubCategoriaBlock` (masculino + feminino) separados por divisor — idêntico à Home.

3. **Bloco informativo** (preserva a info extra que existe hoje em `/premiacao`)
   - `rounded-2xl bg-[color:var(--color-brand-soft)] p-6` com texto curto: "Todos os participantes que cruzarem a linha de chegada recebem medalha de finisher."

4. **Faixa CTA final** (mesma das outras páginas)
   - `bg-[color:var(--color-brand-purple)]`, botão laranja "Inscreva-se Já!" → `/inscricao`.

## Detalhes técnicos

- Extrair `Premio`, `SubCategoria`, `Categoria`, listas `PREMIOS_*`, `CATEGORIAS`, `LugarBadge`, `SubCategoriaBlock` e `CategoriasPremiacoes` para um novo módulo compartilhado `src/components/site/categorias-premiacoes.tsx` (mesmo padrão de `percurso-info.tsx` e `kit-itens.tsx`).
- `src/routes/index.tsx` passa a importar `CategoriasPremiacoes` do novo módulo e remove as definições locais.
- `src/routes/premiacao.tsx` reescrita: importa `CATEGORIAS`, `SubCategoriaBlock` (e ícones `Trophy`, `Medal`) para renderizar o mesmo grid, com o mesmo background laranja, sem repetir o eyebrow (já vem no `PageHeader`). Alternativa: expor um componente `<CategoriasPremiacoesBody />` que renderiza apenas o grid (sem cabeçalho), reutilizado em ambos os lugares.
- Atualizar `head()` do route:
  - title: "Premiação — II Corrida das Famílias"
  - description: cita prêmios em dinheiro (Geral M/F), troféus por categoria e medalha para todos os finishers.
  - og:title, og:description.
- Remover o grid antigo de 3 cards (Trophy/Medal/Award) com `ContentSection`.
- Manter tokens semânticos; nenhuma cor hardcoded nova além do gradiente já existente na Home.
- Sem mudanças de backend, rotas ou dependências.

## Arquivos afetados

- `src/components/site/categorias-premiacoes.tsx` (novo) — tipos, dados, `LugarBadge`, `SubCategoriaBlock` e `CategoriasPremiacoes` compartilhados.
- `src/routes/index.tsx` — importar do novo módulo, remover definições locais.
- `src/routes/premiacao.tsx` — reescrita conforme acima.
