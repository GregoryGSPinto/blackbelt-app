import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
import type { BeltLevel } from '@/lib/types';

export interface ProfessorDashboardDTO {
  proximaAula: ProximaAulaDTO | null;
  aulaAtiva: AulaAtivaDTO | null;
  minhasTurmas: TurmaResumoDTO[];
  meusAlunos: AlunoResumoDTO[];
  mensagensRecentes: MensagemPreviewDTO[];
}

export interface ProximaAulaDTO {
  class_id: string;
  modality_name: string;
  start_time: string;
  end_time: string;
  unit_name: string;
  enrolled_count: number;
}

export interface AulaAtivaDTO {
  class_id: string;
  modality_name: string;
  present_count: number;
  total_count: number;
}

export interface TurmaResumoDTO {
  class_id: string;
  modality_name: string;
  enrolled_count: number;
  schedule_text: string;
  presenca_media: number;
}

export interface AlunoResumoDTO {
  student_id: string;
  display_name: string;
  avatar: string | null;
  belt: BeltLevel;
  ultima_presenca: string | null;
}

export interface MensagemPreviewDTO {
  conversation_id: string;
  from_name: string;
  preview: string;
  time: string;
  unread: boolean;
}

export async function getProfessorDashboard(professorId: string): Promise<ProfessorDashboardDTO> {
  try {
    if (isMock()) {
      const { mockGetProfessorDashboard } = await import('@/lib/mocks/professor.mock');
      return mockGetProfessorDashboard(professorId);
    }
    const res = await fetch(`/api/professor/dashboard?professorId=${professorId}`);
    if (!res.ok) throw new ServiceError(res.status, 'professor.dashboard');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'professor.dashboard');
  }
}
