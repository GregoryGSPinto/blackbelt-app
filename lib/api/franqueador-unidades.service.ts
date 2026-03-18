import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

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
    try {
      const res = await fetch(`/api/franchise/${franchiseId}/unidades`);
      if (!res.ok) throw new ServiceError(res.status, 'franqueador-unidades.list');
      return res.json();
    } catch {
      console.warn('[franqueador-unidades.getUnidades] API not available, using fallback');
      return [];
    }
  } catch (error) { handleServiceError(error, 'franqueador-unidades.list'); }
}

export async function getUnidadesOverview(franchiseId: string): Promise<UnidadesOverview> {
  try {
    if (isMock()) {
      const { mockGetUnidadesOverview } = await import('@/lib/mocks/franqueador-unidades.mock');
      return mockGetUnidadesOverview(franchiseId);
    }
    try {
      const res = await fetch(`/api/franchise/${franchiseId}/unidades/overview`);
      if (!res.ok) throw new ServiceError(res.status, 'franqueador-unidades.overview');
      return res.json();
    } catch {
      console.warn('[franqueador-unidades.getUnidadesOverview] API not available, using fallback');
      return { total_units: 0, active_units: 0, total_students: 0, avg_health_score: 0, avg_compliance: 0 } as UnidadesOverview;
    }
  } catch (error) { handleServiceError(error, 'franqueador-unidades.overview'); }
}

export async function getUnidadeDetail(unitId: string): Promise<UnidadeFranquia> {
  try {
    if (isMock()) {
      const { mockGetUnidadeDetail } = await import('@/lib/mocks/franqueador-unidades.mock');
      return mockGetUnidadeDetail(unitId);
    }
    try {
      const res = await fetch(`/api/franchise/unidades/${unitId}`);
      if (!res.ok) throw new ServiceError(res.status, 'franqueador-unidades.detail');
      return res.json();
    } catch {
      console.warn('[franqueador-unidades.getUnidadeDetail] API not available, using fallback');
      return { id: '', name: '', city: '', state: '', manager_name: '', manager_email: '', status: 'ativa', students_count: 0, revenue_monthly: 0, health_score: 0, compliance_score: 0, opened_at: '', updated_at: '' } as UnidadeFranquia;
    }
  } catch (error) { handleServiceError(error, 'franqueador-unidades.detail'); }
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
    try {
      const res = await fetch(`/api/franchise/unidades/${unitId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'franqueador-unidades.updateStatus');
      return res.json();
    } catch {
      console.warn('[franqueador-unidades.updateUnidadeStatus] API not available, using fallback');
      return { id: '', name: '', city: '', state: '', manager_name: '', manager_email: '', status: 'ativa', students_count: 0, revenue_monthly: 0, health_score: 0, compliance_score: 0, opened_at: '', updated_at: '' } as UnidadeFranquia;
    }

  } catch (error) { handleServiceError(error, 'franqueador-unidades.updateStatus'); }
}
