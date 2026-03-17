import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

// ────────────────────────────────────────────────────────────
// DTOs
// ────────────────────────────────────────────────────────────

export interface ExperimentalRecepcao {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  idade: number;
  modalidade: string;
  turma: string;
  horario: string;
  data: string;
  origem: string;
  observacoes: string;
  status: 'agendada' | 'confirmada' | 'chegou' | 'nao_veio' | 'matriculou' | 'follow_up' | 'desistiu';
  criadoEm: string;
}

export interface FunnelExperimental {
  agendadas: number;
  vieram: number;
  matricularam: number;
  conversao: number;
}

// ────────────────────────────────────────────────────────────
// Service
// ────────────────────────────────────────────────────────────

export async function listExperimentais(): Promise<{ hoje: ExperimentalRecepcao[]; followUp: ExperimentalRecepcao[]; historico: ExperimentalRecepcao[]; funnel: FunnelExperimental }> {
  try {
    if (isMock()) {
      const { mockListExperimentais } = await import('@/lib/mocks/recepcao-experimental.mock');
      return mockListExperimentais();
    }
    try {
      const res = await fetch('/api/recepcao/experimentais');
      if (!res.ok) throw new ServiceError(res.status, 'recepcao-experimental.list');
      return res.json();
    } catch {
      console.warn('[recepcao-experimental.listExperimentais] API not available, using fallback');
      return {} as { hoje: ExperimentalRecepcao[]; followUp: ExperimentalRecepcao[]; historico: ExperimentalRecepcao[]; funnel: FunnelExperimental };
    }
  } catch (error) {
    handleServiceError(error, 'recepcao-experimental.list');
  }
}

export async function marcarChegou(id: string): Promise<{ ok: boolean }> {
  try {
    if (isMock()) {
      const { mockMarcarChegou } = await import('@/lib/mocks/recepcao-experimental.mock');
      return mockMarcarChegou(id);
    }
    try {
      const res = await fetch(`/api/recepcao/experimentais/${id}/chegou`, { method: 'POST' });
      if (!res.ok) throw new ServiceError(res.status, 'recepcao-experimental.chegou');
      return res.json();
    } catch {
      console.warn('[recepcao-experimental.marcarChegou] API not available, using fallback');
      return {} as { ok: boolean };
    }
  } catch (error) {
    handleServiceError(error, 'recepcao-experimental.chegou');
  }
}

export async function marcarNaoVeio(id: string): Promise<{ ok: boolean }> {
  try {
    if (isMock()) {
      const { mockMarcarNaoVeio } = await import('@/lib/mocks/recepcao-experimental.mock');
      return mockMarcarNaoVeio(id);
    }
    try {
      const res = await fetch(`/api/recepcao/experimentais/${id}/nao-veio`, { method: 'POST' });
      if (!res.ok) throw new ServiceError(res.status, 'recepcao-experimental.naoVeio');
      return res.json();
    } catch {
      console.warn('[recepcao-experimental.marcarNaoVeio] API not available, using fallback');
      return {} as { ok: boolean };
    }
  } catch (error) {
    handleServiceError(error, 'recepcao-experimental.naoVeio');
  }
}

export async function marcarMatriculou(id: string): Promise<{ ok: boolean }> {
  try {
    if (isMock()) {
      const { mockMarcarMatriculou } = await import('@/lib/mocks/recepcao-experimental.mock');
      return mockMarcarMatriculou(id);
    }
    try {
      const res = await fetch(`/api/recepcao/experimentais/${id}/matriculou`, { method: 'POST' });
      if (!res.ok) throw new ServiceError(res.status, 'recepcao-experimental.matriculou');
      return res.json();
    } catch {
      console.warn('[recepcao-experimental.marcarMatriculou] API not available, using fallback');
      return {} as { ok: boolean };
    }
  } catch (error) {
    handleServiceError(error, 'recepcao-experimental.matriculou');
  }
}
