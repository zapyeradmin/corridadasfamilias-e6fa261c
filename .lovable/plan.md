Diagnóstico do teste:

- O login como admin funcionou quando os dois campos foram enviados preenchidos.
- A requisição do Supabase `/auth/v1/token?grant_type=password` retornou `200`.
- A URL mudou para `/admin/dashboard`, então o usuário passou pelo guard de admin.
- O erro `postMessage` do `lovable.js` é do script do Lovable Preview e não é o bloqueador do login.
- O `400` que apareceu no Supabase foi uma tentativa com e-mail vazio (`missing email or phone`).
- O problema real restante é que o dashboard entra, mas fica em `Carregando…` porque as server functions retornam: `Missing Supabase environment variable(s): SUPABASE_SERVICE_ROLE_KEY`.

Plano de correção:

1. Corrigir o acesso aos dados administrativos
   - Atualizar `src/lib/admin.functions.ts` para não depender do `supabaseAdmin` quando a `SUPABASE_SERVICE_ROLE_KEY` não estiver disponível no preview.
   - Manter a validação server-side de admin usando o usuário autenticado e RLS, sem expor chave privada no frontend.
   - Trocar consultas administrativas de leitura para o cliente Supabase autenticado recebido pelo `requireSupabaseAuth`, que já respeita as policies `has_role(auth.uid(), 'admin')`.

2. Preservar segurança do painel
   - Continuar exigindo sessão autenticada via `requireSupabaseAuth`.
   - Continuar validando a role `admin` no servidor antes das consultas.
   - Não mover roles para `profiles` ou metadata; manter `user_roles` como tabela separada.

3. Melhorar o estado de erro no dashboard
   - Se alguma server function falhar, mostrar uma mensagem clara em vez de deixar `Carregando…` indefinidamente.
   - Manter a navegação admin existente.

4. Validar novamente
   - Refazer login admin.
   - Confirmar `/auth/v1/token` com status `200`.
   - Confirmar `/admin/dashboard` carregando métricas ou mensagem útil.
   - Confirmar que as chamadas `_serverFn` não retornam mais erro de variável ausente.