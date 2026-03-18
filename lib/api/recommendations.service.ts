import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

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
      const res = await fetch(`/api/recommendations?studentId=${studentId}`);
      if (!res.ok) throw new ServiceError(res.status, 'recommendations.get');
      return res.json();
    } catch {
      console.warn('[recommendations.getRecommendations] API not available, using fallback');
      return [];
    }
  } catch (error) { handleServiceError(error, 'recommendations.get'); }
}

export async function getPersonalizedFeed(studentId: string): Promise<ContentFeed> {
  try {
    if (isMock()) {
      const { mockGetPersonalizedFeed } = await import('@/lib/mocks/recommendations.mock');
      return mockGetPersonalizedFeed(studentId);
    }
    try {
      const res = await fetch(`/api/recommendations/feed?studentId=${studentId}`);
      if (!res.ok) throw new ServiceError(res.status, 'recommendations.feed');
      return res.json();
    } catch {
      console.warn('[recommendations.getPersonalizedFeed] API not available, using fallback');
      return { recommended: [], trending: [], continue_watching: [] } as unknown as ContentFeed;
    }
  } catch (error) { handleServiceError(error, 'recommendations.feed'); }
}
