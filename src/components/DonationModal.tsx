import { useEffect, useState } from 'react';
import {
  X,
  Heart,
  Check,
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Copy,
  CheckCircle2,
  QrCode,
  Clock,
} from 'lucide-react';
import type { TierOption } from '@/types/content';
import { formatBRL } from '@/lib/format';

interface DonationModalProps {
  open: boolean;
  initialAmount: number;
  tiers: TierOption[];
  onClose: () => void;
}

type Step = 'select' | 'donor' | 'pix';

interface PixResult {
  transactionId: string;
  pixCode: string;
  pixImage: string | null;
  expiresAt: string | null;
  status: string;
}

export function DonationModal({
  open,
  initialAmount,
  tiers,
  onClose,
}: DonationModalProps) {
  const [step, setStep] = useState<Step>('select');
  const [amount, setAmount] = useState<number>(30);
  const [custom, setCustom] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Donor info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [donorDocument, setDonorDocument] = useState('');
  const [message, setMessage] = useState('');
  const [anonymous, setAnonymous] = useState(false);

  // PIX state
  const [pix, setPix] = useState<PixResult | null>(null);
  const [loadingPix, setLoadingPix] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setStep('select');
      setError('');
      setPix(null);
      setCopied(false);
      if (initialAmount > 0) {
        setAmount(initialAmount);
        setCustom('');
      } else {
        setCustom('');
        setAmount(0);
      }
    }
  }, [open, initialAmount]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const finalAmount = custom ? parseAmount(custom) : amount;
  const isValid = finalAmount >= 5;

  function parseAmount(s: string): number {
    const n = parseFloat(s.replace(',', '.'));
    return isNaN(n) ? 0 : n;
  }

  function handleContinue() {
    if (finalAmount < 5) {
      setError('O valor mínimo para doação é R$ 5,00.');
      return;
    }
    setError('');
    setStep('donor');
  }

  function handleCustomChange(v: string) {
    const clean = v.replace(/[^0-9.,]/g, '');
    setCustom(clean);
    setError('');
  }

  async function handleGeneratePix() {
    if (!email.trim()) {
      setError('Informe seu e-mail para continuar.');
      return;
    }
    if (!anonymous && !name.trim()) {
      setError('Informe seu nome ou marque a opção de doação anônima.');
      return;
    }
    if (!phone.trim()) {
      setError('Informe seu telefone para continuar.');
      return;
    }
    if (!donorDocument.trim()) {
      setError('Informe seu CPF ou CNPJ para continuar.');
      return;
    }
    setError('');
    setLoadingPix(true);
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vizzion-pix`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          amount: finalAmount,
          donorName: anonymous ? 'Doador Anônimo' : name,
          donorEmail: email,
          donorPhone: phone,
          donorDocument: donorDocument,
          message: message || undefined,
          isAnonymous: anonymous,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Falha ao gerar cobrança PIX.');
      }

      setPix(data as PixResult);
      setStep('pix');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao processar pagamento.');
    } finally {
      setLoadingPix(false);
    }
  }

  function copyPixCode() {
    if (!pix?.pixCode) return;
    navigator.clipboard.writeText(pix.pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="donation-title"
        className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-stone-500 shadow transition-colors hover:bg-stone-100 hover:text-stone-800"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-rose-600 px-5 py-4 text-white">
          {step !== 'select' && (
            <button
              onClick={() => setStep(step === 'pix' ? 'donor' : 'select')}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
              aria-label="Voltar"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <Heart className="h-5 w-5 fill-white" />
          <span className="font-semibold">
            {step === 'select'
              ? 'Qual valor deseja doar?'
              : step === 'donor'
              ? 'Seus dados'
              : 'Pague com PIX'}
          </span>
        </div>

        <p className="flex items-center justify-center gap-1.5 bg-emerald-50 py-2 text-xs font-medium text-emerald-700">
          <ShieldCheck className="h-4 w-4" />
          Pagamento 100% seguro e verificado
        </p>

        <div className="px-5 py-6">
          {step === 'select' ? (
            <SelectStep
              options={tiers}
              amount={amount}
              custom={custom}
              error={error}
              onPick={(v) => {
                setAmount(v);
                setCustom('');
                setError('');
              }}
              onCustom={handleCustomChange}
              onContinue={handleContinue}
            />
          ) : step === 'donor' ? (
            <DonorStep
              amount={finalAmount}
              name={name}
              email={email}
              phone={phone}
              document={donorDocument}
              message={message}
              anonymous={anonymous}
              error={error}
              loading={loadingPix}
              onName={setName}
              onEmail={setEmail}
              onPhone={setPhone}
              onDocument={setDonorDocument}
              onMessage={setMessage}
              onAnonymous={setAnonymous}
              onContinue={handleGeneratePix}
            />
          ) : (
            <PixStep
              amount={finalAmount}
              pix={pix}
              copied={copied}
              onCopy={copyPixCode}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function SelectStep({
  options,
  amount,
  custom,
  error,
  onPick,
  onCustom,
  onContinue,
}: {
  options: TierOption[];
  amount: number;
  custom: string;
  error: string;
  onPick: (v: number) => void;
  onCustom: (v: string) => void;
  onContinue: () => void;
}) {
  return (
    <>
      <div className="grid gap-3">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onPick(opt.value)}
            className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition-all ${
              amount === opt.value && !custom
                ? 'border-rose-500 bg-rose-50'
                : 'border-stone-200 hover:border-rose-300'
            }`}
          >
            <span>
              <span className="block text-lg font-bold text-stone-900">
                {formatBRL(opt.value)}
              </span>
              <span className="text-xs text-stone-600">{opt.label}</span>
            </span>
            {amount === opt.value && !custom && (
              <Check className="h-5 w-5 text-rose-500" />
            )}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <label className="text-xs font-medium text-stone-600">Outro valor</label>
        <div className="mt-1 flex items-center rounded-xl border-2 border-stone-200 px-3 focus-within:border-rose-500">
          <span className="text-sm font-semibold text-stone-500">R$</span>
          <input
            type="text"
            inputMode="decimal"
            value={custom}
            onChange={(e) => onCustom(e.target.value)}
            placeholder="Digite o valor"
            className="w-full bg-transparent px-2 py-3 text-sm text-stone-900 outline-none placeholder:text-stone-400"
            aria-label="Valor personalizado"
          />
        </div>
      </div>

      {error && (
        <p className="mt-3 flex items-center gap-1.5 text-sm text-rose-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}

      <button
        onClick={onContinue}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-rose-500 py-3 text-base font-semibold text-white shadow-lg transition-transform hover:scale-[1.02] hover:bg-rose-600"
      >
        <Heart className="h-5 w-5 fill-white" />
        Continuar
      </button>
    </>
  );
}

