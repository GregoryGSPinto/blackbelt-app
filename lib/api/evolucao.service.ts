import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
import type { BeltLevel } from '@/lib/types';

export interface MeuProgressoDTO {
  faixa_atual: BeltLevel;
  data_promocao: string;
  tempo_na_faixa_dias: number;
  total_aulas: number;
  media_avaliacoes: number;
}

export interface HistoricoFaixaDTO {
  id: string;
  from_belt: BeltLevel;
  to_belt: BeltLevel;
  date: string;
  evaluated_by_name: string;
}

export interface RequisitoProximaFaixaDTO {
  proxima_faixa: BeltLevel;
  presenca: { necessario: number; atual: number; percentual: number };
  avaliacao: { necessario: number; atual: number; percentual: number };
  tempo_minimo_meses: number;
  tempo_atual_meses: number;
  completo: boolean;
}

export async function getMeuProgresso(studentId: string): Promise<MeuProgressoDTO> {
  try {
    if (isMock()) {
      const { mockGetMeuProgresso } = await import('@/lib/mocks/evolucao.mock');
      return mockGetMeuProgresso(studentId);
    }
    try {
      const res = await fetch(`/api/evolucao/progresso?studentId=${studentId}`);
      if (!res.ok) throw new ServiceError(res.status, 'evolucao.progresso');
      return res.json();
    } catch {
      console.warn('[evolucao.getMeuProgresso] API not available, using mock fallback');
      const { mockGetMeuProgresso } = await import('@/lib/mocks/evolucao.mock');
      return mockGetMeuProgresso(studentId);
    }
  } catch (error) {
    handleServiceError(error, 'evolucao.progresso');
  }
}

export async function getHistoricoFaixas(studentId: string): Promise<HistoricoFaixaDTO[]> {
  try {
    if (isMock()) {
      const { mockGetHistoricoFaixas } = await import('@/lib/mocks/evolucao.mock');
      return mockGetHistoricoFaixas(studentId);
    }
    try {
      const res = await fetch(`/api/evolucao/historico?studentId=${studentId}`);
      if (!res.ok) throw new ServiceError(res.status, 'evolucao.historico');
      return res.json();
    } catch {
      console.warn('[evolucao.getHistoricoFaixas] API not available, using mock fallback');
      const { mockGetHistoricoFaixas } = await import('@/lib/mocks/evolucao.mock');
      return mockGetHistoricoFaixas(studentId);
    }
  } catch (error) {
    handleServiceError(error, 'evolucao.historico');
  }
}

export async function getRequisitoProximaFaixa(studentId: string): Promise<RequisitoProximaFaixaDTO> {
  try {
    if (isMock()) {
      const { mockGetRequisitoProximaFaixa } = await import('@/lib/mocks/evolucao.mock');
      return mockGetRequisitoProximaFaixa(studentId);
    }
    try {
      const res = await fetch(`/api/evolucao/requisitos?studentId=${studentId}`);
      if (!res.ok) throw new ServiceError(res.status, 'evolucao.requisitos');
      return res.json();
    } catch {
      console.warn('[evolucao.getRequisitoProximaFaixa] API not available, using mock fallback');
      const { mockGetRequisitoProximaFaixa } = await import('@/lib/mocks/evolucao.mock');
      return mockGetRequisitoProximaFaixa(studentId);
    }
  } catch (error) {
    handleServiceError(error, 'evolucao.requisitos');
  }
}
