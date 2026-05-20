-- Admin write policies for sponsors
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

-- Storage policies for sponsors bucket
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