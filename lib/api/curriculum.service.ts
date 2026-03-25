import { isMock } from '@/lib/env';

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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('curricula')
      .select('*')
      .eq('academy_id', academyId)
      .eq('modality', modality)
      .eq('target_belt', belt)
      .single();
    if (error || !data) {
      console.error('[getCurriculum] Supabase error:', error?.message);
      return null;
    }
    return data as unknown as CurriculumDTO;
  } catch (error) {
    console.error('[getCurriculum] Fallback:', error);
    return null;
  }
}

export async function createCurriculum(curriculum: Omit<CurriculumDTO, 'id'>): Promise<CurriculumDTO> {
  try {
    if (isMock()) {
      const { mockCreateCurriculum } = await import('@/lib/mocks/curriculum.mock');
      return mockCreateCurriculum(curriculum);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('curricula')
      .insert(curriculum)
      .select()
      .single();
    if (error || !data) {
      console.error('[createCurriculum] Supabase error:', error?.message);
      return {} as CurriculumDTO;
    }
    return data as unknown as CurriculumDTO;
  } catch (error) {
    console.error('[createCurriculum] Fallback:', error);
    return {} as CurriculumDTO;
  }
}

export async function updateCurriculum(id: string, data: Partial<CurriculumDTO>): Promise<CurriculumDTO> {
  try {
    if (isMock()) {
      const { mockUpdateCurriculum } = await import('@/lib/mocks/curriculum.mock');
      return mockUpdateCurriculum(id, data);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: row, error } = await supabase
      .from('curricula')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error || !row) {
      console.error('[updateCurriculum] Supabase error:', error?.message);
      return {} as CurriculumDTO;
    }
    return row as unknown as CurriculumDTO;
  } catch (error) {
    console.error('[updateCurriculum] Fallback:', error);
    return {} as CurriculumDTO;
  }
}

export async function addRequirement(curriculumId: string, requirement: Omit<CurriculumRequirement, 'id'>): Promise<CurriculumRequirement> {
  try {
    if (isMock()) {
      const { mockAddRequirement } = await import('@/lib/mocks/curriculum.mock');
      return mockAddRequirement(curriculumId, requirement);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('curriculum_requirements')
      .insert({ curriculum_id: curriculumId, ...requirement })
      .select()
      .single();
    if (error || !data) {
      console.error('[addRequirement] Supabase error:', error?.message);
      return {} as CurriculumRequirement;
    }
    return data as unknown as CurriculumRequirement;
  } catch (error) {
    console.error('[addRequirement] Fallback:', error);
    return {} as CurriculumRequirement;
  }
}

export async function removeRequirement(curriculumId: string, requirementId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockRemoveRequirement } = await import('@/lib/mocks/curriculum.mock');
      return mockRemoveRequirement(curriculumId, requirementId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from('curriculum_requirements')
      .delete()
      .eq('id', requirementId)
      .eq('curriculum_id', curriculumId);
    if (error) {
      console.error('[removeRequirement] Supabase error:', error.message);
    }
  } catch (error) {
    console.error('[removeRequirement] Fallback:', error);
  }
}

export async function getStudentProgress(studentId: string, modality: string, belt: string): Promise<StudentCurriculumProgress> {
  const fallback: StudentCurriculumProgress = { curriculum: {} as CurriculumDTO, completed: [], total: 0, completedCount: 0, percentage: 0 };
  try {
    if (isMock()) {
      const { mockGetStudentProgress } = await import('@/lib/mocks/curriculum.mock');
      return mockGetStudentProgress(studentId, modality, belt);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('student_curriculum_progress')
      .select('*')
      .eq('student_id', studentId)
      .eq('modality', modality)
      .eq('target_belt', belt)
      .single();
    if (error || !data) {
      console.error('[getStudentProgress] Supabase error:', error?.message);
      return fallback;
    }
    return data as unknown as StudentCurriculumProgress;
  } catch (error) {
    console.error('[getStudentProgress] Fallback:', error);
    return fallback;
  }
}
