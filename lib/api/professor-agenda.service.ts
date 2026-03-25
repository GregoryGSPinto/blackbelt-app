import { isMock } from '@/lib/env';

export interface AgendaSlot {
  id: string;
  type: 'class' | 'private' | 'event' | 'unavailable';
  title: string;
  day: number;
  startTime: string;
  endTime: string;
  studentName?: string;
  status?: 'confirmed' | 'pending' | 'cancelled';
}

export interface LessonRequest {
  id: string;
  studentId: string;
  studentName: string;
  requestedDate: string;
  requestedTime: string;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
}

export async function getAgenda(professorId: string, _week: string): Promise<AgendaSlot[]> {
  try {
    if (isMock()) {
      const { mockGetAgenda } = await import('@/lib/mocks/professor-agenda.mock');
      return mockGetAgenda(professorId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('agenda_slots')
      .select('*')
      .eq('professor_id', professorId);

    if (error || !data) {
      console.error('[getAgenda] Supabase error:', error?.message);
      return [];
    }

    return (data ?? []).map((row: Record<string, unknown>) => ({
      id: String(row.id ?? ''),
      type: (row.type ?? 'class') as AgendaSlot['type'],
      title: String(row.title ?? ''),
      day: Number(row.day ?? 0),
      startTime: String(row.start_time ?? ''),
      endTime: String(row.end_time ?? ''),
      studentName: row.student_name ? String(row.student_name) : undefined,
      status: row.status as AgendaSlot['status'],
    }));
  } catch (error) {
    console.error('[getAgenda] Fallback:', error);
    return [];
  }
}

export async function getLessonRequests(professorId: string): Promise<LessonRequest[]> {
  try {
    if (isMock()) {
      const { mockGetLessonRequests } = await import('@/lib/mocks/professor-agenda.mock');
      return mockGetLessonRequests(professorId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('lesson_requests')
      .select('*')
      .eq('professor_id', professorId)
      .eq('status', 'pending');

    if (error || !data) {
      console.error('[getLessonRequests] Supabase error:', error?.message);
      return [];
    }

    return (data ?? []).map((row: Record<string, unknown>) => ({
      id: String(row.id ?? ''),
      studentId: String(row.student_id ?? ''),
      studentName: String(row.student_name ?? ''),
      requestedDate: String(row.requested_date ?? ''),
      requestedTime: String(row.requested_time ?? ''),
      status: (row.status ?? 'pending') as LessonRequest['status'],
      reason: row.reason ? String(row.reason) : undefined,
    }));
  } catch (error) {
    console.error('[getLessonRequests] Fallback:', error);
    return [];
  }
}

export async function approveLesson(requestId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockApproveLesson } = await import('@/lib/mocks/professor-agenda.mock');
      return mockApproveLesson(requestId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('lesson_requests')
      .update({ status: 'approved' })
      .eq('id', requestId);

    if (error) {
      console.error('[approveLesson] Supabase error:', error.message);
    }
  } catch (error) {
    console.error('[approveLesson] Fallback:', error);
  }
}

export async function rejectLesson(requestId: string, reason: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockRejectLesson } = await import('@/lib/mocks/professor-agenda.mock');
      return mockRejectLesson(requestId, reason);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('lesson_requests')
      .update({ status: 'rejected', reason })
      .eq('id', requestId);

    if (error) {
      console.error('[rejectLesson] Supabase error:', error.message);
    }
  } catch (error) {
    console.error('[rejectLesson] Fallback:', error);
  }
}
