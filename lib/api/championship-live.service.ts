import { isMock } from '@/lib/env';

export interface LiveMatchDTO {
  match_id: string;
  mat_number: number;
  category_label: string;
  fighter_a_name: string;
  fighter_b_name: string;
  score_a: number;
  score_b: number;
  elapsed_seconds: number;
  status: 'in_progress' | 'paused' | 'finished';
  winner_name: string | null;
  method: string | null;
}

export interface CategoryResultDTO {
  category_id: string;
  category_label: string;
  modality: string;
  gold: { athlete_id: string; athlete_name: string; academy: string };
  silver: { athlete_id: string; athlete_name: string; academy: string };
  bronze: { athlete_id: string; athlete_name: string; academy: string }[];
}

export interface MedalTableEntry {
  academy_id: string;
  academy_name: string;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
}

export interface UpdateEvent {
  type: 'match_update' | 'match_finished' | 'bracket_update';
  payload: LiveMatchDTO;
}

interface MatchRow {
  id: string;
  mat_number: number | null;
  category_id: string;
  fighter_a_id?: string | null;
  fighter_a_name: string | null;
  fighter_a_academy?: string | null;
  fighter_b_id?: string | null;
  fighter_b_name: string | null;
  fighter_b_academy?: string | null;
  score_a: number | null;
  score_b: number | null;
  duration_seconds: number | null;
  status: string;
  winner_id?: string | null;
  winner_name: string | null;
  method: string | null;
  round?: number | null;
  tournament_categories: { id?: string; name: string; modality?: string } | null;
}

interface MedalRow {
  academy_id: string;
  academy_name: string;
  gold: number | null;
  silver: number | null;
  bronze: number | null;
}

