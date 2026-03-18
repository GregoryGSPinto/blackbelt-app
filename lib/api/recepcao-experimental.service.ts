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
      return { hoje: [], followUp: [], historico: [], funnel: { agendadas: 0, vieram: 0, matricularam: 0, conversao: 0 } };
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
    // API not yet implemented — use mock
    const { mockMarcarChegou } = await import('@/lib/mocks/recepcao-experimental.mock');
      return mockMarcarChegou(id);
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
    // API not yet implemented — use mock
    const { mockMarcarNaoVeio } = await import('@/lib/mocks/recepcao-experimental.mock');
      return mockMarcarNaoVeio(id);
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
    // API not yet implemented — use mock
    const { mockMarcarMatriculou } = await import('@/lib/mocks/recepcao-experimental.mock');
      return mockMarcarMatriculou(id);
  } catch (error) {
    handleServiceError(error, 'recepcao-experimental.matriculou');
  }
}
