import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
import type { Class, ScheduleSlot, BeltLevel, EnrollmentStatus } from '@/lib/types';

export interface ClassFilters {
  modalityId?: string;
  unitId?: string;
  professorId?: string;
}

export interface ClassWithDetails extends Class {
  modality_name: string;
  professor_name: string;
  unit_name: string;
  enrolled_count: number;
  max_students: number;
}

export interface ClassDetail extends ClassWithDetails {
  enrolled_students: EnrolledStudentDTO[];
}

export interface EnrolledStudentDTO {
  student_id: string;
  profile_id: string;
  display_name: string;
  avatar: string | null;
  belt: BeltLevel;
  enrollment_status: EnrollmentStatus;
  enrolled_at: string;
}

export interface CreateClassRequest {
  modality_id: string;
  unit_id: string;
  professor_id: string;
  schedule: ScheduleSlot[];
  max_students: number;
}

export interface UpdateClassRequest {
  modality_id?: string;
  unit_id?: string;
  professor_id?: string;
  schedule?: ScheduleSlot[];
  max_students?: number;
}

export async function listClasses(academyId: string, filters?: ClassFilters): Promise<ClassWithDetails[]> {
  try {
    if (isMock()) {
      const { mockListClasses } = await import('@/lib/mocks/turmas.mock');
      return mockListClasses(academyId, filters);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    let query = supabase
      .from('classes')
      .select(`
        *,
        modalities!inner(name, academy_id),
        profiles!classes_professor_id_fkey(display_name),
        units!inner(name, academy_id),
        class_enrollments(count)
      `)
      .eq('units.academy_id', academyId);

    if (filters?.modalityId) query = query.eq('modality_id', filters.modalityId);
    if (filters?.unitId) query = query.eq('unit_id', filters.unitId);
    if (filters?.professorId) query = query.eq('professor_id', filters.professorId);

    const { data, error } = await query;
    if (error) throw new ServiceError(500, 'turmas.list', error.message);

    return (data ?? []).map((row: Record<string, unknown>) => {
      const modalities = row.modalities as Record<string, unknown> | null;
      const profiles = row.profiles as Record<string, unknown> | null;
      const units = row.units as Record<string, unknown> | null;
      const enrollments = row.class_enrollments as Array<Record<string, number>> | null;
      return {
        ...row,
        modality_name: modalities?.name ?? '',
        professor_name: profiles?.display_name ?? '',
        unit_name: units?.name ?? '',
        enrolled_count: enrollments?.[0]?.count ?? 0,
        max_students: (row.capacity as number) ?? 30,
      } as ClassWithDetails;
    });
  } catch (error) {
    handleServiceError(error, 'turmas.list');
  }
}

export async function getClassById(id: string): Promise<ClassDetail> {
  try {
    if (isMock()) {
      const { mockGetClassById } = await import('@/lib/mocks/turmas.mock');
      return mockGetClassById(id);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: classData, error } = await supabase
      .from('classes')
      .select(`
        *,
        modalities(name),
        profiles!classes_professor_id_fkey(display_name),
        units(name)
      `)
      .eq('id', id)
      .single();
    if (error) throw new ServiceError(404, 'turmas.getById', error.message);

    const { data: enrollments } = await supabase
      .from('class_enrollments')
      .select(`
        student_id,
        status,
        enrolled_at,
        students(
          id,
          profile_id,
          belt,
          profiles(display_name, avatar)
        )
      `)
      .eq('class_id', id);

    const enrolled_students: EnrolledStudentDTO[] = (enrollments ?? []).map((e: Record<string, unknown>) => {
      const student = e.students as Record<string, unknown> | null;
      const profile = student?.profiles as Record<string, unknown> | null;
      return {
        student_id: e.student_id as string,
        profile_id: (student?.profile_id ?? '') as string,
        display_name: (profile?.display_name ?? '') as string,
        avatar: (profile?.avatar ?? null) as string | null,
        belt: (student?.belt ?? 'white') as BeltLevel,
        enrollment_status: (e.status ?? 'active') as EnrollmentStatus,
        enrolled_at: (e.enrolled_at ?? '') as string,
      };
    });

    const modalities = classData.modalities as Record<string, unknown> | null;
    const profiles = classData.profiles as Record<string, unknown> | null;
    const units = classData.units as Record<string, unknown> | null;

    return {
      ...classData,
      modality_name: (modalities?.name ?? '') as string,
      professor_name: (profiles?.display_name ?? '') as string,
      unit_name: (units?.name ?? '') as string,
      enrolled_count: enrolled_students.length,
      max_students: classData.capacity ?? 30,
      enrolled_students,
    } as ClassDetail;
  } catch (error) {
    handleServiceError(error, 'turmas.getById');
  }
}

export async function createClass(data: CreateClassRequest): Promise<Class> {
  try {
    if (isMock()) {
      const { mockCreateClass } = await import('@/lib/mocks/turmas.mock');
      return mockCreateClass(data);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: classData, error } = await supabase
      .from('classes')
      .insert({
        modality_id: data.modality_id,
        unit_id: data.unit_id,
        professor_id: data.professor_id,
        schedule: data.schedule,
        capacity: data.max_students,
      })
      .select()
      .single();
    if (error) throw new ServiceError(400, 'turmas.create', error.message);
    return classData as Class;
  } catch (error) {
    handleServiceError(error, 'turmas.create');
  }
}

export async function updateClass(id: string, data: UpdateClassRequest): Promise<Class> {
  try {
    if (isMock()) {
      const { mockUpdateClass } = await import('@/lib/mocks/turmas.mock');
      return mockUpdateClass(id, data);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const updatePayload: Record<string, unknown> = {};
    if (data.modality_id) updatePayload.modality_id = data.modality_id;
    if (data.unit_id) updatePayload.unit_id = data.unit_id;
    if (data.professor_id) updatePayload.professor_id = data.professor_id;
    if (data.schedule) updatePayload.schedule = data.schedule;
    if (data.max_students !== undefined) updatePayload.capacity = data.max_students;

    const { data: classData, error } = await supabase
      .from('classes')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new ServiceError(400, 'turmas.update', error.message);
    return classData as Class;
  } catch (error) {
    handleServiceError(error, 'turmas.update');
  }
}

export async function deleteClass(id: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockDeleteClass } = await import('@/lib/mocks/turmas.mock');
      return mockDeleteClass(id);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase.from('classes').delete().eq('id', id);
    if (error) throw new ServiceError(400, 'turmas.delete', error.message);
  } catch (error) {
    handleServiceError(error, 'turmas.delete');
  }
}

