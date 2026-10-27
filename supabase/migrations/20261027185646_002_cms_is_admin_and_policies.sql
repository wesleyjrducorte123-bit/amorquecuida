/*
# CMS: is_admin() helper + admin write policies

## Changes
- Creates the SECURITY DEFINER `is_admin()` helper (admin_profiles now exists).
- Replaces the self-only content/media/revision policies with admin-scoped ones
  using is_admin(), while keeping public read intact.
- Tightens content_revisions policies from self-published-only to admin-scoped
  (admins can see/restore all history, not just their own).
- Promotes the first signed-in user to admin via a one-time trigger-safe path
  handled in application code (see frontend instructions).

## Security
- is_admin() is STABLE, SECURITY DEFINER, fixed search_path, revoked from PUBLIC/anon.
- Admin write policies use USING + WITH CHECK = is_admin() on content + media.
- content_revisions: admin read/insert/delete.
- admin_profiles: admins can manage all profile rows (add/remove admins).
*/

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE user_id = auth.uid() AND is_admin = true
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- admin_profiles: admins can manage all rows
DROP POLICY IF EXISTS "admins_manage_profiles" ON public.admin_profiles;
CREATE POLICY "admins_manage_profiles" ON public.admin_profiles
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- site_content: admin write
DROP POLICY IF EXISTS "admin_write_site_content" ON public.site_content;
CREATE POLICY "admin_write_site_content" ON public.site_content
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- media_assets: admin write
DROP POLICY IF EXISTS "admin_write_media" ON public.media_assets;
CREATE POLICY "admin_write_media" ON public.media_assets
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- content_revisions: admin scoped
DROP POLICY IF EXISTS "admin_read_revisions" ON public.content_revisions;
CREATE POLICY "admin_read_revisions" ON public.content_revisions
  FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "admin_insert_revisions" ON public.content_revisions;
CREATE POLICY "admin_insert_revisions" ON public.content_revisions
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_revisions" ON public.content_revisions;
CREATE POLICY "admin_delete_revisions" ON public.content_revisions
  FOR DELETE TO authenticated
  USING (public.is_admin());
