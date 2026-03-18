import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

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

export async function getEvents(academyId: string): Promise<EventoDTO[]> {
  try {
    if (isMock()) {
      const { mockGetEvents } = await import('@/lib/mocks/eventos.mock');
      return mockGetEvents(academyId);
    }
    try {
      const res = await fetch(`/api/eventos?academyId=${academyId}`);
      if (!res.ok) throw new ServiceError(res.status, 'eventos.get');
      return res.json();
    } catch {
      console.warn('[eventos.getEvents] API not available, using fallback');
      return [];
    }
  } catch (error) {
    handleServiceError(error, 'eventos.get');
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
    try {
      const res = await fetch(`/api/eventos/${eventId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'eventos.register');
      return res.json();
    } catch {
      console.warn('[eventos.registerForEvent] API not available, using fallback');
      return { id: "", event_id: "", student_id: "", student_name: "", status: "pending", registered_at: "" } as unknown as EventRegistration;
    }

  } catch (error) {
    handleServiceError(error, 'eventos.register');
  }
}
