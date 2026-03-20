// ══════════════════════════════════════
// MODULES DO SISTEMA
// ══════════════════════════════════════

export type ModuleId =
  // CORE (incluido em TODOS os planos)
  | 'dashboard'
  | 'turmas'
  | 'alunos'
  | 'checkin'
  | 'presenca'
  | 'perfil'
  | 'configuracoes'

  // ESSENCIAL (a partir do Essencial)
  | 'financeiro'
  | 'graduacoes'
  | 'avaliacoes'
  | 'mensagens'
  | 'notificacoes'

  // PRO (a partir do Pro)
  | 'whatsapp'
  | 'conteudo'
  | 'video_upload'
  | 'academia_teorica'
  | 'conquistas'
  | 'ranking'
  | 'relatorios'
  | 'landing_page'
  | 'convites'
  | 'loja'
  | 'marketplace'

  // BLACK BELT (a partir do Black Belt)
  | 'churn_prediction'
  | 'pedagogico'
  | 'kids_module'
  | 'teen_module'
  | 'pagamento_gateway'
  | 'compete'
  | 'api_publica'

  // ENTERPRISE (so Enterprise)
  | 'franqueador'
  | 'multi_unidade'
  | 'white_label';

// ══════════════════════════════════════
// PLANOS E O QUE CADA UM INCLUI
// ══════════════════════════════════════

export interface PlanDefinition {
  id: string;
  name: string;
  slug: string;
  price: number;
  maxStudents: number;
  modules: ModuleId[];
}

const CORE_MODULES: ModuleId[] = [
  'dashboard', 'turmas', 'alunos', 'checkin', 'presenca',
  'perfil', 'configuracoes',
];

const ESSENCIAL_MODULES: ModuleId[] = [
  ...CORE_MODULES,
  'financeiro', 'graduacoes', 'avaliacoes', 'mensagens', 'notificacoes',
];

const PRO_MODULES: ModuleId[] = [
  ...ESSENCIAL_MODULES,
  'whatsapp', 'conteudo', 'video_upload', 'academia_teorica',
  'conquistas', 'ranking', 'relatorios', 'landing_page', 'convites',
  'loja', 'marketplace',
];

const BLACKBELT_MODULES: ModuleId[] = [
  ...PRO_MODULES,
  'churn_prediction', 'pedagogico', 'kids_module', 'teen_module',
  'pagamento_gateway', 'compete', 'api_publica',
];

const ENTERPRISE_MODULES: ModuleId[] = [
  ...BLACKBELT_MODULES,
  'franqueador', 'multi_unidade', 'white_label',
];

export const PLANS: PlanDefinition[] = [
  {
    id: 'starter',
    name: 'Starter',
    slug: 'starter',
    price: 97,
    maxStudents: 30,
    modules: CORE_MODULES,
  },
  {
    id: 'essencial',
    name: 'Essencial',
    slug: 'essencial',
    price: 197,
    maxStudents: 60,
    modules: ESSENCIAL_MODULES,
  },
  {
    id: 'pro',
    name: 'Pro',
    slug: 'pro',
    price: 347,
    maxStudents: 120,
    modules: PRO_MODULES,
  },
  {
    id: 'blackbelt',
    name: 'Black Belt',
    slug: 'blackbelt',
    price: 497,
    maxStudents: 250,
    modules: BLACKBELT_MODULES,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    slug: 'enterprise',
    price: 0,
    maxStudents: 99999,
    modules: ENTERPRISE_MODULES,
  },
];

// ══════════════════════════════════════
// MAPA: Pagina → Modulo necessario
// ══════════════════════════════════════

