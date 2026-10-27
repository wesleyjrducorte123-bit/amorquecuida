import { useRef, useState } from 'react';
import { Upload, Loader2, Link as LinkIcon } from 'lucide-react';
import { uploadMedia } from '@/lib/content';

interface MediaFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  maxSizeMB?: number;
  isVideo?: boolean;
}

export function MediaField({
  label,
  value,
  onChange,
  accept = 'image/*',
  maxSizeMB = 10,
  isVideo = false,
}: MediaFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(file: File) {
    setError(null);
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Arquivo excede ${maxSizeMB}MB.`);
      return;
    }
    setUploading(true);
    try {
      const asset = await uploadMedia(file);
      onChange(asset.public_url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha no upload.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div>
      <span className="mb-1 block text-xs font-medium text-stone-600">{label}</span>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <LinkIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Cole uma URL ou faça upload"
            className="w-full rounded-lg border border-stone-300 py-2 pl-8 pr-3 text-sm outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
          />
        </div>
        <label className="flex cursor-pointer shrink-0 items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100">
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">{uploading ? 'Enviando...' : 'Upload'}</span>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload(f);
            }}
          />
        </label>
      </div>
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
      {value && (
        <div className="mt-2">
          {isVideo ? (
            <video src={value} className="h-24 w-full rounded-lg bg-stone-100 object-cover" muted />
          ) : (
            <img src={value} alt="" className="h-24 w-full rounded-lg bg-stone-100 object-cover" />
          )}
        </div>
      )}
    </div>
  );
}
