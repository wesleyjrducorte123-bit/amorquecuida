import { ArrowUp, ArrowDown, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { PageHeader, Card, Field } from '@/admin/ui';
import { MediaField } from '@/admin/MediaField';
import { PublishBar } from '@/admin/PublishBar';
import { useAdminContent } from '@/admin/AdminContent';
import type { SiteContent, SectionMeta } from '@/types/content';
import { SECTION_LABELS } from '@/types/content';

export function SectionEditor() {
  const { draft, update, loading } = useAdminContent();

  if (loading) return <div><PageHeader title="Editor do site" /><p className="text-sm text-stone-500">Carregando...</p></div>;

  function moveSection(idx: number, dir: -1 | 1) {
    const sections = [...draft.sections].sort((a, b) => a.order - b.order);
    const target = idx + dir;
    if (target < 0 || target >= sections.length) return;
    const a = sections[idx];
    const b = sections[target];
    const aOrder = a.order;
    a.order = b.order;
    b.order = aOrder;
    update({ sections });
  }

  function toggleVisible(id: string) {
    update({
      sections: draft.sections.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s)),
    });
  }

  function removeSection(id: string) {
    if (!confirm('Excluir esta seção do site? O conteúdo será removido após publicar.')) return;
    update({ sections: draft.sections.filter((s) => s.id !== id) });
  }

  function setField<K extends keyof SiteContent>(key: K, value: SiteContent[K]) {
    update({ [key]: value } as Partial<SiteContent>);
  }

  const ordered = [...draft.sections].sort((a, b) => a.order - b.order);

  return (
    <div>
      <PublishBar />
      <PageHeader
        title="Editor do site"
        subtitle="Edite textos, imagens e botões de cada seção. Reordene, oculte ou exclua seções."
      />

      <div className="space-y-6">
        {ordered.map((section, idx) => (
          <SectionCard
            key={section.id}
            section={section}
            index={idx}
            total={ordered.length}
            content={draft}
            onMove={(dir) => moveSection(idx, dir)}
            onToggle={() => toggleVisible(section.id)}
            onRemove={() => removeSection(section.id)}
            onField={setField}
          />
        ))}
      </div>
    </div>
  );
}

interface SectionCardProps {
  section: SectionMeta;
  index: number;
  total: number;
  content: SiteContent;
  onMove: (dir: -1 | 1) => void;
  onToggle: () => void;
  onRemove: () => void;
  onField: <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => void;
}

