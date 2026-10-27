import { Plus, Trash2, HelpCircle } from 'lucide-react';
import { PageHeader, Card, Field } from '@/admin/ui';
import { PublishBar } from '@/admin/PublishBar';
import { useAdminContent } from '@/admin/AdminContent';

export function FaqEditor() {
  const { draft, update, loading } = useAdminContent();

  if (loading) return <div><PageHeader title="Perguntas frequentes" /><p className="text-sm text-stone-500">Carregando...</p></div>;

  const items = draft.faq.items;

  function setItem(i: number, patch: Partial<(typeof items)[0]>) {
    const next = items.map((it, j) => (j === i ? { ...it, ...patch } : it));
    update({ faq: { ...draft.faq, items: next } });
  }

  return (
    <div>
      <PublishBar />
      <PageHeader title="Perguntas frequentes" subtitle="Edite as perguntas e respostas exibidas no site." />
      <Card className="mb-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Eyebrow" value={draft.faq.eyebrow} onChange={(v) => update({ faq: { ...draft.faq, eyebrow: v } })} />
          <Field label="Título" value={draft.faq.title} onChange={(v) => update({ faq: { ...draft.faq, title: v } })} />
        </div>
      </Card>

      <div className="space-y-3">
        {items.map((item, i) => (
          <Card key={i}>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-stone-700">
                <HelpCircle className="h-4 w-4 text-rose-400" />
                Pergunta {i + 1}
              </div>
              <button
                onClick={() => {
                  if (!confirm('Remover esta pergunta?')) return;
                  update({ faq: { ...draft.faq, items: items.filter((_, j) => j !== i) } });
                }}
                className="rounded-md p-1.5 text-rose-500 hover:bg-rose-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <Field label="Pergunta" value={item.q} onChange={(v) => setItem(i, { q: v })} />
              <Field label="Resposta" textarea rows={3} value={item.a} onChange={(v) => setItem(i, { a: v })} />
            </div>
          </Card>
        ))}
      </div>

      <button
        onClick={() => update({ faq: { ...draft.faq, items: [...items, { q: 'Nova pergunta', a: 'Nova resposta' }] } })}
        className="mt-4 flex items-center gap-1.5 rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100"
      >
        <Plus className="h-4 w-4" />
        Adicionar pergunta
      </button>
    </div>
  );
}
