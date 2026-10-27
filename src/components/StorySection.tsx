import { CtaButton } from './CtaButton';
import type { SiteContent } from '@/types/content';

interface StorySectionProps {
  data: SiteContent['reality'];
  id?: string;
  reverse?: boolean;
  onOpenDonation: () => void;
  ctaLabel?: string;
}

export function StorySection({
  data,
  id,
  reverse = false,
  onOpenDonation,
  ctaLabel = 'Doar agora',
}: StorySectionProps) {
  return (
    <section id={id} className="bg-white py-16 sm:py-20">
      <div
        className={`mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 ${
          reverse ? 'lg:[&>*:first-child]:order-2' : ''
        }`}
      >
        <div>
          <img
            src={data.image}
            alt={data.imageAlt}
            className="w-full rounded-2xl object-cover shadow-xl"
          />
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
            {data.eyebrow}
          </span>
          <h2 className="mt-2 text-2xl font-bold leading-tight text-stone-900 sm:text-3xl">
            {data.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-stone-600">
            {data.text}
          </p>
          {data.highlight && (
            <p className="mt-3 text-sm font-semibold text-stone-800">
              {data.highlight}
            </p>
          )}
          <div className="mt-6">
            <CtaButton onClick={onOpenDonation} label={ctaLabel} />
          </div>
        </div>
      </div>
    </section>
  );
}
