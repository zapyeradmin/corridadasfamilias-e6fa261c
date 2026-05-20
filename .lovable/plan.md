## Exclusão de páginas não utilizadas

### 1. Admin · Eventos & Lotes
- Excluir `src/routes/_authenticated/admin.eventos.tsx`.
- Remover o item `{ to: "/admin/eventos", label: "Eventos & Lotes", icon: CalendarRange }` da constante `NAV` em `src/routes/_authenticated/admin.tsx`.
- Remover o import `CalendarRange` de `lucide-react` no mesmo arquivo.

### 2. Galeria (admin e pública)
- Excluir `src/routes/_authenticated/admin.galeria.tsx`.
- Remover o item `{ to: "/admin/galeria", label: "Galeria", icon: ImageIcon }` do `NAV` em `src/routes/_authenticated/admin.tsx` e remover o import `Image as ImageIcon`.
- Excluir `src/routes/galeria.tsx`.
- Remover o link "Galeria" do header público:
  - Verificar `src/lib/site-config.ts` (`NAV_LINKS`) e remover a entrada da Galeria — isso já limpa o desktop nav e o menu mobile.
- Remover a função server `listGalleryAdmin` de `src/lib/admin.functions.ts` (não terá mais consumidores) e `getPublishedGallery` de `src/lib/public.functions.ts`, se não forem usadas em outro lugar (verificar antes via busca).

### Notas técnicas
- `src/routeTree.gen.ts` é regenerado automaticamente pelo plugin Vite — não editar manualmente.
- Tabelas do banco (`gallery`, `events`, `lots`) não serão alteradas; apenas a UI é removida.
- Não tocar em outras páginas administrativas.
