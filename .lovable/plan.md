## Objetivo

Garantir que o carrossel auto-scroll dos patrocinadores Diamante apareça corretamente na home e otimizar movimento, espaçamento e responsividade — com tratamento especial para logos de larguras diferentes (ex.: Urbano Alimentos) para que todas pareçam visualmente equivalentes.

## Diagnóstico atual

- `SponsorsMarquee` já está montado em `src/routes/index.tsx` (linha 346), acima de "Pilares do Evento".
- 4 patrocinadores Diamond publicados no banco: Oracle Digital, Nattivo Café, Urbano Alimentos, Prefeitura de Serra Talhada.
- Implementação atual usa `Carousel` shadcn + `embla-carousel-auto-scroll` com `basis-1/3 … lg:basis-1/6`. Problemas:
  - Logos com proporções diferentes geram "ilhas" visuais — Urbano fica pequena.
  - `dragFree: true` + `loop: true` + breakpoints fixos podem causar pequenos saltos no loop quando o número de itens não enche o viewport.
  - Sem skeleton/SSR fallback enquanto a query carrega → seção some no primeiro paint.
  - No mobile, `basis-1/3` aperta demais o espaçamento.

## Mudanças

1. **`src/components/site/sponsors-marquee.tsx`** — refatorar:
   - Trocar `Carousel` shadcn por um marquee CSS puro (`@keyframes` translateX em `src/styles.css`), com 2 trilhas duplicadas lado a lado para loop perfeito sem "jump". Mais leve e fluido que Embla para esse caso, e elimina a dependência de breakpoints.
   - Container de cada logo com **altura fixa** (`h-14` mobile, `h-20` desktop) e **largura mínima uniforme** (`min-w-[140px]` mobile, `min-w-[200px]` desktop), com `flex items-center justify-center`. Isso normaliza o espaço ocupado, independente da proporção da imagem.
   - `img` com `max-h-full max-w-full object-contain` + `loading="lazy"` + `decoding="async"` + `draggable={false}`.
   - Ajuste fino por logo via um pequeno map `{ slug → scaleClass }` para empurrar logos estreitas (Urbano) a uma escala um pouco maior (ex.: `scale-110`) e logos largas a `scale-95`, mantendo equilíbrio óptico.
   - Pausar animação no hover (`group-hover:[animation-play-state:paused]`).
   - `prefers-reduced-motion`: animação desativada.
   - Gradientes de fade nas bordas mantidos, com largura responsiva (`w-10 md:w-20`).
   - Eyebrow "Patrocínio Diamante" mantido.
   - Quando `isLoading` e ainda sem dados: render de placeholder com altura reservada (evita CLS e a seção "sumir").
   - Quando nenhum diamond publicado: retorna `null` (mantém comportamento).
   - Remover dependência `embla-carousel-auto-scroll` deste componente (não precisa desinstalar).

2. **`src/styles.css`** — adicionar:
   ```css
   @keyframes marquee-x {
     from { transform: translateX(0); }
     to   { transform: translateX(-50%); }
   }
   .animate-marquee { animation: marquee-x var(--marquee-duration, 40s) linear infinite; }
   @media (prefers-reduced-motion: reduce) {
     .animate-marquee { animation: none; }
   }
   ```
   Duração controlada por CSS var inline (`--marquee-duration`) calculada a partir do nº de itens para velocidade constante.

3. **Mobile**:
   - Padding lateral da seção `px-4`, gap entre slides `gap-8` (mobile) / `gap-16` (desktop).
   - Altura da seção menor (`py-8 md:py-12`).
   - Min-width dos slides garante respiração entre logos.

## Fora do escopo

- Não alterar dados/banco nem outras seções da home.
- Não mexer em `/patrocinadores` admin.

## Detalhe técnico

A duplicação da trilha (`[items, items].flat()`) com `translateX(-50%)` no keyframe é o padrão para loop infinito sem salto. A largura uniforme dos itens é o que faz logos de proporções diferentes parecerem alinhadas — não mexer no SVG/PNG das logos.
