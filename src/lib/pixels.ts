import { supabase } from '@/lib/supabase';

export type PixelPlatform = 'meta' | 'google' | 'tiktok' | 'kwai';

export interface PixelConfig {
  platform: PixelPlatform;
  enabled: boolean;
  settings: Record<string, unknown>;
}

export interface MetaSettings {
  pixelId: string;
  trackPageView: boolean;
  trackLead: boolean;
}

export interface GoogleSettings {
  tagId: string;
  conversionId: string;
  conversionLabel: string;
  trackPageView: boolean;
  trackLead: boolean;
}

export interface TiktokSettings {
  pixelId: string;
  trackPageView: boolean;
  trackLead: boolean;
}

export interface KwaiSettings {
  pixelId: string;
  trackPageView: boolean;
  trackLead: boolean;
}

const loadedPlatforms = new Set<PixelPlatform>();
const sentEvents = new Set<string>();
let activeConfigs: PixelConfig[] = [];

function safeId(value: unknown): string {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (trimmed.length > 128) return '';
  if (!/^[a-zA-Z0-9_\-\.:\s]+$/.test(trimmed)) return '';
  return trimmed;
}

type WindowWithPixels = Window & {
  fbq?: (...args: unknown[]) => void;
  _fbq?: unknown;
  gtag?: (...args: unknown[]) => void;
  dataLayer?: unknown[];
  ttq?: { load: (id: string) => void; page: () => void; track: (event: string, data?: unknown) => void };
  _kwa?: { set: (key: string, value: string) => void; track: (event: string, data?: unknown) => void };
};

function getWin(): WindowWithPixels {
  return window as unknown as WindowWithPixels;
}

export async function loadPixelConfigs(): Promise<PixelConfig[]> {
  const { data, error } = await supabase
    .from('tracking_pixels')
    .select('platform, enabled, settings')
    .order('platform');
  if (error) throw error;
  return (data ?? []) as PixelConfig[];
}

export async function savePixelConfig(
  platform: PixelPlatform,
  enabled: boolean,
  settings: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase
    .from('tracking_pixels')
    .upsert({ platform, enabled, settings, updated_at: new Date().toISOString() });
  if (error) throw error;
}

function injectMetaPixel(pixelId: string) {
  if (loadedPlatforms.has('meta') || !pixelId) return;
  const w = getWin();
  if (w.fbq) return;

  /* eslint-disable */
  (function (f: any, b: Document, e: string) {
    let n: any = (f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    });
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    const t = b.createElement(e) as HTMLScriptElement;
    t.async = true;
    t.src = 'https://connect.facebook.net/en_US/fbevents.js';
    const s = b.getElementsByTagName(e)[0];
    s.parentNode?.insertBefore(t, s);
  })(w, document, 'script');
  /* eslint-enable */

  getWin().fbq?.('init', pixelId);
  loadedPlatforms.add('meta');
}

