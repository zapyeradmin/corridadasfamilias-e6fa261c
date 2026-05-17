## Nova seção: "Percurso Completo da Corrida"

Adicionar nova seção na home (`src/routes/index.tsx`), **logo após** `<CategoriasPremiacoes />` (linha 526) e antes do `</>` final.

### Asset
- Copiar `user-uploads://percurso.png` para `src/assets/percurso-mapa.png` e importar como ES module no topo do arquivo (`import percursoMapa from "@/assets/percurso-mapa.png"`).

### Estrutura visual

```text
<section bg=white, py grande>
  container max-w-[1200px]
    [eyebrow] "PERCURSO COMPLETO DA CORRIDA"   ← roxo --color-brand-purple-text/70, uppercase tracking-wide
    [h2]      "FIQUE POR DENTRO DO PERCURSO,
               PARA NÃO ERRAR NO DIA DA CORRIDA" ← heading-section, --color-brand-purple-title
    [p intro] "Explore um trajeto que celebra..." ← --color-brand-purple-text/80

    [grid 1 col mobile / 2 cols md, gap-10/12, items-center]
      [coluna esquerda] Imagem 4:3
        <div aspect-[4/3] rounded-3xl overflow-hidden shadow-card bg-[color:var(--color-brand-soft)]/40>
          <img percursoMapa loading="lazy" decoding="async" object-contain>
        </div>

      [coluna direita]
        [h3] "O trajeto passa pelas principais ruas da Cidade" — text-2xl/3xl extrabold, --color-brand-purple-title
        [p]  "O percurso de 5km foi desenhado..."
        
        [ul gap-5, mt-6]
          <Item icon=Flag>          Percurso Oficial / texto longo do trajeto
          <Item icon=MapPin>        Sinalização e Apoio / texto
          <Item icon=RouteIcon>     Distância / "5km"
          <Item icon=Mountain>      Altimetria / texto
</section>
```

### Componente `PercursoInfoItem` (local)
- `<li className="flex gap-4">` com círculo `h-11 w-11 rounded-full bg-[color:var(--color-brand-orange)]/10 text-[color:var(--color-brand-orange)]` + ícone.
- Título `text-sm font-extrabold uppercase tracking-[0.18em] text-[color:var(--color-brand-purple-title)]`.
- Texto `text-sm/relaxed text-[color:var(--color-brand-purple-text)]/80 mt-1`.

### Ícones (lucide-react, todos já importados ou facilmente adicionados)
- `Flag` (já importado) — Percurso Oficial
- `MapPin` (já importado) — Sinalização e Apoio
- `Route as RouteIcon` (já importado) — Distância
- `Mountain` — adicionar ao import existente do lucide-react

### Responsividade
- Mobile: imagem em cima, conteúdo embaixo, single column.
- `md:grid-cols-2` com imagem à esquerda e bloco textual à direita, alinhamento `items-center`.
- Padding: `py-20 md:py-28`, `px-5 md:px-8`.

### Observação sobre o item 3 do enunciado
O item 3 está rotulado novamente como "Percurso Oficial" mas o conteúdo é a distância (5km). Será renderizado como **"Distância" — 5km** para evitar título duplicado na lista; mantém todas as informações pedidas sem confusão visual.

### Arquivos alterados
- `src/routes/index.tsx` — adicionar import da imagem, adicionar `Mountain` ao import lucide, inserir `<PercursoCompleto />` após `<CategoriasPremiacoes />`, definir os componentes `PercursoCompleto` e `PercursoInfoItem` no fim do arquivo.
- `src/assets/percurso-mapa.png` — novo asset (cópia do upload).

### Fora de escopo
- Sem alterações na rota `/percurso`.
- Sem novas dependências.
- Sem mudanças no header/footer ou em outras seções.
