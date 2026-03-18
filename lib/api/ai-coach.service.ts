import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

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
      return res.json().then((r: { suggestion: string }) => r.suggestion);
    } catch {
      console.warn('[ai-coach.getTrainingSuggestion] API not available, using fallback');
      return '';
    }
  } catch (error) { handleServiceError(error, 'aiCoach.suggestion'); }
}

export async function analyzePerformance(studentId: string): Promise<PerformanceAnalysis> {
  try {
    if (isMock()) {
      const { mockAnalyzePerformance } = await import('@/lib/mocks/ai-coach.mock');
      return mockAnalyzePerformance(studentId);
    }
    try {
      const res = await fetch('/api/ai/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId }) });
      return res.json();
    } catch {
      console.warn('[ai-coach.analyzePerformance] API not available, using fallback');
      return { summary: "", strengths: [], weaknesses: [], recommendations: [] } as unknown as PerformanceAnalysis;
    }
  } catch (error) { handleServiceError(error, 'aiCoach.analyze'); }
}

export async function generateClassPlan(professorId: string, classId: string): Promise<ClassPlan> {
  try {
    if (isMock()) {
      const { mockGenerateClassPlan } = await import('@/lib/mocks/ai-coach.mock');
      return mockGenerateClassPlan(professorId, classId);
    }
    try {
      const res = await fetch('/api/ai/class-plan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ professorId, classId }) });
      return res.json();
    } catch {
      console.warn('[ai-coach.generateClassPlan] API not available, using fallback');
      return { title: "", duration_min: 0, warmup: [], main: [], cooldown: [], notes: "" } as unknown as ClassPlan;
    }
  } catch (error) { handleServiceError(error, 'aiCoach.classPlan'); }
}

export async function answerQuestion(studentId: string, question: string): Promise<string> {
  try {
    if (isMock()) {
      const { mockAnswerQuestion } = await import('@/lib/mocks/ai-coach.mock');
      return mockAnswerQuestion(studentId, question);
    }
    try {
      const res = await fetch('/api/ai/ask', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId, question }) });
      return res.json().then((r: { answer: string }) => r.answer);
    } catch {
      console.warn('[ai-coach.answerQuestion] API not available, using fallback');
      return '';
    }
  } catch (error) { handleServiceError(error, 'aiCoach.answer'); }
}

export async function generateTrainingPlan(studentId: string, goal: string, weeks: number): Promise<GeneratedTrainingPlan> {
  try {
    if (isMock()) {
      const { mockGenerateTrainingPlan } = await import('@/lib/mocks/ai-coach.mock');
      return mockGenerateTrainingPlan(studentId, goal, weeks);
    }
    try {
      const res = await fetch('/api/ai/generate-plan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId, goal, weeks }) });
      return res.json();
    } catch {
      console.warn('[ai-coach.generateTrainingPlan] API not available, using fallback');
      return { id: "", name: "", goal: "", duration_weeks: 0, weeks: [], notes: "" } as unknown as GeneratedTrainingPlan;
    }
  } catch (error) { handleServiceError(error, 'aiCoach.generatePlan'); }
}

export async function adjustPlan(planId: string, feedback: string): Promise<PlanAdjustment> {
  try {
    if (isMock()) {
      const { mockAdjustPlan } = await import('@/lib/mocks/ai-coach.mock');
      return mockAdjustPlan(planId, feedback);
    }
    try {
      const res = await fetch('/api/ai/adjust-plan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ planId, feedback }) });
      return res.json();
    } catch {
      console.warn('[ai-coach.adjustPlan] API not available, using fallback');
      return { original_plan_id: "", adjustments: [], reasoning: "" } as unknown as PlanAdjustment;
    }
  } catch (error) { handleServiceError(error, 'aiCoach.adjustPlan'); }
}

export async function generatePeriodization(studentId: string, competitionDate: string): Promise<GeneratedPeriodization> {
  try {
    if (isMock()) {
      const { mockGeneratePeriodization } = await import('@/lib/mocks/ai-coach.mock');
      return mockGeneratePeriodization(studentId, competitionDate);
    }
    try {
      const res = await fetch('/api/ai/generate-periodization', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId, competitionDate }) });
      return res.json();
    } catch {
      console.warn('[ai-coach.generatePeriodization] API not available, using fallback');
      return { competition_name: "", competition_date: "", phases: [], notes: "" } as unknown as GeneratedPeriodization;
    }
  } catch (error) { handleServiceError(error, 'aiCoach.generatePeriodization'); }
}

export async function weeklyCheckIn(planId: string): Promise<WeeklyCheckInResult> {
  try {
    if (isMock()) {
      const { mockWeeklyCheckIn } = await import('@/lib/mocks/ai-coach.mock');
      return mockWeeklyCheckIn(planId);
    }
    try {
      const res = await fetch('/api/ai/weekly-checkin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ planId }) });
      return res.json();
    } catch {
      console.warn('[ai-coach.weeklyCheckIn] API not available, using fallback');
      return { summary: "", progress_score: 0, adjustments: [], motivation_message: "" } as unknown as WeeklyCheckInResult;
    }
  } catch (error) { handleServiceError(error, 'aiCoach.weeklyCheckIn'); }
}
