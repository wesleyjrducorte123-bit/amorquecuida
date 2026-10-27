import { supabase } from '@/lib/supabase';
import type { SiteContent } from '@/types/content';
import { defaultContent } from '@/config/defaultContent';

export interface ContentRow {
  id: string;
  published: SiteContent;
  draft: SiteContent;
  updated_at: string;
  updated_by: string | null;
}

export interface RevisionRow {
  id: string;
  content: SiteContent;
  published_by: string | null;
  published_at: string;
  note: string;
}

export interface MediaAsset {
  id: string;
  name: string;
  storage_path: string;
  public_url: string;
  mime_type: string | null;
  size_bytes: number | null;
  alt_text: string;
  title: string;
  description: string;
  created_at: string;
}

function mergeWithDefaults(partial: Partial<SiteContent> | null | undefined): SiteContent {
  if (!partial) return defaultContent;
  return {
    ...defaultContent,
    ...partial,
    brand: { ...defaultContent.brand, ...(partial.brand ?? {}) },
    seo: { ...defaultContent.seo, ...(partial.seo ?? {}) },
    appearance: { ...defaultContent.appearance, ...(partial.appearance ?? {}) },
    sections: partial.sections ?? defaultContent.sections,
    hero: { ...defaultContent.hero, ...(partial.hero ?? {}) },
    progress: { ...defaultContent.progress, ...(partial.progress ?? {}) },
    impact: { ...defaultContent.impact, ...(partial.impact ?? {}) },
    tiers: {
      ...defaultContent.tiers,
      ...(partial.tiers ?? {}),
      options: partial.tiers?.options ?? defaultContent.tiers.options,
    },
    reality: { ...defaultContent.reality, ...(partial.reality ?? {}) },
    hope: { ...defaultContent.hope, ...(partial.hope ?? {}) },
    testimonials: {
      ...defaultContent.testimonials,
      ...(partial.testimonials ?? {}),
      items: partial.testimonials?.items ?? defaultContent.testimonials.items,
    },
    faq: {
      ...defaultContent.faq,
      ...(partial.faq ?? {}),
      items: partial.faq?.items ?? defaultContent.faq.items,
    },
    footer: {
      ...defaultContent.footer,
      ...(partial.footer ?? {}),
      contact: { ...defaultContent.footer.contact, ...(partial.footer?.contact ?? {}) },
    },
  } as SiteContent;
}

export async function loadPublishedContent(): Promise<SiteContent> {
  const { data, error } = await supabase
    .from('published_content')
    .select('id, published, updated_at')
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return defaultContent;
  return mergeWithDefaults(data.published as Partial<SiteContent>);
}

export async function loadContentRow(): Promise<ContentRow | null> {
  const { data, error } = await supabase
    .from('site_content')
    .select('id, published, draft, updated_at, updated_by')
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id,
    published: mergeWithDefaults(data.published as Partial<SiteContent>),
    draft: mergeWithDefaults(data.draft as Partial<SiteContent>),
    updated_at: data.updated_at,
    updated_by: data.updated_by,
  };
}

export async function saveDraft(content: SiteContent): Promise<void> {
  const existing = await loadContentRow();
  if (existing) {
    const { error } = await supabase
      .from('site_content')
      .update({ draft: content as unknown as Record<string, unknown>, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('site_content')
      .insert({ published: content as unknown as Record<string, unknown>, draft: content as unknown as Record<string, unknown> });
    if (error) throw error;
  }
}

export async function publishContent(content: SiteContent, note = ''): Promise<void> {
  const existing = await loadContentRow();
  const nowIso = new Date().toISOString();
  if (existing) {
    const { error: revError } = await supabase.from('content_revisions').insert({
      content: existing.published as unknown as Record<string, unknown>,
      published_at: existing.updated_at ?? nowIso,
      note,
    });
    if (revError) throw revError;

    const { error } = await supabase
      .from('site_content')
      .update({
        published: content as unknown as Record<string, unknown>,
        draft: content as unknown as Record<string, unknown>,
        updated_at: nowIso,
      })
      .eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('site_content').insert({
      published: content as unknown as Record<string, unknown>,
      draft: content as unknown as Record<string, unknown>,
    });
    if (error) throw error;
  }
}

export async function discardDraft(): Promise<void> {
  const existing = await loadContentRow();
  if (!existing) return;
  const { error } = await supabase
    .from('site_content')
    .update({ draft: existing.published as unknown as Record<string, unknown>, updated_at: new Date().toISOString() })
    .eq('id', existing.id);
  if (error) throw error;
}

export async function loadRevisions(): Promise<RevisionRow[]> {
  const { data, error } = await supabase
    .from('content_revisions')
    .select('id, content, published_by, published_at, note')
    .order('published_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []).map((r) => ({
    ...r,
    content: mergeWithDefaults(r.content as Partial<SiteContent>),
  })) as RevisionRow[];
}

