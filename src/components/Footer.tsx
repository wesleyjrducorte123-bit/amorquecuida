import { Heart, Mail } from 'lucide-react';
import type { SiteContent } from '@/types/content';

interface FooterProps {
  content: SiteContent;
}

export function Footer({ content }: FooterProps) {
  const { footer, brand } = content;
  return (
    <footer className="bg-stone-900 text-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 lg:flex-row lg:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-500">
                <Heart className="h-5 w-5 fill-white text-white" />
              </span>
              <span className="text-lg font-bold">{brand.name}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              {footer.about}
            </p>
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
              Contato
            </span>
            {footer.contact.email && (
              <a
                href={`mailto:${footer.contact.email}`}
                className="flex items-center gap-2 text-white/80 transition-colors hover:text-white"
              >
                <Mail className="h-4 w-4" />
                {footer.contact.email}
              </a>
            )}
          </div>
        </div>

        <p className="mt-10 border-t border-white/10 pt-6 text-xs leading-relaxed text-white/50">
          {footer.legal}
        </p>
      </div>
    </footer>
  );
}