export const PAGE_MODULE_MAP: Record<string, ModuleId> = {
  // Admin
  '/admin': 'dashboard',
  '/admin/turmas': 'turmas',
  '/admin/alunos': 'alunos',
  '/admin/financeiro': 'financeiro',
  '/admin/inadimplencia': 'financeiro',
  '/admin/contratos': 'financeiro',
  '/admin/graduacoes': 'graduacoes',
  '/admin/whatsapp': 'whatsapp',
  '/admin/conteudo': 'conteudo',
  '/admin/relatorios': 'relatorios',
  '/admin/retencao': 'churn_prediction',
  '/admin/pedagogico': 'pedagogico',
  '/admin/campeonatos': 'compete',
  '/admin/site': 'landing_page',
  '/admin/configuracoes': 'configuracoes',
  '/admin/configuracoes/pagamento': 'pagamento_gateway',
  '/admin/plano': 'dashboard',
  '/admin/convites': 'convites',
  '/admin/mensagens': 'mensagens',
  '/admin/eventos': 'conteudo',
  '/admin/comunicados': 'mensagens',
  '/admin/loja': 'loja',
  '/admin/estoque': 'loja',
  '/admin/calendario': 'dashboard',
  '/admin/aula-experimental': 'alunos',
  '/admin/auditoria': 'dashboard',
  '/admin/relatorio-professores': 'relatorios',

  // Professor
  '/professor': 'dashboard',
  '/professor/turmas': 'turmas',
  '/professor/turma-ativa': 'turmas',
  '/professor/alunos': 'alunos',
  '/professor/avaliacoes': 'avaliacoes',
  '/professor/conteudo': 'conteudo',
  '/professor/diario': 'conteudo',
  '/professor/plano-aula': 'conteudo',
  '/professor/tecnicas': 'conteudo',
  '/professor/duvidas': 'conteudo',
  '/professor/mensagens': 'mensagens',
  '/professor/calendario': 'dashboard',
  '/professor/relatorios': 'relatorios',

  // Aluno
  '/dashboard': 'dashboard',
  '/dashboard/turmas': 'turmas',
  '/dashboard/progresso': 'dashboard',
  '/dashboard/conquistas': 'conquistas',
  '/dashboard/perfil': 'perfil',
  '/dashboard/configuracoes': 'configuracoes',
  '/conteudo': 'conteudo',
  '/academia': 'academia_teorica',
  '/academia/glossario': 'academia_teorica',

  // Teen
  '/teen': 'teen_module',
  '/teen/academia': 'academia_teorica',
  '/teen/ranking': 'ranking',
  '/teen/season': 'teen_module',
  '/teen/desafios': 'teen_module',
  '/teen/conquistas': 'conquistas',

  // Kids
  '/kids': 'kids_module',
  '/kids/academia': 'academia_teorica',
  '/kids/recompensas': 'kids_module',

  // Parent
  '/parent': 'dashboard',
  '/parent/agenda': 'dashboard',
  '/parent/mensagens': 'mensagens',
  '/parent/pagamentos': 'financeiro',

  // Recepcao
  '/recepcao': 'dashboard',
  '/recepcao/atendimento': 'alunos',
  '/recepcao/cadastro': 'alunos',
  '/recepcao/caixa': 'financeiro',
  '/recepcao/experimentais': 'alunos',
};

// ══════════════════════════════════════
// NOMES DOS MODULOS (para exibir)
// ══════════════════════════════════════

export const MODULE_NAMES: Record<ModuleId, string> = {
  dashboard: 'Dashboard',
  turmas: 'Turmas',
  alunos: 'Alunos',
  checkin: 'Check-in',
  presenca: 'Presenca',
  perfil: 'Perfil',
  configuracoes: 'Configuracoes',
  financeiro: 'Financeiro',
  graduacoes: 'Graduacoes',
  avaliacoes: 'Avaliacoes',
  mensagens: 'Mensagens',
  notificacoes: 'Notificacoes',
  whatsapp: 'WhatsApp',
  conteudo: 'Biblioteca de Videos',
  video_upload: 'Upload de Videos',
  academia_teorica: 'Academia Teorica',
  conquistas: 'Conquistas',
  ranking: 'Ranking',
  relatorios: 'Relatorios',
  landing_page: 'Landing Page',
  convites: 'Convites',
  churn_prediction: 'Predicao de Churn',
  pedagogico: 'Coordenacao Pedagogica',
  kids_module: 'Modulo Kids',
  teen_module: 'Modulo Teen',
  pagamento_gateway: 'Gateway de Pagamento',
  compete: 'Campeonatos',
  loja: 'Loja',
  marketplace: 'Marketplace',
  api_publica: 'API Publica',
  franqueador: 'Franqueador',
  multi_unidade: 'Multi-Unidade',
  white_label: 'White Label',
};

// Qual plano MINIMO precisa para acessar o modulo
export function getMinimumPlan(module: ModuleId): PlanDefinition {
  for (const plan of PLANS) {
    if (plan.modules.includes(module)) return plan;
  }
  return PLANS[PLANS.length - 1];
}
