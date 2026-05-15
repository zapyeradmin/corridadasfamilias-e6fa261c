-- =========================================
-- ENUMS
-- =========================================
CREATE TYPE public.app_role AS ENUM ('admin', 'staff');
CREATE TYPE public.registration_status AS ENUM ('pending', 'processing', 'paid', 'failed', 'canceled', 'refunded');
CREATE TYPE public.payment_status AS ENUM ('pending', 'processing', 'paid', 'failed', 'canceled', 'refunded');
CREATE TYPE public.gender AS ENUM ('M', 'F', 'O');
CREATE TYPE public.shirt_size AS ENUM ('PP', 'P', 'M', 'G', 'GG', 'XGG');

-- =========================================
-- HELPER FUNCTIONS
-- =========================================
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

-- =========================================
-- USER ROLES (must be created early for has_role)
-- =========================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

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

-- =========================================
-- EVENTS
-- =========================================
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

-- =========================================
-- LOTS
-- =========================================
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

-- =========================================
-- REGISTRATIONS
-- =========================================
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

-- =========================================
-- PAYMENTS
-- =========================================
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

-- =========================================
-- SPONSORS
-- =========================================
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

-- =========================================
-- GALLERY
-- =========================================
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

-- =========================================
-- SETTINGS
-- =========================================
CREATE TABLE public.settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_public BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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

-- =========================================
-- ACCESS LOGS
-- =========================================
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

ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_access_logs_created ON public.access_logs(created_at DESC);
CREATE INDEX idx_access_logs_actor ON public.access_logs(actor_id);

CREATE POLICY "Admins can view access logs"
  ON public.access_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =========================================
-- STORAGE BUCKETS
-- =========================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true), ('sponsors', 'sponsors', true)
ON CONFLICT (id) DO NOTHING;

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

-- =========================================
-- SEED
-- =========================================
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