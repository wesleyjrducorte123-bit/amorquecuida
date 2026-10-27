/*
# Donations table — track payment transactions

1. New Tables
- `donations`
  - `id` (uuid, primary key)
  - `donor_name` (text, optional — the name shown on the donation)
  - `donor_email` (text, optional — contact email of the donor)
  - `amount` (numeric, not null — amount donated in BRL)
  - `currency` (text, default 'BRL')
  - `message` (text, optional — public message left by donor)
  - `status` (text, not null, default 'pending' — one of: pending, paid, failed, refunded)
  - `provider` (text, default 'manual' — which payment provider, e.g. 'stripe', 'manual')
  - `provider_payment_id` (text, optional — external transaction ID for reconciliation)
  - `is_anonymous` (boolean, default false — hide donor name on public display)
  - `created_at` (timestamptz, default now())
  - `paid_at` (timestamptz, optional — when payment was confirmed)

2. Security
- Enable RLS on `donations`.
- GRANT SELECT to `authenticated` (admins read donors via the panel).
- GRANT INSERT to `service_role` only (edge functions/webhooks record donations server-side; the browser never inserts directly).
- No UPDATE/DELETE grants for browser roles — status changes go through a SECURITY DEFINER function or edge function.
- Policies:
  - `admin_read_donations`: authenticated admins (is_admin()) can SELECT all donations.
  - `service_insert_donations`: service_role can INSERT (bypasses RLS, but grant is still needed).

3. Notes
- The public site cannot read or write this table directly from the browser. Only the admin panel (authenticated, is_admin) can view donations. A future payment-provider integration (Stripe, etc.) would insert rows server-side via an edge function using the service role key.
- An admin can also manually add a donation (e.g. a bank transfer recorded by hand) through the panel — this insert runs as an authenticated admin via a SECURITY DEFINER function `admin_add_donation()`.
*/

CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_name text,
  donor_email text,
  amount numeric(12, 2) NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'BRL',
  message text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  provider text NOT NULL DEFAULT 'manual',
  provider_payment_id text,
  is_anonymous boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz
);

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON donations TO authenticated;
GRANT INSERT ON donations TO service_role;

DROP POLICY IF EXISTS "admin_read_donations" ON donations;
CREATE POLICY "admin_read_donations"
  ON donations FOR SELECT
  TO authenticated
  USING (is_admin());

-- Admins can update donation status (e.g. mark as paid, refund) directly.
DROP POLICY IF EXISTS "admin_update_donations" ON donations;
CREATE POLICY "admin_update_donations"
  ON donations FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Admins can delete a donation record.
DROP POLICY IF EXISTS "admin_delete_donations" ON donations;
CREATE POLICY "admin_delete_donations"
  ON donations FOR DELETE
  TO authenticated
  USING (is_admin());

-- Grant UPDATE/DELETE to authenticated so the policies above can take effect.
GRANT UPDATE, DELETE ON donations TO authenticated;

-- SECURITY DEFINER function: let an authenticated admin manually insert a donation.
-- The browser client (authenticated) has no direct INSERT grant, so this is the only path.
CREATE OR REPLACE FUNCTION admin_add_donation(
  p_donor_name text,
  p_donor_email text,
  p_amount numeric,
  p_message text DEFAULT NULL,
  p_status text DEFAULT 'paid',
  p_provider text DEFAULT 'manual',
  p_is_anonymous boolean DEFAULT false,
  p_paid_at timestamptz DEFAULT now()
)
RETURNS donations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  row donations;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Apenas administradores podem registrar doações.';
  END IF;
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Valor da doação deve ser positivo.';
  END IF;
  IF p_status NOT IN ('pending', 'paid', 'failed', 'refunded') THEN
    RAISE EXCEPTION 'Status inválido.';
  END IF;

  INSERT INTO donations (donor_name, donor_email, amount, message, status, provider, is_anonymous, paid_at)
  VALUES (p_donor_name, p_donor_email, p_amount, p_message, p_status, p_provider, p_is_anonymous, p_paid_at)
  RETURNING * INTO row;

  RETURN row;
END;
$$;

REVOKE EXECUTE ON FUNCTION admin_add_donation(text, text, numeric, text, text, text, boolean, timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION admin_add_donation(text, text, numeric, text, text, text, boolean, timestamptz) TO authenticated;

-- Index for common dashboard queries.
CREATE INDEX IF NOT EXISTS donations_status_idx ON donations (status);
CREATE INDEX IF NOT EXISTS donations_created_at_idx ON donations (created_at DESC);
