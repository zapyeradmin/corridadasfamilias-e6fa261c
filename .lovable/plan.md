## Objetivo
Atualizar a página `/faq` (`src/routes/faq.tsx`) para reaproveitar o layout da seção "Tire suas dúvidas" da Home, porém com **fundo branco** (em vez de laranja).

## O que muda

### `src/routes/faq.tsx` (reescrita)
- Manter `PageHeader` no topo (eyebrow "Tire suas dúvidas", title "Perguntas frequentes").
- Substituir o `ContentSection` por uma `<section className="bg-white">` no mesmo padrão de espaçamento das outras páginas internas (`max-w-[1200px]`, `px-5 md:px-8`, `pt-6 pb-20 md:pt-8 md:pb-28`).
- Reutilizar exatamente a **mesma lista de perguntas/respostas** (`FAQ_ITEMS`) usada na Home — perguntas mais completas, com textos longos, quebras de linha preservadas via `whitespace-pre-line`. Substitui o array enxuto atual.
- Acordeão com o mesmo visual da Home, adaptado ao fundo branco:
  - `AccordionItem`: cartão roxo `bg-[#431181]`, `rounded-2xl`, `shadow-[0_10px_30px_rgba(22,9,31,0.18)]`, `px-5 md:px-7`.
  - `AccordionTrigger`: texto branco, `font-extrabold uppercase`, ícone branco.
  - `AccordionContent`: texto branco, `whitespace-pre-line`, `text-sm md:text-base`.
- Atualizar `head()`: title "FAQ — II Corrida das Famílias", description focada nas dúvidas frequentes (inscrição, pagamento, kit, percurso, transferência), `og:title` e `og:description`.

### O que NÃO muda
- Home (`src/routes/index.tsx`) permanece igual.
- Componentes compartilhados (`PageHeader`, `Accordion`) sem alterações.
- Sem mudanças de backend, dados ou rotas.

## Resultado visual
- Cabeçalho roxo padrão das páginas internas.
- Corpo branco com cartões roxos do acordeão (mesmo estilo da Home).
- Mesmas 6 perguntas detalhadas da Home, no lugar das versões curtas atuais.
