# 📋 Histórico Completo de Implementações, Erros, Correções e Guia Operacional
## Projeto: 2ª Edição da Corrida Natalina | Corre +

Este documento consolida todas as implementações, decisões de arquitetura, configurações de serviços externos, incidentes ocorridos, causas-raiz, soluções aplicadas e orientações para futuros desenvolvimentos e manutenções.

---

## 📑 Sumário
1. [Visão Geral do Projeto & URLs de Produção](#1-visão-geral-do-projeto--urls-de-produção)
2. [Implementações Funcionais & Negócio](#2-implementações-funcionais--negócio)
3. [Integrações Externas Configuradas](#3-integrações-externas-configuradas)
4. [Identidade Visual, Banners e Assets](#4-identidade-visual-banners-e-assets)
5. [Infraestrutura VPS Hetzner & Arquitetura](#5-infraestrutura-vps-hetzner--arquitetura)
6. [Histórico de Erros, Diagnósticos e Correções](#6-histórico-de-erros-diagnósticos-e-correções)
7. [Scripts de Manutenção e Atualização](#7-scripts-de-manutenção-e-atualização)
8. [Backlog e Próximas Melhorias](#8-backlog-e-próximas-melhorias)

---

## 1. Visão Geral do Projeto & URLs de Produção

- **Aplicação Principal (Produção):** [https://corridascorremais.com.br](https://corridascorremais.com.br)
- **Domínios Secundários (Redirecionamento 301 com SSL Ativo):**
  - `https://www.corridascorremais.com.br` ➔ `https://corridascorremais.com.br`
  - `https://corridascorremais.com` ➔ `https://corridascorremais.com.br`
  - `https://www.corridascorremais.com` ➔ `https://corridascorremais.com.br`
  - `https://corridascorremais.online` ➔ `https://corridascorremais.com.br`
  - `https://www.corridascorremais.online` ➔ `https://corridascorremais.com.br`
- **Servidor:** VPS Hetzner Cloud (IP: `2.29.30.46`, Ubuntu 26.04.1 LTS)
- **Repositório Git:** `https://github.com/zapyeradmin/corridadasfamilias-e6fa261c.git` (branch `main`)

---

## 2. Implementações Funcionais & Negócio

### A. Página de Regulamento (`/regulamento`)
- Atualizada a seção **"Dos Pagamentos e Lotes"** com o cronograma completo dos lotes:
  - **Lote 1 (Promocional Único):** R$ 80,00 (Vigente, com camisa oficial e brindes inclusos).
  - **Lote 2:** R$ 96,00 (Data a ser definida).
  - **Lote 3:** R$ 105,60 (Data a ser definida).
- Preservadas as regras de premiação por categoria, percurso, entrega de kits e suporte aos atletas.

### B. Formulário de Inscrição (`/inscricao`)
- Formulário em 3 etapas progressivas com validação via Zod e React Hook Form:
  1. **Dados Pessoais:** Nome completo, CPF (com máscara e validação matemática de dígitos verificadores), E-mail, WhatsApp (com máscara e validação), Data de Nascimento, Sexo e Categoria.
  2. **Kit & Emergência:** Tamanho da camisa (`pp`, `p`, `m`, `g`, `gg`, `xgg`), Nome e Telefone do Contato de Emergência, Observações Médicas (opcional).
  3. **Revisão & Termos:** Aceite do regulamento e política de privacidade LGPD.
- Cálculo e exibição do valor com base no lote ativo.
- Redirecionamento com sucesso e acionamento de e-mail de confirmação.

### C. Painel Administrativo (`/admin`)
- Autenticação protegida via Supabase Auth.
- Gestão de atletas inscritos (`/admin/inscricoes`), status de pagamento, filtro por categorias e tamanhos de camisa.
- Envio manual de e-mail de confirmação com 1 clique diretamente pela listagem.
- Exportação de dados e visualização de comprovantes.

---

## 3. Integrações Externas Configuradas

### A. InfinitePay (Pagamentos Pix e Cartão)
- **Handle:** `edna-maria-4gu`
- **Link de Checkout Oficial:** `https://checkout.infinitepay.io/edna-maria-4gu/N21HTRtmjN`
- **Webhook Endpoint:** `https://corridascorremais.com.br/api/webhooks/infinitepay`
- **Tratamento:** Sistema preparado para validação de assinatura quando a chave `INFINITEPAY_WEBHOOK_SECRET` for fornecida pela InfinitePay. Em caso de ausência da chave, o endpoint opera com segurança e log para auditoria.

### B. Resend (E-mails Transacionais)
- **API Key:** Configurada de forma segura no `.env` da VPS (`re_BCHvPpY8_***`).
- **Remetente Oficial:** `2ª Corrida Natalina <inscricoes@corridascorremais.com>`
- **Assunto:** `✅ Confirmação de Inscrição | 2ª Edição da Corrida Natalina`
- **Conteúdo Homologado:**
  > "Olá, atleta! 🏃‍♂️🏃‍♀️🎅  
  > Sua inscrição na 2ª Edição da Corrida Natalina foi realizada com sucesso! 🎉  
  > Agora precisamos apenas confirmar o seu pagamento para validar definitivamente a sua participação.  
  > Caso o pagamento já tenha sido realizado, por favor, envie o comprovante de pagamento para um dos nossos canais de atendimento pelo WhatsApp:  
  > 📲 (87) 99201-7978 (Filipe Siqueira)  
  > 📲 (87) 98868-2053 (Joselma Gomes)  
  > Após a confirmação, sua inscrição estará oficialmente validada.  
  > Obrigado por fazer parte da 2ª Edição da Corrida Natalina. Nos vemos na largada! ❤️🎅🏃  
  > Atenciosamente,  
  > Equipe CORRE+  
  > 2ª Edição da Corrida Natalina"
- **Disparo:** Executado de forma assíncrona após inserção no Supabase, garantindo que mesmo se o envio do e-mail falhar, a inscrição do atleta não seja abortada.

### C. Supabase (Banco de Dados e Auth)
- **Project ID:** `ffzvcebsxhqgyjrxflwp`
- **URL:** `https://ffzvcebsxhqgyjrxflwp.supabase.co`
- Chaves configuradas: `SUPABASE_PUBLISHABLE_KEY` e `SUPABASE_SERVICE_ROLE_KEY`.

---

## 4. Identidade Visual, Banners e Assets

- **Banner de Compartilhamento Social (OG Image / Twitter Card):**
  - Configurada a imagem oficial `capa-video-lancamento.jpg` localizada em `src/assets/`.
  - As tags `<meta property="og:image">` e `<meta name="twitter:image">` apontam para a URL absoluta `https://corridascorremais.com.br/capa-video-lancamento.jpg`.
- **Favicons & Ícones:**
  - Gerados e configurados na raiz estática (`.output/public` e `public/`):
    - `favicon.ico`
    - `favicon-16x16.png`
    - `favicon-32x32.png`
    - `apple-touch-icon.png`

---

## 5. Infraestrutura VPS Hetzner & Arquitetura

```
               [ Cliente / Navegador ]
                          │
                     HTTPS (443)
                          ▼
             [ Nginx Reverse Proxy ]
               ├── /assets/*      ──▶ Servido direto do disco (Cache 1 ano)
               ├── /favicon.ico   ──▶ Servido direto do disco
               ├── *.jpg, *.png   ──▶ Servido direto do disco
               └── / (outras)     ──▶ Proxy HTTP http://127.0.0.1:3000
                                              │
                                              ▼
                                   [ Node.js SSR Server ]
                                      (PM2 - Fork Mode)
                                      (.output/server/index.mjs)
                                              │
                         ┌────────────────────┴────────────────────┐
                         ▼                                         ▼
                 [ Supabase API ]                           [ Resend API ]
```

- **Usuário de Operação:** `deploy` (com permissões sudo restritas).
- **Diretório da Aplicação:** `/home/deploy/app`.
- **Certificados SSL:** Let's Encrypt gerenciados pelo Certbot com auto-renovação no systemd.
- **Firewall UFW:** Portas 22 (SSH), 80 (HTTP) e 443 (HTTPS) liberadas.

---

## 6. Histórico de Erros, Diagnósticos e Correções

### Incidente 1: Erro 400 ao submeter Inscrição (`participant_type`)
- **Sintoma:** Ao preencher o formulário e clicar em finalizar inscrição, a API retornava erro `Could not find the 'participant_type' column of 'registrations' in the schema cache`.
- **Causa Raiz:** A tabela `registrations` no Supabase possui as colunas `category`, `shirt_size`, etc., mas não possui a coluna `participant_type`. O código tentava enviar esse campo nulo/indefinido.
- **Solução:** Removida a referência ao campo `participant_type` do objeto payload em `src/lib/registrations.functions.ts` e ajustado o tipo TypeScript correspondente.

### Incidente 2: Erro `13: Permission denied` do Nginx nos Arquivos Estáticos
- **Sintoma:** Nginx registrava `stat() "/home/deploy/app/.output/public/favicon.ico" failed (13: Permission denied)`.
- **Causa Raiz:** A pasta `/home/deploy` foi criada pelo Ubuntu com permissão `750` (`drwxr-x---`). O Nginx roda sob o usuário `www-data` e não conseguia atravessar `/home/deploy` para ler `.output/public/`.
- **Solução:** Aplicado `chmod 755 /home/deploy` e `chmod -R 755 /home/deploy/app/.output/public`.

### Incidente 3: Erro `502 Bad Gateway` e Processo Zombie no Node.js (PM2)
- **Sintoma:** `connect() failed (111: Connection refused) while connecting to upstream` na porta 3000. O log do PM2 reportava `SSR stream transform exceeded maximum lifetime (120000ms)` seguido de `Stopping server gracefully (5s)... Server closed successfully.`
- **Causa Raiz:** O preset `node-server` do TanStack Start/Nitro utiliza o pacote `srvx`. Ao receber sinal de encerramento (`SIGINT`/`SIGTERM`) durante reloads do PM2 em modo cluster, o handler chamava `server.close()` mas **não executava `process.exit()`**. Como havia handles/timers pendentes no event loop, o Node.js continuava rodando como processo fantasma com a porta HTTP fechada. O PM2 considerava o processo `online` e não o recriava.
- **Solução:**
  1. Alterado `ecosystem.config.cjs` de `exec_mode: "cluster"` com 2 instâncias para `exec_mode: "fork"` com 1 instância e `kill_timeout: 3000`.
  2. Executado `pm2 kill` e `killall -9 node` para limpar processos zombies.
  3. Atualizado o script `update.sh` para usar `pm2 restart` em vez de `pm2 reload`.

---

## 7. Scripts de Manutenção e Atualização

### Atualização Rápida na VPS (`update.sh`)
Para atualizar o site com as últimas alterações do Git:
```bash
# Conectar como deploy ou executar diretamente:
ssh deploy@2.29.30.46 "/home/deploy/update.sh"
```

Conteúdo do script `/home/deploy/update.sh`:
```bash
#!/bin/bash
set -e
echo "=== ATUALIZANDO 2ª CORRIDA NATALINA ==="
cd /home/deploy/app
git pull origin main
npm install --no-audit --no-fund
npm run build:node
chmod -R 755 /home/deploy/app/.output/public
pm2 restart corridadasfamilias
echo "=== ATUALIZAÇÃO CONCLUÍDA COM SUCESSO! ==="
```

### Comandos Úteis do PM2
```bash
# Ver status do serviço
pm2 status

# Ver logs em tempo real
pm2 logs corridadasfamilias

# Reiniciar aplicação
pm2 restart corridadasfamilias

# Monitorar uso de CPU e Memória
pm2 monit
```

### Comandos Úteis do Nginx
```bash
# Testar integridade da configuração
sudo nginx -t

# Recarregar configuração sem parar conexões
sudo systemctl reload nginx

# Ver logs de erro
sudo tail -f /var/log/nginx/error.log
```

---

## 8. Backlog e Próximas Melhorias

1. **Webhook de Baixa Automática de Pagamento:**
   - Obter a chave `INFINITEPAY_WEBHOOK_SECRET` com o suporte da InfinitePay para ativar a confirmação automática de inscrições via webhook no momento em que o Pix/Cartão for liquidado.
2. **Dashboard de Métricas e Relatórios:**
   - Adicionar gráficos de contagem de atletas por faixa etária, percurso e tamanho de camisas para facilitar o fechamento do pedido na confecção têxtil.
3. **Comprovante de Inscrição em PDF / Carteirinha do Atleta:**
   - Permitir que o atleta gere um comprovante digital com QR Code para apresentação no dia da retirada do kit.
4. **Notificação via WhatsApp:**
   - Integrar Evolution API ou Z-API para envio automático do WhatsApp de boas-vindas com o QR Code de confirmação.

---
*Documento gerado e homologado em 04 de Setembro de 2026.*
