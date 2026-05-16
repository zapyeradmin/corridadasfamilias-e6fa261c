# DESENVOLVIMENTO — II Corrida das Famílias

Documento histórico do que foi construído neste projeto, da concepção à etapa atual de refatoração e otimização.

---

## 1. Visão geral

**Projeto:** Site oficial e plataforma de inscrições da **II Corrida das Famílias**, organizada pelo ECC da Paróquia de Nossa Senhora do Rosário, em Serra Talhada/PE.

- **Lema:** *"Juntos no Rosário, Famílias unidas na Fé"*
- **Distância:** 5 km
- **Data do evento:** 09 de agosto de 2026
- **Local de largada:** Igreja Matriz de Nossa Senhora do Rosário
- **Pilares:** Fé · Esporte em Família · Saúde · Solidariedade

---

## 2. Stack técnica

| Camada | Tecnologia |
| --- | --- |
| Framework | TanStack Start v1 (SSR) |
| UI | React 19 + Tailwind CSS v4 + shadcn/ui |
| Animações | Framer Motion |
| Build | Vite 7 (Cloudflare Workers em produção) |
| Backend | Lovable Cloud (Supabase: Auth + Postgres + RLS) |
| Pagamentos | Integração futura com gateway (preparado em `registrations`) |
| Hospedagem | Cloudflare via Lovable |

Roteamento por arquivos em `src/routes/`. Server functions tipadas via `createServerFn` em `src/lib/*.functions.ts`. Cliente Supabase de browser/admin separado em `src/integrations/supabase/`.

---

## 3. Modelo de dados (Supabase)

| Tabela | Função |
| --- | --- |
| `events` | Edições do evento (ativo, datas, local). |
| `lots` | Lotes de inscrição com janela de venda e preço. |
| `registrations` | Inscrições dos atletas (nome, CPF, status, valor). |
| `sponsors` | Patrocinadores com tier (`diamond`, `gold`, `silver`, `standard`). |
| `gallery_items` | Fotos publicadas na galeria. |
| `settings` | Configurações públicas/privadas chave-valor. |
| `user_roles` | Papéis (`admin`) — separado por segurança, com função `has_role` SECURITY DEFINER. |

RLS habilitado em todas as tabelas. Verificação de admin é sempre **server-side**.

---

## 4. Funcionalidades implementadas

### Site público
- **Home (`/`)** — hero com countdown, pilares, informações da corrida, cronograma oficial, vídeo de lançamento.
- **Regulamento (`/regulamento`)**
- **Percurso (`/percurso`)**
- **Kit (`/kit`)**
- **Premiação (`/premiacao`)**
- **Galeria (`/galeria`)** — alimentada pelo painel admin.
- **Patrocinadores (`/patrocinadores`)** — agrupados por tier.
- **FAQ (`/faq`)**
- **Política de Privacidade (`/politica-privacidade`)**

### Fluxo de inscrição
- **`/inscricao`** — formulário com validação de CPF, dados pessoais, contato de emergência.
- **`/inscricao/sucesso`** — confirmação com protocolo.

### Autenticação
- **`/login`** e **`/reset-password`** via Supabase Auth.
- Sincronização global de sessão em `__root.tsx` (`AuthSync`) que invalida queries em logout.

### Painel admin (`/_authenticated/admin/*`)
Protegido por `beforeLoad` que verifica papel `admin`:
- **Dashboard** — KPIs (total de inscrições, pagas, pendentes, receita).
- **Inscrições** — listagem, filtro, detalhe (`/admin/inscricoes/$id`).
- **Pagamentos**
- **Eventos & Lotes**
- **Patrocinadores** (CRUD)
- **Galeria** (CRUD)
- **Configurações**
- **Logs**

---

## 5. Design system

Tokens centralizados em **`src/styles.css`** (Tailwind v4 com `@theme inline`):

