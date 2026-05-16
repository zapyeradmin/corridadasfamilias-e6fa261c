## Cabeçalho com cor uniforme em todo o desktop

### Problema
Na correção anterior, os 3 overlays decorativos foram movidos para dentro do container `max-w-[1360px]` da topbar. Isso confinou o gradiente apenas à área central; em telas largas (>1360px) as laterais ficam apenas com o `bg-[#2a0f4a]/70` base do `<header>`, criando uma faixa visivelmente mais clara/lavada nas extremidades.

### Solução
Envolver a topbar (`max-w-[1360px]`) com um wrapper de largura total (`relative w-full`) e mover os 3 overlays decorativos para dentro desse wrapper. Assim:
- Os overlays cobrem 100% da largura do header (cor uniforme nas laterais).
- Continuam confinados em altura ao topbar — não invadem o painel do menu mobile (mantém a correção anterior).
- O painel do menu mobile permanece como irmão fora desse wrapper, com fundo sólido.

### Arquivo
- `src/components/site/header.tsx`

### Detalhes técnicos
1. Adicionar um `<div className="relative w-full">` envolvendo:
   - os 3 `<div aria-hidden>` decorativos (gradiente linear + 2 glows radiais), com `pointer-events-none absolute inset-0`.
   - o atual `<div className="relative mx-auto flex max-w-[1360px] ...">` da topbar.
2. Manter a topbar interna com `relative` para que logo, nav e botão fiquem acima dos overlays.
3. Não alterar o painel do menu mobile (segue como irmão, com `bg-[color:var(--color-brand-dark)]` sólido e `relative z-10`).
4. Sem mudanças de cor, apenas reorganização estrutural do JSX.
