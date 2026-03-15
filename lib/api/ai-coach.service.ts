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

export async function getTrainingSuggestion(studentId: string): Promise<string> {
  try {
    if (isMock()) {
      const { mockGetTrainingSuggestion } = await import('@/lib/mocks/ai-coach.mock');
      return mockGetTrainingSuggestion(studentId);
    }
    const res = await fetch('/api/ai/training-suggestion', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId }) });
    return res.json().then((r: { suggestion: string }) => r.suggestion);
  } catch (error) { handleServiceError(error, 'aiCoach.suggestion'); }
}

export async function analyzePerformance(studentId: string): Promise<PerformanceAnalysis> {
  try {
    if (isMock()) {
      const { mockAnalyzePerformance } = await import('@/lib/mocks/ai-coach.mock');
      return mockAnalyzePerformance(studentId);
    }
    const res = await fetch('/api/ai/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId }) });
    return res.json();
  } catch (error) { handleServiceError(error, 'aiCoach.analyze'); }
}

export async function generateClassPlan(professorId: string, classId: string): Promise<ClassPlan> {
  try {
    if (isMock()) {
      const { mockGenerateClassPlan } = await import('@/lib/mocks/ai-coach.mock');
      return mockGenerateClassPlan(professorId, classId);
    }
    const res = await fetch('/api/ai/class-plan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ professorId, classId }) });
    return res.json();
  } catch (error) { handleServiceError(error, 'aiCoach.classPlan'); }
}

export async function answerQuestion(studentId: string, question: string): Promise<string> {
  try {
    if (isMock()) {
      const { mockAnswerQuestion } = await import('@/lib/mocks/ai-coach.mock');
      return mockAnswerQuestion(studentId, question);
    }
    const res = await fetch('/api/ai/ask', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId, question }) });
    return res.json().then((r: { answer: string }) => r.answer);
  } catch (error) { handleServiceError(error, 'aiCoach.answer'); }
}
