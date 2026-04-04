import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';

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
    const academyId = getActiveAcademyId();

    // Try inadimplentes_view first (may be populated by a cron/trigger)
    const { data: viewData, error: viewError } = await supabase
      .from('inadimplentes_view')
      .select('*')
      .order('dias_atraso', { ascending: false });

    if (!viewError && viewData && viewData.length > 0) {
      const inadimplentes = viewData.map((d: Record<string, unknown>) => ({
        id: d.id as string,
        nome: (d.nome ?? '') as string,
        avatar: (d.avatar as string) || '',
        valor: (d.valor as number) ?? 0,
        diasAtraso: (d.dias_atraso as number) ?? 0,
        telefone: (d.telefone ?? '') as string,
        email: (d.email ?? '') as string,
        turma: (d.turma as string) || '',
        faixa: (d.faixa as string) || 'branca',
      }));
      const totalInadimplente = inadimplentes.reduce((sum: number, i: Inadimplente) => sum + i.valor, 0);
      return { inadimplentes, resumo: { totalInadimplente, quantidadeInadimplentes: inadimplentes.length } };
    }

    // Fallback: query memberships with billing_status = 'atrasado'
    const { data: memberships, error: mbError } = await supabase
      .from('memberships')
      .select('id, monthly_amount, billing_status, profile_id, profiles!memberships_profile_id_fkey(display_name, avatar)')
      .eq('academy_id', academyId)
      .eq('status', 'active')
      .in('billing_status', ['atrasado', 'pendente']);

    if (mbError || !memberships) return fallback;

    const inadimplentes: Inadimplente[] = memberships.map((m: Record<string, unknown>) => {
      const prof = m.profiles as Record<string, unknown> | null;
      const amountCents = (m.monthly_amount as number) ?? 0;
      return {
        id: m.id as string,
        nome: (prof?.display_name ?? '') as string,
        avatar: (prof?.avatar as string) || '',
        valor: Math.round(amountCents / 100), // cents -> reais
        diasAtraso: 0, // exact days not tracked in memberships
        telefone: '',
        email: '',
        turma: '',
        faixa: 'branca',
      };
    });

    const totalInadimplente = inadimplentes.reduce((sum: number, i: Inadimplente) => sum + i.valor, 0);
    return { inadimplentes, resumo: { totalInadimplente, quantidadeInadimplentes: inadimplentes.length } };
  } catch (error) {
    logServiceError(error, 'recepcao-cobrancas');
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

    const { error } = await supabase.from('pagamentos').insert({
      aluno_id: alunoId,
      valor,
      forma,
      created_at: new Date().toISOString(),
    });
    if (error) {
      logServiceError(error, 'recepcao-cobrancas');
      return { success: false };
    }
    return { success: true };
  } catch (error) {
    logServiceError(error, 'recepcao-cobrancas');
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
  } catch (error) {
    logServiceError(error, 'recepcao-cobrancas');
    return [];
  }
}
