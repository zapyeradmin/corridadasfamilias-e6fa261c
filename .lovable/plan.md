## Nova seção: "Categorias e Premiações"

Adicionar uma nova seção na home (`src/routes/index.tsx`), **logo após** a seção "Inscrições abertas" (CTA Final, linha 472-523), antes do fechamento `</>`.

### Continuidade visual com a seção anterior
A seção "Inscrições abertas" usa `bg-gradient-orange` (gradiente laranja). Para garantir continuidade visual com fundo sólido `#ff5300`:
- A nova seção usará `bg-[color:var(--color-brand-orange)]` (= `#ff5300`).
- O gradiente da seção anterior já termina em `#e9591b`, então adicionarei uma transição suave: a nova seção começa com um pequeno gradiente do tom final do laranja anterior para o `#ff5300` sólido, mantendo a sensação de fundo contínuo.

### Estrutura da seção

```text
<section bg=#ff5300, py grande>
  container max-w-[1200px]
    [eyebrow] "CATEGORIAS E PREMIAÇÕES"            ← esquerda, branco/80
    [h2]      "CATEGORIAS E PREMIAÇÕES DA CORRIDA" ← esquerda, branco, heading-section
    [p]       texto introdutório justificado, branco/90, max-w controlado
    
    [grid 1 col mobile / 3 cols desktop, gap-6]
      Card 1: Geral Masc + Geral Fem
      Card 2: Infanto-Juvenil Masc + Fem
      Card 3: 60+ Masc + Fem
</section>
```

### Anatomia de cada card
Card branco: `bg-white rounded-3xl shadow-card p-8`, flex coluna, altura igual (`h-full`) com distribuição uniforme do grid.

Cada card contém **dois sub-blocos** (Masculino e Feminino) separados por divisor sutil (`border-t border-[color:var(--color-brand-purple)]/10`) e `mt-8 pt-8`.

Estrutura de cada sub-bloco:
1. Ícone esportivo centralizado em círculo de fundo suave (azul `bg-blue-50 text-blue-600` para masculino / rosa `bg-pink-50 text-pink-600` para feminino), tamanho 64x64.
2. Título centralizado (ex: "Geral Masculino"), `text-xl font-extrabold uppercase` na cor `--color-brand-purple-text`.
3. Lista das 3 premiações: cada linha com badge do lugar (1º/2º/3º) com cor crescente (ouro/prata/bronze ou laranja em tons) + texto da premiação.

### Ícones (lucide-react, já instalado)
Lucide não tem ícones específicos por gênero/idade, mas tem família de pessoas esportivas. Usarei:
- **Geral Masculino / Feminino**: `PersonStanding` (genérico esportivo) — diferenciado pela cor (azul vs rosa) e legenda.
- **Infanto-Juvenil Masc / Fem**: `Baby` ou `Footprints` — usarei `Footprints` com cor (mais "jovem corredor").
- **60+ Masc / Fem**: `Accessibility` ou novamente `PersonStanding` com badge "60+".

Para clareza visual, usarei o mesmo ícone `PersonStanding` em todos os cards (única opção esportiva de pessoa no Lucide), mas:
- Diferenciado por **cor** (azul `#2563eb` para masculino, rosa `#ec4899` para feminino).
- Diferenciado por **badge sobreposto** no círculo do ícone para categorias não-gerais: "Jovem" no infanto-juvenil e "60+" no idoso.

Isso mantém consistência visual e atende ao requisito de ícones azuis/rosas para masc/fem.

### Dados (array local na seção)
```ts
const categorias = [
  { titulo: "Geral", premiosMasc: [...500/300/200], premiosFem: [...], badge: null },
  { titulo: "Infanto-Juvenil", premios: [só troféu+medalha], badge: "Jovem" },
  { titulo: "60+", premios: [só troféu+medalha], badge: "60+" },
];
```

### Responsividade
- Mobile: 1 coluna, cards empilhados (`grid-cols-1`).
- Tablet/Desktop: 3 colunas (`md:grid-cols-3`).
- Cards mantêm `h-full` para alturas uniformes.
- Espaçamento interno generoso em desktop (`p-8`) e confortável em mobile (`p-6`).

### Tokens de design
- Fundo seção: `#ff5300` (já existe `--color-brand-orange`).
- Cards: branco com `shadow-card` (já existente).
- Cor masculino: `text-blue-600` / `bg-blue-50`.
- Cor feminino: `text-pink-600` / `bg-pink-50`.
- Títulos dos cards: `--color-brand-purple-text`.
- Badges de lugar: gradiente do `--color-brand-orange` para tom mais escuro (1º), tom médio (2º), tom claro (3º) — mantendo paleta da marca.

### Arquivos a alterar
- `src/routes/index.tsx` — apenas adicionar o novo `<section>` antes do `</>` final. Sem novos arquivos.

### Fora de escopo
- Sem alterações na página `/premiacao` existente.
- Sem mudanças no header/footer.
- Sem novas dependências.
