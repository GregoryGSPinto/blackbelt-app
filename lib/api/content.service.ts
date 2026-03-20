import { isMock } from '@/lib/env';
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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    let query = supabase.from('videos').select('*').eq('academy_id', academyId);
    if (filters?.belt) query = query.eq('belt_level', filters.belt);
    if (filters?.modality) query = query.eq('modality', filters.modality);
    if (filters?.search) query = query.ilike('title', `%${filters.search}%`);
    const { data, error } = await query;
    if (error || !data) {
      console.warn('[listVideos] Supabase error:', error?.message);
      return [];
    }
    return data as unknown as VideoCardDTO[];
  } catch (error) {
    console.warn('[listVideos] Fallback:', error);
    return [];
  }
}

export async function getVideo(id: string): Promise<VideoDetail> {
  try {
    if (isMock()) {
      const { mockGetVideo } = await import('@/lib/mocks/content.mock');
      return mockGetVideo(id);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) {
      console.warn('[getVideo] Supabase error:', error?.message);
      return {} as VideoDetail;
    }
    return data as unknown as VideoDetail;
  } catch (error) {
    console.warn('[getVideo] Fallback:', error);
    return {} as VideoDetail;
  }
}

export async function getSeries(academyId: string): Promise<SeriesDTO[]> {
  try {
    if (isMock()) {
      const { mockGetSeries } = await import('@/lib/mocks/content.mock');
      return mockGetSeries(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('video_series')
      .select('*')
      .eq('academy_id', academyId);
    if (error || !data) {
      console.warn('[getSeries] Supabase error:', error?.message);
      return [];
    }
    return data as unknown as SeriesDTO[];
  } catch (error) {
    console.warn('[getSeries] Fallback:', error);
    return [];
  }
}
