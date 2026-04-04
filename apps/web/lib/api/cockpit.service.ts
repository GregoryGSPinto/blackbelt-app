import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface KpiSnapshot {
  totalAcademies: number;
  activeAcademies: number;
  trialAcademies: number;
  totalUsers: number;
  activeUsers7d: number;
  mrr: number;
  churnRate: number;
  avgCheckins: number;
  npsScore: number;
  deltaAcademies: number;
  deltaUsers: number;
  deltaMrr: number;
  deltaChurn: number;
}

export interface FeatureBacklogItem {
  id: string;
  product: string;
  title: string;
  description: string | null;
  module: string | null;
  persona: string | null;
  job_to_be_done: string | null;
  success_criteria: string | null;
  rice_impact: number;
  rice_urgency: number;
  rice_effort: number;
  rice_score: number;
  pipeline_phase: string;
  status: string;
  priority_order: number;
  sprint_id: string | null;
  shipped_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OperationalCost {
  id: string;
  product: string;
  category: string;
  name: string;
  description: string | null;
  amount_brl: number;
  frequency: string;
  active: boolean;
  start_date: string | null;
  end_date: string | null;
}

export interface ArchitectureDecision {
  id: string;
  product: string;
  adr_number: number;
  title: string;
  status: string;
  context: string | null;
  options_considered: Array<{ option: string; pros: string; cons: string }>;
  decision: string | null;
  consequences: string | null;
  created_at: string;
}

export interface Sprint {
  id: string;
  product: string;
  week_start: string;
  week_end: string;
  goals: Array<{ title: string; status: string; feature_id?: string }>;
  velocity: number;
  prompts_executed: number;
  notes: string | null;
  retrospective: string | null;
}

export interface UserFeedbackItem {
  id: string;
  product: string;
  user_name: string | null;
  user_email: string | null;
  user_role: string | null;
  academy_name: string | null;
  category: string;
  message: string;
  rating: number | null;
  status: string;
  converted_to: string | null;
  internal_notes: string | null;
  created_at: string;
}

export interface DeployLogItem {
  id: string;
  product: string;
  commit_sha: string | null;
  commit_message: string | null;
  branch: string;
  tag: string | null;
  status: string;
  duration_seconds: number | null;
  files_changed: number | null;
  lines_added: number | null;
  lines_removed: number | null;
  vercel_url: string | null;
  deployed_at: string;
}

export interface ErrorLogItem {
  id: string;
  product: string;
  error_type: string | null;
  severity: string;
  message: string;
  affected_route: string | null;
  frequency: number;
  status: string;
  first_seen: string;
  last_seen: string;
  resolution: string | null;
}

export interface ContentCalendarItem {
  id: string;
  product: string;
  title: string;
  platform: string;
  content_type: string | null;
  planned_date: string | null;
  status: string;
  published_url: string | null;
  target_persona: string | null;
  notes: string | null;
}

export interface CampaignItem {
  id: string;
  product: string;
  name: string;
  channel: string | null;
  budget_brl: number;
  status: string;
  start_date: string | null;
  end_date: string | null;
  goal: string | null;
  target_metric: string | null;
  target_value: number | null;
  actual_value: number | null;
  result: string | null;
  learnings: string | null;
}

export interface PersonaItem {
  id: string;
  name: string;
  role_in_app: string | null;
  description: string | null;
  pains: string[];
  jobs_to_be_done: string[];
  key_features: string[];
  feature_completion_pct: number;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_KPI: KpiSnapshot = {
  totalAcademies: 3,
  activeAcademies: 3,
  trialAcademies: 0,
  totalUsers: 52,
  activeUsers7d: 38,
  mrr: 891,
  churnRate: 0,
  avgCheckins: 3.4,
  npsScore: 72,
  deltaAcademies: 0,
  deltaUsers: 4,
  deltaMrr: 0,
  deltaChurn: 0,
};

const MOCK_FEATURES: FeatureBacklogItem[] = [
  {
    id: 'ck-feat-001', product: 'blackbelt', title: 'Cockpit CEO Dashboard',
    description: 'Painel de KPIs e métricas para CEO', module: 'cockpit', persona: 'superadmin',
    job_to_be_done: 'Ver saúde do negócio em um único painel', success_criteria: 'Todos os KPIs visíveis na home',
    rice_impact: 9, rice_urgency: 9, rice_effort: 5, rice_score: 16.2,
    pipeline_phase: 'building', status: 'em_progresso', priority_order: 1, sprint_id: 'ck-sprint-001',
    shipped_at: null, created_at: '2026-03-20T10:00:00Z', updated_at: '2026-03-28T15:00:00Z',
  },
  {
    id: 'ck-feat-002', product: 'blackbelt', title: 'Sistema de Campeonatos',
    description: 'Gestão completa de campeonatos internos e externos', module: 'campeonatos', persona: 'admin',
    job_to_be_done: 'Organizar campeonatos sem planilha', success_criteria: 'Chaveamento automático funcionando',
    rice_impact: 8, rice_urgency: 7, rice_effort: 8, rice_score: 7.0,
    pipeline_phase: 'ready', status: 'pronto', priority_order: 2, sprint_id: null,
    shipped_at: null, created_at: '2026-03-10T08:00:00Z', updated_at: '2026-03-25T12:00:00Z',
  },
  {
    id: 'ck-feat-003', product: 'blackbelt', title: 'Vídeo-Aulas com Bunny CDN',
    description: 'Upload e streaming de vídeos via Bunny.net', module: 'video-aulas', persona: 'professor',
    job_to_be_done: 'Disponibilizar aulas gravadas para alunos', success_criteria: 'Upload, listagem e player funcionando',
    rice_impact: 8, rice_urgency: 8, rice_effort: 4, rice_score: 16.0,
    pipeline_phase: 'shipped', status: 'entregue', priority_order: 3, sprint_id: null,
    shipped_at: '2026-03-27T18:00:00Z', created_at: '2026-03-01T10:00:00Z', updated_at: '2026-03-27T18:00:00Z',
  },
  {
    id: 'ck-feat-004', product: 'blackbelt', title: 'Módulo de Frequência por QR Code',
    description: 'Check-in via QR Code na recepção', module: 'checkin', persona: 'recepcao',
    job_to_be_done: 'Registrar presença de alunos rapidamente', success_criteria: 'QR lido em <2s, presença registrada',
    rice_impact: 9, rice_urgency: 8, rice_effort: 3, rice_score: 24.0,
    pipeline_phase: 'shipped', status: 'entregue', priority_order: 4, sprint_id: null,
    shipped_at: '2026-02-15T12:00:00Z', created_at: '2026-01-20T10:00:00Z', updated_at: '2026-02-15T12:00:00Z',
  },
  {
    id: 'ck-feat-005', product: 'blackbelt', title: 'Marketplace de Kimonos e Equipamentos',
    description: 'Loja integrada com gestão de estoque', module: 'marketplace', persona: 'aluno',
    job_to_be_done: 'Comprar kimono e equipamentos pela academia', success_criteria: 'Catálogo, carrinho e pedido funcionando',
    rice_impact: 6, rice_urgency: 5, rice_effort: 7, rice_score: 4.3,
    pipeline_phase: 'backlog', status: 'backlog', priority_order: 5, sprint_id: null,
    shipped_at: null, created_at: '2026-02-01T10:00:00Z', updated_at: '2026-02-01T10:00:00Z',
  },
  {
    id: 'ck-feat-006', product: 'blackbelt', title: 'Notificações Push via Capacitor',
    description: 'Push notifications nativas no app mobile', module: 'notificacoes', persona: 'aluno',
    job_to_be_done: 'Receber lembretes de treino e avisos', success_criteria: 'Push recebido em iOS e Android',
    rice_impact: 7, rice_urgency: 6, rice_effort: 5, rice_score: 8.4,
    pipeline_phase: 'ready', status: 'pronto', priority_order: 6, sprint_id: null,
    shipped_at: null, created_at: '2026-02-10T10:00:00Z', updated_at: '2026-03-15T10:00:00Z',
  },
  {
    id: 'ck-feat-007', product: 'blackbelt', title: 'Diário de Aula do Professor',
    description: 'Registro de conteúdo ensinado por aula', module: 'diario-aula', persona: 'professor',
    job_to_be_done: 'Registrar o que foi ensinado em cada aula', success_criteria: 'Histórico consultável por data e turma',
    rice_impact: 7, rice_urgency: 7, rice_effort: 3, rice_score: 16.3,
    pipeline_phase: 'shipped', status: 'entregue', priority_order: 7, sprint_id: null,
    shipped_at: '2026-03-05T14:00:00Z', created_at: '2026-01-15T10:00:00Z', updated_at: '2026-03-05T14:00:00Z',
  },
  {
    id: 'ck-feat-008', product: 'blackbelt', title: 'Painel do Responsável',
    description: 'Dashboard para pais acompanharem filhos', module: 'responsavel', persona: 'responsavel',
    job_to_be_done: 'Acompanhar frequência e evolução dos filhos', success_criteria: 'Visualizar checkins, notas e eventos',
    rice_impact: 7, rice_urgency: 6, rice_effort: 4, rice_score: 10.5,
    pipeline_phase: 'building', status: 'em_progresso', priority_order: 8, sprint_id: 'ck-sprint-001',
    shipped_at: null, created_at: '2026-02-20T10:00:00Z', updated_at: '2026-03-28T10:00:00Z',
  },
  {
    id: 'ck-feat-009', product: 'blackbelt', title: 'Gamificação Kids – Estrelas e Recompensas',
    description: 'Sistema de pontos e recompensas para crianças', module: 'kids', persona: 'kids',
    job_to_be_done: 'Motivar crianças com recompensas lúdicas', success_criteria: 'Crianças acumulam estrelas e trocam por prêmios',
    rice_impact: 8, rice_urgency: 5, rice_effort: 6, rice_score: 6.7,
    pipeline_phase: 'ready', status: 'pronto', priority_order: 9, sprint_id: null,
    shipped_at: null, created_at: '2026-02-25T10:00:00Z', updated_at: '2026-03-20T10:00:00Z',
  },
  {
    id: 'ck-feat-010', product: 'blackbelt', title: 'Integração com Federações (CBJJ/IBJJF)',
    description: 'Sincronizar ranking e filiação com federações', module: 'federacao', persona: 'admin',
    job_to_be_done: 'Manter dados de filiação atualizados sem digitar', success_criteria: 'Dados sincronizados automaticamente',
    rice_impact: 5, rice_urgency: 3, rice_effort: 9, rice_score: 1.7,
    pipeline_phase: 'backlog', status: 'backlog', priority_order: 10, sprint_id: null,
    shipped_at: null, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z',
  },
];

const MOCK_COSTS: OperationalCost[] = [
  {
    id: 'ck-cost-001', product: 'blackbelt', category: 'hosting', name: 'Vercel (Hobby)',
    description: 'Hospedagem frontend — plano gratuito', amount_brl: 0, frequency: 'monthly',
    active: true, start_date: '2026-01-01', end_date: null,
  },
  {
    id: 'ck-cost-002', product: 'blackbelt', category: 'database', name: 'Supabase (Free)',
    description: 'Banco de dados e auth — plano gratuito', amount_brl: 0, frequency: 'monthly',
    active: true, start_date: '2026-01-01', end_date: null,
  },
  {
    id: 'ck-cost-003', product: 'blackbelt', category: 'cdn', name: 'Bunny.net CDN + Storage',
    description: 'CDN e storage para vídeo-aulas', amount_brl: 15, frequency: 'monthly',
    active: true, start_date: '2026-03-01', end_date: null,
  },
  {
    id: 'ck-cost-004', product: 'blackbelt', category: 'marketplace', name: 'Apple Developer Program',
    description: 'Conta de desenvolvedor Apple para publicação iOS', amount_brl: 499, frequency: 'yearly',
    active: true, start_date: '2026-01-15', end_date: '2027-01-15',
  },
  {
    id: 'ck-cost-005', product: 'blackbelt', category: 'tooling', name: 'Claude Pro',
    description: 'Assinatura Claude para desenvolvimento assistido por IA', amount_brl: 200, frequency: 'monthly',
    active: true, start_date: '2026-01-01', end_date: null,
  },
];

const MOCK_ADRS: ArchitectureDecision[] = [
  {
    id: 'ck-adr-001', product: 'blackbelt', adr_number: 1, title: 'Stack Principal: Next.js 14 + Supabase + Capacitor',
    status: 'accepted', context: 'Precisávamos de uma stack full-stack com suporte mobile e custo zero inicial.',
    options_considered: [
      { option: 'Next.js + Supabase + Capacitor', pros: 'Full-stack JS, free tier generoso, PWA + nativo', cons: 'Capacitor menos maduro que React Native' },
      { option: 'React Native + Firebase', pros: 'Ecossistema mobile maduro', cons: 'Custo Firebase escala rápido, dois projetos separados' },
      { option: 'Flutter + Supabase', pros: 'Performance nativa, Dart tipado', cons: 'Curva de aprendizado Dart, sem SSR' },
    ],
    decision: 'Next.js 14 App Router + Supabase + Capacitor', consequences: 'Uma base de código para web e mobile. Dependência do Capacitor para features nativas.',
    created_at: '2026-01-05T10:00:00Z',
  },
  {
    id: 'ck-adr-002', product: 'blackbelt', adr_number: 2, title: 'Cockpit como módulo interno (não SaaS separado)',
    status: 'accepted', context: 'O cockpit de gestão do produto poderia ser um app separado ou um módulo dentro do BlackBelt.',
    options_considered: [
      { option: 'Módulo interno com perfil SuperAdmin', pros: 'Mesmo deploy, mesma base, sem infra extra', cons: 'Aumenta bundle se não usar code-splitting' },
      { option: 'App separado (cockpit.blackbelts.com.br)', pros: 'Isolamento total, deploy independente', cons: 'Duas bases de código, duplicação de auth' },
    ],
    decision: 'Módulo interno acessado pelo perfil SuperAdmin', consequences: 'Code-splitting obrigatório. Rotas /cockpit/* protegidas por middleware.',
    created_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 'ck-adr-003', product: 'blackbelt', adr_number: 3, title: 'Bunny.net para vídeo-aulas (não Supabase Storage)',
    status: 'accepted', context: 'Vídeo-aulas precisam de streaming eficiente e CDN global a baixo custo.',
    options_considered: [
      { option: 'Bunny.net CDN + Storage', pros: 'R$0.01/GB storage, CDN global, HLS nativo', cons: 'Mais um serviço para gerenciar' },
      { option: 'Supabase Storage', pros: 'Já integrado, sem setup extra', cons: 'Sem CDN, sem HLS, custo alto para vídeo' },
      { option: 'Cloudflare Stream', pros: 'HLS automático, boa CDN', cons: 'US$5/1000 min — caro para early stage' },
    ],
    decision: 'Bunny.net para storage e CDN de vídeos', consequences: 'Custo ~R$15/mês para uso atual. Necessário implementar upload via API Bunny.',
    created_at: '2026-02-20T10:00:00Z',
  },
  {
    id: 'ck-adr-004', product: 'blackbelt', adr_number: 4, title: '9 Perfis de Usuário com shells independentes',
    status: 'accepted', context: 'O sistema atende múltiplos perfis: Admin, Professor, Aluno, Teen, Kids, Responsável, Recepção, Franqueador, SuperAdmin.',
    options_considered: [
      { option: '9 shells independentes com componentes compartilhados', pros: 'UX específica por perfil, code-splitting natural', cons: 'Mais componentes shell para manter' },
      { option: 'Shell único com menus condicionais', pros: 'Menos código', cons: 'Complexidade de permissões no mesmo componente, UX genérica' },
    ],
    decision: '9 shells independentes em components/shell/', consequences: 'Cada perfil tem navegação e layout otimizados. Compartilhamento via componentes reutilizáveis.',
    created_at: '2026-01-08T10:00:00Z',
  },
  {
    id: 'ck-adr-005', product: 'blackbelt', adr_number: 5, title: 'Modelo de Precificação: 3 planos fixos',
    status: 'accepted', context: 'Definir modelo de preço para academias de artes marciais.',
    options_considered: [
      { option: '5 planos fixos (Starter R$79, Essencial R$149, Pro R$249, Black Belt R$397, Enterprise sob consulta)', pros: 'Simples de entender, previsível', cons: 'Menos flexível para academias muito grandes' },
      { option: 'Preço por aluno ativo', pros: 'Escala com o cliente', cons: 'Imprevisível para o cliente, complexo de calcular' },
      { option: 'Freemium + addons', pros: 'Baixa barreira de entrada', cons: 'Difícil monetizar cedo, feature-gating complexo' },
    ],
    decision: '3 planos fixos com limites de alunos e features', consequences: 'MRR previsível. Necessário implementar plan-enforcement para limitar features por plano.',
    created_at: '2026-01-12T10:00:00Z',
  },
];

const MOCK_SPRINT: Sprint = {
  id: 'ck-sprint-001', product: 'blackbelt', week_start: '2026-03-24', week_end: '2026-03-30',
  goals: [
    { title: 'Cockpit CEO Dashboard — KPIs e backlog', status: 'em_progresso', feature_id: 'ck-feat-001' },
    { title: 'Painel do Responsável — frequência e evolução', status: 'em_progresso', feature_id: 'ck-feat-008' },
    { title: 'Testes de usabilidade vídeo-aulas', status: 'concluido' },
  ],
  velocity: 14, prompts_executed: 87,
  notes: 'Sprint focado em cockpit e responsável. Testes de vídeo-aulas concluídos com sucesso.',
  retrospective: null,
};

const MOCK_SPRINTS: Sprint[] = [
  MOCK_SPRINT,
  {
    id: 'ck-sprint-000', product: 'blackbelt', week_start: '2026-03-17', week_end: '2026-03-23',
    goals: [
      { title: 'Vídeo-aulas — upload, player, library', status: 'concluido', feature_id: 'ck-feat-003' },
      { title: 'Correção de bugs no check-in QR', status: 'concluido' },
      { title: 'Migração para Bunny CDN', status: 'concluido' },
    ],
    velocity: 18, prompts_executed: 112,
    notes: 'Sprint produtivo. Vídeo-aulas entregues e testadas.',
    retrospective: 'Bunny integration foi mais rápida que o esperado. Bom velocity.',
  },
];

const MOCK_FEEDBACK: UserFeedbackItem[] = [
  {
    id: 'ck-fb-001', product: 'blackbelt', user_name: 'Carlos Silva', user_email: 'carlos@academiaforce.com',
    user_role: 'admin', academy_name: 'Academia Force BJJ', category: 'feature',
    message: 'Seria ótimo ter relatório de frequência mensal em PDF para enviar aos pais.',
    rating: null, status: 'novo', converted_to: null, internal_notes: null,
    created_at: '2026-03-25T14:30:00Z',
  },
  {
    id: 'ck-fb-002', product: 'blackbelt', user_name: 'Ana Pereira', user_email: 'ana@tatamibrasil.com',
    user_role: 'professor', academy_name: 'Tatami Brasil', category: 'bug',
    message: 'O vídeo-aula trava no Safari do iPhone quando o celular está com pouca memória.',
    rating: 3, status: 'em_analise', converted_to: null, internal_notes: 'Verificar se é issue do HLS player no Safari.',
    created_at: '2026-03-26T09:15:00Z',
  },
  {
    id: 'ck-fb-003', product: 'blackbelt', user_name: 'Roberto Lima', user_email: 'roberto@jiujitsucamp.com',
    user_role: 'admin', academy_name: 'Jiu-Jitsu Camp', category: 'elogio',
    message: 'O sistema de check-in por QR Code é muito prático! Economiza muito tempo na recepção.',
    rating: 5, status: 'lido', converted_to: null, internal_notes: null,
    created_at: '2026-03-22T16:45:00Z',
  },
  {
    id: 'ck-fb-004', product: 'blackbelt', user_name: 'Mariana Costa', user_email: 'mari@academiaforce.com',
    user_role: 'aluno', academy_name: 'Academia Force BJJ', category: 'feature',
    message: 'Quero poder ver meu histórico de graduação e quanto falta para a próxima faixa.',
    rating: null, status: 'convertido', converted_to: 'ck-feat-011', internal_notes: 'Convertido em feature de evolução de faixa.',
    created_at: '2026-03-20T11:00:00Z',
  },
  {
    id: 'ck-fb-005', product: 'blackbelt', user_name: 'Pedro Santos', user_email: null,
    user_role: 'responsavel', academy_name: 'Tatami Brasil', category: 'bug',
    message: 'A notificação de falta do meu filho não chegou — ele faltou segunda e não fui avisado.',
    rating: 2, status: 'novo', converted_to: null, internal_notes: null,
    created_at: '2026-03-28T08:20:00Z',
  },
];

const MOCK_PERSONAS: PersonaItem[] = [
  {
    id: 'ck-persona-001', name: 'Dono de Academia (Admin)', role_in_app: 'admin',
    description: 'Proprietário ou gestor principal da academia de artes marciais.',
    pains: ['Planilhas para tudo', 'Não sabe quem está inadimplente', 'Dificuldade em reter alunos'],
    jobs_to_be_done: ['Gerenciar alunos e turmas', 'Controlar financeiro', 'Acompanhar métricas de crescimento'],
    key_features: ['Dashboard admin', 'Gestão de alunos', 'Financeiro', 'Relatórios'],
    feature_completion_pct: 72,
  },
  {
    id: 'ck-persona-002', name: 'Professor', role_in_app: 'professor',
    description: 'Instrutor de artes marciais que ministra aulas e acompanha alunos.',
    pains: ['Sem registro do que foi ensinado', 'Difícil acompanhar evolução individual', 'Comunicação com pais é manual'],
    jobs_to_be_done: ['Registrar conteúdo das aulas', 'Avaliar técnica dos alunos', 'Disponibilizar vídeo-aulas'],
    key_features: ['Diário de aula', 'Avaliação técnica', 'Vídeo-aulas', 'Agenda'],
    feature_completion_pct: 65,
  },
  {
    id: 'ck-persona-003', name: 'Aluno Adulto', role_in_app: 'aluno',
    description: 'Praticante adulto de Jiu-Jitsu, Muay Thai ou outra arte marcial.',
    pains: ['Não sabe quando vai graduar', 'Esquece horário das aulas', 'Quer comprar kimono pela academia'],
    jobs_to_be_done: ['Acompanhar evolução e frequência', 'Ver grade de horários', 'Participar de campeonatos'],
    key_features: ['Check-in', 'Evolução', 'Horários', 'Campeonatos', 'Marketplace'],
    feature_completion_pct: 58,
  },
  {
    id: 'ck-persona-004', name: 'Adolescente (Teen)', role_in_app: 'teen',
    description: 'Praticante entre 13-17 anos, com interface adaptada.',
    pains: ['Interface muito formal', 'Quer desafios e competição', 'Quer se conectar com colegas'],
    jobs_to_be_done: ['Completar desafios semanais', 'Ver ranking entre colegas', 'Acompanhar evolução'],
    key_features: ['Desafios teen', 'Ranking social', 'Evolução gamificada'],
    feature_completion_pct: 40,
  },
  {
    id: 'ck-persona-005', name: 'Criança (Kids)', role_in_app: 'kids',
    description: 'Praticante até 12 anos com interface lúdica e gamificada.',
    pains: ['Perde interesse facilmente', 'Não entende interface de adulto', 'Quer recompensas visuais'],
    jobs_to_be_done: ['Ganhar estrelas por presença', 'Trocar estrelas por recompensas', 'Ver personagem evoluir'],
    key_features: ['Estrelas', 'Recompensas kids', 'Personalização avatar', 'Faixa visual'],
    feature_completion_pct: 55,
  },
  {
    id: 'ck-persona-006', name: 'Responsável (Pai/Mãe)', role_in_app: 'responsavel',
    description: 'Pai ou mãe de aluno menor que acompanha e paga a mensalidade.',
    pains: ['Não sabe se filho foi treinar', 'Recebe cobranças por WhatsApp', 'Sem visibilidade da evolução'],
    jobs_to_be_done: ['Acompanhar frequência dos filhos', 'Pagar mensalidade online', 'Ver calendário de eventos'],
    key_features: ['Painel responsável', 'Pagamento online', 'Agenda familiar', 'Notificações'],
    feature_completion_pct: 35,
  },
  {
    id: 'ck-persona-007', name: 'Recepcionista', role_in_app: 'recepcao',
    description: 'Funcionário(a) da recepção que faz check-in e atendimento.',
    pains: ['Check-in manual em caderno', 'Não sabe horário da turma', 'Aulas experimentais sem controle'],
    jobs_to_be_done: ['Registrar check-in rapidamente', 'Agendar aulas experimentais', 'Atender leads'],
    key_features: ['Check-in QR', 'Aula experimental', 'Atendimento recepção', 'Mensagens'],
    feature_completion_pct: 60,
  },
  {
    id: 'ck-persona-008', name: 'SuperAdmin (Fundador)', role_in_app: 'superadmin',
    description: 'Fundador do BlackBelt — acessa cockpit para gestão do produto.',
    pains: ['Sem visibilidade de métricas do SaaS', 'Backlog em planilha', 'Deploy sem histórico'],
    jobs_to_be_done: ['Ver KPIs do negócio', 'Gerenciar backlog e sprints', 'Monitorar custos e deploys'],
    key_features: ['Cockpit CEO', 'Cockpit CPO', 'Cockpit CTO', 'Cockpit Growth'],
    feature_completion_pct: 15,
  },
];

const MOCK_DEPLOYS: DeployLogItem[] = [
  {
    id: 'ck-deploy-001', product: 'blackbelt', commit_sha: 'cb482abf',
    commit_message: 'test(F8): video-aulas usability test report — all 5 API tests + 12 features passed',
    branch: 'main', tag: null, status: 'success', duration_seconds: 48, files_changed: 6,
    lines_added: 380, lines_removed: 12, vercel_url: 'https://blackbelt-v2.vercel.app',
    deployed_at: '2026-03-28T20:00:00Z',
  },
  {
    id: 'ck-deploy-002', product: 'blackbelt', commit_sha: 'a98f31d7',
    commit_message: 'feat(F5): video library enhancements — edit title, sort, storage counter, modal delete, status badges, empty state',
    branch: 'main', tag: null, status: 'success', duration_seconds: 52, files_changed: 9,
    lines_added: 620, lines_removed: 145, vercel_url: 'https://blackbelt-v2.vercel.app',
    deployed_at: '2026-03-27T18:30:00Z',
  },
  {
    id: 'ck-deploy-003', product: 'blackbelt', commit_sha: '67a93799',
    commit_message: 'feat(B7): student video-aulas page — watch only, no upload/delete',
    branch: 'main', tag: null, status: 'success', duration_seconds: 45, files_changed: 4,
    lines_added: 210, lines_removed: 5, vercel_url: 'https://blackbelt-v2.vercel.app',
    deployed_at: '2026-03-27T15:00:00Z',
  },
];

const MOCK_ERRORS: ErrorLogItem[] = [
  {
    id: 'ck-err-001', product: 'blackbelt', error_type: 'runtime', severity: 'medium',
    message: 'HLS.js: manifestLoadError on Safari iOS 17 — intermittent when low memory',
    affected_route: '/aluno/video-aulas', frequency: 3, status: 'novo',
    first_seen: '2026-03-26T09:00:00Z', last_seen: '2026-03-28T14:00:00Z', resolution: null,
  },
  {
    id: 'ck-err-002', product: 'blackbelt', error_type: 'api', severity: 'low',
    message: 'Supabase RLS: permission denied for table attendance (user without academy)',
    affected_route: '/api/checkin', frequency: 1, status: 'resolvido',
    first_seen: '2026-03-15T10:00:00Z', last_seen: '2026-03-15T10:00:00Z',
    resolution: 'Adicionado check de academy_id antes de inserir attendance.',
  },
];

const MOCK_CONTENT: ContentCalendarItem[] = [
  {
    id: 'ck-content-001', product: 'blackbelt', title: 'Post: Como o QR Code revoluciona o check-in na academia',
    platform: 'instagram', content_type: 'carrossel', planned_date: '2026-03-25', status: 'publicado',
    published_url: 'https://instagram.com/p/example1', target_persona: 'admin', notes: null,
  },
  {
    id: 'ck-content-002', product: 'blackbelt', title: 'Vídeo: Tour pelo app BlackBelt — visão do aluno',
    platform: 'youtube', content_type: 'video', planned_date: '2026-03-28', status: 'em_producao',
    published_url: null, target_persona: 'aluno', notes: 'Gravar screencast do fluxo principal do aluno.',
  },
  {
    id: 'ck-content-003', product: 'blackbelt', title: 'Blog: 5 funcionalidades que sua academia precisa em 2026',
    platform: 'blog', content_type: 'artigo', planned_date: '2026-04-01', status: 'rascunho',
    published_url: null, target_persona: 'admin', notes: 'SEO: gestão de academia, software artes marciais.',
  },
  {
    id: 'ck-content-004', product: 'blackbelt', title: 'Story: Bastidores do desenvolvimento — sprint review',
    platform: 'instagram', content_type: 'story', planned_date: '2026-03-30', status: 'planejado',
    published_url: null, target_persona: 'superadmin', notes: 'Mostrar métricas do sprint de forma visual.',
  },
  {
    id: 'ck-content-005', product: 'blackbelt', title: 'Thread: Como construímos o BlackBelt com custo quase zero',
    platform: 'twitter', content_type: 'thread', planned_date: '2026-04-03', status: 'planejado',
    published_url: null, target_persona: 'superadmin', notes: 'Falar sobre stack, custo operacional e IA.',
  },
];

const MOCK_CAMPAIGNS: CampaignItem[] = [
  {
    id: 'ck-camp-001', product: 'blackbelt', name: 'Beta Launch — Academias SP',
    channel: 'instagram_ads', budget_brl: 500, status: 'ativo',
    start_date: '2026-04-01', end_date: '2026-04-30', goal: 'Conquistar 5 academias beta em São Paulo',
    target_metric: 'leads', target_value: 30, actual_value: null, result: null, learnings: null,
  },
  {
    id: 'ck-camp-002', product: 'blackbelt', name: 'Referral — Indique uma Academia',
    channel: 'referral', budget_brl: 0, status: 'planejado',
    start_date: '2026-05-01', end_date: null, goal: 'Gerar indicações orgânicas via academias ativas',
    target_metric: 'sign_ups', target_value: 10, actual_value: null, result: null,
    learnings: null,
  },
];


function getMockTableRowCounts(): Array<{ table_name: string; row_count: number }> {
  return [
    { table_name: 'profiles', row_count: 52 },
    { table_name: 'academies', row_count: 3 },
    { table_name: 'attendance', row_count: 1240 },
    { table_name: 'turmas', row_count: 12 },
    { table_name: 'leads', row_count: 28 },
    { table_name: 'videos', row_count: 8 },
    { table_name: 'feature_backlog', row_count: 10 },
    { table_name: 'operational_costs', row_count: 5 },
    { table_name: 'architecture_decisions', row_count: 5 },
    { table_name: 'cockpit_sprints', row_count: 2 },
    { table_name: 'cockpit_feedback', row_count: 5 },
    { table_name: 'cockpit_personas', row_count: 8 },
    { table_name: 'deploy_log', row_count: 3 },
    { table_name: 'cockpit_error_log', row_count: 2 },
    { table_name: 'cockpit_content_calendar', row_count: 5 },
    { table_name: 'cockpit_campaigns', row_count: 2 },
    { table_name: 'daily_metrics', row_count: 30 },
  ];
}

// ---------------------------------------------------------------------------
// CEO functions
// ---------------------------------------------------------------------------

export async function getKpiSnapshot(product: string): Promise<KpiSnapshot> {
  try {
    if (isMock()) {
      return MOCK_KPI;
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const today = new Date().toISOString().slice(0, 10);
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

    const { data: todayMetrics } = await supabase
      .from('daily_metrics')
      .select('active_users, checkins, new_users, revenue_brl')
      .eq('product', product)
      .eq('date', today)
      .single();

    const { data: prevMetrics } = await supabase
      .from('daily_metrics')
      .select('active_users, checkins, new_users, revenue_brl')
      .eq('product', product)
      .eq('date', thirtyDaysAgo)
      .single();

    const { count: totalAcademies } = await supabase
      .from('academies')
      .select('id', { count: 'exact', head: true });

    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });

    const { count: activeUsers7d } = await supabase
      .from('attendance')
      .select('student_id', { count: 'exact', head: true })
      .gte('checked_at', sevenDaysAgo);

    const currentMrr = todayMetrics?.revenue_brl ?? 0;
    const prevMrr = prevMetrics?.revenue_brl ?? 0;

    return {
      totalAcademies: totalAcademies ?? 0,
      activeAcademies: totalAcademies ?? 0,
      trialAcademies: 0,
      totalUsers: totalUsers ?? 0,
      activeUsers7d: activeUsers7d ?? 0,
      mrr: currentMrr,
      churnRate: 0,
      avgCheckins: todayMetrics?.checkins ?? 0,
      npsScore: 0,
      deltaAcademies: 0,
      deltaUsers: todayMetrics?.new_users ?? 0,
      deltaMrr: currentMrr - prevMrr,
      deltaChurn: 0,
    };
  } catch (error) {
    logServiceError(error, 'cockpit');
    return MOCK_KPI;
  }
}

export async function getFeatureBacklog(
  product: string,
  filters?: { status?: string; pipeline_phase?: string },
): Promise<FeatureBacklogItem[]> {
  try {
    if (isMock()) {
      let items = MOCK_FEATURES.filter((f) => f.product === product);
      if (filters?.status) items = items.filter((f) => f.status === filters.status);
      if (filters?.pipeline_phase) items = items.filter((f) => f.pipeline_phase === filters.pipeline_phase);
      return items.sort((a, b) => b.rice_score - a.rice_score);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    let query = supabase
      .from('feature_backlog')
      .select('id, product, title, description, module, persona, job_to_be_done, success_criteria, rice_impact, rice_urgency, rice_effort, rice_score, pipeline_phase, status, priority_order, sprint_id, shipped_at, created_at, updated_at')
      .eq('product', product)
      .order('rice_score', { ascending: false });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.pipeline_phase) query = query.eq('pipeline_phase', filters.pipeline_phase);

    const { data, error } = await query;

    if (error || !data) {
      logServiceError(error, 'cockpit');
      return [];
    }

    return data as FeatureBacklogItem[];
  } catch (error) {
    logServiceError(error, 'cockpit');
    return [];
  }
}

export async function createFeature(data: Partial<FeatureBacklogItem>): Promise<FeatureBacklogItem | null> {
  try {
    if (isMock()) {
      const newFeature: FeatureBacklogItem = {
        id: `ck-feat-${Date.now()}`,
        product: data.product ?? 'blackbelt',
        title: data.title ?? '',
        description: data.description ?? null,
        module: data.module ?? null,
        persona: data.persona ?? null,
        job_to_be_done: data.job_to_be_done ?? null,
        success_criteria: data.success_criteria ?? null,
        rice_impact: data.rice_impact ?? 5,
        rice_urgency: data.rice_urgency ?? 5,
        rice_effort: data.rice_effort ?? 5,
        rice_score: data.rice_score ?? 5,
        pipeline_phase: data.pipeline_phase ?? 'backlog',
        status: data.status ?? 'backlog',
        priority_order: data.priority_order ?? 99,
        sprint_id: data.sprint_id ?? null,
        shipped_at: data.shipped_at ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return newFeature;
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: row, error } = await supabase
      .from('feature_backlog')
      .insert({
        product: data.product ?? 'blackbelt',
        title: data.title,
        description: data.description ?? null,
        module: data.module ?? null,
        persona: data.persona ?? null,
        job_to_be_done: data.job_to_be_done ?? null,
        success_criteria: data.success_criteria ?? null,
        rice_impact: data.rice_impact ?? 5,
        rice_urgency: data.rice_urgency ?? 5,
        rice_effort: data.rice_effort ?? 5,
        rice_score: data.rice_score ?? 5,
        pipeline_phase: data.pipeline_phase ?? 'backlog',
        status: data.status ?? 'backlog',
        priority_order: data.priority_order ?? 99,
        sprint_id: data.sprint_id ?? null,
        shipped_at: data.shipped_at ?? null,
      })
      .select('id, product, title, description, module, persona, job_to_be_done, success_criteria, rice_impact, rice_urgency, rice_effort, rice_score, pipeline_phase, status, priority_order, sprint_id, shipped_at, created_at, updated_at')
      .single();

    if (error || !row) {
      logServiceError(error, 'cockpit');
      return null;
    }

    return row as FeatureBacklogItem;
  } catch (error) {
    logServiceError(error, 'cockpit');
    return null;
  }
}

export async function updateFeature(id: string, data: Partial<FeatureBacklogItem>): Promise<FeatureBacklogItem | null> {
  try {
    if (isMock()) {
      const existing = MOCK_FEATURES.find((f) => f.id === id);
      if (!existing) return null;
      return { ...existing, ...data, updated_at: new Date().toISOString() };
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const updatePayload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.module !== undefined) updatePayload.module = data.module;
    if (data.persona !== undefined) updatePayload.persona = data.persona;
    if (data.job_to_be_done !== undefined) updatePayload.job_to_be_done = data.job_to_be_done;
    if (data.success_criteria !== undefined) updatePayload.success_criteria = data.success_criteria;
    if (data.rice_impact !== undefined) updatePayload.rice_impact = data.rice_impact;
    if (data.rice_urgency !== undefined) updatePayload.rice_urgency = data.rice_urgency;
    if (data.rice_effort !== undefined) updatePayload.rice_effort = data.rice_effort;
    if (data.rice_score !== undefined) updatePayload.rice_score = data.rice_score;
    if (data.pipeline_phase !== undefined) updatePayload.pipeline_phase = data.pipeline_phase;
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.priority_order !== undefined) updatePayload.priority_order = data.priority_order;
    if (data.sprint_id !== undefined) updatePayload.sprint_id = data.sprint_id;
    if (data.shipped_at !== undefined) updatePayload.shipped_at = data.shipped_at;

    const { data: row, error } = await supabase
      .from('feature_backlog')
      .update(updatePayload)
      .eq('id', id)
      .select('id, product, title, description, module, persona, job_to_be_done, success_criteria, rice_impact, rice_urgency, rice_effort, rice_score, pipeline_phase, status, priority_order, sprint_id, shipped_at, created_at, updated_at')
      .single();

    if (error || !row) {
      logServiceError(error, 'cockpit');
      return null;
    }

    return row as FeatureBacklogItem;
  } catch (error) {
    logServiceError(error, 'cockpit');
    return null;
  }
}

export async function deleteFeature(id: string): Promise<boolean> {
  try {
    if (isMock()) {
      return MOCK_FEATURES.some((f) => f.id === id);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('feature_backlog')
      .delete()
      .eq('id', id);

    if (error) {
      logServiceError(error, 'cockpit');
      return false;
    }

    return true;
  } catch (error) {
    logServiceError(error, 'cockpit');
    return false;
  }
}

export async function moveFeatureStatus(id: string, newStatus: string): Promise<boolean> {
  try {
    if (isMock()) {
      return MOCK_FEATURES.some((f) => f.id === id);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('feature_backlog')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      logServiceError(error, 'cockpit');
      return false;
    }

    return true;
  } catch (error) {
    logServiceError(error, 'cockpit');
    return false;
  }
}

export async function getOperationalCosts(product: string): Promise<OperationalCost[]> {
  try {
    if (isMock()) {
      return MOCK_COSTS.filter((c) => c.product === product);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('operational_costs')
      .select('id, product, category, name, description, amount_brl, frequency, active, start_date, end_date')
      .eq('product', product)
      .eq('active', true)
      .order('amount_brl', { ascending: false });

    if (error || !data) {
      logServiceError(error, 'cockpit');
      return [];
    }

    return data as OperationalCost[];
  } catch (error) {
    logServiceError(error, 'cockpit');
    return [];
  }
}

export async function createCost(data: Partial<OperationalCost>): Promise<OperationalCost | null> {
  try {
    if (isMock()) {
      const newCost: OperationalCost = {
        id: `ck-cost-${Date.now()}`,
        product: data.product ?? 'blackbelt',
        category: data.category ?? 'other',
        name: data.name ?? '',
        description: data.description ?? null,
        amount_brl: data.amount_brl ?? 0,
        frequency: data.frequency ?? 'monthly',
        active: data.active ?? true,
        start_date: data.start_date ?? null,
        end_date: data.end_date ?? null,
      };
      return newCost;
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: row, error } = await supabase
      .from('operational_costs')
      .insert({
        product: data.product ?? 'blackbelt',
        category: data.category ?? 'other',
        name: data.name,
        description: data.description ?? null,
        amount_brl: data.amount_brl ?? 0,
        frequency: data.frequency ?? 'monthly',
        active: data.active ?? true,
        start_date: data.start_date ?? null,
        end_date: data.end_date ?? null,
      })
      .select('id, product, category, name, description, amount_brl, frequency, active, start_date, end_date')
      .single();

    if (error || !row) {
      logServiceError(error, 'cockpit');
      return null;
    }

    return row as OperationalCost;
  } catch (error) {
    logServiceError(error, 'cockpit');
    return null;
  }
}

export async function updateCost(id: string, data: Partial<OperationalCost>): Promise<OperationalCost | null> {
  try {
    if (isMock()) {
      const existing = MOCK_COSTS.find((c) => c.id === id);
      if (!existing) return null;
      return { ...existing, ...data };
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const updatePayload: Record<string, unknown> = {};
    if (data.category !== undefined) updatePayload.category = data.category;
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.amount_brl !== undefined) updatePayload.amount_brl = data.amount_brl;
    if (data.frequency !== undefined) updatePayload.frequency = data.frequency;
    if (data.active !== undefined) updatePayload.active = data.active;
    if (data.start_date !== undefined) updatePayload.start_date = data.start_date;
    if (data.end_date !== undefined) updatePayload.end_date = data.end_date;

    const { data: row, error } = await supabase
      .from('operational_costs')
      .update(updatePayload)
      .eq('id', id)
      .select('id, product, category, name, description, amount_brl, frequency, active, start_date, end_date')
      .single();

    if (error || !row) {
      logServiceError(error, 'cockpit');
      return null;
    }

    return row as OperationalCost;
  } catch (error) {
    logServiceError(error, 'cockpit');
    return null;
  }
}

export async function deleteCost(id: string): Promise<boolean> {
  try {
    if (isMock()) {
      return MOCK_COSTS.some((c) => c.id === id);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('operational_costs')
      .delete()
      .eq('id', id);

    if (error) {
      logServiceError(error, 'cockpit');
      return false;
    }

    return true;
  } catch (error) {
    logServiceError(error, 'cockpit');
    return false;
  }
}

export async function getTotalMonthlyCost(product: string): Promise<number> {
  try {
    if (isMock()) {
      const costs = MOCK_COSTS.filter((c) => c.product === product && c.active);
      let total = 0;
      for (const c of costs) {
        if (c.frequency === 'monthly') total += c.amount_brl;
        else if (c.frequency === 'yearly') total += c.amount_brl / 12;
        else if (c.frequency === 'usage_based') total += c.amount_brl;
      }
      return Math.round(total * 100) / 100;
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('operational_costs')
      .select('amount_brl, frequency')
      .eq('product', product)
      .eq('active', true);

    if (error || !data) {
      logServiceError(error, 'cockpit');
      return 0;
    }

    let total = 0;
    for (const row of data) {
      const amount = (row as { amount_brl: number; frequency: string }).amount_brl;
      const freq = (row as { amount_brl: number; frequency: string }).frequency;
      if (freq === 'monthly') total += amount;
      else if (freq === 'yearly') total += amount / 12;
      else if (freq === 'usage_based') total += amount;
    }

    return Math.round(total * 100) / 100;
  } catch (error) {
    logServiceError(error, 'cockpit');
    return 0;
  }
}

export async function getArchitectureDecisions(product: string): Promise<ArchitectureDecision[]> {
  try {
    if (isMock()) {
      return MOCK_ADRS.filter((a) => a.product === product);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('architecture_decisions')
      .select('id, product, adr_number, title, status, context, options_considered, decision, consequences, created_at')
      .eq('product', product)
      .order('adr_number', { ascending: true });

    if (error || !data) {
      logServiceError(error, 'cockpit');
      return [];
    }

    return data as ArchitectureDecision[];
  } catch (error) {
    logServiceError(error, 'cockpit');
    return [];
  }
}

export async function createADR(data: Partial<ArchitectureDecision>): Promise<ArchitectureDecision | null> {
  try {
    if (isMock()) {
      const newADR: ArchitectureDecision = {
        id: `ck-adr-${Date.now()}`,
        product: data.product ?? 'blackbelt',
        adr_number: data.adr_number ?? MOCK_ADRS.length + 1,
        title: data.title ?? '',
        status: data.status ?? 'proposed',
        context: data.context ?? null,
        options_considered: data.options_considered ?? [],
        decision: data.decision ?? null,
        consequences: data.consequences ?? null,
        created_at: new Date().toISOString(),
      };
      return newADR;
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: row, error } = await supabase
      .from('architecture_decisions')
      .insert({
        product: data.product ?? 'blackbelt',
        adr_number: data.adr_number,
        title: data.title,
        status: data.status ?? 'proposed',
        context: data.context ?? null,
        options_considered: data.options_considered ?? [],
        decision: data.decision ?? null,
        consequences: data.consequences ?? null,
      })
      .select('id, product, adr_number, title, status, context, options_considered, decision, consequences, created_at')
      .single();

    if (error || !row) {
      logServiceError(error, 'cockpit');
      return null;
    }

    return row as ArchitectureDecision;
  } catch (error) {
    logServiceError(error, 'cockpit');
    return null;
  }
}

export async function updateADR(id: string, data: Partial<ArchitectureDecision>): Promise<ArchitectureDecision | null> {
  try {
    if (isMock()) {
      const existing = MOCK_ADRS.find((a) => a.id === id);
      if (!existing) return null;
      return { ...existing, ...data };
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const updatePayload: Record<string, unknown> = {};
    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.context !== undefined) updatePayload.context = data.context;
    if (data.options_considered !== undefined) updatePayload.options_considered = data.options_considered;
    if (data.decision !== undefined) updatePayload.decision = data.decision;
    if (data.consequences !== undefined) updatePayload.consequences = data.consequences;

    const { data: row, error } = await supabase
      .from('architecture_decisions')
      .update(updatePayload)
      .eq('id', id)
      .select('id, product, adr_number, title, status, context, options_considered, decision, consequences, created_at')
      .single();

    if (error || !row) {
      logServiceError(error, 'cockpit');
      return null;
    }

    return row as ArchitectureDecision;
  } catch (error) {
    logServiceError(error, 'cockpit');
    return null;
  }
}

// ---------------------------------------------------------------------------
// CPO functions
// ---------------------------------------------------------------------------

export async function getCurrentSprint(product: string): Promise<Sprint | null> {
  try {
    if (isMock()) {
      const today = new Date().toISOString().slice(0, 10);
      return MOCK_SPRINTS.find(
        (s) => s.product === product && s.week_start <= today && s.week_end >= today,
      ) ?? null;
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const today = new Date().toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from('cockpit_sprints')
      .select('id, product, week_start, week_end, goals, velocity, prompts_executed, notes, retrospective')
      .eq('product', product)
      .lte('week_start', today)
      .gte('week_end', today)
      .single();

    if (error || !data) {
      logServiceError(error, 'cockpit');
      return null;
    }

    return data as Sprint;
  } catch (error) {
    logServiceError(error, 'cockpit');
    return null;
  }
}

export async function getSprints(product: string, limit?: number): Promise<Sprint[]> {
  try {
    if (isMock()) {
      const items = MOCK_SPRINTS.filter((s) => s.product === product);
      return limit ? items.slice(0, limit) : items;
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    let query = supabase
      .from('cockpit_sprints')
      .select('id, product, week_start, week_end, goals, velocity, prompts_executed, notes, retrospective')
      .eq('product', product)
      .order('week_start', { ascending: false });

    if (limit) query = query.limit(limit);

    const { data, error } = await query;

    if (error || !data) {
      logServiceError(error, 'cockpit');
      return [];
    }

    return data as Sprint[];
  } catch (error) {
    logServiceError(error, 'cockpit');
    return [];
  }
}

export async function createSprint(data: Partial<Sprint>): Promise<Sprint | null> {
  try {
    if (isMock()) {
      const newSprint: Sprint = {
        id: `ck-sprint-${Date.now()}`,
        product: data.product ?? 'blackbelt',
        week_start: data.week_start ?? new Date().toISOString().slice(0, 10),
        week_end: data.week_end ?? new Date().toISOString().slice(0, 10),
        goals: data.goals ?? [],
        velocity: data.velocity ?? 0,
        prompts_executed: data.prompts_executed ?? 0,
        notes: data.notes ?? null,
        retrospective: data.retrospective ?? null,
      };
      return newSprint;
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: row, error } = await supabase
      .from('cockpit_sprints')
      .insert({
        product: data.product ?? 'blackbelt',
        week_start: data.week_start,
        week_end: data.week_end,
        goals: data.goals ?? [],
        velocity: data.velocity ?? 0,
        prompts_executed: data.prompts_executed ?? 0,
        notes: data.notes ?? null,
        retrospective: data.retrospective ?? null,
      })
      .select('id, product, week_start, week_end, goals, velocity, prompts_executed, notes, retrospective')
      .single();

    if (error || !row) {
      logServiceError(error, 'cockpit');
      return null;
    }

    return row as Sprint;
  } catch (error) {
    logServiceError(error, 'cockpit');
    return null;
  }
}

export async function updateSprint(id: string, data: Partial<Sprint>): Promise<Sprint | null> {
  try {
    if (isMock()) {
      const existing = MOCK_SPRINTS.find((s) => s.id === id);
      if (!existing) return null;
      return { ...existing, ...data };
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const updatePayload: Record<string, unknown> = {};
    if (data.week_start !== undefined) updatePayload.week_start = data.week_start;
    if (data.week_end !== undefined) updatePayload.week_end = data.week_end;
    if (data.goals !== undefined) updatePayload.goals = data.goals;
    if (data.velocity !== undefined) updatePayload.velocity = data.velocity;
    if (data.prompts_executed !== undefined) updatePayload.prompts_executed = data.prompts_executed;
    if (data.notes !== undefined) updatePayload.notes = data.notes;
    if (data.retrospective !== undefined) updatePayload.retrospective = data.retrospective;

    const { data: row, error } = await supabase
      .from('cockpit_sprints')
      .update(updatePayload)
      .eq('id', id)
      .select('id, product, week_start, week_end, goals, velocity, prompts_executed, notes, retrospective')
      .single();

    if (error || !row) {
      logServiceError(error, 'cockpit');
      return null;
    }

    return row as Sprint;
  } catch (error) {
    logServiceError(error, 'cockpit');
    return null;
  }
}

export async function getUserFeedback(product: string, status?: string): Promise<UserFeedbackItem[]> {
  try {
    if (isMock()) {
      let items = MOCK_FEEDBACK.filter((f) => f.product === product);
      if (status) items = items.filter((f) => f.status === status);
      return items.sort((a, b) => b.created_at.localeCompare(a.created_at));
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    let query = supabase
      .from('cockpit_feedback')
      .select('id, product, user_name, user_email, user_role, academy_name, category, message, rating, status, converted_to, internal_notes, created_at')
      .eq('product', product)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;

    if (error || !data) {
      logServiceError(error, 'cockpit');
      return [];
    }

    return data as UserFeedbackItem[];
  } catch (error) {
    logServiceError(error, 'cockpit');
    return [];
  }
}

export async function updateFeedbackStatus(id: string, status: string, notes?: string): Promise<boolean> {
  try {
    if (isMock()) {
      return MOCK_FEEDBACK.some((f) => f.id === id);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const updatePayload: Record<string, unknown> = { status };
    if (notes !== undefined) updatePayload.internal_notes = notes;

    const { error } = await supabase
      .from('cockpit_feedback')
      .update(updatePayload)
      .eq('id', id);

    if (error) {
      logServiceError(error, 'cockpit');
      return false;
    }

    return true;
  } catch (error) {
    logServiceError(error, 'cockpit');
    return false;
  }
}

export async function convertFeedbackToFeature(feedbackId: string, featureTitle: string): Promise<string | null> {
  try {
    if (isMock()) {
      const fb = MOCK_FEEDBACK.find((f) => f.id === feedbackId);
      if (!fb) return null;
      const newId = `ck-feat-${Date.now()}`;
      return newId;
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: fb, error: fbError } = await supabase
      .from('cockpit_feedback')
      .select('id, product, message, category')
      .eq('id', feedbackId)
      .single();

    if (fbError || !fb) {
      logServiceError(fbError, 'cockpit');
      return null;
    }

    const feedbackRow = fb as { id: string; product: string; message: string; category: string };

    const { data: feature, error: featureError } = await supabase
      .from('feature_backlog')
      .insert({
        product: feedbackRow.product,
        title: featureTitle,
        description: feedbackRow.message,
        pipeline_phase: 'backlog',
        status: 'backlog',
        rice_impact: 5,
        rice_urgency: 5,
        rice_effort: 5,
        rice_score: 5,
        priority_order: 99,
      })
      .select('id')
      .single();

    if (featureError || !feature) {
      logServiceError(featureError, 'cockpit');
      return null;
    }

    const featureRow = feature as { id: string };

    const { error: updateError } = await supabase
      .from('cockpit_feedback')
      .update({ status: 'convertido', converted_to: featureRow.id })
      .eq('id', feedbackId);

    if (updateError) {
      logServiceError(updateError, 'cockpit');
    }

    return featureRow.id;
  } catch (error) {
    logServiceError(error, 'cockpit');
    return null;
  }
}

export async function submitPublicFeedback(data: {
  product?: string;
  user_id?: string;
  user_name?: string;
  user_email?: string;
  user_role?: string;
  academy_name?: string;
  category: string;
  message: string;
  rating?: number;
}): Promise<boolean> {
  try {
    if (isMock()) {
      return true;
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('cockpit_feedback')
      .insert({
        product: data.product ?? 'blackbelt',
        user_name: data.user_name ?? null,
        user_email: data.user_email ?? null,
        user_role: data.user_role ?? null,
        academy_name: data.academy_name ?? null,
        category: data.category,
        message: data.message,
        rating: data.rating ?? null,
        status: 'novo',
      });

    if (error) {
      logServiceError(error, 'cockpit');
      return false;
    }

    return true;
  } catch (error) {
    logServiceError(error, 'cockpit');
    return false;
  }
}

export async function getPersonas(product: string): Promise<PersonaItem[]> {
  try {
    if (isMock()) {
      void product;
      return MOCK_PERSONAS;
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('cockpit_personas')
      .select('id, name, role_in_app, description, pains, jobs_to_be_done, key_features, feature_completion_pct')
      .eq('product', product)
      .order('name', { ascending: true });

    if (error || !data) {
      logServiceError(error, 'cockpit');
      return [];
    }

    return data as PersonaItem[];
  } catch (error) {
    logServiceError(error, 'cockpit');
    return [];
  }
}

export async function updatePersona(id: string, data: Partial<PersonaItem>): Promise<PersonaItem | null> {
  try {
    if (isMock()) {
      const existing = MOCK_PERSONAS.find((p) => p.id === id);
      if (!existing) return null;
      return { ...existing, ...data };
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const updatePayload: Record<string, unknown> = {};
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.role_in_app !== undefined) updatePayload.role_in_app = data.role_in_app;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.pains !== undefined) updatePayload.pains = data.pains;
    if (data.jobs_to_be_done !== undefined) updatePayload.jobs_to_be_done = data.jobs_to_be_done;
    if (data.key_features !== undefined) updatePayload.key_features = data.key_features;
    if (data.feature_completion_pct !== undefined) updatePayload.feature_completion_pct = data.feature_completion_pct;

    const { data: row, error } = await supabase
      .from('cockpit_personas')
      .update(updatePayload)
      .eq('id', id)
      .select('id, name, role_in_app, description, pains, jobs_to_be_done, key_features, feature_completion_pct')
      .single();

    if (error || !row) {
      logServiceError(error, 'cockpit');
      return null;
    }

    return row as PersonaItem;
  } catch (error) {
    logServiceError(error, 'cockpit');
    return null;
  }
}

export async function getFeedbackCount(product: string, status: string): Promise<number> {
  try {
    if (isMock()) {
      return MOCK_FEEDBACK.filter((f) => f.product === product && f.status === status).length;
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { count, error } = await supabase
      .from('cockpit_feedback')
      .select('id', { count: 'exact', head: true })
      .eq('product', product)
      .eq('status', status);

    if (error) {
      logServiceError(error, 'cockpit');
      return 0;
    }

    return count ?? 0;
  } catch (error) {
    logServiceError(error, 'cockpit');
    return 0;
  }
}

// ---------------------------------------------------------------------------
// CTO functions
// ---------------------------------------------------------------------------

export async function getDeployLog(product: string, limit?: number): Promise<DeployLogItem[]> {
  try {
    if (isMock()) {
      const items = MOCK_DEPLOYS.filter((d) => d.product === product);
      return limit ? items.slice(0, limit) : items;
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    let query = supabase
      .from('deploy_log')
      .select('id, product, commit_sha, commit_message, branch, tag, status, duration_seconds, files_changed, lines_added, lines_removed, vercel_url, deployed_at')
      .eq('product', product)
      .order('deployed_at', { ascending: false });

    if (limit) query = query.limit(limit);

    const { data, error } = await query;

    if (error || !data) {
      logServiceError(error, 'cockpit');
      return [];
    }

    return data as DeployLogItem[];
  } catch (error) {
    logServiceError(error, 'cockpit');
    return [];
  }
}

export async function createDeployEntry(data: Partial<DeployLogItem>): Promise<DeployLogItem | null> {
  try {
    if (isMock()) {
      const newDeploy: DeployLogItem = {
        id: `ck-deploy-${Date.now()}`,
        product: data.product ?? 'blackbelt',
        commit_sha: data.commit_sha ?? null,
        commit_message: data.commit_message ?? null,
        branch: data.branch ?? 'main',
        tag: data.tag ?? null,
        status: data.status ?? 'success',
        duration_seconds: data.duration_seconds ?? null,
        files_changed: data.files_changed ?? null,
        lines_added: data.lines_added ?? null,
        lines_removed: data.lines_removed ?? null,
        vercel_url: data.vercel_url ?? null,
        deployed_at: data.deployed_at ?? new Date().toISOString(),
      };
      return newDeploy;
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: row, error } = await supabase
      .from('deploy_log')
      .insert({
        product: data.product ?? 'blackbelt',
        commit_sha: data.commit_sha ?? null,
        commit_message: data.commit_message ?? null,
        branch: data.branch ?? 'main',
        tag: data.tag ?? null,
        status: data.status ?? 'success',
        duration_seconds: data.duration_seconds ?? null,
        files_changed: data.files_changed ?? null,
        lines_added: data.lines_added ?? null,
        lines_removed: data.lines_removed ?? null,
        vercel_url: data.vercel_url ?? null,
        deployed_at: data.deployed_at ?? new Date().toISOString(),
      })
      .select('id, product, commit_sha, commit_message, branch, tag, status, duration_seconds, files_changed, lines_added, lines_removed, vercel_url, deployed_at')
      .single();

    if (error || !row) {
      logServiceError(error, 'cockpit');
      return null;
    }

    return row as DeployLogItem;
  } catch (error) {
    logServiceError(error, 'cockpit');
    return null;
  }
}

export async function getErrorLog(product: string, status?: string): Promise<ErrorLogItem[]> {
  try {
    if (isMock()) {
      let items = MOCK_ERRORS.filter((e) => e.product === product);
      if (status) items = items.filter((e) => e.status === status);
      return items.sort((a, b) => b.last_seen.localeCompare(a.last_seen));
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    let query = supabase
      .from('cockpit_error_log')
      .select('id, product, error_type, severity, message, affected_route, frequency, status, first_seen, last_seen, resolution')
      .eq('product', product)
      .order('last_seen', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;

    if (error || !data) {
      logServiceError(error, 'cockpit');
      return [];
    }

    return data as ErrorLogItem[];
  } catch (error) {
    logServiceError(error, 'cockpit');
    return [];
  }
}

export async function createError(data: Partial<ErrorLogItem>): Promise<ErrorLogItem | null> {
  try {
    if (isMock()) {
      const newError: ErrorLogItem = {
        id: `ck-err-${Date.now()}`,
        product: data.product ?? 'blackbelt',
        error_type: data.error_type ?? null,
        severity: data.severity ?? 'medium',
        message: data.message ?? '',
        affected_route: data.affected_route ?? null,
        frequency: data.frequency ?? 1,
        status: data.status ?? 'novo',
        first_seen: data.first_seen ?? new Date().toISOString(),
        last_seen: data.last_seen ?? new Date().toISOString(),
        resolution: data.resolution ?? null,
      };
      return newError;
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const now = new Date().toISOString();

    const { data: row, error } = await supabase
      .from('cockpit_error_log')
      .insert({
        product: data.product ?? 'blackbelt',
        error_type: data.error_type ?? null,
        severity: data.severity ?? 'medium',
        message: data.message,
        affected_route: data.affected_route ?? null,
        frequency: data.frequency ?? 1,
        status: data.status ?? 'novo',
        first_seen: data.first_seen ?? now,
        last_seen: data.last_seen ?? now,
        resolution: data.resolution ?? null,
      })
      .select('id, product, error_type, severity, message, affected_route, frequency, status, first_seen, last_seen, resolution')
      .single();

    if (error || !row) {
      logServiceError(error, 'cockpit');
      return null;
    }

    return row as ErrorLogItem;
  } catch (error) {
    logServiceError(error, 'cockpit');
    return null;
  }
}

export async function updateErrorStatus(id: string, status: string, resolution?: string): Promise<boolean> {
  try {
    if (isMock()) {
      return MOCK_ERRORS.some((e) => e.id === id);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const updatePayload: Record<string, unknown> = { status };
    if (resolution !== undefined) updatePayload.resolution = resolution;

    const { error } = await supabase
      .from('cockpit_error_log')
      .update(updatePayload)
      .eq('id', id);

    if (error) {
      logServiceError(error, 'cockpit');
      return false;
    }

    return true;
  } catch (error) {
    logServiceError(error, 'cockpit');
    return false;
  }
}

export async function getTableRowCounts(): Promise<Array<{ table_name: string; row_count: number }>> {
  try {
    if (isMock()) {
      return getMockTableRowCounts();
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .rpc('get_table_row_counts');

    if (error || !data) {
      logServiceError(error, 'cockpit');
      return [];
    }

    return data as Array<{ table_name: string; row_count: number }>;
  } catch (error) {
    logServiceError(error, 'cockpit');
    return [];
  }
}

// ---------------------------------------------------------------------------
// Growth functions
// ---------------------------------------------------------------------------

export async function getContentCalendar(product: string, month?: number, year?: number): Promise<ContentCalendarItem[]> {
  try {
    if (isMock()) {
      let items = MOCK_CONTENT.filter((c) => c.product === product);
      if (month !== undefined && year !== undefined) {
        items = items.filter((c) => {
          if (!c.planned_date) return false;
          const d = new Date(c.planned_date);
          return d.getMonth() + 1 === month && d.getFullYear() === year;
        });
      }
      return items;
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    let query = supabase
      .from('cockpit_content_calendar')
      .select('id, product, title, platform, content_type, planned_date, status, published_url, target_persona, notes')
      .eq('product', product)
      .order('planned_date', { ascending: true });

    if (month !== undefined && year !== undefined) {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endMonth = month === 12 ? 1 : month + 1;
      const endYear = month === 12 ? year + 1 : year;
      const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;
      query = query.gte('planned_date', startDate).lt('planned_date', endDate);
    }

    const { data, error } = await query;

    if (error || !data) {
      logServiceError(error, 'cockpit');
      return [];
    }

    return data as ContentCalendarItem[];
  } catch (error) {
    logServiceError(error, 'cockpit');
    return [];
  }
}

export async function createContent(data: Partial<ContentCalendarItem>): Promise<ContentCalendarItem | null> {
  try {
    if (isMock()) {
      const newContent: ContentCalendarItem = {
        id: `ck-content-${Date.now()}`,
        product: data.product ?? 'blackbelt',
        title: data.title ?? '',
        platform: data.platform ?? 'blog',
        content_type: data.content_type ?? null,
        planned_date: data.planned_date ?? null,
        status: data.status ?? 'planejado',
        published_url: data.published_url ?? null,
        target_persona: data.target_persona ?? null,
        notes: data.notes ?? null,
      };
      return newContent;
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: row, error } = await supabase
      .from('cockpit_content_calendar')
      .insert({
        product: data.product ?? 'blackbelt',
        title: data.title,
        platform: data.platform ?? 'blog',
        content_type: data.content_type ?? null,
        planned_date: data.planned_date ?? null,
        status: data.status ?? 'planejado',
        published_url: data.published_url ?? null,
        target_persona: data.target_persona ?? null,
        notes: data.notes ?? null,
      })
      .select('id, product, title, platform, content_type, planned_date, status, published_url, target_persona, notes')
      .single();

    if (error || !row) {
      logServiceError(error, 'cockpit');
      return null;
    }

    return row as ContentCalendarItem;
  } catch (error) {
    logServiceError(error, 'cockpit');
    return null;
  }
}

export async function updateContent(id: string, data: Partial<ContentCalendarItem>): Promise<ContentCalendarItem | null> {
  try {
    if (isMock()) {
      const existing = MOCK_CONTENT.find((c) => c.id === id);
      if (!existing) return null;
      return { ...existing, ...data };
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const updatePayload: Record<string, unknown> = {};
    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.platform !== undefined) updatePayload.platform = data.platform;
    if (data.content_type !== undefined) updatePayload.content_type = data.content_type;
    if (data.planned_date !== undefined) updatePayload.planned_date = data.planned_date;
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.published_url !== undefined) updatePayload.published_url = data.published_url;
    if (data.target_persona !== undefined) updatePayload.target_persona = data.target_persona;
    if (data.notes !== undefined) updatePayload.notes = data.notes;

    const { data: row, error } = await supabase
      .from('cockpit_content_calendar')
      .update(updatePayload)
      .eq('id', id)
      .select('id, product, title, platform, content_type, planned_date, status, published_url, target_persona, notes')
      .single();

    if (error || !row) {
      logServiceError(error, 'cockpit');
      return null;
    }

    return row as ContentCalendarItem;
  } catch (error) {
    logServiceError(error, 'cockpit');
    return null;
  }
}

export async function deleteContent(id: string): Promise<boolean> {
  try {
    if (isMock()) {
      return MOCK_CONTENT.some((c) => c.id === id);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('cockpit_content_calendar')
      .delete()
      .eq('id', id);

    if (error) {
      logServiceError(error, 'cockpit');
      return false;
    }

    return true;
  } catch (error) {
    logServiceError(error, 'cockpit');
    return false;
  }
}

export async function getCampaigns(product: string, status?: string): Promise<CampaignItem[]> {
  try {
    if (isMock()) {
      let items = MOCK_CAMPAIGNS.filter((c) => c.product === product);
      if (status) items = items.filter((c) => c.status === status);
      return items;
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    let query = supabase
      .from('cockpit_campaigns')
      .select('id, product, name, channel, budget_brl, status, start_date, end_date, goal, target_metric, target_value, actual_value, result, learnings')
      .eq('product', product)
      .order('start_date', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;

    if (error || !data) {
      logServiceError(error, 'cockpit');
      return [];
    }

    return data as CampaignItem[];
  } catch (error) {
    logServiceError(error, 'cockpit');
    return [];
  }
}

export async function createCampaign(data: Partial<CampaignItem>): Promise<CampaignItem | null> {
  try {
    if (isMock()) {
      const newCampaign: CampaignItem = {
        id: `ck-camp-${Date.now()}`,
        product: data.product ?? 'blackbelt',
        name: data.name ?? '',
        channel: data.channel ?? null,
        budget_brl: data.budget_brl ?? 0,
        status: data.status ?? 'planejado',
        start_date: data.start_date ?? null,
        end_date: data.end_date ?? null,
        goal: data.goal ?? null,
        target_metric: data.target_metric ?? null,
        target_value: data.target_value ?? null,
        actual_value: data.actual_value ?? null,
        result: data.result ?? null,
        learnings: data.learnings ?? null,
      };
      return newCampaign;
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: row, error } = await supabase
      .from('cockpit_campaigns')
      .insert({
        product: data.product ?? 'blackbelt',
        name: data.name,
        channel: data.channel ?? null,
        budget_brl: data.budget_brl ?? 0,
        status: data.status ?? 'planejado',
        start_date: data.start_date ?? null,
        end_date: data.end_date ?? null,
        goal: data.goal ?? null,
        target_metric: data.target_metric ?? null,
        target_value: data.target_value ?? null,
        actual_value: data.actual_value ?? null,
        result: data.result ?? null,
        learnings: data.learnings ?? null,
      })
      .select('id, product, name, channel, budget_brl, status, start_date, end_date, goal, target_metric, target_value, actual_value, result, learnings')
      .single();

    if (error || !row) {
      logServiceError(error, 'cockpit');
      return null;
    }

    return row as CampaignItem;
  } catch (error) {
    logServiceError(error, 'cockpit');
    return null;
  }
}

export async function updateCampaign(id: string, data: Partial<CampaignItem>): Promise<CampaignItem | null> {
  try {
    if (isMock()) {
      const existing = MOCK_CAMPAIGNS.find((c) => c.id === id);
      if (!existing) return null;
      return { ...existing, ...data };
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const updatePayload: Record<string, unknown> = {};
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.channel !== undefined) updatePayload.channel = data.channel;
    if (data.budget_brl !== undefined) updatePayload.budget_brl = data.budget_brl;
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.start_date !== undefined) updatePayload.start_date = data.start_date;
    if (data.end_date !== undefined) updatePayload.end_date = data.end_date;
    if (data.goal !== undefined) updatePayload.goal = data.goal;
    if (data.target_metric !== undefined) updatePayload.target_metric = data.target_metric;
    if (data.target_value !== undefined) updatePayload.target_value = data.target_value;
    if (data.actual_value !== undefined) updatePayload.actual_value = data.actual_value;
    if (data.result !== undefined) updatePayload.result = data.result;
    if (data.learnings !== undefined) updatePayload.learnings = data.learnings;

    const { data: row, error } = await supabase
      .from('cockpit_campaigns')
      .update(updatePayload)
      .eq('id', id)
      .select('id, product, name, channel, budget_brl, status, start_date, end_date, goal, target_metric, target_value, actual_value, result, learnings')
      .single();

    if (error || !row) {
      logServiceError(error, 'cockpit');
      return null;
    }

    return row as CampaignItem;
  } catch (error) {
    logServiceError(error, 'cockpit');
    return null;
  }
}

// ---------------------------------------------------------------------------
// Snapshot
// ---------------------------------------------------------------------------

export async function generateDailySnapshot(product: string): Promise<boolean> {
  try {
    if (isMock()) {
      void product;
      return true;
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const today = new Date().toISOString().slice(0, 10);

    const { count: activeUsers } = await supabase
      .from('attendance')
      .select('student_id', { count: 'exact', head: true })
      .gte('checked_at', today);

    const { count: checkins } = await supabase
      .from('attendance')
      .select('id', { count: 'exact', head: true })
      .gte('checked_at', today);

    const { count: newUsers } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', today);

    const { error } = await supabase
      .from('daily_metrics')
      .upsert({
        product,
        date: today,
        active_users: activeUsers ?? 0,
        checkins: checkins ?? 0,
        new_users: newUsers ?? 0,
        revenue_brl: 0,
      }, { onConflict: 'product,date' });

    if (error) {
      logServiceError(error, 'cockpit');
      return false;
    }

    return true;
  } catch (error) {
    logServiceError(error, 'cockpit');
    return false;
  }
}
