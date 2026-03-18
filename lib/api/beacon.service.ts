import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

export interface BeaconConfig {
  id: string;
  unit_id: string;
  beacon_id: string;
  name: string;
  uuid: string;
  major: number;
  minor: number;
  tx_power: number;
  location_description: string;
  active: boolean;
  last_seen: string;
}

export interface GeofenceConfig {
  id: string;
  unit_id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  active: boolean;
}

export interface ProximityConfig {
  unit_id: string;
  beacons: BeaconConfig[];
  geofences: GeofenceConfig[];
  auto_checkin_enabled: boolean;
  min_dwell_seconds: number;
}

export async function configureBeacon(unitId: string, beaconId: string, config?: Partial<BeaconConfig>): Promise<BeaconConfig> {
  try {
    if (isMock()) {
      const { mockConfigureBeacon } = await import('@/lib/mocks/beacon.mock');
      return mockConfigureBeacon(unitId, beaconId, config);
    }
    try {
      const res = await fetch('/api/beacon/configure', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ unitId, beaconId, ...config }) });
      return res.json();
    } catch {
      console.warn('[beacon.configureBeacon] API not available, using fallback');
      return { id: "", academy_id: "", uuid: "", major: 0, minor: 0, name: "", location: "", enabled: false, battery_level: 0 } as unknown as BeaconConfig;
    }
  } catch (error) { handleServiceError(error, 'beacon.configure'); }
}

export async function configureGeofence(unitId: string, lat: number, lng: number, radius: number): Promise<GeofenceConfig> {
  try {
    if (isMock()) {
      const { mockConfigureGeofence } = await import('@/lib/mocks/beacon.mock');
      return mockConfigureGeofence(unitId, lat, lng, radius);
    }
    try {
      const res = await fetch('/api/beacon/geofence', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ unitId, lat, lng, radius }) });
      return res.json();
    } catch {
      console.warn('[beacon.configureGeofence] API not available, using fallback');
      return { id: "", academy_id: "", latitude: 0, longitude: 0, radius_meters: 0, enabled: false } as unknown as GeofenceConfig;
    }
  } catch (error) { handleServiceError(error, 'beacon.geofence'); }
}

export async function getProximityConfig(unitId: string): Promise<ProximityConfig> {
  try {
    if (isMock()) {
      const { mockGetProximityConfig } = await import('@/lib/mocks/beacon.mock');
      return mockGetProximityConfig(unitId);
    }
    try {
      const res = await fetch(`/api/beacon/config?unitId=${unitId}`);
      return res.json();
    } catch {
      console.warn('[beacon.getProximityConfig] API not available, using fallback');
      return { enabled: false, threshold_meters: 0, auto_checkin: false, notification: false } as unknown as ProximityConfig;
    }
  } catch (error) { handleServiceError(error, 'beacon.getConfig'); }
}

export async function toggleAutoCheckin(unitId: string, enabled: boolean): Promise<{ enabled: boolean }> {
  try {
    if (isMock()) {
      const { mockToggleAutoCheckin } = await import('@/lib/mocks/beacon.mock');
      return mockToggleAutoCheckin(unitId, enabled);
    }
    try {
      const res = await fetch('/api/beacon/auto-checkin', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ unitId, enabled }) });
      return res.json();
    } catch {
      console.warn('[beacon.toggleAutoCheckin] API not available, using fallback');
      return { enabled: false };
    }
  } catch (error) { handleServiceError(error, 'beacon.toggleAutoCheckin'); }
}
