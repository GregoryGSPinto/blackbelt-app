import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

export interface LeagueAcademy {
  academy_id: string;
  name: string;
  logo: string;
  total_points: number;
  student_count: number;
  per_capita_avg: number;
  rank: number;
}

export interface LeagueDTO {
  id: string;
  name: string;
  season_id: string;
  academies: LeagueAcademy[];
  rules: string;
  start_date: string;
  end_date: string;
  prizes: string[];
}

export interface AcademyLeagueStats {
  academy_id: string;
  rank: number;
  total_points: number;
  per_capita_avg: number;
  student_count: number;
  top_contributors: { student_id: string; student_name: string; points: number }[];
  opted_in: boolean;
}

export async function getActiveLeague(): Promise<LeagueDTO> {
  try {
    if (isMock()) {
      const { mockGetActiveLeague } = await import('@/lib/mocks/leagues.mock');
      return mockGetActiveLeague();
    }
    // API not yet implemented — use mock
    const { mockGetActiveLeague } = await import('@/lib/mocks/leagues.mock');
      return mockGetActiveLeague();
  } catch (error) { handleServiceError(error, 'leagues.active'); }
}

export async function getLeagueStandings(): Promise<LeagueAcademy[]> {
  try {
    if (isMock()) {
      const { mockGetLeagueStandings } = await import('@/lib/mocks/leagues.mock');
      return mockGetLeagueStandings();
    }
    // API not yet implemented — use mock
    const { mockGetLeagueStandings } = await import('@/lib/mocks/leagues.mock');
      return mockGetLeagueStandings();
  } catch (error) { handleServiceError(error, 'leagues.standings'); }
}

export async function getMyAcademyRank(academyId: string): Promise<AcademyLeagueStats> {
  try {
    if (isMock()) {
      const { mockGetMyAcademyRank } = await import('@/lib/mocks/leagues.mock');
      return mockGetMyAcademyRank(academyId);
    }
    // API not yet implemented — use mock
    const { mockGetMyAcademyRank } = await import('@/lib/mocks/leagues.mock');
      return mockGetMyAcademyRank(academyId);
  } catch (error) { handleServiceError(error, 'leagues.myAcademy'); }
}

export async function contributePoints(studentId: string, action: string): Promise<{ points_added: number; total_points: number }> {
  try {
    if (isMock()) {
      const { mockContributePoints } = await import('@/lib/mocks/leagues.mock');
      return mockContributePoints(studentId, action);
    }
    try {
      const res = await fetch('/api/leagues/contribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, action }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'leagues.contribute');
      return res.json();
    } catch {
      console.warn('[leagues.contributePoints] API not available, using mock fallback');
      const { mockContributePoints } = await import('@/lib/mocks/leagues.mock');
      return mockContributePoints(studentId, action);
    }
  } catch (error) { handleServiceError(error, 'leagues.contribute'); }
}

export async function toggleOptIn(academyId: string, optIn: boolean): Promise<{ success: boolean }> {
  try {
    if (isMock()) {
      const { mockToggleOptIn } = await import('@/lib/mocks/leagues.mock');
      return mockToggleOptIn(academyId, optIn);
    }
    try {
      const res = await fetch('/api/leagues/opt-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ academyId, optIn }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'leagues.optIn');
      return res.json();
    } catch {
      console.warn('[leagues.toggleOptIn] API not available, using mock fallback');
      const { mockToggleOptIn } = await import('@/lib/mocks/leagues.mock');
      return mockToggleOptIn(academyId, optIn);
    }
  } catch (error) { handleServiceError(error, 'leagues.optIn'); }
}
