import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

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

export async function getLiveMatches(championshipId: string): Promise<LiveMatchDTO[]> {
  try {
    if (isMock()) {
      const { mockGetLiveMatches } = await import('@/lib/mocks/championship-live.mock');
      return mockGetLiveMatches(championshipId);
    }
    // API not yet implemented — use mock
    const { mockGetLiveMatches } = await import('@/lib/mocks/championship-live.mock');
      return mockGetLiveMatches(championshipId);
  } catch (error) { handleServiceError(error, 'championship-live.liveMatches'); }
}

export async function getResults(championshipId: string, categoryId?: string): Promise<CategoryResultDTO[]> {
  try {
    if (isMock()) {
      const { mockGetResults } = await import('@/lib/mocks/championship-live.mock');
      return mockGetResults(championshipId, categoryId);
    }
    // API not yet implemented — use mock
    const { mockGetResults } = await import('@/lib/mocks/championship-live.mock');
      return mockGetResults(championshipId, categoryId);
  } catch (error) { handleServiceError(error, 'championship-live.results'); }
}

export async function getMedalTable(championshipId: string): Promise<MedalTableEntry[]> {
  try {
    if (isMock()) {
      const { mockGetMedalTable } = await import('@/lib/mocks/championship-live.mock');
      return mockGetMedalTable(championshipId);
    }
    // API not yet implemented — use mock
    const { mockGetMedalTable } = await import('@/lib/mocks/championship-live.mock');
      return mockGetMedalTable(championshipId);
  } catch (error) { handleServiceError(error, 'championship-live.medalTable'); }
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
