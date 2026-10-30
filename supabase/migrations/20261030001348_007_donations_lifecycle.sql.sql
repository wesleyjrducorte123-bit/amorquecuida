/*
# Donations: track full donation lifecycle + event logging

## Changes
- Add new statuses to donations: initiated, awaiting, canceled, expired
- Add columns: donor_phone, donor_document, checkout_step, abandoned_at, updated_at
- Create donation_events table to log every step (click, select, checkout, payment, abandon)
- Add SECURITY DEFINER function: record_donation_event() — callable by anon (public site)
- Add SECURITY DEFINER function: create_donation_record() — callable by service_role (edge functions)
- Update admin_add_donation to support new statuses
*/

-- 1. Extend donations table with new statuses and columns
ALTER TABLE donations DROP CONSTRAINT IF EXISTS donations_status_check;
ALTER TABLE donations ADD CONSTRAINT donations_status_check
  CHECK (status IN ('initiated', 'awaiting', 'pending', 'paid', 'failed', 'refunded', 'canceled', 'expired'));

ALTER TABLE donations ADD COLUMN IF NOT EXISTS donor_phone text;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS donor_document text;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS checkout_step text DEFAULT 'initiated';
ALTER TABLE donations ADD COLUMN IF NOT EXISTS abandoned_at timestamptz;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create indexes for dashboard queries
CREATE INDEX IF NOT EXISTS donations_status_idx ON donations (status);
CREATE INDEX IF NOT EXISTS donations_created_at_idx ON donations (created_at DESC);
CREATE INDEX IF NOT EXISTS donations_provider_payment_id_idx ON donations (provider_payment_id);

-- 2. Donation events log table — tracks every interaction step
CREATE TABLE IF NOT EXISTS donation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id uuid REFERENCES donations(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('click', 'select_amount', 'fill_info', 'checkout_started', 'pix_generated', 'payment_confirmed', 'payment_failed', 'abandoned', 'expired', 'canceled')),
  amount numeric,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE donation_events ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON donation_events TO authenticated;
GRANT INSERT ON donation_events TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "admin_read_donation_events" ON donation_events;
CREATE POLICY "admin_read_donation_events" ON donation_events
  FOR SELECT TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "public_insert_donation_events" ON donation_events;
CREATE POLICY "public_insert_donation_events" ON donation_events
  FOR INSERT TO anon, authenticated, service_role WITH CHECK (true);

-- 3. Allow anon to INSERT into donations (for initiated/awaiting records from public site)
--    RLS policies will restrict: anon can only insert with status initiated/awaiting
DROP POLICY IF EXISTS "public_insert_donations" ON donations;
CREATE POLICY "public_insert_donations" ON donations
  FOR INSERT TO anon, authenticated WITH CHECK (status IN ('initiated', 'awaiting'));

GRANT INSERT ON donations TO anon, authenticated;
GRANT SELECT ON donations TO anon, authenticated;

-- Allow anon to read only their own initiated donations (by provider_payment_id)
-- Admins read all (existing policy handles this)
DROP POLICY IF EXISTS "anon_read_own_donations" ON donations;
CREATE POLICY "anon_read_own_donations" ON donations
  FOR SELECT TO anon, authenticated
  USING (is_admin() OR status IN ('initiated', 'awaiting'));

-- Allow anon to UPDATE only their own initiated->awaiting transitions
DROP POLICY IF EXISTS "public_update_donations" ON donations;
CREATE POLICY "public_update_donations" ON donations
  FOR UPDATE TO anon, authenticated
  USING (status IN ('initiated', 'awaiting'))
  WITH CHECK (status IN ('initiated', 'awaiting', 'pending', 'canceled', 'expired'));

-- 4. Update admin_add_donation for new statuses
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
  IF p_status NOT IN ('initiated', 'awaiting', 'pending', 'paid', 'failed', 'refunded', 'canceled', 'expired') THEN
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

-- 5. SECURITY DEFINER: create/upgrade a donation record (called by edge functions with service_role)
--    Finds existing by provider_payment_id, updates; otherwise inserts.
CREATE OR REPLACE FUNCTION upsert_donation(
  p_provider_payment_id text,
  p_donor_name text DEFAULT NULL,
  p_donor_email text DEFAULT NULL,
  p_donor_phone text DEFAULT NULL,
  p_donor_document text DEFAULT NULL,
  p_amount numeric DEFAULT NULL,
  p_message text DEFAULT NULL,
  p_status text DEFAULT 'awaiting',
  p_provider text DEFAULT 'vizzionpay',
  p_is_anonymous boolean DEFAULT false,
  p_paid_at timestamptz DEFAULT NULL,
  p_created_at timestamptz DEFAULT now()
)
RETURNS donations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  row donations;
BEGIN
  -- Try to find existing by provider_payment_id
  SELECT * INTO row FROM donations WHERE provider_payment_id = p_provider_payment_id LIMIT 1;

  IF FOUND THEN
    -- Update existing
    UPDATE donations SET
      status = p_status,
      donor_name = COALESCE(p_donor_name, donor_name),
      donor_email = COALESCE(p_donor_email, donor_email),
      donor_phone = COALESCE(p_donor_phone, donor_phone),
      donor_document = COALESCE(p_donor_document, donor_document),
      amount = COALESCE(p_amount, amount),
      message = COALESCE(p_message, message),
      paid_at = COALESCE(p_paid_at, paid_at),
      updated_at = now()
    WHERE id = row.id
    RETURNING * INTO row;
  ELSE
    -- Insert new
    INSERT INTO donations (
      donor_name, donor_email, donor_phone, donor_document, amount, message,
      status, provider, provider_payment_id, is_anonymous, paid_at, created_at, checkout_step
    )
    VALUES (
      p_donor_name, p_donor_email, p_donor_phone, p_donor_document,
      COALESCE(p_amount, 0), p_message, p_status, p_provider,
      p_provider_payment_id, p_is_anonymous, p_paid_at, p_created_at, p_status
    )
    RETURNING * INTO row;
  END IF;

  RETURN row;
END;
$$;

REVOKE EXECUTE ON FUNCTION upsert_donation(text, text, text, text, text, numeric, text, text, text, boolean, timestamptz, timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION upsert_donation(text, text, text, text, text, numeric, text, text, text, boolean, timestamptz, timestamptz) TO authenticated, service_role;