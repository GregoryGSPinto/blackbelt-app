import { isMock } from '@/lib/env';

// ────────────────────────────────────────────────────────────
// DTOs
// ────────────────────────────────────────────────────────────

export interface AlunoAtendimento {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  faixa: string;
  tipo: 'adulto' | 'teen' | 'kids';
  statusFinanceiro: 'em_dia' | 'atrasado';
  diasAtraso?: number;
  valorDevido?: number;
  plano: string;
  proximoVencimento: string;
  ultimoCheckin: string;
  presencasMes: number;
  turmas: string[];
  alertas: string[];
  avatar?: string;
}

// ────────────────────────────────────────────────────────────
// Service
// ────────────────────────────────────────────────────────────

export async function buscarAlunoAtendimento(query: string): Promise<AlunoAtendimento[]> {
  try {
    if (isMock()) {
      const { mockBuscarAluno } = await import('@/lib/mocks/recepcao-atendimento.mock');
      return mockBuscarAluno(query);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .or(`nome.ilike.%${query}%,email.ilike.%${query}%,telefone.ilike.%${query}%`)
      .limit(20);
    if (error) {
      console.error('[buscarAlunoAtendimento] Supabase error:', error.message);
      return [];
    }
    return (data ?? []) as unknown as AlunoAtendimento[];
  } catch (error) {
    console.error('[buscarAlunoAtendimento] Fallback:', error);
    return [];
  }
}

export async function checkinManual(alunoId: string, turmaId: string): Promise<{ ok: boolean }> {
  try {
    if (isMock()) {
      const { mockCheckinManual } = await import('@/lib/mocks/recepcao-atendimento.mock');
      return mockCheckinManual(alunoId, turmaId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from('checkins')
      .insert({ student_id: alunoId, class_id: turmaId, checked_in_at: new Date().toISOString(), method: 'manual' });
    if (error) {
      console.error('[checkinManual] Supabase error:', error.message);
      return { ok: false };
    }
    return { ok: true };
  } catch (error) {
    console.error('[checkinManual] Fallback:', error);
    return { ok: false };
  }
}

export async function registrarPagamento(data: {
  alunoId: string;
  valor: number;
  metodo: string;
  referencia: string;
}): Promise<{ ok: boolean }> {
  try {
    if (isMock()) {
      const { mockRegistrarPagamento } = await import('@/lib/mocks/recepcao-atendimento.mock');
      return mockRegistrarPagamento(data);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from('payments')
      .insert({
        student_id: data.alunoId,
        amount: data.valor,
        method: data.metodo,
        reference: data.referencia,
        paid_at: new Date().toISOString(),
      });
    if (error) {
      console.error('[registrarPagamento] Supabase error:', error.message);
      return { ok: false };
    }
    return { ok: true };
  } catch (error) {
    console.error('[registrarPagamento] Fallback:', error);
    return { ok: false };
  }
}
