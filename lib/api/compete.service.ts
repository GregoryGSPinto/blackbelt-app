// ============================================================
// BlackBelt v2 — Compete Service
// Torneios, chaves, inscrições, resultados, rankings, predições
// 40+ funções · isMock() pattern · console.warn fallback
// ============================================================

import { isMock } from '@/lib/env';
import type { BeltLevel } from '@/lib/types/domain';
import type {
  Tournament,
  TournamentCircuit,
  TournamentCategory,
  TournamentRegistration,
  TournamentBracket,
  TournamentMatch,
  AthleteProfile,
  AcademyTournamentStats,
  TournamentPrediction,
  TournamentFeedItem,
  TournamentFilters,
  CategoryFilters,
  RegistrationFilters,
  MatchResult,
  MedalTable,
  TournamentStats,
  SocialCardType,
} from '@/lib/types/compete';

// Re-export all types so pages can import from service
export type {
  Tournament,
  TournamentCircuit,
  TournamentCategory,
  TournamentRegistration,
  TournamentBracket,
  TournamentMatch,
  AthleteProfile,
  AcademyTournamentStats,
  TournamentPrediction,
  TournamentFeedItem,
  TournamentFilters,
  CategoryFilters,
  RegistrationFilters,
  MatchResult,
  MatchMethod,
  MedalTable,
  TournamentStats,
  TournamentStatus,
  SocialCardType,
} from '@/lib/types/compete';

// ────────────────────────────────────────────────────────────
// TOURNAMENTS
// ────────────────────────────────────────────────────────────

export async function getTournaments(filters?: TournamentFilters): Promise<Tournament[]> {
  try {
    if (isMock()) {
      const { mockGetTournaments } = await import('@/lib/mocks/compete.mock');
      return mockGetTournaments(filters);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    let query = supabase.from('tournaments').select('*');

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.modality) query = query.contains('modalities', [filters.modality]);
    if (filters?.city) query = query.eq('city', filters.city);
    if (filters?.state) query = query.eq('state', filters.state);
    if (filters?.circuit_id) query = query.eq('circuit_id', filters.circuit_id);
    if (filters?.start_date_from) query = query.gte('start_date', filters.start_date_from);
    if (filters?.start_date_to) query = query.lte('start_date', filters.start_date_to);
    if (filters?.search) query = query.ilike('name', `%${filters.search}%`);
    if (filters?.limit) query = query.limit(filters.limit);

    const { data, error } = await query.order('start_date', { ascending: false });
    if (error) {
      console.warn('[getTournaments] error:', error.message);
      return [];
    }

    return (data ?? []) as Tournament[];
  } catch (error) {
    console.warn('[getTournaments] Fallback:', error);
    return [];
  }
}

export async function getTournament(slug: string): Promise<Tournament> {
  try {
    if (isMock()) {
      const { mockGetTournament } = await import('@/lib/mocks/compete.mock');
      return mockGetTournament(slug);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error) {
      console.warn('[getTournament] error:', error.message);
      return {} as Tournament;
    }

    return data as Tournament;
  } catch (error) {
    console.warn('[getTournament] Fallback:', error);
    return {} as Tournament;
  }
}

export async function createTournament(
  data: Omit<Tournament, 'id' | 'created_at' | 'updated_at' | 'status' | 'approved_at' | 'approved_by' | 'rejection_reason'>,
): Promise<Tournament> {
  try {
    if (isMock()) {
      const { mockCreateTournament } = await import('@/lib/mocks/compete.mock');
      return mockCreateTournament(data);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: created, error } = await supabase
      .from('tournaments')
      .insert({ ...data, status: 'aguardando_aprovacao' })
      .select()
      .single();
    if (error) {
      console.warn('[createTournament] error:', error.message);
      return {} as Tournament;
    }

    return created as Tournament;
  } catch (error) {
    console.warn('[createTournament] Fallback:', error);
    return {} as Tournament;
  }
}

export async function updateTournament(
  id: string,
  data: Partial<Omit<Tournament, 'id' | 'created_at' | 'updated_at'>>,
): Promise<Tournament> {
  try {
    if (isMock()) {
      const { mockUpdateTournament } = await import('@/lib/mocks/compete.mock');
      return mockUpdateTournament(id, data);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: updated, error } = await supabase
      .from('tournaments')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.warn('[updateTournament] error:', error.message);
      return {} as Tournament;
    }

    return updated as Tournament;
  } catch (error) {
    console.warn('[updateTournament] Fallback:', error);
    return {} as Tournament;
  }
}

export async function approveTournament(id: string): Promise<Tournament> {
  try {
    if (isMock()) {
      const { mockApproveTournament } = await import('@/lib/mocks/compete.mock');
      return mockApproveTournament(id);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: user } = await supabase.auth.getUser();
    const { data: updated, error } = await supabase
      .from('tournaments')
      .update({
        status: 'published',
        approved_at: new Date().toISOString(),
        approved_by: user.user?.id ?? null,
        rejection_reason: null,
      })
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.warn('[approveTournament] error:', error.message);
      return {} as Tournament;
    }

    return updated as Tournament;
  } catch (error) {
    console.warn('[approveTournament] Fallback:', error);
    return {} as Tournament;
  }
}

