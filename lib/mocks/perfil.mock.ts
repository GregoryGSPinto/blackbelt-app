import { BeltLevel, EvaluationCriteria, InvoiceStatus, PlanInterval } from '@/lib/types';
import type {
  StudentProfileDTO,
  TimelineEventDTO,
  EvolutionDataDTO,
  AttendanceHeatmapDTO,
  HeatmapDayDTO,
  EvaluationHistoryItemDTO,
  ContentProgressDTO,
  FinanceiroPerfilDTO,
} from '@/lib/api/perfil.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

// ── Profile ────────────────────────────────────────────────────────────

export async function mockGetStudentProfile(_studentId: string): Promise<StudentProfileDTO> {
  await delay();
  return {
    id: 'stu-1',
    display_name: 'Joao Pedro Almeida',
    avatar_url: null,
    belt: BeltLevel.Blue,
    academy_id: 'acad-1',
    academy_name: 'BlackBelt Academy',
    started_at: '2025-04-10',
    total_classes: 142,
    months_training: 11,
    streak: 12,
    ranking_position: 2,
    total_students: 87,
  };
}

// ── Journey Timeline ───────────────────────────────────────────────────

export async function mockGetJourneyTimeline(_studentId: string): Promise<TimelineEventDTO[]> {
  await delay();
  return [
    {
      id: 'ev-10',
      type: 'achievement',
      title: 'Streak 10 dias',
      description: '10 dias consecutivos de treino!',
      date: '2026-03-14',
      icon: '\uD83D\uDD25',
    },
    {
      id: 'ev-9',
      type: 'evaluation',
      title: 'Avaliacao tecnica',
      description: 'Nota 85/100 — Prof. Andre observou excelente guarda.',
      date: '2026-03-01',
      icon: '\uD83D\uDCCB',
    },
    {
      id: 'ev-8',
      type: 'achievement',
      title: '50 aulas concluidas',
      description: 'Marco de meio caminho! Continue firme.',
      date: '2026-02-15',
      icon: '\uD83C\uDFC5',
    },
    {
      id: 'ev-7',
      type: 'milestone',
      title: '100 aulas concluidas',
      description: 'Centenario! Voce e dedicacao pura.',
      date: '2026-01-20',
      icon: '\uD83C\uDF1F',
    },
    {
      id: 'ev-6',
      type: 'belt_promotion',
      title: 'Promovido para faixa Azul',
      description: 'Avaliado por Prof. Andre Galvao. Parabens!',
      date: '2025-11-22',
      icon: '\uD83E\uDD4B',
      belt: BeltLevel.Blue,
    },
    {
      id: 'ev-5',
      type: 'evaluation',
      title: 'Avaliacao pre-promocao',
      description: 'Nota 90/100 — Pronto para faixa azul!',
      date: '2025-11-15',
      icon: '\uD83D\uDCCB',
    },
    {
      id: 'ev-4',
      type: 'achievement',
      title: 'Streak 7 dias',
      description: '7 dias seguidos de treino. Guerreiro!',
      date: '2025-10-01',
      icon: '\uD83D\uDD25',
    },
    {
      id: 'ev-3',
      type: 'belt_promotion',
      title: 'Promovido para faixa Green',
      description: 'Avaliado por Prof. Carlos Silva.',
      date: '2025-08-10',
      icon: '\uD83E\uDD4B',
      belt: BeltLevel.Green,
    },
    {
      id: 'ev-2',
      type: 'achievement',
      title: '20 aulas concluidas',
      description: 'Primeiras 20 aulas! O comeco de tudo.',
      date: '2025-06-05',
      icon: '\uD83C\uDFC5',
    },
    {
      id: 'ev-1',
      type: 'enrollment',
      title: 'Inicio da jornada',
      description: 'Matriculado na BlackBelt Academy. Oss!',
      date: '2025-04-10',
      icon: '\uD83C\uDF1F',
    },
  ];
}

// ── Evolution Data ─────────────────────────────────────────────────────

