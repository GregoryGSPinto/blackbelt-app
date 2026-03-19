import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
import type { Video, BeltLevel } from '@/lib/types';

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
    // API not yet implemented — use mock
    const { mockListAdminVideos } = await import('@/lib/mocks/admin-content.mock');
      return mockListAdminVideos(academyId);
  } catch (error) {
    handleServiceError(error, 'adminContent.list');
  }
}

export async function createVideo(data: CreateVideoRequest): Promise<Video> {
  try {
    if (isMock()) {
      const { mockCreateVideo } = await import('@/lib/mocks/admin-content.mock');
      return mockCreateVideo(data);
    }
    try {
      const res = await fetch('/api/admin/content/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new ServiceError(res.status, 'adminContent.create');
      return res.json();
    } catch {
      console.warn('[admin-content.createVideo] API not available, using mock fallback');
      const { mockCreateVideo } = await import('@/lib/mocks/admin-content.mock');
      return mockCreateVideo(data);
    }
  } catch (error) {
    handleServiceError(error, 'adminContent.create');
  }
}

export async function deleteVideo(id: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockDeleteVideo } = await import('@/lib/mocks/admin-content.mock');
      return mockDeleteVideo(id);
    }
    try {
      const res = await fetch(`/api/admin/content/videos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new ServiceError(res.status, 'adminContent.delete');
    } catch {
      console.warn('[admin-content.deleteVideo] API not available, using fallback');
    }
  } catch (error) {
    handleServiceError(error, 'adminContent.delete');
  }
}

export async function togglePublish(id: string, publish: boolean): Promise<void> {
  try {
    if (isMock()) {
      const { mockTogglePublish } = await import('@/lib/mocks/admin-content.mock');
      return mockTogglePublish(id, publish);
    }
    const res = await fetch(`/api/admin/content/videos/${id}/${publish ? 'publish' : 'unpublish'}`, { method: 'POST' });
    if (!res.ok) throw new ServiceError(res.status, 'adminContent.togglePublish');
  } catch (error) {
    handleServiceError(error, 'adminContent.togglePublish');
  }
}

export async function getAdminStorageStats(academyId: string): Promise<AdminStorageStats> {
  try {
    if (isMock()) {
      const { mockGetAdminStorageStats } = await import('@/lib/mocks/admin-content.mock');
      return mockGetAdminStorageStats(academyId);
    }
    const { mockGetAdminStorageStats } = await import('@/lib/mocks/admin-content.mock');
    return mockGetAdminStorageStats(academyId);
  } catch (error) {
    handleServiceError(error, 'adminContent.storageStats');
  }
}
