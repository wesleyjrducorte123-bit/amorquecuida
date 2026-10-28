import { useEffect, useState } from 'react';
import {
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Power,
  Facebook,
  Search,
  Music2,
  Video,
  ExternalLink,
  Info,
} from 'lucide-react';
import { PageHeader, Card } from '@/admin/ui';
import { PublishBar } from '@/admin/PublishBar';
import {
  loadPixelConfigs,
  savePixelConfig,
  type PixelConfig,
  type PixelPlatform,
  type MetaSettings,
  type GoogleSettings,
  type TiktokSettings,
  type KwaiSettings,
} from '@/lib/pixels';

interface PlatformMeta {
  key: PixelPlatform;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  helpUrl: string;
  helpText: string;
}

const PLATFORMS: PlatformMeta[] = [
  {
    key: 'meta',
    label: 'Meta Pixel (Facebook & Instagram)',
    icon: <Facebook className="h-5 w-5" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    helpUrl: 'https://www.facebook.com/business/help/952192354843755',
    helpText: 'Encontre seu ID do Pixel no Gerenciador de Eventos do Facebook.',
  },
  {
    key: 'google',
    label: 'Google Ads (Tag e Conversões)',
    icon: <Search className="h-5 w-5" />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    helpUrl: 'https://support.google.com/google-ads/answer/1722054',
    helpText: 'Encontre o ID da Tag (AW-...) e o rótulo de conversão no Google Ads.',
  },
  {
    key: 'tiktok',
    label: 'TikTok Pixel',
    icon: <Music2 className="h-5 w-5" />,
    color: 'text-stone-900',
    bgColor: 'bg-stone-100',
    helpUrl: 'https://ads.tiktok.com/help/article/get-started-pixel',
    helpText: 'Encontre seu ID do Pixel no TikTok Ads Manager em Assets → Events.',
  },
  {
    key: 'kwai',
    label: 'Kwai Ads Pixel',
    icon: <Video className="h-5 w-5" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    helpUrl: 'https://docs.qingque.cn/d/home/eZQDrzYRyQpMS6y7Yu8Lgbjfv',
    helpText: 'Encontre seu ID do Pixel no Kwai Ads Manager em Assets → Web Events.',
  },
];

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="relative inline-flex cursor-pointer items-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <div className="peer h-6 w-11 rounded-full bg-stone-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-full peer-checked:after:border-white" />
    </label>
  );
}

function MetaFields({
  settings,
  onChange,
}: {
  settings: MetaSettings;
  onChange: (s: MetaSettings) => void;
}) {
  return (
    <div className="space-y-3">
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-stone-600">ID do Pixel (Meta Pixel ID)</span>
        <input
          type="text"
          value={settings.pixelId}
          onChange={(e) => onChange({ ...settings, pixelId: e.target.value })}
          placeholder="Ex: 123456789012345"
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-mono outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
        />
      </label>
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input
            type="checkbox"
            checked={settings.trackPageView}
            onChange={(e) => onChange({ ...settings, trackPageView: e.target.checked })}
          />
          Disparar PageView (visualização de página)
        </label>
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input
            type="checkbox"
            checked={settings.trackLead}
            onChange={(e) => onChange({ ...settings, trackLead: e.target.checked })}
          />
          Disparar Lead (conversão de lead ao preencher formulário)
        </label>
      </div>
    </div>
  );
}

function GoogleFields({
  settings,
  onChange,
}: {
  settings: GoogleSettings;
  onChange: (s: GoogleSettings) => void;
}) {
  return (
    <div className="space-y-3">
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-stone-600">ID da Tag (Google Tag ID)</span>
        <input
          type="text"
          value={settings.tagId}
          onChange={(e) => onChange({ ...settings, tagId: e.target.value })}
          placeholder="Ex: AW-123456789"
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-mono outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-stone-600">ID de Conversão</span>
          <input
            type="text"
            value={settings.conversionId}
            onChange={(e) => onChange({ ...settings, conversionId: e.target.value })}
            placeholder="Ex: AW-123456789"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-mono outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-stone-600">Rótulo de Conversão</span>
          <input
            type="text"
            value={settings.conversionLabel}
            onChange={(e) => onChange({ ...settings, conversionLabel: e.target.value })}
            placeholder="Ex: abcDEFghi"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-mono outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
          />
        </label>
      </div>
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input
            type="checkbox"
            checked={settings.trackPageView}
            onChange={(e) => onChange({ ...settings, trackPageView: e.target.checked })}
          />
          Disparar PageView (visualização de página)
        </label>
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input
            type="checkbox"
            checked={settings.trackLead}
            onChange={(e) => onChange({ ...settings, trackLead: e.target.checked })}
          />
          Disparar conversão de Lead
        </label>
      </div>
    </div>
  );
}

