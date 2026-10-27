import { useEffect, useState } from 'react';
import {
  CreditCard,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Copy,
  ExternalLink,
  KeyRound,
  Webhook,
  Power,
} from 'lucide-react';
import { PageHeader, Card } from '@/admin/ui';
import { PublishBar } from '@/admin/PublishBar';
import { supabase } from '@/lib/supabase';

interface GatewaySettings {
  id: string;
  provider: string;
  public_key: string | null;
  secret_key: string | null;
  webhook_url: string | null;
  webhook_token: string | null;
  enabled: boolean;
}

export function PaymentGatewayPage() {
  const [settings, setSettings] = useState<GatewaySettings | null>(null);
  const [publicKey, setPublicKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookToken, setWebhookToken] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('gateway_settings')
        .select('id, provider, public_key, secret_key, webhook_url, webhook_token, enabled')
        .eq('provider', 'vizzionpay')
        .maybeSingle();
      if (err) throw err;
      if (data) {
        setSettings(data);
        setPublicKey(data.public_key ?? '');
        setSecretKey(data.secret_key ?? '');
        setWebhookUrl(data.webhook_url ?? '');
        setWebhookToken(data.webhook_token ?? '');
        setEnabled(data.enabled);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao carregar configurações.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      if (!settings) throw new Error('Configuração não encontrada.');
      const { error: err } = await supabase
        .from('gateway_settings')
        .update({
          public_key: publicKey || null,
          secret_key: secretKey || null,
          webhook_url: webhookUrl || null,
          webhook_token: webhookToken || null,
          enabled,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings.id);
      if (err) throw err;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao salvar.');
    } finally {
      setSaving(false);
    }
  }

  function copyWebhookUrl() {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vizzion-webhook`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div>
        <PublishBar />
        <PageHeader title="Gateway de pagamentos" />
        <p className="text-sm text-stone-500">Carregando...</p>
      </div>
    );
  }

  const configuredWebhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vizzion-webhook`;

  return (
    <div>
      <PublishBar />
      <PageHeader
        title="Gateway de pagamentos"
        subtitle="Configure a integração com VizzionPay para receber doações via PIX."
      />

      {error && (
        <p className="mb-4 flex items-center gap-1.5 text-sm text-rose-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}

      {success && (
        <p className="mb-4 flex items-center gap-1.5 text-sm text-emerald-600">
          <CheckCircle2 className="h-4 w-4" />
          Configurações salvas com sucesso.
        </p>
      )}

      <div className="space-y-4">
        {/* Status card */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${enabled ? 'bg-emerald-100 text-emerald-600' : 'bg-stone-100 text-stone-400'}`}>
                <Power className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-stone-900">
                  {enabled ? 'Gateway ativo' : 'Gateway desativado'}
                </p>
                <p className="text-xs text-stone-500">
                  {enabled
                    ? 'Doações via PIX estão disponíveis no site público.'
                    : 'Ative o gateway após configurar as chaves para habilitar doações.'}
                </p>
              </div>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-stone-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-full peer-checked:after:border-white" />
            </label>
          </div>
        </Card>

        {/* Credentials */}
        <Card>
          <h3 className="mb-1 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-stone-500">
            <KeyRound className="h-4 w-4" />
            Credenciais da API VizzionPay
          </h3>
          <p className="mb-4 text-xs text-stone-500">
            Encontre suas chaves no painel da VizzionPay em Configurações {'->'} API.
          </p>
          <div className="grid gap-4">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-stone-600">Chave pública da API</span>
              <input
                type="text"
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value)}
                placeholder="pk_..."
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-mono outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-stone-600">Chave secreta da API</span>
              <input
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="sk_..."
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-mono outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              />
            </label>
          </div>
        </Card>

        {/* Webhook configuration */}
        <Card>
          <h3 className="mb-1 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-stone-500">
            <Webhook className="h-4 w-4" />
            URL de Webhook
          </h3>
          <p className="mb-4 text-xs text-stone-500">
            Configure esta URL no painel da VizzionPay para receber notificações de pagamento automaticamente.
          </p>

          <div className="mb-4 rounded-lg bg-stone-50 p-3">
            <p className="mb-1 text-xs font-medium text-stone-600">URL do webhook deste site (copie e cole no painel VizzionPay):</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded bg-white px-2 py-1.5 text-xs text-stone-700 border border-stone-200">
                {configuredWebhookUrl}
              </code>
              <button
                onClick={copyWebhookUrl}
                className="flex items-center gap-1 rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100"
              >
                {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>

          <div className="grid gap-4">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-stone-600">URL de Webhook (configure no painel VizzionPay)</span>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder={configuredWebhookUrl}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-mono outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              />
              <span className="mt-1 block text-xs text-stone-400">
                Cole aqui a mesma URL que você configurou no painel da VizzionPay.
              </span>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-stone-600">Token de validação do webhook</span>
              <input
                type="text"
                value={webhookToken}
                onChange={(e) => setWebhookToken(e.target.value)}
                placeholder="Token recebido ao criar cobrança com callbackUrl"
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-mono outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              />
              <span className="mt-1 block text-xs text-stone-400">
                Token usado para validar que as notificações vêm da VizzionPay. Guarde o mesmo valor aqui e no painel da VizzionPay.
              </span>
            </label>
          </div>
        </Card>

        {/* Help card */}
        <Card>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-stone-500">
            <CreditCard className="h-4 w-4" />
            Como funciona
          </h3>
          <ol className="space-y-2 text-xs leading-relaxed text-stone-600">
            <li className="flex gap-2">
              <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-rose-100 text-[10px] font-bold text-rose-600">1</span>
              <span>Crie sua conta na VizzionPay e obtenha sua chave pública e secreta em Configurações {'->'} API.</span>
            </li>
            <li className="flex gap-2">
              <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-rose-100 text-[10px] font-bold text-rose-600">2</span>
              <span>Cole as chaves nos campos acima.</span>
            </li>
            <li className="flex gap-2">
              <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-rose-100 text-[10px] font-bold text-rose-600">3</span>
              <span>Copie a URL do webhook acima e configure no painel da VizzionPay.</span>
            </li>
            <li className="flex gap-2">
              <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-rose-100 text-[10px] font-bold text-rose-600">4</span>
              <span>Defina um token de validação e use o mesmo valor aqui e no painel VizzionPay.</span>
            </li>
            <li className="flex gap-2">
              <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-rose-100 text-[10px] font-bold text-rose-600">5</span>
              <span>Ative o gateway com o botão no topo da página e salve.</span>
            </li>
            <li className="flex gap-2">
              <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-rose-100 text-[10px] font-bold text-rose-600">6</span>
              <span>Pronto! Doadores verão um QR Code PIX no site e pagamentos serão registrados automaticamente na aba "Doações e pagadores".</span>
            </li>
          </ol>
          <a
            href="https://app.vizzionpay.com.br/docs/v1"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:underline"
          >
            Ver documentação da VizzionPay
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </Card>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-rose-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-600 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar configurações
          </button>
        </div>
      </div>
    </div>
  );
}
