## Problema

Os links da InfinitePay salvos em **Admin → Configurações** somem ao recarregar a página.

**Causa raiz:** A tabela `public.settings` tem RLS habilitada, mas só existe policy de `SELECT`. Não há policy de `UPDATE`, então o `update()` feito pelo `updateSettingAdmin` é silenciosamente bloqueado pelo RLS (0 linhas afetadas, sem erro retornado). As linhas `infinitepay_checkout_adulto_url` e `infinitepay_checkout_crianca_url` existem no banco, mas continuam com `value` vazio.

## Correção

### 1. Migração — adicionar policies de escrita em `settings`

Criar policies de `UPDATE` e `INSERT` restritas a admins:

```sql
CREATE POLICY "Admins can insert settings"
  ON public.settings FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update settings"
  ON public.settings FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
```

### 2. Endurecer `updateSettingAdmin` (defesa em profundidade)

Em `src/lib/admin.functions.ts`:
- Trocar `.update(...).eq("key", data.key)` por `.upsert(..., { onConflict: "key" })` para que, se a linha não existir, ela seja criada (e marcada `is_public: true` quando for chave de checkout).
- Adicionar `.select()` ao final e validar que ao menos 1 linha foi retornada; caso contrário, lançar erro explícito (em vez de "ok" silencioso). Isso evita que problemas de RLS futuros voltem a falhar em silêncio.

### 3. Após aprovação da migração

Você poderá salvar novamente os dois links em **Admin → Configurações**:

- Adulto: `https://checkout.infinitepay.io/patricia-luciana-7b3/5L9Nn6VwPN`
- Criança: `https://checkout.infinitepay.io/patricia-luciana-7b3/gsbcwuLy2N`

E eles persistirão. Posso também já gravá-los diretamente via SQL como parte da mesma migração, se preferir — me avise.

## Fora do escopo

- Nenhuma alteração no front-end de Configurações (o formulário já está correto).
- Nenhuma alteração no webhook ou no fluxo `/pagamento`.