function TiktokFields({
  settings,
  onChange,
}: {
  settings: TiktokSettings;
  onChange: (s: TiktokSettings) => void;
}) {
  return (
    <div className="space-y-3">
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-stone-600">ID do Pixel (TikTok Pixel ID)</span>
        <input
          type="text"
          value={settings.pixelId}
          onChange={(e) => onChange({ ...settings, pixelId: e.target.value })}
          placeholder="Ex: C4XXXXXXXXXXXXXXXX"
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-mono outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
        />
      </label>
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input
            type="checkbox"
            checked={settings.trackPageView}
            onChange={(e) => onChange({ ...settings, trackPageView: e.target.checked })}
          />
          Disparar PageView (visualização de página)
        </label>
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input
            type="checkbox"
            checked={settings.trackLead}
            onChange={(e) => onChange({ ...settings, trackLead: e.target.checked })}
          />
          Disparar Lead (SubmitForm — conversão de lead)
        </label>
      </div>
    </div>
  );
}

function KwaiFields({
  settings,
  onChange,
}: {
  settings: KwaiSettings;
  onChange: (s: KwaiSettings) => void;
}) {
  return (
    <div className="space-y-3">
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-stone-600">ID do Pixel (Kwai Pixel ID)</span>
        <input
          type="text"
          value={settings.pixelId}
          onChange={(e) => onChange({ ...settings, pixelId: e.target.value })}
          placeholder="Ex: 123456"
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-mono outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
        />
      </label>
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input
            type="checkbox"
            checked={settings.trackPageView}
            onChange={(e) => onChange({ ...settings, trackPageView: e.target.checked })}
          />
          Disparar PageView (visualização de página)
        </label>
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input
            type="checkbox"
            checked={settings.trackLead}
            onChange={(e) => onChange({ ...settings, trackLead: e.target.checked })}
          />
          Disparar Lead (CompleteRegistration — conversão de lead)
        </label>
      </div>
    </div>
  );
}

function defaultMetaSettings(): MetaSettings {
  return { pixelId: '', trackPageView: true, trackLead: true };
}
function defaultGoogleSettings(): GoogleSettings {
  return { tagId: '', conversionId: '', conversionLabel: '', trackPageView: true, trackLead: true };
}
function defaultTiktokSettings(): TiktokSettings {
  return { pixelId: '', trackPageView: true, trackLead: true };
}
function defaultKwaiSettings(): KwaiSettings {
  return { pixelId: '', trackPageView: true, trackLead: true };
}

