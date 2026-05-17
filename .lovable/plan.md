## Nova seção: "Kit Exclusivo dos Atletas"

Inserir nova seção em `src/routes/index.tsx` **logo após** o fechamento da seção "Informações da Corrida" (linha 380, `</ContentSection>`), antes da seção "Cronograma Oficial".

### Asset
- Aguardar upload da imagem do kit (formato 1:1) → copiar para `src/assets/kit-exclusivo.png` e importar como ES module no topo do arquivo (`import kitExclusivo from "@/assets/kit-exclusivo.png"`).

### Estrutura visual

```text
<section bg branco / soft, py-20 md:py-28>
  container max-w-[1200px], px-5 md:px-8
    [eyebrow] "KIT EXCLUSIVO DOS ATLETAS"   ← orange tracking-[0.35em] uppercase
    [h2]      "INSCREVA-SE E GARANTA O SEU KIT EXCLUSIVO"  ← heading-section, purple-title
    [p intro] "Confira todos os itens exclusivos..."  ← purple-text

    [grid 1 col mobile / 2 cols md, gap-10/12, items-center, mt-12]
      [coluna esquerda] Imagem 1:1
        <div aspect-square rounded-3xl overflow-hidden shadow-card>
          <img kitExclusivo loading="lazy" decoding="async" object-cover>
        </div>

      [coluna direita]
        [h3] "Kit Exclusivo para sua Corrida" — text-2xl/3xl extrabold, purple-title
        [p]  "Desenvolvemos um kit especial..."

        [ul space-y-5 mt-6]
          <KitItem icon=Shirt>     Camiseta Oficial / texto
          <KitItem icon=Hash>      Número de Peito / texto
          <KitItem icon=Droplets>  Hidratação / texto
          <KitItem icon=Medal>     Medalha Finisher / texto
</section>
```

### Componente local `KitItem`
- `<li className="flex gap-4">` com círculo `h-11 w-11 rounded-full bg-[color:var(--color-brand-orange)]/10 text-[color:var(--color-brand-orange)]` + ícone.
- Título `text-sm font-extrabold uppercase tracking-[0.18em] text-[color:var(--color-brand-purple-title)]`.
- Texto `text-sm/relaxed text-[color:var(--color-brand-purple-text)]/80 mt-1`.

### Ícones (lucide-react)
- `Shirt` — Camiseta Oficial
- `Hash` — Número de Peito
- `Droplets` — Hidratação
- `Medal` — Medalha Finisher

(Adicionar os que faltarem ao import existente de `lucide-react` no topo do arquivo.)

### Responsividade
- Mobile: imagem em cima, conteúdo embaixo (single column).
- `md:grid-cols-2` com imagem à esquerda e bloco textual à direita, `items-center`.
- Mesmo padrão de paddings já usado em "Percurso Completo" para manter consistência.

### Arquivos alterados
- `src/routes/index.tsx` — adicionar import da imagem + ícones faltantes, inserir `<KitExclusivo />` após o `</ContentSection>` da seção "Informações da Corrida" (linha 380), definir o componente `KitExclusivo` (+ helper `KitItem`) no fim do arquivo.
- `src/assets/kit-exclusivo.png` — novo asset (cópia do upload).

### Fora de escopo
- Sem alterações na rota `/kit`.
- Sem novas dependências.
- Nenhuma outra seção tocada.
