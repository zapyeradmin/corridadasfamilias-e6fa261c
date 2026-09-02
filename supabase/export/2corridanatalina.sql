-- =====================================================================
-- Migração completa — Corrida das Famílias
-- Destino: projeto Supabase "2corridanatalina" (org corridanatalina)
-- Gerado em 2026-09-02 a partir do backend atual (schema + dados).
--
-- COMO USAR:
--   1. No painel do seu projeto, crie os buckets em Storage:
--        gallery, sponsors, home-video  (marque como PÚBLICOS)
--   2. Abra SQL Editor > New query, cole este arquivo inteiro e execute.
--   3. Crie o usuário admin em Authentication > Users e rode o bloco
--      final (SEED ADMIN) com o UUID desse usuário.
--
-- Script idempotente: pode ser executado mais de uma vez sem erro.
-- =====================================================================

-- =========================================
-- 1. ENUMS
-- =========================================
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'staff');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.registration_status AS ENUM ('pending','processing','paid','failed','canceled','refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_status AS ENUM ('pending','processing','paid','failed','canceled','refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.gender AS ENUM ('M', 'F');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.shirt_size AS ENUM ('PP','P','M','G','GG','XGG');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =========================================
-- 2. FUNÇÕES
-- =========================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.normalize_cpf(_cpf text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT regexp_replace(coalesce(_cpf, ''), '[^0-9]', '', 'g');
$$;

CREATE OR REPLACE FUNCTION public.set_registration_cpf_normalized()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.cpf_normalized = public.normalize_cpf(NEW.cpf);
  RETURN NEW;
END;
$$;

-- =========================================
-- 3. TABELAS
-- =========================================
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  edition TEXT,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  location TEXT,
  city TEXT,
  state TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  child_price_cents INTEGER,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  max_slots INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_lots_event ON public.lots(event_id);

CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE RESTRICT,
  lot_id UUID NOT NULL REFERENCES public.lots(id) ON DELETE RESTRICT,
  full_name TEXT NOT NULL,
  cpf TEXT NOT NULL,
  cpf_normalized TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  birth_date DATE NOT NULL,
  gender public.gender NOT NULL,
  shirt_size public.shirt_size NOT NULL,
  category TEXT NOT NULL,
  emergency_contact_name TEXT NOT NULL,
  emergency_contact_phone TEXT NOT NULL,
  medical_notes TEXT,
  accepted_terms BOOLEAN NOT NULL DEFAULT false,
  accepted_lgpd BOOLEAN NOT NULL DEFAULT false,
  status public.registration_status NOT NULL DEFAULT 'pending',
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
  protocol TEXT NOT NULL UNIQUE DEFAULT upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  order_nsu TEXT,
  participant_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_active_registration_cpf
  ON public.registrations (event_id, cpf_normalized)
  WHERE status IN ('pending', 'processing', 'paid');
CREATE UNIQUE INDEX IF NOT EXISTS registrations_order_nsu_key
  ON public.registrations (order_nsu) WHERE order_nsu IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_registrations_event_status ON public.registrations(event_id, status);
CREATE INDEX IF NOT EXISTS idx_registrations_email ON public.registrations(email);

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'infinitypay',
  provider_session_id TEXT,
  provider_event_id TEXT UNIQUE,
  external_reference TEXT,
  status public.payment_status NOT NULL DEFAULT 'pending',
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
  checkout_url TEXT,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  paid_at TIMESTAMPTZ,
  transaction_nsu TEXT,
  invoice_slug TEXT,
  receipt_url TEXT,
  capture_method TEXT,
  installments INTEGER,
  paid_amount_cents INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payments_registration ON public.payments(registration_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE UNIQUE INDEX IF NOT EXISTS payments_transaction_nsu_key
  ON public.payments (transaction_nsu) WHERE transaction_nsu IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  website_url TEXT,
  tier TEXT NOT NULL DEFAULT 'standard',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  title TEXT,
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_public BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_access_logs_created ON public.access_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_access_logs_actor ON public.access_logs(actor_id);

CREATE TABLE IF NOT EXISTS public.infinitepay_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  transaction_nsu TEXT,
  order_nsu TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  processed BOOLEAN NOT NULL DEFAULT false,
  match_status TEXT NOT NULL DEFAULT 'unmatched',
  registration_id UUID,
  notes TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS infinitepay_events_transaction_nsu_key
  ON public.infinitepay_events (transaction_nsu) WHERE transaction_nsu IS NOT NULL;

-- =========================================
-- 4. GRANTS (Data API / PostgREST)
-- =========================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT ON public.events, public.lots, public.sponsors, public.gallery_items, public.settings TO anon;
GRANT SELECT ON public.events, public.lots, public.gallery_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sponsors TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.settings TO authenticated;
GRANT SELECT, UPDATE ON public.registrations, public.payments, public.infinitepay_events TO authenticated;
GRANT SELECT, INSERT ON public.access_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;

GRANT ALL ON public.events, public.lots, public.registrations, public.payments,
  public.sponsors, public.gallery_items, public.settings, public.access_logs,
  public.infinitepay_events, public.user_roles TO service_role;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- =========================================
-- 5. RLS
-- =========================================
ALTER TABLE public.user_roles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lots                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_logs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.infinitepay_events  ENABLE ROW LEVEL SECURITY;

-- user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
CREATE POLICY "Admins can insert roles" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
CREATE POLICY "Admins can update roles" ON public.user_roles
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
CREATE POLICY "Admins can delete roles" ON public.user_roles
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- events
DROP POLICY IF EXISTS "Anyone can view active events" ON public.events;
CREATE POLICY "Anyone can view active events" ON public.events
  FOR SELECT TO anon, authenticated USING (is_active = true);
DROP POLICY IF EXISTS "Admins can view all events" ON public.events;
CREATE POLICY "Admins can view all events" ON public.events
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- lots
DROP POLICY IF EXISTS "Anyone can view active lots" ON public.lots;
CREATE POLICY "Anyone can view active lots" ON public.lots
  FOR SELECT TO anon, authenticated USING (is_active = true);
DROP POLICY IF EXISTS "Admins can view all lots" ON public.lots;
CREATE POLICY "Admins can view all lots" ON public.lots
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- registrations
DROP POLICY IF EXISTS "Admins can view all registrations" ON public.registrations;
CREATE POLICY "Admins can view all registrations" ON public.registrations
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can update registrations" ON public.registrations;
CREATE POLICY "Admins can update registrations" ON public.registrations
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- payments
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
CREATE POLICY "Admins can view all payments" ON public.payments
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can update payments" ON public.payments;
CREATE POLICY "Admins can update payments" ON public.payments
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- sponsors
DROP POLICY IF EXISTS "Anyone can view published sponsors" ON public.sponsors;
CREATE POLICY "Anyone can view published sponsors" ON public.sponsors
  FOR SELECT TO anon, authenticated USING (is_published = true);
DROP POLICY IF EXISTS "Admins can view all sponsors" ON public.sponsors;
CREATE POLICY "Admins can view all sponsors" ON public.sponsors
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can insert sponsors" ON public.sponsors;
CREATE POLICY "Admins can insert sponsors" ON public.sponsors
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can update sponsors" ON public.sponsors;
CREATE POLICY "Admins can update sponsors" ON public.sponsors
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can delete sponsors" ON public.sponsors;
CREATE POLICY "Admins can delete sponsors" ON public.sponsors
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- gallery_items
DROP POLICY IF EXISTS "Anyone can view published gallery items" ON public.gallery_items;
CREATE POLICY "Anyone can view published gallery items" ON public.gallery_items
  FOR SELECT TO anon, authenticated USING (is_published = true);
DROP POLICY IF EXISTS "Admins can view all gallery items" ON public.gallery_items;
CREATE POLICY "Admins can view all gallery items" ON public.gallery_items
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- settings
DROP POLICY IF EXISTS "Anyone can read public settings" ON public.settings;
CREATE POLICY "Anyone can read public settings" ON public.settings
  FOR SELECT TO anon, authenticated USING (is_public = true);
DROP POLICY IF EXISTS "Admins can read all settings" ON public.settings;
CREATE POLICY "Admins can read all settings" ON public.settings
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can insert settings" ON public.settings;
CREATE POLICY "Admins can insert settings" ON public.settings
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can update settings" ON public.settings;
CREATE POLICY "Admins can update settings" ON public.settings
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- access_logs
DROP POLICY IF EXISTS "Admins can view access logs" ON public.access_logs;
CREATE POLICY "Admins can view access logs" ON public.access_logs
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can insert access logs" ON public.access_logs;
CREATE POLICY "Admins can insert access logs" ON public.access_logs
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- infinitepay_events
DROP POLICY IF EXISTS "Admins can view infinitepay events" ON public.infinitepay_events;
CREATE POLICY "Admins can view infinitepay events" ON public.infinitepay_events
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can update infinitepay events" ON public.infinitepay_events;
CREATE POLICY "Admins can update infinitepay events" ON public.infinitepay_events
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================
-- 6. TRIGGERS
-- =========================================
DROP TRIGGER IF EXISTS events_set_updated_at ON public.events;
CREATE TRIGGER events_set_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS lots_set_updated_at ON public.lots;
CREATE TRIGGER lots_set_updated_at BEFORE UPDATE ON public.lots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS registrations_set_updated_at ON public.registrations;
CREATE TRIGGER registrations_set_updated_at BEFORE UPDATE ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS registrations_normalize_cpf ON public.registrations;
CREATE TRIGGER registrations_normalize_cpf BEFORE INSERT OR UPDATE OF cpf ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION public.set_registration_cpf_normalized();

DROP TRIGGER IF EXISTS payments_set_updated_at ON public.payments;
CREATE TRIGGER payments_set_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS sponsors_set_updated_at ON public.sponsors;
CREATE TRIGGER sponsors_set_updated_at BEFORE UPDATE ON public.sponsors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS gallery_set_updated_at ON public.gallery_items;
CREATE TRIGGER gallery_set_updated_at BEFORE UPDATE ON public.gallery_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS settings_set_updated_at ON public.settings;
CREATE TRIGGER settings_set_updated_at BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- 7. REALTIME (patrocinadores em tempo real no site)
-- =========================================
ALTER TABLE public.sponsors REPLICA IDENTITY FULL;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.sponsors;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =========================================
-- 8. STORAGE POLICIES
-- (crie antes os buckets: gallery, sponsors, home-video)
-- =========================================
DROP POLICY IF EXISTS "Public can read gallery images" ON storage.objects;
CREATE POLICY "Public can read gallery images" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'gallery');

DROP POLICY IF EXISTS "Public can read sponsor images" ON storage.objects;
CREATE POLICY "Public can read sponsor images" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'sponsors');

DROP POLICY IF EXISTS "Home video public read" ON storage.objects;
CREATE POLICY "Home video public read" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'home-video');

