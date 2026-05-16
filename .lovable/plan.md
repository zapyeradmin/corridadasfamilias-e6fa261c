## Nova seção: Informações da Corrida

Adicionar uma nova seção em `src/routes/index.tsx`, logo após a seção "Pilares do evento" (após o bloco `<ContentSection>` dos pilares) e antes da seção "DETALHES" existente.

### Estrutura

Layout em duas colunas no desktop (`lg:grid-cols-2`), empilhado no mobile:

**Coluna esquerda:** imagem quadrada (1:1) com cantos arredondados, sombra e leve gradiente decorativo no fundo (mesma linguagem visual dos cards atuais).

**Coluna direita:** todo o conteúdo textual e blocos informativos.

### Conteúdo

Cabeçalho da seção (acima do grid, ocupando largura total):
- Eyebrow: "INFORMAÇÕES DA CORRIDA" (mesmo estilo do eyebrow "Pilares do evento")
- Título H2: "Fique por dentro da corrida" (mesmo estilo `heading-section`)
- Parágrafo introdutório com o texto fornecido sobre a II Corrida e o lema

Coluna direita (ao lado da imagem):
- Semi-título (H3): "Venha fazer parte dessa experiência única de alegria, fé e saúde com toda a família."
- Parágrafo: "Reúna a sua família, amigos e toda sua equipe de corrida, coloque o seu tênis e venha celebrar com a gente. Fique por dentro de todas as informações:"
- 4 blocos de informação, cada um com ícone à esquerda + título + linhas de detalhe:
  1. **Data e Horários** (ícone `Calendar`): Data, Concentração 05:00, Largada 06:00 (sem atrasos)
  2. **Localização Estratégica** (ícone `MapPin`): Igreja Matriz do Rosário, Serra Talhada/PE
  3. **Percurso Oficial** (ícone `Route` ou `Activity`): 5km
  4. **Suporte ao Atleta** (ícone `HeartPulse` ou `ShieldPlus`): pontos de hidratação, apoio de saúde, suporte (banheiros, massagens, frutas, repositores)

### Detalhes técnicos

- Reutilizar `ContentSection` para padding/largura consistentes
- Tokens de cor existentes: `--color-brand-orange`, `--color-brand-purple-title`, `--color-brand-purple-text`, `--color-brand-soft`
- Imports adicionais de `lucide-react`: `Route` (ou reusar `Activity`), `HeartPulse`
- Imagem: usar `heroRunner` por enquanto como placeholder (o usuário pode trocar depois) com `aspect-square` + `object-cover`
- Animações leves com `framer-motion` (`whileInView`) seguindo o padrão dos pilares
- Sem alterações em outras seções