export async function restoreRevision(revisionId: string): Promise<void> {
  const { data, error } = await supabase
    .from('content_revisions')
    .select('content')
    .eq('id', revisionId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Revisão não encontrada.');
  await publishContent(mergeWithDefaults(data.content as Partial<SiteContent>), 'Restauração de versão anterior');
}

export async function listMedia(): Promise<MediaAsset[]> {
  const { data, error } = await supabase
    .from('media_assets')
    .select('id, name, storage_path, public_url, mime_type, size_bytes, alt_text, title, description, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as MediaAsset[];
}

export async function uploadMedia(file: File, alt = ''): Promise<MediaAsset> {
  const ext = file.name.split('.').pop() ?? 'bin';
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error: upErr } = await supabase.storage.from('media').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  });
  if (upErr) throw upErr;

  const { data: pub } = supabase.storage.from('media').getPublicUrl(path);
  const publicUrl = pub.publicUrl;

  const { data, error } = await supabase
    .from('media_assets')
    .insert({
      name: file.name,
      storage_path: path,
      public_url: publicUrl,
      mime_type: file.type,
      size_bytes: file.size,
      alt_text: alt,
    })
    .select('id, name, storage_path, public_url, mime_type, size_bytes, alt_text, title, description, created_at')
    .single();
  if (error) throw error;
  return data as MediaAsset;
}

export async function updateMedia(id: string, patch: Partial<MediaAsset>): Promise<void> {
  const { error } = await supabase
    .from('media_assets')
    .update({
      alt_text: patch.alt_text,
      title: patch.title,
      description: patch.description,
    })
    .eq('id', id);
  if (error) throw error;
}

export interface Donation {
  id: string;
  donor_name: string | null;
  donor_email: string | null;
  amount: number;
  currency: string;
  message: string | null;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  provider: string;
  provider_payment_id: string | null;
  is_anonymous: boolean;
  created_at: string;
  paid_at: string | null;
}

export interface DonationStats {
  totalRaised: number;
  donorCount: number;
  paidCount: number;
  pendingCount: number;
  averageAmount: number;
  recent: Donation[];
}

export async function listDonations(): Promise<Donation[]> {
  const { data, error } = await supabase
    .from('donations')
    .select('id, donor_name, donor_email, amount, currency, message, status, provider, provider_payment_id, is_anonymous, created_at, paid_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Donation[];
}

export async function loadDonationStats(): Promise<DonationStats> {
  const donations = await listDonations();
  const paid = donations.filter((d) => d.status === 'paid');
  const totalRaised = paid.reduce((sum, d) => sum + Number(d.amount), 0);
  const donorCount = new Set(paid.map((d) => d.donor_email ?? d.id)).size;
  return {
    totalRaised,
    donorCount,
    paidCount: paid.length,
    pendingCount: donations.filter((d) => d.status === 'pending').length,
    averageAmount: paid.length > 0 ? totalRaised / paid.length : 0,
    recent: donations.slice(0, 8),
  };
}

export async function addDonation(input: {
  donor_name?: string | null;
  donor_email?: string | null;
  amount: number;
  message?: string | null;
  status?: 'pending' | 'paid' | 'failed' | 'refunded';
  provider?: string;
  is_anonymous?: boolean;
  paid_at?: string | null;
}): Promise<Donation> {
  const { data, error } = await supabase.rpc('admin_add_donation', {
    p_donor_name: input.donor_name ?? null,
    p_donor_email: input.donor_email ?? null,
    p_amount: input.amount,
    p_message: input.message ?? null,
    p_status: input.status ?? 'paid',
    p_provider: input.provider ?? 'manual',
    p_is_anonymous: input.is_anonymous ?? false,
    p_paid_at: input.paid_at ?? new Date().toISOString(),
  });
  if (error) throw error;
  return data as unknown as Donation;
}

export async function updateDonationStatus(id: string, status: Donation['status']): Promise<void> {
  const patch: Record<string, unknown> = { status };
  if (status === 'paid') patch.paid_at = new Date().toISOString();
  const { error } = await supabase.from('donations').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteDonation(id: string): Promise<void> {
  const { error } = await supabase.from('donations').delete().eq('id', id);
  if (error) throw error;
}

export async function deleteMedia(asset: MediaAsset): Promise<void> {
  const { error: delErr } = await supabase.storage.from('media').remove([asset.storage_path]);
  if (delErr) throw delErr;
  const { error } = await supabase.from('media_assets').delete().eq('id', asset.id);
  if (error) throw error;
}
