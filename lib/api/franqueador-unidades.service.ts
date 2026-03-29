import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

// --- DTOs ---

export interface UnidadeFranquia {
  id: string;
  name: string;
  city: string;
  state: string;
  manager_name: string;
  manager_email: string;
  status: 'ativa' | 'setup' | 'suspensa' | 'encerrada';
  students_count: number;
  revenue_monthly: number;
  health_score: number;
  compliance_score: number;
  opened_at: string;
  updated_at: string;
}

export interface UnidadesOverview {
  total_units: number;
  active_units: number;
  total_students: number;
  avg_health_score: number;
  avg_compliance: number;
}

// --- Service Functions ---

export async function getUnidades(franchiseId: string): Promise<UnidadeFranquia[]> {
  try {
    if (isMock()) {
      const { mockGetUnidades } = await import('@/lib/mocks/franqueador-unidades.mock');
      return mockGetUnidades(franchiseId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('franchise_units')
      .select('*')
      .eq('franchise_id', franchiseId)
      .order('name', { ascending: true });

    if (error) {
      logServiceError(error, 'franqueador-unidades');
      return [];
    }

    return (data ?? []) as unknown as UnidadeFranquia[];
  } catch (error) {
    logServiceError(error, 'franqueador-unidades');
    return [];
  }
}

export async function getUnidadesOverview(franchiseId: string): Promise<UnidadesOverview> {
  try {
    if (isMock()) {
      const { mockGetUnidadesOverview } = await import('@/lib/mocks/franqueador-unidades.mock');
      return mockGetUnidadesOverview(franchiseId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('franchise_units')
      .select('status, students_count, health_score, compliance_score')
      .eq('franchise_id', franchiseId);

    if (error) {
      logServiceError(error, 'franqueador-unidades');
      return { total_units: 0, active_units: 0, total_students: 0, avg_health_score: 0, avg_compliance: 0 };
    }

    const units = (data ?? []) as Record<string, unknown>[];
    const activeUnits = units.filter(u => u.status === 'ativa');
    const totalStudents = units.reduce((s, u) => s + ((u.students_count as number) ?? 0), 0);
    const avgHealth = units.length ? units.reduce((s, u) => s + ((u.health_score as number) ?? 0), 0) / units.length : 0;
    const avgCompliance = units.length ? units.reduce((s, u) => s + ((u.compliance_score as number) ?? 0), 0) / units.length : 0;

    return {
      total_units: units.length,
      active_units: activeUnits.length,
      total_students: totalStudents,
      avg_health_score: Math.round(avgHealth * 10) / 10,
      avg_compliance: Math.round(avgCompliance * 10) / 10,
    };
  } catch (error) {
    logServiceError(error, 'franqueador-unidades');
    return { total_units: 0, active_units: 0, total_students: 0, avg_health_score: 0, avg_compliance: 0 };
  }
}

export async function getUnidadeDetail(unitId: string): Promise<UnidadeFranquia> {
  try {
    if (isMock()) {
      const { mockGetUnidadeDetail } = await import('@/lib/mocks/franqueador-unidades.mock');
      return mockGetUnidadeDetail(unitId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('franchise_units')
      .select('*')
      .eq('id', unitId)
      .single();

    if (error) {
      logServiceError(error, 'franqueador-unidades');
      return {} as UnidadeFranquia;
    }

    return data as unknown as UnidadeFranquia;
  } catch (error) {
    logServiceError(error, 'franqueador-unidades');
    return {} as UnidadeFranquia;
  }
}

export async function updateUnidadeStatus(
  unitId: string,
  status: UnidadeFranquia['status'],
): Promise<UnidadeFranquia> {
  try {
    if (isMock()) {
      const { mockUpdateUnidadeStatus } = await import('@/lib/mocks/franqueador-unidades.mock');
      return mockUpdateUnidadeStatus(unitId, status);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('franchise_units')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', unitId)
      .select()
      .single();

    if (error) {
      logServiceError(error, 'franqueador-unidades');
      return {} as UnidadeFranquia;
    }

    return data as unknown as UnidadeFranquia;
  } catch (error) {
    logServiceError(error, 'franqueador-unidades');
    return {} as UnidadeFranquia;
  }
}
