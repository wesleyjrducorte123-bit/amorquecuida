import { PageHeader, Card, Field } from '@/admin/ui';
import { PublishBar } from '@/admin/PublishBar';
import { useAdminContent } from '@/admin/AdminContent';
import { MediaField } from '@/admin/MediaField';

export function CampaignEditor() {
  const { draft, update, loading } = useAdminContent();

  if (loading) return <div><PageHeader title="Campanha e valores" /><p className="text-sm text-stone-500">Carregando...</p></div>;

  const p = draft.progress;

  return (
    <div>
      <PublishBar />
      <PageHeader
        title="Campanha e valores"
        subtitle="Edite a meta de arrecadação, valores sugeridos e textos da campanha."
      />

      <div className="space-y-4">
        <Card>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-stone-500">Barra de progresso</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Eyebrow" value={p.eyebrow} onChange={(v) => update({ progress: { ...p, eyebrow: v } })} />
            <Field label="Texto da percentagem" value={p.percentLabel} onChange={(v) => update({ progress: { ...p, percentLabel: v } })} />
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-stone-600">Percentagem (0–100)</span>
              <input
                type="number"
                min={0}
                max={100}
                value={p.percent}
                onChange={(e) => update({ progress: { ...p, percent: Number(e.target.value) } })}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-stone-600">Valor arrecadado (R$)</span>
              <input
                type="number"
                value={p.raised}
                onChange={(e) => update({ progress: { ...p, raised: Number(e.target.value) } })}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-stone-600">Meta (R$)</span>
              <input
                type="number"
                value={p.goal}
                onChange={(e) => update({ progress: { ...p, goal: Number(e.target.value) } })}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-stone-600">Número de doadores</span>
              <input
                type="number"
                value={p.donors}
                onChange={(e) => update({ progress: { ...p, donors: Number(e.target.value) } })}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              />
            </label>
            <Field label="Texto 'arrecadados de'" value={p.raisedLabel} onChange={(v) => update({ progress: { ...p, raisedLabel: v } })} />
            <Field label="Texto 'doadores participaram'" value={p.donorsLabel} onChange={(v) => update({ progress: { ...p, donorsLabel: v } })} />
            <div className="sm:col-span-2">
              <Field label="Subtexto" textarea value={p.subtext} onChange={(v) => update({ progress: { ...p, subtext: v } })} />
            </div>
            <Field label="Destaque" value={p.highlight} onChange={(v) => update({ progress: { ...p, highlight: v } })} />
            <Field label="Texto 'apoiadores'" value={p.supportersLabel} onChange={(v) => update({ progress: { ...p, supportersLabel: v } })} />
          </div>
          <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
            Os valores de arrecadação e número de doadores são editáveis manualmente aqui. Para que reflitam doações reais, é necessário conectar um provedor de pagamentos legítimo (ex.: Stripe) que registre as transações no backend.
          </p>
        </Card>

        <Card>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-stone-500">Vídeo da campanha</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <MediaField label="Vídeo (MP4 ou hospedado)" value={draft.hero.videoSrc} onChange={(v) => update({ hero: { ...draft.hero, videoSrc: v } })} accept="video/*" maxSizeMB={50} isVideo />
            <MediaField label="Thumbnail / capa" value={draft.hero.videoPoster} onChange={(v) => update({ hero: { ...draft.hero, videoPoster: v } })} />
          </div>
        </Card>
      </div>
    </div>
  );
}
