import { Play, Heart, ShieldCheck, Users } from 'lucide-react';
import type { SiteContent } from '@/types/content';
import { formatBRL } from '@/lib/format';

interface HeroSectionProps {
  content: SiteContent;
  onOpenDonation: () => void;
  onPlayVideo: () => void;
}

export function HeroSection({ content, onOpenDonation, onPlayVideo }: HeroSectionProps) {
  const { hero, progress, brand } = content;

  return (
    <section
      id="topo"
      className="relative overflow-hidden bg-stone-900 pt-24 text-white"
    >
      <div className="absolute inset-0">
        <img
          src={hero.videoPoster}
          alt={hero.title}
          className="h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/70 to-stone-900/40" />
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-20">
        <div className="flex flex-col justify-center">
          <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-rose-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose-200">
            <Heart className="h-3.5 w-3.5 fill-rose-300" />
            {brand.tagline}
          </span>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            {hero.title}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
            {hero.intro}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              onClick={onOpenDonation}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-500 px-6 py-3 text-base font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:bg-rose-600"
            >
              <Heart className="h-5 w-5 fill-white" />
              {hero.primaryCta}
            </button>
            <span className="flex items-center gap-1.5 text-sm text-white/70">
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
              {hero.trustNote}
            </span>
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-emerald-300">
                {progress.eyebrow}
              </span>
              <span className="font-bold">{progress.percentLabel}</span>
            </div>
            <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-700"
                style={{ width: `${Math.min(100, Math.max(0, progress.percent))}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-white/75">{progress.subtext}</p>
            <p className="mt-1 text-sm font-semibold text-white">
              {progress.highlight}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Stat
                label={`${formatBRL(progress.raised)} ${progress.raisedLabel} ${formatBRL(progress.goal)}`}
              />
              <Stat
                icon={<Users className="h-4 w-4" />}
                label={`${progress.donors.toLocaleString('pt-BR')} ${progress.donorsLabel}`}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <button
            onClick={onPlayVideo}
            className="group relative aspect-video w-full overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/20"
            aria-label="Reproduzir vídeo da campanha"
          >
            <img
              src={hero.videoPoster}
              alt={hero.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/40">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-xl transition-transform group-hover:scale-110">
                <Play className="h-7 w-7 fill-stone-900 text-stone-900" />
              </span>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, icon }: { label: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white/10 px-3 py-2 text-xs font-medium text-white/90">
      <span className="flex items-center gap-1.5">
        {icon}
        {label}
      </span>
    </div>
  );
}
