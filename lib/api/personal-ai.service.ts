import { isMock } from '@/lib/env';

export type ToneType = 'motivational' | 'technical' | 'casual';

export interface PersonalityConfig {
  tone: ToneType;
  frequency: 'daily' | 'weekly';
  language: string;
}

export interface PersonalContext {
  student_id: string;
  name: string;
  belt: string;
  stripes: number;
  academy: string;
  frequency_weekly: number;
  last_class_date: string;
  next_class_date: string;
  next_class_name: string;
  current_weight_kg: number;
  target_weight_kg: number | null;
  upcoming_competition: { name: string; date: string; category: string } | null;
  strengths: string[];
  weaknesses: string[];
  goals: string[];
  xp_total: number;
  xp_rank: number;
  streak_days: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AIResponse {
  message: string;
  context_used: string[];
  suggested_actions: { label: string; action: string }[];
}

export interface DailyBriefing {
  greeting: string;
  todays_class: { name: string; time: string; professor: string } | null;
  focus_suggestion: string;
  competition_countdown: { name: string; days_remaining: number } | null;
  weight_check: { current: number; target: number; diff: number } | null;
  motivational_quote: string;
  streak_info: string;
}

export interface WeeklyPlan {
  week_start: string;
  week_end: string;
  summary: string;
  days: {
    day_of_week: number;
    date: string;
    label: string;
    has_class: boolean;
    class_name: string | null;
    class_time: string | null;
    focus: string;
    tips: string[];
  }[];
  weekly_goal: string;
  nutrition_tip: string;
  recovery_tip: string;
}

const emptyContext = (studentId: string): PersonalContext => ({
  student_id: studentId, name: '', belt: '', stripes: 0, academy: '', frequency_weekly: 0, last_class_date: '', next_class_date: '', next_class_name: '', current_weight_kg: 0, target_weight_kg: null, upcoming_competition: null, strengths: [], weaknesses: [], goals: [], xp_total: 0, xp_rank: 0, streak_days: 0,
});

const emptyBriefing: DailyBriefing = { greeting: '', todays_class: null, focus_suggestion: '', competition_countdown: null, weight_check: null, motivational_quote: '', streak_info: '' };

const emptyWeeklyPlan: WeeklyPlan = { week_start: '', week_end: '', summary: '', days: [], weekly_goal: '', nutrition_tip: '', recovery_tip: '' };

export async function getPersonalContext(studentId: string): Promise<PersonalContext> {
  try {
    if (isMock()) {
      const { mockGetPersonalContext } = await import('@/lib/mocks/personal-ai.mock');
      return mockGetPersonalContext(studentId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: student } = await supabase
      .from('students')
      .select('name, belt, stripes, academy_id, weight')
      .eq('id', studentId)
      .single();

    const { count: attendanceCount } = await supabase
      .from('attendance')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', studentId);

    // Get latest attendance for last class date
    const { data: lastAttendance } = await supabase
      .from('attendance')
      .select('class_date')
      .eq('student_id', studentId)
      .order('class_date', { ascending: false })
      .limit(1);

    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', studentId)
      .single();

    const total = attendanceCount ?? 0;
    const weeklyFreq = Math.min(7, Math.round(total / Math.max(1, 4))); // rough estimate

    return {
      student_id: studentId,
      name: student?.name ?? profile?.display_name ?? '',
      belt: student?.belt ?? '',
      stripes: student?.stripes ?? 0,
      academy: '',
      frequency_weekly: weeklyFreq,
      last_class_date: lastAttendance?.[0]?.class_date ?? '',
      next_class_date: '',
      next_class_name: '',
      current_weight_kg: (student?.weight as number) ?? 0,
      target_weight_kg: null,
      upcoming_competition: null,
      strengths: total > 30 ? ['Frequência consistente'] : [],
      weaknesses: total < 10 ? ['Aumentar frequência'] : [],
      goals: [],
      xp_total: total * 10,
      xp_rank: 0,
      streak_days: 0,
    };
  } catch (error) {
    console.error('[getPersonalContext] Fallback:', error);
    return emptyContext(studentId);
  }
}

export async function chat(studentId: string, message: string, history: ChatMessage[]): Promise<AIResponse> {
  try {
    if (isMock()) {
      const { mockChat } = await import('@/lib/mocks/personal-ai.mock');
      return mockChat(studentId, message, history);
    }
    // AI chat requires API key — return graceful fallback
    console.error('[chat] AI API not configured — returning default response');
    return {
      message: 'Assistente IA não configurado. Configure a API key em Configurações > Integrações para habilitar o chat.',
      context_used: [],
      suggested_actions: [
        { label: 'Configurar IA', action: '/configuracoes/integracoes' },
      ],
    };
  } catch (error) {
    console.error('[chat] Fallback:', error);
    return { message: '', context_used: [], suggested_actions: [] };
  }
}

export async function getDailyBriefing(studentId: string): Promise<DailyBriefing> {
  try {
    if (isMock()) {
      const { mockGetDailyBriefing } = await import('@/lib/mocks/personal-ai.mock');
      return mockGetDailyBriefing(studentId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: student } = await supabase
      .from('students')
      .select('name, belt')
      .eq('id', studentId)
      .single();

    const name = student?.name ?? 'Aluno';
    const hour = new Date().getHours();
    const greeting = hour < 12 ? `Bom dia, ${name}!` : hour < 18 ? `Boa tarde, ${name}!` : `Boa noite, ${name}!`;

    return {
      greeting,
      todays_class: null,
      focus_suggestion: 'Treine com consistência e atenção aos detalhes.',
      competition_countdown: null,
      weight_check: null,
      motivational_quote: 'A faixa preta é uma faixa branca que nunca desistiu.',
      streak_info: '',
    };
  } catch (error) {
    console.error('[getDailyBriefing] Fallback:', error);
    return emptyBriefing;
  }
}

export async function getWeeklyPlan(studentId: string): Promise<WeeklyPlan> {
  try {
    if (isMock()) {
      const { mockGetWeeklyPlan } = await import('@/lib/mocks/personal-ai.mock');
      return mockGetWeeklyPlan(studentId);
    }
    // AI feature — return empty plan with guidance
    console.error('[getWeeklyPlan] AI API not configured — returning default');
    return {
      ...emptyWeeklyPlan,
      summary: 'Plano semanal requer configuração da IA. Acesse Configurações > Integrações.',
      weekly_goal: 'Manter frequência regular de treinos',
      nutrition_tip: 'Mantenha-se hidratado e alimente-se bem antes do treino.',
      recovery_tip: 'Descanse adequadamente entre os treinos.',
    };
  } catch (error) {
    console.error('[getWeeklyPlan] Fallback:', error);
    return emptyWeeklyPlan;
  }
}
