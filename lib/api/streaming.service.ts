import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
import type {
  StreamingLibrary,
  SeriesDetail,
  StreamingVideo,
  WatchProgress,
  StreamingSeries,
  EpisodeCompletionResult,
  QuizResult,
  StreamingTrail,
  TrailProgress,
  StreamingCertificate,
} from '@/lib/types/streaming';

export async function getLibrary(profileId: string, role: string, belt: string): Promise<StreamingLibrary> {
  try {
    if (isMock()) {
      const { mockGetLibrary } = await import('@/lib/mocks/streaming.mock');
      return mockGetLibrary(profileId, role, belt);
    }
    const res = await fetch(`/api/streaming/library?profileId=${profileId}&role=${role}&belt=${belt}`);
    if (!res.ok) throw new ServiceError(res.status, 'streaming.getLibrary');
    return res.json();
  } catch (error) {
    return handleServiceError(error, 'streaming.getLibrary');
  }
}

export async function getSeriesDetail(seriesId: string): Promise<SeriesDetail> {
  try {
    if (isMock()) {
      const { mockGetSeriesDetail } = await import('@/lib/mocks/streaming.mock');
      return mockGetSeriesDetail(seriesId);
    }
    const res = await fetch(`/api/streaming/series/${seriesId}`);
    if (!res.ok) throw new ServiceError(res.status, 'streaming.getSeriesDetail');
    return res.json();
  } catch (error) {
    return handleServiceError(error, 'streaming.getSeriesDetail');
  }
}

export async function getEpisode(episodeId: string): Promise<StreamingVideo> {
  try {
    if (isMock()) {
      const { mockGetEpisode } = await import('@/lib/mocks/streaming.mock');
      return mockGetEpisode(episodeId);
    }
    const res = await fetch(`/api/streaming/episodes/${episodeId}`);
    if (!res.ok) throw new ServiceError(res.status, 'streaming.getEpisode');
    return res.json();
  } catch (error) {
    return handleServiceError(error, 'streaming.getEpisode');
  }
}

export async function getContinueWatching(studentId: string): Promise<WatchProgress[]> {
  try {
    if (isMock()) {
      const { mockGetContinueWatching } = await import('@/lib/mocks/streaming.mock');
      return mockGetContinueWatching(studentId);
    }
    const res = await fetch(`/api/streaming/continue-watching?studentId=${studentId}`);
    if (!res.ok) throw new ServiceError(res.status, 'streaming.getContinueWatching');
    return res.json();
  } catch (error) {
    return handleServiceError(error, 'streaming.getContinueWatching');
  }
}

export async function getRecommended(studentId: string): Promise<StreamingSeries[]> {
  try {
    if (isMock()) {
      const { mockGetRecommended } = await import('@/lib/mocks/streaming.mock');
      return mockGetRecommended(studentId);
    }
    const res = await fetch(`/api/streaming/recommended?studentId=${studentId}`);
    if (!res.ok) throw new ServiceError(res.status, 'streaming.getRecommended');
    return res.json();
  } catch (error) {
    return handleServiceError(error, 'streaming.getRecommended');
  }
}

export async function trackProgress(studentId: string, episodeId: string, progressSeconds: number): Promise<void> {
  try {
    if (isMock()) {
      const { mockTrackProgress } = await import('@/lib/mocks/streaming.mock');
      return mockTrackProgress(studentId, episodeId, progressSeconds);
    }
    const res = await fetch('/api/streaming/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, episodeId, progressSeconds }),
    });
    if (!res.ok) throw new ServiceError(res.status, 'streaming.trackProgress');
  } catch (error) {
    handleServiceError(error, 'streaming.trackProgress');
  }
}

export async function completeEpisode(studentId: string, episodeId: string): Promise<EpisodeCompletionResult> {
  try {
    if (isMock()) {
      const { mockCompleteEpisode } = await import('@/lib/mocks/streaming.mock');
      return mockCompleteEpisode(studentId, episodeId);
    }
    const res = await fetch('/api/streaming/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, episodeId }),
    });
    if (!res.ok) throw new ServiceError(res.status, 'streaming.completeEpisode');
    return res.json();
  } catch (error) {
    return handleServiceError(error, 'streaming.completeEpisode');
  }
}

export async function submitQuiz(studentId: string, episodeId: string, answers: number[]): Promise<QuizResult> {
  try {
    if (isMock()) {
      const { mockSubmitQuiz } = await import('@/lib/mocks/streaming.mock');
      return mockSubmitQuiz(studentId, episodeId, answers);
    }
    const res = await fetch('/api/streaming/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, episodeId, answers }),
    });
    if (!res.ok) throw new ServiceError(res.status, 'streaming.submitQuiz');
    return res.json();
  } catch (error) {
    return handleServiceError(error, 'streaming.submitQuiz');
  }
}

export async function getTrails(academyId: string, belt?: string): Promise<StreamingTrail[]> {
  try {
    if (isMock()) {
      const { mockGetTrails } = await import('@/lib/mocks/streaming.mock');
      return mockGetTrails(academyId, belt);
    }
    const params = new URLSearchParams({ academyId });
    if (belt) params.append('belt', belt);
    const res = await fetch(`/api/streaming/trails?${params.toString()}`);
    if (!res.ok) throw new ServiceError(res.status, 'streaming.getTrails');
    return res.json();
  } catch (error) {
    return handleServiceError(error, 'streaming.getTrails');
  }
}

export async function getTrailProgress(studentId: string, trailId: string): Promise<TrailProgress> {
  try {
    if (isMock()) {
      const { mockGetTrailProgress } = await import('@/lib/mocks/streaming.mock');
      return mockGetTrailProgress(studentId, trailId);
    }
    const res = await fetch(`/api/streaming/trails/${trailId}/progress?studentId=${studentId}`);
    if (!res.ok) throw new ServiceError(res.status, 'streaming.getTrailProgress');
    return res.json();
  } catch (error) {
    return handleServiceError(error, 'streaming.getTrailProgress');
  }
}

export async function generateCertificate(studentId: string, trailId: string): Promise<StreamingCertificate> {
  try {
    if (isMock()) {
      const { mockGenerateCertificate } = await import('@/lib/mocks/streaming.mock');
      return mockGenerateCertificate(studentId, trailId);
    }
    const res = await fetch('/api/streaming/certificate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, trailId }),
    });
    if (!res.ok) throw new ServiceError(res.status, 'streaming.generateCertificate');
    return res.json();
  } catch (error) {
    return handleServiceError(error, 'streaming.generateCertificate');
  }
}
