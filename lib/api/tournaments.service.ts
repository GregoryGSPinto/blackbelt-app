import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

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
    try {
      const res = await fetch(`/api/tournaments?academyId=${academyId}`);
      if (!res.ok) throw new ServiceError(res.status, 'tournaments.list');
      return res.json();
    } catch {
      console.warn('[tournaments.listTournaments] API not available, using mock fallback');
      const { mockListTournaments } = await import('@/lib/mocks/tournaments.mock');
      return mockListTournaments(academyId);
    }
  } catch (error) { handleServiceError(error, 'tournaments.list'); }
}

export async function createTournament(academyId: string, data: Omit<TournamentDTO, 'id' | 'enrolledCount' | 'status'>): Promise<TournamentDTO> {
  try {
    if (isMock()) {
      const { mockCreateTournament } = await import('@/lib/mocks/tournaments.mock');
      return mockCreateTournament(academyId, data);
    }
    try {
      const res = await fetch(`/api/tournaments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ academyId, ...data }) });
      if (!res.ok) throw new ServiceError(res.status, 'tournaments.create');
      return res.json();
    } catch {
      console.warn('[tournaments.createTournament] API not available, using mock fallback');
      const { mockCreateTournament } = await import('@/lib/mocks/tournaments.mock');
      return mockCreateTournament(academyId, data);
    }
  } catch (error) { handleServiceError(error, 'tournaments.create'); }
}

export async function getBracket(tournamentId: string, _categoryId: string): Promise<BracketMatch[]> {
  try {
    if (isMock()) {
      const { mockGetBracket } = await import('@/lib/mocks/tournaments.mock');
      return mockGetBracket(tournamentId);
    }
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/bracket`);
      if (!res.ok) throw new ServiceError(res.status, 'tournaments.bracket');
      return res.json();
    } catch {
      console.warn('[tournaments.getBracket] API not available, using mock fallback');
      const { mockGetBracket } = await import('@/lib/mocks/tournaments.mock');
      return mockGetBracket(tournamentId);
    }
  } catch (error) { handleServiceError(error, 'tournaments.bracket'); }
}

export async function enrollTournament(tournamentId: string, _studentId: string): Promise<void> {
  try {
    if (isMock()) return;
    const res = await fetch(`/api/tournaments/${tournamentId}/enroll`, { method: 'POST' });
    try {
      if (!res.ok) throw new ServiceError(res.status, 'tournaments.enroll');
    } catch {
      console.warn('[tournaments.enrollTournament] API not available, using fallback');
    }
  } catch (error) { handleServiceError(error, 'tournaments.enroll'); }
}