function DonorStep({
  amount,
  name,
  email,
  phone,
  document,
  message,
  anonymous,
  error,
  loading,
  onName,
  onEmail,
  onPhone,
  onDocument,
  onMessage,
  onAnonymous,
  onContinue,
}: {
  amount: number;
  name: string;
  email: string;
  phone: string;
  document: string;
  message: string;
  anonymous: boolean;
  error: string;
  loading: boolean;
  onName: (v: string) => void;
  onEmail: (v: string) => void;
  onPhone: (v: string) => void;
  onDocument: (v: string) => void;
  onMessage: (v: string) => void;
  onAnonymous: (v: boolean) => void;
  onContinue: () => void;
}) {
  return (
    <>
      <div className="mb-4 rounded-xl bg-rose-50 py-3 text-center">
        <p className="text-xs text-stone-600">Você está doando</p>
        <p className="text-2xl font-extrabold text-rose-600">{formatBRL(amount)}</p>
      </div>

      <div className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-stone-600">E-mail *</span>
          <input
            type="email"
            value={email}
            onChange={(e) => onEmail(e.target.value)}
            placeholder="seu@email.com"
            className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-stone-600">
            Nome {anonymous ? '' : '*'}
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => onName(e.target.value)}
            disabled={anonymous}
            placeholder={anonymous ? 'Doação anônima' : 'Seu nome'}
            className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 disabled:bg-stone-100 disabled:text-stone-400"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-stone-600">Telefone *</span>
            <input
              type="text"
              value={phone}
              onChange={(e) => onPhone(e.target.value)}
              placeholder="(11) 99999-9999"
              className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-stone-600">CPF/CNPJ *</span>
            <input
              type="text"
              value={document}
              onChange={(e) => onDocument(e.target.value)}
              placeholder="000.000.000-00"
              className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-stone-600">Mensagem (opcional)</span>
          <textarea
            value={message}
            onChange={(e) => onMessage(e.target.value)}
            rows={2}
            placeholder="Deixe uma mensagem de apoio"
            className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-stone-600">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => onAnonymous(e.target.checked)}
          />
          Quero doar anonimamente
        </label>
      </div>

      {error && (
        <p className="mt-3 flex items-center gap-1.5 text-sm text-rose-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}

      <button
        onClick={onContinue}
        disabled={loading}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-rose-500 py-3 text-base font-semibold text-white shadow-lg transition-transform hover:scale-[1.02] hover:bg-rose-600 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Gerando PIX...
          </>
        ) : (
          <>
            <QrCode className="h-5 w-5" />
            Gerar QR Code PIX
          </>
        )}
      </button>
    </>
  );
}

