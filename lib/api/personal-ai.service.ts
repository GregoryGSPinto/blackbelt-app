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
    try {
      const res = await fetch(`/api/ai/personal-context/${studentId}`);
      if (!res.ok) {
        console.warn('[getPersonalContext] API error:', res.status);
        return emptyContext(studentId);
      }
      return res.json();
    } catch {
      console.warn('[personal-ai.getPersonalContext] API not available, using mock fallback');
      const { mockGetPersonalContext } = await import('@/lib/mocks/personal-ai.mock');
      return mockGetPersonalContext(studentId);
    }
  } catch (error) {
    console.warn('[getPersonalContext] Fallback:', error);
    return emptyContext(studentId);
  }
}

export async function chat(studentId: string, message: string, history: ChatMessage[]): Promise<AIResponse> {
  try {
    if (isMock()) {
      const { mockChat } = await import('@/lib/mocks/personal-ai.mock');
      return mockChat(studentId, message, history);
    }
    try {
      const res = await fetch('/api/ai/personal-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, message, history }),
      });
      if (!res.ok) {
        console.warn('[chat] API error:', res.status);
        return { message: 'IA Coach em desenvolvimento.', context_used: [], suggested_actions: [] };
      }
      return res.json();
    } catch {
      console.warn('[personal-ai.chat] API not available, using mock fallback');
      const { mockChat } = await import('@/lib/mocks/personal-ai.mock');
      return mockChat(studentId, message, history);
    }
  } catch (error) {
    console.warn('[chat] Fallback:', error);
    return { message: '', context_used: [], suggested_actions: [] };
  }
}

export async function getDailyBriefing(studentId: string): Promise<DailyBriefing> {
  try {
    if (isMock()) {
      const { mockGetDailyBriefing } = await import('@/lib/mocks/personal-ai.mock');
      return mockGetDailyBriefing(studentId);
    }
    try {
      const res = await fetch(`/api/ai/daily-briefing/${studentId}`);
      if (!res.ok) {
        console.warn('[getDailyBriefing] API error:', res.status);
        return emptyBriefing;
      }
      return res.json();
    } catch {
      console.warn('[personal-ai.getDailyBriefing] API not available, using mock fallback');
      const { mockGetDailyBriefing } = await import('@/lib/mocks/personal-ai.mock');
      return mockGetDailyBriefing(studentId);
    }
  } catch (error) {
    console.warn('[getDailyBriefing] Fallback:', error);
    return emptyBriefing;
  }
}

export async function getWeeklyPlan(studentId: string): Promise<WeeklyPlan> {
  try {
    if (isMock()) {
      const { mockGetWeeklyPlan } = await import('@/lib/mocks/personal-ai.mock');
      return mockGetWeeklyPlan(studentId);
    }
    try {
      const res = await fetch(`/api/ai/weekly-plan/${studentId}`);
      if (!res.ok) {
        console.warn('[getWeeklyPlan] API error:', res.status);
        return emptyWeeklyPlan;
      }
      return res.json();
    } catch {
      console.warn('[personal-ai.getWeeklyPlan] API not available, using mock fallback');
      const { mockGetWeeklyPlan } = await import('@/lib/mocks/personal-ai.mock');
      return mockGetWeeklyPlan(studentId);
    }
  } catch (error) {
    console.warn('[getWeeklyPlan] Fallback:', error);
    return emptyWeeklyPlan;
  }
}
