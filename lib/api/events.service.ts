import { isMock } from '@/lib/env';
import type { AcademyEvent, CreateEventData } from '@/lib/types/event';

// ── Legacy DTO (backward compat) ──────────────────────────────────────

export type EventType = 'seminario' | 'workshop' | 'graduacao' | 'competicao' | 'social';

export interface EventDTO {
  id: string;
  name: string;
  type: EventType;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  enrolledCount: number;
  price: number;
  description: string;
  enrollmentOpen: boolean;
}

export async function listEvents(academyId: string): Promise<EventDTO[]> {
  try {
    if (isMock()) {
      const { mockListEvents } = await import('@/lib/mocks/events.mock');
      return mockListEvents(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('academy_id', academyId)
      .order('date', { ascending: true });
    if (error || !data) {
      console.warn('[listEvents] Supabase error:', error?.message);
      return [];
    }
    return data as unknown as EventDTO[];
  } catch (error) {
    console.warn('[listEvents] Fallback:', error);
    return [];
  }
}

export async function createEvent(academyId: string, event: Omit<EventDTO, 'id' | 'enrolledCount'>): Promise<EventDTO> {
  try {
    if (isMock()) {
      const { mockCreateEvent } = await import('@/lib/mocks/events.mock');
      return mockCreateEvent(academyId, event);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('events')
      .insert({ academy_id: academyId, ...event, enrolled_count: 0 })
      .select()
      .single();
    if (error || !data) {
      console.warn('[createEvent] Supabase error:', error?.message);
      return {} as EventDTO;
    }
    return data as unknown as EventDTO;
  } catch (error) {
    console.warn('[createEvent] Fallback:', error);
    return {} as EventDTO;
  }
}

export async function enrollInEvent(eventId: string, studentId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockEnrollEvent } = await import('@/lib/mocks/events.mock');
      return mockEnrollEvent(eventId, studentId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from('event_enrollments')
      .insert({ event_id: eventId, student_id: studentId });
    if (error) {
      console.warn('[enrollInEvent] Supabase error:', error.message);
    }
  } catch (error) {
    console.warn('[enrollInEvent] Fallback:', error);
  }
}

// ── AcademyEvent CRUD (P-037) ─────────────────────────────────────────

export async function listAcademyEvents(academyId: string): Promise<AcademyEvent[]> {
  try {
    if (isMock()) {
      const { mockListAcademyEvents } = await import('@/lib/mocks/events.mock');
      return mockListAcademyEvents(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('academy_events')
      .select('*')
      .eq('academy_id', academyId)
      .order('date', { ascending: true });
    if (error || !data) {
      console.warn('[listAcademyEvents] Supabase error:', error?.message);
      return [];
    }
    return data as unknown as AcademyEvent[];
  } catch (error) {
    console.warn('[listAcademyEvents] Fallback:', error);
    return [];
  }
}

export async function getAcademyEvent(eventId: string): Promise<AcademyEvent> {
  try {
    if (isMock()) {
      const { mockGetAcademyEvent } = await import('@/lib/mocks/events.mock');
      return mockGetAcademyEvent(eventId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('academy_events')
      .select('*')
      .eq('id', eventId)
      .single();
    if (error || !data) {
      console.warn('[getAcademyEvent] Supabase error:', error?.message);
      return {} as AcademyEvent;
    }
    return data as unknown as AcademyEvent;
  } catch (error) {
    console.warn('[getAcademyEvent] Fallback:', error);
    return {} as AcademyEvent;
  }
}

export async function createAcademyEvent(academyId: string, data: CreateEventData): Promise<AcademyEvent> {
  try {
    if (isMock()) {
      const { mockCreateAcademyEvent } = await import('@/lib/mocks/events.mock');
      return mockCreateAcademyEvent(academyId, data);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: row, error } = await supabase
      .from('academy_events')
      .insert({ academy_id: academyId, ...data })
      .select()
      .single();
    if (error || !row) {
      console.warn('[createAcademyEvent] Supabase error:', error?.message);
      return {} as AcademyEvent;
    }
    return row as unknown as AcademyEvent;
  } catch (error) {
    console.warn('[createAcademyEvent] Fallback:', error);
    return {} as AcademyEvent;
  }
}

export async function updateAcademyEvent(eventId: string, data: Partial<CreateEventData>): Promise<AcademyEvent> {
  try {
    if (isMock()) {
      const { mockUpdateAcademyEvent } = await import('@/lib/mocks/events.mock');
      return mockUpdateAcademyEvent(eventId, data);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: row, error } = await supabase
      .from('academy_events')
      .update(data)
      .eq('id', eventId)
      .select()
      .single();
    if (error || !row) {
      console.warn('[updateAcademyEvent] Supabase error:', error?.message);
      return {} as AcademyEvent;
    }
    return row as unknown as AcademyEvent;
  } catch (error) {
    console.warn('[updateAcademyEvent] Fallback:', error);
    return {} as AcademyEvent;
  }
}

export async function deleteAcademyEvent(eventId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockDeleteAcademyEvent } = await import('@/lib/mocks/events.mock');
      return mockDeleteAcademyEvent(eventId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase.from('academy_events').delete().eq('id', eventId);
    if (error) {
      console.warn('[deleteAcademyEvent] Supabase error:', error.message);
    }
  } catch (error) {
    console.warn('[deleteAcademyEvent] Fallback:', error);
  }
}
