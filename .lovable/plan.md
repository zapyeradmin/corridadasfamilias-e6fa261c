## Plano para corrigir o acesso ao admin

Pelo que já foi verificado:
- O login no Supabase está funcionando.
- O usuário `c82fbe1f-f164-4518-80e8-4d94fc80aa05` já possui o papel `admin` em `public.user_roles`.
- As permissões da função `has_role` estão concedidas para `authenticated` e `anon`.
- A árvore de rotas agora registra `/admin/dashboard` corretamente.

O problema mais provável está no fluxo do frontend: após o login, a navegação acontece antes de a sessão do Supabase estar totalmente refletida no roteador/guard, ou o guard admin redireciona silenciosamente para `/` quando a consulta de papel ainda não retorna o admin.

## Alterações propostas

1. **Fortalecer o login**
   - Após `signInWithPassword`, buscar explicitamente o usuário com `supabase.auth.getUser()`.
   - Invalidar o roteador antes de navegar para `/admin/dashboard`.
   - Usar `replace: true` para evitar voltar ao formulário com sessão antiga.

2. **Corrigir o guard do admin**
   - No `beforeLoad` de `/admin`, diferenciar falha de autenticação, falha de consulta e ausência real de permissão.
   - Se o usuário estiver logado, aguardar a sessão e consultar `user_roles` de forma confiável.
   - Em caso de erro na consulta de papel, não redirecionar silenciosamente para a home; mostrar erro útil ou enviar para login/admin conforme apropriado.

3. **Evitar dependência excessiva de consulta client-side para papel admin**
   - Manter a validação forte nos server functions via `assertAdmin` com `supabaseAdmin`.
   - Usar a consulta client-side apenas como guard de navegação, com tratamento de erro melhor.

4. **Verificação final**
   - Conferir que `/admin/dashboard` abre depois do login.
   - Conferir que usuário sem papel admin continua bloqueado.
   - Conferir logs/console se ainda houver redirecionamento inesperado.