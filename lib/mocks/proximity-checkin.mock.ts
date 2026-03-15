import type { ProximityData, ProximityResult, AutoCheckinResult } from '@/lib/api/proximity-checkin.service';

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

export async function mockDetectProximity(_data: ProximityData): Promise<ProximityResult> {
  // Simulate BLE detection delay
  await delay(500);
  return {
    detected: true,
    distance_meters: 3.2,
    signal_quality: 'strong',
    matching_class: {
      class_id: 'class-1',
      class_name: 'Jiu-Jitsu Adulto — Intermediário',
      starts_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      professor: 'Prof. Ricardo Mendes',
    },
  };
}

export async function mockAutoCheckin(_studentId: string, _classId: string): Promise<AutoCheckinResult> {
  await delay(300);
  return {
    success: true,
    checkin_id: `checkin-auto-${Date.now()}`,
    class_name: 'Jiu-Jitsu Adulto — Intermediário',
    checked_in_at: new Date().toISOString(),
    method: 'ble_beacon',
    message: 'Check-in automático realizado! Bom treino!',
  };
}
