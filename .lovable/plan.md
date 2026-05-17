## Diagnóstico

O preview ainda registra erros de servidor informando ausência de `SUPABASE_SERVICE_ROLE_KEY`. A página `/` responde HTTP 200, mas o iframe do preview pode cair quando alguma chamada de servidor inicializa o cliente admin sem essa variável disponível no runtime local.

O ponto crítico encontrado é `src/lib/registrations.functions.ts`, que importa `supabaseAdmin` e exige `SUPABASE_SERVICE_ROLE_KEY` para criar/consultar inscrições. Já as leituras públicas em `src/lib/public.functions.ts` foram migradas para a chave publicável.

## Plano de correção

1. **Endurecer o cliente público do Supabase**
   - Ajustar `src/lib/public.functions.ts` para validar `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY` com erro controlado.
   - Evitar falhas inesperadas caso alguma variável pública esteja ausente.

2. **Remover dependência de service role da inscrição pública**
   - Alterar `src/lib/registrations.functions.ts` para usar um cliente Supabase com `SUPABASE_PUBLISHABLE_KEY` nas operações públicas de inscrição.
   - Manter validação do CPF e regras atuais de evento/lote/duplicidade.
   - As escritas em `registrations` e `payments` passarão a depender das políticas RLS corretas para permitir inserção pública segura.

3. **Corrigir aviso de React que aparece no console**
   - Trocar `fetchpriority` por `fetchPriority` no preload/render da imagem do hero em `src/routes/index.tsx`, pois o console mostra esse erro de propriedade DOM inválida.

4. **Validar o resultado**
   - Reabrir `/` no preview e conferir se o site carrega.
   - Conferir logs do servidor para garantir que o erro `Missing Supabase environment variable(s): SUPABASE_SERVICE_ROLE_KEY` não aparece mais ao carregar a página.

## Observação técnica

Se as políticas RLS atuais não permitirem inserir inscrições/pagamentos com a chave publicável, a página carregará, mas o envio do formulário poderá falhar. Nesse caso, a próxima correção deve ser ajustar as políticas RLS com segurança para permitir apenas os inserts necessários e não expor dados sensíveis.