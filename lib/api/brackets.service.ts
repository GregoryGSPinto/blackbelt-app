import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

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

export async function generateBracket(championshipId: string, categoryId: string, method: BracketMethod): Promise<BracketDTO> {
  try {
    if (isMock()) {
      const { mockGenerateBracket } = await import('@/lib/mocks/brackets.mock');
      return mockGenerateBracket(championshipId, categoryId, method);
    }
    try {
      const res = await fetch(`/api/championships/${championshipId}/categories/${categoryId}/bracket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'brackets.generate');
      return res.json();
    } catch {
      console.warn('[brackets.generateBracket] API not available, using fallback');
      return { id: "", championship_id: "", category_id: "", category_name: "", total_athletes: 0, matches: [], status: "pending" } as unknown as BracketDTO;
    }
  } catch (error) { handleServiceError(error, 'brackets.generate'); }
}

export async function getBracketByCategory(categoryId: string): Promise<BracketDTO> {
  try {
    if (isMock()) {
      const { mockGetBracketByCategory } = await import('@/lib/mocks/brackets.mock');
      return mockGetBracketByCategory(categoryId);
    }
    try {
      const res = await fetch(`/api/brackets/category/${categoryId}`);
      if (!res.ok) throw new ServiceError(res.status, 'brackets.get');
      return res.json();
    } catch {
      console.warn('[brackets.getBracketByCategory] API not available, using fallback');
      return { id: "", championship_id: "", category_id: "", category_name: "", total_athletes: 0, matches: [], status: "pending" } as unknown as BracketDTO;
    }
  } catch (error) { handleServiceError(error, 'brackets.get'); }
}

export async function submitResult(matchId: string, result: SubmitResultPayload): Promise<MatchDTO> {
  try {
    if (isMock()) {
      const { mockSubmitResult } = await import('@/lib/mocks/brackets.mock');
      return mockSubmitResult(matchId, result);
    }
    try {
      const res = await fetch(`/api/brackets/matches/${matchId}/result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      });
      if (!res.ok) throw new ServiceError(res.status, 'brackets.submitResult');
      return res.json();
    } catch {
      console.warn('[brackets.submitResult] API not available, using fallback');
      return { id: "", bracket_id: "", round: 0, position: 0, athlete1_id: null, athlete1_name: null, athlete2_id: null, athlete2_name: null, winner_id: null, method: null, status: "pending" } as unknown as MatchDTO;
    }
  } catch (error) { handleServiceError(error, 'brackets.submitResult'); }
}

export async function getMatchDetails(matchId: string): Promise<MatchDTO> {
  try {
    if (isMock()) {
      const { mockGetMatchDetails } = await import('@/lib/mocks/brackets.mock');
      return mockGetMatchDetails(matchId);
    }
    try {
      const res = await fetch(`/api/brackets/matches/${matchId}`);
      if (!res.ok) throw new ServiceError(res.status, 'brackets.matchDetails');
      return res.json();
    } catch {
      console.warn('[brackets.getMatchDetails] API not available, using fallback');
      return { id: "", bracket_id: "", round: 0, position: 0, athlete1_id: null, athlete1_name: null, athlete2_id: null, athlete2_name: null, winner_id: null, method: null, status: "pending" } as unknown as MatchDTO;
    }
  } catch (error) { handleServiceError(error, 'brackets.matchDetails'); }
}
