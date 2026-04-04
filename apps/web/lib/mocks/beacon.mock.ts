import type { BeaconConfig, GeofenceConfig, ProximityConfig } from '@/lib/api/beacon.service';

const delay = () => new Promise((r) => setTimeout(r, 350));

const now = new Date();

const beacons: BeaconConfig[] = [
  {
    id: 'beacon-1',
    unit_id: 'unit-1',
    beacon_id: 'BB-BLE-001',
    name: 'Entrada Principal',
    uuid: 'f7826da6-4fa2-4e98-8024-bc5b71e0893e',
    major: 1,
    minor: 1,
    tx_power: -59,
    location_description: 'Instalado na catraca de entrada principal',
    active: true,
    last_seen: new Date(now.getTime() - 30 * 1000).toISOString(),
  },
  {
    id: 'beacon-2',
    unit_id: 'unit-1',
    beacon_id: 'BB-BLE-002',
    name: 'Área de Treino',
    uuid: 'f7826da6-4fa2-4e98-8024-bc5b71e0893e',
    major: 1,
    minor: 2,
    tx_power: -59,
    location_description: 'Instalado no teto da área de tatame principal',
    active: true,
    last_seen: new Date(now.getTime() - 45 * 1000).toISOString(),
  },
];

const geofences: GeofenceConfig[] = [
  {
    id: 'geo-1',
    unit_id: 'unit-1',
    name: 'Perímetro da Academia',
    latitude: -23.5505,
    longitude: -46.6333,
    radius_meters: 50,
    active: true,
  },
];

export async function mockConfigureBeacon(_unitId: string, beaconId: string, config?: Partial<BeaconConfig>): Promise<BeaconConfig> {
  await delay();
  const existing = beacons.find((b) => b.beacon_id === beaconId);
  if (existing) return { ...existing, ...config };
  return {
    id: `beacon-${Date.now()}`,
    unit_id: _unitId,
    beacon_id: beaconId,
    name: config?.name || 'Novo Beacon',
    uuid: config?.uuid || 'f7826da6-4fa2-4e98-8024-bc5b71e0893e',
    major: config?.major || 1,
    minor: config?.minor || beacons.length + 1,
    tx_power: config?.tx_power || -59,
    location_description: config?.location_description || '',
    active: config?.active ?? true,
    last_seen: new Date().toISOString(),
  };
}

export async function mockConfigureGeofence(_unitId: string, lat: number, lng: number, radius: number): Promise<GeofenceConfig> {
  await delay();
  return {
    id: `geo-${Date.now()}`,
    unit_id: _unitId,
    name: 'Perímetro da Academia',
    latitude: lat,
    longitude: lng,
    radius_meters: radius,
    active: true,
  };
}

export async function mockGetProximityConfig(_unitId: string): Promise<ProximityConfig> {
  await delay();
  return {
    unit_id: _unitId,
    beacons,
    geofences,
    auto_checkin_enabled: true,
    min_dwell_seconds: 30,
  };
}

export async function mockToggleAutoCheckin(_unitId: string, enabled: boolean): Promise<{ enabled: boolean }> {
  await delay();
  return { enabled };
}
