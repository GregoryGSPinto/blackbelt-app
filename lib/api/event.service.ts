import { isMock } from '@/lib/env';
import { logger } from '@/lib/monitoring/logger';
import type { AcademyEvent, CreateEventData } from '@/lib/types';

export async function listEvents(academyId: string): Promise<AcademyEvent[]> {
  try {
    if (isMock()) {
      const { mockListEvents } = await import('@/lib/mocks/event.mock');
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
      console.error('[listEvents] Supabase error:', error?.message);
      return [];
    }

    return data as unknown as AcademyEvent[];
  } catch (error) {
    console.error('[listEvents] Fallback:', error);
    return [];
  }
}

export async function getEvent(eventId: string): Promise<AcademyEvent> {
  try {
    if (isMock()) {
      const { mockGetEvent } = await import('@/lib/mocks/event.mock');
      return mockGetEvent(eventId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error || !data) {
      console.error('[getEvent] Supabase error:', error?.message);
      return { id: eventId } as unknown as AcademyEvent;
    }

    return data as unknown as AcademyEvent;
  } catch (error) {
    console.error('[getEvent] Fallback:', error);
    return { id: eventId } as unknown as AcademyEvent;
  }
}

export async function createEvent(academyId: string, data: CreateEventData): Promise<AcademyEvent> {
  try {
    if (isMock()) {
      const { mockCreateEvent } = await import('@/lib/mocks/event.mock');
      return mockCreateEvent(academyId, data);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: row, error } = await supabase
      .from('events')
      .insert({ ...data, academy_id: academyId })
      .select()
      .single();

    if (error || !row) {
      console.error('[createEvent] Supabase error:', error?.message);
      return { id: '', ...data, academy_id: academyId } as unknown as AcademyEvent;
    }

    return row as unknown as AcademyEvent;
  } catch (error) {
    console.error('[createEvent] Fallback:', error);
    return { id: '', ...data, academy_id: academyId } as unknown as AcademyEvent;
  }
}

export async function cancelEvent(eventId: string): Promise<void> {
  try {
    if (isMock()) {
      logger.debug(`[MOCK] Event ${eventId} cancelled`);
      return;
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('events')
      .update({ status: 'cancelled' })
      .eq('id', eventId);

    if (error) {
      console.error('[cancelEvent] Supabase error:', error.message);
    }
  } catch (error) {
    console.error('[cancelEvent] Fallback:', error);
  }
}

export async function enrollInEvent(eventId: string, studentId: string): Promise<void> {
  try {
    if (isMock()) {
      logger.debug(`[MOCK] Student ${studentId} enrolled in event ${eventId}`);
      return;
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('event_enrollments')
      .insert({ event_id: eventId, student_id: studentId });

    if (error) {
      console.error('[enrollInEvent] Supabase error:', error.message);
    }
  } catch (error) {
    console.error('[enrollInEvent] Fallback:', error);
  }
}
