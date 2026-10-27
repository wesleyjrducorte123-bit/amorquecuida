import { Heart, LogOut, ExternalLink } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import type { AdminPage } from './AdminApp';

interface AdminLayoutProps {
  page: AdminPage;
  onNavigate: (p: AdminPage) => void;
  children: React.ReactNode;
}

const NAV: { key: AdminPage; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'editor', label: 'Editor do site' },
  { key: 'testimonials', label: 'Depoimentos' },
  { key: 'faq', label: 'Perguntas frequentes' },
  { key: 'campaign', label: 'Campanha e valores' },
  { key: 'donations', label: 'Doações e pagadores' },
  { key: 'gateway', label: 'Gateway de pagamentos' },
  { key: 'media', label: 'Biblioteca de mídia' },
  { key: 'seo', label: 'SEO e metadados' },
  { key: 'appearance', label: 'Aparência e cores' },
  { key: 'settings', label: 'Configurações gerais' },
  { key: 'preview', label: 'Pré-visualização' },
  { key: 'revisions', label: 'Histórico de versões' },
];

export function AdminLayout({ page, onNavigate, children }: AdminLayoutProps) {
  const { user, signOut } = useAuth();

  return (
    <div className="flex min-h-screen bg-stone-100">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-stone-900 text-white">
        <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500">
            <Heart className="h-4 w-4 fill-white text-white" />
          </span>
          <span className="font-bold">Salve Africa CMS</span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {NAV.map((item) => (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`mb-0.5 w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                page === item.key
                  ? 'bg-rose-500 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-white/10 px-3 py-3">
          <a
            href="/"
            className="mb-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ExternalLink className="h-4 w-4" />
            Ver site público
          </a>
          <div className="px-3 pb-2 text-xs text-white/40 truncate">{user?.email}</div>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Sair do painel
          </button>
        </div>
      </aside>

      <main className="ml-64 flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-5xl px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
