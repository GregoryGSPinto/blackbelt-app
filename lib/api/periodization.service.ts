import { isMock } from '@/lib/env';

export type PhaseName = 'base' | 'build' | 'peak' | 'taper' | 'recovery';

export const PHASE_LABEL: Record<PhaseName, string> = {
  base: 'Base',
  build: 'Construção',
  peak: 'Pico',
  taper: 'Polimento',
  recovery: 'Recuperação',
};

export const PHASE_COLOR: Record<PhaseName, string> = {
  base: 'bg-blue-200 border-blue-400 text-blue-800',
  build: 'bg-orange-200 border-orange-400 text-orange-800',
  peak: 'bg-red-200 border-red-400 text-red-800',
  taper: 'bg-yellow-200 border-yellow-400 text-yellow-800',
  recovery: 'bg-green-200 border-green-400 text-green-800',
};

export interface Phase {
  id: string;
  name: PhaseName;
  start_date: string;
  end_date: string;
  weeks: number;
  intensity: number;
  volume: number;
  focus: string[];
  training_plan_id?: string;
}

export interface MacrocycleDTO {
  id: string;
  student_id: string;
  competition_name: string;
  competition_date: string;
  phases: Phase[];
  created_at: string;
  created_by: string;
}

export async function createMacrocycle(macrocycle: Omit<MacrocycleDTO, 'id' | 'created_at'>): Promise<MacrocycleDTO> {
  try {
    if (isMock()) {
      const { mockCreateMacrocycle } = await import('@/lib/mocks/periodization.mock');
      return mockCreateMacrocycle(macrocycle);
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      const { data, error } = await supabase
        .from('macrocycles')
        .insert({
          student_id: macrocycle.student_id,
          competition_name: macrocycle.competition_name,
          competition_date: macrocycle.competition_date,
          phases: macrocycle.phases,
          created_by: macrocycle.created_by,
        })
        .select()
        .single();

      if (error || !data) {
        console.error('[createMacrocycle] Supabase error:', error?.message);
        return {
          id: '',
          student_id: macrocycle.student_id,
          competition_name: macrocycle.competition_name,
          competition_date: macrocycle.competition_date,
          phases: macrocycle.phases,
          created_at: new Date().toISOString(),
          created_by: macrocycle.created_by,
        };
      }

      return {
        id: data.id,
        student_id: data.student_id,
        competition_name: data.competition_name,
        competition_date: data.competition_date,
        phases: (data.phases as Phase[]) || [],
        created_at: data.created_at,
        created_by: data.created_by || '',
      };
    } catch (err) {
      console.error('[periodization.createMacrocycle] Supabase not available, using mock fallback', err);
      const { mockCreateMacrocycle } = await import('@/lib/mocks/periodization.mock');
      return mockCreateMacrocycle(macrocycle);
    }
  } catch (error) {
    console.error('[createMacrocycle] Fallback:', error);
    return { id: '', student_id: macrocycle.student_id, competition_name: macrocycle.competition_name, competition_date: macrocycle.competition_date, phases: macrocycle.phases, created_at: new Date().toISOString(), created_by: macrocycle.created_by };
  }
}

export async function getMacrocycle(studentId: string): Promise<MacrocycleDTO | null> {
  try {
    if (isMock()) {
      const { mockGetMacrocycle } = await import('@/lib/mocks/periodization.mock');
      return mockGetMacrocycle(studentId);
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      const { data, error } = await supabase
        .from('macrocycles')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        // PGRST116 means no rows — that's OK, not an error
        if (error?.code !== 'PGRST116') {
          console.error('[getMacrocycle] Supabase error:', error?.message);
        }
        return null;
      }

      return {
        id: data.id,
        student_id: data.student_id,
        competition_name: data.competition_name,
        competition_date: data.competition_date,
        phases: (data.phases as Phase[]) || [],
        created_at: data.created_at,
        created_by: data.created_by || '',
      };
    } catch (err) {
      console.error('[periodization.getMacrocycle] Supabase not available, using fallback', err);
      return null;
    }
  } catch (error) {
    console.error('[getMacrocycle] Fallback:', error);
    return null;
  }
}

export async function updatePhase(macrocycleId: string, phaseId: string, data: Partial<Phase>): Promise<Phase> {
  try {
    if (isMock()) {
      const { mockUpdatePhase } = await import('@/lib/mocks/periodization.mock');
      return mockUpdatePhase(macrocycleId, phaseId, data);
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      // Fetch the current macrocycle
      const { data: macrocycle, error: fetchError } = await supabase
        .from('macrocycles')
        .select('phases')
        .eq('id', macrocycleId)
        .single();

      if (fetchError || !macrocycle) {
        console.error('[updatePhase] Supabase fetch error:', fetchError?.message);
        return { id: phaseId, name: 'base', start_date: '', end_date: '', weeks: 0, intensity: 0, volume: 0, focus: [] };
      }

      // Update the specific phase in the JSONB array
      const phases = (macrocycle.phases as Phase[]) || [];
      const phaseIndex = phases.findIndex((p) => p.id === phaseId);

      if (phaseIndex === -1) {
        console.error('[updatePhase] Phase not found:', phaseId);
        return { id: phaseId, name: 'base', start_date: '', end_date: '', weeks: 0, intensity: 0, volume: 0, focus: [] };
      }

      const updatedPhase = { ...phases[phaseIndex], ...data };
      phases[phaseIndex] = updatedPhase;

      // Write the updated phases array back
      const { error: updateError } = await supabase
        .from('macrocycles')
        .update({ phases })
        .eq('id', macrocycleId);

      if (updateError) {
        console.error('[updatePhase] Supabase update error:', updateError.message);
        return { id: phaseId, name: 'base', start_date: '', end_date: '', weeks: 0, intensity: 0, volume: 0, focus: [] };
      }

      return updatedPhase;
    } catch (err) {
      console.error('[periodization.updatePhase] Supabase not available, using mock fallback', err);
      const { mockUpdatePhase } = await import('@/lib/mocks/periodization.mock');
      return mockUpdatePhase(macrocycleId, phaseId, data);
    }
  } catch (error) {
    console.error('[updatePhase] Fallback:', error);
    return { id: phaseId, name: 'base', start_date: '', end_date: '', weeks: 0, intensity: 0, volume: 0, focus: [] };
  }
}
