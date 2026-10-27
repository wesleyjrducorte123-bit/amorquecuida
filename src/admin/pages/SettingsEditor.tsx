import { PageHeader, Card, Field } from '@/admin/ui';
import { PublishBar } from '@/admin/PublishBar';
import { useAdminContent } from '@/admin/AdminContent';

export function SettingsEditor() {
  const { draft, update, loading } = useAdminContent();

  if (loading) return <div><PageHeader title="Configurações gerais" /><p className="text-sm text-stone-500">Carregando...</p></div>;

  return (
    <div>
      <PublishBar />
      <PageHeader title="Configurações gerais" subtitle="Marca, informações de contato e rodapé." />

      <div className="space-y-4">
        <Card>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-stone-500">Marca</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome da marca" value={draft.brand.name} onChange={(v) => update({ brand: { ...draft.brand, name: v } })} />
            <Field label="Slogan / tagline" value={draft.brand.tagline} onChange={(v) => update({ brand: { ...draft.brand, tagline: v } })} />
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-stone-500">Rodapé</h3>
          <div className="grid gap-4">
            <Field label="Texto sobre a campanha" textarea value={draft.footer.about} onChange={(v) => update({ footer: { ...draft.footer, about: v } })} />
            <Field label="E-mail de contato" value={draft.footer.contact.email} onChange={(v) => update({ footer: { ...draft.footer, contact: { ...draft.footer.contact, email: v } } })} />
            <Field label="Aviso legal" textarea rows={4} value={draft.footer.legal} onChange={(v) => update({ footer: { ...draft.footer, legal: v } })} />
          </div>
        </Card>
      </div>
    </div>
  );
}
