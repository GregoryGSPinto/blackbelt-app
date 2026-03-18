import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

export type VideoStatus = 'processing' | 'ready' | 'failed';

export interface VideoAnnotation {
  id: string;
  video_id: string;
  author_id: string;
  author_name: string;
  timestamp_sec: number;
  type: 'circle' | 'arrow' | 'text';
  color: 'green' | 'red' | 'yellow';
  content: string;
  x: number;
  y: number;
  created_at: string;
}

export interface VideoAIAnalysis {
  overall_score: number;
  posture_score: number;
  balance_score: number;
  technique_score: number;
  summary: string;
  highlights: string[];
  corrections: string[];
  analyzed_at: string;
}

export interface TrainingVideoDTO {
  id: string;
  student_id: string;
  student_name: string;
  class_id: string;
  class_name: string;
  uploaded_by: string;
  uploaded_by_name: string;
  file_url: string;
  thumbnail_url: string;
  duration: number;
  file_size: number;
  status: VideoStatus;
  annotations: VideoAnnotation[];
  ai_analysis: VideoAIAnalysis | null;
  created_at: string;
  updated_at: string;
}

export interface UploadVideoPayload {
  student_id: string;
  class_id: string;
  uploaded_by: string;
  file: File;
}

export async function uploadTrainingVideo(payload: UploadVideoPayload): Promise<TrainingVideoDTO> {
  try {
    if (isMock()) {
      const { mockUploadTrainingVideo } = await import('@/lib/mocks/training-video.mock');
      return mockUploadTrainingVideo(payload);
    }
    // API not yet implemented — use mock
    const { mockUploadTrainingVideo } = await import('@/lib/mocks/training-video.mock');
      return mockUploadTrainingVideo(payload);
  } catch (error) { handleServiceError(error, 'trainingVideo.upload'); }
}

export async function listTrainingVideos(filters?: { student_id?: string; class_id?: string; professor_id?: string }): Promise<TrainingVideoDTO[]> {
  try {
    if (isMock()) {
      const { mockListTrainingVideos } = await import('@/lib/mocks/training-video.mock');
      return mockListTrainingVideos(filters);
    }
    // API not yet implemented — use mock
    const { mockListTrainingVideos } = await import('@/lib/mocks/training-video.mock');
      return mockListTrainingVideos(filters);
  } catch (error) { handleServiceError(error, 'trainingVideo.list'); }
}

export async function getTrainingVideoById(videoId: string): Promise<TrainingVideoDTO> {
  try {
    if (isMock()) {
      const { mockGetTrainingVideoById } = await import('@/lib/mocks/training-video.mock');
      return mockGetTrainingVideoById(videoId);
    }
    // API not yet implemented — use mock
    const { mockGetTrainingVideoById } = await import('@/lib/mocks/training-video.mock');
      return mockGetTrainingVideoById(videoId);
  } catch (error) { handleServiceError(error, 'trainingVideo.getById'); }
}

export async function deleteTrainingVideo(videoId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockDeleteTrainingVideo } = await import('@/lib/mocks/training-video.mock');
      return mockDeleteTrainingVideo(videoId);
    }
    try {
      const res = await fetch(`/api/training-videos/${videoId}`, { method: 'DELETE' });
      if (!res.ok) throw new ServiceError(res.status, 'trainingVideo.delete');
    } catch {
      console.warn('[training-video.deleteTrainingVideo] API not available, using fallback');
    }
  } catch (error) { handleServiceError(error, 'trainingVideo.delete'); }
}

export async function addAnnotation(videoId: string, annotation: Omit<VideoAnnotation, 'id' | 'video_id' | 'created_at'>): Promise<VideoAnnotation> {
  try {
    if (isMock()) {
      const { mockAddAnnotation } = await import('@/lib/mocks/training-video.mock');
      return mockAddAnnotation(videoId, annotation);
    }
    try {
      const res = await fetch(`/api/training-videos/${videoId}/annotations`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(annotation) });
      if (!res.ok) throw new ServiceError(res.status, 'trainingVideo.addAnnotation');
      return res.json();
    } catch {
      console.warn('[training-video.addAnnotation] API not available, using mock fallback');
      const { mockAddAnnotation } = await import('@/lib/mocks/training-video.mock');
      return mockAddAnnotation(videoId, annotation);
    }
  } catch (error) { handleServiceError(error, 'trainingVideo.addAnnotation'); }
}
