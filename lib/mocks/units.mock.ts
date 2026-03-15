import type { UnitDTO } from '@/lib/api/units.service';

const delay = () => new Promise((r) => setTimeout(r, 200));

const UNITS: UnitDTO[] = [
  { id: 'unit-1', name: 'Sede Principal', address: 'Rua das Artes, 100 - Centro', phone: '(11) 3333-4444', operatingHours: 'Seg-Sex 6h-22h, Sáb 8h-14h', classCount: 4, studentCount: 35, active: true },
  { id: 'unit-2', name: 'Filial Norte', address: 'Av. Norte, 500 - Bairro Alto', phone: '(11) 3333-5555', operatingHours: 'Seg-Sex 7h-21h', classCount: 2, studentCount: 13, active: true },
];

export async function mockListUnits(_academyId: string): Promise<UnitDTO[]> {
  await delay();
  return UNITS.map((u) => ({ ...u }));
}

export async function mockCreateUnit(_academyId: string, data: Omit<UnitDTO, 'id' | 'classCount' | 'studentCount' | 'active'>): Promise<UnitDTO> {
  await delay();
  const unit: UnitDTO = { ...data, id: `unit-${Date.now()}`, classCount: 0, studentCount: 0, active: true };
  UNITS.push(unit);
  return { ...unit };
}

export async function mockUpdateUnit(unitId: string, data: Partial<UnitDTO>): Promise<UnitDTO> {
  await delay();
  const idx = UNITS.findIndex((u) => u.id === unitId);
  if (idx >= 0) Object.assign(UNITS[idx], data);
  return { ...UNITS[idx] };
}

export async function mockDeactivateUnit(unitId: string): Promise<void> {
  await delay();
  const unit = UNITS.find((u) => u.id === unitId);
  if (unit) unit.active = false;
}