export async function mockGetEvolutionData(_studentId: string): Promise<EvolutionDataDTO> {
  await delay();
  return {
    current_scores: [
      { criteria: EvaluationCriteria.Technique, label: 'Tecnica', score: 78, max_score: 100 },
      { criteria: EvaluationCriteria.Discipline, label: 'Disciplina', score: 90, max_score: 100 },
      { criteria: EvaluationCriteria.Attendance, label: 'Frequencia', score: 85, max_score: 100 },
      { criteria: EvaluationCriteria.Evolution, label: 'Evolucao', score: 82, max_score: 100 },
    ],
    history: [
      {
        date: '2025-06',
        label: 'Jun/25',
        scores: [
          { criteria: EvaluationCriteria.Technique, label: 'Tecnica', score: 45, max_score: 100 },
          { criteria: EvaluationCriteria.Discipline, label: 'Disciplina', score: 60, max_score: 100 },
          { criteria: EvaluationCriteria.Attendance, label: 'Frequencia', score: 55, max_score: 100 },
          { criteria: EvaluationCriteria.Evolution, label: 'Evolucao', score: 50, max_score: 100 },
        ],
        overall: 53,
      },
      {
        date: '2025-08',
        label: 'Ago/25',
        scores: [
          { criteria: EvaluationCriteria.Technique, label: 'Tecnica', score: 55, max_score: 100 },
          { criteria: EvaluationCriteria.Discipline, label: 'Disciplina', score: 70, max_score: 100 },
          { criteria: EvaluationCriteria.Attendance, label: 'Frequencia', score: 65, max_score: 100 },
          { criteria: EvaluationCriteria.Evolution, label: 'Evolucao', score: 60, max_score: 100 },
        ],
        overall: 63,
      },
      {
        date: '2025-10',
        label: 'Out/25',
        scores: [
          { criteria: EvaluationCriteria.Technique, label: 'Tecnica', score: 65, max_score: 100 },
          { criteria: EvaluationCriteria.Discipline, label: 'Disciplina', score: 80, max_score: 100 },
          { criteria: EvaluationCriteria.Attendance, label: 'Frequencia', score: 75, max_score: 100 },
          { criteria: EvaluationCriteria.Evolution, label: 'Evolucao', score: 70, max_score: 100 },
        ],
        overall: 73,
      },
      {
        date: '2025-12',
        label: 'Dez/25',
        scores: [
          { criteria: EvaluationCriteria.Technique, label: 'Tecnica', score: 72, max_score: 100 },
          { criteria: EvaluationCriteria.Discipline, label: 'Disciplina', score: 85, max_score: 100 },
          { criteria: EvaluationCriteria.Attendance, label: 'Frequencia', score: 80, max_score: 100 },
          { criteria: EvaluationCriteria.Evolution, label: 'Evolucao', score: 76, max_score: 100 },
        ],
        overall: 78,
      },
      {
        date: '2026-02',
        label: 'Fev/26',
        scores: [
          { criteria: EvaluationCriteria.Technique, label: 'Tecnica', score: 75, max_score: 100 },
          { criteria: EvaluationCriteria.Discipline, label: 'Disciplina', score: 88, max_score: 100 },
          { criteria: EvaluationCriteria.Attendance, label: 'Frequencia', score: 82, max_score: 100 },
          { criteria: EvaluationCriteria.Evolution, label: 'Evolucao', score: 80, max_score: 100 },
        ],
        overall: 81,
      },
      {
        date: '2026-03',
        label: 'Mar/26',
        scores: [
          { criteria: EvaluationCriteria.Technique, label: 'Tecnica', score: 78, max_score: 100 },
          { criteria: EvaluationCriteria.Discipline, label: 'Disciplina', score: 90, max_score: 100 },
          { criteria: EvaluationCriteria.Attendance, label: 'Frequencia', score: 85, max_score: 100 },
          { criteria: EvaluationCriteria.Evolution, label: 'Evolucao', score: 82, max_score: 100 },
        ],
        overall: 84,
      },
    ],
  };
}

// ── Attendance Heatmap ─────────────────────────────────────────────────

