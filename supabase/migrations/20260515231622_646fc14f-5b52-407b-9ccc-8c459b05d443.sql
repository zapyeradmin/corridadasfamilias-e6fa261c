-- Restringir listagem dos buckets públicos: somente admin pode listar
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

-- Revogar EXECUTE público de funções SECURITY DEFINER (continuam usadas pelas políticas RLS via security definer)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;