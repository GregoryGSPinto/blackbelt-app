import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
import type { BeltLevel, EvaluationCriteria, Evaluation, Progression } from '@/lib/types';

export interface ProgressoDTO {
  student_id: string;
  display_name: string;
  belt: BeltLevel;
  total_aulas: number;
  avaliacoes: EvaluationDTO[];
  historico_faixas: ProgressionDTO[];
}

export interface EvaluationDTO {
  id: string;
  class_id: string;
  criteria: EvaluationCriteria;
  score: number;
  date: string;
  professor_name: string;
}

export interface ProgressionDTO {
  id: string;
  from_belt: BeltLevel;
  to_belt: BeltLevel;
  date: string;
  evaluated_by_name: string;
}

export interface StudentWithProgress {
  student_id: string;
  display_name: string;
  avatar: string | null;
  belt: BeltLevel;
  total_aulas: number;
  media_avaliacoes: number;
}

export async function getProgressoAluno(studentId: string): Promise<ProgressoDTO> {
  try {
    if (isMock()) {
      const { mockGetProgressoAluno } = await import('@/lib/mocks/professor-pedagogico.mock');
      return mockGetProgressoAluno(studentId);
    }
    try {
      const res = await fetch(`/api/pedagogico/progresso?studentId=${studentId}`);
      if (!res.ok) throw new ServiceError(res.status, 'pedagogico.progresso');
      return res.json();
    } catch {
      console.warn('[professor-pedagogico.getProgressoAluno] API not available, using fallback');
      return {} as ProgressoDTO;
    }
  } catch (error) {
    handleServiceError(error, 'pedagogico.progresso');
  }
}

export async function avaliar(studentId: string, classId: string, criteria: EvaluationCriteria, score: number): Promise<Evaluation> {
  try {
    if (isMock()) {
      const { mockAvaliar } = await import('@/lib/mocks/professor-pedagogico.mock');
      return mockAvaliar(studentId, classId, criteria, score);
    }
    try {
      const res = await fetch('/api/pedagogico/avaliar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, classId, criteria, score }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'pedagogico.avaliar');
      return res.json();
    } catch {
      console.warn('[professor-pedagogico.avaliar] API not available, using fallback');
      return {} as Evaluation;
    }
  } catch (error) {
    handleServiceError(error, 'pedagogico.avaliar');
  }
}

export async function promoverFaixa(studentId: string, toBelt: BeltLevel): Promise<Progression> {
  try {
    if (isMock()) {
      const { mockPromoverFaixa } = await import('@/lib/mocks/professor-pedagogico.mock');
      return mockPromoverFaixa(studentId, toBelt);
    }
    try {
      const res = await fetch('/api/pedagogico/promover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, toBelt }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'pedagogico.promover');
      return res.json();
    } catch {
      console.warn('[professor-pedagogico.promoverFaixa] API not available, using fallback');
      return {} as Progression;
    }
  } catch (error) {
    handleServiceError(error, 'pedagogico.promover');
  }
}

export async function getAlunosDaTurma(classId: string): Promise<StudentWithProgress[]> {
  try {
    if (isMock()) {
      const { mockGetAlunosDaTurma } = await import('@/lib/mocks/professor-pedagogico.mock');
      return mockGetAlunosDaTurma(classId);
    }
    try {
      const res = await fetch(`/api/pedagogico/turma/${classId}/alunos`);
      if (!res.ok) throw new ServiceError(res.status, 'pedagogico.alunosDaTurma');
      return res.json();
    } catch {
      console.warn('[professor-pedagogico.getAlunosDaTurma] API not available, using fallback');
      return [];
    }
  } catch (error) {
    handleServiceError(error, 'pedagogico.alunosDaTurma');
  }
}
