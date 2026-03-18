import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';
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
    // API not yet implemented — use mock
    const { mockGetMeuProgresso } = await import('@/lib/mocks/evolucao.mock');
      return mockGetMeuProgresso(studentId);
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
    // API not yet implemented — use mock
    const { mockGetHistoricoFaixas } = await import('@/lib/mocks/evolucao.mock');
      return mockGetHistoricoFaixas(studentId);
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
    // API not yet implemented — use mock
    const { mockGetRequisitoProximaFaixa } = await import('@/lib/mocks/evolucao.mock');
      return mockGetRequisitoProximaFaixa(studentId);
  } catch (error) {
    handleServiceError(error, 'evolucao.requisitos');
  }
}
