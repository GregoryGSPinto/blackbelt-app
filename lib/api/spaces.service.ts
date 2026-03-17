import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

export interface SpaceDTO {
  id: string;
  unitId: string;
  name: string;
  capacity: number;
  equipment: string[];
  status: 'available' | 'occupied' | 'maintenance';
}

export interface SpaceScheduleSlot {
  spaceId: string;
  spaceName: string;
  day: number;
  startTime: string;
  endTime: string;
  className: string;
  professor: string;
}

export async function listSpaces(unitId: string): Promise<SpaceDTO[]> {
  try {
    if (isMock()) {
      const { mockListSpaces } = await import('@/lib/mocks/spaces.mock');
      return mockListSpaces(unitId);
    }
    try {
      const res = await fetch(`/api/spaces?unitId=${unitId}`);
      if (!res.ok) throw new ServiceError(res.status, 'spaces.list');
      return res.json();
    } catch {
      console.warn('[spaces.listSpaces] API not available, using fallback');
      return [];
    }
  } catch (error) { handleServiceError(error, 'spaces.list'); }
}

export async function getSpaceSchedule(unitId: string): Promise<SpaceScheduleSlot[]> {
  try {
    if (isMock()) {
      const { mockGetSchedule } = await import('@/lib/mocks/spaces.mock');
      return mockGetSchedule(unitId);
    }
    try {
      const res = await fetch(`/api/spaces/schedule?unitId=${unitId}`);
      if (!res.ok) throw new ServiceError(res.status, 'spaces.schedule');
      return res.json();
    } catch {
      console.warn('[spaces.getSpaceSchedule] API not available, using fallback');
      return [];
    }
  } catch (error) { handleServiceError(error, 'spaces.schedule'); }
}

export async function createSpace(unitId: string, data: Omit<SpaceDTO, 'id' | 'unitId' | 'status'>): Promise<SpaceDTO> {
  try {
    if (isMock()) {
      const { mockCreateSpace } = await import('@/lib/mocks/spaces.mock');
      return mockCreateSpace(unitId, data);
    }
    try {
      const res = await fetch(`/api/spaces`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ unitId, ...data }) });
      if (!res.ok) throw new ServiceError(res.status, 'spaces.create');
      return res.json();
    } catch {
      console.warn('[spaces.createSpace] API not available, using fallback');
      return {} as SpaceDTO;
    }
  } catch (error) { handleServiceError(error, 'spaces.create'); }
}
