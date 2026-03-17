import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

export interface UnitDTO {
  id: string;
  name: string;
  address: string;
  phone: string;
  operatingHours: string;
  classCount: number;
  studentCount: number;
  active: boolean;
}

export async function listUnits(academyId: string): Promise<UnitDTO[]> {
  try {
    if (isMock()) {
      const { mockListUnits } = await import('@/lib/mocks/units.mock');
      return mockListUnits(academyId);
    }
    try {
      const res = await fetch(`/api/units?academyId=${academyId}`);
      if (!res.ok) throw new ServiceError(res.status, 'units.list');
      return res.json();
    } catch {
      console.warn('[units.listUnits] API not available, using fallback');
      return [];
    }
  } catch (error) { handleServiceError(error, 'units.list'); }
}

export async function createUnit(academyId: string, data: Omit<UnitDTO, 'id' | 'classCount' | 'studentCount' | 'active'>): Promise<UnitDTO> {
  try {
    if (isMock()) {
      const { mockCreateUnit } = await import('@/lib/mocks/units.mock');
      return mockCreateUnit(academyId, data);
    }
    try {
      const res = await fetch(`/api/units`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ academyId, ...data }) });
      if (!res.ok) throw new ServiceError(res.status, 'units.create');
      return res.json();
    } catch {
      console.warn('[units.createUnit] API not available, using fallback');
      return {} as UnitDTO;
    }
  } catch (error) { handleServiceError(error, 'units.create'); }
}

export async function updateUnit(unitId: string, data: Partial<UnitDTO>): Promise<UnitDTO> {
  try {
    if (isMock()) {
      const { mockUpdateUnit } = await import('@/lib/mocks/units.mock');
      return mockUpdateUnit(unitId, data);
    }
    try {
      const res = await fetch(`/api/units/${unitId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new ServiceError(res.status, 'units.update');
      return res.json();
    } catch {
      console.warn('[units.updateUnit] API not available, using fallback');
      return {} as UnitDTO;
    }
  } catch (error) { handleServiceError(error, 'units.update'); }
}

export async function deactivateUnit(unitId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockDeactivateUnit } = await import('@/lib/mocks/units.mock');
      return mockDeactivateUnit(unitId);
    }
    try {
      const res = await fetch(`/api/units/${unitId}/deactivate`, { method: 'POST' });
      if (!res.ok) throw new ServiceError(res.status, 'units.deactivate');
    } catch {
      console.warn('[units.deactivateUnit] API not available, using fallback');
    }
  } catch (error) { handleServiceError(error, 'units.deactivate'); }
}
