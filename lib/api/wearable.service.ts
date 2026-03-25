import { isMock } from '@/lib/env';

export interface HeartRateZones {
  rest_minutes: number;
  fat_burn_minutes: number;
  cardio_minutes: number;
  peak_minutes: number;
}

export interface HealthDataPoint {
  timestamp: string;
  heart_rate_bpm: number;
  calories_burned: number;
  active_minutes: number;
  steps: number;
  heart_rate_zones: HeartRateZones;
}

export interface WearableSession {
  class_id: string;
  student_id: string;
  start: string;
  end: string;
  duration_minutes: number;
  avg_heart_rate: number;
  max_heart_rate: number;
  calories: number;
  intensity_score: number;
}

export interface RealtimeMetrics {
  heart_rate_bpm: number;
  calories_today: number;
  steps_today: number;
  active_minutes_today: number;
  last_sync: string;
  device_connected: boolean;
  device_name: string;
  battery_pct: number;
}

const emptyRealtime: RealtimeMetrics = { heart_rate_bpm: 0, calories_today: 0, steps_today: 0, active_minutes_today: 0, last_sync: '', device_connected: false, device_name: '', battery_pct: 0 };

export async function syncHealthData(userId: string, data: Partial<HealthDataPoint>[]): Promise<{ synced: number }> {
  try {
    if (isMock()) {
      const { mockSyncHealthData } = await import('@/lib/mocks/wearable.mock');
      return mockSyncHealthData(userId, data);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Get user's academy
    const { data: membership } = await supabase
      .from('memberships')
      .select('academy_id')
      .eq('profile_id', userId)
      .limit(1)
      .single();

    if (!membership) {
      console.error('[syncHealthData] No academy membership found');
      return { synced: 0 };
    }

    const { data: existing } = await supabase
      .from('academy_settings')
      .select('settings')
      .eq('academy_id', membership.academy_id)
      .single();

    const settings = (existing?.settings ?? {}) as Record<string, unknown>;
    const healthData = (settings.health_data ?? {}) as Record<string, HealthDataPoint[]>;
    const userHealth = healthData[userId] ?? [];

    // Append new data points
    const newPoints = data.map((d) => ({
      timestamp: d.timestamp ?? new Date().toISOString(),
      heart_rate_bpm: d.heart_rate_bpm ?? 0,
      calories_burned: d.calories_burned ?? 0,
      active_minutes: d.active_minutes ?? 0,
      steps: d.steps ?? 0,
      heart_rate_zones: d.heart_rate_zones ?? { rest_minutes: 0, fat_burn_minutes: 0, cardio_minutes: 0, peak_minutes: 0 },
    }));

    healthData[userId] = [...userHealth, ...newPoints];

    const { error } = await supabase.from('academy_settings').upsert(
      { academy_id: membership.academy_id, settings: { ...settings, health_data: healthData }, updated_at: new Date().toISOString() },
      { onConflict: 'academy_id' },
    );

    if (error) {
      console.error('[syncHealthData] Supabase error:', error.message);
      return { synced: 0 };
    }

    return { synced: newPoints.length };
  } catch (error) {
    console.error('[syncHealthData] Fallback:', error);
    return { synced: 0 };
  }
}

export async function getHealthHistory(userId: string, period: '7d' | '30d' | '90d'): Promise<HealthDataPoint[]> {
  try {
    if (isMock()) {
      const { mockGetHealthHistory } = await import('@/lib/mocks/wearable.mock');
      return mockGetHealthHistory(userId, period);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: membership } = await supabase
      .from('memberships')
      .select('academy_id')
      .eq('profile_id', userId)
      .limit(1)
      .single();

    if (!membership) return [];

    const { data: settingsRow } = await supabase
      .from('academy_settings')
      .select('settings')
      .eq('academy_id', membership.academy_id)
      .single();

    const settings = (settingsRow?.settings ?? {}) as Record<string, unknown>;
    const healthData = (settings.health_data ?? {}) as Record<string, HealthDataPoint[]>;
    const userHealth = healthData[userId] ?? [];

    // Filter by period
    const daysMap: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 };
    const days = daysMap[period] ?? 30;
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    return userHealth.filter((h) => h.timestamp >= cutoff);
  } catch (error) {
    console.error('[getHealthHistory] Fallback:', error);
    return [];
  }
}

export async function getRealtimeMetrics(userId: string): Promise<RealtimeMetrics> {
  try {
    if (isMock()) {
      const { mockGetRealtimeMetrics } = await import('@/lib/mocks/wearable.mock');
      return mockGetRealtimeMetrics(userId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: membership } = await supabase
      .from('memberships')
      .select('academy_id')
      .eq('profile_id', userId)
      .limit(1)
      .single();

    if (!membership) return emptyRealtime;

    const { data: settingsRow } = await supabase
      .from('academy_settings')
      .select('settings')
      .eq('academy_id', membership.academy_id)
      .single();

    const settings = (settingsRow?.settings ?? {}) as Record<string, unknown>;
    const healthData = (settings.health_data ?? {}) as Record<string, HealthDataPoint[]>;
    const userHealth = healthData[userId] ?? [];

    // Return latest data point as realtime metrics
    if (userHealth.length === 0) return emptyRealtime;

    const latest = userHealth[userHealth.length - 1];
    return {
      heart_rate_bpm: latest.heart_rate_bpm,
      calories_today: latest.calories_burned,
      steps_today: latest.steps,
      active_minutes_today: latest.active_minutes,
      last_sync: latest.timestamp,
      device_connected: false,
      device_name: '',
      battery_pct: 0,
    };
  } catch (error) {
    console.error('[getRealtimeMetrics] Fallback:', error);
    return emptyRealtime;
  }
}

export async function getTrainingSession(userId: string): Promise<WearableSession[]> {
  try {
    if (isMock()) {
      const { mockGetTrainingSession } = await import('@/lib/mocks/wearable.mock');
      return mockGetTrainingSession(userId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: membership } = await supabase
      .from('memberships')
      .select('academy_id')
      .eq('profile_id', userId)
      .limit(1)
      .single();

    if (!membership) return [];

    const { data: settingsRow } = await supabase
      .from('academy_settings')
      .select('settings')
      .eq('academy_id', membership.academy_id)
      .single();

    const settings = (settingsRow?.settings ?? {}) as Record<string, unknown>;
    return (settings.wearable_sessions?.[userId as keyof typeof settings.wearable_sessions] ?? []) as unknown as WearableSession[];
  } catch (error) {
    console.error('[getTrainingSession] Fallback:', error);
    return [];
  }
}
