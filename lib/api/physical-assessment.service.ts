import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

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
    const res = await fetch('/api/physical-assessments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(assessment) });
    if (!res.ok) throw new ServiceError(res.status, 'physicalAssessment.create');
    return res.json();
  } catch (error) { handleServiceError(error, 'physicalAssessment.create'); }
}

export async function getHistory(studentId: string): Promise<PhysicalAssessmentDTO[]> {
  try {
    if (isMock()) {
      const { mockGetHistory } = await import('@/lib/mocks/physical-assessment.mock');
      return mockGetHistory(studentId);
    }
    const res = await fetch(`/api/physical-assessments?studentId=${studentId}`);
    if (!res.ok) throw new ServiceError(res.status, 'physicalAssessment.history');
    return res.json();
  } catch (error) { handleServiceError(error, 'physicalAssessment.history'); }
}

export async function getLatest(studentId: string): Promise<PhysicalAssessmentDTO | null> {
  try {
    if (isMock()) {
      const { mockGetLatest } = await import('@/lib/mocks/physical-assessment.mock');
      return mockGetLatest(studentId);
    }
    const res = await fetch(`/api/physical-assessments/latest?studentId=${studentId}`);
    if (!res.ok) throw new ServiceError(res.status, 'physicalAssessment.latest');
    return res.json();
  } catch (error) { handleServiceError(error, 'physicalAssessment.latest'); }
}

export async function compareAssessments(studentId: string, assessmentId1: string, assessmentId2: string): Promise<AssessmentComparison> {
  try {
    if (isMock()) {
      const { mockCompareAssessments } = await import('@/lib/mocks/physical-assessment.mock');
      return mockCompareAssessments(studentId, assessmentId1, assessmentId2);
    }
    const res = await fetch(`/api/physical-assessments/compare?studentId=${studentId}&a=${assessmentId1}&b=${assessmentId2}`);
    if (!res.ok) throw new ServiceError(res.status, 'physicalAssessment.compare');
    return res.json();
  } catch (error) { handleServiceError(error, 'physicalAssessment.compare'); }
}
