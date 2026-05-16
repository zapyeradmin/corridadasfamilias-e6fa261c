## Ajustes nos cards da seção "Pilares do evento"

Em `src/routes/index.tsx`:

### 1. Atualizar textos dos pilares (array `PILARES`)
- **Fé**: "A base que nos une em propósito e fortalece nossa caminhada em comunidade."
- **Esporte em Família**: "O caminho para superar limites, integrar gerações e celebrar a vida em movimento."
- **Saúde**: "O cuidado essencial com o corpo e a mente, promovendo o bem-estar de toda a família."
- **Solidariedade**: "O olhar de amor ao próximo, transformando nossa união em apoio real a quem mais precisa."

### 2. Centralizar conteúdo dos cards
No `motion.div` de cada card:
- Adicionar `flex flex-col items-center text-center` ao container
- O ícone (`<span>`) ficará centralizado horizontalmente pelo `items-center`
- Título e descrição herdam `text-center` do container
