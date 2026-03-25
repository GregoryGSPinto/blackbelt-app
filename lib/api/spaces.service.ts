import { isMock } from '@/lib/env';

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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('spaces')
      .select('*')
      .eq('unit_id', unitId);
    if (error || !data) {
      console.error('[listSpaces] Supabase error:', error?.message);
      return [];
    }
    return data as unknown as SpaceDTO[];
  } catch (error) {
    console.error('[listSpaces] Fallback:', error);
    return [];
  }
}

export async function getSpaceSchedule(unitId: string): Promise<SpaceScheduleSlot[]> {
  try {
    if (isMock()) {
      const { mockGetSchedule } = await import('@/lib/mocks/spaces.mock');
      return mockGetSchedule(unitId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('space_schedules')
      .select('*')
      .eq('unit_id', unitId);
    if (error || !data) {
      console.error('[getSpaceSchedule] Supabase error:', error?.message);
      return [];
    }
    return data as unknown as SpaceScheduleSlot[];
  } catch (error) {
    console.error('[getSpaceSchedule] Fallback:', error);
    return [];
  }
}

export async function createSpace(unitId: string, data: Omit<SpaceDTO, 'id' | 'unitId' | 'status'>): Promise<SpaceDTO> {
  try {
    if (isMock()) {
      const { mockCreateSpace } = await import('@/lib/mocks/spaces.mock');
      return mockCreateSpace(unitId, data);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: row, error } = await supabase
      .from('spaces')
      .insert({ unit_id: unitId, ...data, status: 'available' })
      .select()
      .single();
    if (error || !row) {
      console.error('[createSpace] Supabase error:', error?.message);
      const { mockCreateSpace } = await import('@/lib/mocks/spaces.mock');
      return mockCreateSpace(unitId, data);
    }
    return row as unknown as SpaceDTO;
  } catch (error) {
    console.error('[createSpace] Fallback:', error);
    const { mockCreateSpace } = await import('@/lib/mocks/spaces.mock');
    return mockCreateSpace(unitId, data);
  }
}
