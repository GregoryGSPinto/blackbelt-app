import { isMock } from '@/lib/env';
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

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('calendar_integrations')
      .select('connected, email, last_sync, synced_classes')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      console.warn('[getCalendarSyncStatus] No integration found or error:', error?.message);
      return { connected: false, email: null, lastSync: null, syncedClasses: 0 };
    }

    return {
      connected: data.connected ?? false,
      email: data.email ?? null,
      lastSync: data.last_sync ?? null,
      syncedClasses: data.synced_classes ?? 0,
    };
  } catch (error) {
    console.warn('[getCalendarSyncStatus] Fallback:', error);
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
    console.warn('[connectGoogleCalendar] Google Calendar API not configured yet');
    return { authUrl: '' };
  } catch (error) {
    console.warn('[connectGoogleCalendar] Fallback:', error);
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
      console.warn('[disconnectGoogleCalendar] error:', error.message);
    }
  } catch (error) {
    console.warn('[disconnectGoogleCalendar] Fallback:', error);
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
    console.warn('[syncClassesToCalendar] Google Calendar API not configured, returning fallback');
    return { synced: 0 };
  } catch (error) {
    console.warn('[syncClassesToCalendar] Fallback:', error);
    return { synced: 0 };
  }
}
