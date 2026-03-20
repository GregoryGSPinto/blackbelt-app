import { isMock } from '@/lib/env';

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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('professor_alerts')
      .select('*')
      .eq('professor_id', professorId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.warn('[getAlertas] Supabase error:', error?.message);
      return [];
    }

    return (data ?? []).map((row: Record<string, unknown>) => ({
      id: String(row.id ?? ''),
      tipo: (row.tipo ?? 'ausencia') as AlertaProfessor['tipo'],
      titulo: String(row.titulo ?? ''),
      mensagem: String(row.mensagem ?? ''),
      alunoId: row.aluno_id ? String(row.aluno_id) : undefined,
      alunoNome: row.aluno_nome ? String(row.aluno_nome) : undefined,
      turmaId: row.turma_id ? String(row.turma_id) : undefined,
      turmaNome: row.turma_nome ? String(row.turma_nome) : undefined,
      urgencia: (row.urgencia ?? 'info') as AlertaProfessor['urgencia'],
      acao: row.acao ? (row.acao as AlertaProfessor['acao']) : undefined,
      lido: Boolean(row.lido),
      criadoEm: String(row.created_at ?? ''),
    }));
  } catch (error) {
    console.warn('[getAlertas] Fallback:', error);
    return [];
  }
}

export async function getAlertasCount(professorId: string): Promise<number> {
  try {
    if (isMock()) {
      const { mockGetAlertasCount } = await import('@/lib/mocks/professor-alertas.mock');
      return mockGetAlertasCount(professorId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { count, error } = await supabase
      .from('professor_alerts')
      .select('*', { count: 'exact', head: true })
      .eq('professor_id', professorId)
      .eq('lido', false);

    if (error) {
      console.warn('[getAlertasCount] Supabase error:', error.message);
      return 0;
    }

    return count ?? 0;
  } catch (error) {
    console.warn('[getAlertasCount] Fallback:', error);
    return 0;
  }
}

export async function marcarLido(alertaId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockMarcarLido } = await import('@/lib/mocks/professor-alertas.mock');
      return mockMarcarLido(alertaId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('professor_alerts')
      .update({ lido: true })
      .eq('id', alertaId);

    if (error) {
      console.warn('[marcarLido] Supabase error:', error.message);
    }
  } catch (error) {
    console.warn('[marcarLido] Fallback:', error);
  }
}

export async function marcarTodosLidos(professorId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockMarcarTodosLidos } = await import('@/lib/mocks/professor-alertas.mock');
      return mockMarcarTodosLidos(professorId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('professor_alerts')
      .update({ lido: true })
      .eq('professor_id', professorId)
      .eq('lido', false);

    if (error) {
      console.warn('[marcarTodosLidos] Supabase error:', error.message);
    }
  } catch (error) {
    console.warn('[marcarTodosLidos] Fallback:', error);
  }
}
