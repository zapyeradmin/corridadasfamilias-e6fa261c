## Objetivo

Refazer `/patrocinadores` espelhando o design da seção "Quem apoia a corrida" da Home (eyebrow + título + parágrafo + grid 4 colunas de cards com logos em `aspect-[16/9]` + linha "Fale conosco no WhatsApp" + CTA "Inscreva-se Já!"), porém com **fundo branco** em vez do laranja, mantendo a mesma coerência visual de `/percurso`, `/kit` e `/premiacao`.

## Estrutura proposta

Arquivo: `src/routes/patrocinadores.tsx` (reescrita)

1. **PageHeader** (mantido)
   - eyebrow: "Quem apoia"
   - title: "Nossos patrocinadores"
   - description curta sobre marcas que apoiam o evento.

2. **Seção principal "Patrocinadores" (espelha a Home, fundo branco)**
   - `bg-white`, container `max-w-[1200px] px-5 md:px-8`, padding `pt-6 pb-20 md:pt-8 md:pb-28` (mesmo ritmo de `/percurso`, `/kit`, `/premiacao`).
   - Cabeçalho com:
     - eyebrow `text-[color:var(--color-brand-orange)]` (em vez de branco).
     - H2 `heading-section` em `text-[color:var(--color-brand-purple-title)]`.
     - Parágrafo introdutório em `text-[color:var(--color-brand-purple-text)]/80`.
   - **Renderização por tier** (diamond → gold → silver → standard), reaproveitando `TIER_ORDER`/`TIER_LABEL` já existentes. Cada tier vira uma sub-seção com:
     - label de tier em `text-[color:var(--color-brand-orange)]` (mesma tipografia eyebrow).
     - Grid 4 colunas (`grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5 md:gap-6`) com cards idênticos ao da Home:
       - `aspect-[16/9]`, `rounded-2xl`, `bg-white`, `border border-border`, `shadow-soft`, hover sutil (`hover:-translate-y-0.5 hover:shadow-card`).
       - logo via `LOGO_ASSETS[slug]` quando disponível (mesma lógica de `slugFromUrl` da Home), com `LOGO_SCALE` aplicado. Fallback: `<img src={s.logo_url} />` para logos não bundlados.
       - mesma estrutura de link externo quando `website_url` existe.
   - Para o tier **diamond**, completar com cards "Patrocinador N" (estilo da Home) até totalizar 24 quadros, mas com visual de fundo branco: borda `border-dashed border-[color:var(--color-brand-purple)]/25` e texto `text-[color:var(--color-brand-orange)]` — preserva a sensação de "vagas disponíveis" sem ficar agressivo no fundo branco.
   - Estado vazio (`!sponsors.length`): card único pontilhado "Em breve divulgaremos os patrocinadores oficiais." (já existe).
   - Skeleton de loading mantido com `bg-[color:var(--color-brand-soft)]`.

3. **Linha "Fale conosco no WhatsApp"** (espelha a Home)
   - `mt-10 md:mt-14`, centralizada, texto em `text-[color:var(--color-brand-purple-text)]` com link sublinhado `font-bold` apontando para WhatsApp (`SITE.whatsapp`) com mesma mensagem da Home.

4. **CTA final "Inscreva-se Já!"** (mesmo botão da Home/outras páginas)
   - `mt-8 md:mt-10`, centralizado, `Link` para `/inscricao`, classe roxa `bg-[#431181]` com shadow (idêntica à Home), texto branco extrabold uppercase.

## Detalhes técnicos

- Reutilizar imports já presentes em `patrocinadores.tsx` (`PageHeader`, `useServerFn`, `useQuery`, `getPublishedSponsors`, `SITE`) e adicionar:
  - `Link` de `@tanstack/react-router`.
  - `LOGO_ASSETS`, `LOGO_SCALE`, `slugFromUrl` de `@/lib/sponsors-assets`.
  - `cn` de `@/lib/utils`.
- Remover o uso de `ContentSection` (substituído por seção `bg-white` própria com mesmo container/padding das outras páginas internas).
- Remover o bloco final "Quer apoiar o evento?" antigo (substituído pela versão espelhada da Home).
- Atualizar `head()`:
  - title: "Patrocinadores — II Corrida das Famílias" (mantido).
  - description: enfatiza marcas, instituições e cotas Diamante/Ouro/Prata.
  - og:title, og:description (sem og:image, não há hero image específica).
- Sem mudanças em `src/routes/index.tsx`, sem novo módulo compartilhado (a Home tem comportamento específico — 24 cards fixos com placeholders — que não vale a pena extrair agora; o card visual é replicado inline com tokens semânticos).
- Sem mudanças de backend, rotas ou dependências.

## Arquivos afetados

- `src/routes/patrocinadores.tsx` — reescrita conforme acima.
