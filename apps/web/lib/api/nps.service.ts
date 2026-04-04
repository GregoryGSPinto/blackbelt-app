import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('nps_responses')
      .select('*')
      .eq('academy_id', academyId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      logServiceError(error, 'nps');
      return { nps_score: 0, total_responses: 0, promoters_count: 0, passives_count: 0, detractors_count: 0, promoters_pct: 0, passives_pct: 0, detractors_pct: 0, distribution: [], feedback: [], trend: [] };
    }

    const responses = data as Record<string, unknown>[];
    const total = responses.length;
    const promoters = responses.filter(r => Number(r.score) >= 9).length;
    const detractors = responses.filter(r => Number(r.score) <= 6).length;
    const passives = total - promoters - detractors;

    return {
      nps_score: total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0,
      total_responses: total,
      promoters_count: promoters,
      passives_count: passives,
      detractors_count: detractors,
      promoters_pct: total > 0 ? Math.round((promoters / total) * 100) : 0,
      passives_pct: total > 0 ? Math.round((passives / total) * 100) : 0,
      detractors_pct: total > 0 ? Math.round((detractors / total) * 100) : 0,
      distribution: [],
      feedback: responses.slice(0, 20).map(r => ({
        id: String(r.id ?? ''),
        respondent_name: String(r.respondent_name ?? ''),
        score: Number(r.score ?? 0),
        comment: String(r.comment ?? ''),
        created_at: String(r.created_at ?? ''),
        category: Number(r.score) >= 9 ? 'promoter' : Number(r.score) <= 6 ? 'detractor' : 'passive',
      })),
      trend: [],
    };
  } catch (error) {
    logServiceError(error, 'nps');
    return { nps_score: 0, total_responses: 0, promoters_count: 0, passives_count: 0, detractors_count: 0, promoters_pct: 0, passives_pct: 0, detractors_pct: 0, distribution: [], feedback: [], trend: [] };
  }
}
