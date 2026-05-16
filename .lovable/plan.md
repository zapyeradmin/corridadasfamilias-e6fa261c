## Objetivo
Header com fundo translúcido que se mistura ao topo do Hero, com glow sutil — sem deixar de ser legível em rotas internas (que têm fundo claro).

## Mudanças em `src/components/site/header.tsx`

### Background do `<header>` (linha 61)
Trocar `bg-[color:var(--color-brand-dark)]/85 backdrop-blur-xl` por uma combinação que dá transparência + glow:

```
sticky top-0 z-40 border-b border-white/10
bg-[color:var(--color-brand-dark)]/40
backdrop-blur-xl backdrop-saturate-150
supports-[backdrop-filter]:bg-[color:var(--color-brand-dark)]/35
```

Para o glow, adicionar dentro do `<header>` (antes do `<div>` interno, com `relative` no header) duas camadas decorativas absolutas, `pointer-events-none`:
1. Halo laranja suave centralizado-direita: `absolute -top-10 right-0 h-32 w-[60%] bg-[radial-gradient(ellipse_at_top_right,rgba(255,83,0,0.25),transparent_70%)] blur-2xl`.
2. Halo roxo no canto esquerdo: `absolute -top-10 left-0 h-32 w-[40%] bg-[radial-gradient(ellipse_at_top_left,rgba(123,58,237,0.25),transparent_70%)] blur-2xl`.
3. Linha de brilho na borda inferior: substituir `border-b border-white/10` por uma `::after`-like via div: `absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent`.

Estrutura final:
```
<header className="sticky top-0 z-40 ...transparente + blur">
  <div aria-hidden glow laranja />
  <div aria-hidden glow roxo />
  <div className="relative ..."> {/* conteúdo atual */}
  <div aria-hidden linha brilho inferior />
</header>
```

Adicionar `relative` no `<header>` para que os absolutos se posicionem corretamente.

### Menu mobile aberto
O painel atual usa `bg-[color:var(--color-brand-dark)]` sólido (linha 124). Como ele aparece sob o header translúcido, manter sólido para legibilidade — sem mudança.

## Considerações
- Em rotas internas (Inscrição, FAQ, etc.) o conteúdo abaixo do header é claro. A transparência ainda funciona porque o background do header escuro `/40` + blur produz um vidro escuro legível sobre fundo claro. Os glows ficam discretos.
- Não mexer em `src/styles.css`; usar utilitários inline.

## Verificação
- Recarregar `/` e confirmar que o topo do Hero "vaza" através do header com glow sutil laranja/roxo.
- Abrir `/regulamento` e confirmar que header continua legível sobre fundo claro.
- Mobile: abrir/fechar menu e checar que o painel sólido aparece corretamente abaixo.
