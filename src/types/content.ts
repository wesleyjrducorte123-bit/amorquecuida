export interface TierOption {
  value: number;
  label: string;
  popular: boolean;
}

export interface TestimonialItem {
  name: string;
  time: string;
  avatar: string;
  text: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface SectionMeta {
  id: string;
  key: string;
  label: string;
  visible: boolean;
  order: number;
}

export interface SiteContent {
  brand: {
    name: string;
    tagline: string;
  };
  seo: {
    title: string;
    description: string;
    ogImage: string;
  };
  appearance: {
    primaryColor: string;
    accentColor: string;
  };
  sections: SectionMeta[];
  hero: {
    eyebrow: string;
    title: string;
    intro: string;
    videoSrc: string;
    videoPoster: string;
    primaryCta: string;
    trustNote: string;
  };
  progress: {
    eyebrow: string;
    percentLabel: string;
    percent: number;
    raisedLabel: string;
    raised: number;
    goal: number;
    donors: number;
    donorsLabel: string;
    subtext: string;
    highlight: string;
    supportersLabel: string;
  };
  impact: {
    image: string;
    imageAlt: string;
    eyebrow: string;
    title: string;
    text: string;
    ctaIntro: string;
  };
  tiers: {
    eyebrow: string;
    title: string;
    options: TierOption[];
  };
  reality: {
    image: string;
    imageAlt: string;
    eyebrow: string;
    title: string;
    text: string;
    highlight: string;
  };
  hope: {
    image: string;
    imageAlt: string;
    eyebrow: string;
    title: string;
    text: string;
    highlight: string;
  };
  testimonials: {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: TestimonialItem[];
  };
  faq: {
    eyebrow: string;
    title: string;
    items: FaqItem[];
  };
  footer: {
    about: string;
    contact: { email: string };
    legal: string;
  };
}

export const SECTION_KEYS = [
  'hero',
  'impact',
  'tiers',
  'reality',
  'testimonials',
  'hope',
  'faq',
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

export const SECTION_LABELS: Record<SectionKey, string> = {
  hero: 'Hero / Capa',
  impact: 'Impacto',
  tiers: 'Valores de doação',
  reality: 'Realidade',
  testimonials: 'Depoimentos',
  hope: 'Esperança',
  faq: 'Perguntas frequentes',
};
