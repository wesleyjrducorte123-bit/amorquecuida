import { PageHeader, Card, Field } from '@/admin/ui';
import { PublishBar } from '@/admin/PublishBar';
import { useAdminContent } from '@/admin/AdminContent';
import { MediaField } from '@/admin/MediaField';

export function SeoEditor() {
  const { draft, update, loading } = useAdminContent();

  if (loading) return <div><PageHeader title="SEO e metadados" /><p className="text-sm text-stone-500">Carregando...</p></div>;

  const seo = draft.seo;

  return (
    <div>
      <PublishBar />
      <PageHeader title="SEO e metadados" subtitle="Configure o título, descrição e imagem compartilhados em redes sociais e buscadores." />
      <Card>
        <div className="grid gap-4">
          <Field label="Título da página (title)" value={seo.title} onChange={(v) => update({ seo: { ...seo, title: v } })} />
          <Field label="Descrição (meta description)" textarea rows={2} value={seo.description} onChange={(v) => update({ seo: { ...seo, description: v } })} />
          <MediaField label="Imagem OG (Open Graph) — URL ou upload" value={seo.ogImage} onChange={(v) => update({ seo: { ...seo, ogImage: v } })} />
        </div>

        <div className="mt-5 rounded-lg bg-stone-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Pré-visualização</p>
          <div className="mt-2 overflow-hidden rounded-lg border border-stone-200 bg-white">
            <img src={seo.ogImage} alt="" className="h-40 w-full object-cover" />
            <div className="p-3">
              <p className="text-xs text-emerald-600">causaurgenteaf.online</p>
              <p className="text-sm font-semibold text-stone-900">{seo.title}</p>
              <p className="mt-1 text-xs text-stone-500">{seo.description}</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-stone-400">
            O título e a descrição também atualizam a aba do navegador no site público após publicar.
          </p>
        </div>
      </Card>
    </div>
  );
}