export async function getLiveMatches(championshipId: string): Promise<LiveMatchDTO[]> {
  try {
    if (isMock()) {
      const { mockGetLiveMatches } = await import('@/lib/mocks/championship-live.mock');
      return mockGetLiveMatches(championshipId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('tournament_matches')
      .select(`
        id,
        mat_number,
        category_id,
        fighter_a_name,
        fighter_b_name,
        score_a,
        score_b,
        duration_seconds,
        status,
        winner_name,
        method,
        tournament_categories!inner(name)
      `)
      .eq('tournament_id', championshipId)
      .eq('status', 'in_progress');

    if (error) {
      console.error('[getLiveMatches] Supabase error:', error.message);
      return [];
    }

    return (data ?? []).map((m: unknown) => {
      const row = m as MatchRow;
      return {
      match_id: row.id,
      mat_number: row.mat_number ?? 0,
      category_label: (row.tournament_categories as { name: string } | null)?.name ?? '',
      fighter_a_name: row.fighter_a_name ?? '',
      fighter_b_name: row.fighter_b_name ?? '',
      score_a: row.score_a ?? 0,
      score_b: row.score_b ?? 0,
      elapsed_seconds: row.duration_seconds ?? 0,
      status: 'in_progress' as const,
      winner_name: row.winner_name ?? null,
      method: row.method ?? null,
    };
    });
  } catch (error) {
    console.error('[getLiveMatches] Fallback:', error);
    return [];
  }
}

export async function getResults(championshipId: string, categoryId?: string): Promise<CategoryResultDTO[]> {
  try {
    if (isMock()) {
      const { mockGetResults } = await import('@/lib/mocks/championship-live.mock');
      return mockGetResults(championshipId, categoryId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Get completed matches, optionally filtered by category
    let query = supabase
      .from('tournament_matches')
      .select(`
        id,
        category_id,
        fighter_a_id,
        fighter_a_name,
        fighter_a_academy,
        fighter_b_id,
        fighter_b_name,
        fighter_b_academy,
        winner_id,
        winner_name,
        score_a,
        score_b,
        method,
        round,
        tournament_categories!inner(id, name, modality)
      `)
      .eq('tournament_id', championshipId)
      .eq('status', 'completed');

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[getResults] Supabase error:', error.message);
      return [];
    }

    // Group by category and determine medalists (final round = gold/silver, semifinal losers = bronze)
    const categoryMap = new Map<string, { cat: { id: string; name: string; modality: string }; matches: MatchRow[] }>();
    for (const m of data ?? []) {
      const row = m as unknown as MatchRow;
      const cat = row.tournament_categories as { id: string; name: string; modality: string };
      if (!categoryMap.has(cat.id)) {
        categoryMap.set(cat.id, { cat, matches: [] });
      }
      categoryMap.get(cat.id)!.matches.push(row);
    }

    const results: CategoryResultDTO[] = [];
    for (const [, { cat, matches }] of categoryMap) {
      const maxRound = Math.max(...matches.map((m) => m.round ?? 0));
      const finalMatch = matches.find((m) => m.round === maxRound);
      const emptyAthlete = { athlete_id: '', athlete_name: '', academy: '' };

      const gold = finalMatch?.winner_id
        ? { athlete_id: finalMatch.winner_id, athlete_name: finalMatch.winner_name ?? '', academy: finalMatch.fighter_a_id === finalMatch.winner_id ? (finalMatch.fighter_a_academy ?? '') : (finalMatch.fighter_b_academy ?? '') }
        : emptyAthlete;

      const silver = finalMatch
        ? (finalMatch.fighter_a_id === finalMatch.winner_id
          ? { athlete_id: finalMatch.fighter_b_id ?? '', athlete_name: finalMatch.fighter_b_name ?? '', academy: finalMatch.fighter_b_academy ?? '' }
          : { athlete_id: finalMatch.fighter_a_id ?? '', athlete_name: finalMatch.fighter_a_name ?? '', academy: finalMatch.fighter_a_academy ?? '' })
        : emptyAthlete;

      results.push({
        category_id: cat.id,
        category_label: cat.name,
        modality: cat.modality,
        gold,
        silver,
        bronze: [], // bronze determination requires bracket analysis
      });
    }

    return results;
  } catch (error) {
    console.error('[getResults] Fallback:', error);
    return [];
  }
}

export async function getMedalTable(championshipId: string): Promise<MedalTableEntry[]> {
  try {
    if (isMock()) {
      const { mockGetMedalTable } = await import('@/lib/mocks/championship-live.mock');
      return mockGetMedalTable(championshipId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('academy_tournament_stats')
      .select('academy_id, academy_name, gold, silver, bronze')
      .eq('tournament_id', championshipId)
      .order('gold', { ascending: false });

    if (error) {
      console.error('[getMedalTable] Supabase error:', error.message);
      return [];
    }

    return (data ?? []).map((r: unknown) => {
      const row = r as MedalRow;
      return {
        academy_id: row.academy_id,
        academy_name: row.academy_name,
        gold: row.gold ?? 0,
        silver: row.silver ?? 0,
        bronze: row.bronze ?? 0,
        total: (row.gold ?? 0) + (row.silver ?? 0) + (row.bronze ?? 0),
      };
    });
  } catch (error) {
    console.error('[getMedalTable] Fallback:', error);
    return [];
  }
}

export function subscribeToUpdates(championshipId: string, callback: (event: UpdateEvent) => void): () => void {
  if (isMock()) {
    let unsubscribe: () => void = () => {};
    import('@/lib/mocks/championship-live.mock').then(({ mockSubscribeToUpdates }) => {
      unsubscribe = mockSubscribeToUpdates(championshipId, callback);
    });
    return () => unsubscribe();
  }
  const es = new EventSource(`/api/championships/${championshipId}/updates`);
  es.onmessage = (e) => {
    try {
      const event: UpdateEvent = JSON.parse(e.data);
      callback(event);
    } catch { /* ignore parse errors */ }
  };
  return () => es.close();
}
