import type {
  FaixaBase,
  Modulo,
  PacoteSugerido,
  AssinaturaSaaS,
  UsoDescoberta,
  Cobranca,
  ModuloExtra,
  SimulacaoUpgrade,
} from '@/lib/api/pricing.service';

const delay = () => new Promise((r) => setTimeout(r, 300 + Math.random() * 200));

// ─── 5 Faixas (R$ 97–597/mes) ────────────────────────────────

const FAIXAS: FaixaBase[] = [
  {
    id: 'tier-starter',
    nome: 'Starter',
    slug: 'starter',
    minAlunos: 1,
    maxAlunos: 50,
    precoMensal: 97,
    precoAnual: 77.60,
    professoresInclusos: 2,
    turmasInclusas: 10,
    unidadesInclusas: 1,
  },
  {
    id: 'tier-essencial',
    nome: 'Essencial',
    slug: 'essencial',
    minAlunos: 51,
    maxAlunos: 100,
    precoMensal: 197,
    precoAnual: 157.60,
    professoresInclusos: 5,
    turmasInclusas: 20,
    unidadesInclusas: 1,
  },
  {
    id: 'tier-pro',
    nome: 'Pro',
    slug: 'pro',
    minAlunos: 101,
    maxAlunos: 200,
    precoMensal: 347,
    precoAnual: 277.60,
    professoresInclusos: 999,
    turmasInclusas: 9999,
    unidadesInclusas: 2,
  },
  {
    id: 'tier-blackbelt',
    nome: 'Black Belt',
    slug: 'blackbelt',
    minAlunos: 201,
    maxAlunos: 9999,
    precoMensal: 597,
    precoAnual: 477.60,
    professoresInclusos: 999,
    turmasInclusas: 9999,
    unidadesInclusas: 999,
  },
  {
    id: 'tier-enterprise',
    nome: 'Enterprise',
    slug: 'enterprise',
    minAlunos: 9999,
    maxAlunos: 99999,
    precoMensal: 0,
    precoAnual: 0,
    professoresInclusos: 999,
    turmasInclusas: 9999,
    unidadesInclusas: 999,
  },
];

// ─── 16 Modulos ───────────────────────────────────────────────

