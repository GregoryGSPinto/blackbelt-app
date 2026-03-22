import { isMock } from '@/lib/env';

// ────────────────────────────────────────────────────────────
// DTOs
// ────────────────────────────────────────────────────────────

export interface AlunoCheckin {
  id: string;
  nome: string;
  avatar: string;
  faixa: string;
  turma: string;
  statusFinanceiro: 'em_dia' | 'atrasado' | 'inadimplente';
  diasAtraso: number;
  ultimoTreino: string;
}

export interface PessoaDentro {
  id: string;
  nome: string;
  avatar: string;
  faixa: string;
  horaEntrada: string;
  turma: string;
  tipo: 'aluno' | 'professor' | 'visitante';
}

export interface CapacidadeInfo {
  totalDentro: number;
  capacidadeMax: number;
  percentual: number;
}

// ────────────────────────────────────────────────────────────
// Service
// ────────────────────────────────────────────────────────────

export async function buscarAlunoCheckin(query: string): Promise<AlunoCheckin[]> {
  try {
    if (isMock()) {
      const { mockBuscarAluno } = await import('@/lib/mocks/recepcao-checkin.mock');
      return mockBuscarAluno(query);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, belt, turma, financial_status, days_overdue, last_training')
      .ilike('display_name', `%${query}%`)
      .limit(10);
    if (error || !data) return [];
    return data.map((d: Record<string, unknown>) => ({
      id: d.id as string,
      nome: d.display_name as string,
      avatar: (d.avatar_url as string) || '',
      faixa: (d.belt as string) || 'branca',
      turma: (d.turma as string) || '',
      statusFinanceiro: (d.financial_status as AlunoCheckin['statusFinanceiro']) || 'em_dia',
      diasAtraso: (d.days_overdue as number) || 0,
      ultimoTreino: (d.last_training as string) || '',
    }));
  } catch {
    return [];
  }
}

export async function registrarEntrada(alunoId: string): Promise<{ success: boolean; message: string }> {
  try {
    if (isMock()) {
      const { mockRegistrarEntrada } = await import('@/lib/mocks/recepcao-checkin.mock');
      return mockRegistrarEntrada(alunoId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase.from('checkins').insert({ profile_id: alunoId, type: 'entrada', created_at: new Date().toISOString() });
    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Entrada registrada!' };
  } catch {
    return { success: false, message: 'Erro ao registrar entrada' };
  }
}

export async function registrarSaida(alunoId: string): Promise<{ success: boolean }> {
  try {
    if (isMock()) {
      const { mockRegistrarSaida } = await import('@/lib/mocks/recepcao-checkin.mock');
      return mockRegistrarSaida(alunoId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase.from('checkins').insert({ profile_id: alunoId, type: 'saida', created_at: new Date().toISOString() });
    if (error) return { success: false };
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function getDentroAgora(): Promise<{ pessoas: PessoaDentro[]; capacidade: CapacidadeInfo }> {
  const fallback = { pessoas: [], capacidade: { totalDentro: 0, capacidadeMax: 80, percentual: 0 } };
  try {
    if (isMock()) {
      const { mockGetDentroAgora } = await import('@/lib/mocks/recepcao-checkin.mock');
      return mockGetDentroAgora();
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from('checkins_ativos').select('*');
    if (error || !data) return fallback;
    const pessoas = data.map((d: Record<string, unknown>) => ({
      id: d.id as string,
      nome: d.nome as string,
      avatar: (d.avatar as string) || '',
      faixa: (d.faixa as string) || 'branca',
      horaEntrada: d.hora_entrada as string,
      turma: (d.turma as string) || '',
      tipo: (d.tipo as PessoaDentro['tipo']) || 'aluno',
    }));
    return { pessoas, capacidade: { totalDentro: pessoas.length, capacidadeMax: 80, percentual: (pessoas.length / 80) * 100 } };
  } catch {
    return fallback;
  }
}

export async function registrarVisitante(nome: string, motivo: string): Promise<{ success: boolean }> {
  try {
    if (isMock()) {
      const { mockRegistrarVisitante } = await import('@/lib/mocks/recepcao-checkin.mock');
      return mockRegistrarVisitante(nome, motivo);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase.from('visitantes').insert({ nome, motivo, created_at: new Date().toISOString() });
    if (error) return { success: false };
    return { success: true };
  } catch {
    return { success: false };
  }
}
