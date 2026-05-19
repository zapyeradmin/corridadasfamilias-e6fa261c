
## Causa raiz do bug (URL correta, mas conteúdo errado)

No TanStack Router, arquivos com nome `inscricao.sucesso.tsx` se tornam **filhos** de `inscricao.tsx`. Para o filho aparecer, o pai precisa renderizar `<Outlet />`. Como `src/routes/inscricao.tsx` renderiza o formulário diretamente (sem `<Outlet />`), ao acessar `/inscricao/sucesso` o router exibe o formulário do pai — por isso a tela mostra "Confirmar Inscrição" e o toast de "Já existe uma inscrição em andamento" (o React Query rebatendo a rota anterior).

A página `inscricao.sucesso.tsx` que já existe está correta em intenção, mas nunca é renderizada por causa desse aninhamento.

## Mudanças

### 1. Corrigir o roteamento (renomear o arquivo)

Renomear `src/routes/inscricao.sucesso.tsx` → `src/routes/inscricao_.sucesso.tsx`.

O sufixo `_` no segmento `inscricao_` é a convenção do TanStack para **opt-out de aninhamento**: a URL continua `/inscricao/sucesso`, mas a rota deixa de ser filha de `inscricao.tsx` e passa a renderizar de forma independente. Sem isso, qualquer alternativa exigiria adicionar `<Outlet />` no formulário, o que quebraria a UX.

### 2. Reescrever `inscricao_.sucesso.tsx` conforme o pedido

Conteúdo "apenas informativo" sobre o próximo passo, sem duplicar formulário nem checagens automáticas:

- **PageHeader**: eyebrow "Etapa 1 de 2 concluída", título **"Primeiro passo concluído!"**, descrição: "Agora, para confirmar e garantir de vez sua vaga, realize o seu pagamento com sucesso."
- **Card de confirmação** (centralizado, max-w-2xl):
  - Ícone `CheckCircle2` verde grande no topo
  - Bloco com **Protocolo** (lido de `?protocol=` na URL) e nome do inscrito (busca leve via `getRegistrationByProtocol` apenas para exibir nome + valor — sem stepper, sem detecção `paid`)
  - Mensagem: "Sua inscrição foi registrada. A vaga só será confirmada após a aprovação do pagamento."
- **Bloco "Formas de pagamento"** com 3 itens (ícones + texto): PIX, Cartão de crédito (até 12x), Boleto. Texto informativo apenas, sem lógica.
- **Botão primário "Realizar pagamento"** (gradient laranja, grande): navega para `/pagamento?protocol=${protocol}` (rota nova, placeholder por enquanto).
- **Link secundário** "Falar no WhatsApp" para suporte com o protocolo.

Remover do arquivo atual: stepper de 2 etapas, lógica `isPaid`, leitura do `payment.checkout_url`, abertura em nova aba. Tudo simplificado para "apenas informar".

### 3. Criar `src/routes/pagamento.tsx` (placeholder)

Página placeholder até integrar Infinity Pay:
- PageHeader "Pagamento"
- Mensagem: "Integração com Infinity Pay em andamento. Em breve você poderá finalizar o pagamento por aqui."
- Mostra o protocolo (lido de `?protocol=`) e link para voltar / WhatsApp.

Assim o botão "Realizar pagamento" já tem destino válido e mais tarde você só preenche essa rota com o checkout real.

### 4. Não mexer em

- `src/routes/inscricao.tsx` — o redirect com `navigate({ to: "/inscricao/sucesso", search: { protocol } })` continua válido.
- `src/lib/registrations.functions.ts` — `getRegistrationByProtocol` continua igual (a página nova só usa `protocol`, `full_name` e `amount_cents`).

## Detalhes técnicos

- Convenção TanStack: segmento terminado em `_` (ex.: `inscricao_.sucesso.tsx`) gera URL `/inscricao/sucesso` sem aninhar no layout `inscricao.tsx`. O `routeTree.gen.ts` é regenerado automaticamente pelo plugin Vite — não editar à mão.
- A página antiga `src/routes/sucesso.tsx` permanece intocada (é outra rota, `/sucesso`).
- Sem alterações de schema, server functions ou business logic.
