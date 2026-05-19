## Objetivo

Refazer `/kit` espelhando o design da seção "Kit Exclusivo dos Atletas" da Home (imagem do kit + lista de itens com ícone laranja translúcido), mantendo consistência visual com o restante do site (como já fizemos em `/percurso`).

## Estrutura proposta

Arquivo: `src/routes/kit.tsx`

1. **PageHeader** (mantém o hero atual)
   - eyebrow: "Tudo que você recebe"
   - title: "Kit do atleta"
   - description: igual ao atual.

2. **Seção principal "Kit Exclusivo" (espelha a Home)**
   - `bg-white`, container `max-w-[1200px]`, padding `pt-6 pb-20 md:pt-8 md:pb-28` (mesmo ritmo de `/percurso`).
   - Grid 2 colunas (`md:grid-cols-2`, `items-center`, `gap-10 md:gap-12`):
     - Esquerda: imagem `kitExclusivo` (`@/assets/kit-exclusivo.png`), `aspect-square`, `object-contain`.
     - Direita: H3 "Kit Exclusivo para sua Corrida", parágrafo introdutório, e `ul` com os 4 itens renderizados pelo mesmo `KitItem` (ícone redondo laranja translúcido + título uppercase + texto).
   - Itens: Camiseta Oficial, Número de Peito, Hidratação, Medalha Finisher (mesmos da Home) **+ Contribuição Solidária** (ícone `HandHeart`, texto sobre 1kg de alimento não perecível) para preservar a informação que existe hoje em `/kit`.

3. **Aviso de retirada do kit** (preserva info útil já existente)
   - Bloco `rounded-2xl bg-[color:var(--color-brand-soft)] p-6`, texto curto sobre data/horário/local da retirada serem divulgados em breve. Idêntico ao atual.

4. **Faixa CTA final** (mesma da `/percurso`)
   - `bg-[color:var(--color-brand-purple)]`, texto branco, botão laranja "Inscreva-se Já!" → `/inscricao`.

## Detalhes técnicos

- Extrair `KIT_ITENS` e `KitItem` para `src/components/site/kit-itens.tsx` (mesmo padrão de `percurso-info.tsx`) e reutilizar na Home e em `/kit`. Acrescentar item "Contribuição solidária" apenas na lista usada em `/kit` (passar `extraItens` opcional, ou expor as duas listas).
- Importar `kitExclusivo` de `@/assets/kit-exclusivo.png`.
- Atualizar `head()` do route:
  - title: "Kit do atleta — II Corrida das Famílias"
  - description: enfatiza camiseta, número, hidratação, medalha e contribuição solidária.
  - og:title, og:description, og:image (usar `kitExclusivo` como og:image), twitter:image.
- Remover o grid antigo de 4 cards roxos com `ITENS` local — substituído pelo novo layout.
- Manter tokens semânticos `--color-brand-*`; nenhuma cor hardcoded nova.
- Sem mudanças de backend, rotas ou dependências.

## Arquivos afetados

- `src/components/site/kit-itens.tsx` (novo) — `KIT_ITENS`, `KIT_ITENS_PAGINA` (com contribuição solidária) e `KitItem` compartilhados.
- `src/routes/index.tsx` — importar do novo módulo, remover definições locais de `KIT_ITENS`/`KitItem`.
- `src/routes/kit.tsx` — reescrita conforme acima.
