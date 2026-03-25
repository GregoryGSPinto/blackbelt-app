import { isMock } from '@/lib/env';

export type BracketMethod = 'single_elimination' | 'double_elimination' | 'round_robin';
export type MatchResultMethod = 'submission' | 'points' | 'dq' | 'walkover';

export interface MatchDTO {
  id: string;
  bracket_id: string;
  round: number;
  position: number;
  fighter_a_id: string | null;
  fighter_a_name: string | null;
  fighter_b_id: string | null;
  fighter_b_name: string | null;
  winner_id: string | null;
  winner_name: string | null;
  method: MatchResultMethod | null;
  score_a: number | null;
  score_b: number | null;
  duration_seconds: number | null;
  notes: string | null;
  mat_number: number | null;
  scheduled_time: string | null;
}

export interface BracketDTO {
  id: string;
  championship_id: string;
  category_id: string;
  method: BracketMethod;
  total_rounds: number;
  matches: MatchDTO[];
}

export interface SubmitResultPayload {
  winner_id: string;
  method: MatchResultMethod;
  score_a: number;
  score_b: number;
  duration_seconds: number;
  notes?: string;
}

const EMPTY_BRACKET: BracketDTO = { id: '', championship_id: '', category_id: '', method: 'single_elimination', total_rounds: 0, matches: [] };
const EMPTY_MATCH: MatchDTO = { id: '', bracket_id: '', round: 0, position: 0, fighter_a_id: null, fighter_a_name: null, fighter_b_id: null, fighter_b_name: null, winner_id: null, winner_name: null, method: null, score_a: null, score_b: null, duration_seconds: null, notes: null, mat_number: null, scheduled_time: null };

export async function generateBracket(championshipId: string, categoryId: string, method: BracketMethod): Promise<BracketDTO> {
  try {
    if (isMock()) {
      const { mockGenerateBracket } = await import('@/lib/mocks/brackets.mock');
      return mockGenerateBracket(championshipId, categoryId, method);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('brackets')
      .insert({ championship_id: championshipId, category_id: categoryId, method })
      .select()
      .single();

    if (error || !data) {
      console.error('[generateBracket] Supabase error:', error?.message);
      return { ...EMPTY_BRACKET, championship_id: championshipId, category_id: categoryId, method };
    }

    return { ...(data as unknown as BracketDTO), matches: [] };
  } catch (error) {
    console.error('[generateBracket] Fallback:', error);
    return { ...EMPTY_BRACKET, championship_id: championshipId, category_id: categoryId, method };
  }
}

export async function getBracketByCategory(categoryId: string): Promise<BracketDTO> {
  try {
    if (isMock()) {
      const { mockGetBracketByCategory } = await import('@/lib/mocks/brackets.mock');
      return mockGetBracketByCategory(categoryId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('brackets')
      .select('*, bracket_matches(*)')
      .eq('category_id', categoryId)
      .single();

    if (error || !data) {
      console.error('[getBracketByCategory] Supabase error:', error?.message);
      return { ...EMPTY_BRACKET, category_id: categoryId };
    }

    return {
      ...(data as unknown as BracketDTO),
      matches: ((data as Record<string, unknown>).bracket_matches ?? []) as MatchDTO[],
    };
  } catch (error) {
    console.error('[getBracketByCategory] Fallback:', error);
    return { ...EMPTY_BRACKET, category_id: categoryId };
  }
}

export async function submitResult(matchId: string, result: SubmitResultPayload): Promise<MatchDTO> {
  try {
    if (isMock()) {
      const { mockSubmitResult } = await import('@/lib/mocks/brackets.mock');
      return mockSubmitResult(matchId, result);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('bracket_matches')
      .update({
        winner_id: result.winner_id,
        method: result.method,
        score_a: result.score_a,
        score_b: result.score_b,
        duration_seconds: result.duration_seconds,
        notes: result.notes,
      })
      .eq('id', matchId)
      .select()
      .single();

    if (error || !data) {
      console.error('[submitResult] Supabase error:', error?.message);
      return { ...EMPTY_MATCH, id: matchId };
    }

    return data as unknown as MatchDTO;
  } catch (error) {
    console.error('[submitResult] Fallback:', error);
    return { ...EMPTY_MATCH, id: matchId };
  }
}

export async function getMatchDetails(matchId: string): Promise<MatchDTO> {
  try {
    if (isMock()) {
      const { mockGetMatchDetails } = await import('@/lib/mocks/brackets.mock');
      return mockGetMatchDetails(matchId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('bracket_matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (error || !data) {
      console.error('[getMatchDetails] Supabase error:', error?.message);
      return { ...EMPTY_MATCH, id: matchId };
    }

    return data as unknown as MatchDTO;
  } catch (error) {
    console.error('[getMatchDetails] Fallback:', error);
    return { ...EMPTY_MATCH, id: matchId };
  }
}
