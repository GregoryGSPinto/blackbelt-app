import { isMock } from '@/lib/env';
import type {
  ClassItem,
  ClassStudent,
  CreateClassDTO,
  UpdateClassDTO,
  ClassFilters,
  ScheduleEntry,
} from '@/lib/types/class';

// ────────────────────────────────────────────────────────────
// Class CRUD Service
// ────────────────────────────────────────────────────────────

export async function listClasses(
  academyId: string,
  filters?: ClassFilters,
): Promise<ClassItem[]> {
  if (isMock()) {
    const { mockListClasses } = await import('@/lib/mocks/class.mock');
    return mockListClasses(academyId, filters);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  let query = supabase.from('classes').select('*').eq('academy_id', academyId);
  if (filters?.modality) query = query.eq('modality', filters.modality);
  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.professor_id) query = query.eq('professor_id', filters.professor_id);
  const { data, error } = await query;
  if (error || !data) {
    console.error('[listClasses] Supabase error:', error?.message);
    return [];
  }
  return data as unknown as ClassItem[];
}

export async function getClass(id: string): Promise<ClassItem> {
  if (isMock()) {
    const { mockGetClass } = await import('@/lib/mocks/class.mock');
    return mockGetClass(id);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !data) {
    console.error('[getClass] Supabase error:', error?.message);
    return {} as ClassItem;
  }
  return data as unknown as ClassItem;
}

export async function createClass(data: CreateClassDTO): Promise<ClassItem> {
  if (isMock()) {
    const { mockCreateClass } = await import('@/lib/mocks/class.mock');
    return mockCreateClass(data);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data: row, error } = await supabase
    .from('classes')
    .insert(data)
    .select()
    .single();
  if (error || !row) {
    console.error('[createClass] Supabase error:', error?.message);
    throw new Error(`[createClass] ${error?.message}`);
  }
  return row as unknown as ClassItem;
}

export async function updateClass(id: string, data: UpdateClassDTO): Promise<ClassItem> {
  if (isMock()) {
    const { mockUpdateClass } = await import('@/lib/mocks/class.mock');
    return mockUpdateClass(id, data);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data: row, error } = await supabase
    .from('classes')
    .update(data)
    .eq('id', id)
    .select()
    .single();
  if (error || !row) {
    console.error('[updateClass] Supabase error:', error?.message);
    throw new Error(`[updateClass] ${error?.message}`);
  }
  return row as unknown as ClassItem;
}

export async function deleteClass(id: string): Promise<void> {
  if (isMock()) {
    const { mockDeleteClass } = await import('@/lib/mocks/class.mock');
    return mockDeleteClass(id);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { error } = await supabase.from('classes').delete().eq('id', id);
  if (error) {
    console.error('[deleteClass] Supabase error:', error.message);
    throw new Error(`[deleteClass] ${error.message}`);
  }
}

export async function getClassStudents(classId: string): Promise<ClassStudent[]> {
  if (isMock()) {
    const { mockGetClassStudents } = await import('@/lib/mocks/class.mock');
    return mockGetClassStudents(classId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('class_students')
    .select('*, profiles(*)')
    .eq('class_id', classId);
  if (error || !data) {
    console.error('[getClassStudents] Supabase error:', error?.message);
    return [];
  }
  return data as unknown as ClassStudent[];
}

export async function addStudent(classId: string, studentId: string): Promise<ClassStudent> {
  if (isMock()) {
    const { mockAddStudent } = await import('@/lib/mocks/class.mock');
    return mockAddStudent(classId, studentId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('class_students')
    .insert({ class_id: classId, student_id: studentId })
    .select()
    .single();
  if (error || !data) {
    console.error('[addStudent] Supabase error:', error?.message);
    throw new Error(`[addStudent] ${error?.message}`);
  }
  return data as unknown as ClassStudent;
}

export async function removeStudent(classId: string, studentId: string): Promise<void> {
  if (isMock()) {
    const { mockRemoveStudent } = await import('@/lib/mocks/class.mock');
    return mockRemoveStudent(classId, studentId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { error } = await supabase
    .from('class_students')
    .delete()
    .eq('class_id', classId)
    .eq('student_id', studentId);
  if (error) {
    console.error('[removeStudent] Supabase error:', error.message);
    throw new Error(`[removeStudent] ${error.message}`);
  }
}

export async function getSchedule(academyId: string): Promise<ScheduleEntry[]> {
  if (isMock()) {
    const { mockGetSchedule } = await import('@/lib/mocks/class.mock');
    return mockGetSchedule(academyId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('class_schedule')
    .select('*')
    .eq('academy_id', academyId);
  if (error || !data) {
    console.error('[getSchedule] Supabase error:', error?.message);
    return [];
  }
  return data as unknown as ScheduleEntry[];
}
