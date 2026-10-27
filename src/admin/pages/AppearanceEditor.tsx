import { PageHeader, Card } from '@/admin/ui';
import { PublishBar } from '@/admin/PublishBar';
import { useAdminContent } from '@/admin/AdminContent';

export function AppearanceEditor() {
  const { draft, update, loading } = useAdminContent();

  if (loading) return <div><PageHeader title="Aparência e cores" /><p className="text-sm text-stone-500">Carregando...</p></div>;

  const a = draft.appearance;

  return (
    <div>
      <PublishBar />
      <PageHeader title="Aparência e cores" subtitle="Defina as cores principais do site. (Aplicado ao site público após publicar.)" />
      <Card>
        <div className="grid gap-6 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-stone-600">Cor principal (botões, destaques)</span>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={a.primaryColor}
                onChange={(e) => update({ appearance: { ...a, primaryColor: e.target.value } })}
                className="h-10 w-14 cursor-pointer rounded border border-stone-300"
              />
              <input
                type="text"
                value={a.primaryColor}
                onChange={(e) => update({ appearance: { ...a, primaryColor: e.target.value } })}
                className="w-32 rounded-lg border border-stone-300 px-3 py-2 text-sm"
              />
            </div>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-stone-600">Cor de destaque (acentos)</span>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={a.accentColor}
                onChange={(e) => update({ appearance: { ...a, accentColor: e.target.value } })}
                className="h-10 w-14 cursor-pointer rounded border border-stone-300"
              />
              <input
                type="text"
                value={a.accentColor}
                onChange={(e) => update({ appearance: { ...a, accentColor: e.target.value } })}
                className="w-32 rounded-lg border border-stone-300 px-3 py-2 text-sm"
              />
            </div>
          </label>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <span className="rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: a.primaryColor }}>
            Botão de doação
          </span>
          <span className="rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: a.accentColor }}>
            Destaque
          </span>
        </div>
        <p className="mt-4 text-xs text-stone-400">
          As cores são salvas no conteúdo e aplicadas ao site público na publicação.
        </p>
      </Card>
    </div>
  );
}
