import { supabase } from '@/lib/supabase';

export type DonationStatus =
  | 'initiated'
  | 'awaiting'
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'canceled'
  | 'expired';

export type DonationEventType =
  | 'click'
  | 'select_amount'
  | 'fill_info'
  | 'checkout_started'
  | 'pix_generated'
  | 'payment_confirmed'
  | 'payment_failed'
  | 'abandoned'
  | 'expired'
  | 'canceled';

export interface NewDonation {
  id: string;
  status: DonationStatus;
}

/**
 * Creates a donation record with status 'initiated' when a visitor clicks
 * the donate button. Returns the donation ID for subsequent tracking.
 */
export async function initiateDonation(amount: number): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('donations')
      .insert({
        amount,
        status: 'initiated',
        provider: 'vizzionpay',
        checkout_step: 'click',
      })
      .select('id')
      .single();
    if (error || !data) return null;
    return data.id;
  } catch {
    return null;
  }
}

/**
 * Updates the donation's checkout step and logs an event.
 */
export async function updateDonationStep(
  donationId: string,
  step: string,
  eventType: DonationEventType,
  amount?: number,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await supabase
      .from('donations')
      .update({ checkout_step: step, updated_at: new Date().toISOString() })
      .eq('id', donationId);

    await supabase.from('donation_events').insert({
      donation_id: donationId,
      event_type: eventType,
      amount: amount ?? null,
      metadata: metadata ?? {},
    });
  } catch {
    // Tracking failures should never break the donation flow
  }
}

/**
 * Marks a donation as abandoned when the modal closes without payment.
 */
export async function markAbandoned(donationId: string | null): Promise<void> {
  if (!donationId) return;
  try {
    await supabase
      .from('donations')
      .update({
        status: 'initiated',
        checkout_step: 'abandoned',
        abandoned_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', donationId)
      .in('status', ['initiated', 'awaiting']);

    await supabase.from('donation_events').insert({
      donation_id: donationId,
      event_type: 'abandoned',
    });
  } catch {
    // Silent fail
  }
}

/**
 * Updates donor information on an existing donation record.
 */
export async function updateDonorInfo(
  donationId: string,
  info: {
    donor_name?: string | null;
    donor_email?: string | null;
    donor_phone?: string | null;
    donor_document?: string | null;
    message?: string | null;
    is_anonymous?: boolean;
  }
): Promise<void> {
  try {
    await supabase
      .from('donations')
      .update({
        ...info,
        checkout_step: 'fill_info',
        updated_at: new Date().toISOString(),
      })
      .eq('id', donationId);
  } catch {
    // Silent fail
  }
}
