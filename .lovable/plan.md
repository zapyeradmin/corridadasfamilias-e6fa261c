# Plano de Otimização de Performance

## Diagnóstico

O site está lento por três causas principais (em ordem de impacto):

1. **Imagens gigantes não otimizadas (~8.8 MB em `src/assets`)** — esta é, de longe, a maior causa da lentidão:
   - `hero-runner.jpg` — 2.5 MB (LCP, imagem principal)
   - `kit-exclusivo.png` — 2.8 MB
   - `capa-video-lancamento.jpg` — 2.5 MB
   - `percurso-mapa.png` — 593 KB
   - `informacoes-corrida.jpg` — 593 KB
2. **`src/routes/index.tsx` monolítico (894 linhas)** — toda a home (hero, pilares, timeline, kit, percurso, vídeo, etc.) é carregada e renderizada de uma vez, mesmo o que está abaixo da dobra.
3. **`framer-motion` carregado no bundle inicial** apenas para a animação de parallax do hero, custando ~50 KB gzipped no carregamento crítico.

A refatoração será focada nesses três pontos, que entregam ~90% do ganho real. Não vou reescrever rotas que já estão pequenas e funcionando (ex.: `faq.tsx`, `kit.tsx`, `login.tsx`) só por reescrever — isso gastaria créditos sem ganho perceptível.

## O que será feito

### 1. Otimização de imagens (maior ganho de performance)

Converter as imagens grandes para WebP/AVIF redimensionadas para o tamanho real de exibição, mantendo qualidade visual. Meta: reduzir de 8.8 MB para ~600 KB no total.

- `hero-runner` → WebP 1920px de largura + variante mobile 768px (~150 KB)
- `kit-exclusivo` → WebP 1200px (~120 KB)
- `capa-video-lancamento` → WebP 1280px (~100 KB)
- `percurso-mapa` → WebP 1000px (~80 KB)
- `informacoes-corrida` → WebP 1200px (~100 KB)

Usar `<picture>` com `<source srcset>` para servir AVIF/WebP, mantendo o JPG/PNG como fallback. Adicionar `width`/`height` explícitos para eliminar CLS. Manter o `preload` apenas do hero mobile/desktop conforme o viewport.

### 2. Refatorar `src/routes/index.tsx` (894 linhas → ~150 linhas)

Quebrar a home em componentes por seção dentro de `src/components/home/`:

```text
src/components/home/
  hero-section.tsx           (com parallax)
  pilares-section.tsx
  timeline-section.tsx
  kit-exclusivo-section.tsx
  percurso-section.tsx
  video-lancamento-section.tsx
  informacoes-section.tsx
```

Manter `index.tsx` apenas com o `createFileRoute`, metadata e composição das seções. Isso permite que o code-splitter automático do TanStack divida melhor o bundle e facilita manutenção futura.

### 3. Lazy-loading do conteúdo abaixo da dobra

As seções abaixo do hero (kit, percurso, vídeo, informações) só são vistas após scroll. Serão carregadas via `React.lazy()` + `<Suspense>` com placeholder, reduzindo o JS do carregamento inicial em ~30-40%.

A seção do hero e os pilares (visíveis na primeira tela) continuam no bundle crítico.

### 4. Isolar `framer-motion`

O parallax do hero é a única animação que usa `framer-motion`. Vou:
- Manter `framer-motion` apenas dentro de `hero-section.tsx`, já que essa seção fica no bundle crítico.
- Substituir o parallax por uma versão CSS pura (`transform` com `scroll-timeline` ou `IntersectionObserver` leve) — corta ~50 KB gzipped do bundle inicial.

### 5. Ajustes pontuais adicionais (baixo custo, bom retorno)

- Adicionar `loading="lazy"` e `decoding="async"` em todas as imagens fora do hero.
- Trocar import de `lucide-react` por imports diretos (`lucide-react/dist/esm/icons/heart`) quando possível, garantindo tree-shaking.
- `font-display: swap` nas fontes (verificar `styles.css`).
- Adicionar `<link rel="preconnect">` ao Supabase no `__root.tsx`.

## O que NÃO será mexido

- Rotas administrativas (`_authenticated/*`) — não impactam o site público.
- Rotas pequenas já enxutas (faq, kit, login, etc.) — refatorá-las não traz ganho perceptível.
- Lógica de negócio, server functions, schema do banco, formulário de inscrição — fora de escopo de performance.
- Design e textos — permanecem idênticos.

## Resultado esperado

- Tamanho total da home: **~9 MB → ~1 MB** (-89%)
- LCP (hero): **~4-6s → ~1-1.5s** em 4G
- JS inicial: **-30 a -40%** (lazy de seções + remoção de framer-motion do crítico)
- Sem mudanças visuais perceptíveis para o usuário.

## Detalhes técnicos

- Conversão de imagens via `sharp` rodando em `code--exec` na hora da implementação (gera os arquivos `.webp` em `src/assets/`).
- Mantenho os arquivos originais como fallback dentro do `<picture>` para máxima compatibilidade.
- Code-split automático do TanStack já está ativo — basta extrair componentes para arquivos próprios e usar `React.lazy` nas seções abaixo da dobra.
- Verificação após implementação: rodar `browser--performance_profile` e comparar Web Vitals antes/depois.

Posso prosseguir com a implementação?
