import { isMock } from '@/lib/env';

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
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      // Get academy geofence settings from academy_settings
      const { data: settings } = await supabase
        .from('academy_settings')
        .select('settings')
        .eq('academy_id', data.unit_id)
        .single();

      const geofence = (settings?.settings as Record<string, unknown>)?.geofence as {
        latitude: number;
        longitude: number;
        radius_meters: number;
      } | undefined;

      if (!geofence && data.signal_type === 'geofence') {
        return { detected: false, signal_quality: 'none' as const };
      }

      let detected = false;
      let distance_meters: number | undefined;
      let signal_quality: ProximityResult['signal_quality'] = 'none';

      if (data.signal_type === 'ble' && data.signal_strength != null) {
        // BLE-based proximity: signal_strength in dBm
        detected = data.signal_strength > -70;
        signal_quality = data.signal_strength > -50 ? 'strong' : data.signal_strength > -65 ? 'medium' : data.signal_strength > -80 ? 'weak' : 'none';
      } else if (data.signal_type === 'geofence' && data.latitude != null && data.longitude != null && geofence) {
        // Haversine distance check
        const R = 6371e3;
        const toRad = (d: number) => (d * Math.PI) / 180;
        const dLat = toRad(data.latitude - geofence.latitude);
        const dLon = toRad(data.longitude - geofence.longitude);
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(geofence.latitude)) * Math.cos(toRad(data.latitude)) * Math.sin(dLon / 2) ** 2;
        distance_meters = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        detected = distance_meters <= (geofence.radius_meters ?? 100);
        signal_quality = distance_meters <= 20 ? 'strong' : distance_meters <= 50 ? 'medium' : distance_meters <= (geofence.radius_meters ?? 100) ? 'weak' : 'none';
      }

      // Find matching class if detected
      let matching_class: ProximityResult['matching_class'];
      if (detected) {
        const now = new Date();
        const { data: classes } = await supabase
          .from('classes')
          .select('id, name, schedule, professor:profiles!classes_professor_id_fkey(display_name)')
          .eq('academy_id', data.unit_id)
          .limit(10);

        // Simple schedule match: find a class that might be running now
        for (const c of (classes ?? []) as Array<{ id: string; name: string; schedule: unknown; professor: { display_name: string } | null }>) {
          matching_class = {
            class_id: c.id,
            class_name: c.name ?? '',
            starts_at: now.toISOString(),
            professor: c.professor?.display_name ?? '',
          };
          break; // Take the first available class
        }
      }

      return { detected, distance_meters, signal_quality, matching_class };
    } catch (err) {
      console.warn('[proximity-checkin.detectProximity] error, using fallback:', err);
      return { detected: false, signal_quality: 'none' as const };
    }
  } catch (error) {
    console.warn('[detectProximity] Fallback:', error);
    return { detected: false, signal_quality: 'none' };
  }
}

export async function autoCheckin(studentId: string, classId: string): Promise<AutoCheckinResult> {
  try {
    if (isMock()) {
      const { mockAutoCheckin } = await import('@/lib/mocks/proximity-checkin.mock');
      return mockAutoCheckin(studentId, classId);
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      // Get class name for the response
      const { data: cls } = await supabase
        .from('classes')
        .select('name')
        .eq('id', classId)
        .single();

      const checkedInAt = new Date().toISOString();

      // Insert attendance record with proximity method
      const { data: att, error: attErr } = await supabase
        .from('attendance')
        .insert({
          student_id: studentId,
          class_id: classId,
          method: 'system',
          checked_at: checkedInAt,
        })
        .select('id')
        .single();

      if (attErr) {
        if (attErr.code === '23505') {
          return {
            success: false,
            class_name: cls?.name ?? '',
            checked_in_at: checkedInAt,
            method: 'geofence' as const,
            message: 'Check-in já realizado para esta aula hoje.',
          };
        }
        console.warn('[autoCheckin] insert error:', attErr.message);
        return {
          success: false,
          class_name: cls?.name ?? '',
          checked_in_at: checkedInAt,
          method: 'geofence' as const,
          message: 'Erro ao registrar check-in automático.',
        };
      }

      return {
        success: true,
        checkin_id: att?.id,
        class_name: cls?.name ?? '',
        checked_in_at: checkedInAt,
        method: 'geofence' as const,
        message: 'Check-in automático realizado com sucesso!',
      };
    } catch (err) {
      console.warn('[proximity-checkin.autoCheckin] error, using fallback:', err);
      return { success: false, class_name: '', checked_in_at: '', method: 'ble_beacon' as const, message: 'Erro ao fazer check-in' };
    }
  } catch (error) {
    console.warn('[autoCheckin] Fallback:', error);
    return { success: false, class_name: '', checked_in_at: '', method: 'ble_beacon', message: 'Erro ao fazer check-in' };
  }
}
