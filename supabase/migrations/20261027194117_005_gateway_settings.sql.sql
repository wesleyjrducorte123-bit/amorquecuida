/*
# Gateway settings table — store VizzionPay payment credentials

1. New Tables
- `gateway_settings`
  - `id` (uuid, primary key)
  - `provider` (text, not null, default 'vizzionpay' — which gateway these credentials belong to)
  - `public_key` (text, nullable — x-public-key for VizzionPay API)
  - `secret_key` (text, nullable — x-secret-key for VizzionPay API, stored encrypted-at-rest by Supabase)
  - `webhook_url` (text, nullable — the callback URL configured in VizzionPay panel)
  - `webhook_token` (text, nullable — token to validate incoming webhook notifications)
  - `enabled` (boolean, default false — whether the gateway is active)
  - `updated_at` (timestamptz, default now())
  - `updated_by` (uuid, nullable — admin who last changed settings)

2. Security
- Enable RLS on `gateway_settings`.
- GRANT SELECT, UPDATE to `authenticated` (admins read/update credentials via the panel).
- No INSERT/DELETE grants for browser roles — a single row is seeded here and only updated.
- Policies:
  - `admin_read_gateway_settings`: authenticated admins (is_admin()) can SELECT.
  - `admin_update_gateway_settings`: authenticated admins can UPDATE.

3. Notes
- Only one row exists (singleton pattern). It is seeded with empty values.
- The public site never reads this table directly — it calls an edge function which reads credentials server-side using the service role key.
- The webhook_url field is informational: the admin copies the edge function URL here and pastes it into the VizzionPay panel. The webhook_token is used to validate incoming webhook requests.
*/

CREATE TABLE IF NOT EXISTS gateway_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL DEFAULT 'vizzionpay',
  public_key text,
  secret_key text,
  webhook_url text,
  webhook_token text,
  enabled boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

ALTER TABLE gateway_settings ENABLE ROW LEVEL SECURITY;

GRANT SELECT, UPDATE ON gateway_settings TO authenticated;
GRANT SELECT ON gateway_settings TO service_role;

DROP POLICY IF EXISTS "admin_read_gateway_settings" ON gateway_settings;
CREATE POLICY "admin_read_gateway_settings"
  ON gateway_settings FOR SELECT
  TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "admin_update_gateway_settings" ON gateway_settings;
CREATE POLICY "admin_update_gateway_settings"
  ON gateway_settings FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Seed a singleton row so the admin panel can always UPDATE it.
INSERT INTO gateway_settings (provider, public_key, secret_key, webhook_url, webhook_token, enabled)
VALUES ('vizzionpay', null, null, null, null, false)
ON CONFLICT DO NOTHING;