const MODULOS: Modulo[] = [
  {
    id: 'mod-financeiro',
    slug: 'financeiro',
    nome: 'Financeiro',
    descricao: 'Mensalidades, cobranças, inadimplência, relatórios financeiros',
    icone: '💰',
    precoMensal: 49,
    precoAnual: 39.20,
    features: ['Mensalidades automáticas', 'Cobranças recorrentes', 'Controle de inadimplência', 'Relatórios financeiros', 'Integração gateway'],
    categoria: 'operacao',
    dependeDe: [],
    destaque: true,
    ordem: 1,
  },
  {
    id: 'mod-qr_checkin',
    slug: 'qr_checkin',
    nome: 'Check-in QR',
    descricao: 'Presença por QR code, lista de presença digital, relatórios',
    icone: '📱',
    precoMensal: 29,
    precoAnual: 23.20,
    features: ['QR code por aluno', 'Lista de presença digital', 'Relatório de frequência', 'Check-in por turma', 'Histórico completo'],
    categoria: 'operacao',
    dependeDe: [],
    destaque: false,
    ordem: 2,
  },
  {
    id: 'mod-pedagogico',
    slug: 'pedagogico',
    nome: 'Pedagógico',
    descricao: 'Planos de aula, avaliações, currículo, progressão de faixa',
    icone: '📚',
    precoMensal: 39,
    precoAnual: 31.20,
    features: ['Planos de aula', 'Avaliações de faixa', 'Currículo por modalidade', 'Progressão automática', 'Diário de classe'],
    categoria: 'ensino',
    dependeDe: [],
    destaque: true,
    ordem: 3,
  },
  {
    id: 'mod-streaming',
    slug: 'streaming',
    nome: 'Streaming de Aulas',
    descricao: 'Transmissão ao vivo, gravação, biblioteca de vídeos',
    icone: '🎥',
    precoMensal: 59,
    precoAnual: 47.20,
    features: ['Transmissão ao vivo', 'Gravação automática', 'Biblioteca de vídeos', 'Player integrado', 'Controle de acesso'],
    categoria: 'ensino',
    dependeDe: ['pedagogico'],
    destaque: false,
    ordem: 4,
  },
  {
    id: 'mod-gamificacao',
    slug: 'gamificacao',
    nome: 'Gamificação',
    descricao: 'XP, conquistas, ranking, desafios, battle pass',
    icone: '🏆',
    precoMensal: 39,
    precoAnual: 31.20,
    features: ['Sistema de XP', 'Conquistas e badges', 'Ranking global', 'Desafios semanais', 'Battle Pass sazonal'],
    categoria: 'engajamento',
    dependeDe: [],
    destaque: true,
    ordem: 5,
  },
  {
    id: 'mod-analytics',
    slug: 'analytics',
    nome: 'Analytics Avançado',
    descricao: 'Dashboards, métricas, previsões, health score',
    icone: '📊',
    precoMensal: 49,
    precoAnual: 39.20,
    features: ['Dashboards customizáveis', 'Métricas de retenção', 'Previsão de churn', 'Health Score por aluno', 'Relatórios exportáveis'],
    categoria: 'operacao',
    dependeDe: [],
    destaque: false,
    ordem: 6,
  },
  {
    id: 'mod-eventos',
    slug: 'eventos',
    nome: 'Eventos & Campeonatos',
    descricao: 'Gestão de campeonatos, inscrições, chaves, resultados',
    icone: '🥋',
    precoMensal: 39,
    precoAnual: 31.20,
    features: ['Criar campeonatos', 'Inscrições online', 'Chaves automáticas', 'Resultados em tempo real', 'Certificados'],
    categoria: 'engajamento',
    dependeDe: [],
    destaque: false,
    ordem: 7,
  },
  {
    id: 'mod-comunicacao',
    slug: 'comunicacao',
    nome: 'Comunicação',
    descricao: 'Push, email, SMS, grupos, murais',
    icone: '💬',
    precoMensal: 29,
    precoAnual: 23.20,
    features: ['Push notifications', 'Email marketing', 'Grupos de conversa', 'Mural da academia', 'Comunicados segmentados'],
    categoria: 'engajamento',
    dependeDe: [],
    destaque: false,
    ordem: 8,
  },
  {
    id: 'mod-contratos',
    slug: 'contratos',
    nome: 'Contratos Digitais',
    descricao: 'Contratos, assinatura digital, termos, renovação automática',
    icone: '📝',
    precoMensal: 29,
    precoAnual: 23.20,
    features: ['Contratos personalizáveis', 'Assinatura digital', 'Termos de uso', 'Renovação automática', 'Histórico completo'],
    categoria: 'comercial',
    dependeDe: [],
    destaque: false,
    ordem: 9,
  },
  {
    id: 'mod-loja',
    slug: 'loja',
    nome: 'Loja Integrada',
    descricao: 'Venda de produtos, estoque, pedidos, entrega',
    icone: '🛒',
    precoMensal: 39,
    precoAnual: 31.20,
    features: ['Catálogo de produtos', 'Controle de estoque', 'Pedidos online', 'Pagamento integrado', 'Relatório de vendas'],
    categoria: 'comercial',
    dependeDe: [],
    destaque: false,
    ordem: 10,
  },
  {
    id: 'mod-kids_teens',
    slug: 'kids_teens',
    nome: 'Kids & Teens',
    descricao: 'Experiência lúdica, responsáveis, progresso visual',
    icone: '👶',
    precoMensal: 39,
    precoAnual: 31.20,
    features: ['Interface lúdica kids', 'Modo teen gamificado', 'Portal do responsável', 'Progresso visual', 'Alertas para pais'],
    categoria: 'ensino',
    dependeDe: [],
    destaque: false,
    ordem: 11,
  },
  {
    id: 'mod-responsavel',
    slug: 'responsavel',
    nome: 'Portal do Responsável',
    descricao: 'Acompanhamento, pagamentos, comunicação, autorizações',
    icone: '👨‍👩‍👧',
    precoMensal: 19,
    precoAnual: 15.20,
    features: ['Dashboard do filho', 'Pagamentos centralizados', 'Chat com professor', 'Autorizações digitais', 'Boletim de progresso'],
    categoria: 'engajamento',
    dependeDe: ['kids_teens'],
    destaque: false,
    ordem: 12,
  },
  {
    id: 'mod-multi_unidade',
    slug: 'multi_unidade',
    nome: 'Multi-unidade',
    descricao: 'Gestão de filiais, consolidação, transferências',
    icone: '🏢',
    precoMensal: 79,
    precoAnual: 63.20,
    features: ['Painel consolidado', 'Gestão por unidade', 'Transferência de alunos', 'Relatórios comparativos', 'Estoque unificado'],
    categoria: 'avancado',
    dependeDe: [],
    destaque: false,
    ordem: 13,
  },
  {
    id: 'mod-franquia',
    slug: 'franquia',
    nome: 'Franquia',
    descricao: 'Royalties, padronização, expansão, benchmarking',
    icone: '🌐',
    precoMensal: 149,
    precoAnual: 119.20,
    features: ['Gestão de royalties', 'Padronização de processos', 'Expansão assistida', 'Benchmarking entre unidades', 'Portal do franqueado'],
    categoria: 'avancado',
    dependeDe: ['multi_unidade'],
    destaque: false,
    ordem: 14,
  },
  {
    id: 'mod-recepcao',
    slug: 'recepcao',
    nome: 'Recepção',
    descricao: 'Painel de recepção, agenda, visitantes, trial classes',
    icone: '🖥️',
    precoMensal: 29,
    precoAnual: 23.20,
    features: ['Painel do recepcionista', 'Agenda visual', 'Controle de visitantes', 'Aulas experimentais', 'Check-in assistido'],
    categoria: 'operacao',
    dependeDe: [],
    destaque: false,
    ordem: 15,
  },
  {
    id: 'mod-ia_coach',
    slug: 'ia_coach',
    nome: 'IA Coach',
    descricao: 'Assistente IA, análise de vídeo, recomendações personalizadas',
    icone: '🤖',
    precoMensal: 69,
    precoAnual: 55.20,
    features: ['Assistente virtual IA', 'Análise de vídeo por IA', 'Recomendações personalizadas', 'Chatbot para alunos', 'Insights automáticos'],
    categoria: 'avancado',
    dependeDe: [],
    destaque: false,
    ordem: 16,
  },
];