function SectionCard({ section, index, total, content, onMove, onToggle, onRemove, onField }: SectionCardProps) {
  const label = SECTION_LABELS[section.key as keyof typeof SECTION_LABELS] ?? section.label;

  return (
    <Card className={!section.visible ? 'opacity-60' : ''}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="rounded-md bg-stone-100 px-2 py-0.5 text-xs font-bold text-stone-500">
            {index + 1}
          </span>
          <h3 className="text-base font-bold text-stone-900">{label}</h3>
          {!section.visible && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
              Oculto
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onMove(-1)}
            disabled={index === 0}
            className="rounded-md p-1.5 text-stone-500 hover:bg-stone-100 disabled:opacity-30"
            aria-label="Mover para cima"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
          <button
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            className="rounded-md p-1.5 text-stone-500 hover:bg-stone-100 disabled:opacity-30"
            aria-label="Mover para baixo"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
          <button
            onClick={onToggle}
            className="rounded-md p-1.5 text-stone-500 hover:bg-stone-100"
            aria-label={section.visible ? 'Ocultar' : 'Mostrar'}
          >
            {section.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
          <button
            onClick={onRemove}
            className="rounded-md p-1.5 text-rose-500 hover:bg-rose-50"
            aria-label="Excluir seção"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <SectionFields sectionKey={section.key} content={content} onField={onField} />
    </Card>
  );
}

function SectionFields({
  sectionKey,
  content,
  onField,
}: {
  sectionKey: string;
  content: SiteContent;
  onField: <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => void;
}) {
  switch (sectionKey) {
    case 'hero':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Título" value={content.hero.title} onChange={(v) => onField('hero', { ...content.hero, title: v })} />
          <Field label="Eyebrow (etiqueta)" value={content.hero.eyebrow} onChange={(v) => onField('hero', { ...content.hero, eyebrow: v })} />
          <div className="sm:col-span-2">
            <Field label="Introdução" textarea value={content.hero.intro} onChange={(v) => onField('hero', { ...content.hero, intro: v })} />
          </div>
          <Field label="Texto do botão" value={content.hero.primaryCta} onChange={(v) => onField('hero', { ...content.hero, primaryCta: v })} />
          <Field label="Nota de confiança" value={content.hero.trustNote} onChange={(v) => onField('hero', { ...content.hero, trustNote: v })} />
          <MediaField label="Vídeo da campanha (URL ou upload)" value={content.hero.videoSrc} onChange={(v) => onField('hero', { ...content.hero, videoSrc: v })} accept="video/*" maxSizeMB={50} isVideo />
          <MediaField label="Imagem de capa / thumbnail" value={content.hero.videoPoster} onChange={(v) => onField('hero', { ...content.hero, videoPoster: v })} />
        </div>
      );
    case 'impact':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Eyebrow" value={content.impact.eyebrow} onChange={(v) => onField('impact', { ...content.impact, eyebrow: v })} />
          <Field label="Título" value={content.impact.title} onChange={(v) => onField('impact', { ...content.impact, title: v })} />
          <div className="sm:col-span-2">
            <Field label="Texto" textarea value={content.impact.text} onChange={(v) => onField('impact', { ...content.impact, text: v })} />
          </div>
          <div className="sm:col-span-2">
            <Field label="Texto de introdução ao CTA" textarea value={content.impact.ctaIntro} onChange={(v) => onField('impact', { ...content.impact, ctaIntro: v })} />
          </div>
          <div className="sm:col-span-2">
            <MediaField label="Imagem" value={content.impact.image} onChange={(v) => onField('impact', { ...content.impact, image: v })} />
          </div>
          <Field label="Texto alternativo da imagem" value={content.impact.imageAlt} onChange={(v) => onField('impact', { ...content.impact, imageAlt: v })} />
        </div>
      );
    case 'tiers':
      return (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Eyebrow" value={content.tiers.eyebrow} onChange={(v) => onField('tiers', { ...content.tiers, eyebrow: v })} />
            <Field label="Título" value={content.tiers.title} onChange={(v) => onField('tiers', { ...content.tiers, title: v })} />
          </div>
          <p className="text-xs font-medium text-stone-500">Valores sugeridos</p>
          <div className="space-y-2">
            {content.tiers.options.map((opt, i) => (
              <div key={i} className="flex flex-wrap items-end gap-2 rounded-lg bg-stone-50 p-3">
                <label className="block">
                  <span className="mb-1 block text-xs text-stone-500">Valor (R$)</span>
                  <input
                    type="number"
                    value={opt.value}
                    onChange={(e) => {
                      const options = [...content.tiers.options];
                      options[i] = { ...opt, value: Number(e.target.value) };
                      onField('tiers', { ...content.tiers, options });
                    }}
                    className="w-24 rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
                  />
                </label>
                <label className="block flex-1">
                  <span className="mb-1 block text-xs text-stone-500">Descrição</span>
                  <input
                    type="text"
                    value={opt.label}
                    onChange={(e) => {
                      const options = [...content.tiers.options];
                      options[i] = { ...opt, label: e.target.value };
                      onField('tiers', { ...content.tiers, options });
                    }}
                    className="w-full rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
                  />
                </label>
                <label className="flex items-center gap-1.5 text-sm text-stone-600">
                  <input
                    type="checkbox"
                    checked={opt.popular}
                    onChange={(e) => {
                      const options = content.tiers.options.map((o, j) => ({ ...o, popular: j === i ? e.target.checked : false }));
                      onField('tiers', { ...content.tiers, options });
                    }}
                  />
                  Mais popular
                </label>
                <button
                  onClick={() => onField('tiers', { ...content.tiers, options: content.tiers.options.filter((_, j) => j !== i) })}
                  className="rounded-md p-1.5 text-rose-500 hover:bg-rose-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => onField('tiers', { ...content.tiers, options: [...content.tiers.options, { value: 100, label: 'Nova opção', popular: false }] })}
            className="flex items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-100"
          >
            <Plus className="h-4 w-4" />
            Adicionar valor
          </button>
        </div>
      );
    case 'reality':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Eyebrow" value={content.reality.eyebrow} onChange={(v) => onField('reality', { ...content.reality, eyebrow: v })} />
          <Field label="Título" value={content.reality.title} onChange={(v) => onField('reality', { ...content.reality, title: v })} />
          <div className="sm:col-span-2">
            <Field label="Texto" textarea value={content.reality.text} onChange={(v) => onField('reality', { ...content.reality, text: v })} />
          </div>
          <Field label="Destaque" value={content.reality.highlight} onChange={(v) => onField('reality', { ...content.reality, highlight: v })} />
          <div className="sm:col-span-2">
            <MediaField label="Imagem" value={content.reality.image} onChange={(v) => onField('reality', { ...content.reality, image: v })} />
          </div>
          <Field label="Texto alternativo" value={content.reality.imageAlt} onChange={(v) => onField('reality', { ...content.reality, imageAlt: v })} />
        </div>
      );
    case 'hope':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Eyebrow" value={content.hope.eyebrow} onChange={(v) => onField('hope', { ...content.hope, eyebrow: v })} />
          <Field label="Título" value={content.hope.title} onChange={(v) => onField('hope', { ...content.hope, title: v })} />
          <div className="sm:col-span-2">
            <Field label="Texto" textarea value={content.hope.text} onChange={(v) => onField('hope', { ...content.hope, text: v })} />
          </div>
          <Field label="Destaque" value={content.hope.highlight} onChange={(v) => onField('hope', { ...content.hope, highlight: v })} />
          <div className="sm:col-span-2">
            <MediaField label="Imagem" value={content.hope.image} onChange={(v) => onField('hope', { ...content.hope, image: v })} />
          </div>
          <Field label="Texto alternativo" value={content.hope.imageAlt} onChange={(v) => onField('hope', { ...content.hope, imageAlt: v })} />
        </div>
      );
    case 'testimonials':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Eyebrow" value={content.testimonials.eyebrow} onChange={(v) => onField('testimonials', { ...content.testimonials, eyebrow: v })} />
          <Field label="Título" value={content.testimonials.title} onChange={(v) => onField('testimonials', { ...content.testimonials, title: v })} />
          <div className="sm:col-span-2">
            <Field label="Subtítulo" value={content.testimonials.subtitle} onChange={(v) => onField('testimonials', { ...content.testimonials, subtitle: v })} />
          </div>
          <p className="sm:col-span-2 text-xs text-stone-500">
            Edite os depoimentos individuais na página "Depoimentos".
          </p>
        </div>
      );
    case 'faq':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Eyebrow" value={content.faq.eyebrow} onChange={(v) => onField('faq', { ...content.faq, eyebrow: v })} />
          <Field label="Título" value={content.faq.title} onChange={(v) => onField('faq', { ...content.faq, title: v })} />
          <p className="sm:col-span-2 text-xs text-stone-500">
            Edite as perguntas individuais na página "Perguntas frequentes".
          </p>
        </div>
      );
    default:
      return <p className="text-sm text-stone-400">Esta seção não tem campos editáveis diretos.</p>;
  }
}
