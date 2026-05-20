## Diagnóstico

- A logo do "Alexsandro Supermercados" foi salva corretamente no banco (`tier: gold`, `logo_url` em Storage), mas:
  - O card renderiza a imagem com `max-h-[78%] max-w-[82%]` + `object-contain`, por isso fica pequena dentro do card branco.
  - Na home (`/`) só são renderizados sponsors com `tier = "diamond"`. Como o novo é `gold`, ele não aparece.
  - Em `/patrocinadores`, o grid principal só mostra `diamond`; gold/silver/standard aparecem em seções separadas abaixo, então o "Alexsandro" aparece numa seção "Ouro" e não nas vagas 5–24.

## Mudanças

### 1. Logo ocupando o card inteiro (com as mesmas bordas)
Arquivos: `src/components/home/home-patrocinadores.tsx`, `src/routes/patrocinadores.tsx`, `src/routes/_authenticated/admin.patrocinadores.tsx`.

- Trocar a classe da `<img>` de `max-h-[78%] max-w-[82%] object-contain` (+ `LOGO_SCALE`) por:
  - `h-full w-full object-cover rounded-2xl` no card público (home e /patrocinadores).
  - Remover o padding interno do card (`p-3 md:p-4`) para a logo encostar nas bordas; manter `rounded-2xl`, `border` e `shadow` do card.
- O upload já exige exatamente 960×540 (mesmo aspect 16/9 do card), então `object-cover` preenche perfeitamente sem distorcer.
- No admin (preview do card e do diálogo) aplicar o mesmo tratamento para refletir como aparece no site.

### 2. Unificar o grid em 24 vagas (posições 5–24 ocupadas por qualquer novo patrocinador)
Arquivo: `src/components/home/home-patrocinadores.tsx` e `src/routes/patrocinadores.tsx`.

Nova regra de montagem do grid:

1. Posições 1–4: sponsors `tier = "diamond"` ordenados por `created_at` (com fallback para os 4 bundled quando o DB estiver vazio).
2. Posições 5–24: TODOS os demais sponsors publicados (`gold`, `silver`, `standard`) ordenados por `created_at` ascendente — ou seja, o primeiro adicionado vai para a vaga 5, o próximo para a 6, e assim até a 24.
3. Vagas restantes continuam como `PlaceholderCard` numerado ("Patrocinador N").
4. Limite total = 24 cards. Se houver mais de 20 não-diamond, os excedentes são ignorados no grid principal.

Em `/patrocinadores`, remover as seções separadas por tier (Ouro / Prata / Apoiadores) — o grid único de 24 vagas passa a ser a única apresentação, atendendo o pedido do usuário.

### 3. Ordenação consistente
Arquivo: `src/lib/public.functions.ts`.

- Alterar `getPublishedSponsors` para retornar também `created_at` e ordenar por `created_at ASC` (mantendo `sort_order` como tiebreaker se útil). Isso garante "primeiro adicionado, primeira vaga".

### 4. Link clicável preservado
- O card inteiro (logo full-bleed) vira o `<a target="_blank">` quando houver `website_url`, mantendo `rounded-2xl` e o hover atual.

## O que NÃO muda

- Tabela `sponsors`, RLS, Storage, admin CRUD, filtros, paginação (8 por página) e validações 960×540 / 2MB permanecem como estão.
- Mensagem de WhatsApp, CTA "Inscreva-se Já!" e cabeçalhos das páginas permanecem.

## Resultado esperado

- Após implementar, o "Alexsandro Supermercados" aparece na vaga 5 tanto em `/` quanto em `/patrocinadores`, com a logo cobrindo o card inteiro e bordas arredondadas idênticas ao grid. Cada novo patrocinador adicionado preencherá a próxima vaga (6, 7, …, 24).