export async function rejectTournament(id: string, reason: string): Promise<Tournament> {
  try {
    if (isMock()) {
      const { mockRejectTournament } = await import('@/lib/mocks/compete.mock');
      return mockRejectTournament(id, reason);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: updated, error } = await supabase
      .from('tournaments')
      .update({
        status: 'cancelled',
        rejection_reason: reason,
      })
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.warn('[rejectTournament] error:', error.message);
      return {} as Tournament;
    }

    return updated as Tournament;
  } catch (error) {
    console.warn('[rejectTournament] Fallback:', error);
    return {} as Tournament;
  }
}

export async function getPendingTournaments(): Promise<Tournament[]> {
  try {
    if (isMock()) {
      const { mockGetPendingTournaments } = await import('@/lib/mocks/compete.mock');
      return mockGetPendingTournaments();
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('status', 'aguardando_aprovacao')
      .order('created_at', { ascending: true });
    if (error) {
      console.warn('[getPendingTournaments] error:', error.message);
      return [];
    }

    return (data ?? []) as Tournament[];
  } catch (error) {
    console.warn('[getPendingTournaments] Fallback:', error);
    return [];
  }
}

export async function publishTournament(id: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockPublishTournament } = await import('@/lib/mocks/compete.mock');
      return mockPublishTournament(id);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('tournaments')
      .update({ status: 'published' })
      .eq('id', id);
    if (error) {
      console.warn('[publishTournament] error:', error.message);
      return;
    }
  } catch (error) {
    console.warn('[publishTournament] Fallback:', error);
  }
}

export async function openRegistration(id: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockOpenRegistration } = await import('@/lib/mocks/compete.mock');
      return mockOpenRegistration(id);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('tournaments')
      .update({ status: 'registration_open' })
      .eq('id', id);
    if (error) {
      console.warn('[openRegistration] error:', error.message);
      return;
    }
  } catch (error) {
    console.warn('[openRegistration] Fallback:', error);
  }
}

export async function closeRegistration(id: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockCloseRegistration } = await import('@/lib/mocks/compete.mock');
      return mockCloseRegistration(id);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('tournaments')
      .update({ status: 'registration_closed' })
      .eq('id', id);
    if (error) {
      console.warn('[closeRegistration] error:', error.message);
      return;
    }
  } catch (error) {
    console.warn('[closeRegistration] Fallback:', error);
  }
}

export async function startTournament(id: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockStartTournament } = await import('@/lib/mocks/compete.mock');
      return mockStartTournament(id);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('tournaments')
      .update({ status: 'live' })
      .eq('id', id);
    if (error) {
      console.warn('[startTournament] error:', error.message);
      return;
    }
  } catch (error) {
    console.warn('[startTournament] Fallback:', error);
  }
}

export async function completeTournament(id: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockCompleteTournament } = await import('@/lib/mocks/compete.mock');
      return mockCompleteTournament(id);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('tournaments')
      .update({ status: 'completed' })
      .eq('id', id);
    if (error) {
      console.warn('[completeTournament] error:', error.message);
      return;
    }
  } catch (error) {
    console.warn('[completeTournament] Fallback:', error);
  }
}

