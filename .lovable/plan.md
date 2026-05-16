## Objetivo
Deixar o Hero impecável em mobile (≤640px) e tablet (641–1024px), mantendo o desktop atual intacto.

## Ajustes em `src/routes/index.tsx` (seção HERO)

### 1. Container e espaçamentos
- Padding vertical responsivo escalonado: `py-16 sm:py-20 md:py-28 lg:py-36` (hoje pula direto de `py-24` para `py-36`).
- Padding horizontal: `px-5 sm:px-6 md:px-8`.
- Grid: manter 1 coluna até `lg`, virar 2 colunas só em `lg:grid-cols-[1.25fr_1fr]` (hoje quebra em `md`, apertando o tablet). Gap: `gap-10 sm:gap-12 lg:gap-16`.

### 2. Imagem de fundo
- Mobile: foco no centro-superior dos corredores com `object-[50%_30%]`; tablet/desktop voltam para `sm:object-center`.
- Opacidade levemente menor no mobile para o texto respirar: `opacity-45 sm:opacity-55`.
- Reduzir o blob laranja no mobile (`h-[320px] w-[320px] sm:h-[520px] sm:w-[520px]`) e reposicionar para não vazar (`-top-24 -right-20 sm:-top-40 sm:-right-32`).
- Faixa inferior de fade mais curta no mobile: `h-24 sm:h-40`.

### 3. Tipografia do título
- Kicker "II Edição · 5KM": `text-[10px] tracking-[0.4em] sm:text-xs sm:tracking-[0.55em]`.
- "Corrida": `text-[3.25rem] sm:text-6xl md:text-7xl lg:text-[6.25rem]` (hoje começa em `text-6xl`, estoura em telas estreitas tipo 360px).
- "das Famílias": `text-[2.5rem] sm:text-5xl md:text-6xl lg:text-[5.25rem]`.
- Margens entre linhas: `mt-3 sm:mt-4` no "Corrida"; manter `mt-2` no itálico.
- Linha decorativa: `mt-5 sm:mt-6 w-16 sm:w-24`.

### 4. Subtítulo, CTAs e meta
- Parágrafo: `mt-4 sm:mt-5 text-[15px] sm:text-base md:text-lg`, `max-w-md sm:max-w-xl`.
- CTAs: empilhar full-width no mobile (`flex-col sm:flex-row`), botões `w-full sm:w-auto justify-center`, padding `px-6 py-3.5 sm:px-7 sm:py-4`. Margem do bloco: `mt-7 sm:mt-8`.
- Meta (local + premiação): `gap-4 sm:gap-6 text-[13px] sm:text-sm`, `mt-8 sm:mt-10`.

### 5. Card de contagem regressiva
- No mobile/tablet, centralizar e limitar largura: `max-w-sm sm:max-w-md mx-auto lg:mx-0 lg:justify-self-end`.
- Padding interno: `p-6 sm:p-7`.
- Título "Faltam para a largada": `text-xl sm:text-2xl`.
- CTA interno: manter, garantir `w-full`.
- Verificar Countdown: se os números forem grandes, conferir overflow no mobile. (Vou checar `src/components/site/countdown.tsx` na implementação caso precise reduzir font-size do componente.)

## Verificação
Após aplicar, testar nos viewports 375×812 (mobile), 768×1024 (tablet) e 1440 (desktop) — confirmar:
- Nada vaza ou sobrepõe.
- Título legível em uma única coluna até `lg`.
- Botões fáceis de tocar (alvos ≥44px).
- Card aparece abaixo do texto no tablet, sem comprimir.
