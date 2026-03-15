import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

export type PlanStatus = 'active' | 'completed' | 'archived';

export interface Exercise {
  id: string;
  name: string;
  sets?: number;
  reps?: string;
  duration_min?: number;
  notes?: string;
  completed?: boolean;
}

export interface Session {
  id: string;
  day_of_week: number;
  label: string;
  exercises: Exercise[];
}

export interface PlanWeek {
  week_number: number;
  theme: string;
  sessions: Session[];
}

export interface TrainingPlanDTO {
  id: string;
  student_id: string;
  created_by: string;
  name: string;
  goal: string;
  duration_weeks: number;
  weeks: PlanWeek[];
  status: PlanStatus;
  created_at: string;
  adherence_pct?: number;
}

export interface ExerciseLog {
  exercise_id: string;
  session_id: string;
  week_number: number;
  completed_at: string;
  notes?: string;
}

export async function createPlan(plan: Omit<TrainingPlanDTO, 'id' | 'created_at' | 'adherence_pct'>): Promise<TrainingPlanDTO> {
  try {
    if (isMock()) {
      const { mockCreatePlan } = await import('@/lib/mocks/training-plan.mock');
      return mockCreatePlan(plan);
    }
    const res = await fetch('/api/training-plans', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(plan) });
    if (!res.ok) throw new ServiceError(res.status, 'trainingPlan.create');
    return res.json();
  } catch (error) { handleServiceError(error, 'trainingPlan.create'); }
}

export async function getActivePlan(studentId: string): Promise<TrainingPlanDTO | null> {
  try {
    if (isMock()) {
      const { mockGetActivePlan } = await import('@/lib/mocks/training-plan.mock');
      return mockGetActivePlan(studentId);
    }
    const res = await fetch(`/api/training-plans/active?studentId=${studentId}`);
    if (!res.ok) throw new ServiceError(res.status, 'trainingPlan.active');
    return res.json();
  } catch (error) { handleServiceError(error, 'trainingPlan.active'); }
}

export async function getPlans(studentId: string): Promise<TrainingPlanDTO[]> {
  try {
    if (isMock()) {
      const { mockGetPlans } = await import('@/lib/mocks/training-plan.mock');
      return mockGetPlans(studentId);
    }
    const res = await fetch(`/api/training-plans?studentId=${studentId}`);
    if (!res.ok) throw new ServiceError(res.status, 'trainingPlan.list');
    return res.json();
  } catch (error) { handleServiceError(error, 'trainingPlan.list'); }
}

export async function updatePlan(id: string, data: Partial<TrainingPlanDTO>): Promise<TrainingPlanDTO> {
  try {
    if (isMock()) {
      const { mockUpdatePlan } = await import('@/lib/mocks/training-plan.mock');
      return mockUpdatePlan(id, data);
    }
    const res = await fetch(`/api/training-plans/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) throw new ServiceError(res.status, 'trainingPlan.update');
    return res.json();
  } catch (error) { handleServiceError(error, 'trainingPlan.update'); }
}

export async function logExercise(planId: string, log: ExerciseLog): Promise<void> {
  try {
    if (isMock()) {
      const { mockLogExercise } = await import('@/lib/mocks/training-plan.mock');
      return mockLogExercise(planId, log);
    }
    const res = await fetch(`/api/training-plans/${planId}/log`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(log) });
    if (!res.ok) throw new ServiceError(res.status, 'trainingPlan.log');
  } catch (error) { handleServiceError(error, 'trainingPlan.log'); }
}
