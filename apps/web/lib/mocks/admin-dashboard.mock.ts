import type { DashboardData, ActivityFeedItem } from '@/lib/types/admin-dashboard';

// ── Motivation quotes ──────────────────────────────────────────────

const QUOTES = [
  'Um faixa preta é um faixa branca que nunca desistiu.',
  'O tatame ensina o que a vida cobra.',
  'Disciplina é a ponte entre metas e conquistas.',
  'A arte suave vence a força bruta.',
  'Quem treina junto, cresce junto.',
];

function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}

// ── Activity feed items ────────────────────────────────────────────

const ACTIVITY_FEED: ActivityFeedItem[] = [
  {
    id: 'af-1',
    type: 'check_in',
    message: 'João Pedro fez check-in na aula BJJ Avançado',
    actor_name: 'João Pedro',
    timestamp: '5min',
    icon: 'checkin',
    accent_color: '#22C55E',
  },
  {
    id: 'af-2',
    type: 'signup',
    message: 'Marina Silva se cadastrou como aluna',
    actor_name: 'Marina Silva',
    timestamp: '1h',
    icon: 'signup',
    accent_color: '#3B82F6',
  },
  {
    id: 'af-3',
    type: 'belt_promotion',
    message: 'Rafael completou requisitos para faixa roxa!',
    actor_name: 'Rafael',
    timestamp: '2h',
    icon: 'belt',
    accent_color: '#A855F7',
  },
  {
    id: 'af-4',
    type: 'payment',
    message: 'Luciana Ferreira pagou mensalidade Mar/26',
    actor_name: 'Luciana Ferreira',
    timestamp: '3h',
    icon: 'payment',
    accent_color: '#22C55E',
  },
  {
    id: 'af-5',
    type: 'video_watched',
    message: 'Sophia completou série "Fundamentos BJJ"',
    actor_name: 'Sophia',
    timestamp: '4h',
    icon: 'video',
    accent_color: '#06B6D4',
  },
  {
    id: 'af-6',
    type: 'quiz_completed',
    message: 'Lucas acertou 3/3 no quiz "Fuga de montada"',
    actor_name: 'Lucas',
    timestamp: '5h',
    icon: 'quiz',
    accent_color: '#EAB308',
  },
  {
    id: 'af-7',
    type: 'absence_alert',
    message: 'Marcos Vieira não treina há 16 dias',
    actor_name: 'Marcos Vieira',
    timestamp: '6h',
    icon: 'alert',
    accent_color: '#EF4444',
  },
  {
    id: 'af-8',
    type: 'achievement',
    message: 'Academia atingiu 170 alunos ativos!',
    actor_name: 'Sistema',
    timestamp: '8h',
    icon: 'achievement',
    accent_color: '#F59E0B',
  },
  {
    id: 'af-9',
    type: 'check_in',
    message: 'Patricia trouxe Helena (kids) para treino',
    actor_name: 'Patricia',
    timestamp: 'ontem',
    icon: 'checkin',
    accent_color: '#22C55E',
  },
  {
    id: 'af-10',
    type: 'signup',
    message: 'Novo professor Thiago Nakamura começou',
    actor_name: 'Thiago Nakamura',
    timestamp: '2 dias',
    icon: 'signup',
    accent_color: '#3B82F6',
  },
];

// ── Full dashboard mock ────────────────────────────────────────────

