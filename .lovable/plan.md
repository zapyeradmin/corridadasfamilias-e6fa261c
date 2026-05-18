## Plano

1. **Trocar a fonte visual das logos para assets importados do projeto**
   - Usar imports diretos dos arquivos em `public/sponsors` ou mover para `src/assets/sponsors` para o bundler gerar URLs estáveis.
   - Manter o banco como fonte dos patrocinadores publicados, mas resolver cada logo por `slug` para uma URL local garantida.
   - Isso evita falhas de renderização por URL relativa, autenticação/redirect do preview ou resposta HTML no lugar de PNG.

2. **Refatorar o componente `SponsorsMarquee`**
   - Criar uma função de normalização que associa `oracle-digital`, `nattivo-cafe`, `urbano-alimentos` e `prefeitura-serra-talhada` aos arquivos corretos.
   - Renderizar o carrossel mesmo se a query estiver carregando, com altura reservada e fallback visual.
   - Se por algum motivo o banco atrasar, a seção não ficará vazia.

3. **Corrigir espaçamento e tamanho das logos**
   - Definir slots fixos e iguais para todas as marcas.
   - Usar `object-contain`, `max-height`, `max-width` e escala óptica por logo para equilibrar a Urbano Alimentos e a Prefeitura com as demais.
   - Ajustar medidas separadas para desktop e mobile para evitar área branca vazia.

4. **Otimizar o movimento**
   - Manter marquee CSS puro, mas ajustar track, gap e duração para movimento contínuo sem “pulos”.
   - Pausar no hover em desktop e respeitar `prefers-reduced-motion`.
   - Adicionar `will-change` e evitar layout shift.

5. **Validação final**
   - Conferir no navegador em desktop e mobile que as 4 logos aparecem, têm tamanho equilibrado e rolam suavemente.
   - Checar rede/console para garantir que não há imagens quebradas nem erro relacionado ao carrossel.

## Arquivos previstos

- `src/components/site/sponsors-marquee.tsx`
- `src/styles.css`
- Possivelmente `src/assets/sponsors/*` caso seja necessário mover os PNGs para imports estáveis.