import { isMock } from '@/lib/env';
import { logger } from '@/lib/monitoring/logger';
import { logServiceError } from '@/lib/api/errors';

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

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('calendar_integrations')
      .select('connected, email, last_sync, synced_classes')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      logServiceError(error, 'calendar-sync');
      return { connected: false, email: null, lastSync: null, syncedClasses: 0 };
    }

    return {
      connected: data.connected ?? false,
      email: data.email ?? null,
      lastSync: data.last_sync ?? null,
      syncedClasses: data.synced_classes ?? 0,
    };
  } catch (error) {
    logServiceError(error, 'calendar-sync');
    return { connected: false, email: null, lastSync: null, syncedClasses: 0 };
  }
}

export async function connectGoogleCalendar(): Promise<{ authUrl: string }> {
  try {
    if (isMock()) {
      logger.debug('[MOCK] Google Calendar OAuth initiated');
      return { authUrl: '#mock-google-oauth' };
    }

    // Google Calendar API integration requires server-side OAuth flow
    // Return empty until Google API credentials are configured
    logServiceError(new Error('Google Calendar API not configured yet'), 'calendar-sync');
    return { authUrl: '' };
  } catch (error) {
    logServiceError(error, 'calendar-sync');
    return { authUrl: '' };
  }
}

export async function disconnectGoogleCalendar(userId: string): Promise<void> {
  try {
    if (isMock()) {
      logger.debug('[MOCK] Google Calendar disconnected');
      return;
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('calendar_integrations')
      .update({ connected: false, email: null })
      .eq('user_id', userId);

    if (error) {
      logServiceError(error, 'calendar-sync');
    }
  } catch (error) {
    logServiceError(error, 'calendar-sync');
  }
}

export async function syncClassesToCalendar(_userId: string): Promise<{ synced: number }> {
  try {
    if (isMock()) {
      logger.debug('[MOCK] Syncing classes to Google Calendar');
      return { synced: 6 };
    }

    // Google Calendar sync requires server-side API integration
    // Return fallback until Google API credentials are configured
    logServiceError(new Error('Google Calendar API not configured, returning fallback'), 'calendar-sync');
    return { synced: 0 };
  } catch (error) {
    logServiceError(error, 'calendar-sync');
    return { synced: 0 };
  }
}
