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

    // Search students via students → profiles join
    const { data, error } = await supabase
      .from('students')
      .select(`
        id, belt, profile_id,
        profiles!students_profile_id_fkey(display_name, avatar),
        class_enrollments(classes(modalities(name)))
      `)
      .ilike('profiles.display_name', `%${query}%`)
      .limit(10);

    if (error || !data) {
      console.error('[buscarAlunoCheckin] Supabase error:', error?.message);
      return [];
    }

    return data.map((s: Record<string, unknown>) => {
      const profile = s.profiles as Record<string, unknown> | null;
      const enrollments = s.class_enrollments as Array<Record<string, unknown>> | null;
      const firstEnroll = enrollments?.[0];
      const cls = firstEnroll?.classes as Record<string, unknown> | null;
      const mod = cls?.modalities as Record<string, unknown> | null;

      return {
        id: s.id as string,
        nome: (profile?.display_name ?? '') as string,
        avatar: (profile?.avatar ?? '') as string,
        faixa: (s.belt ?? 'white') as string,
        turma: (mod?.name ?? '') as string,
        statusFinanceiro: 'em_dia' as const,
        diasAtraso: 0,
        ultimoTreino: '',
      };
    });
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

    // Get student profile info for denormalized checkin record
    const { data: student } = await supabase
      .from('students')
      .select('profile_id, belt, academy_id, profiles!students_profile_id_fkey(display_name)')
      .eq('id', alunoId)
      .single();

    const profile = student?.profiles as Record<string, unknown> | null;

    const { error } = await supabase.from('checkins').insert({
      academy_id: (student?.academy_id as string) ?? null,
      profile_id: (student?.profile_id as string) ?? null,
      profile_name: (profile?.display_name ?? '') as string,
      person_type: 'aluno',
      belt: (student?.belt ?? 'white') as string,
      check_in_at: new Date().toISOString(),
    });

    if (error) {
      console.error('[registrarEntrada] Supabase error:', error.message);
      return { success: false, message: error.message };
    }
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

    // Find latest open check-in for this student's profile and mark check_out_at
    const { data: student } = await supabase
      .from('students')
      .select('profile_id')
      .eq('id', alunoId)
      .single();

    if (!student) return { success: false };

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data: openCheckin } = await supabase
      .from('checkins')
      .select('id')
      .eq('profile_id', student.profile_id)
      .gte('check_in_at', todayStart.toISOString())
      .is('check_out_at', null)
      .order('check_in_at', { ascending: false })
      .limit(1)
      .single();

    if (!openCheckin) return { success: false };

    const { error } = await supabase
      .from('checkins')
      .update({ check_out_at: new Date().toISOString() })
      .eq('id', openCheckin.id);

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

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Get today's check-ins that have no check-out
    const { data, error } = await supabase
      .from('checkins')
      .select('id, profile_name, belt, class_name, person_type, check_in_at')
      .gte('check_in_at', todayStart.toISOString())
      .is('check_out_at', null)
      .order('check_in_at', { ascending: false });

    if (error || !data) return fallback;

    const pessoas: PessoaDentro[] = data.map((d: Record<string, unknown>) => ({
      id: d.id as string,
      nome: (d.profile_name ?? '') as string,
      avatar: '',
      faixa: (d.belt ?? 'white') as string,
      horaEntrada: new Date(d.check_in_at as string).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      turma: (d.class_name ?? '') as string,
      tipo: (d.person_type ?? 'aluno') as PessoaDentro['tipo'],
    }));

    return {
      pessoas,
      capacidade: {
        totalDentro: pessoas.length,
        capacidadeMax: 80,
        percentual: (pessoas.length / 80) * 100,
      },
    };
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

    const { error } = await supabase.from('visitantes').insert({
      nome,
      motivo,
      check_in_at: new Date().toISOString(),
    });

    if (error) {
      console.error('[registrarVisitante] Supabase error:', error.message);
      return { success: false };
    }
    return { success: true };
  } catch {
    return { success: false };
  }
}
