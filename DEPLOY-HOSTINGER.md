# Deploy na Hostinger Web App Node.js

Guia passo a passo para colocar `www.corridadasfamilias.com.br` no ar usando a hospedagem **Web App Node.js** da Hostinger, com sincronização via GitHub.

---

## ⚠️ Status atual (leia antes de começar)

**Concluído nesta etapa:**
- ✅ Edge Function `infinitepay-webhook` criada (substitui o webhook que rodava no servidor TanStack)
- ✅ Script `build:hostinger` adicionado ao `package.json`
- ✅ Variáveis de ambiente documentadas em `.env.example`
- ✅ `redirect_url` da InfinitePay já usa `PUBLIC_SITE_URL` (configurável)

**Pendente (precisa ser feito em iteração separada por ser refactor amplo):**
- ⏳ Migrar `createServerFn` para chamadas diretas ao Supabase no cliente
  (arquivos `src/lib/admin.functions.ts`, `registrations.functions.ts`,
  `public.functions.ts`, `infinitepay.functions.ts` e todos os componentes
  que usam `useServerFn`)

> Sem esse refactor, ao hospedar como SPA na Hostinger, as páginas de admin,
> inscrição e pagamento **não vão conseguir ler/escrever no banco** porque
> `vite preview` não executa server functions do TanStack Start.
>
> **Recomendação honesta:** se você precisa do site no ar AGORA, use o
> caminho rápido — manter na Lovable e conectar `www.corridadasfamilias.com.br`
> em **Project Settings → Domains** (resolve em ~10min). Tudo continua
> funcionando sem refactor.

---

## Opção A — Caminho rápido (Lovable + domínio próprio) ✅ Recomendado

1. No editor Lovable: **Project Settings → Domains → Connect domain**
2. Digite `corridadasfamilias.com.br` e `www.corridadasfamilias.com.br`
3. No painel do Registro.br, configure:
   - **A** `@` → `185.158.133.1`
   - **A** `www` → `185.158.133.1`
   - **TXT** `_lovable` → valor mostrado pelo Lovable
4. Aguarde propagação (15min - 72h). SSL é provisionado automaticamente.
5. Webhook InfinitePay continua em `https://corridadasfamilias.lovable.app/api/webhooks/infinitepay` (ou troque para a nova Edge Function — veja seção 6 abaixo).

**Fim.** Tudo funciona.

---

## Opção B — Hostinger Web App Node.js (SPA)

### 1. Concluir o refactor pendente

Não execute os passos abaixo enquanto os `createServerFn` ainda não tiverem
sido migrados para chamadas diretas ao Supabase. Sintoma se você prosseguir
agora: tela de admin abre, mas listas ficam vazias e ações dão erro.

### 2. Conectar projeto ao GitHub

1. Lovable → menu **+** (canto inferior esquerdo do chat) → **GitHub** → **Connect project**
2. Autorize o app Lovable no GitHub
3. Escolha a organização/conta e clique **Create Repository**
4. Sincronização bidirecional fica ativa automaticamente

### 3. Criar Web App Node.js na Hostinger

1. Painel Hostinger → **Avançado → Node.js**
2. **Create Application**:
   - **Node.js version**: `20.x`
   - **Application mode**: `Production`
   - **Application root**: `corridadasfamilias` (ou nome de sua escolha)
   - **Application URL**: `www.corridadasfamilias.com.br`
   - **Application startup file**: deixar em branco (vamos usar `npm start`)
3. Salvar.

### 4. Conectar repositório GitHub na Hostinger

1. No painel do app Node.js → **Git Version Control**
2. **Repository URL**: cole a URL do repo criado no passo 2
3. **Branch**: `main`
4. Autorize Hostinger no GitHub
5. **Pull / Deploy** para sincronizar o código

### 5. Configurar variáveis de ambiente

No painel Node.js da Hostinger → **Environment Variables**:

```
NODE_ENV=production
PORT=3000
PUBLIC_SITE_URL=https://www.corridadasfamilias.com.br
VITE_PUBLIC_SITE_URL=https://www.corridadasfamilias.com.br
VITE_SUPABASE_URL=https://ljquyrrprrwqpmaomwsh.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<copie do .env do projeto>
VITE_SUPABASE_PROJECT_ID=ljquyrrprrwqpmaomwsh
```

> `SUPABASE_SERVICE_ROLE_KEY` **NÃO** deve ser configurada na Hostinger.
> Ela só existe no Supabase, usada pela Edge Function.

### 6. Configurar comandos de build e start

No painel Node.js da Hostinger:

- **NPM Install** → executar
- **Run Custom Script**: `build:hostinger` → executar
- O **startup command** já é `npm start` (lê do `package.json`)

Ou em terminal SSH na Hostinger:
```bash
cd ~/domains/corridadasfamilias.com.br/corridadasfamilias
npm install
npm run build:hostinger
# o app já está configurado para rodar `npm start` na porta $PORT
```

Clique **Restart** no painel.

### 7. Apontar DNS para Hostinger

No painel do Registro.br (ou onde o domínio está):
- **A** `@` → IP do servidor mostrado no painel Node.js da Hostinger
- **A** `www` → mesmo IP

Aguardar propagação (~15min). Verificar em https://dnschecker.org

### 8. Ativar SSL

Painel Hostinger → **SSL** → **Install Free SSL** para:
- `corridadasfamilias.com.br`
- `www.corridadasfamilias.com.br`

Aguardar ~10min para o certificado ser emitido.

### 9. Configurar webhook InfinitePay

A Edge Function já está deployada no Supabase:
```
https://ljquyrrprrwqpmaomwsh.supabase.co/functions/v1/infinitepay-webhook
```

No painel da **InfinitePay**:
- **Configurações → Webhooks**
- URL: cole a URL acima
- Eventos: pagamento aprovado / confirmado

### 10. Testar

1. Acesse `https://www.corridadasfamilias.com.br` → home carrega
2. Acesse `/admin/dashboard` → faça login → dados aparecem
3. Faça uma inscrição de teste com valor mínimo
4. Confirme pagamento na InfinitePay
5. Verifique:
   - **Supabase → Functions → Logs** mostra o webhook recebido
   - **Tabela `registrations`** mostra `status = paid`
   - Página `/sucesso?protocol=...` exibe confirmação

---

## URLs finais de produção

| Componente | URL |
|------------|-----|
| Site público | https://www.corridadasfamilias.com.br |
| Webhook InfinitePay | https://ljquyrrprrwqpmaomwsh.supabase.co/functions/v1/infinitepay-webhook |
| Supabase Dashboard | https://supabase.com/dashboard/project/ljquyrrprrwqpmaomwsh |

---

## Resolução de problemas

**403 Forbidden no domínio**
→ App Node.js da Hostinger não está rodando ou `public_html` está vazio.
Veja seção 6 (build/start) e 7 (DNS).

**Tela em branco**
→ Variável `VITE_SUPABASE_PUBLISHABLE_KEY` faltando ou errada. Veja seção 5.

**Listas vazias no /admin**
→ Refactor dos `createServerFn` ainda não foi feito (ver "Status atual"
no topo deste arquivo).

**Webhook não atualiza inscrição**
→ Confira logs em Supabase → Functions → `infinitepay-webhook` → Logs.
Verifique se o `order_nsu` no payload bate com `registrations.order_nsu`.
