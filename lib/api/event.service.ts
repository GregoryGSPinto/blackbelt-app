import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';
import type { AcademyEvent, CreateEventData } from '@/lib/types';

export async function listEvents(academyId: string): Promise<AcademyEvent[]> {
  try {
    if (isMock()) {
      const { mockListEvents } = await import('@/lib/mocks/event.mock');
      return mockListEvents(academyId);
    }
    const res = await fetch(`/api/events?academy_id=${academyId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    handleServiceError(error, 'event.list');
  }
}

export async function getEvent(eventId: string): Promise<AcademyEvent> {
  try {
    if (isMock()) {
      const { mockGetEvent } = await import('@/lib/mocks/event.mock');
      return mockGetEvent(eventId);
    }
    const res = await fetch(`/api/events/${eventId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    handleServiceError(error, 'event.get');
  }
}

export async function createEvent(academyId: string, data: CreateEventData): Promise<AcademyEvent> {
  try {
    if (isMock()) {
      const { mockCreateEvent } = await import('@/lib/mocks/event.mock');
      return mockCreateEvent(academyId, data);
    }
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, academy_id: academyId }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    handleServiceError(error, 'event.create');
  }
}

export async function cancelEvent(eventId: string): Promise<void> {
  try {
    if (isMock()) {
      console.log(`[MOCK] Event ${eventId} cancelled`);
      return;
    }
    const res = await fetch(`/api/events/${eventId}/cancel`, { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (error) {
    handleServiceError(error, 'event.cancel');
  }
}

export async function enrollInEvent(eventId: string, studentId: string): Promise<void> {
  try {
    if (isMock()) {
      console.log(`[MOCK] Student ${studentId} enrolled in event ${eventId}`);
      return;
    }
    const res = await fetch(`/api/events/${eventId}/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: studentId }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (error) {
    handleServiceError(error, 'event.enroll');
  }
}
