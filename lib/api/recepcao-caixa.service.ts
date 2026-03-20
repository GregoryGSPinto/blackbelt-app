import { isMock } from '@/lib/env';

// ────────────────────────────────────────────────────────────
// DTOs
// ────────────────────────────────────────────────────────────

export interface Recebimento {
  id: string;
  horario: string;
  alunoNome: string;
  tipo: 'mensalidade' | 'matricula' | 'produto' | 'evento' | 'outro';
  descricao: string;
  valor: number;
  metodo: 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro' | 'boleto';
}

export interface VencimentoHoje {
  id: string;
  alunoNome: string;
  valor: number;
  plano: string;
}

export interface MetodoResumo {
  metodo: string;
  total: number;
  quantidade: number;
}

export interface CaixaDia {
  data: string;
  totalRecebido: number;
  totalPendente: number;
  totalRecebimentos: number;
  porMetodo: MetodoResumo[];
  recebimentos: Recebimento[];
  vencendoHoje: VencimentoHoje[];
}

// ────────────────────────────────────────────────────────────
// Service
// ────────────────────────────────────────────────────────────

export async function getCaixa(): Promise<CaixaDia> {
  try {
    if (isMock()) {
      const { mockGetCaixa } = await import('@/lib/mocks/recepcao-caixa.mock');
      return mockGetCaixa();
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const today = new Date().toISOString().slice(0, 10);

    // Fetch today's receipts
    const { data: recebimentos, error: recError } = await supabase
      .from('receipts')
      .select('*')
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`)
      .order('created_at', { ascending: false });

    if (recError) {
      console.warn('[getCaixa] error fetching receipts:', recError.message);
    }

    // Fetch bills due today
    const { data: vencimentos, error: vencError } = await supabase
      .from('bills')
      .select('id, amount, plan, students!inner(display_name)')
      .eq('due_date', today)
      .eq('status', 'pending');

    if (vencError) {
      console.warn('[getCaixa] error fetching vencimentos:', vencError.message);
    }

    const recList: Recebimento[] = (recebimentos ?? []).map((r: Record<string, unknown>) => ({
      id: r.id as string,
      horario: r.created_at as string,
      alunoNome: (r.student_name as string) ?? '',
      tipo: (r.type as Recebimento['tipo']) ?? 'outro',
      descricao: (r.description as string) ?? '',
      valor: (r.amount as number) ?? 0,
      metodo: (r.method as Recebimento['metodo']) ?? 'dinheiro',
    }));

    const totalRecebido = recList.reduce((sum, r) => sum + r.valor, 0);

    // Build method summary
    const metodoMap = new Map<string, { total: number; quantidade: number }>();
    for (const r of recList) {
      const cur = metodoMap.get(r.metodo) ?? { total: 0, quantidade: 0 };
      cur.total += r.valor;
      cur.quantidade += 1;
      metodoMap.set(r.metodo, cur);
    }
    const porMetodo: MetodoResumo[] = Array.from(metodoMap.entries()).map(([metodo, v]) => ({
      metodo,
      total: v.total,
      quantidade: v.quantidade,
    }));

    const vencendoHoje: VencimentoHoje[] = (vencimentos ?? []).map((v: Record<string, unknown>) => {
      const student = v.students as Record<string, unknown> | null;
      return {
        id: v.id as string,
        alunoNome: (student?.display_name as string) ?? '',
        valor: (v.amount as number) ?? 0,
        plano: (v.plan as string) ?? '',
      };
    });

    const totalPendente = vencendoHoje.reduce((sum, v) => sum + v.valor, 0);

    return {
      data: today,
      totalRecebido,
      totalPendente,
      totalRecebimentos: recList.length,
      porMetodo,
      recebimentos: recList,
      vencendoHoje,
    };
  } catch (error) {
    console.warn('[getCaixa] Fallback:', error);
    return {
      data: new Date().toISOString().slice(0, 10),
      totalRecebido: 0,
      totalPendente: 0,
      totalRecebimentos: 0,
      porMetodo: [],
      recebimentos: [],
      vencendoHoje: [],
    };
  }
}

export async function registrarRecebimento(data: {
  alunoNome: string;
  tipo: string;
  descricao: string;
  valor: number;
  metodo: string;
}): Promise<{ ok: boolean; id: string }> {
  try {
    if (isMock()) {
      const { mockRegistrarRecebimento } = await import('@/lib/mocks/recepcao-caixa.mock');
      return mockRegistrarRecebimento(data);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: inserted, error } = await supabase
      .from('receipts')
      .insert({
        student_name: data.alunoNome,
        type: data.tipo,
        description: data.descricao,
        amount: data.valor,
        method: data.metodo,
      })
      .select('id')
      .single();

    if (error) {
      console.warn('[registrarRecebimento] error:', error.message);
      return { ok: false, id: '' };
    }

    return { ok: true, id: (inserted as Record<string, unknown>).id as string };
  } catch (error) {
    console.warn('[registrarRecebimento] Fallback:', error);
    return { ok: false, id: '' };
  }
}
