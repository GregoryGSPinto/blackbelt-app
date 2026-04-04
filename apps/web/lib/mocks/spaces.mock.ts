import type { SpaceDTO, SpaceScheduleSlot } from '@/lib/api/spaces.service';

const delay = () => new Promise((r) => setTimeout(r, 200));

const SPACES: SpaceDTO[] = [
  { id: 'space-1', unitId: 'unit-1', name: 'Tatame Principal', capacity: 30, equipment: ['Tatame 10x10m', 'Espelhos', 'Timer digital'], status: 'available' },
  { id: 'space-2', unitId: 'unit-1', name: 'Tatame 2', capacity: 15, equipment: ['Tatame 6x6m'], status: 'available' },
  { id: 'space-3', unitId: 'unit-1', name: 'Sala de Musculação', capacity: 10, equipment: ['Halteres', 'Barra fixa', 'Kettlebells'], status: 'available' },
  { id: 'space-4', unitId: 'unit-1', name: 'Vestiário', capacity: 20, equipment: ['Armários', 'Chuveiros'], status: 'available' },
];

const SCHEDULE: SpaceScheduleSlot[] = [
  { spaceId: 'space-1', spaceName: 'Tatame Principal', day: 1, startTime: '07:00', endTime: '08:30', className: 'BJJ Fundamental', professor: 'Prof. Silva' },
  { spaceId: 'space-1', spaceName: 'Tatame Principal', day: 1, startTime: '19:00', endTime: '20:30', className: 'BJJ Avançado', professor: 'Prof. Silva' },
  { spaceId: 'space-2', spaceName: 'Tatame 2', day: 1, startTime: '18:00', endTime: '19:00', className: 'Kids BJJ', professor: 'Prof. Santos' },
  { spaceId: 'space-1', spaceName: 'Tatame Principal', day: 2, startTime: '18:00', endTime: '19:30', className: 'Muay Thai', professor: 'Prof. Costa' },
  { spaceId: 'space-1', spaceName: 'Tatame Principal', day: 3, startTime: '07:00', endTime: '08:30', className: 'BJJ Fundamental', professor: 'Prof. Silva' },
  { spaceId: 'space-1', spaceName: 'Tatame Principal', day: 3, startTime: '19:00', endTime: '20:30', className: 'BJJ Avançado', professor: 'Prof. Silva' },
];

export async function mockListSpaces(_unitId: string): Promise<SpaceDTO[]> {
  await delay();
  return SPACES.map((s) => ({ ...s }));
}

export async function mockGetSchedule(_unitId: string): Promise<SpaceScheduleSlot[]> {
  await delay();
  return SCHEDULE.map((s) => ({ ...s }));
}

export async function mockCreateSpace(unitId: string, data: Omit<SpaceDTO, 'id' | 'unitId' | 'status'>): Promise<SpaceDTO> {
  await delay();
  const space: SpaceDTO = { ...data, id: `space-${Date.now()}`, unitId, status: 'available' };
  SPACES.push(space);
  return space;
}
