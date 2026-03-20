import { isMock } from '@/lib/env';

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
    try {
      const formData = new FormData();
      formData.append('file', payload.file);
      formData.append('student_id', payload.student_id);
      formData.append('class_id', payload.class_id);
      formData.append('uploaded_by', payload.uploaded_by);
      const res = await fetch('/api/training-videos', { method: 'POST', body: formData });
      if (!res.ok) {
        console.warn('[uploadTrainingVideo] API error:', res.status);
        const { mockUploadTrainingVideo } = await import('@/lib/mocks/training-video.mock');
        return mockUploadTrainingVideo(payload);
      }
      return res.json();
    } catch {
      console.warn('[training-video.uploadTrainingVideo] API not available, using mock fallback');
      const { mockUploadTrainingVideo } = await import('@/lib/mocks/training-video.mock');
      return mockUploadTrainingVideo(payload);
    }
  } catch (error) {
    console.warn('[uploadTrainingVideo] Fallback:', error);
    return { id: '', student_id: '', student_name: '', class_id: '', class_name: '', uploaded_by: '', uploaded_by_name: '', file_url: '', thumbnail_url: '', duration: 0, file_size: 0, status: 'processing', annotations: [], ai_analysis: null, created_at: '', updated_at: '' };
  }
}

export async function listTrainingVideos(filters?: { student_id?: string; class_id?: string; professor_id?: string }): Promise<TrainingVideoDTO[]> {
  try {
    if (isMock()) {
      const { mockListTrainingVideos } = await import('@/lib/mocks/training-video.mock');
      return mockListTrainingVideos(filters);
    }
    try {
      const params = new URLSearchParams();
      if (filters?.student_id) params.set('student_id', filters.student_id);
      if (filters?.class_id) params.set('class_id', filters.class_id);
      if (filters?.professor_id) params.set('professor_id', filters.professor_id);
      const res = await fetch(`/api/training-videos?${params}`);
      if (!res.ok) {
        console.warn('[listTrainingVideos] API error:', res.status);
        return [];
      }
      return res.json();
    } catch {
      console.warn('[training-video.listTrainingVideos] API not available, returning empty');
      return [];
    }
  } catch (error) {
    console.warn('[listTrainingVideos] Fallback:', error);
    return [];
  }
}

export async function getTrainingVideoById(videoId: string): Promise<TrainingVideoDTO> {
  try {
    if (isMock()) {
      const { mockGetTrainingVideoById } = await import('@/lib/mocks/training-video.mock');
      return mockGetTrainingVideoById(videoId);
    }
    try {
      const res = await fetch(`/api/training-videos/${videoId}`);
      if (!res.ok) {
        console.warn('[getTrainingVideoById] API error:', res.status);
        const { mockGetTrainingVideoById } = await import('@/lib/mocks/training-video.mock');
        return mockGetTrainingVideoById(videoId);
      }
      return res.json();
    } catch {
      console.warn('[training-video.getTrainingVideoById] API not available, using mock fallback');
      const { mockGetTrainingVideoById } = await import('@/lib/mocks/training-video.mock');
      return mockGetTrainingVideoById(videoId);
    }
  } catch (error) {
    console.warn('[getTrainingVideoById] Fallback:', error);
    return { id: videoId, student_id: '', student_name: '', class_id: '', class_name: '', uploaded_by: '', uploaded_by_name: '', file_url: '', thumbnail_url: '', duration: 0, file_size: 0, status: 'processing', annotations: [], ai_analysis: null, created_at: '', updated_at: '' };
  }
}

export async function deleteTrainingVideo(videoId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockDeleteTrainingVideo } = await import('@/lib/mocks/training-video.mock');
      return mockDeleteTrainingVideo(videoId);
    }
    try {
      const res = await fetch(`/api/training-videos/${videoId}`, { method: 'DELETE' });
      if (!res.ok) {
        console.warn('[deleteTrainingVideo] API error:', res.status);
      }
    } catch {
      console.warn('[training-video.deleteTrainingVideo] API not available, using fallback');
    }
  } catch (error) {
    console.warn('[deleteTrainingVideo] Fallback:', error);
  }
}

export async function addAnnotation(videoId: string, annotation: Omit<VideoAnnotation, 'id' | 'video_id' | 'created_at'>): Promise<VideoAnnotation> {
  try {
    if (isMock()) {
      const { mockAddAnnotation } = await import('@/lib/mocks/training-video.mock');
      return mockAddAnnotation(videoId, annotation);
    }
    try {
      const res = await fetch(`/api/training-videos/${videoId}/annotations`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(annotation) });
      if (!res.ok) {
        console.warn('[addAnnotation] API error:', res.status);
        const { mockAddAnnotation } = await import('@/lib/mocks/training-video.mock');
        return mockAddAnnotation(videoId, annotation);
      }
      return res.json();
    } catch {
      console.warn('[training-video.addAnnotation] API not available, using mock fallback');
      const { mockAddAnnotation } = await import('@/lib/mocks/training-video.mock');
      return mockAddAnnotation(videoId, annotation);
    }
  } catch (error) {
    console.warn('[addAnnotation] Fallback:', error);
    return { id: '', video_id: videoId, created_at: new Date().toISOString(), ...annotation };
  }
}
