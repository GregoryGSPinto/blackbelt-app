import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
import type { BeltLevel, Video } from '@/lib/types';

export interface VideoFilters {
  belt?: BeltLevel;
  modality?: string;
  search?: string;
}

export interface VideoDetail extends Video {
  description: string;
  professor_name: string;
  modality_name: string;
  related_videos: VideoCardDTO[];
  series_id?: string;
  series_title?: string;
  episode_number?: number;
  total_episodes?: number;
}

export interface VideoCardDTO {
  id: string;
  title: string;
  duration: number;
  belt_level: BeltLevel;
  thumbnail_color: string;
  professor_name: string;
  progress?: number;
  is_locked: boolean;
}

export interface SeriesDTO {
  id: string;
  title: string;
  video_count: number;
  belt_level: BeltLevel;
  thumbnail_color: string;
}

export async function listVideos(academyId: string, filters?: VideoFilters): Promise<VideoCardDTO[]> {
  try {
    if (isMock()) {
      const { mockListVideos } = await import('@/lib/mocks/content.mock');
      return mockListVideos(academyId, filters);
    }
    try {
      const params = new URLSearchParams({ academyId });
      if (filters?.belt) params.set('belt', filters.belt);
      if (filters?.modality) params.set('modality', filters.modality);
      if (filters?.search) params.set('search', filters.search);
      const res = await fetch(`/api/content/videos?${params}`);
      if (!res.ok) throw new ServiceError(res.status, 'content.listVideos');
      return res.json();
    } catch {
      console.warn('[content.listVideos] API not available, using mock fallback');
      const { mockListVideos } = await import('@/lib/mocks/content.mock');
      return mockListVideos(academyId, filters);
    }
  } catch (error) {
    handleServiceError(error, 'content.listVideos');
  }
}

export async function getVideo(id: string): Promise<VideoDetail> {
  try {
    if (isMock()) {
      const { mockGetVideo } = await import('@/lib/mocks/content.mock');
      return mockGetVideo(id);
    }
    try {
      const res = await fetch(`/api/content/videos/${id}`);
      if (!res.ok) throw new ServiceError(res.status, 'content.getVideo');
      return res.json();
    } catch {
      console.warn('[content.getVideo] API not available, using mock fallback');
      const { mockGetVideo } = await import('@/lib/mocks/content.mock');
      return mockGetVideo(id);
    }
  } catch (error) {
    handleServiceError(error, 'content.getVideo');
  }
}

export async function getSeries(academyId: string): Promise<SeriesDTO[]> {
  try {
    if (isMock()) {
      const { mockGetSeries } = await import('@/lib/mocks/content.mock');
      return mockGetSeries(academyId);
    }
    try {
      const res = await fetch(`/api/content/series?academyId=${academyId}`);
      if (!res.ok) throw new ServiceError(res.status, 'content.getSeries');
      return res.json();
    } catch {
      console.warn('[content.getSeries] API not available, using mock fallback');
      const { mockGetSeries } = await import('@/lib/mocks/content.mock');
      return mockGetSeries(academyId);
    }
  } catch (error) {
    handleServiceError(error, 'content.getSeries');
  }
}
