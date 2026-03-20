import { isMock } from '@/lib/env';

export interface TournamentDTO {
  id: string;
  name: string;
  date: string;
  modality: string;
  categories: string[];
  enrolledCount: number;
  status: 'upcoming' | 'in_progress' | 'finished';
}

export interface BracketMatch {
  id: string;
  round: number;
  position: number;
  player1: string | null;
  player2: string | null;
  winner: string | null;
  method?: string;
}

export async function listTournaments(academyId: string): Promise<TournamentDTO[]> {
  try {
    if (isMock()) {
      const { mockListTournaments } = await import('@/lib/mocks/tournaments.mock');
      return mockListTournaments(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('academy_id', academyId)
      .order('date', { ascending: false });
    if (error) {
      console.warn('[listTournaments] Supabase error:', error.message);
      return [];
    }
    return (data ?? []) as unknown as TournamentDTO[];
  } catch (error) {
    console.warn('[listTournaments] Fallback:', error);
    return [];
  }
}

export async function createTournament(academyId: string, data: Omit<TournamentDTO, 'id' | 'enrolledCount' | 'status'>): Promise<TournamentDTO> {
  try {
    if (isMock()) {
      const { mockCreateTournament } = await import('@/lib/mocks/tournaments.mock');
      return mockCreateTournament(academyId, data);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: row, error } = await supabase
      .from('tournaments')
      .insert({ academy_id: academyId, ...data, status: 'upcoming', enrolled_count: 0 })
      .select()
      .single();
    if (error || !row) {
      console.warn('[createTournament] Supabase error:', error?.message);
      const { mockCreateTournament } = await import('@/lib/mocks/tournaments.mock');
      return mockCreateTournament(academyId, data);
    }
    return row as unknown as TournamentDTO;
  } catch (error) {
    console.warn('[createTournament] Fallback:', error);
    const { mockCreateTournament } = await import('@/lib/mocks/tournaments.mock');
    return mockCreateTournament(academyId, data);
  }
}

export async function getBracket(tournamentId: string, _categoryId: string): Promise<BracketMatch[]> {
  try {
    if (isMock()) {
      const { mockGetBracket } = await import('@/lib/mocks/tournaments.mock');
      return mockGetBracket(tournamentId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('tournament_brackets')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('round')
      .order('position');
    if (error) {
      console.warn('[getBracket] Supabase error:', error.message);
      return [];
    }
    return (data ?? []) as unknown as BracketMatch[];
  } catch (error) {
    console.warn('[getBracket] Fallback:', error);
    return [];
  }
}

export async function enrollTournament(tournamentId: string, _studentId: string): Promise<void> {
  try {
    if (isMock()) return;
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from('tournament_enrollments')
      .insert({ tournament_id: tournamentId, student_id: _studentId });
    if (error) {
      console.warn('[enrollTournament] Supabase error:', error.message);
    }
  } catch (error) {
    console.warn('[enrollTournament] Fallback:', error);
  }
}