export async function getClassesByProfessor(professorId: string): Promise<ClassWithDetails[]> {
  try {
    if (isMock()) {
      const { mockGetClassesByProfessor } = await import('@/lib/mocks/turmas.mock');
      return mockGetClassesByProfessor(professorId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('classes')
      .select(`
        *,
        modalities(name),
        profiles!classes_professor_id_fkey(display_name),
        units(name),
        class_enrollments(count)
      `)
      .eq('professor_id', professorId);
    if (error) throw new ServiceError(500, 'turmas.getByProfessor', error.message);

    return (data ?? []).map((row: Record<string, unknown>) => {
      const modalities = row.modalities as Record<string, unknown> | null;
      const profiles = row.profiles as Record<string, unknown> | null;
      const units = row.units as Record<string, unknown> | null;
      const enrollments = row.class_enrollments as Array<Record<string, number>> | null;
      return {
        ...row,
        modality_name: modalities?.name ?? '',
        professor_name: profiles?.display_name ?? '',
        unit_name: units?.name ?? '',
        enrolled_count: enrollments?.[0]?.count ?? 0,
        max_students: (row.capacity as number) ?? 30,
      } as ClassWithDetails;
    });
  } catch (error) {
    handleServiceError(error, 'turmas.getByProfessor');
  }
}
