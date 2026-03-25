import { isMock } from '@/lib/env';

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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('leagues')
      .select('*')
      .eq('status', 'active')
      .single();
    if (error || !data) {
      console.error('[getActiveLeague] Supabase error:', error?.message);
      return {} as LeagueDTO;
    }
    return data as unknown as LeagueDTO;
  } catch (error) {
    console.error('[getActiveLeague] Fallback:', error);
    return {} as LeagueDTO;
  }
}

export async function getLeagueStandings(): Promise<LeagueAcademy[]> {
  try {
    if (isMock()) {
      const { mockGetLeagueStandings } = await import('@/lib/mocks/leagues.mock');
      return mockGetLeagueStandings();
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('league_standings')
      .select('*')
      .order('rank', { ascending: true });
    if (error || !data) {
      console.error('[getLeagueStandings] Supabase error:', error?.message);
      return [];
    }
    return data as unknown as LeagueAcademy[];
  } catch (error) {
    console.error('[getLeagueStandings] Fallback:', error);
    return [];
  }
}

export async function getMyAcademyRank(academyId: string): Promise<AcademyLeagueStats> {
  const fallback: AcademyLeagueStats = { academy_id: '', rank: 0, total_points: 0, per_capita_avg: 0, student_count: 0, top_contributors: [], opted_in: false };
  try {
    if (isMock()) {
      const { mockGetMyAcademyRank } = await import('@/lib/mocks/leagues.mock');
      return mockGetMyAcademyRank(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('league_standings')
      .select('*')
      .eq('academy_id', academyId)
      .single();
    if (error || !data) {
      console.error('[getMyAcademyRank] Supabase error:', error?.message);
      return fallback;
    }
    return data as unknown as AcademyLeagueStats;
  } catch (error) {
    console.error('[getMyAcademyRank] Fallback:', error);
    return fallback;
  }
}

export async function contributePoints(studentId: string, action: string): Promise<{ points_added: number; total_points: number }> {
  try {
    if (isMock()) {
      const { mockContributePoints } = await import('@/lib/mocks/leagues.mock');
      return mockContributePoints(studentId, action);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.rpc('contribute_league_points', { p_student_id: studentId, p_action: action });
    if (error || !data) {
      console.error('[contributePoints] Supabase error:', error?.message);
      return { points_added: 0, total_points: 0 };
    }
    return data as unknown as { points_added: number; total_points: number };
  } catch (error) {
    console.error('[contributePoints] Fallback:', error);
    return { points_added: 0, total_points: 0 };
  }
}

export async function toggleOptIn(academyId: string, optIn: boolean): Promise<{ success: boolean }> {
  try {
    if (isMock()) {
      const { mockToggleOptIn } = await import('@/lib/mocks/leagues.mock');
      return mockToggleOptIn(academyId, optIn);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from('league_standings')
      .update({ opted_in: optIn })
      .eq('academy_id', academyId);
    if (error) {
      console.error('[toggleOptIn] Supabase error:', error.message);
      return { success: false };
    }
    return { success: true };
  } catch (error) {
    console.error('[toggleOptIn] Fallback:', error);
    return { success: false };
  }
}