DROP POLICY IF EXISTS "Admins can manage gallery images" ON storage.objects;
CREATE POLICY "Admins can manage gallery images" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can manage sponsor images" ON storage.objects;
CREATE POLICY "Admins can manage sponsor images" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'sponsors' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'sponsors' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can manage home video" ON storage.objects;
CREATE POLICY "Admins can manage home video" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'home-video' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'home-video' AND public.has_role(auth.uid(), 'admin'));

-- =========================================
-- 9. DADOS
-- =========================================

-- Evento
INSERT INTO public.events (id, slug, name, edition, description, event_date, location, city, state, is_active)
VALUES (
  '0bbf8e43-8cff-465a-938c-a886fecf0281',
  'ii-corrida-das-familias',
  'II Corrida das Famílias',
  'II Edição',
  'Uma celebração de fé, esporte, saúde e solidariedade reunindo famílias inteiras.',
  '2026-08-09T09:00:00+00:00',
  'Centro de Petrolina',
  'Petrolina',
  'PE',
  true
) ON CONFLICT (id) DO NOTHING;

-- Lote (ends_at estendido até 30/11/2026 para manter as inscrições abertas)
INSERT INTO public.lots (id, event_id, name, price_cents, child_price_cents, starts_at, ends_at, max_slots, sort_order, is_active)
VALUES (
  '97716890-76a7-4855-98aa-f1c0c53c6f30',
  '0bbf8e43-8cff-465a-938c-a886fecf0281',
  'Lote Promocional',
  6800,
  4800,
  '2026-01-01T00:00:00+00:00',
  '2026-11-30T23:59:59+00:00',
  NULL,
  1,
  true
) ON CONFLICT (id) DO NOTHING;

