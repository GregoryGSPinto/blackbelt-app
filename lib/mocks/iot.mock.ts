import type { IoTDevice, LiveAccessEvent, OccupancyData, DeviceAlert } from '@/lib/api/iot.service';

const delay = () => new Promise((r) => setTimeout(r, 400));

const now = new Date();

const devices: IoTDevice[] = [
  {
    id: 'device-1',
    type: 'turnstile',
    name: 'Catraca Entrada Principal',
    status: 'online',
    last_communication: new Date(now.getTime() - 15 * 1000).toISOString(),
    firmware_version: '2.4.1',
    unit_id: 'unit-1',
    location: 'Recepção',
    metadata: { model: 'Henry Primme SF', serial: 'HNR-2024-001' },
  },
  {
    id: 'device-2',
    type: 'beacon',
    name: 'Beacon BLE — Tatame',
    status: 'online',
    last_communication: new Date(now.getTime() - 45 * 1000).toISOString(),
    firmware_version: '1.2.0',
    unit_id: 'unit-1',
    location: 'Área de tatame',
    metadata: { uuid: 'f7826da6-4fa2-4e98-8024-bc5b71e0893e', battery_pct: 85 },
  },
  {
    id: 'device-3',
    type: 'display',
    name: 'Painel LED — Entrada',
    status: 'online',
    last_communication: new Date(now.getTime() - 5 * 1000).toISOString(),
    firmware_version: '3.0.2',
    unit_id: 'unit-1',
    location: 'Hall de entrada',
    metadata: { resolution: '1920x1080', mode: 'schedule_display' },
  },
];

const studentNames = [
  'Lucas Oliveira', 'Beatriz Santos', 'Gabriel Silva', 'Mariana Costa',
  'Pedro Almeida', 'Ana Souza', 'Rafael Lima', 'Juliana Mendes',
  'Carlos Ferreira', 'Isabela Rocha',
];

const liveAccessEvents: LiveAccessEvent[] = Array.from({ length: 10 }, (_, i) => {
  const d = new Date(now);
  d.setMinutes(d.getMinutes() - i * 8);
  return {
    id: `live-${i + 1}`,
    student_name: studentNames[i],
    photo_url: `/avatars/student-${i + 1}.jpg`,
    timestamp: d.toISOString(),
    direction: i % 3 === 0 ? 'exit' : 'entry',
    device_name: 'Catraca Entrada Principal',
    method: i % 3 === 0 ? 'proximity' : 'qr_code',
  };
});

const occupancy: OccupancyData = {
  current: 18,
  max: 40,
  percentage: 45,
  hourly: [
    { hour: 6, count: 4 },
    { hour: 7, count: 8 },
    { hour: 8, count: 12 },
    { hour: 9, count: 15 },
    { hour: 10, count: 18 },
    { hour: 11, count: 14 },
    { hour: 12, count: 8 },
    { hour: 13, count: 5 },
    { hour: 14, count: 7 },
    { hour: 15, count: 10 },
    { hour: 16, count: 16 },
    { hour: 17, count: 22 },
    { hour: 18, count: 32 },
    { hour: 19, count: 38 },
    { hour: 20, count: 35 },
    { hour: 21, count: 20 },
    { hour: 22, count: 6 },
  ],
};

const alerts: DeviceAlert[] = [
  {
    id: 'alert-1',
    device_id: 'device-2',
    device_name: 'Beacon BLE — Tatame',
    type: 'low_battery',
    message: 'Bateria do beacon abaixo de 20%. Substituir em breve.',
    timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    resolved: false,
  },
  {
    id: 'alert-2',
    device_id: 'device-1',
    device_name: 'Catraca Entrada Principal',
    type: 'firmware_update',
    message: 'Nova versão de firmware disponível (v2.5.0).',
    timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
    resolved: false,
  },
];

export async function mockGetDevices(_unitId: string): Promise<IoTDevice[]> {
  await delay();
  return devices;
}

export async function mockGetDeviceStatus(deviceId: string): Promise<IoTDevice> {
  await delay();
  return devices.find((d) => d.id === deviceId) || devices[0];
}

export async function mockGetLiveAccess(_unitId: string): Promise<LiveAccessEvent[]> {
  await delay();
  return liveAccessEvents;
}

export async function mockGetOccupancy(_unitId: string): Promise<OccupancyData> {
  await delay();
  return occupancy;
}

export async function mockGetDeviceAlerts(_unitId: string): Promise<DeviceAlert[]> {
  await delay();
  return alerts;
}
