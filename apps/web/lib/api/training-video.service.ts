import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

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
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      // Insert video record (metadata only — actual file upload handled separately)
      const { data, error } = await supabase
        .from('videos')
        .insert({
          title: `Training video - ${new Date().toISOString()}`,
          description: `Training video for student ${payload.student_id}`,
          url: '',
          academy_id: (await supabase.auth.getUser()).data.user?.app_metadata?.academy_id ?? null,
          uploaded_by: payload.uploaded_by,
          upload_status: 'processing',
          file_size_bytes: payload.file.size,
          mime_type: payload.file.type,
          metadata: {
            student_id: payload.student_id,
            class_id: payload.class_id,
            type: 'training',
          },
        })
        .select()
        .single();

      if (error) {
        logServiceError(error, 'training-video');
        const { mockUploadTrainingVideo } = await import('@/lib/mocks/training-video.mock');
        return mockUploadTrainingVideo(payload);
      }

      return {
        id: data.id,
        student_id: payload.student_id,
        student_name: '',
        class_id: payload.class_id,
        class_name: '',
        uploaded_by: payload.uploaded_by,
        uploaded_by_name: '',
        file_url: data.url || '',
        thumbnail_url: data.thumbnail_storage_url || '',
        duration: data.duration || 0,
        file_size: data.file_size_bytes || 0,
        status: (data.upload_status as VideoStatus) || 'processing',
        annotations: [],
        ai_analysis: null,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (err) {
      logServiceError(err, 'training-video');
      const { mockUploadTrainingVideo } = await import('@/lib/mocks/training-video.mock');
      return mockUploadTrainingVideo(payload);
    }
  } catch (error) {
    logServiceError(error, 'training-video');
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
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      let query = supabase
        .from('videos')
        .select('*')
        .not('metadata->type', 'is', null)
        .eq('metadata->>type', 'training')
        .order('created_at', { ascending: false });

      if (filters?.student_id) {
        query = query.eq('metadata->>student_id', filters.student_id);
      }
      if (filters?.class_id) {
        query = query.eq('metadata->>class_id', filters.class_id);
      }
      if (filters?.professor_id) {
        query = query.eq('uploaded_by', filters.professor_id);
      }

      const { data, error } = await query;

      if (error) {
        logServiceError(error, 'training-video');
        return [];
      }

      return (data || []).map((row: Record<string, unknown>) => {
        const meta = (row.metadata as Record<string, unknown>) || {};
        const annotations = (meta.annotations as VideoAnnotation[]) || [];
        const aiAnalysis = (meta.ai_analysis as VideoAIAnalysis) || null;
        return {
          id: row.id,
          student_id: (meta.student_id as string) || '',
          student_name: (meta.student_name as string) || '',
          class_id: (meta.class_id as string) || '',
          class_name: (meta.class_name as string) || '',
          uploaded_by: row.uploaded_by || '',
          uploaded_by_name: (meta.uploaded_by_name as string) || '',
          file_url: row.url || row.storage_url || '',
          thumbnail_url: row.thumbnail_storage_url || '',
          duration: row.duration || 0,
          file_size: row.file_size_bytes || 0,
          status: (row.upload_status as VideoStatus) || 'ready',
          annotations,
          ai_analysis: aiAnalysis,
          created_at: row.created_at,
          updated_at: row.updated_at,
        };
      });
    } catch (err) {
      logServiceError(err, 'training-video');
      return [];
    }
  } catch (error) {
    logServiceError(error, 'training-video');
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
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', videoId)
        .single();

      if (error || !data) {
        logServiceError(error, 'training-video');
        const { mockGetTrainingVideoById } = await import('@/lib/mocks/training-video.mock');
        return mockGetTrainingVideoById(videoId);
      }

      // Also fetch annotations from video_annotations table
      const { data: annotationRows } = await supabase
        .from('video_annotations')
        .select('*')
        .eq('video_id', videoId)
        .order('created_at', { ascending: true });

      const meta = (data.metadata as Record<string, unknown>) || {};
      const annotations: VideoAnnotation[] = (annotationRows || []).map((a: Record<string, unknown>) => ({
        id: a.id,
        video_id: a.video_id,
        author_id: a.author_id,
        author_name: a.author_name || '',
        timestamp_sec: Number(a.timestamp_sec) || 0,
        type: a.type as VideoAnnotation['type'],
        color: a.color as VideoAnnotation['color'],
        content: a.content || '',
        x: Number(a.x) || 0,
        y: Number(a.y) || 0,
        created_at: a.created_at,
      }));
      const aiAnalysis = (meta.ai_analysis as VideoAIAnalysis) || null;

      return {
        id: data.id,
        student_id: (meta.student_id as string) || '',
        student_name: (meta.student_name as string) || '',
        class_id: (meta.class_id as string) || '',
        class_name: (meta.class_name as string) || '',
        uploaded_by: data.uploaded_by || '',
        uploaded_by_name: (meta.uploaded_by_name as string) || '',
        file_url: data.url || data.storage_url || '',
        thumbnail_url: data.thumbnail_storage_url || '',
        duration: data.duration || 0,
        file_size: data.file_size_bytes || 0,
        status: (data.upload_status as VideoStatus) || 'ready',
        annotations,
        ai_analysis: aiAnalysis,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (err) {
      logServiceError(err, 'training-video');
      const { mockGetTrainingVideoById } = await import('@/lib/mocks/training-video.mock');
      return mockGetTrainingVideoById(videoId);
    }
  } catch (error) {
    logServiceError(error, 'training-video');
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
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId);

      if (error) {
        logServiceError(error, 'training-video');
      }
    } catch (err) {
      logServiceError(err, 'training-video');
    }
  } catch (error) {
    logServiceError(error, 'training-video');
  }
}

export async function addAnnotation(videoId: string, annotation: Omit<VideoAnnotation, 'id' | 'video_id' | 'created_at'>): Promise<VideoAnnotation> {
  try {
    if (isMock()) {
      const { mockAddAnnotation } = await import('@/lib/mocks/training-video.mock');
      return mockAddAnnotation(videoId, annotation);
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      const { data, error } = await supabase
        .from('video_annotations')
        .insert({
          video_id: videoId,
          author_id: annotation.author_id,
          author_name: annotation.author_name,
          timestamp_sec: annotation.timestamp_sec,
          type: annotation.type,
          color: annotation.color,
          content: annotation.content,
          x: annotation.x,
          y: annotation.y,
        })
        .select()
        .single();

      if (error || !data) {
        logServiceError(error, 'training-video');
        const { mockAddAnnotation } = await import('@/lib/mocks/training-video.mock');
        return mockAddAnnotation(videoId, annotation);
      }

      return {
        id: data.id,
        video_id: data.video_id,
        author_id: data.author_id,
        author_name: data.author_name || '',
        timestamp_sec: Number(data.timestamp_sec) || 0,
        type: data.type as VideoAnnotation['type'],
        color: data.color as VideoAnnotation['color'],
        content: data.content || '',
        x: Number(data.x) || 0,
        y: Number(data.y) || 0,
        created_at: data.created_at,
      };
    } catch (err) {
      logServiceError(err, 'training-video');
      const { mockAddAnnotation } = await import('@/lib/mocks/training-video.mock');
      return mockAddAnnotation(videoId, annotation);
    }
  } catch (error) {
    logServiceError(error, 'training-video');
    return { id: '', video_id: videoId, created_at: new Date().toISOString(), ...annotation };
  }
}
