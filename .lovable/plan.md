Refatoração ampla focada em **organização** e **performance**, sem alterar layout, conteúdo ou comportamento.

## 1. Quebrar `src/routes/index.tsx` (903 linhas)

Hoje o home concentra hero, pilares, vídeo, timeline, kit, percurso, premiação, FAQ, patrocinadores e CTA em um único arquivo. Vamos extrair cada seção para `src/components/home/`:

```text
src/components/home/
  home-hero.tsx
  home-pilares.tsx
  home-video.tsx
  home-timeline.tsx
  home-kit-exclusivo.tsx
  home-percurso.tsx
  home-premiacao.tsx
  home-faq.tsx
  home-sponsors.tsx
  home-cta-final.tsx
  data.ts           # PILARES, TIMELINE e demais constantes
```

`src/routes/index.tsx` passa a ser ~80 linhas: `Route` (head + loader de prefetch dos sponsors) + `HomePage` montando as seções na ordem atual. Sem mudança visual.

## 2. Lazy-load das seções abaixo da dobra

No `index.tsx`, `HomeHero` e `HomePilares` ficam síncronos (acima da dobra). As demais seções usam `React.lazy` + `<Suspense fallback={null}>` para tirar peso do bundle inicial e melhorar LCP/TBT. As animações `framer-motion` que só aparecem ao rolar ficam dentro dos chunks lazy.

## 3. Consertar metadata duplicada em `__root.tsx`

O `head()` da raiz tem `title`, `og:title`, `og:description`, `twitter:*` declarados **duas vezes** (linhas 84–102). Vamos manter um único bloco canônico (o segundo, mais completo) e remover os duplicados. Resolve avisos de SEO sem mudar o que aparece nas redes.

## 4. Padronizar imports de imagem com `?url` e dimensões

Em `index.tsx`, `inscricao.tsx`, `sucesso.tsx`, `falhanopagamento.tsx`:
- Garantir `width`/`height` em todos os `<img>` (evita CLS).
- `loading="lazy"` + `decoding="async"` em tudo que **não** é LCP.
- Manter `fetchPriority="high"` apenas no hero.

## 5. Extrair helpers compartilhados

- `formatBRL` e `formatCPF` já estão em `src/lib/cpf.ts` e `src/lib/format.ts`. Conferir e consolidar em `src/lib/format.ts` (única fonte). Atualizar imports em `inscricao.tsx`, `inscricao_.sucesso.tsx`, `pagamento.tsx`, admin.
- Criar `src/components/ui/primary-button.tsx` para o botão "gradient-orange" usado em ~10 lugares com a mesma classe gigante repetida (apenas wrapper visual; nada de lógica nova).

## 6. React Query — defaults globais

Em `src/router.tsx`, configurar `defaultOptions` no `QueryClient`:
```ts
{ queries: { staleTime: 60_000, gcTime: 5 * 60_000, refetchOnWindowFocus: false, retry: 1 } }
```
Reduz refetches desnecessários (sponsors, registration lookup).

## 7. Limpar artefatos e cache

- Remover `src/routes/inscricao.sucesso.tsx` se ainda houver referência stale no `routeTree.gen.ts` (deixar o Vite regenerar).
- Rodar limpeza de cache de dev: apagar `node_modules/.vite` e `.tanstack` antes de reiniciar o dev server.
- Sem `bun install`/build manual — o harness reconstrói.

## 8. O que **NÃO** será alterado

- Schemas Supabase / migrations.
- `registrations.functions.ts`, `admin.functions.ts`, `public.functions.ts` (lógica de servidor).
- Estrutura de rotas (URLs continuam idênticas).
- Design tokens em `styles.css`.
- Integração de pagamento (continua o placeholder atual).

## Resultado esperado

- `index.tsx`: 903 → ~80 linhas.
- Bundle inicial menor (seções abaixo da dobra viram chunks separados).
- LCP mais rápido (menos JS na rota `/`).
- SEO sem tags duplicadas.
- Código mais fácil de manter, sem mudanças visuais para o usuário.
