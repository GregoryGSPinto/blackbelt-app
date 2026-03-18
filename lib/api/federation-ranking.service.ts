import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

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
    try {
      const params = new URLSearchParams();
      if (filters?.modality) params.set('modality', filters.modality);
      if (filters?.belt) params.set('belt', filters.belt);
      if (filters?.weight) params.set('weight', filters.weight);
      if (filters?.region) params.set('region', filters.region);
      const res = await fetch(`/api/ranking/athletes?${params.toString()}`);
      if (!res.ok) throw new ServiceError(res.status, 'federation-ranking.athletes');
      return res.json();
    } catch {
      console.warn('[federation-ranking.getAthleteRanking] API not available, using fallback');
      return [];
    }
  } catch (error) { handleServiceError(error, 'federation-ranking.athletes'); }
}

export async function getAcademyRanking(filters?: { modality?: string; region?: string }): Promise<RankedAcademyDTO[]> {
  try {
    if (isMock()) {
      const { mockGetAcademyRanking } = await import('@/lib/mocks/federation-ranking.mock');
      return mockGetAcademyRanking(filters);
    }
    try {
      const params = new URLSearchParams();
      if (filters?.modality) params.set('modality', filters.modality);
      if (filters?.region) params.set('region', filters.region);
      const res = await fetch(`/api/ranking/academies?${params.toString()}`);
      if (!res.ok) throw new ServiceError(res.status, 'federation-ranking.academies');
      return res.json();
    } catch {
      console.warn('[federation-ranking.getAcademyRanking] API not available, using fallback');
      return [];
    }
  } catch (error) { handleServiceError(error, 'federation-ranking.academies'); }
}

export async function getAthleteProfile(athleteId: string): Promise<AthleteProfileDTO> {
  try {
    if (isMock()) {
      const { mockGetAthleteProfile } = await import('@/lib/mocks/federation-ranking.mock');
      return mockGetAthleteProfile(athleteId);
    }
    try {
      const res = await fetch(`/api/ranking/athletes/${athleteId}`);
      if (!res.ok) throw new ServiceError(res.status, 'federation-ranking.athleteProfile');
      return res.json();
    } catch {
      console.warn('[federation-ranking.getAthleteProfile] API not available, using fallback');
      return { id: "", name: "", academy_name: "", belt: "", weight_class: "", age_group: "", modality: "", ranking_position: 0, total_points: 0, competitions: [], medals: { gold: 0, silver: 0, bronze: 0 } } as unknown as AthleteProfileDTO;
    }
  } catch (error) { handleServiceError(error, 'federation-ranking.athleteProfile'); }
}