- **Cores brand:** `--color-brand-purple` (#431181), `--color-brand-orange` (#ff5300), `--color-brand-dark` (#16091f), `--color-brand-purple-title` (#830bc2), `--color-brand-purple-text` (#480c70), `--color-brand-amber` (#e9a521), `--color-brand-soft` (#e3e3e4).
- **Tipografia:** Montserrat (400–900) com fallback system-ui.
- **Gradientes utilitários:** `bg-gradient-orange`, `bg-gradient-hero`, `bg-gradient-premium`.
- **Sombras:** `shadow-orange`, `shadow-soft`, `shadow-card`, `shadow-premium`.
- **Raios:** escala de `--radius-sm` a `--radius-4xl`.

Componentes shadcn/ui em `src/components/ui/` consumindo os tokens.

---

## 6. Histórico de evolução do header

1. **Versão inicial** — header monolítico com gradientes.
2. **Alinhamento à esquerda** dos textos *"Inscrições abertas"* e *"Garanta sua vaga e celebre com a sua família"* na home.
3. **Menu mobile/tablet** — removida a sobreposição quando aberto, fundo sólido `--color-brand-dark`.
4. **Cor uniforme em desktop** — gradientes movidos para um wrapper `relative w-full` ocupando toda a largura, eliminando contraste nas laterais fora do container `max-w-[1360px]`.
5. **Refatoração atual** — header dividido em sub-componentes (ver seção 7).

---

## 7. Refatoração desta etapa

### Organização de código
- **Hook reutilizável `useAuth`** (`src/hooks/use-auth.ts`) — extraído do header. Centraliza listener de sessão e checagem do papel `admin`. Pode ser consumido em outras telas.
- **Header decomposto** em `src/components/site/header/`:
  - `header-decorations.tsx` — camadas de gradiente e brilhos.
  - `header-logo.tsx` — logo + texto da marca.
  - `desktop-nav.tsx` — navegação desktop com botão Inscreva-se, Admin e Sair.
  - `mobile-menu.tsx` — drawer mobile com fundo sólido.
- **`src/components/site/header.tsx`** vira um *composer* enxuto (~60 linhas vs. ~180 antes).

### Convenções
- Uso consistente de tokens semânticos (`color:var(--color-brand-*)`) em vez de hex inline em componentes — exceções restantes documentadas (gradiente decorativo do header e fundo translúcido `#2a0f4a`).
- Imports do `lucide-react` por nome (tree-shaking).
- Server functions seguem padrão `*.functions.ts` + helpers em `*.server.ts`.

---

## 8. Otimizações de performance

- **Preload da imagem LCP** (`hero-runner.jpg`) via `head().links` na rota `/` com `rel="preload" as="image" fetchpriority="high"`.
- **`fetchPriority="high"` + `decoding="async"`** no `<img>` do hero.
- **`loading="lazy" decoding="async"`** nas imagens fora do viewport inicial (informações da corrida, galeria, patrocinadores).
- **`staleTime: 5 min`** em queries públicas de baixa volatilidade (`gallery`, `sponsors`) para evitar refetches desnecessários.
- **Code-splitting automático** do TanStack Router preservado — componentes de rota não são exportados.
- **CSS:** Tailwind v4 com `@theme inline` (zero JS runtime); fontes Google com `display=swap` (sem bloqueio de render).
- **Backdrop-blur condicional** no header via `supports-[backdrop-filter]`.

---

## 9. Como rodar

```bash
bun install
bun run dev      # ambiente local (sandbox Lovable cuida disto automaticamente)
```

Variáveis de ambiente vêm do Lovable Cloud (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` no cliente; `SUPABASE_*` no servidor). Nada precisa ser configurado manualmente.

---

## 10. Próximos passos sugeridos

- Integrar gateway de pagamento real (Stripe/Pagar.me) e webhook em `/api/public/payment-webhook`.
- Geração automática de **número de peito** no momento da confirmação de pagamento.
- Envio de **e-mail transacional** com QR code para retirada do kit.
- Conversão das imagens estáticas para **WebP/AVIF** via `vite-imagetools`.
- Lazy split (`*.lazy.tsx`) das rotas admin para reduzir o bundle público.
- Página pública de **classificação pós-evento**.
- PWA (manifest + service worker) para acesso offline ao kit.

---

*Última atualização: maio/2026.*