// ─── Helper: sum modulo prices by slugs ───────────────────────

function somaModulosMensal(slugs: string[]): number {
  return MODULOS.filter((m) => slugs.includes(m.slug)).reduce((s, m) => s + m.precoMensal, 0);
}

// ─── 3 Pacotes ────────────────────────────────────────────────

const ESSENCIAL_SLUGS = ['financeiro', 'qr_checkin', 'comunicacao', 'contratos'];
const PROFISSIONAL_SLUGS = ['financeiro', 'qr_checkin', 'pedagogico', 'streaming', 'gamificacao', 'analytics', 'eventos', 'comunicacao', 'contratos'];
const COMPLETO_SLUGS = ['financeiro', 'qr_checkin', 'pedagogico', 'streaming', 'gamificacao', 'analytics', 'eventos', 'comunicacao', 'contratos', 'loja', 'kids_teens', 'responsavel', 'recepcao', 'ia_coach'];

const essencialOriginal = somaModulosMensal(ESSENCIAL_SLUGS);
const profissionalOriginal = somaModulosMensal(PROFISSIONAL_SLUGS);
const completoOriginal = somaModulosMensal(COMPLETO_SLUGS);

const PACOTES: PacoteSugerido[] = [
  {
    id: 'pkg-essencial',
    nome: 'Essencial',
    slug: 'essencial',
    descricao: 'O básico para funcionar bem',
    icone: '⚡',
    modulosSlugs: ESSENCIAL_SLUGS,
    descontoPercent: 20,
    precoOriginal: essencialOriginal,
    precoComDesconto: essencialOriginal * 0.80,
    popular: false,
  },
  {
    id: 'pkg-profissional',
    nome: 'Profissional',
    slug: 'profissional',
    descricao: 'Tudo que uma academia profissional precisa',
    icone: '🚀',
    modulosSlugs: PROFISSIONAL_SLUGS,
    descontoPercent: 20,
    precoOriginal: profissionalOriginal,
    precoComDesconto: profissionalOriginal * 0.80,
    popular: true,
  },
  {
    id: 'pkg-completo',
    nome: 'Completo',
    slug: 'completo',
    descricao: 'Todos os módulos com o melhor desconto',
    icone: '👑',
    modulosSlugs: COMPLETO_SLUGS,
    descontoPercent: 25,
    precoOriginal: completoOriginal,
    precoComDesconto: completoOriginal * 0.75,
    popular: false,
  },
];

// ─── Guerreiros academy subscription ─────────────────────────
// Day 45 of discovery, 45 days remaining
// trialStartedAt: 52 days ago (7 days trial + 45 days discovery so far)
// trialEndsAt: 45 days ago
// discoveryEndsAt: 45 days from now

