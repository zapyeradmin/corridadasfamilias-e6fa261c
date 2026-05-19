# Remover opção "Prefiro não informar" do gênero

Atualmente o gênero aceita `male | female | other` no app e `M | F | O` no banco. Nenhuma inscrição existente usa `O` (0 registros), então é seguro remover.

## Mudanças

### 1. Migration (Supabase)
- Recriar o enum `public.gender` apenas com `'M'` e `'F'` (removendo `'O'`).
- Como o Postgres não permite `ALTER TYPE ... DROP VALUE`, fazer:
  1. Renomear o enum atual para `gender_old`.
  2. Criar novo enum `gender` com `('M','F')`.
  3. `ALTER TABLE registrations ALTER COLUMN gender TYPE gender USING gender::text::gender`.
  4. `DROP TYPE gender_old`.

### 2. Validação server-side — `src/lib/registrations.functions.ts`
- Trocar `z.enum(["male", "female", "other"])` por `z.enum(["male", "female"])`.
- Atualizar `GENDER_DB` para `{ male: "M", female: "F" }`.

### 3. Formulário de inscrição — `src/routes/inscricao.tsx`
- Atualizar o schema Zod do form: `gender: z.enum(["male", "female"], ...)`.
- Remover a `<option value="other">Prefiro não informar</option>` do select de Gênero.

### 4. Admin (`src/routes/_authenticated/admin.inscricoes.$id.tsx`)
- Apenas exibe `r.gender` (texto bruto vindo do banco). Nenhuma mudança necessária — continuará mostrando `M` ou `F`.

## Notas
- Como não há inscrições com gênero `O`, a migração não terá perda de dados.
- O arquivo `src/integrations/supabase/types.ts` é auto-gerado — será atualizado automaticamente após a migração.