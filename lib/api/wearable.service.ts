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
    try {
      const res = await fetch('/api/wearable/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, data }) });
      if (!res.ok) {
        console.warn('[syncHealthData] API error:', res.status);
        return { synced: 0 };
      }
      return res.json();
    } catch {
      console.warn('[wearable.syncHealthData] API not available — integração Wearable em desenvolvimento');
      return { synced: 0 };
    }
  } catch (error) {
    console.warn('[syncHealthData] Fallback:', error);
    return { synced: 0 };
  }
}

export async function getHealthHistory(userId: string, period: '7d' | '30d' | '90d'): Promise<HealthDataPoint[]> {
  try {
    if (isMock()) {
      const { mockGetHealthHistory } = await import('@/lib/mocks/wearable.mock');
      return mockGetHealthHistory(userId, period);
    }
    try {
      const res = await fetch(`/api/wearable/history?userId=${userId}&period=${period}`);
      if (!res.ok) {
        console.warn('[getHealthHistory] API error:', res.status);
        return [];
      }
      return res.json();
    } catch {
      console.warn('[wearable.getHealthHistory] API not available — integração Wearable em desenvolvimento');
      return [];
    }
  } catch (error) {
    console.warn('[getHealthHistory] Fallback:', error);
    return [];
  }
}

export async function getRealtimeMetrics(userId: string): Promise<RealtimeMetrics> {
  try {
    if (isMock()) {
      const { mockGetRealtimeMetrics } = await import('@/lib/mocks/wearable.mock');
      return mockGetRealtimeMetrics(userId);
    }
    try {
      const res = await fetch(`/api/wearable/realtime?userId=${userId}`);
      if (!res.ok) {
        console.warn('[getRealtimeMetrics] API error:', res.status);
        return emptyRealtime;
      }
      return res.json();
    } catch {
      console.warn('[wearable.getRealtimeMetrics] API not available — integração Wearable em desenvolvimento');
      return emptyRealtime;
    }
  } catch (error) {
    console.warn('[getRealtimeMetrics] Fallback:', error);
    return emptyRealtime;
  }
}

export async function getTrainingSession(userId: string): Promise<WearableSession[]> {
  try {
    if (isMock()) {
      const { mockGetTrainingSession } = await import('@/lib/mocks/wearable.mock');
      return mockGetTrainingSession(userId);
    }
    try {
      const res = await fetch(`/api/wearable/sessions?userId=${userId}`);
      if (!res.ok) {
        console.warn('[getTrainingSession] API error:', res.status);
        return [];
      }
      return res.json();
    } catch {
      console.warn('[wearable.getTrainingSession] API not available — integração Wearable em desenvolvimento');
      return [];
    }
  } catch (error) {
    console.warn('[getTrainingSession] Fallback:', error);
    return [];
  }
}
