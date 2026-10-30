import { useEffect, useState } from 'react';
import {
  LayoutTemplate,
  Image as ImageIcon,
  MessageSquare,
  HelpCircle,
  Settings,
  History,
  Eye,
  TrendingUp,
  CircleCheck,
  DollarSign,
  Users,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { PageHeader, Card } from '@/admin/ui';
import { PublishBar } from '@/admin/PublishBar';
import { useAdminContent } from '@/admin/AdminContent';
import { loadRevisions, loadDonationStats, type RevisionRow, type DonationStats } from '@/lib/content';
import type { AdminPage } from '@/admin/AdminApp';

interface DashboardProps {
  onNavigate: (p: AdminPage) => void;
}

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { draft, dirty, loading } = useAdminContent();
  const [revisions, setRevisions] = useState<RevisionRow[]>([]);
  const [donationStats, setDonationStats] = useState<DonationStats | null>(null);

  useEffect(() => {
    loadRevisions()
      .then(setRevisions)
      .catch(() => setRevisions([]));
    loadDonationStats()
      .then(setDonationStats)
      .catch(() => setDonationStats(null));
  }, []);

  const visibleSections = draft.sections.filter((s) => s.visible).length;
  const hiddenSections = draft.sections.length - visibleSections;

  const shortcuts: { label: string; icon: React.ReactNode; page: AdminPage; desc: string }[] = [
    { label: 'Editor do site', icon: <LayoutTemplate className="h-5 w-5" />, page: 'editor', desc: 'Editar textos, imagens e botões' },
    { label: 'Depoimentos', icon: <MessageSquare className="h-5 w-5" />, page: 'testimonials', desc: 'Gerenciar depoimentos' },
    { label: 'Perguntas frequentes', icon: <HelpCircle className="h-5 w-5" />, page: 'faq', desc: 'Editar perguntas e respostas' },
    { label: 'Campanha', icon: <TrendingUp className="h-5 w-5" />, page: 'campaign', desc: 'Meta, valores e textos' },
    { label: 'Doações', icon: <DollarSign className="h-5 w-5" />, page: 'donations', desc: 'Ver pagadores e valores' },
    { label: 'Mídia', icon: <ImageIcon className="h-5 w-5" />, page: 'media', desc: 'Biblioteca de imagens' },
    { label: 'Configurações', icon: <Settings className="h-5 w-5" />, page: 'settings', desc: 'Marca, contato e rodapé' },
  ];

  return (
    <div>
      <PublishBar />
      <PageHeader title="Dashboard" subtitle="Visão geral do conteúdo, doações e atalhos de edição." />

      {loading ? (
        <p className="text-sm text-stone-500">Carregando...</p>
      ) : (
        <>
          {/* Donation stats — always visible */}
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-stone-500">Doações</h2>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                  <DollarSign className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-2xl font-bold text-stone-900">
                    {donationStats ? formatBRL(donationStats.totalRaised) : '—'}
                  </p>
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
                  <p className="text-2xl font-bold text-stone-900">
                    {donationStats ? donationStats.donorCount : '—'}
                  </p>
                  <p className="text-xs text-stone-500">doadores</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <CircleCheck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-2xl font-bold text-stone-900">
                    {donationStats ? donationStats.paidCount : '—'}
                  </p>
                  <p className="text-xs text-stone-500">pagamentos confirmados</p>
                </div>
              </div>
            </Card>
            <Card>
              <button onClick={() => onNavigate('donations')} className="flex w-full items-center gap-3 text-left">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                  <TrendingUp className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-2xl font-bold text-stone-900">
                    {donationStats ? donationStats.pendingCount : '—'}
                  </p>
                  <p className="text-xs text-stone-500">pendentes · ver detalhes</p>
                </div>
              </button>
            </Card>
          </div>

          {/* Extended donation stats */}
          {donationStats && (
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <TrendingUp className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-2xl font-bold text-stone-900">{donationStats.clickCount}</p>
                    <p className="text-xs text-stone-500">doações iniciadas</p>
                  </div>
                </div>
              </Card>
              <Card>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                    <Clock className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-2xl font-bold text-stone-900">{donationStats.awaitingCount}</p>
                    <p className="text-xs text-stone-500">aguardando pagamento</p>
                  </div>
                </div>
              </Card>
              <Card>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                    <AlertCircle className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-2xl font-bold text-stone-900">{donationStats.failedCount}</p>
                    <p className="text-xs text-stone-500">recusadas</p>
                  </div>
                </div>
              </Card>
              <Card>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 text-stone-500">
                    <Users className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-2xl font-bold text-stone-900">{donationStats.abandonedCount}</p>
                    <p className="text-xs text-stone-500">abandonaram checkout</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Recent activities */}
          {donationStats && donationStats.recent.length > 0 && (
            <>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">Atividades recentes</h2>
                <button
                  onClick={() => onNavigate('donations')}
                  className="text-sm font-medium text-rose-600 hover:underline"
                >
                  Ver todas
                </button>
              </div>
              <Card className="mb-8">
                <ul className="divide-y divide-stone-100">
                  {donationStats.recent.slice(0, 8).map((d) => {
                    const statusLabel: Record<string, string> = {
                      initiated: 'Iniciada',
                      awaiting: 'Aguardando',
                      pending: 'Pendente',
                      paid: 'Pago',
                      failed: 'Recusada',
                      refunded: 'Reembolsada',
                      canceled: 'Cancelada',
                      expired: 'Expirada',
                    };
                    const statusColor: Record<string, string> = {
                      paid: 'text-emerald-600',
                      failed: 'text-rose-600',
                      canceled: 'text-stone-400',
                      expired: 'text-orange-600',
                      awaiting: 'text-amber-600',
                      pending: 'text-amber-600',
                      initiated: 'text-blue-600',
                      refunded: 'text-stone-500',
                    };
                    return (
                      <li key={d.id} className="flex items-center justify-between py-2.5">
                        <div>
                          <p className="text-sm font-medium text-stone-800">
                            {d.is_anonymous ? 'Anônimo' : (d.donor_name || 'Visitante')}
                          </p>
                          <p className="text-xs text-stone-400">
                            {new Date(d.created_at).toLocaleDateString('pt-BR')}
                            {d.checkout_step ? ` · ${d.checkout_step}` : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-stone-800">{formatBRL(Number(d.amount))}</p>
                          <p className={`text-xs ${statusColor[d.status] ?? 'text-stone-400'}`}>
                            {statusLabel[d.status] ?? d.status}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            </>
          )}

          {/* Content stats */}
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-stone-500">Conteúdo do site</h2>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <Card>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                  <CircleCheck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-2xl font-bold text-stone-900">{visibleSections}</p>
                  <p className="text-xs text-stone-500">seções visíveis</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                  <LayoutTemplate className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-2xl font-bold text-stone-900">{hiddenSections}</p>
                  <p className="text-xs text-stone-500">seções ocultas</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${dirty ? 'bg-rose-100 text-rose-600' : 'bg-stone-100 text-stone-500'}`}>
                  <History className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-2xl font-bold text-stone-900">{dirty ? 'Sim' : 'Não'}</p>
                  <p className="text-xs text-stone-500">rascunho pendente</p>
                </div>
              </div>
            </Card>
          </div>

          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-stone-500">Atalhos</h2>
          <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {shortcuts.map((s) => (
              <button
                key={s.page}
                onClick={() => onNavigate(s.page)}
                className="flex items-start gap-3 rounded-xl border border-stone-200 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
                  {s.icon}
                </span>
                <div>
                  <p className="text-sm font-semibold text-stone-900">{s.label}</p>
                  <p className="text-xs text-stone-500">{s.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">Últimas alterações</h2>
            <button
              onClick={() => onNavigate('revisions')}
              className="text-sm font-medium text-rose-600 hover:underline"
            >
              Ver histórico completo
            </button>
          </div>
          <Card className="mt-3">
            {revisions.length === 0 ? (
              <p className="text-sm text-stone-500">Nenhuma alteração publicada ainda.</p>
            ) : (
              <ul className="divide-y divide-stone-100">
                {revisions.slice(0, 5).map((r) => (
                  <li key={r.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-sm font-medium text-stone-800">{r.note || 'Publicação'}</p>
                      <p className="text-xs text-stone-400">
                        {new Date(r.published_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <button
                      onClick={() => onNavigate('revisions')}
                      className="flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-rose-600"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Detalhes
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
