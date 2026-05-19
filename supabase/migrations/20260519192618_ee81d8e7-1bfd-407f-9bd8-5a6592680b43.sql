
-- 1) Settings rows for InfinitePay checkout URLs (public so client can read)
INSERT INTO public.settings (key, value, is_public)
VALUES
  ('infinitepay_checkout_adulto_url', '""'::jsonb, true),
  ('infinitepay_checkout_crianca_url', '""'::jsonb, true)
ON CONFLICT (key) DO NOTHING;

-- 2) registrations: add order_nsu + participant_type
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS order_nsu text,
  ADD COLUMN IF NOT EXISTS participant_type text;

CREATE UNIQUE INDEX IF NOT EXISTS registrations_order_nsu_key
  ON public.registrations (order_nsu)
  WHERE order_nsu IS NOT NULL;

-- 3) payments: add InfinitePay return fields
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

-- 4) infinitepay_events table (audit + idempotency)
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
