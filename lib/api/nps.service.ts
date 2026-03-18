import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

export interface NPSDistribution {
  score: number;
  count: number;
}

export interface NPSFeedback {
  id: string;
  respondent_name: string;
  score: number;
  comment: string;
  created_at: string;
  category: 'promoter' | 'passive' | 'detractor';
}

export interface NPSTrend {
  month: string;
  score: number;
}

export interface NPSDataDTO {
  nps_score: number;
  total_responses: number;
  promoters_count: number;
  passives_count: number;
  detractors_count: number;
  promoters_pct: number;
  passives_pct: number;
  detractors_pct: number;
  distribution: NPSDistribution[];
  feedback: NPSFeedback[];
  trend: NPSTrend[];
}

export async function getNPSData(academyId: string): Promise<NPSDataDTO> {
  try {
    if (isMock()) {
      const { mockGetNPSData } = await import('@/lib/mocks/nps.mock');
      return mockGetNPSData(academyId);
    }
    try {
      const res = await fetch(`/api/nps?academyId=${academyId}`);
      if (!res.ok) throw new ServiceError(res.status, 'nps.data');
      return res.json();
    } catch {
      console.warn('[nps.getNPSData] API not available, using fallback');
      return { nps_score: 0, total_responses: 0, promoters_count: 0, passives_count: 0, detractors_count: 0, promoters_pct: 0, passives_pct: 0, detractors_pct: 0, distribution: [], feedback: [], trend: [] } as NPSDataDTO;
    }
  } catch (error) {
    handleServiceError(error, 'nps.data');
  }
}