function injectGoogleTag(tagId: string) {
  if (loadedPlatforms.has('google') || !tagId) return;
  const w = getWin();
  if (w.gtag) return;

  w.dataLayer = w.dataLayer || [];
  w.gtag = function (...args: unknown[]) {
    w.dataLayer!.push(args);
  };
  w.gtag('js', new Date());
  w.gtag('config', tagId);

  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${tagId}`;
  document.head.appendChild(s);

  loadedPlatforms.add('google');
}

function injectTiktokPixel(pixelId: string) {
  if (loadedPlatforms.has('tiktok') || !pixelId) return;
  const w = getWin();
  if (w.ttq) return;

  /* eslint-disable */
  (function (w: any, d: Document) {
    w.ttq = w.ttq || {};
    w.ttq._t = w.ttq._t || {};
    w.ttq._t[0] = Date.now();
    w.ttq.load = function (id: string) {
      const s = d.createElement('script');
      s.async = true;
      s.src = 'https://analytics.tiktok.com/i18n/pixel/events.js';
      s.onload = function () {
        w.ttq._load = true;
        w.ttq.page();
      };
      d.head.appendChild(s);
      w.ttq._id = id;
    };
    w.ttq.page = function () {
      w.ttq.track('PageView', {});
    };
    w.ttq.track = function (event: string, data?: unknown) {
      if (!w.ttq._load) return;
      const payload = { event, properties: data || {}, timestamp: Date.now() };
      (w.ttq._queue = w.ttq._queue || []).push(payload);
    };
  })(w, document);
  /* eslint-enable */

  getWin().ttq?.load(pixelId);
  loadedPlatforms.add('tiktok');
}

function injectKwaiPixel(pixelId: string) {
  if (loadedPlatforms.has('kwai') || !pixelId) return;
  const w = getWin();
  if (w._kwa) return;

  /* eslint-disable */
  (function (w: any, d: Document) {
    w._kwa = w._kwa || {};
    w._kwa.set = function (key: string, value: string) {
      w._kwa[key] = value;
    };
    w._kwa.track = function (event: string, data?: unknown) {
      const payload = { event, properties: data || {}, timestamp: Date.now() };
      (w._kwa._queue = w._kwa._queue || []).push(payload);
    };
    const s = d.createElement('script');
    s.async = true;
    s.src = 'https://kwai-ads.com/pixel/sdks/kwa-pixel.js';
    s.onload = function () {
      w._kwa._load = true;
    };
    d.head.appendChild(s);
  })(w, document);
  /* eslint-enable */

  getWin()._kwa?.set('pixel_id', pixelId);
  loadedPlatforms.add('kwai');
}

export function initPixels(configs: PixelConfig[]) {
  for (const cfg of configs) {
    if (!cfg.enabled) continue;

    if (cfg.platform === 'meta') {
      const s = cfg.settings as Partial<MetaSettings>;
      const pixelId = safeId(s.pixelId);
      if (!pixelId) continue;
      injectMetaPixel(pixelId);
      if (s.trackPageView && !sentEvents.has('meta_pageview')) {
        getWin().fbq?.('track', 'PageView');
        sentEvents.add('meta_pageview');
      }
    }

    if (cfg.platform === 'google') {
      const s = cfg.settings as Partial<GoogleSettings>;
      const tagId = safeId(s.tagId);
      if (!tagId) continue;
      injectGoogleTag(tagId);
    }

    if (cfg.platform === 'tiktok') {
      const s = cfg.settings as Partial<TiktokSettings>;
      const pixelId = safeId(s.pixelId);
      if (!pixelId) continue;
      injectTiktokPixel(pixelId);
      if (s.trackPageView && !sentEvents.has('tiktok_pageview')) {
        getWin().ttq?.page();
        sentEvents.add('tiktok_pageview');
      }
    }

    if (cfg.platform === 'kwai') {
      const s = cfg.settings as Partial<KwaiSettings>;
      const pixelId = safeId(s.pixelId);
      if (!pixelId) continue;
      injectKwaiPixel(pixelId);
      if (s.trackPageView && !sentEvents.has('kwai_pageview')) {
        getWin()._kwa?.track('PageView');
        sentEvents.add('kwai_pageview');
      }
    }
  }
}

export function trackLead() {
  for (const cfg of activeConfigs) {
    if (!cfg.enabled) continue;

    if (cfg.platform === 'meta') {
      const s = cfg.settings as Partial<MetaSettings>;
      if (!s.trackLead) continue;
      if (!safeId(s.pixelId)) continue;
      if (!sentEvents.has('meta_lead')) {
        getWin().fbq?.('track', 'Lead');
        sentEvents.add('meta_lead');
      }
    }

    if (cfg.platform === 'google') {
      const s = cfg.settings as Partial<GoogleSettings>;
      if (!s.trackLead) continue;
      const conversionId = safeId(s.conversionId);
      const conversionLabel = safeId(s.conversionLabel);
      if (conversionId && conversionLabel) {
        const key = `google_lead_${conversionId}_${conversionLabel}`;
        if (!sentEvents.has(key)) {
          getWin().gtag?.('event', 'conversion', {
            send_to: `${conversionId}/${conversionLabel}`,
          });
          sentEvents.add(key);
        }
      }
    }

    if (cfg.platform === 'tiktok') {
      const s = cfg.settings as Partial<TiktokSettings>;
      if (!s.trackLead) continue;
      if (!safeId(s.pixelId)) continue;
      if (!sentEvents.has('tiktok_lead')) {
        getWin().ttq?.track('SubmitForm', { content_type: 'lead' });
        sentEvents.add('tiktok_lead');
      }
    }

    if (cfg.platform === 'kwai') {
      const s = cfg.settings as Partial<KwaiSettings>;
      if (!s.trackLead) continue;
      if (!safeId(s.pixelId)) continue;
      if (!sentEvents.has('kwai_lead')) {
        getWin()._kwa?.track('CompleteRegistration', { type: 'lead' });
        sentEvents.add('kwai_lead');
      }
    }
  }
}

export function trackDonation(amount: number) {
  for (const cfg of activeConfigs) {
    if (!cfg.enabled) continue;

    if (cfg.platform === 'meta') {
      if (!safeId((cfg.settings as Partial<MetaSettings>).pixelId)) continue;
      const key = `meta_donate_${amount}`;
      if (!sentEvents.has(key)) {
        getWin().fbq?.('track', 'Donate', { value: amount, currency: 'BRL' });
        sentEvents.add(key);
      }
    }

    if (cfg.platform === 'google') {
      const s = cfg.settings as Partial<GoogleSettings>;
      const conversionId = safeId(s.conversionId);
      const conversionLabel = safeId(s.conversionLabel);
      if (conversionId && conversionLabel) {
        const key = `google_donate_${conversionId}_${conversionLabel}`;
        if (!sentEvents.has(key)) {
          getWin().gtag?.('event', 'conversion', {
            send_to: `${conversionId}/${conversionLabel}`,
            value: amount,
            currency: 'BRL',
          });
          sentEvents.add(key);
        }
      }
    }

    if (cfg.platform === 'tiktok') {
      if (!safeId((cfg.settings as Partial<TiktokSettings>).pixelId)) continue;
      const key = `tiktok_donate_${amount}`;
      if (!sentEvents.has(key)) {
        getWin().ttq?.track('CompletePayment', { value: amount, currency: 'BRL' });
        sentEvents.add(key);
      }
    }

    if (cfg.platform === 'kwai') {
      if (!safeId((cfg.settings as Partial<KwaiSettings>).pixelId)) continue;
      const key = `kwai_donate_${amount}`;
      if (!sentEvents.has(key)) {
        getWin()._kwa?.track('CompletePayment', { value: amount, currency: 'BRL' });
        sentEvents.add(key);
      }
    }
  }
}

export async function loadAndInitPixels() {
  try {
    const configs = await loadPixelConfigs();
    activeConfigs = configs;
    initPixels(configs);
  } catch {
    // Silent fail — tracking should never break the site
  }
}

export function setActiveConfigs(configs: PixelConfig[]) {
  activeConfigs = configs;
}
