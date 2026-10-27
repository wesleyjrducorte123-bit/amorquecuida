import { useState } from 'react';
import { Monitor, Smartphone } from 'lucide-react';
import { PageHeader } from '@/admin/ui';
import { PublishBar } from '@/admin/PublishBar';
import { useAdminContent } from '@/admin/AdminContent';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { ImpactSection } from '@/components/ImpactSection';
import { DonationTiers } from '@/components/DonationTiers';
import { StorySection } from '@/components/StorySection';
import { Testimonials } from '@/components/Testimonials';
import { FaqSection } from '@/components/FaqSection';
import { Footer } from '@/components/Footer';
import type { SiteContent } from '@/types/content';

export function PreviewPage() {
  const { draft } = useAdminContent();
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  const content: SiteContent = draft;
  const ordered = [...content.sections].filter((s) => s.visible).sort((a, b) => a.order - b.order);
  const openDonation = () => {};

  return (
    <div>
      <PublishBar />
      <PageHeader title="Pré-visualização" subtitle="Veja como o site ficará com as alterações atuais do rascunho (não publicadas)." />

      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => setDevice('desktop')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ${device === 'desktop' ? 'bg-stone-900 text-white' : 'border border-stone-300 text-stone-600 hover:bg-stone-100'}`}
        >
          <Monitor className="h-4 w-4" />
          Desktop
        </button>
        <button
          onClick={() => setDevice('mobile')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ${device === 'mobile' ? 'bg-stone-900 text-white' : 'border border-stone-300 text-stone-600 hover:bg-stone-100'}`}
        >
          <Smartphone className="h-4 w-4" />
          Celular
        </button>
      </div>

      <div className={`mx-auto overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm ${device === 'mobile' ? 'max-w-sm' : 'max-w-5xl'}`}>
        <div className="min-h-[400px] font-sans text-stone-900 antialiased">
          <Header content={content} />
          <main>
            {ordered.map((section) => {
              switch (section.key) {
                case 'hero':
                  return <HeroSection key={section.id} content={content} onOpenDonation={openDonation} onPlayVideo={() => {}} />;
                case 'impact':
                  return <ImpactSection key={section.id} content={content} onOpenDonation={openDonation} />;
                case 'tiers':
                  return <DonationTiers key={section.id} content={content} onSelect={() => {}} />;
                case 'reality':
                  return <StorySection key={section.id} id="realidade" data={content.reality} reverse onOpenDonation={openDonation} ctaLabel={content.hero.primaryCta} />;
                case 'testimonials':
                  return <Testimonials key={section.id} content={content} />;
                case 'hope':
                  return <StorySection key={section.id} id="esperanca" data={content.hope} onOpenDonation={openDonation} ctaLabel={content.hero.primaryCta} />;
                case 'faq':
                  return <FaqSection key={section.id} content={content} onOpenDonation={openDonation} />;
                default:
                  return null;
              }
            })}
          </main>
          <Footer content={content} />
        </div>
      </div>
    </div>
  );
}
