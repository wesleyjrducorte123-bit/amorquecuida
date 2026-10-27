import { Quote } from 'lucide-react';
import type { SiteContent } from '@/types/content';

interface TestimonialsProps {
  content: SiteContent;
}

export function Testimonials({ content }: TestimonialsProps) {
  const { testimonials } = content;
  return (
    <section className="bg-stone-50 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
            {testimonials.eyebrow}
          </span>
          <h2 className="mt-2 text-2xl font-bold leading-tight text-stone-900 sm:text-3xl">
            {testimonials.title}
          </h2>
          <p className="mt-3 text-sm text-stone-600">
            {testimonials.subtitle}
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.items.map((t, i) => (
            <figure
              key={i}
              className="flex flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
            >
              <Quote className="h-6 w-6 text-rose-300" />
              <blockquote className="mt-3 text-sm leading-relaxed text-stone-700">
                {t.text}
              </blockquote>
              <figcaption className="mt-4 flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="text-left">
                  <div className="text-sm font-semibold text-stone-900">
                    {t.name}
                  </div>
                  <div className="text-xs text-stone-500">{t.time}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
