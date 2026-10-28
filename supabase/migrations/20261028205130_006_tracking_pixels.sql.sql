/*
# Tracking Pixels & Ad Conversion Configuration

## Purpose
Stores configuration for advertising tracking pixels (Meta/Facebook/Instagram,
Google Ads, TikTok, Kwai) so the admin can enable/disable each platform and
configure pixel IDs, conversion IDs/labels, and event settings from the CMS.

## New Tables
- `tracking_pixels`
  - `platform` (text, primary key) — e.g. 'meta', 'google', 'tiktok', 'kwai'
  - `enabled` (boolean, default false) — whether the pixel loads on the public site
  - `settings` (jsonb, default '{}') — platform-specific config (pixel IDs,
    conversion IDs, labels, event toggles). Only non-secret identifiers.
  - `updated_at` (timestamptz)

## Security
- RLS enabled.
- Public read: the anon-key frontend must load pixel configs to render
  tracking scripts. Only non-secret identifiers (pixel IDs, conversion labels)
  are stored here — never tokens or service-role keys.
- Admin write: only authenticated admins (via is_admin()) can insert/update.
- 4 separate policies (select/insert/update/delete).
*/

CREATE TABLE IF NOT EXISTS public.tracking_pixels (
  platform text PRIMARY KEY,
  enabled boolean NOT NULL DEFAULT false,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tracking_pixels ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.tracking_pixels TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.tracking_pixels TO authenticated;

DROP POLICY IF EXISTS "public_read_tracking_pixels" ON public.tracking_pixels;
CREATE POLICY "public_read_tracking_pixels" ON public.tracking_pixels
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_tracking_pixels" ON public.tracking_pixels;
CREATE POLICY "admin_insert_tracking_pixels" ON public.tracking_pixels
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_update_tracking_pixels" ON public.tracking_pixels;
CREATE POLICY "admin_update_tracking_pixels" ON public.tracking_pixels
  FOR UPDATE TO authenticated USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_tracking_pixels" ON public.tracking_pixels;
CREATE POLICY "admin_delete_tracking_pixels" ON public.tracking_pixels
  FOR DELETE TO authenticated USING (public.is_admin());

-- Seed rows for all supported platforms so the admin UI has stable records
INSERT INTO public.tracking_pixels (platform, enabled, settings)
VALUES
  ('meta', false, '{}'::jsonb),
  ('google', false, '{}'::jsonb),
  ('tiktok', false, '{}'::jsonb),
  ('kwai', false, '{}'::jsonb)
ON CONFLICT (platform) DO NOTHING;