import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

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
  if (isMock()) {
    const { mockListUnits } = await import('@/lib/mocks/units.mock');
    return mockListUnits(academyId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('units')
    .select('*')
    .eq('academy_id', academyId)
    .eq('active', true);
  if (error) {
    logServiceError(error, 'units');
    return [];
  }
  return (data ?? []) as unknown as UnitDTO[];
}

export async function createUnit(academyId: string, data: Omit<UnitDTO, 'id' | 'classCount' | 'studentCount' | 'active'>): Promise<UnitDTO> {
  if (isMock()) {
    const { mockCreateUnit } = await import('@/lib/mocks/units.mock');
    return mockCreateUnit(academyId, data);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data: row, error } = await supabase
    .from('units')
    .insert({ academy_id: academyId, ...data, active: true })
    .select()
    .single();
  if (error || !row) {
    logServiceError(error, 'units');
    throw new Error(`[createUnit] Failed to create unit: ${error?.message ?? 'no data'}`);
  }
  return row as unknown as UnitDTO;
}

export async function updateUnit(unitId: string, data: Partial<UnitDTO>): Promise<UnitDTO> {
  if (isMock()) {
    const { mockUpdateUnit } = await import('@/lib/mocks/units.mock');
    return mockUpdateUnit(unitId, data);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { data: row, error } = await supabase
    .from('units')
    .update(data)
    .eq('id', unitId)
    .select()
    .single();
  if (error || !row) {
    logServiceError(error, 'units');
    throw new Error(`[updateUnit] Failed to update unit: ${error?.message ?? 'no data'}`);
  }
  return row as unknown as UnitDTO;
}

export async function deactivateUnit(unitId: string): Promise<void> {
  if (isMock()) {
    const { mockDeactivateUnit } = await import('@/lib/mocks/units.mock');
    return mockDeactivateUnit(unitId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();
  const { error } = await supabase
    .from('units')
    .update({ active: false })
    .eq('id', unitId);
  if (error) {
    logServiceError(error, 'units');
    throw new Error(`[deactivateUnit] Failed to deactivate unit: ${error.message}`);
  }
}
