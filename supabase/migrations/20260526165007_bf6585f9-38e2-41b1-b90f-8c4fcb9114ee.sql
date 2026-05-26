ALTER TABLE public.sponsors REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sponsors;