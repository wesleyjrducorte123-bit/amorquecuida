/*
# CMS schema: tables only (no function-dependent policies)

Creates the four CMS tables WITHOUT any policy that references is_admin(),
so nothing depends on a not-yet-existing function. A second migration
creates is_admin() and the admin-write policies.

## Tables
1. admin_profiles — extends auth.users with is_admin flag.
2. site_content — single content document: published + draft jsonb.
3. media_assets — library of uploaded images/videos metadata.
4. content_revisions — history of published content snapshots.

## Security in this migration
- RLS enabled on every table.
- Public read granted on site_content + media_assets (anon + authenticated).
- Self-read on admin_profiles (a user can read their own profile row).
- Admin-write policies are added in 002 after is_admin() exists.
*/

CREATE TABLE IF NOT EXISTS public.admin_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_profiles TO authenticated, service_role;

DROP POLICY IF EXISTS "self_read_profile" ON public.admin_profiles;
CREATE POLICY "self_read_profile" ON public.admin_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  published jsonb NOT NULL DEFAULT '{}'::jsonb,
  draft jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.site_content TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_content TO authenticated, service_role;

DROP POLICY IF EXISTS "public_read_site_content" ON public.site_content;
CREATE POLICY "public_read_site_content" ON public.site_content
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE OR REPLACE VIEW public.published_content
WITH (security_invoker = true)
AS
  SELECT id, published, updated_at FROM public.site_content;

GRANT SELECT ON public.published_content TO anon, authenticated;

CREATE TABLE IF NOT EXISTS public.media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  storage_path text NOT NULL,
  public_url text NOT NULL,
  mime_type text,
  size_bytes bigint,
  alt_text text DEFAULT '',
  title text DEFAULT '',
  description text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.media_assets TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.media_assets TO authenticated, service_role;

DROP POLICY IF EXISTS "public_read_media" ON public.media_assets;
CREATE POLICY "public_read_media" ON public.media_assets
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS public.content_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content jsonb NOT NULL,
  published_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at timestamptz NOT NULL DEFAULT now(),
  note text DEFAULT ''
);

ALTER TABLE public.content_revisions ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.content_revisions TO authenticated;
GRANT INSERT, DELETE ON public.content_revisions TO authenticated, service_role;

DROP POLICY IF EXISTS "admin_read_revisions" ON public.content_revisions;
CREATE POLICY "admin_read_revisions" ON public.content_revisions
  FOR SELECT TO authenticated
  USING (auth.uid() = published_by);

DROP POLICY IF EXISTS "admin_insert_revisions" ON public.content_revisions;
CREATE POLICY "admin_insert_revisions" ON public.content_revisions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = published_by);

DROP POLICY IF EXISTS "admin_delete_revisions" ON public.content_revisions;
CREATE POLICY "admin_delete_revisions" ON public.content_revisions
  FOR DELETE TO authenticated
  USING (auth.uid() = published_by);

CREATE INDEX IF NOT EXISTS content_revisions_published_at_idx
  ON public.content_revisions (published_at DESC);
