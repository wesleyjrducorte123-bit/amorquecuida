import { useEffect, useState } from 'react';
import { History, RotateCcw, Eye, Loader2, AlertCircle } from 'lucide-react';
import { PageHeader, Card } from '@/admin/ui';
import { PublishBar } from '@/admin/PublishBar';
import { loadRevisions, restoreRevision, type RevisionRow } from '@/lib/content';

export function RevisionsPage() {
  const [revisions, setRevisions] = useState<RevisionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewing, setViewing] = useState<RevisionRow | null>(null);
  const [restoring, setRestoring] = useState<string | null>(null);

  async function reload() {
    setLoading(true);
    setError(null);
    try {
      setRevisions(await loadRevisions());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao carregar histórico.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  async function handleRestore(rev: RevisionRow) {
    if (!confirm('Restaurar esta versão? O conteúdo atual será substituído e uma nova revisão será criada.')) return;
    setRestoring(rev.id);
    try {
      await restoreRevision(rev.id);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao restaurar.');
    } finally {
      setRestoring(null);
    }
  }

  return (
    <div>
      <PublishBar />
      <PageHeader title="Histórico de versões" subtitle="Cada publicação cria uma versão. Restaure uma versão anterior a qualquer momento." />

      {error && (
        <p className="mb-4 flex items-center gap-1.5 text-sm text-rose-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-stone-500">Carregando...</p>
      ) : revisions.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <History className="h-10 w-10 text-stone-300" />
            <p className="text-sm text-stone-500">Nenhuma versão publicada ainda.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {revisions.map((rev, i) => (
            <Card key={rev.id}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-stone-900">
                    {i === 0 ? 'Versão atual' : `Versão ${revisions.length - i}`}
                  </p>
                  <p className="text-xs text-stone-500">{rev.note || 'Publicação'}</p>
                  <p className="mt-1 text-xs text-stone-400">
                    {new Date(rev.published_at).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewing(rev)}
                    className="flex items-center gap-1 rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-100"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Ver
                  </button>
                  <button
                    onClick={() => handleRestore(rev)}
                    disabled={restoring === rev.id}
                    className="flex items-center gap-1 rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-600 disabled:opacity-50"
                  >
                    {restoring === rev.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                    Restaurar
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="absolute inset-0" onClick={() => setViewing(null)} />
          <div className="relative max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-2 text-lg font-bold text-stone-900">Conteúdo da versão</h3>
            <p className="mb-4 text-xs text-stone-400">
              {new Date(viewing.published_at).toLocaleString('pt-BR')} — {viewing.note || 'Publicação'}
            </p>
            <pre className="max-h-60 overflow-auto rounded-lg bg-stone-50 p-3 text-xs text-stone-600">
{JSON.stringify(
  {
    brand: viewing.content.brand,
    hero: { title: viewing.content.hero.title, intro: viewing.content.hero.intro },
    sections: viewing.content.sections,
  },
  null,
  2
)}
            </pre>
            <div className="mt-4 flex justify-end">
              <button onClick={() => setViewing(null)} className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
