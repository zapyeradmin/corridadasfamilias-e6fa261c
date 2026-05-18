# Nova seção "Nossos Patrocinadores" na Home

Adicionar uma nova seção logo após `<PercursoCompleto />` (linha 660 de `src/routes/index.tsx`), antes do fechamento `</>` do componente da home.

## Layout e estilo

- Fundo sólido laranja `#ff5300` (`bg-[color:var(--color-brand-orange)]`).
- Container `max-w-[1200px]`, padding `px-5 md:px-8`, `py-20 md:py-28`.
- Bloco de texto alinhado à esquerda, em branco `#ffffff`:
  - Eyebrow: `QUEM APOIA A CORRIDA` — uppercase, tracking largo, peso 700, pequeno.
  - Título H2: `VEJA QUEM SÃO OS NOSSOS PATROCINADORES` — `heading-section`, branco, `text-3xl md:text-5xl`.
  - Parágrafo: `Marcas que acreditam no esporte, na fé e nas famílias da nossa comunidade.` — `text-justify`, branco, `max-w-3xl`.

## Grid de logomarcas (24 slots, 4×6)

- `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 mt-10 md:mt-14`.
- No desktop fica exatamente 4 colunas × 6 linhas = 24 cards.
- Cada card:
  - Proporção `aspect-[16/9]` (uso de `aspect-video`).
  - Fundo branco `#ffffff`, `rounded-2xl`, borda fina `border border-white/40` interna + `ring-1 ring-black/5`, sombra suave (`shadow-[0_8px_24px_rgba(22,9,31,0.12)]`).
  - Conteúdo centralizado (`grid place-items-center`).

### Fonte de dados dos cards

- Slots 1–4: usar os 4 patrocinadores diamante já existentes na base (Oracle Digital, Nattivo Café, Urbano Alimentos, Prefeitura de Serra Talhada). Reutilizar o mapa `LOGO_ASSETS` que já está em `sponsors-marquee.tsx` (extrair para `src/lib/sponsors-assets.ts` para compartilhar entre marquee e nova seção sem duplicar imports).
  - Renderizar a logo com `object-contain`, `max-h-[70%] max-w-[80%]`, aplicando o mesmo ajuste óptico (`LOGO_SCALE`) para Urbano e Prefeitura.
  - Se houver `website_url`, envolver em `<a target="_blank" rel="noreferrer">`.
- Slots 5–24: placeholders com texto `Patrocinador 5` … `Patrocinador 24`, cor `#ff5300` (`text-[color:var(--color-brand-orange)]`), `font-extrabold uppercase tracking-wider text-sm md:text-base`.

### Espaçamento e responsivo

- Mobile (2 col): `gap-4`, cards um pouco menores mas mantendo `aspect-[16/9]`.
- Tablet (3 col): `gap-5`.
- Desktop (4 col): `gap-6`, distribuição perfeita 4×6.
- Padding interno de cada card `p-3 md:p-4` para respiro das logos.

## CTA inferior

- Parágrafo centralizado, branco, `mt-10 md:mt-14`, `text-base md:text-lg`:
  - Texto: `Quer apoiar o evento? Fale conosco no WhatsApp e receba nossa proposta.`
  - `Fale conosco no WhatsApp` como link `<a>` para `https://wa.me/{SITE.whatsapp}?text=...` (mensagem pré-preenchida: "Olá! Tenho interesse em patrocinar a II Corrida das Famílias."), abrindo em nova aba, com sublinhado e `font-bold hover:text-white/90`.

## Arquivos afetados

- `src/routes/index.tsx`
  - Adicionar componente `NossosPatrocinadores` (definido no mesmo arquivo, padrão dos outros como `PercursoCompleto`).
  - Renderizar `<NossosPatrocinadores />` imediatamente após `<PercursoCompleto />`.
- `src/lib/sponsors-assets.ts` (novo)
  - Exportar `LOGO_ASSETS`, `LOGO_SCALE`, `slugFromUrl`, `FALLBACK_DIAMOND`.
- `src/components/site/sponsors-marquee.tsx`
  - Refatorar para importar de `sponsors-assets.ts` (sem mudar comportamento visual).

## Notas técnicas

- Reutilizar `useQuery(["sponsors"])` já hidratada na home (prefetch já existe em `index.tsx`) para popular os 4 primeiros slots sem nova requisição.
- Sem novas dependências; tudo em Tailwind + tokens de `styles.css`.
- Sem mudanças no backend nem em RLS.
