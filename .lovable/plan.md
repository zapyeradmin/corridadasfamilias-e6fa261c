## Objetivo

Substituir o conteúdo atual da página `/regulamento` (que hoje tem 8 seções resumidas) pelo **Regulamento Oficial completo da II Corrida das Famílias**, conforme PDF enviado.

## Arquivo afetado

- `src/routes/regulamento.tsx` — única edição.

Os demais arquivos (`page-shell.tsx`, header, footer, design tokens) ficam inalterados. Nada de backend, banco de dados ou rotas novas.

## Estrutura da nova página

Mantenho o cabeçalho atual (`PageHeader` com gradiente roxo) e o layout dentro de `ContentSection`, preservando o design system (cards arredondados, tipografia roxa, sombra suave). O conteúdo passa a ter:

1. **Bloco de abertura** — título "Regulamento Geral", lema *"Juntos no Rosário, Famílias unidas na Fé"* e os dois parágrafos introdutórios do PDF.

2. **Preâmbulo** — em card destacado.

3. **16 seções numeradas**, cada uma em um card (mesmo estilo visual dos cards atuais), com todos os subitens (1.1 … 16.10) na íntegra:
   - 1. Do Evento
   - 2. Das Inscrições
   - 3. Dos Pagamentos *(inclui tabela de lotes — Adulto/Criança × Lotes 1, 2, 3)*
   - 4. Percurso
   - 5. Kit do Atleta
   - 6. Das Categorias e Premiações *(inclui tabela de premiação Geral e tabela Infanto-Juvenil/60+)*
   - 7. Ação de Solidariedade
   - 8. Sobre a Largada e Chegada
   - 9. Regras da Corrida
   - 10. Regras de Troca e/ou Repasse
   - 11. Acompanhamento dos Atletas Durante a Corrida
   - 12. Saúde do Atleta
   - 13. Cancelamento com Reembolso
   - 14. Casos de Não Reembolso
   - 15. Direito de Imagem e Dados dos Atletas (LGPD)
   - 16. Disposições Gerais

4. **Anexos** — em cards separados com leve destaque visual:
   - Anexo I — Termo de Responsabilidade e Ciência do Participante
   - Anexo II — Autorização para Menor de Idade
   - Anexo III — Autorização para Retirada de Kit por Terceiro

   Os campos de assinatura (`Nome: [___]`, `CPF: [___]`, etc.) serão exibidos como listas de campos com linhas pontilhadas — apenas leitura, sem formulário interativo (o PDF é referência textual, não um formulário web).

## Detalhes técnicos

- Conteúdo armazenado como array de objetos `{ title, items: string[] }` para as 16 seções e renderizado num `.map()`. Tabelas (lotes e premiações) ficam como JSX inline dentro das respectivas seções, usando o componente `<Table>` do shadcn (`src/components/ui/table.tsx`).
- Anexos como array separado, renderizados em cards com fundo levemente diferenciado.
- SEO: atualizar `head().meta` — manter título "Regulamento — II Corrida das Famílias" e ajustar a `description` para refletir o regulamento oficial completo (5 km, Serra Talhada, 09/08/2026, lotes, categorias, LGPD).
- Tipografia e cores: 100% via tokens já existentes (`--color-brand-purple-title`, `--color-brand-purple-text`, `--color-brand-orange`, `bg-gradient-hero`, `shadow-soft`). Nada de cores hardcoded.
- Responsivo: tabelas com `overflow-x-auto` em mobile.
- Sem mudanças em rotas, navegação, hooks, server functions ou banco.

## Fora do escopo

- Botão de download do PDF (posso adicionar se você pedir — não foi solicitado).
- Sumário/índice clicável no topo (idem — posso acrescentar se quiser navegação rápida entre as 16 seções).
- Mudanças em outras páginas (kit, premiação, FAQ) — embora algumas tenham conteúdo correlato, o pedido é apenas para `/regulamento`.
