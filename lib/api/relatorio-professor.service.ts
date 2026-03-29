import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    let query = supabase
      .from('professor_reports')
      .select('*')
      .eq('academy_id', academyId);
    if (periodo) query = query.eq('periodo', periodo);
    const { data, error } = await query;
    if (error || !data) {
      logServiceError(error, 'relatorio-professor');
      return [];
    }
    return data as unknown as RelatorioProfessor[];
  } catch (error) {
    logServiceError(error, 'relatorio-professor');
    return [];
  }
}

export async function getDetalheProfessor(professorId: string, periodo?: string): Promise<DetalheProfessor> {
  try {
    if (isMock()) {
      const { mockGetDetalheProfessor } = await import('@/lib/mocks/relatorio-professor.mock');
      return mockGetDetalheProfessor(professorId, periodo);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    let query = supabase
      .from('professor_reports')
      .select('*')
      .eq('professor_id', professorId);
    if (periodo) query = query.eq('periodo', periodo);
    const { data, error } = await query.single();
    if (error || !data) {
      logServiceError(error, 'relatorio-professor');
      return {} as DetalheProfessor;
    }
    return data as unknown as DetalheProfessor;
  } catch (error) {
    logServiceError(error, 'relatorio-professor');
    return {} as DetalheProfessor;
  }
}
