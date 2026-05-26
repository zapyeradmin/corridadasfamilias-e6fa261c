## Objetivo

Permitir que o admin gerencie o vídeo de lançamento da seção "Inscrições abertas" da home (`/`) pela aba "Configurações de Contatos" em `/admin/configuracoes` — URL do YouTube + capa (jpg/png/webp ≤3MB) — persistindo no Supabase e refletindo automaticamente no frontend.

## Banco de dados (migration)

1. Novo bucket público `home-video` no Supabase Storage com policies (leitura pública, upload/update/delete só para admins via `has_role`).
2. Nova chave `home_video` em `public.settings` (jsonb), `is_public = true`, com formato:
   ```json
   { "youtube_url": "https://www.youtube.com/watch?v=...", "cover_url": "https://.../home-video/...webp" }
   ```
   (Sem alteração de schema da tabela `settings` — só um upsert.)

## Server functions (`src/lib/`)

- `public.functions.ts`
  - `getHomeVideo()` — lê `settings` onde `key = 'home_video'`, retorna `{ youtube_url, cover_url }` (strings, podem ser vazias).
- `admin.functions.ts`
  - `updateHomeVideo({ youtube_url, cover_url })` — admin only; valida URL do YouTube (regex aceita `youtube.com/watch?v=`, `youtu.be/`, `youtube.com/embed/`, `shorts/`); upsert em `settings` com `is_public = true`; grava em `access_logs`.
  - `uploadHomeVideoCover({ filename, contentType, dataBase64 })` — admin only; aceita `image/jpeg|png|webp`; rejeita >3MB; envia para bucket `home-video`; retorna `publicUrl`.

## Frontend

- `src/lib/youtube.ts` (novo) — `parseYoutubeId(url): string | null` cobrindo watch, youtu.be, embed, shorts.
- `src/components/admin/configuracoes/tab-contatos.tsx`
  - Nova seção "Vídeo de Lançamento (Home)" abaixo dos contatos, com:
    - Campo "Adicionar URL do YouTube" (texto, com preview do ID detectado).
    - Campo "Capa do Vídeo (JPG, PNG ou WEBP, até 3MB)" — `<input type="file">` que faz upload via `uploadHomeVideoCover` e mostra preview.
    - Botão "Salvar Vídeo" chamando `updateHomeVideo`, invalida `["public","home-video"]`.
  - Hook `useQuery(["public","home-video"], getHomeVideo)` para popular os campos.
- `src/components/home/home-cta-video.tsx`
  - Consome `getHomeVideo` via `useQuery(["public","home-video"], …, { staleTime: 60_000 })`.
  - URL do iframe = `https://www.youtube.com/embed/{parseYoutubeId(youtube_url) || "TE_hIXiN544"}?autoplay=1&rel=0`.
  - Imagem da capa = `cover_url` quando preenchida; senão fallback `@/assets/capa-video-lancamento.jpg` atual.
  - Mantém o comportamento de play on-click (sem mudar UI).

## Sincronização

- Tanto a home quanto a tab Contatos usam a mesma queryKey `["public","home-video"]`. O `onSuccess` do save invalida a query → home atualiza sem reload (e em outras abas/dispositivos quando a query revalida, igual ao padrão já usado para `site_contacts`).

## Validações / segurança

- YouTube URL: regex no servidor; rejeita string vazia com mensagem clara (admin pode limpar enviando `youtube_url: ""` para voltar ao fallback).
- Upload: limite 3MB (`bytes.byteLength > 3 * 1024 * 1024`), contentType allowlist, nome de arquivo saneado (mesmo padrão de `uploadSponsorLogo`).
- RLS já cobre `settings` (admin update, public read quando `is_public`). Bucket novo recebe policies equivalentes.

## Fora de escopo

- Não muda o layout/copy da seção "Inscrições abertas".
- Não adiciona realtime na tabela `settings` — a invalidação de query no save já cobre o cenário pedido.

Confirma para implementar?