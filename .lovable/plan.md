## Objetivo

Adicionar um carrossel auto-scroll com as logos dos patrocinadores **Diamante**, posicionado **acima da seção "Pilares do Evento"** na home, conforme o print enviado.

## Implementação

1. **Instalar dependência**
   - `bun add embla-carousel-auto-scroll` (o `embla-carousel-react` já está instalado).

2. **Criar componente `src/components/site/sponsors-marquee.tsx`**
   - Adaptado do `logos3.tsx` enviado, usando os componentes `Carousel` / `CarouselContent` / `CarouselItem` já existentes em `@/components/ui/carousel`.
   - Busca os patrocinadores via `getPublishedSponsors` (serverFn já existente) com `useQuery` + `useServerFn`, filtrando `tier === "diamond"`.
   - Renderiza cada logo (`logo_url`) com `loading="lazy"`, altura fixa (~h-12/h-16), em escala de cinza com hover colorido (opcional, para consistência visual).
   - Wrapper com `AutoScroll({ playOnInit: true, stopOnInteraction: false, speed: 1 })`, `opts={{ loop: true, align: "start" }}`.
   - Gradiente fade nas bordas esquerda/direita para suavizar o loop.
   - Se não houver patrocinador diamante, o componente retorna `null` (não ocupa espaço).
   - Pequeno título/eyebrow opcional ("Patrocínio Diamante") acima do carrossel — confirmar com você.

3. **Inserir no `src/routes/index.tsx`**
   - Importar `SponsorsMarquee` e colocá-lo imediatamente **antes** do bloco `{/* PILARES */}` (linha ~344), dentro do mesmo container/section pattern para manter espaçamento consistente com o restante da página.

## Fora do escopo

- Não alterar a página `/patrocinadores` nem o schema do banco.
- Não mexer nas outras seções da home.

## Pergunta

Quer que eu inclua o eyebrow "PATROCÍNIO DIAMANTE" acima do carrossel, ou deixar somente as logos rolando, sem título?