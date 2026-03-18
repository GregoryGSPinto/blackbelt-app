import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';
import { logger } from '@/lib/monitoring/logger';

// ── Types ─────────────────────────────────────────────────────

export interface CalendarSyncStatus {
  connected: boolean;
  email: string | null;
  lastSync: string | null;
  syncedClasses: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  location: string;
  description: string;
  calendarEventId: string | null;
}

// ── Service ───────────────────────────────────────────────────

export async function getCalendarSyncStatus(userId: string): Promise<CalendarSyncStatus> {
  try {
    if (isMock()) {
      return {
        connected: false,
        email: null,
        lastSync: null,
        syncedClasses: 0,
      };
    }
    try {
      const res = await fetch(`/api/calendar/status?userId=${userId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[calendar-sync.getCalendarSyncStatus] API not available, using fallback');
      return { connected: false, provider: null, last_synced: null, events_synced: 0 } as unknown as CalendarSyncStatus;
    }
  } catch (error) {
    handleServiceError(error, 'calendarSync.status');
  }
}

export async function connectGoogleCalendar(): Promise<{ authUrl: string }> {
  try {
    if (isMock()) {
      logger.debug('[MOCK] Google Calendar OAuth initiated');
      return { authUrl: '#mock-google-oauth' };
    }
    try {
      const res = await fetch('/api/calendar/connect', { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[calendar-sync.connectGoogleCalendar] API not available, using fallback');
      return { authUrl: "" };
    }
  } catch (error) {
    handleServiceError(error, 'calendarSync.connect');
  }
}

export async function disconnectGoogleCalendar(userId: string): Promise<void> {
  try {
    if (isMock()) {
      logger.debug('[MOCK] Google Calendar disconnected');
      return;
    }
    try {
      const res = await fetch(`/api/calendar/disconnect?userId=${userId}`, { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch {
      console.warn('[calendar-sync.disconnectGoogleCalendar] API not available, using fallback');
    }
  } catch (error) {
    handleServiceError(error, 'calendarSync.disconnect');
  }
}

export async function syncClassesToCalendar(userId: string): Promise<{ synced: number }> {
  try {
    if (isMock()) {
      logger.debug('[MOCK] Syncing classes to Google Calendar');
      return { synced: 6 };
    }
    try {
      const res = await fetch('/api/calendar/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[calendar-sync.syncClassesToCalendar] API not available, using fallback');
      return { synced: 0 };
    }
  } catch (error) {
    handleServiceError(error, 'calendarSync.sync');
  }
}
