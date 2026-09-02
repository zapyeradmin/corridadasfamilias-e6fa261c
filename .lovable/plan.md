# Migração para o Supabase próprio (2corridanatalina)

Objetivo: entregar um pacote SQL completo que recria todo o backend (schema, enums, funções, triggers, RLS, grants, storage, dados) no seu projeto `2corridanatalina`, e apontar o app para ele.

## O que existe hoje no backend atual

Levantamento feito agora no banco em uso:

| Tabela | Linhas |
|---|---|
| events | 1 |
| lots | 1 |
| sponsors | 4 |
| settings | 5 |
| registrations / payments / access_logs / infinitepay_events / gallery_items / user_roles | 0 |

Storage: buckets `gallery`, `sponsors`, `home-video` existem, porém **sem nenhum arquivo** (0 objetos). As logos hoje exibidas no site vêm de arquivos do repositório (`src/assets/sponsors/*`), não do Storage.

Consequência prática: a migração de dados é pequena e não há arquivos de Storage para copiar deste backend. Se existirem arquivos no projeto Supabase antigo (`ljquyrrprrwqpmaomwsh`), preciso das credenciais dele para copiar — ver "O que preciso de você".

## Entrega

### 1. Arquivo `supabase/export/2corridanatalina.sql`

Um único script idempotente, para colar no SQL Editor do seu projeto, na ordem:

1. Enums: `app_role`, `registration_status`, `payment_status`, `gender`, `shirt_size`
2. Funções: `has_role`, `normalize_cpf`, `set_registration_cpf_normalized`, `update_updated_at_column`
3. Tabelas: `events`, `lots`, `registrations`, `payments`, `sponsors`, `gallery_items`, `settings`, `access_logs`, `infinitepay_events`, `user_roles` (com defaults, FKs e índices)
4. GRANTs para `anon`, `authenticated`, `service_role` conforme as policies
5. `ENABLE ROW LEVEL SECURITY` + todas as policies atuais
6. Triggers de `updated_at` e de normalização de CPF
7. Realtime: `sponsors` na publicação `supabase_realtime`
8. Policies de `storage.objects` para `gallery`, `sponsors`, `home-video`
9. `INSERT` com todos os dados atuais (evento, lote, 4 patrocinadores, 5 settings incluindo os links InfinitePay da conta `ii-corrida-das-familias`), usando `ON CONFLICT DO NOTHING`

### 2. Arquivo `supabase/export/README-migracao.md`

Passo a passo: criar os 3 buckets no painel do seu projeto (`gallery`, `sponsors`, `home-video`), rodar o SQL, criar o usuário admin e inserir a linha em `user_roles` com o UUID desse usuário, e conferir a checklist.

### 3. Apontar o app para o seu Supabase

O app passa a ler as credenciais de variáveis de ambiente, com fallback para os valores atuais:

- Cliente do navegador: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`
- Servidor / server functions: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

Atualizo `.env.example`, `.env.production.example` e `DEPLOY-VPS.md` com as chaves do seu projeto, para você preencher o `.env` da VPS e rodar `./deploy.sh`.

Observação: o Lovable Cloud continua ativado neste projeto (não é possível desativá-lo). No preview da Lovable o app segue usando o backend Cloud; na VPS, com o `.env` preenchido, ele usa o **seu** Supabase.

## Detalhes técnicos

- O SQL é gerado a partir das 19 migrations em `supabase/migrations/` já consolidadas, mais um dump dos dados atuais lido por `psql`, sem `INSERT INTO storage.buckets` (buckets são criados pelo painel).
- Seeds de `user_roles` do histórico usam um UUID de usuário que não existe no seu projeto; ficam comentados no script, com instrução para substituir pelo UUID do seu admin.
- Nenhuma alteração de lógica de negócio; apenas configuração de credenciais e geração dos artefatos de migração.

## O que preciso de você

1. **Project URL** e **anon/publishable key** do projeto `2corridanatalina` (podem ser públicas).
2. **Service role key** — envie apenas quando eu pedir, para eu armazenar como secret; ela não vai para o código.
3. Se houver arquivos no Storage do projeto Supabase antigo que precisem ser copiados: URL + service role key desse projeto antigo. Caso contrário, os buckets nascem vazios e os uploads são refeitos pelo admin.
