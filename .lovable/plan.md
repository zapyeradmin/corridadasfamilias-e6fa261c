## Correções na página /admin/dashboard

### 1. Corrigir "Receita confirmada" (bug)
**Problema:** o cálculo soma todos os registros da tabela `payments` com `status = paid`. No banco existem 2 pagamentos marcados como `paid` (R$ 68 + R$ 68 = R$ 136), mas apenas 1 inscrição está realmente `paid`. O outro pagamento ficou dessincronizado da inscrição correspondente.

**Correção:** em `src/lib/admin.functions.ts` (server function `getDashboardKPIs`), passar a calcular a receita confirmada somando `amount_cents` das **inscrições** com `status = 'paid'`, e não dos pagamentos. Assim a regra fica: "Receita confirmada = soma das inscrições pagas", exatamente como o usuário pediu.

```text
revenueCents = sum(registrations.amount_cents WHERE status = 'paid')
```

### 2. Remover botão "SAIR" do header (apenas no header)
Em `src/components/site/header/desktop-nav.tsx` e `src/components/site/header/mobile-menu.tsx`, remover o botão/ícone "Sair". O botão "Sair" da barra lateral do admin (`src/routes/_authenticated/admin.tsx`) é mantido como única forma de logout para usuários autenticados.

### 3. Melhorar o design da barra lateral do admin
Em `src/routes/_authenticated/admin.tsx`:
- Cartão lateral com gradiente sutil, borda mais refinada e sombra suave
- Cabeçalho "Administração" com divisor decorativo
- Ícones lucide-react em cada item (Dashboard, Inscrições, Pagamentos, Eventos, Patrocinadores, Galeria, Configurações, Logs)
- Item ativo com indicador lateral (barra vertical) + gradiente laranja já existente
- Hover states mais polidos com transição de cor e leve translate
- Separador antes do botão "Sair", com ícone alinhado e tipografia consistente

### 4. Lista "Últimas inscrições" com até 10 itens + paginação centralizada
Em `src/lib/admin.functions.ts` (`getDashboardKPIs`): aumentar o limit do "recent" de 5/10 para suportar paginação por blocos de 10 — manteremos o fetch atual de 10 e a paginação será **client-side** sobre esses 10 itens (1 página) **ou** expandiremos para retornar até 50 itens dividindo em páginas de 10. Proposta: retornar até **50 últimas inscrições** e paginar client-side em páginas de 10.

Em `src/routes/_authenticated/admin.dashboard.tsx`:
- Renderizar 10 itens por página
- Paginação **centralizada** abaixo da tabela com:
  - ícone `ChevronLeft` (desabilitado na página 1)
  - número da página atual (editável — usuário pode digitar e dar Enter para pular)
  - ícone `ChevronRight` (desabilitado na última página)
- Estado local `page` com `useState`

### Arquivos a editar
- `src/lib/admin.functions.ts` — corrigir cálculo de receita + aumentar limit de recent para 50
- `src/components/site/header/desktop-nav.tsx` — remover Sair
- `src/components/site/header/mobile-menu.tsx` — remover Sair
- `src/routes/_authenticated/admin.tsx` — redesign da sidebar com ícones
- `src/routes/_authenticated/admin.dashboard.tsx` — paginação centralizada com input editável

### Fora de escopo
- Não vou reconciliar/limpar os dados existentes na tabela `payments` (o pagamento órfão fica como está; a métrica passa a ser baseada em `registrations`, que é a fonte de verdade pedida pelo usuário).
