import { isMock } from '@/lib/env';

export type DeviceType = 'turnstile' | 'beacon' | 'display' | 'sensor';
export type DeviceStatus = 'online' | 'offline' | 'error';

export interface IoTDevice {
  id: string;
  type: DeviceType;
  name: string;
  status: DeviceStatus;
  last_communication: string;
  firmware_version: string;
  unit_id: string;
  location: string;
  metadata?: Record<string, unknown>;
}

export interface LiveAccessEvent {
  id: string;
  student_name: string;
  photo_url: string;
  timestamp: string;
  direction: 'entry' | 'exit';
  device_name: string;
  method: 'qr_code' | 'proximity' | 'manual';
}

export interface OccupancyData {
  current: number;
  max: number;
  percentage: number;
  hourly: { hour: number; count: number }[];
}

export interface DeviceAlert {
  id: string;
  device_id: string;
  device_name: string;
  type: 'offline' | 'error' | 'low_battery' | 'firmware_update';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export async function getDevices(unitId: string): Promise<IoTDevice[]> {
  try {
    if (isMock()) {
      const { mockGetDevices } = await import('@/lib/mocks/iot.mock');
      return mockGetDevices(unitId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('academy_settings')
      .select('settings')
      .eq('academy_id', unitId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[getDevices] Supabase error:', error.message);
    }

    const settings = (data?.settings ?? {}) as Record<string, unknown>;
    return (settings.iot_devices ?? []) as IoTDevice[];
  } catch (error) {
    console.error('[getDevices] Fallback:', error);
    return [];
  }
}

export async function getDeviceStatus(deviceId: string): Promise<IoTDevice> {
  try {
    if (isMock()) {
      const { mockGetDeviceStatus } = await import('@/lib/mocks/iot.mock');
      return mockGetDeviceStatus(deviceId);
    }
    // Look up device across all academy_settings
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('academy_settings')
      .select('settings');

    if (error) {
      console.error('[getDeviceStatus] Supabase error:', error.message);
      return { id: deviceId, type: 'sensor', name: '', status: 'offline', last_communication: '', firmware_version: '', unit_id: '', location: '' };
    }

    for (const row of data ?? []) {
      const settings = (row.settings ?? {}) as Record<string, unknown>;
      const devices = (settings.iot_devices ?? []) as IoTDevice[];
      const found = devices.find((d) => d.id === deviceId);
      if (found) return found;
    }

    return { id: deviceId, type: 'sensor', name: '', status: 'offline', last_communication: '', firmware_version: '', unit_id: '', location: '' };
  } catch (error) {
    console.error('[getDeviceStatus] Fallback:', error);
    return { id: deviceId, type: 'sensor', name: '', status: 'offline', last_communication: '', firmware_version: '', unit_id: '', location: '' };
  }
}

export async function getLiveAccess(unitId: string): Promise<LiveAccessEvent[]> {
  try {
    if (isMock()) {
      const { mockGetLiveAccess } = await import('@/lib/mocks/iot.mock');
      return mockGetLiveAccess(unitId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('academy_settings')
      .select('settings')
      .eq('academy_id', unitId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[getLiveAccess] Supabase error:', error.message);
    }

    const settings = (data?.settings ?? {}) as Record<string, unknown>;
    return (settings.live_access_events ?? []) as LiveAccessEvent[];
  } catch (error) {
    console.error('[getLiveAccess] Fallback:', error);
    return [];
  }
}

export async function getOccupancy(unitId: string): Promise<OccupancyData> {
  try {
    if (isMock()) {
      const { mockGetOccupancy } = await import('@/lib/mocks/iot.mock');
      return mockGetOccupancy(unitId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('academy_settings')
      .select('settings')
      .eq('academy_id', unitId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[getOccupancy] Supabase error:', error.message);
    }

    const settings = (data?.settings ?? {}) as Record<string, unknown>;
    const occ = settings.occupancy as OccupancyData | undefined;
    return occ ?? { current: 0, max: 0, percentage: 0, hourly: [] };
  } catch (error) {
    console.error('[getOccupancy] Fallback:', error);
    return { current: 0, max: 0, percentage: 0, hourly: [] };
  }
}

export async function getDeviceAlerts(unitId: string): Promise<DeviceAlert[]> {
  try {
    if (isMock()) {
      const { mockGetDeviceAlerts } = await import('@/lib/mocks/iot.mock');
      return mockGetDeviceAlerts(unitId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('academy_settings')
      .select('settings')
      .eq('academy_id', unitId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[getDeviceAlerts] Supabase error:', error.message);
    }

    const settings = (data?.settings ?? {}) as Record<string, unknown>;
    return (settings.device_alerts ?? []) as DeviceAlert[];
  } catch (error) {
    console.error('[getDeviceAlerts] Fallback:', error);
    return [];
  }
}
