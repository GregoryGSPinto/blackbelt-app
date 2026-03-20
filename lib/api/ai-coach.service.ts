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
    try {
      const res = await fetch('/api/ai/training-suggestion', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId }) });
      if (!res.ok) {
        console.warn('[getTrainingSuggestion] API error:', res.status);
        return 'IA Coach em desenvolvimento. Configure a API key em Configurações.';
      }
      return res.json().then((r: { suggestion: string }) => r.suggestion);
    } catch {
      console.warn('[ai-coach.getTrainingSuggestion] API not available, using mock fallback');
      const { mockGetTrainingSuggestion } = await import('@/lib/mocks/ai-coach.mock');
      return mockGetTrainingSuggestion(studentId);
    }
  } catch (error) {
    console.warn('[getTrainingSuggestion] Fallback:', error);
    return '';
  }
}

export async function analyzePerformance(studentId: string): Promise<PerformanceAnalysis> {
  try {
    if (isMock()) {
      const { mockAnalyzePerformance } = await import('@/lib/mocks/ai-coach.mock');
      return mockAnalyzePerformance(studentId);
    }
    try {
      const res = await fetch('/api/ai/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId }) });
      if (!res.ok) {
        console.warn('[analyzePerformance] API error:', res.status);
        return { summary: '', strengths: [], improvements: [], recommendation: '' };
      }
      return res.json();
    } catch {
      console.warn('[ai-coach.analyzePerformance] API not available, using mock fallback');
      const { mockAnalyzePerformance } = await import('@/lib/mocks/ai-coach.mock');
      return mockAnalyzePerformance(studentId);
    }
  } catch (error) {
    console.warn('[analyzePerformance] Fallback:', error);
    return { summary: '', strengths: [], improvements: [], recommendation: '' };
  }
}

export async function generateClassPlan(professorId: string, classId: string): Promise<ClassPlan> {
  try {
    if (isMock()) {
      const { mockGenerateClassPlan } = await import('@/lib/mocks/ai-coach.mock');
      return mockGenerateClassPlan(professorId, classId);
    }
    try {
      const res = await fetch('/api/ai/class-plan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ professorId, classId }) });
      if (!res.ok) {
        console.warn('[generateClassPlan] API error:', res.status);
        return { warmup: '', technique: '', drills: [], sparring: '', cooldown: '' };
      }
      return res.json();
    } catch {
      console.warn('[ai-coach.generateClassPlan] API not available, using mock fallback');
      const { mockGenerateClassPlan } = await import('@/lib/mocks/ai-coach.mock');
      return mockGenerateClassPlan(professorId, classId);
    }
  } catch (error) {
    console.warn('[generateClassPlan] Fallback:', error);
    return { warmup: '', technique: '', drills: [], sparring: '', cooldown: '' };
  }
}

export async function answerQuestion(studentId: string, question: string): Promise<string> {
  try {
    if (isMock()) {
      const { mockAnswerQuestion } = await import('@/lib/mocks/ai-coach.mock');
      return mockAnswerQuestion(studentId, question);
    }
    try {
      const res = await fetch('/api/ai/ask', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId, question }) });
      if (!res.ok) {
        console.warn('[answerQuestion] API error:', res.status);
        return '';
      }
      return res.json().then((r: { answer: string }) => r.answer);
    } catch {
      console.warn('[ai-coach.answerQuestion] API not available, using mock fallback');
      const { mockAnswerQuestion } = await import('@/lib/mocks/ai-coach.mock');
      return mockAnswerQuestion(studentId, question);
    }
  } catch (error) {
    console.warn('[answerQuestion] Fallback:', error);
    return '';
  }
}

