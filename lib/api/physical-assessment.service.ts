import { isMock } from '@/lib/env';

export interface Measurements {
  weight_kg: number;
  height_cm: number;
  body_fat_pct: number;
  flexibility_score: number;
  grip_strength_kg: number;
}

export interface FitnessTests {
  pushups_1min: number;
  situps_1min: number;
  plank_seconds: number;
  beep_test_level: number;
  squat_max_kg: number;
  deadlift_max_kg: number;
  vo2max_estimate: number;
}

export interface PhysicalAssessmentDTO {
  id: string;
  student_id: string;
  assessed_by: string;
  date: string;
  measurements: Measurements;
  fitness_tests: FitnessTests;
  notes: string;
}

export interface AssessmentComparison {
  current: PhysicalAssessmentDTO;
  previous: PhysicalAssessmentDTO;
  deltas: {
    measurements: Record<keyof Measurements, number>;
    fitness_tests: Record<keyof FitnessTests, number>;
  };
}

export async function createAssessment(assessment: Omit<PhysicalAssessmentDTO, 'id'>): Promise<PhysicalAssessmentDTO> {
  try {
    if (isMock()) {
      const { mockCreateAssessment } = await import('@/lib/mocks/physical-assessment.mock');
      return mockCreateAssessment(assessment);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('physical_assessments')
      .insert({
        student_id: assessment.student_id,
        assessed_by: assessment.assessed_by,
        date: assessment.date,
        measurements: assessment.measurements,
        fitness_tests: assessment.fitness_tests,
        notes: assessment.notes,
      })
      .select()
      .single();

    if (error || !data) {
      console.warn('[createAssessment] Supabase error:', error?.message);
      return { id: '', ...assessment };
    }

    return {
      id: String(data.id),
      student_id: String(data.student_id),
      assessed_by: String(data.assessed_by),
      date: String(data.date),
      measurements: data.measurements as Measurements,
      fitness_tests: data.fitness_tests as FitnessTests,
      notes: String(data.notes ?? ''),
    };
  } catch (error) {
    console.warn('[createAssessment] Fallback:', error);
    return { id: '', ...assessment };
  }
}

export async function getHistory(studentId: string): Promise<PhysicalAssessmentDTO[]> {
  try {
    if (isMock()) {
      const { mockGetHistory } = await import('@/lib/mocks/physical-assessment.mock');
      return mockGetHistory(studentId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('physical_assessments')
      .select('*')
      .eq('student_id', studentId)
      .order('date', { ascending: false });

    if (error || !data) {
      console.warn('[getHistory] Supabase error:', error?.message);
      return [];
    }

    return (data ?? []).map((row: Record<string, unknown>) => ({
      id: String(row.id ?? ''),
      student_id: String(row.student_id ?? ''),
      assessed_by: String(row.assessed_by ?? ''),
      date: String(row.date ?? ''),
      measurements: (row.measurements ?? {}) as Measurements,
      fitness_tests: (row.fitness_tests ?? {}) as FitnessTests,
      notes: String(row.notes ?? ''),
    }));
  } catch (error) {
    console.warn('[getHistory] Fallback:', error);
    return [];
  }
}

export async function getLatest(studentId: string): Promise<PhysicalAssessmentDTO | null> {
  try {
    if (isMock()) {
      const { mockGetLatest } = await import('@/lib/mocks/physical-assessment.mock');
      return mockGetLatest(studentId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('physical_assessments')
      .select('*')
      .eq('student_id', studentId)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      console.warn('[getLatest] Supabase error:', error?.message);
      return null;
    }

    return {
      id: String(data.id),
      student_id: String(data.student_id),
      assessed_by: String(data.assessed_by),
      date: String(data.date),
      measurements: (data.measurements ?? {}) as Measurements,
      fitness_tests: (data.fitness_tests ?? {}) as FitnessTests,
      notes: String(data.notes ?? ''),
    };
  } catch (error) {
    console.warn('[getLatest] Fallback:', error);
    return null;
  }
}

export async function compareAssessments(studentId: string, assessmentId1: string, assessmentId2: string): Promise<AssessmentComparison> {
  try {
    if (isMock()) {
      const { mockCompareAssessments } = await import('@/lib/mocks/physical-assessment.mock');
      return mockCompareAssessments(studentId, assessmentId1, assessmentId2);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('physical_assessments')
      .select('*')
      .eq('student_id', studentId)
      .in('id', [assessmentId1, assessmentId2]);

    if (error || !data || data.length < 2) {
      console.warn('[compareAssessments] Supabase error:', error?.message);
      const empty = { id: '', student_id: studentId, assessed_by: '', date: '', measurements: {} as Measurements, fitness_tests: {} as FitnessTests, notes: '' };
      return { current: empty, previous: empty, deltas: { measurements: {} as Record<keyof Measurements, number>, fitness_tests: {} as Record<keyof FitnessTests, number> } };
    }

    const [a, b] = data as Record<string, unknown>[];
    const toDTO = (row: Record<string, unknown>): PhysicalAssessmentDTO => ({
      id: String(row.id ?? ''),
      student_id: String(row.student_id ?? ''),
      assessed_by: String(row.assessed_by ?? ''),
      date: String(row.date ?? ''),
      measurements: (row.measurements ?? {}) as Measurements,
      fitness_tests: (row.fitness_tests ?? {}) as FitnessTests,
      notes: String(row.notes ?? ''),
    });

    const current = toDTO(a);
    const previous = toDTO(b);
    const mKeys = Object.keys(current.measurements) as (keyof Measurements)[];
    const fKeys = Object.keys(current.fitness_tests) as (keyof FitnessTests)[];

    return {
      current,
      previous,
      deltas: {
        measurements: Object.fromEntries(mKeys.map(k => [k, (current.measurements[k] ?? 0) - (previous.measurements[k] ?? 0)])) as Record<keyof Measurements, number>,
        fitness_tests: Object.fromEntries(fKeys.map(k => [k, (current.fitness_tests[k] ?? 0) - (previous.fitness_tests[k] ?? 0)])) as Record<keyof FitnessTests, number>,
      },
    };
  } catch (error) {
    console.warn('[compareAssessments] Fallback:', error);
    const empty = { id: '', student_id: studentId, assessed_by: '', date: '', measurements: {} as Measurements, fitness_tests: {} as FitnessTests, notes: '' };
    return { current: empty, previous: empty, deltas: { measurements: {} as Record<keyof Measurements, number>, fitness_tests: {} as Record<keyof FitnessTests, number> } };
  }
}
