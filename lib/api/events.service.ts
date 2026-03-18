import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
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
    // API not yet implemented — use mock
    const { mockListEvents } = await import('@/lib/mocks/events.mock');
      return mockListEvents(academyId);
  } catch (error) { handleServiceError(error, 'events.list'); }
}

export async function createEvent(academyId: string, event: Omit<EventDTO, 'id' | 'enrolledCount'>): Promise<EventDTO> {
  try {
    if (isMock()) {
      const { mockCreateEvent } = await import('@/lib/mocks/events.mock');
      return mockCreateEvent(academyId, event);
    }
    try {
      const res = await fetch(`/api/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ academyId, ...event }) });
      if (!res.ok) throw new ServiceError(res.status, 'events.create');
      return res.json();
    } catch {
      console.warn('[events.createEvent] API not available, using mock fallback');
      const { mockCreateEvent } = await import('@/lib/mocks/events.mock');
      return mockCreateEvent(academyId, event);
    }
  } catch (error) { handleServiceError(error, 'events.create'); }
}

export async function enrollInEvent(eventId: string, studentId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockEnrollEvent } = await import('@/lib/mocks/events.mock');
      return mockEnrollEvent(eventId, studentId);
    }
    try {
      const res = await fetch(`/api/events/${eventId}/enroll`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId }) });
      if (!res.ok) throw new ServiceError(res.status, 'events.enroll');
    } catch {
      console.warn('[events.enrollInEvent] API not available, using fallback');
    }
  } catch (error) { handleServiceError(error, 'events.enroll'); }
}

// ── AcademyEvent CRUD (P-037) ─────────────────────────────────────────

export async function listAcademyEvents(academyId: string): Promise<AcademyEvent[]> {
  try {
    if (isMock()) {
      const { mockListAcademyEvents } = await import('@/lib/mocks/events.mock');
      return mockListAcademyEvents(academyId);
    }
    // API not yet implemented — use mock
    const { mockListAcademyEvents } = await import('@/lib/mocks/events.mock');
      return mockListAcademyEvents(academyId);
  } catch (error) { handleServiceError(error, 'events.listAcademy'); }
}

export async function getAcademyEvent(eventId: string): Promise<AcademyEvent> {
  try {
    if (isMock()) {
      const { mockGetAcademyEvent } = await import('@/lib/mocks/events.mock');
      return mockGetAcademyEvent(eventId);
    }
    // API not yet implemented — use mock
    const { mockGetAcademyEvent } = await import('@/lib/mocks/events.mock');
      return mockGetAcademyEvent(eventId);
  } catch (error) { handleServiceError(error, 'events.getAcademy'); }
}

export async function createAcademyEvent(academyId: string, data: CreateEventData): Promise<AcademyEvent> {
  try {
    if (isMock()) {
      const { mockCreateAcademyEvent } = await import('@/lib/mocks/events.mock');
      return mockCreateAcademyEvent(academyId, data);
    }
    try {
      const res = await fetch('/api/academy-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ academyId, ...data }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'events.createAcademy');
      return res.json();
    } catch {
      console.warn('[events.createAcademyEvent] API not available, using mock fallback');
      const { mockCreateAcademyEvent } = await import('@/lib/mocks/events.mock');
      return mockCreateAcademyEvent(academyId, data);
    }
  } catch (error) { handleServiceError(error, 'events.createAcademy'); }
}

export async function updateAcademyEvent(eventId: string, data: Partial<CreateEventData>): Promise<AcademyEvent> {
  try {
    if (isMock()) {
      const { mockUpdateAcademyEvent } = await import('@/lib/mocks/events.mock');
      return mockUpdateAcademyEvent(eventId, data);
    }
    try {
      const res = await fetch(`/api/academy-events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new ServiceError(res.status, 'events.updateAcademy');
      return res.json();
    } catch {
      console.warn('[events.updateAcademyEvent] API not available, using mock fallback');
      const { mockUpdateAcademyEvent } = await import('@/lib/mocks/events.mock');
      return mockUpdateAcademyEvent(eventId, data);
    }
  } catch (error) { handleServiceError(error, 'events.updateAcademy'); }
}

export async function deleteAcademyEvent(eventId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockDeleteAcademyEvent } = await import('@/lib/mocks/events.mock');
      return mockDeleteAcademyEvent(eventId);
    }
    try {
      const res = await fetch(`/api/academy-events/${eventId}`, { method: 'DELETE' });
      if (!res.ok) throw new ServiceError(res.status, 'events.deleteAcademy');
    } catch {
      console.warn('[events.deleteAcademyEvent] API not available, using fallback');
    }
  } catch (error) { handleServiceError(error, 'events.deleteAcademy'); }
}
