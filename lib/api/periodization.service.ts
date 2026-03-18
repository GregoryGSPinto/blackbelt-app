import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

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
      const res = await fetch('/api/periodization', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(macrocycle) });
      if (!res.ok) throw new ServiceError(res.status, 'periodization.create');
      return res.json();
    } catch {
      console.warn('[periodization.createMacrocycle] API not available, using fallback');
      return { id: '', student_id: '', competition_name: '', competition_date: '', phases: [], created_at: '', created_by: '' } as MacrocycleDTO;
    }
  } catch (error) { handleServiceError(error, 'periodization.create'); }
}

export async function getMacrocycle(studentId: string): Promise<MacrocycleDTO | null> {
  try {
    if (isMock()) {
      const { mockGetMacrocycle } = await import('@/lib/mocks/periodization.mock');
      return mockGetMacrocycle(studentId);
    }
    try {
      const res = await fetch(`/api/periodization?studentId=${studentId}`);
      if (!res.ok) throw new ServiceError(res.status, 'periodization.get');
      return res.json();
    } catch {
      console.warn('[periodization.getMacrocycle] API not available, using fallback');
      return null;
    }
  } catch (error) { handleServiceError(error, 'periodization.get'); }
}

export async function updatePhase(macrocycleId: string, phaseId: string, data: Partial<Phase>): Promise<Phase> {
  try {
    if (isMock()) {
      const { mockUpdatePhase } = await import('@/lib/mocks/periodization.mock');
      return mockUpdatePhase(macrocycleId, phaseId, data);
    }
    try {
      const res = await fetch(`/api/periodization/${macrocycleId}/phases/${phaseId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new ServiceError(res.status, 'periodization.updatePhase');
      return res.json();
    } catch {
      console.warn('[periodization.updatePhase] API not available, using fallback');
      return { id: '', name: 'base', start_date: '', end_date: '', weeks: 0, intensity: 0, volume: 0, focus: [] } as Phase;
    }
  } catch (error) { handleServiceError(error, 'periodization.updatePhase'); }
}
