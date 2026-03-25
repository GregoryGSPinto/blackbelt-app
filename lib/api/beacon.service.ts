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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Read current settings
    const { data: existing } = await supabase
      .from('academy_settings')
      .select('settings')
      .eq('academy_id', unitId)
      .single();

    const settings = (existing?.settings ?? {}) as Record<string, unknown>;
    const beacons = (settings.beacons ?? []) as BeaconConfig[];

    const now = new Date().toISOString();
    const newBeacon: BeaconConfig = {
      ...emptyBeacon(unitId, beaconId),
      ...config,
      id: config?.id ?? beaconId,
      unit_id: unitId,
      beacon_id: beaconId,
      active: config?.active ?? true,
      last_seen: now,
    };

    const idx = beacons.findIndex((b) => b.beacon_id === beaconId);
    if (idx >= 0) {
      beacons[idx] = { ...beacons[idx], ...newBeacon };
    } else {
      beacons.push(newBeacon);
    }

    const { error } = await supabase.from('academy_settings').upsert(
      { academy_id: unitId, settings: { ...settings, beacons }, updated_at: now },
      { onConflict: 'academy_id' },
    );

    if (error) {
      console.error('[configureBeacon] Supabase error:', error.message);
      return emptyBeacon(unitId, beaconId);
    }

    return idx >= 0 ? beacons[idx] : newBeacon;
  } catch (error) {
    console.error('[configureBeacon] Fallback:', error);
    return emptyBeacon(unitId, beaconId);
  }
}

export async function configureGeofence(unitId: string, lat: number, lng: number, radius: number): Promise<GeofenceConfig> {
  try {
    if (isMock()) {
      const { mockConfigureGeofence } = await import('@/lib/mocks/beacon.mock');
      return mockConfigureGeofence(unitId, lat, lng, radius);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: existing } = await supabase
      .from('academy_settings')
      .select('settings')
      .eq('academy_id', unitId)
      .single();

    const settings = (existing?.settings ?? {}) as Record<string, unknown>;
    const geofences = (settings.geofences ?? []) as GeofenceConfig[];

    const now = new Date().toISOString();
    const newGeo: GeofenceConfig = {
      ...emptyGeofence(unitId),
      id: `geo-${Date.now()}`,
      name: `Geofence ${geofences.length + 1}`,
      latitude: lat,
      longitude: lng,
      radius_meters: radius,
      active: true,
    };

    geofences.push(newGeo);

    const { error } = await supabase.from('academy_settings').upsert(
      { academy_id: unitId, settings: { ...settings, geofences }, updated_at: now },
      { onConflict: 'academy_id' },
    );

    if (error) {
      console.error('[configureGeofence] Supabase error:', error.message);
      return { ...emptyGeofence(unitId), latitude: lat, longitude: lng, radius_meters: radius };
    }

    return newGeo;
  } catch (error) {
    console.error('[configureGeofence] Fallback:', error);
    return { ...emptyGeofence(unitId), latitude: lat, longitude: lng, radius_meters: radius };
  }
}

export async function getProximityConfig(unitId: string): Promise<ProximityConfig> {
  try {
    if (isMock()) {
      const { mockGetProximityConfig } = await import('@/lib/mocks/beacon.mock');
      return mockGetProximityConfig(unitId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('academy_settings')
      .select('settings')
      .eq('academy_id', unitId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[getProximityConfig] Supabase error:', error.message);
    }

    const settings = (data?.settings ?? {}) as Record<string, unknown>;
    return {
      unit_id: unitId,
      beacons: (settings.beacons ?? []) as BeaconConfig[],
      geofences: (settings.geofences ?? []) as GeofenceConfig[],
      auto_checkin_enabled: (settings.auto_checkin_enabled ?? false) as boolean,
      min_dwell_seconds: (settings.min_dwell_seconds ?? 0) as number,
    };
  } catch (error) {
    console.error('[getProximityConfig] Fallback:', error);
    return { unit_id: unitId, beacons: [], geofences: [], auto_checkin_enabled: false, min_dwell_seconds: 0 };
  }
}

export async function toggleAutoCheckin(unitId: string, enabled: boolean): Promise<{ enabled: boolean }> {
  try {
    if (isMock()) {
      const { mockToggleAutoCheckin } = await import('@/lib/mocks/beacon.mock');
      return mockToggleAutoCheckin(unitId, enabled);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: existing } = await supabase
      .from('academy_settings')
      .select('settings')
      .eq('academy_id', unitId)
      .single();

    const settings = (existing?.settings ?? {}) as Record<string, unknown>;

    const { error } = await supabase.from('academy_settings').upsert(
      {
        academy_id: unitId,
        settings: { ...settings, auto_checkin_enabled: enabled },
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'academy_id' },
    );

    if (error) {
      console.error('[toggleAutoCheckin] Supabase error:', error.message);
    }

    return { enabled };
  } catch (error) {
    console.error('[toggleAutoCheckin] Fallback:', error);
    return { enabled };
  }
}
