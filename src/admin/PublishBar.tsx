import { useState } from 'react';
import { Save, UploadCloud, RotateCcw, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useAdminContent } from '@/admin/AdminContent';

export function PublishBar() {
  const { draft, dirty, saving, lastSaved, saveDraftNow, publish, discard, error } = useAdminContent();
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [publishNote, setPublishNote] = useState('');
  const [showPublish, setShowPublish] = useState(false);

  async function handlePublish() {
    try {
      await publish(publishNote || 'Publicação manual');
      setShowPublish(false);
      setPublishNote('');
    } catch {
      // error surfaced via context
    }
  }

  async function handleDiscard() {
    await discard();
    setConfirmDiscard(false);
  }

  return (
    <div className="sticky top-0 z-20 -mx-6 mb-6 border-b border-stone-200 bg-white/90 px-6 py-3 backdrop-blur">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm">
          {dirty ? (
            <span className="flex items-center gap-1.5 text-amber-600">
              <AlertCircle className="h-4 w-4" />
              Alterações não salvas
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-600">
              <Check className="h-4 w-4" />
              Salvo
            </span>
          )}
          {lastSaved && (
            <span className="text-xs text-stone-400">
              Último save: {lastSaved.toLocaleTimeString('pt-BR')}
            </span>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {dirty && (
            <button
              onClick={() => setConfirmDiscard(true)}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" />
              Descartar
            </button>
          )}
          <button
            onClick={saveDraftNow}
            disabled={saving || !dirty}
            className="flex items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar rascunho
          </button>
          <button
            onClick={() => setShowPublish(true)}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-rose-500 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-rose-600 disabled:opacity-50"
          >
            <UploadCloud className="h-4 w-4" />
            Publicar
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-rose-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}

      {confirmDiscard && (
        <Modal onClose={() => setConfirmDiscard(false)}>
          <h3 className="text-lg font-bold text-stone-900">Descartar alterações?</h3>
          <p className="mt-2 text-sm text-stone-600">
            As alterações não publicadas serão perdidas e o rascunho voltará ao conteúdo publicado atual.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <button
              onClick={() => setConfirmDiscard(false)}
              className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100"
            >
              Cancelar
            </button>
            <button
              onClick={handleDiscard}
              className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600"
            >
              Descartar
            </button>
          </div>
        </Modal>
      )}

      {showPublish && (
        <Modal onClose={() => setShowPublish(false)}>
          <h3 className="text-lg font-bold text-stone-900">Publicar alterações</h3>
          <p className="mt-2 text-sm text-stone-600">
            As alterações do rascunho serão aplicadas ao site público imediatamente. A versão atual será salva no histórico.
          </p>
          <input
            type="text"
            value={publishNote}
            onChange={(e) => setPublishNote(e.target.value)}
            placeholder="Nota opcional (ex.: atualizei o título do hero)"
            className="mt-4 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-rose-500"
          />
          <div className="mt-5 flex justify-end gap-2">
            <button
              onClick={() => setShowPublish(false)}
              className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100"
            >
              Cancelar
            </button>
            <button
              onClick={handlePublish}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
              Publicar agora
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        {children}
      </div>
    </div>
  );
}
