import type { AppStoreItem, AppReview, AppCategory } from '@/lib/api/app-store.service';

const apps: AppStoreItem[] = [
  {
    id: 'app-whatsapp-notifier',
    name: 'WhatsApp Notifier Pro',
    description: 'Notificacoes automaticas via WhatsApp para alunos e responsaveis.',
    longDescription: 'Envie notificacoes automaticas para alunos e responsaveis via WhatsApp. Suporte a mensagens de boas-vindas, lembretes de aula, confirmacao de presenca, cobranças e mais. Integra com a Evolution API para envio confiavel e em escala.',
    author: 'BlackBelt Team',
    category: 'communication',
    price: 0,
    currency: 'BRL',
    rating: 4.8,
    reviewCount: 142,
    downloads: 2340,
    screenshots: ['/screenshots/whatsapp-1.png', '/screenshots/whatsapp-2.png', '/screenshots/whatsapp-3.png'],
    version: '2.1.0',
    compatibility: 'BlackBelt v2.0+',
    features: ['Mensagens automaticas', 'Templates personalizaveis', 'Relatorios de entrega', 'Suporte a midia'],
    featured: true,
  },
  {
    id: 'app-google-analytics',
    name: 'Google Analytics 4',
    description: 'Rastreamento completo de uso da plataforma com GA4.',
    longDescription: 'Integre o Google Analytics 4 com sua academia BlackBelt. Rastreie pageviews, eventos customizados, fluxo de usuarios, taxas de conversao e mais. Dashboard completo no painel do GA4.',
    author: 'BlackBelt Team',
    category: 'analytics',
    price: 0,
    currency: 'BRL',
    rating: 4.5,
    reviewCount: 89,
    downloads: 1890,
    screenshots: ['/screenshots/ga4-1.png', '/screenshots/ga4-2.png'],
    version: '1.3.0',
    compatibility: 'BlackBelt v2.0+',
    features: ['Rastreamento de pageviews', 'Eventos customizados', 'Anonimizacao de IP', 'E-commerce tracking'],
    featured: true,
  },
  {
    id: 'app-zapier',
    name: 'Zapier Integration',
    description: 'Conecte o BlackBelt a mais de 5.000 apps.',
    longDescription: 'Use triggers e actions do Zapier para conectar o BlackBelt com milhares de outros aplicativos. Automatize fluxos de trabalho como envio de dados para planilhas, CRMs, email marketing e mais.',
    author: 'BlackBelt Team',
    category: 'automation',
    price: 49.90,
    currency: 'BRL',
    rating: 4.3,
    reviewCount: 56,
    downloads: 890,
    screenshots: ['/screenshots/zapier-1.png', '/screenshots/zapier-2.png'],
    version: '1.0.2',
    compatibility: 'BlackBelt v2.0+',
    features: ['500+ triggers', 'Actions bidirecionais', 'Filtros avancados', 'Multi-step Zaps'],
    featured: true,
  },
  {
    id: 'app-custom-reports',
    name: 'Custom Reports Builder',
    description: 'Crie relatorios personalizados com drag-and-drop.',
    longDescription: 'Gerador de relatorios visual com drag-and-drop. Crie relatorios personalizados combinando dados de alunos, turmas, financeiro e presenca. Exporte em PDF, CSV ou XLSX. Agende envios automaticos.',
    author: 'BlackBelt Team',
    category: 'analytics',
    price: 29.90,
    currency: 'BRL',
    rating: 4.6,
    reviewCount: 73,
    downloads: 1230,
    screenshots: ['/screenshots/reports-1.png', '/screenshots/reports-2.png', '/screenshots/reports-3.png'],
    version: '1.5.0',
    compatibility: 'BlackBelt v2.0+',
    features: ['Drag-and-drop builder', 'Exportacao multi-formato', 'Agendamento', 'Templates prontos'],
    featured: false,
  },
  {
    id: 'app-stripe-gateway',
    name: 'Stripe Payment Gateway',
    description: 'Aceite pagamentos internacionais com Stripe.',
    longDescription: 'Gateway de pagamento internacional com Stripe. Aceite cartoes de credito e debito de todo o mundo. Suporte a assinaturas recorrentes, faturas e reembolsos automaticos.',
    author: 'BlackBelt Team',
    category: 'payment',
    price: 0,
    currency: 'BRL',
    rating: 4.9,
    reviewCount: 201,
    downloads: 3100,
    screenshots: ['/screenshots/stripe-1.png', '/screenshots/stripe-2.png'],
    version: '3.0.1',
    compatibility: 'BlackBelt v2.0+',
    features: ['Cartoes internacionais', 'Assinaturas recorrentes', 'Reembolsos automaticos', 'Dashboard financeiro'],
    featured: true,
  },
  {
    id: 'app-email-marketing',
    name: 'Email Marketing Suite',
    description: 'Campanhas de email marketing para engajar alunos.',
    longDescription: 'Crie e envie campanhas de email marketing diretamente do BlackBelt. Segmente por faixa, turma, status de pagamento e mais. Templates responsivos e analytics de abertura/clique.',
    author: 'MarketFit Labs',
    category: 'communication',
    price: 39.90,
    currency: 'BRL',
    rating: 4.2,
    reviewCount: 34,
    downloads: 560,
    screenshots: ['/screenshots/email-1.png', '/screenshots/email-2.png'],
    version: '1.1.0',
    compatibility: 'BlackBelt v2.0+',
    features: ['Templates responsivos', 'Segmentacao avancada', 'Analytics de abertura', 'Automacao de fluxos'],
    featured: false,
  },
  {
    id: 'app-pix-gateway',
    name: 'PIX Automatico',
    description: 'Cobranca automatica via PIX com QR Code dinamico.',
    longDescription: 'Gere cobrancas PIX automaticas com QR Code dinamico. Reconciliacao automatica de pagamentos, notificacoes de recebimento e relatorios financeiros detalhados.',
    author: 'BlackBelt Team',
    category: 'payment',
    price: 0,
    currency: 'BRL',
    rating: 4.7,
    reviewCount: 167,
    downloads: 2780,
    screenshots: ['/screenshots/pix-1.png', '/screenshots/pix-2.png'],
    version: '2.0.0',
    compatibility: 'BlackBelt v2.0+',
    features: ['QR Code dinamico', 'Reconciliacao automatica', 'Notificacoes em tempo real', 'Split de pagamentos'],
    featured: false,
  },
  {
    id: 'app-attendance-ai',
    name: 'Attendance AI',
    description: 'Check-in automatico com reconhecimento facial.',
    longDescription: 'Sistema de check-in automatico por reconhecimento facial. Basta o aluno olhar para a camera e a presenca e registrada. Rapido, seguro e sem contato fisico.',
    author: 'DeepTech AI',
    category: 'automation',
    price: 99.90,
    currency: 'BRL',
    rating: 4.4,
    reviewCount: 28,
    downloads: 340,
    screenshots: ['/screenshots/attendance-ai-1.png', '/screenshots/attendance-ai-2.png'],
    version: '1.0.0',
    compatibility: 'BlackBelt v2.0+',
    features: ['Reconhecimento facial', 'Check-in sem contato', 'Anti-fraude', 'Relatorios de presenca'],
    featured: false,
  },
  {
    id: 'app-crm-integration',
    name: 'CRM Connector',
    description: 'Sincronize leads e alunos com seu CRM favorito.',
    longDescription: 'Integre o BlackBelt com Salesforce, HubSpot, Pipedrive e outros CRMs. Sincronize leads da aula experimental, dados de alunos e historico de interacoes automaticamente.',
    author: 'SyncWorks',
    category: 'integration',
    price: 59.90,
    currency: 'BRL',
    rating: 4.1,
    reviewCount: 19,
    downloads: 210,
    screenshots: ['/screenshots/crm-1.png', '/screenshots/crm-2.png'],
    version: '1.2.0',
    compatibility: 'BlackBelt v2.0+',
    features: ['Sincronizacao bidirecional', 'Mapeamento de campos', 'Webhooks em tempo real', 'Logs de sincronizacao'],
    featured: false,
  },
  {
    id: 'app-training-tracker',
    name: 'Training Tracker Pro',
    description: 'Acompanhamento detalhado de evolucao tecnica dos alunos.',
    longDescription: 'Acompanhe a evolucao tecnica de cada aluno com metricas detalhadas. Graficos de progresso, comparacoes entre periodos, metas individuais e relatorios para pais.',
    author: 'FightMetrics',
    category: 'analytics',
    price: 19.90,
    currency: 'BRL',
    rating: 4.5,
    reviewCount: 45,
    downloads: 670,
    screenshots: ['/screenshots/tracker-1.png', '/screenshots/tracker-2.png', '/screenshots/tracker-3.png'],
    version: '2.0.1',
    compatibility: 'BlackBelt v2.0+',
    features: ['Metricas de evolucao', 'Graficos de progresso', 'Metas individuais', 'Relatorios para pais'],
    featured: false,
  },
  {
    id: 'app-social-wall',
    name: 'Social Wall',
    description: 'Mural social da academia com feed de atividades.',
    longDescription: 'Crie um mural social interativo para sua academia. Alunos podem compartilhar conquistas, fotos de treino e interagir entre si. Incentive o engajamento e a comunidade.',
    author: 'BlackBelt Team',
    category: 'communication',
    price: 0,
    currency: 'BRL',
    rating: 4.3,
    reviewCount: 62,
    downloads: 980,
    screenshots: ['/screenshots/social-1.png', '/screenshots/social-2.png'],
    version: '1.4.0',
    compatibility: 'BlackBelt v2.0+',
    features: ['Feed de atividades', 'Compartilhamento de conquistas', 'Galeria de fotos', 'Moderacao de conteudo'],
    featured: false,
  },
  {
    id: 'app-competition-manager',
    name: 'Competition Manager',
    description: 'Gestao completa de campeonatos e competicoes.',
    longDescription: 'Gerencie campeonatos internos e externos. Crie chaves de eliminacao, controle inscricoes, acompanhe resultados em tempo real e gere rankings automaticamente.',
    author: 'FightMetrics',
    category: 'automation',
    price: 79.90,
    currency: 'BRL',
    rating: 4.6,
    reviewCount: 38,
    downloads: 450,
    screenshots: ['/screenshots/competition-1.png', '/screenshots/competition-2.png'],
    version: '1.3.0',
    compatibility: 'BlackBelt v2.0+',
    features: ['Chaves de eliminacao', 'Inscricoes online', 'Resultados em tempo real', 'Rankings automaticos'],
    featured: false,
  },
];

