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
  try {
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
      console.warn('[listClasses] Supabase error:', error?.message);
      return [];
    }
    return data as unknown as ClassItem[];
  } catch (error) {
    console.warn('[listClasses] Fallback:', error);
    return [];
  }
}

export async function getClass(id: string): Promise<ClassItem> {
  try {
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
      console.warn('[getClass] Supabase error:', error?.message);
      return {} as ClassItem;
    }
    return data as unknown as ClassItem;
  } catch (error) {
    console.warn('[getClass] Fallback:', error);
    return {} as ClassItem;
  }
}

export async function createClass(data: CreateClassDTO): Promise<ClassItem> {
  try {
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
      console.warn('[createClass] Supabase error:', error?.message);
      return {} as ClassItem;
    }
    return row as unknown as ClassItem;
  } catch (error) {
    console.warn('[createClass] Fallback:', error);
    return {} as ClassItem;
  }
}

export async function updateClass(id: string, data: UpdateClassDTO): Promise<ClassItem> {
  try {
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
      console.warn('[updateClass] Supabase error:', error?.message);
      return {} as ClassItem;
    }
    return row as unknown as ClassItem;
  } catch (error) {
    console.warn('[updateClass] Fallback:', error);
    return {} as ClassItem;
  }
}

export async function deleteClass(id: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockDeleteClass } = await import('@/lib/mocks/class.mock');
      return mockDeleteClass(id);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase.from('classes').delete().eq('id', id);
    if (error) {
      console.warn('[deleteClass] Supabase error:', error.message);
    }
  } catch (error) {
    console.warn('[deleteClass] Fallback:', error);
  }
}

export async function getClassStudents(classId: string): Promise<ClassStudent[]> {
  try {
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
      console.warn('[getClassStudents] Supabase error:', error?.message);
      return [];
    }
    return data as unknown as ClassStudent[];
  } catch (error) {
    console.warn('[getClassStudents] Fallback:', error);
    return [];
  }
}

export async function addStudent(classId: string, studentId: string): Promise<ClassStudent> {
  try {
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
      console.warn('[addStudent] Supabase error:', error?.message);
      return {} as ClassStudent;
    }
    return data as unknown as ClassStudent;
  } catch (error) {
    console.warn('[addStudent] Fallback:', error);
    return {} as ClassStudent;
  }
}

export async function removeStudent(classId: string, studentId: string): Promise<void> {
  try {
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
      console.warn('[removeStudent] Supabase error:', error.message);
    }
  } catch (error) {
    console.warn('[removeStudent] Fallback:', error);
  }
}

export async function getSchedule(academyId: string): Promise<ScheduleEntry[]> {
  try {
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
      console.warn('[getSchedule] Supabase error:', error?.message);
      return [];
    }
    return data as unknown as ScheduleEntry[];
  } catch (error) {
    console.warn('[getSchedule] Fallback:', error);
    return [];
  }
}
