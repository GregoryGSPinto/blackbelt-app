import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

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
    // API not yet implemented — use mock
    const { mockGetRecommendations } = await import('@/lib/mocks/recommendations.mock');
      return mockGetRecommendations(studentId);
  } catch (error) { handleServiceError(error, 'recommendations.get'); }
}

export async function getPersonalizedFeed(studentId: string): Promise<ContentFeed> {
  try {
    if (isMock()) {
      const { mockGetPersonalizedFeed } = await import('@/lib/mocks/recommendations.mock');
      return mockGetPersonalizedFeed(studentId);
    }
    // API not yet implemented — use mock
    const { mockGetPersonalizedFeed } = await import('@/lib/mocks/recommendations.mock');
      return mockGetPersonalizedFeed(studentId);
  } catch (error) { handleServiceError(error, 'recommendations.feed'); }
}