const reviews: AppReview[] = [
  { id: 'rev-1', appId: 'app-whatsapp-notifier', authorName: 'Mestre Carlos', rating: 5, comment: 'Excelente! Reduziu drasticamente as faltas dos alunos.', createdAt: '2025-11-15T10:00:00Z' },
  { id: 'rev-2', appId: 'app-whatsapp-notifier', authorName: 'Prof. Ana', rating: 5, comment: 'Facil de configurar e funciona perfeitamente.', createdAt: '2025-11-10T08:00:00Z' },
  { id: 'rev-3', appId: 'app-whatsapp-notifier', authorName: 'Academia Samurai', rating: 4, comment: 'Muito bom, so falta suporte a audio.', createdAt: '2025-11-05T14:00:00Z' },
  { id: 'rev-4', appId: 'app-stripe-gateway', authorName: 'BJJ Academy US', rating: 5, comment: 'Perfect for international students!', createdAt: '2025-10-20T12:00:00Z' },
  { id: 'rev-5', appId: 'app-stripe-gateway', authorName: 'Mestre Takeda', rating: 5, comment: 'Integração perfeita, pagamentos recebidos na hora.', createdAt: '2025-10-15T09:00:00Z' },
];

export function mockListApps(params?: { category?: string; search?: string }): AppStoreItem[] {
  let result = [...apps];
  if (params?.category) {
    result = result.filter((a) => a.category === params.category);
  }
  if (params?.search) {
    const q = params.search.toLowerCase();
    result = result.filter(
      (a) => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)
    );
  }
  return result;
}

export function mockGetApp(appId: string): AppStoreItem {
  const app = apps.find((a) => a.id === appId);
  if (!app) throw new Error('App not found');
  return app;
}

export function mockGetAppReviews(appId: string): AppReview[] {
  return reviews.filter((r) => r.appId === appId);
}

export function mockSubmitApp(
  data: Omit<AppStoreItem, 'id' | 'rating' | 'reviewCount' | 'downloads' | 'featured'>
): AppStoreItem {
  return {
    ...data,
    id: `app-${Date.now()}`,
    rating: 0,
    reviewCount: 0,
    downloads: 0,
    featured: false,
  };
}

export function mockGetCategories(): AppCategory[] {
  return [
    { id: 'analytics', name: 'Analytics', count: 3 },
    { id: 'communication', name: 'Comunicacao', count: 3 },
    { id: 'payment', name: 'Pagamento', count: 2 },
    { id: 'automation', name: 'Automacao', count: 3 },
    { id: 'integration', name: 'Integracao', count: 1 },
  ];
}

export function mockGetFeatured(): AppStoreItem[] {
  return apps.filter((a) => a.featured);
}
