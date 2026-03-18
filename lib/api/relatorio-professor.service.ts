import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

export interface RelatorioProfessor {
  professorId: string;
  nome: string;
  avatar?: string;
  totalAulasNoMes: number;
  mediaAlunosPorAula: number;
  taxaPresencaMedia: number;
  avaliacaoMedia: number;
  turmas: string[];
  horasTotais: number;
}

export interface AulaDetalhada {
  data: string;
  turma: string;
  presentes: number;
  total: number;
  avaliacao: number;
}

export interface EvolucaoMensal {
  mes: string;
  aulas: number;
  mediaPresenca: number;
}

export interface DetalheProfessor extends RelatorioProfessor {
  aulasDetalhadas: AulaDetalhada[];
  evolucaoMensal: EvolucaoMensal[];
}

export async function getRelatorioProfessores(academyId: string, periodo?: string): Promise<RelatorioProfessor[]> {
  try {
    if (isMock()) {
      const { mockGetRelatorioProfessores } = await import('@/lib/mocks/relatorio-professor.mock');
      return mockGetRelatorioProfessores(academyId, periodo);
    }
    try {
      const params = new URLSearchParams({ academyId });
      if (periodo) params.set('periodo', periodo);
      const res = await fetch(`/api/relatorio-professores?${params}`);
      if (!res.ok) throw new ServiceError(res.status, 'relatorio-professor.list');
      return res.json();
    } catch {
      console.warn('[relatorio-professor.getRelatorioProfessores] API not available, using mock fallback');
      const { mockGetRelatorioProfessores } = await import('@/lib/mocks/relatorio-professor.mock');
      return mockGetRelatorioProfessores(academyId, periodo);
    }
  } catch (error) { handleServiceError(error, 'relatorio-professor.list'); }
}

export async function getDetalheProfessor(professorId: string, periodo?: string): Promise<DetalheProfessor> {
  try {
    if (isMock()) {
      const { mockGetDetalheProfessor } = await import('@/lib/mocks/relatorio-professor.mock');
      return mockGetDetalheProfessor(professorId, periodo);
    }
    // API not yet implemented — use mock
    const { mockGetDetalheProfessor } = await import('@/lib/mocks/relatorio-professor.mock');
      return mockGetDetalheProfessor(professorId, periodo);
  } catch (error) { handleServiceError(error, 'relatorio-professor.detail'); }
}
