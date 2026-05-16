## Nova seção: Cronograma Oficial (timeline com scroll)

Substituir a seção de background cinza atual (cards "Data / Local / Distância") em `src/routes/index.tsx` pela nova seção **Cronograma Oficial**, posicionada logo após "Informações da Corrida" e antes do CTA final laranja.

### Estrutura visual

Bloco com fundo `bg-[color:var(--color-brand-soft)]` (mantém o cinza suave) e padding generoso.

Cabeçalho centralizado:
- Eyebrow: `CRONOGRAMA OFICIAL` (laranja, mesmo estilo dos outros eyebrows)
- Título H2: `Veja nosso cronograma completo` (mesmo `heading-section`, cor `--color-brand-purple-title`)

Timeline vertical em duas colunas no desktop (zigue-zague) e coluna única no mobile:
- Linha vertical central (desktop) / à esquerda (mobile) com gradiente laranja → roxo
- 3 etapas, cada uma com:
  - Marcador circular numerado (01, 02, 03) sobre a linha, com `bg-gradient-orange` e `shadow-orange`
  - Card branco (`rounded-3xl border border-border bg-white p-7 shadow-soft`) contendo:
    - Ícone temático no topo (etapa 1: `ClipboardList`, etapa 2: `Package`, etapa 3: `Flag`)
    - Título uppercase extrabold (cor `--color-brand-purple-title`)
    - Texto descritivo justificado (cor `--color-brand-purple-text`)
  - Etapa 3 ("No dia da corrida"): a lista numerada de horários é renderizada como uma `<ul>` estilizada — cada item com horário em destaque (chip/pill laranja claro) + descrição

### Efeito de scroll

Usar `framer-motion` com `useScroll` + `useTransform` para:
- Animar a altura da linha vertical conforme o scroll progride dentro da seção (efeito de "preenchimento" da timeline)
- Cada item entra com `whileInView` (fade + slide horizontal alternado: ímpares da esquerda, pares da direita no desktop; todos da esquerda no mobile)
- Marcadores numerados fazem `scale` 0 → 1 ao entrar na viewport

Implementação:
```tsx
const ref = useRef<HTMLDivElement>(null);
const { scrollYProgress } = useScroll({ target: ref, offset: ["start center", "end center"] });
const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
```

### Conteúdo (texto exato)

1. **Abertura das Inscrições** — "Garanta sua inscrição na corrida mais vibrante da cidade! Inscrições online com vagas limitadas. A partir das 17h do dia 17 de maio de 2026 até às 23h59 do dia 12 de julho de 2026."

2. **Entrega dos Kits** — "Retire seu kit atleta (Camiseta Oficial, Número) das 19:30 às 21:30 nos dias 4, 5 e 6 de agosto de 2026. No Centro Pastoral da Igreja de N. Sra. da Conceição. Não esqueça de levar sua doação de 1Kg de Alimento não perecível, e para os inscritos que forem retirar seu Kit do Atleta no dia 09 de agosto, deverá receber até o horário limite das 5:30, no local da largada."

3. **No dia da corrida** — intro: "No dia 09 de agosto de 2026, se liguem:" + lista:
   - 05:00 — Concentração e Abertura da Arena das Famílias
   - 05:30 — Limite da entrega dos Kits e início do Aquecimento Coletivo
   - 05:50 — Momento de Oração e devoção antes da largada
   - 06:00 — Largada Oficial da Corrida
   - 08:30 — Início da Cerimônia de Premiação
   - 10:00 — Encerramento do Evento

### Detalhes técnicos

- Arquivo único alterado: `src/routes/index.tsx`
- Remover a seção atual de cards (Data/Local/Distância) — será substituída pela timeline
- Imports adicionais de `lucide-react`: `ClipboardList`, `Package`, `Flag`
- Imports adicionais de `framer-motion`: `useScroll`, `useTransform`, `useRef` (de React)
- Reutilizar tokens de cor existentes; nenhuma alteração em `styles.css`
- Sem mudanças em outras rotas, componentes ou backend