export async function generateTrainingPlan(studentId: string, goal: string, weeks: number): Promise<GeneratedTrainingPlan> {
  try {
    if (isMock()) {
      const { mockGenerateTrainingPlan } = await import('@/lib/mocks/ai-coach.mock');
      return mockGenerateTrainingPlan(studentId, goal, weeks);
    }
    try {
      const res = await fetch('/api/ai/generate-plan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId, goal, weeks }) });
      if (!res.ok) {
        console.warn('[generateTrainingPlan] API error:', res.status);
        return { name: '', goal, duration_weeks: weeks, weeks: [], reasoning: '' };
      }
      return res.json();
    } catch {
      console.warn('[ai-coach.generateTrainingPlan] API not available, using mock fallback');
      const { mockGenerateTrainingPlan } = await import('@/lib/mocks/ai-coach.mock');
      return mockGenerateTrainingPlan(studentId, goal, weeks);
    }
  } catch (error) {
    console.warn('[generateTrainingPlan] Fallback:', error);
    return { name: '', goal, duration_weeks: weeks, weeks: [], reasoning: '' };
  }
}

export async function adjustPlan(planId: string, feedback: string): Promise<PlanAdjustment> {
  try {
    if (isMock()) {
      const { mockAdjustPlan } = await import('@/lib/mocks/ai-coach.mock');
      return mockAdjustPlan(planId, feedback);
    }
    try {
      const res = await fetch('/api/ai/adjust-plan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ planId, feedback }) });
      if (!res.ok) {
        console.warn('[adjustPlan] API error:', res.status);
        return { changes: [], reasoning: '', updated_plan_id: planId };
      }
      return res.json();
    } catch {
      console.warn('[ai-coach.adjustPlan] API not available, using mock fallback');
      const { mockAdjustPlan } = await import('@/lib/mocks/ai-coach.mock');
      return mockAdjustPlan(planId, feedback);
    }
  } catch (error) {
    console.warn('[adjustPlan] Fallback:', error);
    return { changes: [], reasoning: '', updated_plan_id: planId };
  }
}

export async function generatePeriodization(studentId: string, competitionDate: string): Promise<GeneratedPeriodization> {
  try {
    if (isMock()) {
      const { mockGeneratePeriodization } = await import('@/lib/mocks/ai-coach.mock');
      return mockGeneratePeriodization(studentId, competitionDate);
    }
    try {
      const res = await fetch('/api/ai/generate-periodization', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId, competitionDate }) });
      if (!res.ok) {
        console.warn('[generatePeriodization] API error:', res.status);
        return { competition_name: '', competition_date: competitionDate, phases: [], reasoning: '' };
      }
      return res.json();
    } catch {
      console.warn('[ai-coach.generatePeriodization] API not available, using mock fallback');
      const { mockGeneratePeriodization } = await import('@/lib/mocks/ai-coach.mock');
      return mockGeneratePeriodization(studentId, competitionDate);
    }
  } catch (error) {
    console.warn('[generatePeriodization] Fallback:', error);
    return { competition_name: '', competition_date: competitionDate, phases: [], reasoning: '' };
  }
}

export async function weeklyCheckIn(planId: string): Promise<WeeklyCheckInResult> {
  try {
    if (isMock()) {
      const { mockWeeklyCheckIn } = await import('@/lib/mocks/ai-coach.mock');
      return mockWeeklyCheckIn(planId);
    }
    try {
      const res = await fetch('/api/ai/weekly-checkin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ planId }) });
      if (!res.ok) {
        console.warn('[weeklyCheckIn] API error:', res.status);
        return { summary: '', adherence_pct: 0, highlights: [], adjustments: [], motivation: '' };
      }
      return res.json();
    } catch {
      console.warn('[ai-coach.weeklyCheckIn] API not available, using mock fallback');
      const { mockWeeklyCheckIn } = await import('@/lib/mocks/ai-coach.mock');
      return mockWeeklyCheckIn(planId);
    }
  } catch (error) {
    console.warn('[weeklyCheckIn] Fallback:', error);
    return { summary: '', adherence_pct: 0, highlights: [], adjustments: [], motivation: '' };
  }
}
