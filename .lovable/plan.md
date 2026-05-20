## Objetivo

Otimizar o carregamento de imagens e elementos do site para reduzir LCP, peso transferido e CLS, sem alterar visual nem funcionalidade.

## Diagnóstico atual

- Imagens entregues como JPG/PNG originais (~1,1 MB total em `src/assets`): `hero-runner.jpg` 210 KB, `percurso-mapa.png` 198 KB, `kit-exclusivo.png` 256 KB, `informacoes-corrida.jpg` 110 KB, `capa-video-lancamento.jpg` 132 KB, logos PNG, 4 sponsors PNG (~284 KB). Nenhum WebP/AVIF.
- Várias `<img>` sem `width`/`height` explícitos → causa CLS.
- `SponsorsMarquee` usa `loading="eager"` mas fica logo abaixo da dobra.
- Fontes Montserrat carregadas via `@import url(...)` dentro do CSS, sem `preconnect` — bloqueia até o CSS baixar, atrasa primeiro paint.
- `__root.tsx` já tem preconnect do Supabase; falta dos Google Fonts.
- Code-splitting do home já está bom (Suspense + lazy); rota `/` já preload do hero.

## Mudanças

### 1. Conversão de imagens para WebP via `vite-imagetools`

- Instalar `vite-imagetools` e habilitar no `vite.config.ts` (passando via `vite.plugins`).
- Atualizar imports das imagens estáticas em `src/assets` para usar `?format=webp&quality=78` (com fallback `?as=picture` quando precisarmos de srcset). Imagens afetadas:
  - `hero-runner.jpg` — hero do home (LCP)
  - `informacoes-corrida.jpg`, `kit-exclusivo.png`, `percurso-mapa.png`, `capa-video-lancamento.jpg`
  - `logo-corrida.png`, `logo-corrida-login.png`
  - `src/assets/sponsors/*.png`
- Para o hero, usar `?w=800;1280;1920&format=webp&as=srcset` e renderizar `<img srcset sizes="100vw">` para evitar baixar 1920px no mobile.

### 2. Estabilidade de layout (CLS)

Adicionar `width` e `height` explícitos (proporção real do PNG/JPG) em todos os `<img>` listados:

- `src/components/site/header/header-logo.tsx`
- `src/components/site/footer.tsx`
- `src/routes/login.tsx` (logo já adicionada)
- `src/components/home/home-info-corrida.tsx`, `home-kit.tsx`, `home-percurso.tsx`, `home-cta-video.tsx`, `home-patrocinadores.tsx`
- `src/components/site/sponsors-marquee.tsx`
- `src/routes/kit.tsx`, `percurso.tsx`, `patrocinadores.tsx`, `galeria.tsx`

### 3. Lazy-loading e prioridades corretas

- `src/components/site/sponsors-marquee.tsx`: trocar `loading="eager"` por `loading="lazy"` (está abaixo do hero).
- Manter `fetchPriority="high"` apenas no hero do home; remover de quaisquer outras imagens não-LCP (apenas conferir).
- Adicionar `loading="lazy"` + `decoding="async"` nas imagens dos administradores (`admin.patrocinadores.tsx`, `admin.galeria.tsx`).

### 4. Preconnect e fontes

- Mover o `@import` do Google Fonts de `src/styles.css` para `__root.tsx > head().links` como `<link rel="preconnect">` para `fonts.googleapis.com` e `fonts.gstatic.com` (crossOrigin) + `<link rel="stylesheet" href="...Montserrat...&display=swap">`. Isso libera o CSS de bloqueio em cascata e mantém `font-display: swap`.
- Manter charset/viewport como estão.

### 5. Preload do LCP (ajuste)

- Após a conversão, o `links: [{ rel: "preload", as: "image", href: heroRunner }]` na rota `/` passa a apontar para o WebP gerado e ganha `imagesrcset`/`imagesizes` alinhados ao `<img>` real do hero, para casar o preload com o recurso usado.

### 6. Hint de renderização para seções fora da dobra

- Adicionar utilitária `.cv-auto { content-visibility: auto; contain-intrinsic-size: 1px 800px; }` em `src/styles.css` e aplicar nas seções pesadas abaixo da dobra (`HomeKit`, `HomeCronograma`, `HomeCtaVideo`, `HomePercurso`, `HomePatrocinadores`, `HomeFaq`). Reduz custo de pintura/layout inicial sem afetar SEO (apenas pula trabalho de renderização para fora da viewport).

## Fora do escopo

- Imagens do Supabase Storage (galeria/patrocinadores dinâmicos): manter como estão; otimização exigiria pipeline de transformação no servidor.
- Refatorar code-splitting de rotas (TanStack já faz automaticamente).
- Substituir favicon/OG image.
- Mudanças visuais.

## Detalhes técnicos

- `vite-imagetools` roda em build time, gera arquivos com hash e respeita o cache do CDN. Sem custo em runtime.
- O `?as=srcset` retorna uma string `"url 800w, url 1280w, url 1920w"` direta para o atributo `srcset`.
- `content-visibility: auto` + `contain-intrinsic-size` é seguro para conteúdo já presente no DOM (não afeta crawler indexável — apenas adia layout/paint).
- Self-hospedar Montserrat (`@fontsource/montserrat`) seria ainda melhor, mas fica fora do escopo para limitar a superfície da mudança.