-- Patrocinadores
INSERT INTO public.sponsors (id, name, logo_url, website_url, tier, sort_order, is_published) VALUES
  ('23f98a99-4fb0-4a79-8c2a-a4df44959c3d', 'Oracle Digital', '/sponsors/oracle-digital.png', NULL, 'diamond', 0, true),
  ('9e77774e-8944-419a-930a-d7008af323b3', 'Nattivo Café', '/sponsors/nattivo-cafe.png', NULL, 'diamond', 0, true),
  ('d54eb70a-0602-4dea-9b09-939d15633ea5', 'Urbano Alimentos', '/sponsors/urbano-alimentos.png', NULL, 'diamond', 0, true),
  ('d2413633-0593-495f-823e-02ae14fc20ae', 'Prefeitura de Serra Talhada', '/sponsors/prefeitura-serra-talhada.png', NULL, 'diamond', 0, true)
ON CONFLICT (id) DO NOTHING;

-- Settings
INSERT INTO public.settings (key, value, is_public) VALUES
  ('whatsapp_number',  '"558799628-9326"'::jsonb, true),
  ('contact_email',    '"contato@corridadasfamilias.com.br"'::jsonb, true),
  ('instagram_url',    '"https://instagram.com/corridadasfamilias"'::jsonb, true),
  ('infinitepay_checkout_adulto_url',  '""'::jsonb, true),
  ('infinitepay_checkout_crianca_url', '""'::jsonb, true),
  ('site_contacts', '{"local":"","email_oficial":"contato@corridadasfamilias.com.br","whatsapp_oficial":"558799628-9326","instagram_url":"https://instagram.com/corridadasfamilias","instagram_usuario":"@corridadasfamilias"}'::jsonb, true),
  ('home_video', '{"youtube_url":"","cover_url":""}'::jsonb, true)
ON CONFLICT (key) DO NOTHING;

-- Os links de checkout da InfinitePay (conta ii-corrida-das-familias) devem ser
-- preenchidos em /admin/configuracoes > Pagamento, ou aqui:
-- UPDATE public.settings SET value = '"https://checkout.infinitepay.io/SEU-LINK-ADULTO"'::jsonb
--   WHERE key = 'infinitepay_checkout_adulto_url';
-- UPDATE public.settings SET value = '"https://checkout.infinitepay.io/SEU-LINK-CRIANCA"'::jsonb
--   WHERE key = 'infinitepay_checkout_crianca_url';

-- Inscrições, pagamentos, eventos InfinitePay, galeria e logs: sem registros
-- no backend de origem — nada a migrar.

-- =========================================
-- 10. SEED ADMIN (rodar depois de criar o usuário em Authentication > Users)
-- =========================================
-- INSERT INTO public.user_roles (user_id, role)
-- SELECT id, 'admin' FROM auth.users WHERE email = 'SEU-EMAIL-ADMIN@dominio.com'
-- ON CONFLICT (user_id, role) DO NOTHING;
