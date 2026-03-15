import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

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
    const res = await fetch(`/api/events?academyId=${academyId}`);
    if (!res.ok) throw new ServiceError(res.status, 'events.list');
    return res.json();
  } catch (error) { handleServiceError(error, 'events.list'); }
}

export async function createEvent(academyId: string, event: Omit<EventDTO, 'id' | 'enrolledCount'>): Promise<EventDTO> {
  try {
    if (isMock()) {
      const { mockCreateEvent } = await import('@/lib/mocks/events.mock');
      return mockCreateEvent(academyId, event);
    }
    const res = await fetch(`/api/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ academyId, ...event }) });
    if (!res.ok) throw new ServiceError(res.status, 'events.create');
    return res.json();
  } catch (error) { handleServiceError(error, 'events.create'); }
}

export async function enrollInEvent(eventId: string, studentId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockEnrollEvent } = await import('@/lib/mocks/events.mock');
      return mockEnrollEvent(eventId, studentId);
    }
    const res = await fetch(`/api/events/${eventId}/enroll`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId }) });
    if (!res.ok) throw new ServiceError(res.status, 'events.enroll');
  } catch (error) { handleServiceError(error, 'events.enroll'); }
}
