import { isMock } from '@/lib/env';

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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('units')
      .select('*')
      .eq('academy_id', academyId)
      .eq('active', true);
    if (error) {
      console.warn('[listUnits] Supabase error:', error.message);
      return [];
    }
    return (data ?? []) as unknown as UnitDTO[];
  } catch (error) {
    console.warn('[listUnits] Fallback:', error);
    return [];
  }
}

export async function createUnit(academyId: string, data: Omit<UnitDTO, 'id' | 'classCount' | 'studentCount' | 'active'>): Promise<UnitDTO> {
  try {
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
      console.warn('[createUnit] Supabase error:', error?.message);
      const { mockCreateUnit } = await import('@/lib/mocks/units.mock');
      return mockCreateUnit(academyId, data);
    }
    return row as unknown as UnitDTO;
  } catch (error) {
    console.warn('[createUnit] Fallback:', error);
    const { mockCreateUnit } = await import('@/lib/mocks/units.mock');
    return mockCreateUnit(academyId, data);
  }
}

export async function updateUnit(unitId: string, data: Partial<UnitDTO>): Promise<UnitDTO> {
  try {
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
      console.warn('[updateUnit] Supabase error:', error?.message);
      const { mockUpdateUnit } = await import('@/lib/mocks/units.mock');
      return mockUpdateUnit(unitId, data);
    }
    return row as unknown as UnitDTO;
  } catch (error) {
    console.warn('[updateUnit] Fallback:', error);
    const { mockUpdateUnit } = await import('@/lib/mocks/units.mock');
    return mockUpdateUnit(unitId, data);
  }
}

export async function deactivateUnit(unitId: string): Promise<void> {
  try {
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
      console.warn('[deactivateUnit] Supabase error:', error.message);
    }
  } catch (error) {
    console.warn('[deactivateUnit] Fallback:', error);
  }
}
