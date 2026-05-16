## Reformular seção "Inscrições abertas"

Atualizar o bloco final em `src/routes/index.tsx` (seção com `bg-gradient-orange`) para incluir um player de vídeo do YouTube com capa personalizada e reposicionar o botão de inscrição.

### Mudanças

1. **Salvar a capa do vídeo**
   - Copiar `user-uploads://capa-video-lancamento.jpg` para `src/assets/capa-video-lancamento.jpg`.
   - Importar no topo de `src/routes/index.tsx`.

2. **Reestruturar a seção CTA FINAL**
   - Mudar de layout horizontal (título à esquerda + botão à direita) para layout vertical centralizado.
   - Ordem dos elementos:
     1. Eyebrow "Inscrições abertas"
     2. Título "Garanta sua vaga e celebre com a sua família" (mantido)
     3. Player de vídeo do YouTube (novo)
     4. Botão "Quero me inscrever" (reposicionado abaixo do player)

3. **Player de vídeo com capa "click-to-play"**
   - Componente client-side: exibe a imagem `capa-video-lancamento.jpg` com botão de play sobreposto.
   - Ao clicar, substitui por `<iframe>` do YouTube com `autoplay=1`.
   - URL do embed: `https://www.youtube.com/embed/TE_hIXiN544?autoplay=1&rel=0`.
   - Container responsivo com `aspect-video` (16:9), bordas arredondadas, sombra premium.
   - Largura máxima ~900px, centralizado.
   - Vantagem: economiza requisições do YouTube até o usuário clicar, e mostra a capa personalizada (a thumbnail nativa do YouTube não seria usada).

4. **Estilo**
   - Manter `bg-gradient-orange` e tipografia atual.
   - Botão de play central: círculo branco translúcido com ícone `Play` do lucide-react, animação de hover (scale).
   - Botão "Quero me inscrever" mantém o estilo branco com texto roxo, agora centralizado abaixo do vídeo com `mt-8`.

### Detalhes técnicos

- Adicionar `useState` para controlar `isPlaying`.
- Adicionar `Play` aos imports de `lucide-react`.
- O player só entra no DOM como iframe após o clique (lazy mount), evitando carregamento desnecessário do iframe do YouTube no carregamento inicial da página.
- Imagem importada via `@/assets/capa-video-lancamento.jpg` para bundling otimizado.