export function mockGetDashboardData(_academyId: string): DashboardData {
  return {
    greeting: {
      admin_name: 'Roberto',
      academy_name: 'Guerreiros BJJ',
      time_of_day: getTimeOfDay(),
      motivation_quote: QUOTES[Math.floor(Math.random() * QUOTES.length)],
    },

    headlines: {
      active_students: { value: 172, change: 12, trend: 'up', period: 'vs mês anterior' },
      monthly_revenue: { value: 47890, change: 3200, trend: 'up', period: 'vs mês anterior' },
      retention_rate: { value: 94.2, change: 2.4, trend: 'up', period: 'vs mês anterior' },
      classes_this_week: { value: 24, total_capacity: 480, fill_rate: 78 },
    },

    growth_chart: {
      labels: ['Out', 'Nov', 'Dez', 'Jan', 'Fev', 'Mar'],
      students: [128, 135, 142, 148, 160, 172],
      revenue: [38500, 40200, 41800, 43500, 44690, 47890],
      churn: [3, 5, 2, 4, 3, 2],
    },

    retention: {
      current_month: 94.2,
      previous_month: 91.8,
      at_risk: 8,
      at_risk_names: [
        { name: 'Marcos Vieira', last_attendance: '16 dias', belt: 'azul' },
        { name: 'Carolina Lima', last_attendance: '12 dias', belt: 'branca' },
        { name: 'Pedro Santos', last_attendance: '10 dias', belt: 'branca' },
        { name: 'Ana Costa', last_attendance: '9 dias', belt: 'azul' },
        { name: 'Gustavo Ribeiro', last_attendance: '8 dias', belt: 'branca' },
        { name: 'Beatriz Nunes', last_attendance: '7 dias', belt: 'azul' },
        { name: 'Felipe Martins', last_attendance: '7 dias', belt: 'branca' },
        { name: 'Daniela Souza', last_attendance: '7 dias', belt: 'branca' },
      ],
    },

    today_schedule: [
      { id: 'ts-1', class_name: 'BJJ Fundamentos', time: '07:00', professor: 'Prof. André', modality: 'BJJ', enrolled: 12, capacity: 20, confirmed: 8, status: 'upcoming' },
      { id: 'ts-2', class_name: 'BJJ All Levels', time: '10:00', professor: 'Prof. André', modality: 'BJJ', enrolled: 18, capacity: 25, confirmed: 0, status: 'upcoming' },
      { id: 'ts-3', class_name: 'Judô Adulto', time: '18:00', professor: 'Prof. Fernanda', modality: 'Judô', enrolled: 14, capacity: 20, confirmed: 0, status: 'upcoming' },
      { id: 'ts-4', class_name: 'BJJ Avançado', time: '19:00', professor: 'Prof. André', modality: 'BJJ', enrolled: 22, capacity: 25, confirmed: 0, status: 'upcoming' },
      { id: 'ts-5', class_name: 'BJJ Noturno', time: '21:00', professor: 'Prof. André', modality: 'BJJ', enrolled: 15, capacity: 20, confirmed: 0, status: 'upcoming' },
    ],

    activity_feed: ACTIVITY_FEED,

    pending_promotions: [
      { student_name: 'Rafael', current_belt: 'azul', suggested_belt: 'roxa', attendance_count: 245, months_at_belt: 18, quiz_avg: 92, ready: true },
      { student_name: 'Luciana', current_belt: 'branca', suggested_belt: 'azul', attendance_count: 120, months_at_belt: 8, quiz_avg: 78, ready: true },
      { student_name: 'Marcos', current_belt: 'branca', suggested_belt: 'azul', attendance_count: 95, months_at_belt: 11, quiz_avg: 65, ready: false },
    ],

    financial_summary: {
      revenue_this_month: 47890,
      revenue_last_month: 44690,
      pending_payments: 4350,
      overdue_count: 3,
      overdue_names: [
        { name: 'Carlos Mendes', amount: 397, days_overdue: 15 },
        { name: 'Julia Rocha', amount: 397, days_overdue: 8 },
        { name: 'Bruno Alves', amount: 297, days_overdue: 5 },
      ],
    },

    plan_usage: {
      plan_name: 'Pro',
      students: { current: 172, limit: 200 },
      professors: { current: 12, limit: 15 },
      classes: { current: 22, limit: 30 },
      storage_gb: { current: 31.2, limit: 50 },
      alerts: [
        { resource: 'Alunos', percent: 86, level: 'warning' },
        { resource: 'Professores', percent: 80, level: 'warning' },
      ],
    },

    streaming_summary: {
      total_views_week: 347,
      most_watched: { title: 'Fuga de montada', views: 89 },
      completion_rate: 72,
      new_videos_this_month: 3,
    },

    quick_actions: [
      { id: 'qa-1', label: 'Novo Aluno', icon: 'user-plus', href: '/admin/convites' },
      { id: 'qa-2', label: 'Gerar Link', icon: 'link', href: '/admin/convites' },
      { id: 'qa-3', label: 'Comunicado', icon: 'megaphone', href: '/admin/comunicados' },
      { id: 'qa-4', label: 'Financeiro', icon: 'dollar', href: '/admin/financeiro', badge: 3, accent: '#EF4444' },
      { id: 'qa-5', label: 'Meu Plano', icon: 'chart', href: '/admin/plano', badge: 2, accent: '#F59E0B' },
      { id: 'qa-6', label: 'Conteúdo', icon: 'video', href: '/admin/conteudo' },
    ],

    academy_achievements: [
      { title: 'Primeira Turma', description: 'Criou a primeira turma', icon: 'belt', unlocked: true, progress: 100, date: '2024-03-15' },
      { title: '50 Alunos', description: 'Academia atingiu 50 alunos', icon: 'users', unlocked: true, progress: 100, date: '2024-08-22' },
      { title: '100 Alunos', description: 'Academia atingiu 100 alunos', icon: 'stadium', unlocked: true, progress: 100, date: '2025-04-10' },
      { title: '200 Alunos', description: 'Próximo marco: 200 alunos', icon: 'target', unlocked: false, progress: 86 },
      { title: 'Mestre do Conteúdo', description: '15 vídeos na biblioteca', icon: 'video', unlocked: true, progress: 100, date: '2025-12-01' },
      { title: 'Retenção Ouro', description: '3 meses acima de 90%', icon: 'star', unlocked: true, progress: 100, date: '2026-01-15' },
      { title: 'Receita 50k', description: 'Faturamento mensal R$50k', icon: 'dollar', unlocked: false, progress: 96 },
      { title: 'Zero Inadimplência', description: 'Mês sem inadimplentes', icon: 'check', unlocked: false, progress: 0 },
    ],
  };
}

// ── Paginated activity feed ────────────────────────────────────────

export function mockGetActivityFeed(
  _academyId: string,
  page: number = 1,
  limit: number = 10,
): ActivityFeedItem[] {
  const start = (page - 1) * limit;
  return ACTIVITY_FEED.slice(start, start + limit);
}
