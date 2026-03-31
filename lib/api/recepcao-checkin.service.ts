import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';

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
    const academyId = getActiveAcademyId();

    // Search students via students -> profiles join, include memberships for billing status
    const { data, error } = await supabase
      .from('students')
      .select(`
        id, belt, profile_id, academy_id,
        profiles!inner(display_name, avatar),
        class_enrollments(classes(modalities(name)))
      `)
      .eq('academy_id', academyId)
      .ilike('profiles.display_name', `%${query}%`)
      .limit(10);

    if (error || !data) {
      logServiceError(error, 'recepcao-checkin');
      return [];
    }

    // Fetch billing status for matched profiles from memberships
    const profileIds = data
      .map((s: Record<string, unknown>) => s.profile_id as string)
      .filter(Boolean);

    const billingMap: Record<string, string> = {};
    if (profileIds.length > 0) {
      const { data: memberships } = await supabase
        .from('memberships')
        .select('profile_id, billing_status')
        .eq('academy_id', academyId)
        .eq('status', 'active')
        .in('profile_id', profileIds);

      if (memberships) {
        for (const m of memberships) {
          const rec = m as Record<string, unknown>;
          billingMap[rec.profile_id as string] = (rec.billing_status as string) ?? 'em_dia';
        }
      }
    }

    return data
      .map((s: Record<string, unknown>) => {
        const profile = s.profiles as Record<string, unknown> | null;
        const displayName = (profile?.display_name ?? '') as string;
        // Filter out rows where the profile join didn't match (ilike on inner join)
        if (!displayName) return null;

        const enrollments = s.class_enrollments as Array<Record<string, unknown>> | null;
        const firstEnroll = enrollments?.[0];
        const cls = firstEnroll?.classes as Record<string, unknown> | null;
        const mod = cls?.modalities as Record<string, unknown> | null;

        const profileId = s.profile_id as string;
        const billing = billingMap[profileId] ?? 'em_dia';

        let statusFinanceiro: AlunoCheckin['statusFinanceiro'] = 'em_dia';
        if (billing === 'atrasado') statusFinanceiro = 'atrasado';
        else if (billing === 'cancelado' || billing === 'pendente') statusFinanceiro = 'inadimplente';

        return {
          id: s.id as string,
          nome: displayName,
          avatar: (profile?.avatar ?? '') as string,
          faixa: (s.belt ?? 'white') as string,
          turma: (mod?.name ?? '') as string,
          statusFinanceiro,
          diasAtraso: statusFinanceiro !== 'em_dia' ? 1 : 0, // approximate - exact days not tracked in memberships
          ultimoTreino: '',
        };
      })
      .filter((item: AlunoCheckin | null): item is AlunoCheckin => item !== null);
  } catch (error) {
    logServiceError(error, 'recepcao-checkin');
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
      logServiceError(error, 'recepcao-checkin');
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Entrada registrada!' };
  } catch (error) {
    logServiceError(error, 'recepcao-checkin');
    return { success: false, message: 'Erro ao registrar entrada' };
  }
}

export async function registrarSaida(checkinId: string): Promise<{ success: boolean }> {
  try {
    if (isMock()) {
      const { mockRegistrarSaida } = await import('@/lib/mocks/recepcao-checkin.mock');
      return mockRegistrarSaida(checkinId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // getDentroAgora returns checkin.id as pessoa.id, so update directly
    const { error } = await supabase
      .from('checkins')
      .update({ check_out_at: new Date().toISOString() })
      .eq('id', checkinId);

    if (error) {
      logServiceError(error, 'recepcao-checkin');
      return { success: false };
    }
    return { success: true };
  } catch (error) {
    logServiceError(error, 'recepcao-checkin');
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
  } catch (error) {
    logServiceError(error, 'recepcao-checkin');
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
    const academyId = getActiveAcademyId();

    const { error } = await supabase.from('visitantes').insert({
      academy_id: academyId || null,
      nome,
      motivo,
      check_in_at: new Date().toISOString(),
    });

    if (error) {
      logServiceError(error, 'recepcao-checkin');
      return { success: false };
    }
    return { success: true };
  } catch (error) {
    logServiceError(error, 'recepcao-checkin');
    return { success: false };
  }
}
