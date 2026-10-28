import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { ImpactSection } from '@/components/ImpactSection';
import { DonationTiers } from '@/components/DonationTiers';
import { StorySection } from '@/components/StorySection';
import { Testimonials } from '@/components/Testimonials';
import { FaqSection } from '@/components/FaqSection';
import { Footer } from '@/components/Footer';
import { DonationModal } from '@/components/DonationModal';
import { VideoModal } from '@/components/VideoModal';
import { loadPublishedContent } from '@/lib/content';
import { defaultContent } from '@/config/defaultContent';
import type { SiteContent } from '@/types/content';
import { loadAndInitPixels, trackDonation } from '@/lib/pixels';
import { AlertCircle, Loader2 } from 'lucide-react';

const SECTION_COMPONENTS: Record<
  string,
  (props: { content: SiteContent; onOpenDonation: () => void }) => React.ReactNode
> = {
  hero: ({ content, onOpenDonation }) => (
    <HeroSection content={content} onOpenDonation={onOpenDonation} onPlayVideo={() => {}} />
  ),
  impact: ({ content, onOpenDonation }) => (
    <ImpactSection content={content} onOpenDonation={onOpenDonation} />
  ),
  tiers: ({ content, onOpenDonation }) => (
    <DonationTiers content={content} onSelect={onOpenDonation} />
  ),
  reality: ({ content, onOpenDonation }) => (
    <StorySection id="realidade" data={content.reality} reverse onOpenDonation={onOpenDonation} />
  ),
  testimonials: ({ content }) => <Testimonials content={content} />,
  hope: ({ content, onOpenDonation }) => (
    <StorySection id="esperanca" data={content.hope} onOpenDonation={onOpenDonation} />
  ),
  faq: ({ content, onOpenDonation }) => (
    <FaqSection content={content} onOpenDonation={onOpenDonation} />
  ),
};

export default function PublicSite() {
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [donationOpen, setDonationOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState(0);
  const [videoOpen, setVideoOpen] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const c = await loadPublishedContent();
        if (!active) return;
        setContent(c);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : 'Falha ao carregar conteúdo.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    loadAndInitPixels();
    return () => {
      active = false;
    };
  }, []);

  const openDonation = (amount: number) => {
    setDonationAmount(amount);
    setDonationOpen(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-900 text-white">
        <Loader2 className="h-8 w-8 animate-spin text-rose-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 p-6">
        <div className="max-w-md rounded-2xl border border-rose-200 bg-white p-6 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-rose-500" />
          <p className="mt-3 text-sm text-stone-700">
            Não foi possível carregar o conteúdo do site.
          </p>
          <p className="mt-1 text-xs text-stone-500">{error}</p>
        </div>
      </div>
    );
  }

  const ordered = [...content.sections]
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-white font-sans text-stone-900 antialiased">
      <Header content={content} />
      <main>
        {ordered.map((section) => {
          const render = SECTION_COMPONENTS[section.key];
          if (!render) return null;
          const props = {
            content,
            onOpenDonation: () => openDonation(content.tiers.options[1]?.value ?? 30),
            onPlayVideo: () => setVideoOpen(true),
          };
          // hero needs onPlayVideo
          if (section.key === 'hero') {
            return (
              <HeroSection
                key={section.id}
                content={content}
                onOpenDonation={props.onOpenDonation}
                onPlayVideo={props.onPlayVideo}
              />
            );
          }
          return <span key={section.id}>{render(props)}</span>;
        })}
      </main>
      <Footer content={content} />

      <DonationModal
        open={donationOpen}
        initialAmount={donationAmount}
        tiers={content.tiers.options}
        onClose={() => setDonationOpen(false)}
      />
      <VideoModal
        open={videoOpen}
        src={content.hero.videoSrc}
        poster={content.hero.videoPoster}
        onClose={() => setVideoOpen(false)}
      />
    </div>
  );
}
