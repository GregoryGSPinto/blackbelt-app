import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

// ── Types ──────────────────────────────────────────────────────────────

export interface AlertaProfessor {
  id: string;
  tipo: 'ausencia' | 'graduacao_pronta' | 'aniversario' | 'turma_lotada' | 'primeiro_dia' | 'retorno' | 'avaliacao_pendente' | 'lesao_reportada';
  titulo: string;
  mensagem: string;
  alunoId?: string;
  alunoNome?: string;
  turmaId?: string;
  turmaNome?: string;
  urgencia: 'alta' | 'media' | 'info';
  acao?: {
    label: string;
    rota: string;
  };
  lido: boolean;
  criadoEm: string;
}

// ── Service Functions ──────────────────────────────────────────────────

export async function getAlertas(professorId: string): Promise<AlertaProfessor[]> {
  try {
    if (isMock()) {
      const { mockGetAlertas } = await import('@/lib/mocks/professor-alertas.mock');
      return mockGetAlertas(professorId);
    }
    console.warn('[professorAlertas.get] fallback — not yet connected to Supabase');
    return [];
  } catch (error) {
    handleServiceError(error, 'professorAlertas.get');
  }
}

export async function getAlertasCount(professorId: string): Promise<number> {
  try {
    if (isMock()) {
      const { mockGetAlertasCount } = await import('@/lib/mocks/professor-alertas.mock');
      return mockGetAlertasCount(professorId);
    }
    console.warn('[professorAlertas.count] fallback — not yet connected to Supabase');
    return 0;
  } catch (error) {
    handleServiceError(error, 'professorAlertas.count');
  }
}

export async function marcarLido(alertaId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockMarcarLido } = await import('@/lib/mocks/professor-alertas.mock');
      return mockMarcarLido(alertaId);
    }
    console.warn('[professorAlertas.marcarLido] fallback — not yet connected to Supabase');
    return;
  } catch (error) {
    handleServiceError(error, 'professorAlertas.marcarLido');
  }
}

export async function marcarTodosLidos(professorId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockMarcarTodosLidos } = await import('@/lib/mocks/professor-alertas.mock');
      return mockMarcarTodosLidos(professorId);
    }
    console.warn('[professorAlertas.marcarTodosLidos] fallback — not yet connected to Supabase');
    return;
  } catch (error) {
    handleServiceError(error, 'professorAlertas.marcarTodosLidos');
  }
}
