import { Check } from 'lucide-react';
import type { SiteContent } from '@/types/content';
import { formatBRL } from '@/lib/format';

interface DonationTiersProps {
  content: SiteContent;
  onSelect: (value: number) => void;
}

export function DonationTiers({ content, onSelect }: DonationTiersProps) {
  const { tiers } = content;
  return (
    <section id="doar" className="bg-stone-50 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
            {tiers.eyebrow}
          </span>
          <h2 className="mt-2 text-2xl font-bold leading-tight text-stone-900 sm:text-3xl">
            {tiers.title}
          </h2>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {tiers.options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSelect(opt.value)}
              className={`group relative flex flex-col items-center rounded-2xl border-2 bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl ${
                opt.popular
                  ? 'border-rose-500 ring-2 ring-rose-200'
                  : 'border-stone-200 hover:border-rose-300'
              }`}
            >
              {opt.popular && (
                <span className="absolute -top-3 rounded-full bg-rose-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow">
                  Mais popular
                </span>
              )}
              <span className="text-3xl font-extrabold text-stone-900">
                {formatBRL(opt.value)}
              </span>
              <span className="mt-2 flex items-center gap-1.5 text-sm text-stone-600">
                <Check className="h-4 w-4 text-emerald-500" />
                {opt.label}
              </span>
              <span
                className={`mt-4 inline-flex w-full items-center justify-center rounded-full py-2 text-sm font-semibold transition-colors ${
                  opt.popular
                    ? 'bg-rose-500 text-white group-hover:bg-rose-600'
                    : 'bg-stone-100 text-stone-800 group-hover:bg-rose-500 group-hover:text-white'
                }`}
              >
                Doar {formatBRL(opt.value)}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => onSelect(0)}
            className="text-sm font-semibold text-rose-600 underline-offset-4 hover:underline"
          >
            Quero digitar outro valor
          </button>
        </div>
      </div>
    </section>
  );
}
