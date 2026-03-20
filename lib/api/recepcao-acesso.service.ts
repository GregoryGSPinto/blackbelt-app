import { isMock } from '@/lib/env';

// ────────────────────────────────────────────────────────────
// DTOs
// ────────────────────────────────────────────────────────────

export interface PessoaDentro {
  id: string;
  nome: string;
  tipo: 'aluno' | 'professor' | 'visitante';
  faixa?: string;
  horaEntrada: string;
  turma?: string;
}

export interface MovimentacaoItem {
  id: string;
  nome: string;
  tipo: 'aluno' | 'professor' | 'visitante';
  direcao: 'entrada' | 'saida';
  horario: string;
}

export interface AcessoAcademia {
  pessoasDentro: PessoaDentro[];
  totalDentro: number;
  capacidadeMaxima: number;
  movimentacao: MovimentacaoItem[];
}

// ────────────────────────────────────────────────────────────
// Service
// ────────────────────────────────────────────────────────────

export async function getAcesso(): Promise<AcessoAcademia> {
  try {
    if (isMock()) {
      const { mockGetAcesso } = await import('@/lib/mocks/recepcao-acesso.mock');
      return mockGetAcesso();
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const today = new Date().toISOString().slice(0, 10);

    // People currently inside (checked in but not out)
    const { data: inside, error: insideError } = await supabase
      .from('checkins')
      .select('id, profile_name, person_type, belt, check_in_at, class_name')
      .gte('check_in_at', `${today}T00:00:00`)
      .is('check_out_at', null);

    if (insideError) {
      console.warn('[getAcesso] error fetching inside:', insideError.message);
    }

    // All movements today
    const { data: movements, error: movError } = await supabase
      .from('checkins')
      .select('id, profile_name, person_type, check_in_at, check_out_at')
      .gte('check_in_at', `${today}T00:00:00`)
      .order('check_in_at', { ascending: false });

    if (movError) {
      console.warn('[getAcesso] error fetching movements:', movError.message);
    }

    const pessoasDentro: PessoaDentro[] = (inside ?? []).map((c: Record<string, unknown>) => ({
      id: c.id as string,
      nome: (c.profile_name as string) ?? '',
      tipo: (c.person_type as PessoaDentro['tipo']) ?? 'aluno',
      faixa: (c.belt as string) ?? undefined,
      horaEntrada: c.check_in_at as string,
      turma: (c.class_name as string) ?? undefined,
    }));

    const movimentacao: MovimentacaoItem[] = [];
    for (const m of (movements ?? []) as Record<string, unknown>[]) {
      movimentacao.push({
        id: `${m.id}-in`,
        nome: (m.profile_name as string) ?? '',
        tipo: (m.person_type as MovimentacaoItem['tipo']) ?? 'aluno',
        direcao: 'entrada',
        horario: m.check_in_at as string,
      });
      if (m.check_out_at) {
        movimentacao.push({
          id: `${m.id}-out`,
          nome: (m.profile_name as string) ?? '',
          tipo: (m.person_type as MovimentacaoItem['tipo']) ?? 'aluno',
          direcao: 'saida',
          horario: m.check_out_at as string,
        });
      }
    }

    return {
      pessoasDentro,
      totalDentro: pessoasDentro.length,
      capacidadeMaxima: 100,
      movimentacao,
    };
  } catch (error) {
    console.warn('[getAcesso] Fallback:', error);
    return { pessoasDentro: [], totalDentro: 0, capacidadeMaxima: 100, movimentacao: [] };
  }
}

export async function registrarEntradaManual(data: {
  nome: string;
  tipo: 'aluno' | 'professor' | 'visitante';
}): Promise<{ ok: boolean }> {
  try {
    if (isMock()) {
      const { mockRegistrarEntrada } = await import('@/lib/mocks/recepcao-acesso.mock');
      return mockRegistrarEntrada(data);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('checkins')
      .insert({
        profile_name: data.nome,
        person_type: data.tipo,
        check_in_at: new Date().toISOString(),
      });

    if (error) {
      console.warn('[registrarEntradaManual] error:', error.message);
      return { ok: false };
    }

    return { ok: true };
  } catch (error) {
    console.warn('[registrarEntradaManual] Fallback:', error);
    return { ok: false };
  }
}

export async function registrarSaida(pessoaId: string): Promise<{ ok: boolean }> {
  try {
    if (isMock()) {
      const { mockRegistrarSaida } = await import('@/lib/mocks/recepcao-acesso.mock');
      return mockRegistrarSaida(pessoaId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('checkins')
      .update({ check_out_at: new Date().toISOString() })
      .eq('id', pessoaId);

    if (error) {
      console.warn('[registrarSaida] error:', error.message);
      return { ok: false };
    }

    return { ok: true };
  } catch (error) {
    console.warn('[registrarSaida] Fallback:', error);
    return { ok: false };
  }
}
