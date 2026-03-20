import { isMock } from '@/lib/env';

export type EventoType =
  | 'graduacao'
  | 'campeonato'
  | 'seminario'
  | 'workshop'
  | 'social'
  | 'open_mat';

export interface EventoDTO {
  id: string;
  title: string;
  type: EventoType;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  enrolledCount: number;
  price: number;
  description: string;
  enrollmentOpen: boolean;
  academy_id: string;
}

export interface EventRegistration {
  eventId: string;
  studentId: string;
  registeredAt: string;
  status: 'confirmed' | 'waitlist';
}

const EMPTY_REGISTRATION: EventRegistration = {
  eventId: '',
  studentId: '',
  registeredAt: '',
  status: 'waitlist',
};

export async function getEvents(academyId: string): Promise<EventoDTO[]> {
  try {
    if (isMock()) {
      const { mockGetEvents } = await import('@/lib/mocks/eventos.mock');
      return mockGetEvents(academyId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .eq('academy_id', academyId)
      .order('date', { ascending: true });

    if (error) {
      console.warn('[getEvents] error:', error.message);
      return [];
    }

    return (data || []).map((row: Record<string, unknown>) => ({
      id: String(row.id ?? ''),
      title: String(row.title ?? ''),
      type: (row.type as EventoType) ?? 'social',
      date: String(row.date ?? ''),
      startTime: String(row.start_time ?? ''),
      endTime: String(row.end_time ?? ''),
      location: String(row.location ?? ''),
      capacity: Number(row.capacity ?? 0),
      enrolledCount: Number(row.enrolled_count ?? 0),
      price: Number(row.price ?? 0),
      description: String(row.description ?? ''),
      enrollmentOpen: Boolean(row.enrollment_open ?? false),
      academy_id: String(row.academy_id ?? ''),
    }));
  } catch (error) {
    console.warn('[getEvents] Fallback:', error);
    return [];
  }
}

export async function registerForEvent(
  eventId: string,
  studentId: string,
): Promise<EventRegistration> {
  try {
    if (isMock()) {
      const { mockRegisterForEvent } = await import('@/lib/mocks/eventos.mock');
      return mockRegisterForEvent(eventId, studentId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('event_registrations')
      .insert({
        event_id: eventId,
        student_id: studentId,
        status: 'confirmed',
      })
      .select()
      .single();

    if (error || !data) {
      console.warn('[registerForEvent] error:', error?.message);
      return EMPTY_REGISTRATION;
    }

    const row = data as Record<string, unknown>;
    return {
      eventId: String(row.event_id ?? ''),
      studentId: String(row.student_id ?? ''),
      registeredAt: String(row.created_at ?? ''),
      status: (row.status as EventRegistration['status']) ?? 'confirmed',
    };
  } catch (error) {
    console.warn('[registerForEvent] Fallback:', error);
    return EMPTY_REGISTRATION;
  }
}