export async function getTournamentStats(id: string): Promise<TournamentStats> {
  try {
    if (isMock()) {
      const { mockGetTournamentStats } = await import('@/lib/mocks/compete.mock');
      return mockGetTournamentStats(id);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .rpc('get_tournament_stats', { p_tournament_id: id });
    if (error) {
      console.warn('[getTournamentStats] error:', error.message);
      return {} as TournamentStats;
    }

    return data as TournamentStats;
  } catch (error) {
    console.warn('[getTournamentStats] Fallback:', error);
    return {} as TournamentStats;
  }
}

// ────────────────────────────────────────────────────────────
// CIRCUITS
// ────────────────────────────────────────────────────────────

export async function getCircuits(): Promise<TournamentCircuit[]> {
  try {
    if (isMock()) {
      const { mockGetCircuits } = await import('@/lib/mocks/compete.mock');
      return mockGetCircuits();
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('tournament_circuits')
      .select('*')
      .order('season', { ascending: false });
    if (error) {
      console.warn('[getCircuits] error:', error.message);
      return [];
    }

    return (data ?? []) as TournamentCircuit[];
  } catch (error) {
    console.warn('[getCircuits] Fallback:', error);
    return [];
  }
}

export async function getCircuit(slug: string): Promise<TournamentCircuit> {
  try {
    if (isMock()) {
      const { mockGetCircuit } = await import('@/lib/mocks/compete.mock');
      return mockGetCircuit(slug);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('tournament_circuits')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error) {
      console.warn('[getCircuit] error:', error.message);
      return {} as TournamentCircuit;
    }

    return data as TournamentCircuit;
  } catch (error) {
    console.warn('[getCircuit] Fallback:', error);
    return {} as TournamentCircuit;
  }
}

export async function getCircuitRanking(circuitId: string): Promise<AcademyTournamentStats[]> {
  try {
    if (isMock()) {
      const { mockGetCircuitRanking } = await import('@/lib/mocks/compete.mock');
      return mockGetCircuitRanking(circuitId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('academy_tournament_stats')
      .select('*')
      .eq('circuit_id', circuitId)
      .order('total_points', { ascending: false });
    if (error) {
      console.warn('[getCircuitRanking] error:', error.message);
      return [];
    }

    return (data ?? []) as AcademyTournamentStats[];
  } catch (error) {
    console.warn('[getCircuitRanking] Fallback:', error);
    return [];
  }
}

// ────────────────────────────────────────────────────────────
// CATEGORIES
// ────────────────────────────────────────────────────────────

export async function getCategories(
  tournamentId: string,
  filters?: CategoryFilters,
): Promise<TournamentCategory[]> {
  try {
    if (isMock()) {
      const { mockGetCategories } = await import('@/lib/mocks/compete.mock');
      return mockGetCategories(tournamentId, filters);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    let query = supabase
      .from('tournament_categories')
      .select('*')
      .eq('tournament_id', tournamentId);

    if (filters?.modality) query = query.eq('modality', filters.modality);
    if (filters?.gender) query = query.eq('gender', filters.gender);
    if (filters?.search) query = query.ilike('name', `%${filters.search}%`);

    const { data, error } = await query.order('name');
    if (error) {
      console.warn('[getCategories] error:', error.message);
      return [];
    }

    return (data ?? []) as TournamentCategory[];
  } catch (error) {
    console.warn('[getCategories] Fallback:', error);
    return [];
  }
}

export async function createCategory(
  tournamentId: string,
  data: Omit<TournamentCategory, 'id' | 'tournament_id' | 'created_at' | 'updated_at' | 'registered_count'>,
): Promise<TournamentCategory> {
  try {
    if (isMock()) {
      const { mockCreateCategory } = await import('@/lib/mocks/compete.mock');
      return mockCreateCategory(tournamentId, data);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: created, error } = await supabase
      .from('tournament_categories')
      .insert({ ...data, tournament_id: tournamentId, registered_count: 0 })
      .select()
      .single();
    if (error) {
      console.warn('[createCategory] error:', error.message);
      return {} as TournamentCategory;
    }

    return created as TournamentCategory;
  } catch (error) {
    console.warn('[createCategory] Fallback:', error);
    return {} as TournamentCategory;
  }
}

export async function generateStandardCategories(
  tournamentId: string,
  modality: string,
  config: { gender: ('male' | 'female' | 'mixed')[]; includeAbsolute: boolean },
): Promise<TournamentCategory[]> {
  try {
    if (isMock()) {
      const { mockGenerateStandardCategories } = await import('@/lib/mocks/compete.mock');
      return mockGenerateStandardCategories(tournamentId, modality, config);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .rpc('generate_standard_categories', {
        p_tournament_id: tournamentId,
        p_modality: modality,
        p_config: config,
      });
    if (error) {
      console.warn('[generateStandardCategories] error:', error.message);
      return [];
    }

    return (data ?? []) as TournamentCategory[];
  } catch (error) {
    console.warn('[generateStandardCategories] Fallback:', error);
    return [];
  }
}

export async function suggestCategory(
  birthDate: string,
  weight: number,
  gender: 'male' | 'female',
  belt: BeltLevel,
): Promise<TournamentCategory> {
  try {
    if (isMock()) {
      const { mockSuggestCategory } = await import('@/lib/mocks/compete.mock');
      return mockSuggestCategory(birthDate, weight, gender, belt);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .rpc('suggest_category', {
        p_birth_date: birthDate,
        p_weight: weight,
        p_gender: gender,
        p_belt: belt,
      });
    if (error) {
      console.warn('[suggestCategory] error:', error.message);
      return {} as TournamentCategory;
    }

    return data as TournamentCategory;
  } catch (error) {
    console.warn('[suggestCategory] Fallback:', error);
    return {} as TournamentCategory;
  }
}

// ────────────────────────────────────────────────────────────
// REGISTRATIONS
// ────────────────────────────────────────────────────────────

export async function registerAthlete(
  tournamentId: string,
  categoryId: string,
  data: {
    athlete_profile_id: string;
    academy_id: string;
    athlete_name: string;
    academy_name: string;
    weight?: number;
  },
): Promise<TournamentRegistration> {
  try {
    if (isMock()) {
      const { mockRegisterAthlete } = await import('@/lib/mocks/compete.mock');
      return mockRegisterAthlete(tournamentId, categoryId, data);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: created, error } = await supabase
      .from('tournament_registrations')
      .insert({
        tournament_id: tournamentId,
        category_id: categoryId,
        ...data,
        status: 'pending',
        payment_status: 'pending',
      })
      .select()
      .single();
    if (error) {
      console.warn('[registerAthlete] error:', error.message);
      return {} as TournamentRegistration;
    }

    return created as TournamentRegistration;
  } catch (error) {
    console.warn('[registerAthlete] Fallback:', error);
    return {} as TournamentRegistration;
  }
}

export async function registerBatch(
  tournamentId: string,
  academyId: string,
  athletes: {
    category_id: string;
    athlete_profile_id: string;
    athlete_name: string;
    weight?: number;
  }[],
): Promise<TournamentRegistration[]> {
  try {
    if (isMock()) {
      const { mockRegisterBatch } = await import('@/lib/mocks/compete.mock');
      return mockRegisterBatch(tournamentId, academyId, athletes);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const rows = athletes.map((a) => ({
      tournament_id: tournamentId,
      academy_id: academyId,
      category_id: a.category_id,
      athlete_profile_id: a.athlete_profile_id,
      athlete_name: a.athlete_name,
      weight: a.weight ?? null,
      status: 'pending' as const,
      payment_status: 'pending' as const,
    }));

    const { data, error } = await supabase
      .from('tournament_registrations')
      .insert(rows)
      .select();
    if (error) {
      console.warn('[registerBatch] error:', error.message);
      return [];
    }

    return (data ?? []) as TournamentRegistration[];
  } catch (error) {
    console.warn('[registerBatch] Fallback:', error);
    return [];
  }
}

export async function getRegistrations(
  tournamentId: string,
  filters?: RegistrationFilters,
): Promise<TournamentRegistration[]> {
  try {
    if (isMock()) {
      const { mockGetRegistrations } = await import('@/lib/mocks/compete.mock');
      return mockGetRegistrations(tournamentId, filters);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    let query = supabase
      .from('tournament_registrations')
      .select('*')
      .eq('tournament_id', tournamentId);

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.payment_status) query = query.eq('payment_status', filters.payment_status);
    if (filters?.category_id) query = query.eq('category_id', filters.category_id);
    if (filters?.academy_id) query = query.eq('academy_id', filters.academy_id);
    if (filters?.search) query = query.ilike('athlete_name', `%${filters.search}%`);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) {
      console.warn('[getRegistrations] error:', error.message);
      return [];
    }

    return (data ?? []) as TournamentRegistration[];
  } catch (error) {
    console.warn('[getRegistrations] Fallback:', error);
    return [];
  }
}

export async function getRegistrationsByAcademy(
  tournamentId: string,
  academyId: string,
): Promise<TournamentRegistration[]> {
  try {
    if (isMock()) {
      const { mockGetRegistrationsByAcademy } = await import('@/lib/mocks/compete.mock');
      return mockGetRegistrationsByAcademy(tournamentId, academyId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('tournament_registrations')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('academy_id', academyId)
      .order('athlete_name');
    if (error) {
      console.warn('[getRegistrationsByAcademy] error:', error.message);
      return [];
    }

    return (data ?? []) as TournamentRegistration[];
  } catch (error) {
    console.warn('[getRegistrationsByAcademy] Fallback:', error);
    return [];
  }
}

export async function getMyRegistrations(userId: string): Promise<TournamentRegistration[]> {
  try {
    if (isMock()) {
      const { mockGetMyRegistrations } = await import('@/lib/mocks/compete.mock');
      return mockGetMyRegistrations(userId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // First get athlete profile for this user
    const { data: profile } = await supabase
      .from('athlete_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!profile) return [];

    const { data, error } = await supabase
      .from('tournament_registrations')
      .select('*')
      .eq('athlete_profile_id', profile.id)
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('[getMyRegistrations] error:', error.message);
      return [];
    }

    return (data ?? []) as TournamentRegistration[];
  } catch (error) {
    console.warn('[getMyRegistrations] Fallback:', error);
    return [];
  }
}

export async function confirmPayment(
  registrationId: string,
  paymentData: { method: string; reference: string; amount: number },
): Promise<void> {
  try {
    if (isMock()) {
      const { mockConfirmPayment } = await import('@/lib/mocks/compete.mock');
      return mockConfirmPayment(registrationId, paymentData);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('tournament_registrations')
      .update({
        payment_status: 'paid',
        payment_method: paymentData.method,
        payment_reference: paymentData.reference,
        payment_amount: paymentData.amount,
        status: 'confirmed',
      })
      .eq('id', registrationId);
    if (error) {
      console.warn('[confirmPayment] error:', error.message);
      return;
    }
  } catch (error) {
    console.warn('[confirmPayment] Fallback:', error);
  }
}

export async function cancelRegistration(registrationId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockCancelRegistration } = await import('@/lib/mocks/compete.mock');
      return mockCancelRegistration(registrationId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('tournament_registrations')
      .update({ status: 'cancelled' })
      .eq('id', registrationId);
    if (error) {
      console.warn('[cancelRegistration] error:', error.message);
      return;
    }
  } catch (error) {
    console.warn('[cancelRegistration] Fallback:', error);
  }
}

export async function checkInAthlete(registrationId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockCheckInAthlete } = await import('@/lib/mocks/compete.mock');
      return mockCheckInAthlete(registrationId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('tournament_registrations')
      .update({
        status: 'checked_in',
        checked_in_at: new Date().toISOString(),
      })
      .eq('id', registrationId);
    if (error) {
      console.warn('[checkInAthlete] error:', error.message);
      return;
    }
  } catch (error) {
    console.warn('[checkInAthlete] Fallback:', error);
  }
}

export async function weighInAthlete(
  registrationId: string,
  weight: number,
): Promise<{ passed: boolean; category: TournamentCategory }> {
  try {
    if (isMock()) {
      const { mockWeighInAthlete } = await import('@/lib/mocks/compete.mock');
      return mockWeighInAthlete(registrationId, weight);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .rpc('weigh_in_athlete', {
        p_registration_id: registrationId,
        p_weight: weight,
      });
    if (error) {
      console.warn('[weighInAthlete] error:', error.message);
      return { passed: false, category: {} as TournamentCategory };
    }

    return data as { passed: boolean; category: TournamentCategory };
  } catch (error) {
    console.warn('[weighInAthlete] Fallback:', error);
    return { passed: false, category: {} as TournamentCategory };
  }
}

// ────────────────────────────────────────────────────────────
// BRACKETS
// ────────────────────────────────────────────────────────────

export async function generateBracket(categoryId: string): Promise<TournamentBracket> {
  try {
    if (isMock()) {
      const { mockGenerateBracket } = await import('@/lib/mocks/compete.mock');
      return mockGenerateBracket(categoryId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .rpc('generate_bracket', { p_category_id: categoryId });
    if (error) {
      console.warn('[generateBracket] error:', error.message);
      return {} as TournamentBracket;
    }

    return data as TournamentBracket;
  } catch (error) {
    console.warn('[generateBracket] Fallback:', error);
    return {} as TournamentBracket;
  }
}

export async function getBracket(
  categoryId: string,
): Promise<{ bracket: TournamentBracket; matches: TournamentMatch[] }> {
  try {
    if (isMock()) {
      const { mockGetBracket } = await import('@/lib/mocks/compete.mock');
      return mockGetBracket(categoryId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: bracket, error: bracketError } = await supabase
      .from('tournament_brackets')
      .select('*')
      .eq('category_id', categoryId)
      .single();
    if (bracketError) {
      console.warn('[getBracket] error:', bracketError.message);
      return { bracket: {} as TournamentBracket, matches: [] };
    }

    const { data: matches, error: matchesError } = await supabase
      .from('tournament_matches')
      .select('*')
      .eq('bracket_id', bracket.id)
      .order('round')
      .order('match_number');
    if (matchesError) {
      console.warn('[getBracket] matches error:', matchesError.message);
      return { bracket: bracket as TournamentBracket, matches: [] };
    }

    return {
      bracket: bracket as TournamentBracket,
      matches: (matches ?? []) as TournamentMatch[],
    };
  } catch (error) {
    console.warn('[getBracket] Fallback:', error);
    return { bracket: {} as TournamentBracket, matches: [] };
  }
}

export async function getAllBrackets(tournamentId: string): Promise<TournamentBracket[]> {
  try {
    if (isMock()) {
      const { mockGetAllBrackets } = await import('@/lib/mocks/compete.mock');
      return mockGetAllBrackets(tournamentId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('tournament_brackets')
      .select('*')
      .eq('tournament_id', tournamentId);
    if (error) {
      console.warn('[getAllBrackets] error:', error.message);
      return [];
    }

    return (data ?? []) as TournamentBracket[];
  } catch (error) {
    console.warn('[getAllBrackets] Fallback:', error);
    return [];
  }
}

// ────────────────────────────────────────────────────────────
// MATCHES
// ────────────────────────────────────────────────────────────

export async function getMatchesByArea(
  tournamentId: string,
  area: number,
): Promise<TournamentMatch[]> {
  try {
    if (isMock()) {
      const { mockGetMatchesByArea } = await import('@/lib/mocks/compete.mock');
      return mockGetMatchesByArea(tournamentId, area);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('tournament_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('area', area)
      .order('scheduled_time');
    if (error) {
      console.warn('[getMatchesByArea] error:', error.message);
      return [];
    }

    return (data ?? []) as TournamentMatch[];
  } catch (error) {
    console.warn('[getMatchesByArea] Fallback:', error);
    return [];
  }
}

export async function getNextMatches(tournamentId: string): Promise<TournamentMatch[]> {
  try {
    if (isMock()) {
      const { mockGetNextMatches } = await import('@/lib/mocks/compete.mock');
      return mockGetNextMatches(tournamentId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('tournament_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .in('status', ['pending', 'called'])
      .order('scheduled_time')
      .limit(20);
    if (error) {
      console.warn('[getNextMatches] error:', error.message);
      return [];
    }

    return (data ?? []) as TournamentMatch[];
  } catch (error) {
    console.warn('[getNextMatches] Fallback:', error);
    return [];
  }
}

export async function callMatch(matchId: string, area: number): Promise<void> {
  try {
    if (isMock()) {
      const { mockCallMatch } = await import('@/lib/mocks/compete.mock');
      return mockCallMatch(matchId, area);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('tournament_matches')
      .update({ status: 'called', area })
      .eq('id', matchId);
    if (error) {
      console.warn('[callMatch] error:', error.message);
      return;
    }
  } catch (error) {
    console.warn('[callMatch] Fallback:', error);
  }
}

export async function startMatch(matchId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockStartMatch } = await import('@/lib/mocks/compete.mock');
      return mockStartMatch(matchId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('tournament_matches')
      .update({
        status: 'in_progress',
        started_at: new Date().toISOString(),
      })
      .eq('id', matchId);
    if (error) {
      console.warn('[startMatch] error:', error.message);
      return;
    }
  } catch (error) {
    console.warn('[startMatch] Fallback:', error);
  }
}

export async function recordResult(matchId: string, result: MatchResult): Promise<void> {
  try {
    if (isMock()) {
      const { mockRecordResult } = await import('@/lib/mocks/compete.mock');
      return mockRecordResult(matchId, result);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('tournament_matches')
      .update({
        winner_id: result.winner_id,
        method: result.method,
        score_athlete1: result.score_athlete1,
        score_athlete2: result.score_athlete2,
        penalties_athlete1: result.penalties_athlete1,
        penalties_athlete2: result.penalties_athlete2,
        advantages_athlete1: result.advantages_athlete1,
        advantages_athlete2: result.advantages_athlete2,
        duration_seconds: result.duration_seconds,
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', matchId);
    if (error) {
      console.warn('[recordResult] error:', error.message);
      return;
    }
  } catch (error) {
    console.warn('[recordResult] Fallback:', error);
  }
}

export async function getLiveMatches(tournamentId: string): Promise<TournamentMatch[]> {
  try {
    if (isMock()) {
      const { mockGetLiveMatches } = await import('@/lib/mocks/compete.mock');
      return mockGetLiveMatches(tournamentId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('tournament_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('status', 'in_progress')
      .order('area');
    if (error) {
      console.warn('[getLiveMatches] error:', error.message);
      return [];
    }

    return (data ?? []) as TournamentMatch[];
  } catch (error) {
    console.warn('[getLiveMatches] Fallback:', error);
    return [];
  }
}

export async function getCompletedMatches(tournamentId: string): Promise<TournamentMatch[]> {
  try {
    if (isMock()) {
      const { mockGetCompletedMatches } = await import('@/lib/mocks/compete.mock');
      return mockGetCompletedMatches(tournamentId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('tournament_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false });
    if (error) {
      console.warn('[getCompletedMatches] error:', error.message);
      return [];
    }

    return (data ?? []) as TournamentMatch[];
  } catch (error) {
    console.warn('[getCompletedMatches] Fallback:', error);
    return [];
  }
}

// ────────────────────────────────────────────────────────────
// FEED
// ────────────────────────────────────────────────────────────

export async function getFeed(
  tournamentId: string,
  limit?: number,
): Promise<TournamentFeedItem[]> {
  try {
    if (isMock()) {
      const { mockGetFeed } = await import('@/lib/mocks/compete.mock');
      return mockGetFeed(tournamentId, limit);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    let query = supabase
      .from('tournament_feed')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('created_at', { ascending: false });

    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error) {
      console.warn('[getFeed] error:', error.message);
      return [];
    }

    return (data ?? []) as TournamentFeedItem[];
  } catch (error) {
    console.warn('[getFeed] Fallback:', error);
    return [];
  }
}

export async function postAnnouncement(
  tournamentId: string,
  text: string,
): Promise<TournamentFeedItem> {
  try {
    if (isMock()) {
      const { mockPostAnnouncement } = await import('@/lib/mocks/compete.mock');
      return mockPostAnnouncement(tournamentId, text);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('tournament_feed')
      .insert({
        tournament_id: tournamentId,
        type: 'announcement',
        title: 'Anúncio',
        content: text,
      })
      .select()
      .single();
    if (error) {
      console.warn('[postAnnouncement] error:', error.message);
      return {} as TournamentFeedItem;
    }

    return data as TournamentFeedItem;
  } catch (error) {
    console.warn('[postAnnouncement] Fallback:', error);
    return {} as TournamentFeedItem;
  }
}

export async function postPhoto(
  tournamentId: string,
  photoUrl: string,
  caption: string,
): Promise<TournamentFeedItem> {
  try {
    if (isMock()) {
      const { mockPostPhoto } = await import('@/lib/mocks/compete.mock');
      return mockPostPhoto(tournamentId, photoUrl, caption);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('tournament_feed')
      .insert({
        tournament_id: tournamentId,
        type: 'photo',
        title: caption,
        content: caption,
        image_url: photoUrl,
      })
      .select()
      .single();
    if (error) {
      console.warn('[postPhoto] error:', error.message);
      return {} as TournamentFeedItem;
    }

    return data as TournamentFeedItem;
  } catch (error) {
    console.warn('[postPhoto] Fallback:', error);
    return {} as TournamentFeedItem;
  }
}

// ────────────────────────────────────────────────────────────
// RESULTS
// ────────────────────────────────────────────────────────────

export async function getResults(
  tournamentId: string,
): Promise<{ categories: { category: TournamentCategory; podium: TournamentRegistration[] }[] }> {
  try {
    if (isMock()) {
      const { mockGetResults } = await import('@/lib/mocks/compete.mock');
      return mockGetResults(tournamentId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .rpc('get_tournament_results', { p_tournament_id: tournamentId });
    if (error) {
      console.warn('[getResults] error:', error.message);
      return { categories: [] };
    }

    return data as { categories: { category: TournamentCategory; podium: TournamentRegistration[] }[] };
  } catch (error) {
    console.warn('[getResults] Fallback:', error);
    return { categories: [] };
  }
}

export async function getResultsByAcademy(
  tournamentId: string,
): Promise<{ academies: { academy_id: string; academy_name: string; athletes: TournamentRegistration[] }[] }> {
  try {
    if (isMock()) {
      const { mockGetResultsByAcademy } = await import('@/lib/mocks/compete.mock');
      return mockGetResultsByAcademy(tournamentId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .rpc('get_tournament_results_by_academy', { p_tournament_id: tournamentId });
    if (error) {
      console.warn('[getResultsByAcademy] error:', error.message);
      return { academies: [] };
    }

    return data as { academies: { academy_id: string; academy_name: string; athletes: TournamentRegistration[] }[] };
  } catch (error) {
    console.warn('[getResultsByAcademy] Fallback:', error);
    return { academies: [] };
  }
}

export async function getMedalTable(tournamentId: string): Promise<MedalTable[]> {
  try {
    if (isMock()) {
      const { mockGetMedalTable } = await import('@/lib/mocks/compete.mock');
      return mockGetMedalTable(tournamentId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .rpc('get_medal_table', { p_tournament_id: tournamentId });
    if (error) {
      console.warn('[getMedalTable] error:', error.message);
      return [];
    }

    return (data ?? []) as MedalTable[];
  } catch (error) {
    console.warn('[getMedalTable] Fallback:', error);
    return [];
  }
}

export async function generateCertificate(
  registrationId: string,
): Promise<{ url: string }> {
  try {
    if (isMock()) {
      const { mockGenerateCertificate } = await import('@/lib/mocks/compete.mock');
      return mockGenerateCertificate(registrationId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .rpc('generate_certificate', { p_registration_id: registrationId });
    if (error) {
      console.warn('[generateCertificate] error:', error.message);
      return { url: '' };
    }

    return data as { url: string };
  } catch (error) {
    console.warn('[generateCertificate] Fallback:', error);
    return { url: '' };
  }
}

export async function getAthleteResults(
  athleteProfileId: string,
): Promise<TournamentMatch[]> {
  try {
    if (isMock()) {
      const { mockGetAthleteResults } = await import('@/lib/mocks/compete.mock');
      return mockGetAthleteResults(athleteProfileId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('tournament_matches')
      .select('*')
      .or(`athlete1_id.eq.${athleteProfileId},athlete2_id.eq.${athleteProfileId}`)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false });
    if (error) {
      console.warn('[getAthleteResults] error:', error.message);
      return [];
    }

    return (data ?? []) as TournamentMatch[];
  } catch (error) {
    console.warn('[getAthleteResults] Fallback:', error);
    return [];
  }
}

// ────────────────────────────────────────────────────────────
// ATHLETE PROFILES
// ────────────────────────────────────────────────────────────

export async function getAthleteProfile(id: string): Promise<AthleteProfile> {
  try {
    if (isMock()) {
      const { mockGetAthleteProfile } = await import('@/lib/mocks/compete.mock');
      return mockGetAthleteProfile(id);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('athlete_profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      console.warn('[getAthleteProfile] error:', error.message);
      return {} as AthleteProfile;
    }

    return data as AthleteProfile;
  } catch (error) {
    console.warn('[getAthleteProfile] Fallback:', error);
    return {} as AthleteProfile;
  }
}

export async function getAthleteByUser(userId: string): Promise<AthleteProfile> {
  try {
    if (isMock()) {
      const { mockGetAthleteByUser } = await import('@/lib/mocks/compete.mock');
      return mockGetAthleteByUser(userId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('athlete_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) {
      console.warn('[getAthleteByUser] error:', error.message);
      return {} as AthleteProfile;
    }

    return data as AthleteProfile;
  } catch (error) {
    console.warn('[getAthleteByUser] Fallback:', error);
    return {} as AthleteProfile;
  }
}

export async function updateAthleteProfile(
  id: string,
  data: Partial<Omit<AthleteProfile, 'id' | 'created_at' | 'updated_at'>>,
): Promise<AthleteProfile> {
  try {
    if (isMock()) {
      const { mockUpdateAthleteProfile } = await import('@/lib/mocks/compete.mock');
      return mockUpdateAthleteProfile(id, data);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: updated, error } = await supabase
      .from('athlete_profiles')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.warn('[updateAthleteProfile] error:', error.message);
      return {} as AthleteProfile;
    }

    return updated as AthleteProfile;
  } catch (error) {
    console.warn('[updateAthleteProfile] Fallback:', error);
    return {} as AthleteProfile;
  }
}

// ────────────────────────────────────────────────────────────
// RANKINGS
// ────────────────────────────────────────────────────────────

export async function getAcademyRanking(
  circuitId?: string,
): Promise<AcademyTournamentStats[]> {
  try {
    if (isMock()) {
      const { mockGetAcademyRanking } = await import('@/lib/mocks/compete.mock');
      return mockGetAcademyRanking(circuitId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    let query = supabase
      .from('academy_tournament_stats')
      .select('*')
      .order('total_points', { ascending: false });

    if (circuitId) query = query.eq('circuit_id', circuitId);

    const { data, error } = await query;
    if (error) {
      console.warn('[getAcademyRanking] error:', error.message);
      return [];
    }

    return (data ?? []) as AcademyTournamentStats[];
  } catch (error) {
    console.warn('[getAcademyRanking] Fallback:', error);
    return [];
  }
}

export async function getAthleteRanking(
  modality?: string,
  belt?: BeltLevel,
): Promise<AthleteProfile[]> {
  try {
    if (isMock()) {
      const { mockGetAthleteRanking } = await import('@/lib/mocks/compete.mock');
      return mockGetAthleteRanking(modality, belt);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    let query = supabase
      .from('athlete_profiles')
      .select('*')
      .order('ranking_points', { ascending: false });

    if (modality) query = query.contains('modalities', [modality]);
    if (belt) query = query.eq('belt', belt);

    const { data, error } = await query;
    if (error) {
      console.warn('[getAthleteRanking] error:', error.message);
      return [];
    }

    return (data ?? []) as AthleteProfile[];
  } catch (error) {
    console.warn('[getAthleteRanking] Fallback:', error);
    return [];
  }
}

// ────────────────────────────────────────────────────────────
// PREDICTIONS
// ────────────────────────────────────────────────────────────

export async function submitPrediction(
  tournamentId: string,
  categoryId: string,
  winnerId: string,
): Promise<TournamentPrediction> {
  try {
    if (isMock()) {
      const { mockSubmitPrediction } = await import('@/lib/mocks/compete.mock');
      return mockSubmitPrediction(tournamentId, categoryId, winnerId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: user } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('tournament_predictions')
      .upsert({
        tournament_id: tournamentId,
        category_id: categoryId,
        user_id: user.user?.id,
        predicted_winner_id: winnerId,
      })
      .select()
      .single();
    if (error) {
      console.warn('[submitPrediction] error:', error.message);
      return {} as TournamentPrediction;
    }

    return data as TournamentPrediction;
  } catch (error) {
    console.warn('[submitPrediction] Fallback:', error);
    return {} as TournamentPrediction;
  }
}

export async function getMyPredictions(
  tournamentId: string,
): Promise<TournamentPrediction[]> {
  try {
    if (isMock()) {
      const { mockGetMyPredictions } = await import('@/lib/mocks/compete.mock');
      return mockGetMyPredictions(tournamentId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: user } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('tournament_predictions')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('user_id', user.user?.id ?? '')
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('[getMyPredictions] error:', error.message);
      return [];
    }

    return (data ?? []) as TournamentPrediction[];
  } catch (error) {
    console.warn('[getMyPredictions] Fallback:', error);
    return [];
  }
}

export async function getPredictionLeaderboard(
  tournamentId: string,
): Promise<{ userId: string; name: string; correct: number; points: number }[]> {
  try {
    if (isMock()) {
      const { mockGetPredictionLeaderboard } = await import('@/lib/mocks/compete.mock');
      return mockGetPredictionLeaderboard(tournamentId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .rpc('get_prediction_leaderboard', { p_tournament_id: tournamentId });
    if (error) {
      console.warn('[getPredictionLeaderboard] error:', error.message);
      return [];
    }

    return (data ?? []) as { userId: string; name: string; correct: number; points: number }[];
  } catch (error) {
    console.warn('[getPredictionLeaderboard] Fallback:', error);
    return [];
  }
}

// ────────────────────────────────────────────────────────────
// SOCIAL CARDS
// ────────────────────────────────────────────────────────────

export async function generateSocialCard(
  type: SocialCardType,
  data: Record<string, unknown>,
): Promise<{ imageUrl: string }> {
  try {
    if (isMock()) {
      const { mockGenerateSocialCard } = await import('@/lib/mocks/compete.mock');
      return mockGenerateSocialCard(type, data);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: result, error } = await supabase
      .rpc('generate_social_card', {
        p_type: type,
        p_data: data,
      });
    if (error) {
      console.warn('[generateSocialCard] error:', error.message);
      return { imageUrl: '' };
    }

    return result as { imageUrl: string };
  } catch (error) {
    console.warn('[generateSocialCard] Fallback:', error);
    return { imageUrl: '' };
  }
}
