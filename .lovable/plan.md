# Refatoração, Performance e Documentação

## Objetivos
1. Refatorar código e organização de arquivos seguindo boas práticas.
2. Otimizar carregamento (mais rápido e leve).
3. Criar `DESENVOLVIMENTO.md` documentando tudo que foi feito até agora.

---

## 1. Organização e Refatoração de Código

### Header (`src/components/site/header.tsx`)
- Extrair sub-componentes: `HeaderLogo`, `DesktopNav`, `MobileMenu`, `HeaderDecorations`.
- Mover hook de auth/admin para `src/hooks/use-auth.ts` (reutilizável em outras páginas).
- Reduzir className longos com `cva` ou constantes.

### Estrutura de pastas
- Criar `src/components/site/header/` com os sub-componentes acima.
- Criar `src/hooks/use-auth.ts` e `src/hooks/use-admin-role.ts`.
- Consolidar utilitários de UI repetidos (gradientes, badges) em `src/components/ui/` quando fizer sentido.
- Garantir que todos tokens de cor estejam em `src/styles.css` (remover hex inline restantes no header — `#2a0f4a` vira token `--color-brand-dark` ou `--color-header-bg`).

### Server functions
- Revisar `src/lib/public.functions.ts`, `admin.functions.ts`, `registrations.functions.ts` para garantir uso consistente de `inputValidator` com Zod onde houver entrada do cliente.

### Limpeza
- Remover imports não utilizados.
- Padronizar nomes de arquivos (kebab-case já está em uso).
- Remover `.lovable/plan.md` (artefato de planejamento, não pertence ao repo de runtime).

---

## 2. Otimização de Performance

### Code-splitting
- Garantir que componentes de rota não estejam exportados (TanStack auto code-split).
- Avaliar `.lazy.tsx` para rotas admin pesadas (`admin.dashboard`, `admin.inscricoes`, `admin.galeria`, etc.) — admin não precisa entrar no bundle público.

### Imagens
- Converter imagens grandes em `src/assets/` para `.webp`/`.avif` via `?format=webp` (vite-imagetools) onde aplicável.
- Adicionar `loading="lazy"` e `decoding="async"` em imagens fora do hero.
- Definir `width`/`height` explícitos para evitar CLS.
- Adicionar `<link rel="preload" as="image">` na rota `/` para a imagem LCP via `head().links`.

### Fontes
- Verificar `src/styles.css` — usar `font-display: swap` em todas `@font-face`.
- Preconnect para domínios de fontes externas se houver.

### Queries / Data
- React Query: definir `staleTime` adequado em queries públicas (`getActiveEvent`, `getPublishedSponsors`, `getPublishedGallery`) para reduzir refetches.
- Usar `loader` em rotas públicas para SSR de dados (quando server fn não exigir auth).

### Bundle
- Auditar imports do `lucide-react` — já usa import por nome (tree-shake ok).
- Remover componentes shadcn não utilizados de `src/components/ui/` (decisão conservadora — só remover os comprovadamente não importados em nenhum arquivo).

### Meta / SEO (afeta perceived performance)
- Garantir `head()` com title/description únicos por rota.

---

## 3. `DESENVOLVIMENTO.md`

Arquivo na raiz do projeto, em português, registrando o histórico do desenvolvimento:

Seções:
1. **Visão geral do projeto** — II Corrida das Famílias, stack (TanStack Start, React 19, Vite 7, Tailwind v4, Supabase via Lovable Cloud).
2. **Arquitetura** — file-based routing, server functions, autenticação, RLS.
3. **Modelo de dados** — tabelas (`events`, `lots`, `registrations`, `sponsors`, `gallery_items`, `settings`, `user_roles`) com descrição.
4. **Funcionalidades implementadas**:
   - Site público: Home, Percurso, Kit, Premiação, Patrocinadores, Galeria, FAQ, Regulamento, Política de Privacidade.
   - Inscrição e página de sucesso.
   - Login / Reset password.
   - Painel admin: dashboard, inscrições, pagamentos, eventos & lotes, patrocinadores, galeria, configurações, logs.
5. **Design system** — tokens em `src/styles.css`, gradientes (`gradient-orange`, `gradient-hero`), tipografia, cores brand.
6. **Header** — evolução: alinhamento, menu mobile sem sobreposição, gradiente uniforme em desktop.
7. **Refatoração desta etapa** — listagem do que foi reorganizado/otimizado.
8. **Performance** — medidas aplicadas (code-split admin, lazy images, preload LCP, staleTime).
9. **Como rodar** — comandos básicos.
10. **Próximos passos sugeridos**.

---

## Arquivos a criar
- `DESENVOLVIMENTO.md`
- `src/hooks/use-auth.ts`
- `src/components/site/header/header-logo.tsx`
- `src/components/site/header/desktop-nav.tsx`
- `src/components/site/header/mobile-menu.tsx`
- `src/components/site/header/header-decorations.tsx`
- Possíveis `*.lazy.tsx` para rotas admin.

## Arquivos a editar
- `src/components/site/header.tsx` (vira composição dos sub-componentes)
- `src/styles.css` (novo token de cor para header bg)
- `src/routes/index.tsx` (preload LCP, lazy imgs)
- `src/lib/public.functions.ts` (revisão)
- Rotas admin (mover componente para `.lazy.tsx` quando aplicável)

## Confirmações antes de implementar
1. Posso mover rotas admin para `.lazy.tsx` (afeta como o bundle é dividido, sem mudar comportamento)?
2. Posso converter imagens em `src/assets/` para WebP via `vite-imagetools`?
3. Devo remover `.lovable/plan.md`?
