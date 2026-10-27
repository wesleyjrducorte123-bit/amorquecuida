import { useEffect } from 'react';
import { X } from 'lucide-react';

interface VideoModalProps {
  open: boolean;
  src: string;
  poster: string;
  onClose: () => void;
}

export function VideoModal({ open, src, poster, onClose }: VideoModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-3xl">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
          aria-label="Fechar vídeo"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl">
          {src ? (
            <video
              src={src}
              poster={poster}
              controls
              autoPlay
              className="h-full w-full"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center text-white/80">
              <p className="text-sm">
                Vídeo da campanha ainda não configurado.
              </p>
              <p className="text-xs text-white/50">
                Adicione a URL do vídeo oficial no arquivo de configuração
                (campo <code className="text-white/70">videoSrc</code>) para
                exibi-lo aqui.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
