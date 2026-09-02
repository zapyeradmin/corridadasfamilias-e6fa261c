-- ============================================================
-- Bootstrap: apply all existing project migrations to the
-- fresh Lovable Cloud backend in dependency order.
-- Storage buckets were created separately via the Storage API.
-- ============================================================

-- Schema usage grants required by PostgREST/Data API
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- ============================================================
-- 20260515231436_f98bed5c-5a8d-44bd-9368-c65c312c7542.sql
-- ============================================================

-- Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'staff');
CREATE TYPE public.registration_status AS ENUM ('pending', 'processing', 'paid', 'failed', 'canceled', 'refunded');
CREATE TYPE public.payment_status AS ENUM ('pending', 'processing', 'paid', 'failed', 'canceled', 'refunded');
CREATE TYPE public.gender AS ENUM ('M', 'F', 'O');
CREATE TYPE public.shirt_size AS ENUM ('PP', 'P', 'M', 'G', 'GG', 'XGG');

GRANT USAGE ON TYPE public.app_role TO authenticated, anon, service_role;
GRANT USAGE ON TYPE public.registration_status TO authenticated, anon, service_role;
GRANT USAGE ON TYPE public.payment_status TO authenticated, anon, service_role;
GRANT USAGE ON TYPE public.gender TO authenticated, anon, service_role;
GRANT USAGE ON TYPE public.shirt_size TO authenticated, anon, service_role;

