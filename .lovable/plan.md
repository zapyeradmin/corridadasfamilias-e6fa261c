## Corrigir sobreposição no menu mobile/tablet

### Problema
No `SiteHeader` (`src/components/site/header.tsx`), os 3 elementos decorativos absolutos (gradiente principal + dois "glow" radiais) estão posicionados em `absolute inset-0` no `<header>`. Como o painel do menu mobile é renderizado dentro do mesmo `<header>` (que cresce em altura quando aberto), esses overlays cobrem também a área do menu, deixando os links com cor lavada e baixa legibilidade.

### Solução
Mover os 3 `<div aria-hidden>` decorativos para dentro do container da barra superior (`<div className="relative mx-auto flex ...">`), de modo que fiquem confinados à altura da topbar e não se estendam pelo painel do menu quando aberto.

Manter o painel do menu mobile com `bg-[color:var(--color-brand-dark)]` sólido (já é) e adicionar `relative z-10` para garantir que não receba nenhuma sobreposição residual.

### Arquivos
- `src/components/site/header.tsx`: reorganizar estrutura JSX dos overlays decorativos.

### Detalhes técnicos
1. Remover os 3 `<div aria-hidden>` decorativos que ficam soltos como filhos diretos do `<header>`.
2. Reinseri-los dentro do `<div className="relative mx-auto flex ...">` (a topbar), antes do `<Link>` do logo, mantendo `pointer-events-none absolute inset-0` (agora relativo à topbar, não ao header inteiro).
3. Adicionar `relative z-10` ao painel do menu mobile para reforçar a ordem de empilhamento.
4. Não alterar comportamento, animação ou conteúdo do menu.
