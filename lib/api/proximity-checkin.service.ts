import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

export interface ProximityData {
  student_id: string;
  unit_id: string;
  signal_type: 'ble' | 'geofence';
  signal_strength?: number;
  beacon_id?: string;
  latitude?: number;
  longitude?: number;
  timestamp: string;
}

export interface ProximityResult {
  detected: boolean;
  distance_meters?: number;
  signal_quality: 'strong' | 'medium' | 'weak' | 'none';
  matching_class?: {
    class_id: string;
    class_name: string;
    starts_at: string;
    professor: string;
  };
}

export interface AutoCheckinResult {
  success: boolean;
  checkin_id?: string;
  class_name: string;
  checked_in_at: string;
  method: 'ble_beacon' | 'geofence';
  message: string;
}

export async function detectProximity(data: ProximityData): Promise<ProximityResult> {
  try {
    if (isMock()) {
      const { mockDetectProximity } = await import('@/lib/mocks/proximity-checkin.mock');
      return mockDetectProximity(data);
    }
    try {
      const res = await fetch('/api/proximity/detect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      return res.json();
    } catch {
      console.warn('[proximity-checkin.detectProximity] API not available, using mock fallback');
      const { mockDetectProximity } = await import('@/lib/mocks/proximity-checkin.mock');
      return mockDetectProximity(data);
    }
  } catch (error) { handleServiceError(error, 'proximity.detect'); }
}

export async function autoCheckin(studentId: string, classId: string): Promise<AutoCheckinResult> {
  try {
    if (isMock()) {
      const { mockAutoCheckin } = await import('@/lib/mocks/proximity-checkin.mock');
      return mockAutoCheckin(studentId, classId);
    }
    try {
      const res = await fetch('/api/proximity/checkin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId, classId }) });
      return res.json();
    } catch {
      console.warn('[proximity-checkin.autoCheckin] API not available, using mock fallback');
      const { mockAutoCheckin } = await import('@/lib/mocks/proximity-checkin.mock');
      return mockAutoCheckin(studentId, classId);
    }
  } catch (error) { handleServiceError(error, 'proximity.checkin'); }
}
