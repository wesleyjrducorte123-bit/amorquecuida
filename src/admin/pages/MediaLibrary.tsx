import { useEffect, useRef, useState } from 'react';
import { Upload, Trash2, Copy, Check, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { PageHeader, Card, Field } from '@/admin/ui';
import { PublishBar } from '@/admin/PublishBar';
import { listMedia, uploadMedia, updateMedia, deleteMedia, type MediaAsset } from '@/lib/content';

export function MediaLibrary() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [editing, setEditing] = useState<MediaAsset | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function reload() {
    setLoading(true);
    try {
      setAssets(await listMedia());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao carregar mídia.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024) {
          setError(`Arquivo "${file.name}" excede 10MB.`);
          continue;
        }
        await uploadMedia(file);
      }
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha no upload.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function handleDelete(asset: MediaAsset) {
    if (!confirm(`Remover "${asset.name}"? A imagem será excluída do armazenamento.`)) return;
    try {
      await deleteMedia(asset);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao excluir.');
    }
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div>
      <PublishBar />
      <PageHeader title="Biblioteca de mídia" subtitle="Envie imagens e copie as URLs para usar nas seções do site." />

      {error && (
        <p className="mb-4 flex items-center gap-1.5 text-sm text-rose-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}

      <Card className="mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-600">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? 'Enviando...' : 'Enviar imagem'}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleUpload(e.target.files)}
            />
          </label>
          <span className="text-xs text-stone-400">PNG, JPG, WebP — máx. 10MB cada</span>
        </div>
      </Card>

      {loading ? (
        <p className="text-sm text-stone-500">Carregando...</p>
      ) : assets.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <ImageIcon className="h-10 w-10 text-stone-300" />
            <p className="text-sm text-stone-500">Nenhuma imagem na biblioteca ainda.</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => (
            <Card key={asset.id} className="flex flex-col">
              <img
                src={asset.public_url}
                alt={asset.alt_text || asset.name}
                className="mb-3 h-40 w-full rounded-lg object-cover"
              />
              <p className="truncate text-sm font-medium text-stone-800">{asset.name}</p>
              <p className="text-xs text-stone-400">{asset.mime_type} · {Math.round((asset.size_bytes ?? 0) / 1024)}KB</p>
              <div className="mt-3 flex items-center gap-1">
                <button
                  onClick={() => copyUrl(asset.public_url)}
                  className="flex items-center gap-1 rounded-md border border-stone-300 px-2 py-1 text-xs font-medium text-stone-600 hover:bg-stone-100"
                >
                  {copied === asset.public_url ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  Copiar URL
                </button>
                <button
                  onClick={() => setEditing(asset)}
                  className="rounded-md border border-stone-300 px-2 py-1 text-xs font-medium text-stone-600 hover:bg-stone-100"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(asset)}
                  className="ml-auto rounded-md p-1.5 text-rose-500 hover:bg-rose-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing && (
        <EditModal
          asset={editing}
          onClose={() => setEditing(null)}
          onSave={async (alt, title, desc) => {
            await updateMedia(editing.id, { alt_text: alt, title, description: desc });
            setEditing(null);
            await reload();
          }}
        />
      )}
    </div>
  );
}

function EditModal({
  asset,
  onClose,
  onSave,
}: {
  asset: MediaAsset;
  onClose: () => void;
  onSave: (alt: string, title: string, desc: string) => Promise<void>;
}) {
  const [alt, setAlt] = useState(asset.alt_text);
  const [title, setTitle] = useState(asset.title);
  const [desc, setDesc] = useState(asset.description);
  const [saving, setSaving] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <img src={asset.public_url} alt={alt} className="mb-4 h-32 w-full rounded-lg object-cover" />
        <div className="space-y-3">
          <Field label="Texto alternativo (alt)" value={alt} onChange={setAlt} />
          <Field label="Título" value={title} onChange={setTitle} />
          <Field label="Descrição" textarea rows={2} value={desc} onChange={setDesc} />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100">
            Cancelar
          </button>
          <button
            onClick={async () => {
              setSaving(true);
              try {
                await onSave(alt, title, desc);
              } finally {
                setSaving(false);
              }
            }}
            disabled={saving}
            className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}
