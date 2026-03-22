import { isMock } from '@/lib/env';

// ────────────────────────────────────────────────────────────
// DTOs
// ────────────────────────────────────────────────────────────

export interface Inadimplente {
  id: string;
  nome: string;
  avatar: string;
  valor: number;
  diasAtraso: number;
  telefone: string;
  email: string;
  turma: string;
  faixa: string;
}

export interface Pagamento {
  id: string;
  alunoId: string;
  valor: number;
  forma: 'dinheiro' | 'pix' | 'cartao' | 'boleto';
  data: string;
  registradoPor: string;
}

export interface ResumoCobrancas {
  totalInadimplente: number;
  quantidadeInadimplentes: number;
}

// ────────────────────────────────────────────────────────────
// Service
// ────────────────────────────────────────────────────────────

export async function getInadimplentes(): Promise<{ inadimplentes: Inadimplente[]; resumo: ResumoCobrancas }> {
  const fallback = { inadimplentes: [], resumo: { totalInadimplente: 0, quantidadeInadimplentes: 0 } };
  try {
    if (isMock()) {
      const { mockGetInadimplentes } = await import('@/lib/mocks/recepcao-cobrancas.mock');
      return mockGetInadimplentes();
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from('inadimplentes_view').select('*').order('dias_atraso', { ascending: false });
    if (error || !data) return fallback;
    const inadimplentes = data.map((d: Record<string, unknown>) => ({
      id: d.id as string,
      nome: d.nome as string,
      avatar: (d.avatar as string) || '',
      valor: d.valor as number,
      diasAtraso: d.dias_atraso as number,
      telefone: d.telefone as string,
      email: d.email as string,
      turma: (d.turma as string) || '',
      faixa: (d.faixa as string) || 'branca',
    }));
    const totalInadimplente = inadimplentes.reduce((sum: number, i: Inadimplente) => sum + i.valor, 0);
    return { inadimplentes, resumo: { totalInadimplente, quantidadeInadimplentes: inadimplentes.length } };
  } catch {
    return fallback;
  }
}

export async function registrarPagamento(alunoId: string, valor: number, forma: Pagamento['forma']): Promise<{ success: boolean }> {
  try {
    if (isMock()) {
      const { mockRegistrarPagamento } = await import('@/lib/mocks/recepcao-cobrancas.mock');
      return mockRegistrarPagamento(alunoId, valor, forma);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase.from('pagamentos').insert({ aluno_id: alunoId, valor, forma, created_at: new Date().toISOString() });
    if (error) return { success: false };
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function getHistoricoPagamentos(alunoId: string): Promise<Pagamento[]> {
  try {
    if (isMock()) {
      const { mockGetHistorico } = await import('@/lib/mocks/recepcao-cobrancas.mock');
      return mockGetHistorico(alunoId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from('pagamentos').select('*').eq('aluno_id', alunoId).order('created_at', { ascending: false });
    if (error || !data) return [];
    return data as unknown as Pagamento[];
  } catch {
    return [];
  }
}
