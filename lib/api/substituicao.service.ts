import { isMock } from '@/lib/env';

export interface SubstitutionDTO {
  id: string;
  classId: string;
  className: string;
  date: string;
  timeSlot: string;
  originalTeacherId: string;
  originalTeacherName: string;
  substituteTeacherId: string;
  substituteTeacherName: string;
  reason: string;
  notifiedStudents: number;
  createdAt: string;
}

export interface AvailableTeacherDTO {
  id: string;
  name: string;
  specialties: string[];
  available: boolean;
}

export interface CreateSubstitutionData {
  classId: string;
  date: string;
  timeSlot: string;
  originalTeacherId: string;
  substituteTeacherId: string;
  reason: string;
}

export async function getSubstitutions(academyId: string): Promise<SubstitutionDTO[]> {
  try {
    if (isMock()) {
      const { mockGetSubstitutions } = await import('@/lib/mocks/substituicao.mock');
      return mockGetSubstitutions(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('substitutions')
      .select('*')
      .eq('academy_id', academyId)
      .order('date', { ascending: false });

    if (error || !data) {
      console.error('[getSubstitutions] Supabase error:', error?.message);
      return [];
    }

    return data as unknown as SubstitutionDTO[];
  } catch (error) {
    console.error('[getSubstitutions] Fallback:', error);
    return [];
  }
}

export async function createSubstitution(data: CreateSubstitutionData): Promise<SubstitutionDTO> {
  try {
    if (isMock()) {
      const { mockCreateSubstitution } = await import('@/lib/mocks/substituicao.mock');
      return mockCreateSubstitution(data);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: row, error } = await supabase
      .from('substitutions')
      .insert({
        class_id: data.classId,
        date: data.date,
        time_slot: data.timeSlot,
        original_teacher_id: data.originalTeacherId,
        substitute_teacher_id: data.substituteTeacherId,
        reason: data.reason,
      })
      .select()
      .single();

    if (error || !row) {
      console.error('[createSubstitution] Supabase error:', error?.message);
      return { id: '', ...data, className: '', originalTeacherName: '', substituteTeacherName: '', notifiedStudents: 0, createdAt: '' };
    }

    return row as unknown as SubstitutionDTO;
  } catch (error) {
    console.error('[createSubstitution] Fallback:', error);
    return { id: '', ...data, className: '', originalTeacherName: '', substituteTeacherName: '', notifiedStudents: 0, createdAt: '' };
  }
}

export async function getAvailableTeachers(date: string, timeSlot: string): Promise<AvailableTeacherDTO[]> {
  try {
    if (isMock()) {
      const { mockGetAvailableTeachers } = await import('@/lib/mocks/substituicao.mock');
      return mockGetAvailableTeachers(date, timeSlot);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('professors')
      .select('id, name, specialties')
      .eq('active', true);

    if (error || !data) {
      console.error('[getAvailableTeachers] Supabase error:', error?.message);
      return [];
    }

    // Mark all as available for now; real logic would check schedule conflicts
    void date;
    void timeSlot;
    return (data ?? []).map((row: Record<string, unknown>) => ({
      id: String(row.id ?? ''),
      name: String(row.name ?? ''),
      specialties: (row.specialties ?? []) as string[],
      available: true,
    }));
  } catch (error) {
    console.error('[getAvailableTeachers] Fallback:', error);
    return [];
  }
}
