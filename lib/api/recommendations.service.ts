import { isMock } from '@/lib/env';

export interface RecommendedVideo {
  id: string;
  title: string;
  duration: number;
  reason: string;
  score: number;
}

export interface ContentFeed {
  recommended: RecommendedVideo[];
  newContent: RecommendedVideo[];
  trending: RecommendedVideo[];
  completeSeries: RecommendedVideo[];
}

export async function getRecommendations(studentId: string): Promise<RecommendedVideo[]> {
  try {
    if (isMock()) {
      const { mockGetRecommendations } = await import('@/lib/mocks/recommendations.mock');
      return mockGetRecommendations(studentId);
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from('content_videos')
        .select('id, title, duration_seconds')
        .order('views_count', { ascending: false })
        .limit(10);
      if (error || !data) {
        console.error('[getRecommendations] Query failed:', error?.message);
        return [];
      }
      return (data ?? []).map((row: Record<string, unknown>, idx: number) => ({
        id: (row.id as string) || '',
        title: (row.title as string) || '',
        duration: (row.duration_seconds as number) || 0,
        reason: 'Conteúdo popular',
        score: 100 - idx * 5,
      }));
    } catch {
      console.error('[recommendations.getRecommendations] API not available, returning empty');
      return [];
    }
  } catch (error) {
    console.error('[getRecommendations] Fallback:', error);
    return [];
  }
}

export async function getPersonalizedFeed(studentId: string): Promise<ContentFeed> {
  try {
    if (isMock()) {
      const { mockGetPersonalizedFeed } = await import('@/lib/mocks/recommendations.mock');
      return mockGetPersonalizedFeed(studentId);
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from('content_videos')
        .select('id, title, duration_seconds, created_at')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error || !data) {
        console.error('[getPersonalizedFeed] Query failed:', error?.message);
        return { recommended: [], newContent: [], trending: [], completeSeries: [] };
      }
      const vids = (data ?? []).map((row: Record<string, unknown>, idx: number) => ({
        id: (row.id as string) || '',
        title: (row.title as string) || '',
        duration: (row.duration_seconds as number) || 0,
        reason: 'Novo conteúdo',
        score: 100 - idx * 3,
      }));
      return {
        recommended: vids.slice(0, 5),
        newContent: vids.slice(5, 10),
        trending: vids.slice(10, 15),
        completeSeries: vids.slice(15, 20),
      };
    } catch {
      console.error('[recommendations.getPersonalizedFeed] API not available, returning empty');
      return { recommended: [], newContent: [], trending: [], completeSeries: [] };
    }
  } catch (error) {
    console.error('[getPersonalizedFeed] Fallback:', error);
    return { recommended: [], newContent: [], trending: [], completeSeries: [] };
  }
}
