import { useState } from 'react';
import { AdminLogin } from '@/admin/AdminLogin';
import { AdminLayout } from '@/admin/AdminLayout';
import { Dashboard } from '@/admin/pages/Dashboard';
import { SectionEditor } from '@/admin/pages/SectionEditor';
import { MediaLibrary } from '@/admin/pages/MediaLibrary';
import { TestimonialsEditor } from '@/admin/pages/TestimonialsEditor';
import { FaqEditor } from '@/admin/pages/FaqEditor';
import { CampaignEditor } from '@/admin/pages/CampaignEditor';
import { SeoEditor } from '@/admin/pages/SeoEditor';
import { AppearanceEditor } from '@/admin/pages/AppearanceEditor';
import { SettingsEditor } from '@/admin/pages/SettingsEditor';
import { RevisionsPage } from '@/admin/pages/RevisionsPage';
import { PreviewPage } from '@/admin/pages/PreviewPage';
import { DonationsPage } from '@/admin/pages/DonationsPage';
import { PaymentGatewayPage } from '@/admin/pages/PaymentGatewayPage';
import { useAuth } from '@/lib/auth';
import { AdminContentProvider } from '@/admin/AdminContent';

export type AdminPage =
  | 'dashboard'
  | 'editor'
  | 'media'
  | 'testimonials'
  | 'faq'
  | 'campaign'
  | 'donations'
  | 'gateway'
  | 'seo'
  | 'appearance'
  | 'settings'
  | 'revisions'
  | 'preview';

export default function AdminApp() {
  const { user, isAdmin, loading } = useAuth();
  const [page, setPage] = useState<AdminPage>('dashboard');

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-900 text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <AdminLogin />;
  }

  const pages: Record<AdminPage, React.ReactNode> = {
    dashboard: <Dashboard onNavigate={setPage} />,
    editor: <SectionEditor />,
    media: <MediaLibrary />,
    testimonials: <TestimonialsEditor />,
    faq: <FaqEditor />,
    campaign: <CampaignEditor />,
    donations: <DonationsPage />,
    gateway: <PaymentGatewayPage />,
    seo: <SeoEditor />,
    appearance: <AppearanceEditor />,
    settings: <SettingsEditor />,
    revisions: <RevisionsPage />,
    preview: <PreviewPage />,
  };

  return (
    <AdminContentProvider>
      <AdminLayout page={page} onNavigate={setPage}>
        {pages[page]}
      </AdminLayout>
    </AdminContentProvider>
  );
}
