import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

export type PreCheckinStatus = 'confirmed' | 'cancelled' | 'attended' | 'no_show';

export interface PreCheckin {
  id: string;
  academy_id: string;
  student_id: string;
  class_id: string;
  class_date: string;
  status: PreCheckinStatus;
  created_at: string;
}

const MOCK_PRE_CHECKINS: PreCheckin[] = [
  {
    id: 'pc-001',
    academy_id: 'acad-001',
    student_id: 'stu-001',
    class_id: 'cls-001',
    class_date: '2026-03-26',
    status: 'confirmed',
    created_at: '2026-03-26T08:00:00Z',
  },
  {
    id: 'pc-002',
    academy_id: 'acad-001',
    student_id: 'stu-002',
    class_id: 'cls-001',
    class_date: '2026-03-26',
    status: 'confirmed',
    created_at: '2026-03-26T08:15:00Z',
  },
  {
    id: 'pc-003',
    academy_id: 'acad-001',
    student_id: 'stu-003',
    class_id: 'cls-002',
    class_date: '2026-03-26',
    status: 'attended',
    created_at: '2026-03-26T07:30:00Z',
  },
  {
    id: 'pc-004',
    academy_id: 'acad-001',
    student_id: 'stu-001',
    class_id: 'cls-003',
    class_date: '2026-03-27',
    status: 'cancelled',
    created_at: '2026-03-26T09:00:00Z',
  },
];

export async function preCheckin(
  academyId: string,
  studentId: string,
  classId: string,
  date: string,
): Promise<PreCheckin | null> {
  if (isMock()) {
    const mock: PreCheckin = {
      id: `pc-${Date.now()}`,
      academy_id: academyId,
      student_id: studentId,
      class_id: classId,
      class_date: date,
      status: 'confirmed',
      created_at: new Date().toISOString(),
    };
    return mock;
  }
  try {
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('pre_checkins')
      .insert({
        academy_id: academyId,
        student_id: studentId,
        class_id: classId,
        class_date: date,
        status: 'confirmed',
      })
      .select()
      .single();
    if (error) {
      logServiceError(error, 'pre-checkin');
      return null;
    }
    return data as PreCheckin;
  } catch (error) {
    logServiceError(error, 'pre-checkin');
    return null;
  }
}

export async function cancelPreCheckin(preCheckinId: string): Promise<boolean> {
  if (isMock()) {
    return true;
  }
  try {
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from('pre_checkins')
      .update({ status: 'cancelled' })
      .eq('id', preCheckinId);
    if (error) {
      logServiceError(error, 'pre-checkin');
      return false;
    }
    return true;
  } catch (error) {
    logServiceError(error, 'pre-checkin');
    return false;
  }
}

export async function listPreCheckins(
  academyId: string,
  classId: string,
  date: string,
): Promise<PreCheckin[]> {
  if (isMock()) {
    return MOCK_PRE_CHECKINS.filter(
      (pc) =>
        pc.academy_id === academyId &&
        pc.class_id === classId &&
        pc.class_date === date &&
        pc.status === 'confirmed',
    );
  }
  try {
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('pre_checkins')
      .select('id, academy_id, student_id, class_id, class_date, status, created_at')
      .eq('academy_id', academyId)
      .eq('class_id', classId)
      .eq('class_date', date)
      .eq('status', 'confirmed');
    if (error) {
      logServiceError(error, 'pre-checkin');
      return [];
    }
    return (data ?? []) as PreCheckin[];
  } catch (error) {
    logServiceError(error, 'pre-checkin');
    return [];
  }
}

export async function myPreCheckins(
  studentId: string,
  date?: string,
): Promise<PreCheckin[]> {
  if (isMock()) {
    return MOCK_PRE_CHECKINS.filter(
      (pc) =>
        pc.student_id === studentId &&
        (!date || pc.class_date === date),
    );
  }
  try {
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    let query = supabase
      .from('pre_checkins')
      .select('id, academy_id, student_id, class_id, class_date, status, created_at')
      .eq('student_id', studentId);
    if (date) {
      query = query.eq('class_date', date);
    }
    const { data, error } = await query;
    if (error) {
      logServiceError(error, 'pre-checkin');
      return [];
    }
    return (data ?? []) as PreCheckin[];
  } catch (error) {
    logServiceError(error, 'pre-checkin');
    return [];
  }
}

export async function convertToAttendance(preCheckinId: string): Promise<boolean> {
  if (isMock()) {
    return true;
  }
  try {
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from('pre_checkins')
      .update({ status: 'attended' })
      .eq('id', preCheckinId);
    if (error) {
      logServiceError(error, 'pre-checkin');
      return false;
    }
    return true;
  } catch (error) {
    logServiceError(error, 'pre-checkin');
    return false;
  }
}

export async function getClassExpectedCount(
  classId: string,
  date: string,
): Promise<number> {
  if (isMock()) {
    return MOCK_PRE_CHECKINS.filter(
      (pc) =>
        pc.class_id === classId &&
        pc.class_date === date &&
        pc.status === 'confirmed',
    ).length;
  }
  try {
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { count, error } = await supabase
      .from('pre_checkins')
      .select('id', { count: 'exact', head: true })
      .eq('class_id', classId)
      .eq('class_date', date)
      .eq('status', 'confirmed');
    if (error) {
      logServiceError(error, 'pre-checkin');
      return 0;
    }
    return count ?? 0;
  } catch (error) {
    logServiceError(error, 'pre-checkin');
    return 0;
  }
}