function generateHeatmapDays(): HeatmapDayDTO[] {
  const days: HeatmapDayDTO[] = [];
  const today = new Date();
  const start = new Date(today);
  start.setFullYear(start.getFullYear() - 1);

  const cursor = new Date(start);
  while (cursor <= today) {
    const dayOfWeek = cursor.getDay();
    const dateStr = cursor.toISOString().split('T')[0];

    // Simulate realistic training pattern: Mon-Fri higher chance, weekends low
    let count = 0;
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      // Weekdays: ~60% chance of training
      const rand = Math.random();
      if (rand < 0.3) count = 0;
      else if (rand < 0.65) count = 1;
      else if (rand < 0.85) count = 2;
      else count = 3;
    } else {
      // Weekends: ~15% chance
      count = Math.random() < 0.15 ? 1 : 0;
    }

    const level = count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : count >= 3 ? 3 : 4;
    days.push({ date: dateStr, count, level: level as 0 | 1 | 2 | 3 | 4 });
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export async function mockGetAttendanceHeatmap(_studentId: string): Promise<AttendanceHeatmapDTO> {
  await delay();
  const days = generateHeatmapDays();
  const totalYear = days.reduce((sum, d) => sum + d.count, 0);

  return {
    days,
    total_year: totalYear,
    longest_streak: 23,
    current_streak: 12,
    average_per_week: Math.round((totalYear / 52) * 10) / 10,
    distribution: [
      { modality: 'BJJ', count: Math.round(totalYear * 0.55), percentage: 55, color: '#DC2626' },
      { modality: 'BJJ Advanced', count: Math.round(totalYear * 0.25), percentage: 25, color: '#2563EB' },
      { modality: 'No-Gi', count: Math.round(totalYear * 0.15), percentage: 15, color: '#16A34A' },
      { modality: 'Open Mat', count: Math.round(totalYear * 0.05), percentage: 5, color: '#CA8A04' },
    ],
  };
}

// ── Evaluation History ─────────────────────────────────────────────────

export async function mockGetEvaluationHistory(_studentId: string): Promise<EvaluationHistoryItemDTO[]> {
  await delay();
  return [
    {
      id: 'eval-1',
      date: '2026-03-01',
      evaluator_name: 'Andre Galvao',
      evaluator_avatar: null,
      criteria: EvaluationCriteria.Technique,
      score: 85,
      max_score: 100,
      observation: 'Joao demonstrou excelente controle de guarda fechada e raspagens. Precisa trabalhar mais a passagem de guarda em pe. No geral, evolucao muito boa para o nivel azul.',
      belt_at_time: BeltLevel.Blue,
    },
    {
      id: 'eval-2',
      date: '2026-02-01',
      evaluator_name: 'Carlos Silva',
      evaluator_avatar: null,
      criteria: EvaluationCriteria.Discipline,
      score: 92,
      max_score: 100,
      observation: 'Pontualidade impecavel. Sempre ajuda os mais novos e mantem postura exemplar no tatame. Referencia para a turma.',
      belt_at_time: BeltLevel.Blue,
    },
    {
      id: 'eval-3',
      date: '2026-01-15',
      evaluator_name: 'Andre Galvao',
      evaluator_avatar: null,
      criteria: EvaluationCriteria.Evolution,
      score: 80,
      max_score: 100,
      observation: 'Boa evolucao no jogo por cima. Melhorou significativamente a pressao na meia-guarda. Proximo passo: trabalhar transicoes para as costas.',
      belt_at_time: BeltLevel.Blue,
    },
    {
      id: 'eval-4',
      date: '2025-11-15',
      evaluator_name: 'Andre Galvao',
      evaluator_avatar: null,
      criteria: EvaluationCriteria.Technique,
      score: 90,
      max_score: 100,
      observation: 'Avaliacao pre-promocao faixa azul. Demonstrou dominio completo dos fundamentos. Pronto para o proximo nivel.',
      belt_at_time: BeltLevel.Green,
    },
    {
      id: 'eval-5',
      date: '2025-09-01',
      evaluator_name: 'Carlos Silva',
      evaluator_avatar: null,
      criteria: EvaluationCriteria.Attendance,
      score: 88,
      max_score: 100,
      observation: 'Frequencia exemplar neste periodo. Treinou em media 4x por semana, incluindo aulas de sabado.',
      belt_at_time: BeltLevel.Green,
    },
    {
      id: 'eval-6',
      date: '2025-07-01',
      evaluator_name: 'Andre Galvao',
      evaluator_avatar: null,
      criteria: EvaluationCriteria.Technique,
      score: 72,
      max_score: 100,
      observation: 'Bom progresso na guarda aberta. Precisa melhorar o jogo de pegada e o controle de distancia.',
      belt_at_time: BeltLevel.Green,
    },
  ];
}

// ── Content Progress ───────────────────────────────────────────────────

export async function mockGetContentProgress(_studentId: string): Promise<ContentProgressDTO> {
  await delay();
  return {
    total_watched_minutes: 480,
    total_completed: 18,
    trails: [
      {
        trail_id: 'trail-1',
        trail_name: 'Guarda Fechada — Fundamentos',
        total_videos: 8,
        completed_videos: 6,
        progress_pct: 75,
        videos: [
          { video_id: 'v1', title: 'Introducao a Guarda Fechada', duration: 12, watched_seconds: 720, progress_pct: 100, completed: true, completed_at: '2026-01-15' },
          { video_id: 'v2', title: 'Quebra de postura', duration: 15, watched_seconds: 900, progress_pct: 100, completed: true, completed_at: '2026-01-18' },
          { video_id: 'v3', title: 'Armlock da guarda', duration: 18, watched_seconds: 1080, progress_pct: 100, completed: true, completed_at: '2026-01-22' },
          { video_id: 'v4', title: 'Triangulo', duration: 20, watched_seconds: 1200, progress_pct: 100, completed: true, completed_at: '2026-02-01' },
          { video_id: 'v5', title: 'Omoplata', duration: 16, watched_seconds: 960, progress_pct: 100, completed: true, completed_at: '2026-02-10' },
          { video_id: 'v6', title: 'Raspagem de tesoura', duration: 14, watched_seconds: 840, progress_pct: 100, completed: true, completed_at: '2026-02-20' },
          { video_id: 'v7', title: 'Raspagem de pendulo', duration: 17, watched_seconds: 612, progress_pct: 60, completed: false, completed_at: null },
          { video_id: 'v8', title: 'Combinacoes da guarda fechada', duration: 22, watched_seconds: 0, progress_pct: 0, completed: false, completed_at: null },
        ],
      },
      {
        trail_id: 'trail-2',
        trail_name: 'Passagem de Guarda',
        total_videos: 6,
        completed_videos: 3,
        progress_pct: 50,
        videos: [
          { video_id: 'v9', title: 'Passagem com pressao', duration: 20, watched_seconds: 1200, progress_pct: 100, completed: true, completed_at: '2026-02-05' },
          { video_id: 'v10', title: 'Passagem toureando', duration: 15, watched_seconds: 900, progress_pct: 100, completed: true, completed_at: '2026-02-12' },
          { video_id: 'v11', title: 'Passagem X-pass', duration: 18, watched_seconds: 1080, progress_pct: 100, completed: true, completed_at: '2026-02-25' },
          { video_id: 'v12', title: 'Passagem de joelhos', duration: 16, watched_seconds: 480, progress_pct: 50, completed: false, completed_at: null },
          { video_id: 'v13', title: 'Passagem leg drag', duration: 19, watched_seconds: 0, progress_pct: 0, completed: false, completed_at: null },
          { video_id: 'v14', title: 'Passagem stack pass', duration: 14, watched_seconds: 0, progress_pct: 0, completed: false, completed_at: null },
        ],
      },
      {
        trail_id: 'trail-3',
        trail_name: 'Jogo de Costas',
        total_videos: 5,
        completed_videos: 2,
        progress_pct: 40,
        videos: [
          { video_id: 'v15', title: 'Controle das costas', duration: 15, watched_seconds: 900, progress_pct: 100, completed: true, completed_at: '2026-03-01' },
          { video_id: 'v16', title: 'Mata-leao', duration: 12, watched_seconds: 720, progress_pct: 100, completed: true, completed_at: '2026-03-05' },
          { video_id: 'v17', title: 'Bow and arrow', duration: 14, watched_seconds: 420, progress_pct: 50, completed: false, completed_at: null },
          { video_id: 'v18', title: 'Retencao de costas', duration: 16, watched_seconds: 0, progress_pct: 0, completed: false, completed_at: null },
          { video_id: 'v19', title: 'Transicoes para as costas', duration: 20, watched_seconds: 0, progress_pct: 0, completed: false, completed_at: null },
        ],
      },
    ],
  };
}

// ── Financeiro ─────────────────────────────────────────────────────────

export async function mockGetFinanceiroPerfil(_studentId: string): Promise<FinanceiroPerfilDTO> {
  await delay();
  return {
    plan: {
      plan_id: 'plan-1',
      plan_name: 'Plano Black',
      price: 249.9,
      interval: PlanInterval.Monthly,
      status: 'active',
      current_period_end: '2026-04-10',
    },
    invoices: [
      { id: 'inv-1', amount: 249.9, status: InvoiceStatus.Paid, due_date: '2026-03-10', paid_at: '2026-03-08', description: 'Mensalidade — Plano Black' },
      { id: 'inv-2', amount: 249.9, status: InvoiceStatus.Paid, due_date: '2026-02-10', paid_at: '2026-02-09', description: 'Mensalidade — Plano Black' },
      { id: 'inv-3', amount: 249.9, status: InvoiceStatus.Paid, due_date: '2026-01-10', paid_at: '2026-01-10', description: 'Mensalidade — Plano Black' },
      { id: 'inv-4', amount: 249.9, status: InvoiceStatus.Paid, due_date: '2025-12-10', paid_at: '2025-12-08', description: 'Mensalidade — Plano Black' },
      { id: 'inv-5', amount: 249.9, status: InvoiceStatus.Paid, due_date: '2025-11-10', paid_at: '2025-11-10', description: 'Mensalidade — Plano Black' },
      { id: 'inv-6', amount: 199.9, status: InvoiceStatus.Paid, due_date: '2025-10-10', paid_at: '2025-10-09', description: 'Mensalidade — Plano Silver' },
      { id: 'inv-7', amount: 199.9, status: InvoiceStatus.Paid, due_date: '2025-09-10', paid_at: '2025-09-10', description: 'Mensalidade — Plano Silver' },
      { id: 'inv-8', amount: 199.9, status: InvoiceStatus.Paid, due_date: '2025-08-10', paid_at: '2025-08-08', description: 'Mensalidade — Plano Silver' },
    ],
  };
}
