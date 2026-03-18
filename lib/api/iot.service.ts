import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

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
    try {
      const res = await fetch(`/api/iot/devices?unitId=${unitId}`);
      return res.json();
    } catch {
      console.warn('[iot.getDevices] API not available, using fallback');
      return [];
    }
  } catch (error) { handleServiceError(error, 'iot.devices'); }
}

export async function getDeviceStatus(deviceId: string): Promise<IoTDevice> {
  try {
    if (isMock()) {
      const { mockGetDeviceStatus } = await import('@/lib/mocks/iot.mock');
      return mockGetDeviceStatus(deviceId);
    }
    try {
      const res = await fetch(`/api/iot/devices/${deviceId}`);
      return res.json();
    } catch {
      console.warn('[iot.getDeviceStatus] API not available, using fallback');
      return { id: "", academy_id: "", name: "", type: "catraca", status: "online", last_ping: "", firmware_version: "", battery_level: null } as unknown as IoTDevice;
    }
  } catch (error) { handleServiceError(error, 'iot.deviceStatus'); }
}

export async function getLiveAccess(unitId: string): Promise<LiveAccessEvent[]> {
  try {
    if (isMock()) {
      const { mockGetLiveAccess } = await import('@/lib/mocks/iot.mock');
      return mockGetLiveAccess(unitId);
    }
    try {
      const res = await fetch(`/api/iot/live-access?unitId=${unitId}`);
      return res.json();
    } catch {
      console.warn('[iot.getLiveAccess] API not available, using fallback');
      return [];
    }
  } catch (error) { handleServiceError(error, 'iot.liveAccess'); }
}

export async function getOccupancy(unitId: string): Promise<OccupancyData> {
  try {
    if (isMock()) {
      const { mockGetOccupancy } = await import('@/lib/mocks/iot.mock');
      return mockGetOccupancy(unitId);
    }
    try {
      const res = await fetch(`/api/iot/occupancy?unitId=${unitId}`);
      return res.json();
    } catch {
      console.warn('[iot.getOccupancy] API not available, using fallback');
      return { current: 0, max_capacity: 0, percentage: 0, hourly_data: [], last_updated: "" } as unknown as OccupancyData;
    }
  } catch (error) { handleServiceError(error, 'iot.occupancy'); }
}

export async function getDeviceAlerts(unitId: string): Promise<DeviceAlert[]> {
  try {
    if (isMock()) {
      const { mockGetDeviceAlerts } = await import('@/lib/mocks/iot.mock');
      return mockGetDeviceAlerts(unitId);
    }
    try {
      const res = await fetch(`/api/iot/alerts?unitId=${unitId}`);
      return res.json();
    } catch {
      console.warn('[iot.getDeviceAlerts] API not available, using fallback');
      return [];
    }
  } catch (error) { handleServiceError(error, 'iot.alerts'); }
}
