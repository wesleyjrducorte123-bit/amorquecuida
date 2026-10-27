import { useEffect, useState } from 'react';
import {
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  Users,
  DollarSign,
  Clock,
  TrendingUp,
  Download,
} from 'lucide-react';
import { PageHeader, Card, Field } from '@/admin/ui';
import { PublishBar } from '@/admin/PublishBar';
import {
  listDonations,
  addDonation,
  updateDonationStatus,
  deleteDonation,
  loadDonationStats,
  type Donation,
  type DonationStats,
} from '@/lib/content';

const STATUS_LABELS: Record<Donation['status'], string> = {
  pending: 'Pendente',
  paid: 'Pago',
  failed: 'Falhou',
  refunded: 'Reembolsado',
};

const STATUS_COLORS: Record<Donation['status'], string> = {
  pending: 'bg-amber-100 text-amber-700',
  paid: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-rose-100 text-rose-700',
  refunded: 'bg-stone-200 text-stone-600',
};

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [stats, setStats] = useState<DonationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  async function reload() {
    setLoading(true);
    setError(null);
    try {
      const [list, s] = await Promise.all([listDonations(), loadDonationStats()]);
      setDonations(list);
      setStats(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao carregar doações.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  function exportCSV() {
    const rows = [
      ['Nome', 'Email', 'Valor', 'Status', 'Provider', 'Data', 'Anônimo', 'Mensagem'],
      ...donations.map((d) => [
        d.is_anonymous ? 'Anônimo' : (d.donor_name ?? ''),
        d.donor_email ?? '',
        String(d.amount),
        STATUS_LABELS[d.status],
        d.provider,
        new Date(d.created_at).toLocaleString('pt-BR'),
        d.is_anonymous ? 'Sim' : 'Não',
        d.message ?? '',
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `doacoes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <PublishBar />
      <PageHeader
        title="Doações e pagadores"
        subtitle="Controle de quem fez pagamentos e doações à campanha."
      />

      {error && (
        <p className="mb-4 flex items-center gap-1.5 text-sm text-rose-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}

      {/* Stats */}
      {stats && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <DollarSign className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xl font-bold text-stone-900">{formatBRL(stats.totalRaised)}</p>
                <p className="text-xs text-stone-500">total arrecadado</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                <Users className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xl font-bold text-stone-900">{stats.donorCount}</p>
                <p className="text-xs text-stone-500">doadores únicos</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <TrendingUp className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xl font-bold text-stone-900">{formatBRL(stats.averageAmount)}</p>
                <p className="text-xs text-stone-500">ticket médio</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <Clock className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xl font-bold text-stone-900">{stats.pendingCount}</p>
                <p className="text-xs text-stone-500">pagamentos pendentes</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Actions */}
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-600"
        >
          <Plus className="h-4 w-4" />
          Registrar doação manual
        </button>
        <button
          onClick={exportCSV}
          disabled={donations.length === 0}
          className="flex items-center gap-1.5 rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-sm text-stone-500">Carregando...</p>
      ) : donations.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Users className="h-10 w-10 text-stone-300" />
            <p className="text-sm text-stone-500">Nenhuma doação registrada ainda.</p>
            <p className="text-xs text-stone-400">
              Doações registradas manualmente ou por um provedor de pagamentos aparecerão aqui.
            </p>
          </div>
        </Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-xs font-semibold uppercase tracking-wider text-stone-400">
                <th className="px-4 py-3">Doador</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Origem</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {donations.map((d) => (
                <tr key={d.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-stone-800">
                      {d.is_anonymous ? 'Anônimo' : (d.donor_name || '—')}
                    </p>
                    {d.donor_email && !d.is_anonymous && (
                      <p className="text-xs text-stone-400">{d.donor_email}</p>
                    )}
                    {d.message && (
                      <p className="mt-0.5 max-w-xs truncate text-xs italic text-stone-400">"{d.message}"</p>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-stone-800">{formatBRL(Number(d.amount))}</td>
                  <td className="px-4 py-3">
                    <select
                      value={d.status}
                      onChange={async (e) => {
                        try {
                          await updateDonationStatus(d.id, e.target.value as Donation['status']);
                          await reload();
                        } catch (err) {
                          setError(err instanceof Error ? err.message : 'Falha ao atualizar.');
                        }
                      }}
                      className={`rounded-full border-0 px-2.5 py-1 text-xs font-semibold ${STATUS_COLORS[d.status]}`}
                    >
                      {Object.entries(STATUS_LABELS).map(([val, lbl]) => (
                        <option key={val} value={val}>{lbl}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-stone-500">{d.provider}</td>
                  <td className="px-4 py-3 text-xs text-stone-500">
                    {new Date(d.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={async () => {
                        if (!confirm('Excluir esta doação?')) return;
                        try {
                          await deleteDonation(d.id);
                          await reload();
                        } catch (err) {
                          setError(err instanceof Error ? err.message : 'Falha ao excluir.');
                        }
                      }}
                      className="rounded-md p-1.5 text-rose-500 hover:bg-rose-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {showAdd && (
        <AddDonationModal
          onClose={() => setShowAdd(false)}
          onSaved={async () => {
            setShowAdd(false);
            await reload();
          }}
        />
      )}
    </div>
  );
}

function AddDonationModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [status, setStatus] = useState<Donation['status']>('paid');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    const value = Number(amount);
    if (!value || value <= 0) {
      setError('Informe um valor válido.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await addDonation({
        donor_name: anonymous ? null : (name || null),
        donor_email: anonymous ? null : (email || null),
        amount: value,
        message: message || null,
        status,
        is_anonymous: anonymous,
      });
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao registrar.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-stone-900">Registrar doação manual</h3>
        <p className="mt-1 text-xs text-stone-500">
          Use para registrar doações recebidas por transferência, PIX ou outros meios fora do site.
        </p>
        <div className="mt-4 space-y-3">
          <Field label="Nome do doador" value={name} onChange={setName} disabled={anonymous} placeholder={anonymous ? 'Anônimo' : 'Nome'} />
          <Field label="E-mail" value={email} onChange={setEmail} disabled={anonymous} placeholder={anonymous ? 'Anônimo' : 'email@exemplo.com'} />
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-stone-600">Valor (R$)</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-rose-500"
              placeholder="50.00"
            />
          </label>
          <Field label="Mensagem (opcional)" textarea rows={2} value={message} onChange={setMessage} />
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-stone-600">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Donation['status'])}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-rose-500"
            >
              <option value="paid">Pago</option>
              <option value="pending">Pendente</option>
              <option value="failed">Falhou</option>
              <option value="refunded">Reembolsado</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-stone-600">
            <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
            Doação anônima
          </label>
        </div>
        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Registrar
          </button>
        </div>
      </div>
    </div>
  );
}
