import { isMock } from '@/lib/env';

export interface RankedAthleteDTO {
  position: number;
  athlete_id: string;
  athlete_name: string;
  academy: string;
  belt: string;
  weight_class: string;
  region: string;
  points: number;
  gold: number;
  silver: number;
  bronze: number;
  events_count: number;
}

export interface RankedAcademyDTO {
  position: number;
  academy_id: string;
  academy_name: string;
  region: string;
  total_points: number;
  athletes_count: number;
  gold: number;
  silver: number;
  bronze: number;
}

export interface AthleteCompetitionHistory {
  championship_id: string;
  championship_name: string;
  date: string;
  category: string;
  result: 'gold' | 'silver' | 'bronze' | 'eliminated';
  points_earned: number;
  importance: 'local' | 'estadual' | 'nacional';
}

export interface AthleteProfileDTO {
  athlete_id: string;
  athlete_name: string;
  academy: string;
  belt: string;
  weight_class: string;
  region: string;
  age: number;
  total_points: number;
  ranking_position: number;
  win_rate: number;
  submission_rate: number;
  total_fights: number;
  total_wins: number;
  total_losses: number;
  gold: number;
  silver: number;
  bronze: number;
  achievements: string[];
  history: AthleteCompetitionHistory[];
}

export interface RankingFilters {
  modality?: string;
  belt?: string;
  weight?: string;
  region?: string;
}

// Points: Gold=9, Silver=3, Bronze=1, multiplied by importance (local=1x, estadual=2x, nacional=3x). Rolling 12 months.
export function calculatePoints(result: 'gold' | 'silver' | 'bronze' | 'eliminated', importance: 'local' | 'estadual' | 'nacional'): number {
  const base: Record<string, number> = { gold: 9, silver: 3, bronze: 1, eliminated: 0 };
  const multiplier: Record<string, number> = { local: 1, estadual: 2, nacional: 3 };
  return base[result] * multiplier[importance];
}

