INSERT INTO storage.buckets (id, name, public) VALUES ('home-video', 'home-video', true) ON CONFLICT (id) DO NOTHING;

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