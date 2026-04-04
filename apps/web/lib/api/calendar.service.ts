import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    let query = supabase
      .from('calendar_events')
      .select('*')
      .eq('academy_id', academyId)
      .gte('date', filters.from)
      .lte('date', filters.to);

    if (filters.professorId) query = query.eq('professor_id', filters.professorId);
    if (filters.modality) query = query.eq('modality', filters.modality);

    const { data, error } = await query;

    if (error || !data) {
      logServiceError(error, 'calendar');
      return [];
    }

    return (data ?? []).map((row: Record<string, unknown>) => ({
      id: String(row.id ?? ''),
      title: String(row.title ?? ''),
      type: (row.type ?? 'class') as CalendarEventType,
      modality: row.modality ? String(row.modality) : null,
      date: String(row.date ?? ''),
      startTime: String(row.start_time ?? ''),
      endTime: String(row.end_time ?? ''),
      professorName: row.professor_name ? String(row.professor_name) : null,
      location: row.location ? String(row.location) : null,
      enrolledCount: Number(row.enrolled_count ?? 0),
      capacity: Number(row.capacity ?? 0),
      color: getModalityColor(row.modality ? String(row.modality) : null),
      recurring: Boolean(row.recurring),
      description: row.description ? String(row.description) : null,
    }));
  } catch (error) {
    logServiceError(error, 'calendar');
    return [];
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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error || !data) {
      logServiceError(error, 'calendar');
      return { id: eventId, title: '', type: 'class', modality: null, date: '', startTime: '', endTime: '', professorName: null, location: null, enrolledCount: 0, capacity: 0, color: MODALITY_COLORS.default, recurring: false, description: null };
    }

    return {
      id: String(data.id),
      title: String(data.title ?? ''),
      type: (data.type ?? 'class') as CalendarEventType,
      modality: data.modality ? String(data.modality) : null,
      date: String(data.date ?? ''),
      startTime: String(data.start_time ?? ''),
      endTime: String(data.end_time ?? ''),
      professorName: data.professor_name ? String(data.professor_name) : null,
      location: data.location ? String(data.location) : null,
      enrolledCount: Number(data.enrolled_count ?? 0),
      capacity: Number(data.capacity ?? 0),
      color: getModalityColor(data.modality ? String(data.modality) : null),
      recurring: Boolean(data.recurring),
      description: data.description ? String(data.description) : null,
    };
  } catch (error) {
    logServiceError(error, 'calendar');
    return { id: eventId, title: '', type: 'class', modality: null, date: '', startTime: '', endTime: '', professorName: null, location: null, enrolledCount: 0, capacity: 0, color: MODALITY_COLORS.default, recurring: false, description: null };
  }
}