const now = new Date();

function daysAgo(days: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function daysFromNow(days: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

const ALL_MODULE_SLUGS = MODULOS.map((m) => m.slug);

const ASSINATURA: AssinaturaSaaS = {
  id: 'sub-guerreiros-001',
  academyId: 'academy-1',
  tierId: 'tier-pro',
  modulosPagos: PROFISSIONAL_SLUGS,
  professoresAdicionais: 0,
  unidadesAdicionais: 0,
  ciclo: 'mensal',
  pacoteId: 'pkg-profissional',
  precoTotal: 347 + (profissionalOriginal * 0.80), // Pro tier + Profissional package
  status: 'discovery',
  trialStartedAt: daysAgo(52),
  trialEndsAt: daysAgo(45),
  discoveryEndsAt: daysFromNow(45),
  planStartedAt: undefined,
  currentPeriodStart: daysAgo(52),
  currentPeriodEnd: daysFromNow(45),
  cancelledAt: undefined,
  modulosAtivos: ALL_MODULE_SLUGS, // all 16 during discovery
  emPeriodoDescoberta: true,
  diasRestantesDescoberta: 45,
  usoDescoberta: [
    { moduloSlug: 'loja', moduloNome: 'Loja Integrada', vezesUsado: 12, ultimoUso: daysAgo(1), inclusoNoPlano: false },
    { moduloSlug: 'kids_teens', moduloNome: 'Kids & Teens', vezesUsado: 8, ultimoUso: daysAgo(2), inclusoNoPlano: false },
    { moduloSlug: 'ia_coach', moduloNome: 'IA Coach', vezesUsado: 5, ultimoUso: daysAgo(3), inclusoNoPlano: false },
    { moduloSlug: 'responsavel', moduloNome: 'Portal do Responsável', vezesUsado: 15, ultimoUso: daysAgo(1), inclusoNoPlano: false },
    { moduloSlug: 'multi_unidade', moduloNome: 'Multi-unidade', vezesUsado: 0, ultimoUso: '', inclusoNoPlano: false },
    { moduloSlug: 'franquia', moduloNome: 'Franquia', vezesUsado: 0, ultimoUso: '', inclusoNoPlano: false },
    { moduloSlug: 'recepcao', moduloNome: 'Recepção', vezesUsado: 22, ultimoUso: daysAgo(1), inclusoNoPlano: false },
  ],
};

// ─── 3 billing history entries ────────────────────────────────

const COBRANCAS: Cobranca[] = [
  {
    id: 'bill-001',
    data: daysAgo(52),
    valor: ASSINATURA.precoTotal,
    descricao: 'Assinatura BlackBelt — Pro + Pacote Profissional (1o mês)',
    status: 'paid',
    metodo: 'credit_card',
  },
  {
    id: 'bill-002',
    data: daysAgo(22),
    valor: ASSINATURA.precoTotal,
    descricao: 'Assinatura BlackBelt — Pro + Pacote Profissional (2o mês)',
    status: 'paid',
    metodo: 'credit_card',
  },
  {
    id: 'bill-003',
    data: daysAgo(0),
    valor: ASSINATURA.precoTotal,
    descricao: 'Assinatura BlackBelt — Pro + Pacote Profissional (3o mês)',
    status: 'paid',
    metodo: 'credit_card',
  },
];

// ─── Mock functions ───────────────────────────────────────────

export async function mockGetFaixas(): Promise<FaixaBase[]> {
  await delay();
  return FAIXAS.map((f) => ({ ...f }));
}

export async function mockGetModulos(): Promise<Modulo[]> {
  await delay();
  return MODULOS.map((m) => ({ ...m, features: [...m.features], dependeDe: m.dependeDe ? [...m.dependeDe] : undefined }));
}

export async function mockGetPacotes(): Promise<PacoteSugerido[]> {
  await delay();
  return PACOTES.map((p) => ({ ...p, modulosSlugs: [...p.modulosSlugs] }));
}

export async function mockGetAssinatura(_academyId: string): Promise<AssinaturaSaaS> {
  await delay();
  return {
    ...ASSINATURA,
    modulosPagos: [...ASSINATURA.modulosPagos],
    modulosAtivos: [...ASSINATURA.modulosAtivos],
    usoDescoberta: ASSINATURA.usoDescoberta.map((u) => ({ ...u })),
  };
}

export async function mockAtivarModulo(_academyId: string, moduloSlug: string): Promise<AssinaturaSaaS> {
  await delay();
  const updated = {
    ...ASSINATURA,
    modulosPagos: ASSINATURA.modulosPagos.includes(moduloSlug)
      ? [...ASSINATURA.modulosPagos]
      : [...ASSINATURA.modulosPagos, moduloSlug],
    modulosAtivos: [...ASSINATURA.modulosAtivos],
    usoDescoberta: ASSINATURA.usoDescoberta.map((u) => ({ ...u })),
  };
  const mod = MODULOS.find((m) => m.slug === moduloSlug);
  if (mod) {
    updated.precoTotal = ASSINATURA.precoTotal + mod.precoMensal;
  }
  return updated;
}

export async function mockDesativarModulo(_academyId: string, moduloSlug: string): Promise<AssinaturaSaaS> {
  await delay();
  const updated = {
    ...ASSINATURA,
    modulosPagos: ASSINATURA.modulosPagos.filter((s) => s !== moduloSlug),
    modulosAtivos: ASSINATURA.modulosAtivos.filter((s) => s !== moduloSlug),
    usoDescoberta: ASSINATURA.usoDescoberta.map((u) => ({ ...u })),
  };
  const mod = MODULOS.find((m) => m.slug === moduloSlug);
  if (mod) {
    updated.precoTotal = ASSINATURA.precoTotal - mod.precoMensal;
  }
  return updated;
}

export async function mockGetHistoricoCobrancas(_academyId: string): Promise<Cobranca[]> {
  await delay();
  return COBRANCAS.map((c) => ({ ...c }));
}

export async function mockGetUsoDescoberta(_academyId: string): Promise<UsoDescoberta[]> {
  await delay();
  return ASSINATURA.usoDescoberta.map((u) => ({ ...u }));
}

export async function mockIsModuloAcessivel(_academyId: string, moduloSlug: string): Promise<boolean> {
  await delay();
  // During discovery all modules are accessible
  if (ASSINATURA.emPeriodoDescoberta) return true;
  return ASSINATURA.modulosPagos.includes(moduloSlug);
}

export async function mockGetModulosExtrasDescoberta(_academyId: string): Promise<ModuloExtra[]> {
  await delay();
  const discoveryModules = ASSINATURA.usoDescoberta.filter((u) => !u.inclusoNoPlano && u.vezesUsado > 0);
  return discoveryModules.map((u) => {
    const mod = MODULOS.find((m) => m.slug === u.moduloSlug);
    return {
      slug: u.moduloSlug,
      nome: mod?.nome ?? u.moduloNome,
      icone: mod?.icone ?? '',
      precoMensal: mod?.precoMensal ?? 0,
      vezesUsado: u.vezesUsado,
      diasRestantes: ASSINATURA.diasRestantesDescoberta,
    };
  });
}

export async function mockSimularUpgrade(_academyId: string, novosModulos: string[]): Promise<SimulacaoUpgrade> {
  await delay();
  const mods = MODULOS.filter((m) => novosModulos.includes(m.slug));
  const custoAdicional = mods.reduce((s, m) => s + m.precoMensal, 0);
  const totalNovo = ASSINATURA.precoTotal + custoAdicional;

  // Check if a package would be better
  const allModulosAfter = Array.from(new Set([...ASSINATURA.modulosPagos, ...novosModulos]));
  let pacoteSugerido: PacoteSugerido | undefined;
  let economiaComPacote: number | undefined;

  for (const pkg of PACOTES) {
    const allCovered = pkg.modulosSlugs.every((s) => allModulosAfter.includes(s));
    if (allCovered || allModulosAfter.every((s) => pkg.modulosSlugs.includes(s))) {
      const precoSemPacote = somaModulosMensal(allModulosAfter);
      const precoPacote = pkg.precoComDesconto;
      if (precoPacote < precoSemPacote) {
        pacoteSugerido = { ...pkg, modulosSlugs: [...pkg.modulosSlugs] };
        economiaComPacote = precoSemPacote - precoPacote;
        break;
      }
    }
  }

  return {
    modulosNovos: mods.map((m) => ({ ...m, features: [...m.features], dependeDe: m.dependeDe ? [...m.dependeDe] : undefined })),
    custoAdicional,
    totalNovo,
    economiaComPacote,
    pacoteSugerido,
  };
}
