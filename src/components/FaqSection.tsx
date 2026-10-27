import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { SiteContent } from '@/types/content';
import { CtaButton } from './CtaButton';

interface FaqSectionProps {
  content: SiteContent;
  onOpenDonation: () => void;
}

export function FaqSection({ content, onOpenDonation }: FaqSectionProps) {
  const { faq } = content;
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
            {faq.eyebrow}
          </span>
          <h2 className="mt-2 text-2xl font-bold leading-tight text-stone-900 sm:text-3xl">
            {faq.title}
          </h2>
        </div>

        <div className="mt-8 divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white">
          {faq.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={i}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-semibold text-stone-900 sm:text-base">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-stone-500 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ${
                    isOpen
                      ? 'grid-rows-[1fr] opacity-100'
                      : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-4 text-sm leading-relaxed text-stone-600">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-center">
          <CtaButton onClick={onOpenDonation} label={content.hero.primaryCta} />
        </div>
      </div>
    </section>
  );
}
