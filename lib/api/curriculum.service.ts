import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

export type RequirementCategory = 'tecnicas_obrigatorias' | 'opcionais' | 'teoricos' | 'comportamentais';

export const REQUIREMENT_CATEGORY_LABEL: Record<RequirementCategory, string> = {
  tecnicas_obrigatorias: 'Técnicas Obrigatórias',
  opcionais: 'Opcionais',
  teoricos: 'Teóricos',
  comportamentais: 'Comportamentais',
};

export interface CurriculumRequirement {
  id: string;
  category: RequirementCategory;
  name: string;
  description: string;
  video_ref_id?: string;
  required: boolean;
}

export interface CurriculumDTO {
  id: string;
  academy_id: string;
  modality: string;
  target_belt: string;
  requirements: CurriculumRequirement[];
  min_time_months: number;
  min_attendance: number;
  min_evaluation_score: number;
  notes: string;
}

export interface StudentCurriculumProgress {
  curriculum: CurriculumDTO;
  completed: string[];
  total: number;
  completedCount: number;
  percentage: number;
}

export async function getCurriculum(academyId: string, modality: string, belt: string): Promise<CurriculumDTO | null> {
  try {
    if (isMock()) {
      const { mockGetCurriculum } = await import('@/lib/mocks/curriculum.mock');
      return mockGetCurriculum(academyId, modality, belt);
    }
    try {
      const res = await fetch(`/api/curriculum?academyId=${academyId}&modality=${modality}&belt=${belt}`);
      if (!res.ok) throw new ServiceError(res.status, 'curriculum.get');
      return res.json();
    } catch {
      console.warn('[curriculum.getCurriculum] API not available, using fallback');
      return null;
    }
  } catch (error) { handleServiceError(error, 'curriculum.get'); }
}

export async function createCurriculum(curriculum: Omit<CurriculumDTO, 'id'>): Promise<CurriculumDTO> {
  try {
    if (isMock()) {
      const { mockCreateCurriculum } = await import('@/lib/mocks/curriculum.mock');
      return mockCreateCurriculum(curriculum);
    }
    try {
      const res = await fetch('/api/curriculum', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(curriculum) });
      if (!res.ok) throw new ServiceError(res.status, 'curriculum.create');
      return res.json();
    } catch {
      console.warn('[curriculum.createCurriculum] API not available, using fallback');
      return { id: "", academy_id: "", modality: "", belt_level: "white", name: "", requirements: [], created_at: "" } as unknown as CurriculumDTO;
    }
  } catch (error) { handleServiceError(error, 'curriculum.create'); }
}

export async function updateCurriculum(id: string, data: Partial<CurriculumDTO>): Promise<CurriculumDTO> {
  try {
    if (isMock()) {
      const { mockUpdateCurriculum } = await import('@/lib/mocks/curriculum.mock');
      return mockUpdateCurriculum(id, data);
    }
    try {
      const res = await fetch(`/api/curriculum/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new ServiceError(res.status, 'curriculum.update');
      return res.json();
    } catch {
      console.warn('[curriculum.updateCurriculum] API not available, using fallback');
      return { id: "", academy_id: "", modality: "", belt_level: "white", name: "", requirements: [], created_at: "" } as unknown as CurriculumDTO;
    }
  } catch (error) { handleServiceError(error, 'curriculum.update'); }
}

export async function addRequirement(curriculumId: string, requirement: Omit<CurriculumRequirement, 'id'>): Promise<CurriculumRequirement> {
  try {
    if (isMock()) {
      const { mockAddRequirement } = await import('@/lib/mocks/curriculum.mock');
      return mockAddRequirement(curriculumId, requirement);
    }
    try {
      const res = await fetch(`/api/curriculum/${curriculumId}/requirements`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requirement) });
      if (!res.ok) throw new ServiceError(res.status, 'curriculum.addReq');
      return res.json();
    } catch {
      console.warn('[curriculum.addRequirement] API not available, using fallback');
      return { id: "", curriculum_id: "", name: "", description: "", category: "", required: true } as unknown as CurriculumRequirement;
    }
  } catch (error) { handleServiceError(error, 'curriculum.addReq'); }
}

export async function removeRequirement(curriculumId: string, requirementId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockRemoveRequirement } = await import('@/lib/mocks/curriculum.mock');
      return mockRemoveRequirement(curriculumId, requirementId);
    }
    try {
      const res = await fetch(`/api/curriculum/${curriculumId}/requirements/${requirementId}`, { method: 'DELETE' });
      if (!res.ok) throw new ServiceError(res.status, 'curriculum.removeReq');
    } catch {
      console.warn('[curriculum.removeRequirement] API not available, using fallback');
    }
  } catch (error) { handleServiceError(error, 'curriculum.removeReq'); }
}

export async function getStudentProgress(studentId: string, modality: string, belt: string): Promise<StudentCurriculumProgress> {
  try {
    if (isMock()) {
      const { mockGetStudentProgress } = await import('@/lib/mocks/curriculum.mock');
      return mockGetStudentProgress(studentId, modality, belt);
    }
    try {
      const res = await fetch(`/api/curriculum/progress?studentId=${studentId}&modality=${modality}&belt=${belt}`);
      if (!res.ok) throw new ServiceError(res.status, 'curriculum.progress');
      return res.json();
    } catch {
      console.warn('[curriculum.getStudentProgress] API not available, using fallback');
      return { student_id: "", curriculum_id: "", total_requirements: 0, completed_requirements: 0, progress_pct: 0, requirements: [] } as unknown as StudentCurriculumProgress;
    }
  } catch (error) { handleServiceError(error, 'curriculum.progress'); }
}
