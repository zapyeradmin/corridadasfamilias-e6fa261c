## Objetivo

Substituir a logo atual do cabeçalho (atualmente um círculo laranja com "II") pela logo oficial em PNG enviada (`logodacorridaparaosite.png`) e remover o texto "09 de agosto de 2026 · Serra Talhada/PE".

## Arquivos afetados

- `src/components/site/header/header-logo.tsx` — única edição de componente.
- `src/assets/logo-corrida.png` — novo arquivo (copiado de `user-uploads://logodacorridaparaosite.png`).

## Mudanças

1. **Copiar a logo** para `src/assets/logo-corrida.png` (import ES6 com bundling/otimização do Vite).
2. **Editar `header-logo.tsx`:**
   - Remover o `<span>` com o "II" laranja.
   - Remover o bloco de texto `Corrida das Famílias` + `09 de agosto de 2026 · Serra Talhada/PE`.
   - Renderizar `<img src={logo} alt="II Corrida das Famílias" />` dentro do `<Link to="/">`.
   - Altura responsiva: `h-10 md:h-12` (mantém proporção do header atual, que tem `py-4`). A logo é horizontal e larga (~4:1), então a largura ficará confortável no desktop e ainda legível no mobile.
   - Manter `loading="eager"` e `decoding="async"` já que está acima da dobra.

## Fora do escopo

- Outras ocorrências da logo (footer, hero, favicon, OG image) — o pedido foi apenas o header.
- Mudanças no fundo roxo do header ou em qualquer outro componente.
