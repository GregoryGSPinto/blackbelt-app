import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

// ── Types ──────────────────────────────────────────────────────────────

export type CalendarEventType = 'class' | 'competition' | 'holiday' | 'graduation' | 'event';

export interface CalendarEvent {
  id: string;
  title: string;
  type: CalendarEventType;
  modality: string | null;
  date: string;
  startTime: string;
  endTime: string;
  professorName: string | null;
  location: string | null;
  enrolledCount: number;
  capacity: number;
  color: string;
  recurring: boolean;
  description: string | null;
}

export interface CalendarFilters {
  from: string;
  to: string;
  professorId?: string;
  modality?: string;
}

// ── Color map by modality ──────────────────────────────────────────────

export const MODALITY_COLORS: Record<string, string> = {
  'Jiu-Jitsu': '#DC2626',
  BJJ: '#DC2626',
  Judo: '#16A34A',
  'Muay Thai': '#2563EB',
  Boxe: '#D97706',
  Wrestling: '#7C3AED',
  Karate: '#0891B2',
  default: '#6B7280',
};

export function getModalityColor(modality: string | null): string {
  if (!modality) return MODALITY_COLORS.default;
  return MODALITY_COLORS[modality] ?? MODALITY_COLORS.default;
}

// ── Service functions ──────────────────────────────────────────────────

export async function getCalendarEvents(
  academyId: string,
  filters: CalendarFilters,
): Promise<CalendarEvent[]> {
  try {
    if (isMock()) {
      const { mockGetCalendarEvents } = await import('@/lib/mocks/calendar.mock');
      return mockGetCalendarEvents(academyId, filters);
    }
    const params = new URLSearchParams({
      academyId,
      from: filters.from,
      to: filters.to,
    });
    if (filters.professorId) params.set('professorId', filters.professorId);
    if (filters.modality) params.set('modality', filters.modality);
    const res = await fetch(`/api/calendar?${params}`);
    if (!res.ok) throw new ServiceError(res.status, 'calendar.events');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'calendar.events');
  }
}

export async function getCalendarEventById(
  eventId: string,
): Promise<CalendarEvent> {
  try {
    if (isMock()) {
      const { mockGetCalendarEventById } = await import('@/lib/mocks/calendar.mock');
      return mockGetCalendarEventById(eventId);
    }
    const res = await fetch(`/api/calendar/${eventId}`);
    if (!res.ok) throw new ServiceError(res.status, 'calendar.eventById');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'calendar.eventById');
  }
}
