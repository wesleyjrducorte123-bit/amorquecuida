import { Plus, Trash2, MessageSquare } from 'lucide-react';
import { PageHeader, Card, Field } from '@/admin/ui';
import { PublishBar } from '@/admin/PublishBar';
import { useAdminContent } from '@/admin/AdminContent';
import { MediaField } from '@/admin/MediaField';

export function TestimonialsEditor() {
  const { draft, update, loading } = useAdminContent();

  if (loading) return <div><PageHeader title="Depoimentos" /><p className="text-sm text-stone-500">Carregando...</p></div>;

  const items = draft.testimonials.items;

  function setItem(i: number, patch: Partial<(typeof items)[0]>) {
    const next = items.map((it, j) => (j === i ? { ...it, ...patch } : it));
    update({ testimonials: { ...draft.testimonials, items: next } });
  }

  return (
    <div>
      <PublishBar />
      <PageHeader title="Depoimentos" subtitle="Gerencie os depoimentos exibidos na página pública." />
      <Card className="mb-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Eyebrow" value={draft.testimonials.eyebrow} onChange={(v) => update({ testimonials: { ...draft.testimonials, eyebrow: v } })} />
          <Field label="Título" value={draft.testimonials.title} onChange={(v) => update({ testimonials: { ...draft.testimonials, title: v } })} />
          <div className="sm:col-span-2">
            <Field label="Subtítulo" value={draft.testimonials.subtitle} onChange={(v) => update({ testimonials: { ...draft.testimonials, subtitle: v } })} />
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {items.map((t, i) => (
          <Card key={i}>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-stone-700">
                <MessageSquare className="h-4 w-4 text-rose-400" />
                Depoimento {i + 1}
              </div>
              <button
                onClick={() => {
                  if (!confirm('Remover este depoimento?')) return;
                  update({ testimonials: { ...draft.testimonials, items: items.filter((_, j) => j !== i) } });
                }}
                className="rounded-md p-1.5 text-rose-500 hover:bg-rose-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Nome" value={t.name} onChange={(v) => setItem(i, { name: v })} />
              <Field label="Tempo (ex.: 3 h, 1 d)" value={t.time} onChange={(v) => setItem(i, { time: v })} />
              <div className="sm:col-span-2">
                <MediaField label="Foto do depoente (URL ou upload)" value={t.avatar} onChange={(v) => setItem(i, { avatar: v })} />
              </div>
              <div className="sm:col-span-2">
                <Field label="Texto do depoimento" textarea rows={2} value={t.text} onChange={(v) => setItem(i, { text: v })} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <button
        onClick={() =>
          update({
            testimonials: {
              ...draft.testimonials,
              items: [...items, { name: 'Novo depoente', time: 'agora', avatar: '', text: '' }],
            },
          })
        }
        className="mt-4 flex items-center gap-1.5 rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100"
      >
        <Plus className="h-4 w-4" />
        Adicionar depoimento
      </button>
    </div>
  );
}