-- Helper functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.normalize_cpf(_cpf text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT regexp_replace(coalesce(_cpf, ''), '[^0-9]', '', 'g');
$$;

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Events
CREATE TABLE public.events (
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

GRANT SELECT ON public.events TO anon, authenticated;
GRANT ALL ON public.events TO service_role;

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER events_set_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Anyone can view active events"
  ON public.events FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can view all events"
  ON public.events FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Lots
CREATE TABLE public.lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  max_slots INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.lots TO anon, authenticated;
GRANT ALL ON public.lots TO service_role;

ALTER TABLE public.lots ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_lots_event ON public.lots(event_id);

CREATE TRIGGER lots_set_updated_at
  BEFORE UPDATE ON public.lots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Anyone can view active lots"
  ON public.lots FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can view all lots"
  ON public.lots FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Registrations
CREATE TABLE public.registrations (
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.registrations TO authenticated;
GRANT ALL ON public.registrations TO service_role;

ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.set_registration_cpf_normalized()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.cpf_normalized = public.normalize_cpf(NEW.cpf);
  RETURN NEW;
END;
$$;

CREATE TRIGGER registrations_normalize_cpf
  BEFORE INSERT OR UPDATE OF cpf ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION public.set_registration_cpf_normalized();

CREATE TRIGGER registrations_set_updated_at
  BEFORE UPDATE ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE UNIQUE INDEX uniq_active_registration_cpf
  ON public.registrations (event_id, cpf_normalized)
  WHERE status IN ('pending', 'processing', 'paid');

CREATE INDEX idx_registrations_event_status ON public.registrations(event_id, status);
CREATE INDEX idx_registrations_email ON public.registrations(email);

CREATE POLICY "Admins can view all registrations"
  ON public.registrations FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Payments
CREATE TABLE public.payments (
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_payments_registration ON public.payments(registration_id);
CREATE INDEX idx_payments_status ON public.payments(status);

CREATE TRIGGER payments_set_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Admins can view all payments"
  ON public.payments FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Sponsors
CREATE TABLE public.sponsors (
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

GRANT SELECT ON public.sponsors TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sponsors TO authenticated;
GRANT ALL ON public.sponsors TO service_role;

ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER sponsors_set_updated_at
  BEFORE UPDATE ON public.sponsors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Anyone can view published sponsors"
  ON public.sponsors FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Admins can view all sponsors"
  ON public.sponsors FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Gallery
CREATE TABLE public.gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  title TEXT,
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.gallery_items TO anon, authenticated;
GRANT ALL ON public.gallery_items TO service_role;

ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER gallery_set_updated_at
  BEFORE UPDATE ON public.gallery_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Anyone can view published gallery items"
  ON public.gallery_items FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Admins can view all gallery items"
  ON public.gallery_items FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Settings
CREATE TABLE public.settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_public BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.settings TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.settings TO authenticated;
GRANT ALL ON public.settings TO service_role;

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER settings_set_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Anyone can read public settings"
  ON public.settings FOR SELECT
  TO anon, authenticated
  USING (is_public = true);

CREATE POLICY "Admins can read all settings"
  ON public.settings FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Access logs
CREATE TABLE public.access_logs (
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

GRANT SELECT, INSERT ON public.access_logs TO authenticated;
GRANT ALL ON public.access_logs TO service_role;

ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_access_logs_created ON public.access_logs(created_at DESC);
CREATE INDEX idx_access_logs_actor ON public.access_logs(actor_id);

CREATE POLICY "Admins can view access logs"
  ON public.access_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Storage policies (buckets created via Storage API)
CREATE POLICY "Public can read gallery images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'gallery');

CREATE POLICY "Public can read sponsor images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'sponsors');

CREATE POLICY "Admins can manage gallery images"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage sponsor images"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'sponsors' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'sponsors' AND public.has_role(auth.uid(), 'admin'));

-- Seed
INSERT INTO public.events (slug, name, edition, description, event_date, location, city, state, is_active)
VALUES (
  'ii-corrida-das-familias',
  'II Corrida das Famílias',
  'II Edição',
  'Uma celebração de fé, esporte, saúde e solidariedade reunindo famílias inteiras.',
  '2026-08-09 06:00:00-03',
  'Centro de Petrolina',
  'Petrolina',
  'PE',
  true
);

INSERT INTO public.lots (event_id, name, price_cents, starts_at, ends_at, sort_order, is_active)
SELECT
  id,
  'Lote Promocional',
  6000,
  now(),
  '2026-06-30 23:59:59-03',
  1,
  true
FROM public.events WHERE slug = 'ii-corrida-das-familias';

INSERT INTO public.settings (key, value, is_public) VALUES
  ('whatsapp_number', '"5587999999999"'::jsonb, true),
  ('contact_email', '"contato@corridadasfamilias.com.br"'::jsonb, true),
  ('instagram_url', '"https://instagram.com/corridadasfamilias"'::jsonb, true);

-- ============================================================
-- 20260515231622_646fc14f-5b52-407b-9ccc-8c459b05d443.sql
-- ============================================================

DROP POLICY IF EXISTS "Public can read gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Public can read sponsor images" ON storage.objects;

CREATE POLICY "Admins can list gallery images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can list sponsor images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'sponsors' AND public.has_role(auth.uid(), 'admin'));

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;

-- ============================================================
-- 20260515235033_44487c67-e3da-4208-b0d4-1f768504d684.sql
-- (guarded because the original user may not exist in this Cloud backend)
-- ============================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = 'c82fbe1f-f164-4518-80e8-4d94fc80aa05') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES ('c82fbe1f-f164-4518-80e8-4d94fc80aa05', 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;

-- ============================================================
-- 20260516000815_92b26098-bdd2-47f7-890c-b0af3985df24.sql
-- ============================================================

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, anon;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = 'c82fbe1f-f164-4518-80e8-4d94fc80aa05') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES ('c82fbe1f-f164-4518-80e8-4d94fc80aa05', 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;

-- ============================================================
-- 20260516002921_ee42e0df-45ec-4ac6-ade1-2ecb7e14362f.sql
-- ============================================================

CREATE POLICY "Admins can insert access logs"
  ON public.access_logs FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update registrations"
  ON public.registrations FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update payments"
  ON public.payments FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- 20260516003147_7529e249-8784-428d-bb8a-0e93786c9233.sql
-- ============================================================

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;

-- ============================================================
-- 20260518000005_60d89c94-6d82-4b55-9176-5a450f5aeeb4.sql
-- ============================================================

INSERT INTO public.sponsors (name, logo_url, website_url, tier, sort_order, is_published)
VALUES ('Oracle Digital', '/sponsors/oracle-digital.png', NULL, 'diamond', 0, true);

-- ============================================================
-- 20260518002252_eb370f7b-85a9-4b7c-910a-188d0e178e3a.sql
-- ============================================================

INSERT INTO public.sponsors (name, logo_url, tier, is_published, sort_order)
VALUES ('Nattivo Café', '/sponsors/nattivo-cafe.png', 'diamond', true, 0);

-- ============================================================
-- 20260518003728_6c0e7625-6c38-493c-bfea-b094f6b9b491.sql
-- ============================================================

INSERT INTO public.sponsors (name, logo_url, tier, is_published, sort_order)
VALUES ('Urbano Alimentos', '/sponsors/urbano-alimentos.png', 'diamond', true, 0);

-- ============================================================
-- 20260518005119_eee24f83-92f3-4f64-a556-c04f4af79b7b.sql
-- ============================================================

INSERT INTO public.sponsors (name, logo_url, tier, is_published, sort_order)
VALUES ('Prefeitura de Serra Talhada', '/sponsors/prefeitura-serra-talhada.png', 'diamond', true, 0);

-- ============================================================
-- 20260519032225_a814f5db-5160-4218-843a-49874c1efac2.sql
-- ============================================================

ALTER TABLE public.lots ADD COLUMN IF NOT EXISTS child_price_cents integer;
UPDATE public.lots SET price_cents = 6800, child_price_cents = 4800 WHERE is_active = true;

-- ============================================================
-- 20260519032709_19329d05-f0a5-4d5d-bc6b-d557be18b730.sql
-- ============================================================

CREATE POLICY "Admins can insert roles"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update roles"
  ON public.user_roles
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- ============================================================
-- 20260519033346_85166c32-e05e-4bf8-8517-9968d8b9b914.sql
-- ============================================================

ALTER TYPE public.gender RENAME TO gender_old;
CREATE TYPE public.gender AS ENUM ('M', 'F');
ALTER TABLE public.registrations
  ALTER COLUMN gender TYPE public.gender USING gender::text::public.gender;
DROP TYPE public.gender_old;

-- ============================================================
-- 20260519192618_ee81d8e7-1bfd-407f-9bd8-5a6592680b43.sql
-- ============================================================

INSERT INTO public.settings (key, value, is_public)
VALUES
  ('infinitepay_checkout_adulto_url', '""'::jsonb, true),
  ('infinitepay_checkout_crianca_url', '""'::jsonb, true)
ON CONFLICT (key) DO NOTHING;

ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS order_nsu text,
  ADD COLUMN IF NOT EXISTS participant_type text;

CREATE UNIQUE INDEX IF NOT EXISTS registrations_order_nsu_key
  ON public.registrations (order_nsu)
  WHERE order_nsu IS NOT NULL;

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS transaction_nsu text,
  ADD COLUMN IF NOT EXISTS invoice_slug text,
  ADD COLUMN IF NOT EXISTS receipt_url text,
  ADD COLUMN IF NOT EXISTS capture_method text,
  ADD COLUMN IF NOT EXISTS installments integer,
  ADD COLUMN IF NOT EXISTS paid_amount_cents integer;

CREATE UNIQUE INDEX IF NOT EXISTS payments_transaction_nsu_key
  ON public.payments (transaction_nsu)
  WHERE transaction_nsu IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.infinitepay_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  received_at timestamptz NOT NULL DEFAULT now(),
  transaction_nsu text,
  order_nsu text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  processed boolean NOT NULL DEFAULT false,
  match_status text NOT NULL DEFAULT 'unmatched',
  registration_id uuid,
  notes text
);

GRANT SELECT, INSERT, UPDATE ON public.infinitepay_events TO authenticated;
GRANT ALL ON public.infinitepay_events TO service_role;

CREATE UNIQUE INDEX IF NOT EXISTS infinitepay_events_transaction_nsu_key
  ON public.infinitepay_events (transaction_nsu)
  WHERE transaction_nsu IS NOT NULL;

ALTER TABLE public.infinitepay_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view infinitepay events" ON public.infinitepay_events;
CREATE POLICY "Admins can view infinitepay events"
  ON public.infinitepay_events
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update infinitepay events" ON public.infinitepay_events;
CREATE POLICY "Admins can update infinitepay events"
  ON public.infinitepay_events
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- 20260519194951_da219962-1384-4817-aedd-c9838bf066ee.sql
-- ============================================================

CREATE POLICY "Admins can insert settings"
  ON public.settings FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update settings"
  ON public.settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- 20260520140403_8ddc4c55-314f-4111-849f-4f0cf20dce29.sql
-- ============================================================

CREATE POLICY "Admins can insert sponsors"
  ON public.sponsors FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update sponsors"
  ON public.sponsors FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete sponsors"
  ON public.sponsors FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can upload sponsor logos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'sponsors' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update sponsor logos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'sponsors' AND has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (bucket_id = 'sponsors' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete sponsor logos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'sponsors' AND has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- 20260526165007_bf6585f9-38e2-41b1-b90f-8c4fcb9114ee.sql
-- ============================================================

ALTER TABLE public.sponsors REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sponsors;

-- ============================================================
-- 20260526172556_4893d77c-ab09-46c1-aa1f-3bc6a6fdffc0.sql
-- ============================================================

CREATE POLICY "Home video public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'home-video');

CREATE POLICY "Admins upload home video"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'home-video' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update home video"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'home-video' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete home video"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'home-video' AND public.has_role(auth.uid(), 'admin'::app_role));