import { useEffect, useState } from 'react';
import { Heart, Menu, X } from 'lucide-react';
import type { SiteContent } from '@/types/content';

interface HeaderProps {
  content: SiteContent;
}

export function Header({ content }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { label: 'Início', href: '#topo' },
    { label: 'Impacto', href: '#impacto' },
    { label: 'Doar', href: '#doar' },
    { label: 'Dúvidas', href: '#faq' },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-stone-900/95 backdrop-blur shadow-lg'
          : 'bg-gradient-to-b from-stone-900/70 to-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="#topo" className="flex items-center gap-2 text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-500 shadow-md">
            <Heart className="h-5 w-5 fill-white text-white" />
          </span>
          <span className="text-lg font-bold tracking-tight">
            {content.brand.name}
          </span>
        </a>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-white/85 transition-colors hover:text-white"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#doar"
            className="inline-flex items-center gap-1.5 rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition-transform hover:scale-105 hover:bg-rose-600"
          >
            <Heart className="h-4 w-4 fill-white" />
            {content.hero.primaryCta}
          </a>
        </nav>

        <button
          onClick={() => setOpen((v) => !v)}
          className="text-white md:hidden"
          aria-label="Abrir menu"
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-stone-900/95 px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/10"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#doar"
              onClick={() => setOpen(false)}
              className="mt-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white"
            >
              <Heart className="h-4 w-4 fill-white" />
              {content.hero.primaryCta}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