export async function getAthleteRanking(filters?: RankingFilters): Promise<RankedAthleteDTO[]> {
  try {
    if (isMock()) {
      const { mockGetAthleteRanking } = await import('@/lib/mocks/federation-ranking.mock');
      return mockGetAthleteRanking(filters);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    let query = supabase
      .from('athlete_profiles')
      .select('user_id, full_name, academy_name, belt, weight_class, ranking_points, gold_medals, silver_medals, bronze_medals, total_fights')
      .order('ranking_points', { ascending: false })
      .limit(100);

    if (filters?.belt) query = query.eq('belt', filters.belt);
    if (filters?.weight) query = query.eq('weight_class', filters.weight);
    if (filters?.modality) query = query.eq('modality', filters.modality);

    const { data, error } = await query;

    if (error) {
      console.warn('[getAthleteRanking] Supabase error:', error.message);
      return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data ?? []).map((row: any, idx: number) => ({
      position: idx + 1,
      athlete_id: row.user_id,
      athlete_name: row.full_name,
      academy: row.academy_name ?? '',
      belt: row.belt ?? '',
      weight_class: row.weight_class ?? '',
      region: '',
      points: row.ranking_points ?? 0,
      gold: row.gold_medals ?? 0,
      silver: row.silver_medals ?? 0,
      bronze: row.bronze_medals ?? 0,
      events_count: row.total_fights ?? 0,
    }));
  } catch (error) {
    console.warn('[getAthleteRanking] Fallback:', error);
    return [];
  }
}

export async function getAcademyRanking(filters?: { modality?: string; region?: string }): Promise<RankedAcademyDTO[]> {
  try {
    if (isMock()) {
      const { mockGetAcademyRanking } = await import('@/lib/mocks/federation-ranking.mock');
      return mockGetAcademyRanking(filters);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('academy_tournament_stats')
      .select('academy_id, academy_name, total_athletes, gold, silver, bronze, points')
      .order('points', { ascending: false })
      .limit(100);

    if (error) {
      console.warn('[getAcademyRanking] Supabase error:', error.message);
      return [];
    }

    // Aggregate across all tournaments per academy
    const academyMap = new Map<string, { academy_id: string; academy_name: string; total_points: number; athletes_count: number; gold: number; silver: number; bronze: number }>();

    for (const row of data ?? []) {
      const existing = academyMap.get(row.academy_id);
      if (existing) {
        existing.total_points += row.points ?? 0;
        existing.athletes_count += row.total_athletes ?? 0;
        existing.gold += row.gold ?? 0;
        existing.silver += row.silver ?? 0;
        existing.bronze += row.bronze ?? 0;
      } else {
        academyMap.set(row.academy_id, {
          academy_id: row.academy_id,
          academy_name: row.academy_name,
          total_points: row.points ?? 0,
          athletes_count: row.total_athletes ?? 0,
          gold: row.gold ?? 0,
          silver: row.silver ?? 0,
          bronze: row.bronze ?? 0,
        });
      }
    }

    const sorted = [...academyMap.values()].sort((a, b) => b.total_points - a.total_points);
    return sorted.map((a, idx) => ({
      position: idx + 1,
      academy_id: a.academy_id,
      academy_name: a.academy_name,
      region: '',
      total_points: a.total_points,
      athletes_count: a.athletes_count,
      gold: a.gold,
      silver: a.silver,
      bronze: a.bronze,
    }));
  } catch (error) {
    console.warn('[getAcademyRanking] Fallback:', error);
    return [];
  }
}

export async function getAthleteProfile(athleteId: string): Promise<AthleteProfileDTO> {
  try {
    if (isMock()) {
      const { mockGetAthleteProfile } = await import('@/lib/mocks/federation-ranking.mock');
      return mockGetAthleteProfile(athleteId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: ap, error } = await supabase
      .from('athlete_profiles')
      .select('*')
      .eq('user_id', athleteId)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') {
        console.warn('[getAthleteProfile] Supabase error:', error.message);
      }
      return { athlete_id: athleteId, athlete_name: '', academy: '', belt: '', weight_class: '', region: '', age: 0, total_points: 0, ranking_position: 0, win_rate: 0, submission_rate: 0, total_fights: 0, total_wins: 0, total_losses: 0, gold: 0, silver: 0, bronze: 0, achievements: [], history: [] };
    }

    // Fetch competition history from tournament_registrations
    const { data: regs } = await supabase
      .from('tournament_registrations')
      .select(`
        tournament_id,
        status,
        tournaments!inner(name, event_date),
        tournament_categories!inner(name)
      `)
      .eq('user_id', athleteId)
      .order('created_at', { ascending: false })
      .limit(20);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const history: AthleteCompetitionHistory[] = (regs ?? []).map((r: any) => ({
      championship_id: r.tournament_id,
      championship_name: (r.tournaments as unknown as { name: string })?.name ?? '',
      date: (r.tournaments as unknown as { event_date: string })?.event_date ?? '',
      category: (r.tournament_categories as unknown as { name: string })?.name ?? '',
      result: 'eliminated' as const,
      points_earned: 0,
      importance: 'local' as const,
    }));

    return {
      athlete_id: athleteId,
      athlete_name: ap?.full_name ?? '',
      academy: ap?.academy_name ?? '',
      belt: ap?.belt ?? '',
      weight_class: ap?.weight_class ?? '',
      region: '',
      age: 0,
      total_points: ap?.ranking_points ?? 0,
      ranking_position: ap?.ranking_position ?? 0,
      win_rate: Number(ap?.win_rate ?? 0),
      submission_rate: ap?.total_fights ? (ap.submissions ?? 0) / ap.total_fights : 0,
      total_fights: ap?.total_fights ?? 0,
      total_wins: ap?.wins ?? 0,
      total_losses: ap?.losses ?? 0,
      gold: ap?.gold_medals ?? 0,
      silver: ap?.silver_medals ?? 0,
      bronze: ap?.bronze_medals ?? 0,
      achievements: [],
      history,
    };
  } catch (error) {
    console.warn('[getAthleteProfile] Fallback:', error);
    return { athlete_id: athleteId, athlete_name: '', academy: '', belt: '', weight_class: '', region: '', age: 0, total_points: 0, ranking_position: 0, win_rate: 0, submission_rate: 0, total_fights: 0, total_wins: 0, total_losses: 0, gold: 0, silver: 0, bronze: 0, achievements: [], history: [] };
  }
}
