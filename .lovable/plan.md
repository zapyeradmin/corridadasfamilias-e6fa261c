# Logout acessível e redirect para home

## Problema
Hoje o botão "Sair" só existe na sidebar do `/admin`. Usuários autenticados que não são admin (ou que estão fora do painel) não têm como deslogar pela interface. Além disso, queremos garantir que ao sair o usuário sempre vá para `/`.

## Mudanças

### 1. `src/components/site/header.tsx`
- Acompanhar o estado de sessão (já existe um `onAuthStateChange` para detectar admin) e expor também `isAuthenticated`.
- Quando autenticado:
  - Desktop: mostrar botão "Sair" ao lado do badge Admin (ícone `LogOut`).
  - Mobile: adicionar item "Sair" no menu lateral.
- Ação de sair:
  1. `await supabase.auth.signOut()`
  2. `router.invalidate()` + `queryClient.clear()` (limpar caches autenticados)
  3. `navigate({ to: "/", replace: true })`
  4. `toast.success("Você saiu da conta.")`
- Fechar o menu mobile após sair.

### 2. `src/routes/_authenticated/admin.tsx`
- Ajustar a função `logout` existente para:
  - Usar `navigate({ to: "/", replace: true })` (já vai para `/`, apenas confirmar `replace`).
  - Adicionar toast de confirmação para feedback visível.
  - Manter `router.invalidate()` para que o guard de `_authenticated` reavalie e não mantenha telas em cache.

### 3. Sem mudanças de backend
Nenhuma alteração de RLS, migrations ou server functions. Apenas UI/estado de cliente.

## Verificação
- Logar com a conta admin → ver botão "Sair" no header → clicar → deve ir para `/` e o badge Admin some.
- Tentar acessar `/admin/dashboard` após sair → redireciona para `/login` (guard `_authenticated` já cuida).
- Repetir o fluxo no menu mobile (viewport <1024px).