export function TrackingPixelsPage() {
  const [configs, setConfigs] = useState<Record<PixelPlatform, { enabled: boolean; settings: Record<string, unknown> }>>({
    meta: { enabled: false, settings: {} },
    google: { enabled: false, settings: {} },
    tiktok: { enabled: false, settings: {} },
    kwai: { enabled: false, settings: {} },
  });
  const [loading, setLoading] = useState(true);
  const [savingPlatform, setSavingPlatform] = useState<PixelPlatform | null>(null);
  const [errors, setErrors] = useState<Record<PixelPlatform, string | null>>({
    meta: null,
    google: null,
    tiktok: null,
    kwai: null,
  });
  const [successes, setSuccesses] = useState<Record<PixelPlatform, boolean>>({
    meta: false,
    google: false,
    tiktok: false,
    kwai: false,
  });

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const data = await loadPixelConfigs();
      const next = { ...configs };
      for (const cfg of data) {
        if (cfg.platform === 'meta') next.meta = { enabled: cfg.enabled, settings: { ...defaultMetaSettings(), ...cfg.settings } };
        if (cfg.platform === 'google') next.google = { enabled: cfg.enabled, settings: { ...defaultGoogleSettings(), ...cfg.settings } };
        if (cfg.platform === 'tiktok') next.tiktok = { enabled: cfg.enabled, settings: { ...defaultTiktokSettings(), ...cfg.settings } };
        if (cfg.platform === 'kwai') next.kwai = { enabled: cfg.enabled, settings: { ...defaultKwaiSettings(), ...cfg.settings } };
      }
      setConfigs(next);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(platform: PixelPlatform) {
    setSavingPlatform(platform);
    setErrors((prev) => ({ ...prev, [platform]: null }));
    setSuccesses((prev) => ({ ...prev, [platform]: false }));
    try {
      const cfg = configs[platform];
      await savePixelConfig(platform, cfg.enabled, cfg.settings);
      setSuccesses((prev) => ({ ...prev, [platform]: true }));
      setTimeout(() => setSuccesses((prev) => ({ ...prev, [platform]: false })), 3000);
    } catch (e) {
      setErrors((prev) => ({
        ...prev,
        [platform]: e instanceof Error ? e.message : 'Falha ao salvar.',
      }));
    } finally {
      setSavingPlatform(null);
    }
  }

  function updateSettings(platform: PixelPlatform, settings: Record<string, unknown>) {
    setConfigs((prev) => ({
      ...prev,
      [platform]: { ...prev[platform], settings },
    }));
  }

  function updateEnabled(platform: PixelPlatform, enabled: boolean) {
    setConfigs((prev) => ({
      ...prev,
      [platform]: { ...prev[platform], enabled },
    }));
  }

  if (loading) {
    return (
      <div>
        <PublishBar />
        <PageHeader title="Pixels e rastreamento de anúncios" />
        <p className="text-sm text-stone-500">Carregando...</p>
      </div>
    );
  }

  return (
    <div>
      <PublishBar />
      <PageHeader
        title="Pixels e rastreamento de anúncios"
        subtitle="Configure pixels de rastreamento para Facebook/Instagram, Google Ads, TikTok e Kwai. As alterações entram em vigor no site público após salvar."
      />

      <div className="mb-6 flex items-start gap-2 rounded-lg bg-blue-50 p-4 text-xs leading-relaxed text-blue-800">
        <Info className="h-4 w-4 flex-none mt-0.5" />
        <div>
          <p className="font-semibold mb-1">Importante sobre privacidade</p>
          <p>
            Os pixels só carregam se a plataforma estiver ativada e o ID preenchido.
            nenhum JavaScript arbitrário é executado — apenas os IDs que você inserir
            são usados nos scripts oficiais de cada plataforma. Sempre deixe os IDs
            vazios até ter os valores reais das suas contas de anúncios.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {PLATFORMS.map((p) => {
          const cfg = configs[p.key];
          const isSaving = savingPlatform === p.key;
          const err = errors[p.key];
          const ok = successes[p.key];

          return (
            <Card key={p.key}>
              {/* Header */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${p.bgColor} ${p.color}`}>
                    {p.icon}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-stone-900">{p.label}</p>
                    <p className="text-xs text-stone-500">{cfg.enabled ? 'Ativo' : 'Desativado'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`flex items-center gap-1.5 text-xs font-medium ${cfg.enabled ? 'text-emerald-600' : 'text-stone-400'}`}>
                    <Power className="h-3.5 w-3.5" />
                    {cfg.enabled ? 'Ligado' : 'Desligado'}
                  </span>
                  <Toggle checked={cfg.enabled} onChange={(v) => updateEnabled(p.key, v)} />
                </div>
              </div>

              {/* Fields */}
              <div className={`transition-opacity ${cfg.enabled ? 'opacity-100' : 'opacity-50'}`}>
                {p.key === 'meta' && (
                  <MetaFields
                    settings={cfg.settings as unknown as MetaSettings}
                    onChange={(s) => updateSettings(p.key, s as unknown as Record<string, unknown>)}
                  />
                )}
                {p.key === 'google' && (
                  <GoogleFields
                    settings={cfg.settings as unknown as GoogleSettings}
                    onChange={(s) => updateSettings(p.key, s as unknown as Record<string, unknown>)}
                  />
                )}
                {p.key === 'tiktok' && (
                  <TiktokFields
                    settings={cfg.settings as unknown as TiktokSettings}
                    onChange={(s) => updateSettings(p.key, s as unknown as Record<string, unknown>)}
                  />
                )}
                {p.key === 'kwai' && (
                  <KwaiFields
                    settings={cfg.settings as unknown as KwaiSettings}
                    onChange={(s) => updateSettings(p.key, s as unknown as Record<string, unknown>)}
                  />
                )}
              </div>

              {/* Error / Success */}
              {err && (
                <p className="mt-3 flex items-center gap-1.5 text-sm text-rose-600">
                  <AlertCircle className="h-4 w-4" />
                  {err}
                </p>
              )}
              {ok && (
                <p className="mt-3 flex items-center gap-1.5 text-sm text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Configurações salvas com sucesso.
                </p>
              )}

              {/* Footer: help + save */}
              <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-4">
                <a
                  href={p.helpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:underline"
                >
                  Como encontrar meu ID
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <button
                  onClick={() => handleSave(p.key)}
                  disabled={isSaving}
                  className="flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-rose-600 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Salvar
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Testing instructions */}
      <div className="mt-6">
        <Card>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-stone-500">
            Como testar os eventos
          </h3>
          <div className="space-y-4 text-xs leading-relaxed text-stone-600">
            <div>
              <p className="font-semibold text-stone-800">Meta (Facebook/Instagram)</p>
              <p>Instale a extensão "Meta Pixel Helper" no Chrome. Navegue pelo site e verifique se os eventos PageView e Lead aparecem no painel do Gerenciador de Eventos.</p>
            </div>
            <div>
              <p className="font-semibold text-stone-800">Google Ads</p>
              <p>Use o "Google Tag Assistant" (extensão do Chrome) ou o "Modo de pré-visualização" no Google Tag Manager. Verifique se a tag de conversão dispara ao concluir uma ação.</p>
            </div>
            <div>
              <p className="font-semibold text-stone-800">TikTok</p>
              <p>Instale a extensão "TikTok Pixel Helper". Acesse o site e confirme se os eventos PageView e SubmitForm são detectados no TikTok Ads Manager.</p>
            </div>
            <div>
              <p className="font-semibold text-stone-800">Kwai</p>
              <p>Baixe o "Kwai Pixel Helper". Verifique se os eventos PageView e CompleteRegistration aparecem no Kwai Ads Manager em Assets → Web Events.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
