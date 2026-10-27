/*
# Storage policies for media bucket

## Changes
- Public read on the `media` bucket (public_url is used by the public site).
- Authenticated admins can upload/update/delete files via is_admin() check.
*/

DROP POLICY IF EXISTS "public_read_media_bucket" ON storage.objects;
CREATE POLICY "public_read_media_bucket" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'media');

DROP POLICY IF EXISTS "admin_insert_media_bucket" ON storage.objects;
CREATE POLICY "admin_insert_media_bucket" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media' AND public.is_admin());

DROP POLICY IF EXISTS "admin_update_media_bucket" ON storage.objects;
CREATE POLICY "admin_update_media_bucket" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'media' AND public.is_admin())
  WITH CHECK (bucket_id = 'media' AND public.is_admin());

DROP POLICY IF EXISTS "admin_delete_media_bucket" ON storage.objects;
CREATE POLICY "admin_delete_media_bucket" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'media' AND public.is_admin());
