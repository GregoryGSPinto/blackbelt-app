import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
import type { BeltLevel } from '@/lib/types';

export interface AlunoDashboardDTO {
  proximaAula: ProximaAulaDTO | null;
  progressoFaixa: ProgressoFaixaDTO;
  frequenciaMes: FrequenciaMesDTO;
  streak: number;
  conteudoRecomendado: ConteudoRecomendadoDTO[];
  ultimasConquistas: ConquistaRecenteDTO[];
}

export interface ProximaAulaDTO {
  class_id: string;
  modality_name: string;
  professor_name: string;
  start_time: string;
  end_time: string;
  unit_name: string;
}

export interface ProgressoFaixaDTO {
  faixa_atual: BeltLevel;
  proxima_faixa: BeltLevel;
  percentual: number;
  aulas_necessarias: number;
  aulas_concluidas: number;
}

export interface FrequenciaMesDTO {
  total_aulas: number;
  presencas: number;
  dias_presentes: number[];
}

export interface ConteudoRecomendadoDTO {
  video_id: string;
  title: string;
  duration: number;
  belt_level: BeltLevel;
}

export interface ConquistaRecenteDTO {
  id: string;
  name: string;
  type: string;
  granted_at: string;
}

export async function getAlunoDashboard(studentId: string): Promise<AlunoDashboardDTO> {
  try {
    if (isMock()) {
      const { mockGetAlunoDashboard } = await import('@/lib/mocks/aluno.mock');
      return mockGetAlunoDashboard(studentId);
    }
    const res = await fetch(`/api/aluno/dashboard?studentId=${studentId}`);
    if (!res.ok) throw new ServiceError(res.status, 'aluno.dashboard');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'aluno.dashboard');
  }
}
