import { isMock } from '@/lib/env';

export interface PerformanceAnalysis {
  summary: string;
  strengths: string[];
  improvements: string[];
  recommendation: string;
}

export interface ClassPlan {
  warmup: string;
  technique: string;
  drills: string[];
  sparring: string;
  cooldown: string;
}

export interface GeneratedTrainingPlan {
  name: string;
  goal: string;
  duration_weeks: number;
  weeks: {
    week_number: number;
    theme: string;
    sessions: {
      day_of_week: number;
      label: string;
      exercises: { name: string; sets?: number; reps?: string; duration_min?: number; notes?: string }[];
    }[];
  }[];
  reasoning: string;
}

export interface PlanAdjustment {
  changes: { week: number; description: string }[];
  reasoning: string;
  updated_plan_id: string;
}

export interface GeneratedPeriodization {
  competition_name: string;
  competition_date: string;
  phases: {
    name: string;
    weeks: number;
    intensity: number;
    volume: number;
    focus: string[];
  }[];
  reasoning: string;
}

export interface WeeklyCheckInResult {
  summary: string;
  adherence_pct: number;
  highlights: string[];
  adjustments: string[];
  motivation: string;
}

export async function getTrainingSuggestion(studentId: string): Promise<string> {
  try {
    if (isMock()) {
      const { mockGetTrainingSuggestion } = await import('@/lib/mocks/ai-coach.mock');
      return mockGetTrainingSuggestion(studentId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Fetch student data from DB
    const { data: student } = await supabase
      .from('students')
      .select('name, belt, stripes')
      .eq('id', studentId)
      .single();

    const { count: attendanceCount } = await supabase
      .from('attendance')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', studentId);

    const belt = student?.belt ?? 'branca';
    const total = attendanceCount ?? 0;

    // Data-driven suggestion based on attendance and belt
    if (total < 10) {
      return `Foco em fundamentos básicos. Com ${total} aulas registradas, priorize posições de base e defesa.`;
    } else if (total < 50) {
      return `Bom progresso com ${total} aulas! Para faixa ${belt}, trabalhe transições de guarda e passagens.`;
    } else {
      return `Excelente dedicação (${total} aulas)! Faixa ${belt} — refine seu jogo ofensivo e prepare-se para competições.`;
    }
  } catch (error) {
    console.error('[getTrainingSuggestion] Fallback:', error);
    return '';
  }
}

export async function analyzePerformance(studentId: string): Promise<PerformanceAnalysis> {
  try {
    if (isMock()) {
      const { mockAnalyzePerformance } = await import('@/lib/mocks/ai-coach.mock');
      return mockAnalyzePerformance(studentId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: student } = await supabase
      .from('students')
      .select('name, belt, stripes')
      .eq('id', studentId)
      .single();

    const { count: attendanceCount } = await supabase
      .from('attendance')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', studentId);

    const { data: evals } = await supabase
      .from('evaluations')
      .select('score, notes')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(5);

    const belt = student?.belt ?? 'branca';
    const total = attendanceCount ?? 0;
    const avgScore = evals?.length
      ? evals.reduce((s: number, e: { score: number | null; notes: string | null }) => s + (e.score ?? 0), 0) / evals.length
      : 0;

    const strengths: string[] = [];
    const improvements: string[] = [];

    if (total > 30) strengths.push('Frequência consistente');
    else improvements.push('Aumentar frequência de treinos');

    if (avgScore >= 7) strengths.push('Boas avaliações técnicas');
    else if (avgScore > 0) improvements.push('Melhorar desempenho nas avaliações');

    strengths.push('Dedicação ao treinamento');
    improvements.push('Variar parceiros de treino');

    return {
      summary: `Aluno faixa ${belt} com ${total} presenças e média de avaliação ${avgScore.toFixed(1)}.`,
      strengths,
      improvements,
      recommendation: total > 20
        ? 'Continue o ritmo e foque em posições específicas para aprimorar.'
        : 'Priorize frequência regular para consolidar a base técnica.',
    };
  } catch (error) {
    console.error('[analyzePerformance] Fallback:', error);
    return { summary: '', strengths: [], improvements: [], recommendation: '' };
  }
}

export async function generateClassPlan(professorId: string, classId: string): Promise<ClassPlan> {
  try {
    if (isMock()) {
      const { mockGenerateClassPlan } = await import('@/lib/mocks/ai-coach.mock');
      return mockGenerateClassPlan(professorId, classId);
    }
    // AI feature — return structured default when API key not configured
    return {
      warmup: 'Corrida leve + alongamento dinâmico (10 min)',
      technique: 'Técnica do dia conforme planejamento do professor',
      drills: ['Repetição da técnica em duplas', 'Drill posicional (guard pass/retention)'],
      sparring: 'Sparring livre ou posicional (3 rounds de 5 min)',
      cooldown: 'Alongamento estático + respiração (5 min)',
    };
  } catch (error) {
    console.error('[generateClassPlan] Fallback:', error);
    return { warmup: '', technique: '', drills: [], sparring: '', cooldown: '' };
  }
}

export async function answerQuestion(studentId: string, question: string): Promise<string> {
  try {
    if (isMock()) {
      const { mockAnswerQuestion } = await import('@/lib/mocks/ai-coach.mock');
      return mockAnswerQuestion(studentId, question);
    }
    // AI feature — requires API key to answer questions
    console.error('[answerQuestion] AI API not configured — returning default');
    return 'Assistente IA não configurado. Configure a API key em Configurações > Integrações.';
  } catch (error) {
    console.error('[answerQuestion] Fallback:', error);
    return '';
  }
}

export async function generateTrainingPlan(studentId: string, goal: string, weeks: number): Promise<GeneratedTrainingPlan> {
  try {
    if (isMock()) {
      const { mockGenerateTrainingPlan } = await import('@/lib/mocks/ai-coach.mock');
      return mockGenerateTrainingPlan(studentId, goal, weeks);
    }
    // AI feature — return basic template plan
    const weekPlans = Array.from({ length: weeks }, (_, i) => ({
      week_number: i + 1,
      theme: i % 2 === 0 ? 'Guarda e Passagem' : 'Controle e Finalização',
      sessions: [
        { day_of_week: 1, label: 'Técnica', exercises: [{ name: 'Drill técnico', sets: 3, reps: '10x', notes: 'Foco na posição do dia' }] },
        { day_of_week: 3, label: 'Sparring', exercises: [{ name: 'Sparring posicional', duration_min: 30, notes: 'Aplicar técnicas da semana' }] },
        { day_of_week: 5, label: 'Competição', exercises: [{ name: 'Sparring livre', duration_min: 40, notes: 'Simulação de competição' }] },
      ],
    }));

    return {
      name: `Plano de ${weeks} semanas — ${goal}`,
      goal,
      duration_weeks: weeks,
      weeks: weekPlans,
      reasoning: 'Plano básico gerado automaticamente. Configure a IA para planos personalizados.',
    };
  } catch (error) {
    console.error('[generateTrainingPlan] Fallback:', error);
    return { name: '', goal, duration_weeks: weeks, weeks: [], reasoning: '' };
  }
}

export async function adjustPlan(planId: string, feedback: string): Promise<PlanAdjustment> {
  try {
    if (isMock()) {
      const { mockAdjustPlan } = await import('@/lib/mocks/ai-coach.mock');
      return mockAdjustPlan(planId, feedback);
    }
    // AI feature — return acknowledgment without actual adjustment
    console.error('[adjustPlan] AI API not configured — returning default');
    return {
      changes: [{ week: 1, description: 'Feedback registrado. Configure a IA para ajustes automáticos.' }],
      reasoning: 'Ajuste automático requer configuração da API de IA.',
      updated_plan_id: planId,
    };
  } catch (error) {
    console.error('[adjustPlan] Fallback:', error);
    return { changes: [], reasoning: '', updated_plan_id: planId };
  }
}

export async function generatePeriodization(studentId: string, competitionDate: string): Promise<GeneratedPeriodization> {
  try {
    if (isMock()) {
      const { mockGeneratePeriodization } = await import('@/lib/mocks/ai-coach.mock');
      return mockGeneratePeriodization(studentId, competitionDate);
    }
    // AI feature — return basic periodization template
    const compDate = new Date(competitionDate);
    const now = new Date();
    const weeksUntil = Math.max(1, Math.ceil((compDate.getTime() - now.getTime()) / (7 * 24 * 60 * 60 * 1000)));

    const prepWeeks = Math.max(1, Math.floor(weeksUntil * 0.5));
    const peakWeeks = Math.max(1, Math.floor(weeksUntil * 0.3));
    const taperWeeks = Math.max(1, weeksUntil - prepWeeks - peakWeeks);

    return {
      competition_name: 'Competição',
      competition_date: competitionDate,
      phases: [
        { name: 'Preparação Geral', weeks: prepWeeks, intensity: 60, volume: 80, focus: ['Condicionamento', 'Técnica base'] },
        { name: 'Preparação Específica', weeks: peakWeeks, intensity: 85, volume: 60, focus: ['Sparring competitivo', 'Estratégia'] },
        { name: 'Taper / Polimento', weeks: taperWeeks, intensity: 50, volume: 30, focus: ['Recuperação', 'Visualização', 'Peso'] },
      ],
      reasoning: 'Periodização básica gerada automaticamente. Configure a IA para personalização avançada.',
    };
  } catch (error) {
    console.error('[generatePeriodization] Fallback:', error);
    return { competition_name: '', competition_date: competitionDate, phases: [], reasoning: '' };
  }
}

export async function weeklyCheckIn(planId: string): Promise<WeeklyCheckInResult> {
  try {
    if (isMock()) {
      const { mockWeeklyCheckIn } = await import('@/lib/mocks/ai-coach.mock');
      return mockWeeklyCheckIn(planId);
    }
    // AI feature — return default weekly check-in
    console.error('[weeklyCheckIn] AI API not configured — returning default');
    return {
      summary: 'Check-in semanal registrado. Configure a IA para análises detalhadas.',
      adherence_pct: 0,
      highlights: ['Continue treinando regularmente'],
      adjustments: [],
      motivation: 'A consistência é a chave do progresso. Oss!',
    };
  } catch (error) {
    console.error('[weeklyCheckIn] Fallback:', error);
    return { summary: '', adherence_pct: 0, highlights: [], adjustments: [], motivation: '' };
  }
}
