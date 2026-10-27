import type { SiteContent } from '@/types/content';

export const defaultContent: SiteContent = {
  brand: {
    name: 'Salve Africa',
    tagline: 'Doe agora',
  },
  seo: {
    title: 'Salve Africa - Doe agora',
    description:
      'Campanha solidária para levar alimento, água e cuidado a famílias em situação de vulnerabilidade. Doe agora.',
    ogImage:
      'https://images.pexels.com/photos/8061687/pexels-photo-8061687.jpeg?auto=compress&cs=tinysrgb&w=1280',
  },
  appearance: {
    primaryColor: '#e11d48',
    accentColor: '#10b981',
  },
  sections: [
    { id: 's1', key: 'hero', label: 'Hero / Capa', visible: true, order: 0 },
    { id: 's2', key: 'impact', label: 'Impacto', visible: true, order: 1 },
    { id: 's3', key: 'tiers', label: 'Valores de doação', visible: true, order: 2 },
    { id: 's4', key: 'reality', label: 'Realidade', visible: true, order: 3 },
    { id: 's5', key: 'testimonials', label: 'Depoimentos', visible: true, order: 4 },
    { id: 's6', key: 'hope', label: 'Esperança', visible: true, order: 5 },
    { id: 's7', key: 'faq', label: 'Perguntas frequentes', visible: true, order: 6 },
  ],
  hero: {
    eyebrow: 'Uma criança pode comer hoje por causa da sua ajuda',
    title: 'Uma criança pode comer hoje por causa da sua ajuda',
    intro:
      'Centenas de famílias enfrentam fome, sede e falta de cuidados básicos. Uma pequena doação pode levar alimento, água e esperança para quem mais precisa.',
    videoSrc: '',
    videoPoster:
      'https://images.pexels.com/photos/8061687/pexels-photo-8061687.jpeg?auto=compress&cs=tinysrgb&w=1280',
    primaryCta: 'Doar agora',
    trustNote: 'Doação segura - Qualquer valor ajuda',
  },
  progress: {
    eyebrow: 'Meta da campanha',
    percentLabel: '58% da meta alcançada',
    percent: 58,
    raisedLabel: 'arrecadados de',
    raised: 37420,
    goal: 50000,
    donors: 1284,
    donorsLabel: 'doadores participaram',
    subtext:
      'Faltam poucas doações para garantirmos alimentos para mais famílias nesta semana.',
    highlight: 'Cada doação aproxima a meta - falta pouco!',
    supportersLabel: 'apoiadores',
  },
  impact: {
    image:
      'https://images.pexels.com/photos/9823014/pexels-photo-9823014.jpeg?auto=compress&cs=tinysrgb&w=1280',
    imageAlt: 'Crianças recebendo cuidado e alimento na comunidade',
    eyebrow: 'O impacto começa aqui',
    title: 'Cada real vira cuidado de verdade na comunidade.',
    text: 'Não importa o tamanho: quando você escolhe ajudar, alguém ganha um dia mais seguro, com comida na mesa e esperança renovada.',
    ctaIntro:
      'A seguir, veja o que sua doação pode proporcionar e escolha o valor que cabe no seu coração hoje.',
  },
  tiers: {
    eyebrow: 'Veja o impacto da sua doação',
    title: 'Cada real conta. Escolha quanto você pode ajudar hoje.',
    options: [
      { value: 10, label: 'Uma criança come hoje.', popular: false },
      { value: 30, label: 'Comida e água limpa para uma família.', popular: true },
      { value: 50, label: 'O essencial por mais dias.', popular: false },
    ],
  },
  reality: {
    image:
      'https://images.pexels.com/photos/11834936/pexels-photo-11834936.jpeg?auto=compress&cs=tinysrgb&w=1280',
    imageAlt: 'Crianças sentadas no chão em uma comunidade',
    eyebrow: 'Uma realidade que precisa mudar',
    title: 'Eles não pedem brinquedos. Pedem comida.',
    text: 'Enquanto muitas pessoas passam o dia sem pensar no próximo prato, existem crianças que acordam sem saber se terão o que comer.',
    highlight: 'A sua ajuda pode transformar esse momento de dor em um sinal de esperança.',
  },
  hope: {
    image:
      'https://images.pexels.com/photos/19339988/pexels-photo-19339988.jpeg?auto=compress&cs=tinysrgb&w=1280',
    imageAlt: 'Criança recebendo acompanhamento de saúde',
    eyebrow: 'Esperança do bem',
    title: 'Sua doação chega onde a fome aperta de verdade.',
    text: 'Com água, alimento e cuidado, cada contribuição ajuda famílias a atravessar dias difíceis com mais dignidade.',
    highlight: 'Não precisa muito. Precisa de você agora.',
  },
  testimonials: {
    eyebrow: 'Prova social',
    title: 'Quem já doou',
    subtitle: 'Depoimentos de pessoas que confiaram e contribuíram com a campanha.',
    items: [
      {
        name: 'Mariana Costa',
        time: '3 h',
        avatar:
          'https://images.pexels.com/photos/35490803/pexels-photo-35490803.jpeg?auto=compress&cs=tinysrgb&w=160',
        text: 'Doei R$ 30 agora. Causa linda, que chegue quem precisa!',
      },
      {
        name: 'Roberto Alves',
        time: '5 h',
        avatar:
          'https://images.pexels.com/photos/35681211/pexels-photo-35681211.jpeg?auto=compress&cs=tinysrgb&w=160',
        text: 'Primeira vez que doo por aqui. Processo rápido e transparente. Recomendo.',
      },
      {
        name: 'Juliana Ferreira',
        time: '1 d',
        avatar:
          'https://images.pexels.com/photos/14950779/pexels-photo-14950779.jpeg?auto=compress&cs=tinysrgb&w=160',
        text: 'R$ 50 feitos. Minha família se sensibilizou com o vídeo. Força aí!',
      },
      {
        name: 'Carlos Mendes',
        time: '1 d',
        avatar:
          'https://images.pexels.com/photos/30269649/pexels-photo-30269649.jpeg?auto=compress&cs=tinysrgb&w=160',
        text: 'Contribuí ontem. Espero que a ajuda chegue logo nas comunidades.',
      },
      {
        name: 'Amanda Ribeiro',
        time: '2 d',
        avatar:
          'https://images.pexels.com/photos/29615996/pexels-photo-29615996.png?auto=compress&cs=tinysrgb&w=160',
        text: 'Doação feita. Pequeno valor mas de coração. Unidos!',
      },
    ],
  },
  faq: {
    eyebrow: 'Dúvidas frequentes',
    title: 'Perguntas e respostas',
    items: [
      {
        q: 'Para onde vai o dinheiro da minha doação?',
        a: 'Os recursos são destinados à compra de alimentos, água e itens de cuidado básico para famílias em situação de vulnerabilidade. O responsável pela campanha deve fornecer um relatório transparente dos recursos aplicados.',
      },
      {
        q: 'Posso doar qualquer valor?',
        a: 'Sim. Você pode escolher um dos valores sugeridos ou digitar um valor personalizado no campo disponível no momento da doação.',
      },
      {
        q: 'O pagamento é seguro?',
        a: 'A doação é processada por um provedor de pagamentos legítimo. A segurança da transação depende do provedor configurado pela campanha. Sempre confirme em uma página oficial e verificada antes de concluir qualquer pagamento.',
      },
      {
        q: 'Como recebo o comprovante da minha doação?',
        a: 'Após concluir a doação pelo provedor de pagamentos oficial, você receberá o comprovante pelos canais do próprio provedor (e-mail ou app do banco).',
      },
      {
        q: 'Posso acompanhar o impacto da minha doação?',
        a: 'O responsável pela campanha deve disponibilizar atualizações e relatórios sobre os recursos arrecadados e as ações realizadas. Entre em contato pelos canais oficiais para mais informações.',
      },
    ],
  },
  footer: {
    about:
      'Campanha solidária para levar alimento, água e cuidado a famílias em situação de vulnerabilidade.',
    contact: { email: 'contato@causaurgenteaf.online' },
    legal:
      'As imagens utilizadas são meramente ilustrativas. Os valores de arrecadação, número de doadores e depoimentos exibidos são exemplos do site de referência e devem ser substituídos por dados reais e verificados antes da publicação oficial. Nenhuma transação de pagamento é processada por esta página até que um provedor de pagamentos legítimo seja configurado.',
  },
};
