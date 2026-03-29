import { isMock } from '@/lib/env';
import type { Video, BeltLevel } from '@/lib/types';
import { logServiceError } from '@/lib/api/errors';

export interface AdminVideoDTO {
  id: string;
  title: string;
  belt_level: BeltLevel;
  duration: number;
  views: number;
  likes: number;
  professor_name: string;
  modality: string;
  status: 'published' | 'draft' | 'processing';
  thumbnail_url: string;
  created_at: string;
}

export interface AdminStorageStats {
  total_videos: number;
  total_size_gb: number;
  limit_gb: number;
  usage_percent: number;
}

export interface CreateVideoRequest {
  title: string;
  description: string;
  url: string;
  belt_level: BeltLevel;
  modality: string;
  duration: number;
}

export async function listAdminVideos(academyId: string): Promise<AdminVideoDTO[]> {
  try {
    if (isMock()) {
      const { mockListAdminVideos } = await import('@/lib/mocks/admin-content.mock');
      return mockListAdminVideos(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('academy_id', academyId)
      .order('created_at', { ascending: false });
    if (error) {
      logServiceError(error, 'admin-content');
      return [];
    }
    return (data ?? []) as unknown as AdminVideoDTO[];
  } catch (error) {
    logServiceError(error, 'admin-content');
    return [];
  }
}

export async function createVideo(data: CreateVideoRequest): Promise<Video> {
  try {
    if (isMock()) {
      const { mockCreateVideo } = await import('@/lib/mocks/admin-content.mock');
      return mockCreateVideo(data);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: row, error } = await supabase
      .from('videos')
      .insert({ ...data, status: 'draft' })
      .select()
      .single();
    if (error || !row) {
      logServiceError(error, 'admin-content');
      const { mockCreateVideo } = await import('@/lib/mocks/admin-content.mock');
      return mockCreateVideo(data);
    }
    return row as unknown as Video;
  } catch (error) {
    logServiceError(error, 'admin-content');
    const { mockCreateVideo } = await import('@/lib/mocks/admin-content.mock');
    return mockCreateVideo(data);
  }
}

export async function deleteVideo(id: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockDeleteVideo } = await import('@/lib/mocks/admin-content.mock');
      return mockDeleteVideo(id);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', id);
    if (error) {
      logServiceError(error, 'admin-content');
    }
  } catch (error) {
    logServiceError(error, 'admin-content');
  }
}

export async function togglePublish(id: string, publish: boolean): Promise<void> {
  try {
    if (isMock()) {
      const { mockTogglePublish } = await import('@/lib/mocks/admin-content.mock');
      return mockTogglePublish(id, publish);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from('videos')
      .update({ status: publish ? 'published' : 'draft' })
      .eq('id', id);
    if (error) {
      logServiceError(error, 'admin-content');
    }
  } catch (error) {
    logServiceError(error, 'admin-content');
  }
}

export async function getAdminStorageStats(academyId: string): Promise<AdminStorageStats> {
  try {
    if (isMock()) {
      const { mockGetAdminStorageStats } = await import('@/lib/mocks/admin-content.mock');
      return mockGetAdminStorageStats(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('storage_stats')
      .select('*')
      .eq('academy_id', academyId)
      .maybeSingle();
    if (error || !data) {
      logServiceError(error, 'admin-content');
      return { total_videos: 0, total_size_gb: 0, limit_gb: 50, usage_percent: 0 };
    }
    return data as AdminStorageStats;
  } catch (error) {
    logServiceError(error, 'admin-content');
    return { total_videos: 0, total_size_gb: 0, limit_gb: 50, usage_percent: 0 };
  }
}
