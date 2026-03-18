import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
import type { Video, BeltLevel } from '@/lib/types';

export interface AdminVideoDTO {
  id: string;
  title: string;
  belt_level: BeltLevel;
  duration: number;
  views: number;
  created_at: string;
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
    try {
      const res = await fetch(`/api/admin/content/videos?academyId=${academyId}`);
      if (!res.ok) throw new ServiceError(res.status, 'adminContent.list');
      return res.json();
    } catch {
      console.warn('[admin-content.listAdminVideos] API not available, using mock fallback');
      const { mockListAdminVideos } = await import('@/lib/mocks/admin-content.mock');
      return mockListAdminVideos(academyId);
    }
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
