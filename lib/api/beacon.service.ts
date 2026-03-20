import { isMock } from '@/lib/env';

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

const emptyBeacon = (unitId: string, beaconId: string): BeaconConfig => ({
  id: '', unit_id: unitId, beacon_id: beaconId, name: '', uuid: '', major: 0, minor: 0, tx_power: 0, location_description: '', active: false, last_seen: '',
});

const emptyGeofence = (unitId: string): GeofenceConfig => ({
  id: '', unit_id: unitId, name: '', latitude: 0, longitude: 0, radius_meters: 0, active: false,
});

export async function configureBeacon(unitId: string, beaconId: string, config?: Partial<BeaconConfig>): Promise<BeaconConfig> {
  try {
    if (isMock()) {
      const { mockConfigureBeacon } = await import('@/lib/mocks/beacon.mock');
      return mockConfigureBeacon(unitId, beaconId, config);
    }
    try {
      const res = await fetch('/api/beacon/configure', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ unitId, beaconId, ...config }) });
      if (!res.ok) {
        console.warn('[configureBeacon] API error:', res.status);
        return emptyBeacon(unitId, beaconId);
      }
      return res.json();
    } catch {
      console.warn('[beacon.configureBeacon] API not available — integração Beacon em desenvolvimento');
      return emptyBeacon(unitId, beaconId);
    }
  } catch (error) {
    console.warn('[configureBeacon] Fallback:', error);
    return emptyBeacon(unitId, beaconId);
  }
}

export async function configureGeofence(unitId: string, lat: number, lng: number, radius: number): Promise<GeofenceConfig> {
  try {
    if (isMock()) {
      const { mockConfigureGeofence } = await import('@/lib/mocks/beacon.mock');
      return mockConfigureGeofence(unitId, lat, lng, radius);
    }
    try {
      const res = await fetch('/api/beacon/geofence', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ unitId, lat, lng, radius }) });
      if (!res.ok) {
        console.warn('[configureGeofence] API error:', res.status);
        return { ...emptyGeofence(unitId), latitude: lat, longitude: lng, radius_meters: radius };
      }
      return res.json();
    } catch {
      console.warn('[beacon.configureGeofence] API not available — integração Beacon em desenvolvimento');
      return { ...emptyGeofence(unitId), latitude: lat, longitude: lng, radius_meters: radius };
    }
  } catch (error) {
    console.warn('[configureGeofence] Fallback:', error);
    return { ...emptyGeofence(unitId), latitude: lat, longitude: lng, radius_meters: radius };
  }
}

export async function getProximityConfig(unitId: string): Promise<ProximityConfig> {
  try {
    if (isMock()) {
      const { mockGetProximityConfig } = await import('@/lib/mocks/beacon.mock');
      return mockGetProximityConfig(unitId);
    }
    try {
      const res = await fetch(`/api/beacon/config?unitId=${unitId}`);
      if (!res.ok) {
        console.warn('[getProximityConfig] API error:', res.status);
        return { unit_id: unitId, beacons: [], geofences: [], auto_checkin_enabled: false, min_dwell_seconds: 0 };
      }
      return res.json();
    } catch {
      console.warn('[beacon.getProximityConfig] API not available — integração Beacon em desenvolvimento');
      return { unit_id: unitId, beacons: [], geofences: [], auto_checkin_enabled: false, min_dwell_seconds: 0 };
    }
  } catch (error) {
    console.warn('[getProximityConfig] Fallback:', error);
    return { unit_id: unitId, beacons: [], geofences: [], auto_checkin_enabled: false, min_dwell_seconds: 0 };
  }
}

export async function toggleAutoCheckin(unitId: string, enabled: boolean): Promise<{ enabled: boolean }> {
  try {
    if (isMock()) {
      const { mockToggleAutoCheckin } = await import('@/lib/mocks/beacon.mock');
      return mockToggleAutoCheckin(unitId, enabled);
    }
    try {
      const res = await fetch('/api/beacon/auto-checkin', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ unitId, enabled }) });
      if (!res.ok) {
        console.warn('[toggleAutoCheckin] API error:', res.status);
        return { enabled };
      }
      return res.json();
    } catch {
      console.warn('[beacon.toggleAutoCheckin] API not available — integração Beacon em desenvolvimento');
      return { enabled };
    }
  } catch (error) {
    console.warn('[toggleAutoCheckin] Fallback:', error);
    return { enabled };
  }
}