function PixStep({
  amount,
  pix,
  copied,
  onCopy,
}: {
  amount: number;
  pix: PixResult | null;
  copied: boolean;
  onCopy: () => void;
}) {
  if (!pix) return null;

  return (
    <div className="text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
        <CheckCircle2 className="h-6 w-6 text-emerald-500" />
      </span>
      <p className="mt-3 text-sm text-stone-600">Doação de</p>
      <p className="text-2xl font-extrabold text-stone-900">{formatBRL(amount)}</p>

      <div className="mt-5 rounded-2xl border-2 border-stone-200 bg-white p-4">
        {pix.pixImage ? (
          <img
            src={pix.pixImage}
            alt="QR Code PIX"
            className="mx-auto h-48 w-48 rounded-lg"
          />
        ) : (
          <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-lg bg-stone-50">
            <QrCode className="h-16 w-16 text-stone-300" />
          </div>
        )}

        {pix.expiresAt && (
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-amber-600">
            <Clock className="h-3.5 w-3.5" />
            Expira em {new Date(pix.expiresAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>

      <p className="mt-4 text-sm font-medium text-stone-700">
        Escaneie o QR Code ou copie o código abaixo:
      </p>

      <div className="mt-2 flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 p-2">
        <code className="flex-1 truncate text-xs text-stone-600">{pix.pixCode}</code>
        <button
          onClick={onCopy}
          className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            copied ? 'bg-emerald-100 text-emerald-700' : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          {copied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copiado!' : 'Copiar'}
        </button>
      </div>

      <div className="mt-5 rounded-xl bg-emerald-50 p-3 text-left text-xs leading-relaxed text-emerald-800">
        <p className="flex items-center gap-1.5 font-semibold">
          <ShieldCheck className="h-4 w-4" />
          Como pagar
        </p>
        <ol className="mt-1.5 space-y-1">
          <li>1. Abra o app do seu banco</li>
          <li>2. Escolha pagar com PIX</li>
          <li>3. Escaneie o QR Code ou cole o código</li>
          <li>4. Confirme o pagamento</li>
        </ol>
        <p className="mt-2 text-emerald-600">
          Sua doação aparecerá automaticamente no painel após o pagamento ser confirmado.
        </p>
      </div>
    </div>
  );
}
