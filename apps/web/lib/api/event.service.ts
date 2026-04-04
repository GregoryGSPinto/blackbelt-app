import { isMock } from '@/lib/env';
import { logger } from '@/lib/monitoring/logger';
import type { AcademyEvent, CreateEventData } from '@/lib/types';
import { logServiceError } from '@/lib/api/errors';

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
      logServiceError(error, 'event');
      return [];
    }

    return data as unknown as AcademyEvent[];
  } catch (error) {
    logServiceError(error, 'event');
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
      logServiceError(error, 'event');
      return { id: eventId } as unknown as AcademyEvent;
    }

    return data as unknown as AcademyEvent;
  } catch (error) {
    logServiceError(error, 'event');
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
      logServiceError(error, 'event');
      return { id: '', ...data, academy_id: academyId } as unknown as AcademyEvent;
    }

    return row as unknown as AcademyEvent;
  } catch (error) {
    logServiceError(error, 'event');
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
      logServiceError(error, 'event');
    }
  } catch (error) {
    logServiceError(error, 'event');
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
      logServiceError(error, 'event');
    }
  } catch (error) {
    logServiceError(error, 'event');
  }
}
