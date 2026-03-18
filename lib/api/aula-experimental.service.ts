import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

export type TrialOrigin = 'site' | 'indicacao' | 'instagram' | 'whatsapp' | 'presencial';
export type TrialStatus = 'agendada' | 'confirmada' | 'compareceu' | 'nao_compareceu' | 'matriculou' | 'desistiu';

export interface TrialClass {
  id: string;
  leadNome: string;
  leadEmail: string;
  leadTelefone: string;
  leadOrigem: TrialOrigin;
  turmaId: string;
  turmaNome: string;
  dataAgendada: string;
  status: TrialStatus;
  professorId: string;
  professorNome: string;
  observacoes?: string;
  followUpEnviado: boolean;
  createdAt: string;
}

export interface TrialMetrics {
  agendadas: number;
  confirmadas: number;
  compareceram: number;
  matricularam: number;
  taxaConversao: number;
}

export interface CreateTrialRequest {
  leadNome: string;
  leadEmail: string;
  leadTelefone: string;
  leadOrigem: TrialOrigin;
  turmaId: string;
  dataAgendada: string;
}

export interface TrialFilters {
  status?: TrialStatus;
  origem?: TrialOrigin;
}

export async function createTrialClass(academyId: string, data: CreateTrialRequest): Promise<TrialClass> {
  try {
    if (isMock()) {
      const { mockCreateTrialClass } = await import('@/lib/mocks/aula-experimental.mock');
      return mockCreateTrialClass(academyId, data);
    }
    try {
      const res = await fetch(`/api/aula-experimental`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ academyId, ...data }) });
      if (!res.ok) throw new ServiceError(res.status, 'aula-experimental.create');
      return res.json();
    } catch {
      console.warn('[aula-experimental.createTrialClass] API not available, using mock fallback');
      const { mockCreateTrialClass } = await import('@/lib/mocks/aula-experimental.mock');
      return mockCreateTrialClass(academyId, data);
    }
  } catch (error) { handleServiceError(error, 'aula-experimental.create'); }
}

export async function listTrialClasses(academyId: string, filters?: TrialFilters): Promise<TrialClass[]> {
  try {
    if (isMock()) {
      const { mockListTrialClasses } = await import('@/lib/mocks/aula-experimental.mock');
      return mockListTrialClasses(academyId, filters);
    }
    try {
      const params = new URLSearchParams({ academyId });
      if (filters?.status) params.set('status', filters.status);
      if (filters?.origem) params.set('origem', filters.origem);
      const res = await fetch(`/api/aula-experimental?${params}`);
      if (!res.ok) throw new ServiceError(res.status, 'aula-experimental.list');
      return res.json();
    } catch {
      console.warn('[aula-experimental.listTrialClasses] API not available, using mock fallback');
      const { mockListTrialClasses } = await import('@/lib/mocks/aula-experimental.mock');
      return mockListTrialClasses(academyId, filters);
    }
  } catch (error) { handleServiceError(error, 'aula-experimental.list'); }
}

export async function updateTrialStatus(id: string, status: TrialStatus): Promise<TrialClass> {
  try {
    if (isMock()) {
      const { mockUpdateTrialStatus } = await import('@/lib/mocks/aula-experimental.mock');
      return mockUpdateTrialStatus(id, status);
    }
    try {
      const res = await fetch(`/api/aula-experimental/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      if (!res.ok) throw new ServiceError(res.status, 'aula-experimental.updateStatus');
      return res.json();
    } catch {
      console.warn('[aula-experimental.updateTrialStatus] API not available, using mock fallback');
      const { mockUpdateTrialStatus } = await import('@/lib/mocks/aula-experimental.mock');
      return mockUpdateTrialStatus(id, status);
    }
  } catch (error) { handleServiceError(error, 'aula-experimental.updateStatus'); }
}

export async function getTrialMetrics(academyId: string): Promise<TrialMetrics> {
  try {
    if (isMock()) {
      const { mockGetTrialMetrics } = await import('@/lib/mocks/aula-experimental.mock');
      return mockGetTrialMetrics(academyId);
    }
    // API not yet implemented — use mock
    const { mockGetTrialMetrics } = await import('@/lib/mocks/aula-experimental.mock');
      return mockGetTrialMetrics(academyId);
  } catch (error) { handleServiceError(error, 'aula-experimental.metrics'); }
}
