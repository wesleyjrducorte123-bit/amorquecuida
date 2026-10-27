import type { SiteContent } from '@/types/content';
import { CtaButton } from './CtaButton';

interface ImpactSectionProps {
  content: SiteContent;
  onOpenDonation: () => void;
}

export function ImpactSection({ content, onOpenDonation }: ImpactSectionProps) {
  const { impact } = content;
  return (
    <section id="impacto" className="bg-white py-16 sm:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
        <div className="order-2 lg:order-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
            {impact.eyebrow}
          </span>
          <h2 className="mt-2 text-2xl font-bold leading-tight text-stone-900 sm:text-3xl">
            {impact.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-stone-600">
            {impact.text}
          </p>
          <p className="mt-4 text-sm font-medium text-stone-800">
            {impact.ctaIntro}
          </p>
          <div className="mt-6">
            <CtaButton onClick={onOpenDonation} label={content.hero.primaryCta} />
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <img
            src={impact.image}
            alt={impact.imageAlt}
            className="w-full rounded-2xl object-cover shadow-xl"
          />
        </div>
      </div>
    </section>
  );
}
