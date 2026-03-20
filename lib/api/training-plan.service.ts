import { isMock } from '@/lib/env';

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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('training_plans')
      .insert(plan)
      .select()
      .single();
    if (error || !data) {
      console.warn('[createPlan] Supabase error:', error?.message);
      const { mockCreatePlan } = await import('@/lib/mocks/training-plan.mock');
      return mockCreatePlan(plan);
    }
    return data as unknown as TrainingPlanDTO;
  } catch (error) {
    console.warn('[createPlan] Fallback:', error);
    const { mockCreatePlan } = await import('@/lib/mocks/training-plan.mock');
    return mockCreatePlan(plan);
  }
}

export async function getActivePlan(studentId: string): Promise<TrainingPlanDTO | null> {
  try {
    if (isMock()) {
      const { mockGetActivePlan } = await import('@/lib/mocks/training-plan.mock');
      return mockGetActivePlan(studentId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('training_plans')
      .select('*')
      .eq('student_id', studentId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      console.warn('[getActivePlan] Supabase error:', error.message);
      return null;
    }
    return (data as unknown as TrainingPlanDTO) ?? null;
  } catch (error) {
    console.warn('[getActivePlan] Fallback:', error);
    return null;
  }
}

export async function getPlans(studentId: string): Promise<TrainingPlanDTO[]> {
  try {
    if (isMock()) {
      const { mockGetPlans } = await import('@/lib/mocks/training-plan.mock');
      return mockGetPlans(studentId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('training_plans')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('[getPlans] Supabase error:', error.message);
      return [];
    }
    return (data ?? []) as unknown as TrainingPlanDTO[];
  } catch (error) {
    console.warn('[getPlans] Fallback:', error);
    return [];
  }
}

export async function updatePlan(id: string, data: Partial<TrainingPlanDTO>): Promise<TrainingPlanDTO> {
  try {
    if (isMock()) {
      const { mockUpdatePlan } = await import('@/lib/mocks/training-plan.mock');
      return mockUpdatePlan(id, data);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: row, error } = await supabase
      .from('training_plans')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error || !row) {
      console.warn('[updatePlan] Supabase error:', error?.message);
      const { mockUpdatePlan } = await import('@/lib/mocks/training-plan.mock');
      return mockUpdatePlan(id, data);
    }
    return row as unknown as TrainingPlanDTO;
  } catch (error) {
    console.warn('[updatePlan] Fallback:', error);
    const { mockUpdatePlan } = await import('@/lib/mocks/training-plan.mock');
    return mockUpdatePlan(id, data);
  }
}

export async function logExercise(planId: string, log: ExerciseLog): Promise<void> {
  try {
    if (isMock()) {
      const { mockLogExercise } = await import('@/lib/mocks/training-plan.mock');
      return mockLogExercise(planId, log);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from('exercise_logs')
      .insert({ plan_id: planId, ...log });
    if (error) {
      console.warn('[logExercise] Supabase error:', error.message);
    }
  } catch (error) {
    console.warn('[logExercise] Fallback:', error);
  }
}
