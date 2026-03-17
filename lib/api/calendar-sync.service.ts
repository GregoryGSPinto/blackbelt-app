import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

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
    const res = await fetch(`/api/calendar/status?userId=${userId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    handleServiceError(error, 'calendarSync.status');
  }
}

export async function connectGoogleCalendar(): Promise<{ authUrl: string }> {
  try {
    if (isMock()) {
      console.log('[MOCK] Google Calendar OAuth initiated');
      return { authUrl: '#mock-google-oauth' };
    }
    const res = await fetch('/api/calendar/connect', { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    handleServiceError(error, 'calendarSync.connect');
  }
}

export async function disconnectGoogleCalendar(userId: string): Promise<void> {
  try {
    if (isMock()) {
      console.log('[MOCK] Google Calendar disconnected');
      return;
    }
    const res = await fetch(`/api/calendar/disconnect?userId=${userId}`, { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (error) {
    handleServiceError(error, 'calendarSync.disconnect');
  }
}

export async function syncClassesToCalendar(userId: string): Promise<{ synced: number }> {
  try {
    if (isMock()) {
      console.log('[MOCK] Syncing classes to Google Calendar');
      return { synced: 6 };
    }
    const res = await fetch('/api/calendar/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    handleServiceError(error, 'calendarSync.sync');
  }
}
