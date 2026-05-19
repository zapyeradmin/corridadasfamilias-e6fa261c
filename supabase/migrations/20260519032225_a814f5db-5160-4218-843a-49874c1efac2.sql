ALTER TABLE public.lots ADD COLUMN IF NOT EXISTS child_price_cents integer;
UPDATE public.lots SET price_cents = 6800, child_price_cents = 4800 WHERE is_active = true;