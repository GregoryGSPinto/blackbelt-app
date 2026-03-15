import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
import type { BeltLevel } from '@/lib/types';

// ────────────────────────────────────────────────────────────
// DTOs
// ────────────────────────────────────────────────────────────

export interface StreamingVideoCard {
  id: string;
  title: string;
  thumbnail_url: string;
  thumbnail_color: string;
  duration_minutes: number;
  professor_name: string;
  professor_avatar: string | null;
  belt_level: BeltLevel;
  modality: string;
  progress_percent: number;
  is_locked: boolean;
  lock_reason: string | null;
}

export interface StreamingSection {
  id: string;
  title: string;
  type: 'continue' | 'recommended' | 'trail' | 'modality' | 'professor' | 'home_training';
  videos: StreamingVideoCard[];
}

export interface TrailDTO {
  id: string;
  academy_id: string;
  title: string;
  description: string;
  thumbnail_color: string;
  belt_level: BeltLevel;
  total_videos: number;
  completed_videos: number;
  is_completed: boolean;
}

export interface VideoProgressDTO {
  video_id: string;
  student_id: string;
  progress_percent: number;
  last_watched_at: string;
  completed: boolean;
}

// ────────────────────────────────────────────────────────────
// Service functions
// ────────────────────────────────────────────────────────────

export async function getStreamingHome(studentId: string): Promise<StreamingSection[]> {
  try {
    if (isMock()) {
      const { mockGetStreamingHome } = await import('@/lib/mocks/streaming.mock');
      return mockGetStreamingHome(studentId);
    }
    const res = await fetch(`/api/streaming/home?studentId=${studentId}`);
    if (!res.ok) throw new ServiceError(res.status, 'streaming.getHome');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'streaming.getHome');
  }
}

export async function getVideoProgress(studentId: string, videoId: string): Promise<VideoProgressDTO> {
  try {
    if (isMock()) {
      const { mockGetVideoProgress } = await import('@/lib/mocks/streaming.mock');
      return mockGetVideoProgress(studentId, videoId);
    }
    const res = await fetch(`/api/streaming/progress?studentId=${studentId}&videoId=${videoId}`);
    if (!res.ok) throw new ServiceError(res.status, 'streaming.getProgress');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'streaming.getProgress');
  }
}

export async function getTrails(academyId: string): Promise<TrailDTO[]> {
  try {
    if (isMock()) {
      const { mockGetTrails } = await import('@/lib/mocks/streaming.mock');
      return mockGetTrails(academyId);
    }
    const res = await fetch(`/api/streaming/trails?academyId=${academyId}`);
    if (!res.ok) throw new ServiceError(res.status, 'streaming.getTrails');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'streaming.getTrails');
  }
}
