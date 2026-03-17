import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';
import type {
  ExtractedVideoInfo,
  VideoFormData,
  SeriesFormData,
  TrailFormData,
  AcademicMaterial,
  AcademicMaterialInput,
  ContentStats,
  VideoAnalytics,
  ContentVideo,
  QuizQuestionInput,
} from '@/lib/types/content-management';
import type {
  StreamingSeries,
  StreamingTrail,
  QuizQuestion,
} from '@/lib/types/streaming';

// ── Video extraction ────────────────────────────────────────────────

export async function extractVideoInfo(url: string): Promise<ExtractedVideoInfo> {
  try {
    if (isMock()) {
      const { mockExtractVideoInfo } = await import('@/lib/mocks/content-management.mock');
      return mockExtractVideoInfo(url);
    }
    console.warn('[content.extractVideoInfo] fallback — not yet connected to Supabase');
    return { source: 'youtube', source_url: url, embed_url: '', source_video_id: '', thumbnail_url: '', duration_seconds: 0, original_title: '' } as ExtractedVideoInfo;
  } catch (error) {
    handleServiceError(error, 'content.extractVideoInfo');
  }
}

// ── CRUD Videos ─────────────────────────────────────────────────────

export async function createVideo(
  academyId: string,
  professorId: string,
  data: VideoFormData,
): Promise<ContentVideo> {
  try {
    if (isMock()) {
      const { mockCreateVideo } = await import('@/lib/mocks/content-management.mock');
      return mockCreateVideo(academyId, professorId, data);
    }
    console.warn('[content.createVideo] fallback — not yet connected to Supabase');
    return { id: '', title: '', description: '', source: 'youtube', source_url: '', embed_url: '', source_video_id: '', thumbnail_url: '', duration_seconds: 0, original_title: '', modality: '', min_belt: '', tags: [], series_id: null, series_title: null, order: 0, is_published: false, is_free: false, professor_id: professorId, professor_name: '', views: 0, completions: 0, quiz_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as ContentVideo;
  } catch (error) {
    handleServiceError(error, 'content.createVideo');
  }
}

export async function updateVideo(
  videoId: string,
  updates: Partial<VideoFormData>,
): Promise<ContentVideo> {
  try {
    if (isMock()) {
      const { mockUpdateVideo } = await import('@/lib/mocks/content-management.mock');
      return mockUpdateVideo(videoId, updates);
    }
    console.warn('[content.updateVideo] fallback — not yet connected to Supabase');
    return { id: videoId, title: '', description: '', source: 'youtube', source_url: '', embed_url: '', source_video_id: '', thumbnail_url: '', duration_seconds: 0, original_title: '', modality: '', min_belt: '', tags: [], series_id: null, series_title: null, order: 0, is_published: false, is_free: false, professor_id: '', professor_name: '', views: 0, completions: 0, quiz_count: 0, created_at: '', updated_at: new Date().toISOString() } as ContentVideo;
  } catch (error) {
    handleServiceError(error, 'content.updateVideo');
  }
}

export async function deleteVideo(videoId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockDeleteVideo } = await import('@/lib/mocks/content-management.mock');
      return mockDeleteVideo(videoId);
    }
    console.warn('[content.deleteVideo] fallback — not yet connected to Supabase');
    return;
  } catch (error) {
    handleServiceError(error, 'content.deleteVideo');
  }
}

export async function listVideos(
  academyId: string,
  filters?: {
    modality?: string;
    min_belt?: string;
    series_id?: string;
    is_published?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  },
): Promise<{ videos: ContentVideo[]; total: number }> {
  try {
    if (isMock()) {
      const { mockListVideos } = await import('@/lib/mocks/content-management.mock');
      return mockListVideos(academyId, filters);
    }
    console.warn('[content.listVideos] fallback — not yet connected to Supabase');
    return { videos: [], total: 0 };
  } catch (error) {
    handleServiceError(error, 'content.listVideos');
  }
}

export async function publishVideo(videoId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockPublishVideo } = await import('@/lib/mocks/content-management.mock');
      return mockPublishVideo(videoId);
    }
    console.warn('[content.publishVideo] fallback — not yet connected to Supabase');
    return;
  } catch (error) {
    handleServiceError(error, 'content.publishVideo');
  }
}

export async function unpublishVideo(videoId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockUnpublishVideo } = await import('@/lib/mocks/content-management.mock');
      return mockUnpublishVideo(videoId);
    }
    console.warn('[content.unpublishVideo] fallback — not yet connected to Supabase');
    return;
  } catch (error) {
    handleServiceError(error, 'content.unpublishVideo');
  }
}

export async function duplicateVideo(videoId: string): Promise<ContentVideo> {
  try {
    if (isMock()) {
      const { mockDuplicateVideo } = await import('@/lib/mocks/content-management.mock');
      return mockDuplicateVideo(videoId);
    }
    console.warn('[content.duplicateVideo] fallback — not yet connected to Supabase');
    return { id: '', title: '', description: '', source: 'youtube', source_url: '', embed_url: '', source_video_id: '', thumbnail_url: '', duration_seconds: 0, original_title: '', modality: '', min_belt: '', tags: [], series_id: null, series_title: null, order: 0, is_published: false, is_free: false, professor_id: '', professor_name: '', views: 0, completions: 0, quiz_count: 0, created_at: '', updated_at: '' } as ContentVideo;
  } catch (error) {
    handleServiceError(error, 'content.duplicateVideo');
  }
}

// ── CRUD Series ─────────────────────────────────────────────────────

export async function createSeries(
  academyId: string,
  professorId: string,
  data: SeriesFormData,
): Promise<StreamingSeries> {
  try {
    if (isMock()) {
      const { mockCreateSeries } = await import('@/lib/mocks/content-management.mock');
      return mockCreateSeries(academyId, professorId, data);
    }
    console.warn('[content.createSeries] fallback — not yet connected to Supabase');
    return { id: '', title: '', description: '', thumbnail_url: '', gradient_css: '', professor_id: professorId, professor_name: '', modality: '', min_belt: '', videos: [], total_duration: '0', category: 'fundamentos', tags: [] } as StreamingSeries;
  } catch (error) {
    handleServiceError(error, 'content.createSeries');
  }
}

export async function updateSeries(
  seriesId: string,
  updates: Partial<SeriesFormData>,
): Promise<StreamingSeries> {
  try {
    if (isMock()) {
      const { mockUpdateSeries } = await import('@/lib/mocks/content-management.mock');
      return mockUpdateSeries(seriesId, updates);
    }
    console.warn('[content.updateSeries] fallback — not yet connected to Supabase');
    return { id: seriesId, title: '', description: '', thumbnail_url: '', gradient_css: '', professor_id: '', professor_name: '', modality: '', min_belt: '', videos: [], total_duration: '0', category: 'fundamentos', tags: [] } as StreamingSeries;
  } catch (error) {
    handleServiceError(error, 'content.updateSeries');
  }
}

export async function deleteSeries(seriesId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockDeleteSeries } = await import('@/lib/mocks/content-management.mock');
      return mockDeleteSeries(seriesId);
    }
    console.warn('[content.deleteSeries] fallback — not yet connected to Supabase');
    return;
  } catch (error) {
    handleServiceError(error, 'content.deleteSeries');
  }
}

export async function listSeries(
  academyId: string,
  _filters?: { modality?: string },
): Promise<StreamingSeries[]> {
  try {
    if (isMock()) {
      const { mockListSeries } = await import('@/lib/mocks/content-management.mock');
      return mockListSeries(academyId);
    }
    console.warn('[content.listSeries] fallback — not yet connected to Supabase');
    return [];
  } catch (error) {
    handleServiceError(error, 'content.listSeries');
  }
}

// ── CRUD Trails ─────────────────────────────────────────────────────

export async function createTrail(
  academyId: string,
  data: TrailFormData,
): Promise<StreamingTrail> {
  try {
    if (isMock()) {
      const { mockCreateTrail } = await import('@/lib/mocks/content-management.mock');
      return mockCreateTrail(academyId, data);
    }
    console.warn('[content.createTrail] fallback — not yet connected to Supabase');
    return { id: '', name: '', description: '', gradient_css: '', series: [], total_videos: 0, total_duration: '0', min_belt: '', certificate_available: false } as StreamingTrail;
  } catch (error) {
    handleServiceError(error, 'content.createTrail');
  }
}

export async function updateTrail(
  trailId: string,
  updates: Partial<TrailFormData>,
): Promise<StreamingTrail> {
  try {
    if (isMock()) {
      const { mockUpdateTrail } = await import('@/lib/mocks/content-management.mock');
      return mockUpdateTrail(trailId, updates);
    }
    console.warn('[content.updateTrail] fallback — not yet connected to Supabase');
    return { id: trailId, name: '', description: '', gradient_css: '', series: [], total_videos: 0, total_duration: '0', min_belt: '', certificate_available: false } as StreamingTrail;
  } catch (error) {
    handleServiceError(error, 'content.updateTrail');
  }
}

export async function deleteTrail(trailId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockDeleteTrail } = await import('@/lib/mocks/content-management.mock');
      return mockDeleteTrail(trailId);
    }
    console.warn('[content.deleteTrail] fallback — not yet connected to Supabase');
    return;
  } catch (error) {
    handleServiceError(error, 'content.deleteTrail');
  }
}

export async function listTrails(academyId: string): Promise<StreamingTrail[]> {
  try {
    if (isMock()) {
      const { mockListTrails } = await import('@/lib/mocks/content-management.mock');
      return mockListTrails(academyId);
    }
    console.warn('[content.listTrails] fallback — not yet connected to Supabase');
    return [];
  } catch (error) {
    handleServiceError(error, 'content.listTrails');
  }
}

// ── CRUD Quiz ───────────────────────────────────────────────────────

export async function setQuizForVideo(
  videoId: string,
  questions: QuizQuestionInput[],
): Promise<QuizQuestion[]> {
  try {
    if (isMock()) {
      const { mockSetQuizForVideo } = await import('@/lib/mocks/content-management.mock');
      return mockSetQuizForVideo(videoId, questions);
    }
    console.warn('[content.setQuizForVideo] fallback — not yet connected to Supabase');
    return [];
  } catch (error) {
    handleServiceError(error, 'content.setQuizForVideo');
  }
}

export async function getQuizForVideo(videoId: string): Promise<QuizQuestion[]> {
  try {
    if (isMock()) {
      const { mockGetQuizForVideo } = await import('@/lib/mocks/content-management.mock');
      return mockGetQuizForVideo(videoId);
    }
    console.warn('[content.getQuizForVideo] fallback — not yet connected to Supabase');
    return [];
  } catch (error) {
    handleServiceError(error, 'content.getQuizForVideo');
  }
}

export async function deleteQuizForVideo(videoId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockDeleteQuizForVideo } = await import('@/lib/mocks/content-management.mock');
      return mockDeleteQuizForVideo(videoId);
    }
    console.warn('[content.deleteQuizForVideo] fallback — not yet connected to Supabase');
    return;
  } catch (error) {
    handleServiceError(error, 'content.deleteQuizForVideo');
  }
}

// ── CRUD Materials ──────────────────────────────────────────────────

export async function createMaterial(
  academyId: string,
  professorId: string,
  data: AcademicMaterialInput,
): Promise<AcademicMaterial> {
  try {
    if (isMock()) {
      const { mockCreateMaterial } = await import('@/lib/mocks/content-management.mock');
      return mockCreateMaterial(academyId, professorId, data);
    }
    console.warn('[content.createMaterial] fallback — not yet connected to Supabase');
    return { id: '', title: '', description: '', type: 'pdf', file_url: '', file_size_bytes: 0, modality: '', min_belt: '', tags: [], series_id: null, downloads: 0, is_published: false, created_by: professorId, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as AcademicMaterial;
  } catch (error) {
    handleServiceError(error, 'content.createMaterial');
  }
}

export async function updateMaterial(
  materialId: string,
  updates: Partial<AcademicMaterialInput>,
): Promise<AcademicMaterial> {
  try {
    if (isMock()) {
      const { mockUpdateMaterial } = await import('@/lib/mocks/content-management.mock');
      return mockUpdateMaterial(materialId, updates);
    }
    console.warn('[content.updateMaterial] fallback — not yet connected to Supabase');
    return { id: materialId, title: '', description: '', type: 'pdf', file_url: '', file_size_bytes: 0, modality: '', min_belt: '', tags: [], series_id: null, downloads: 0, is_published: false, created_by: '', created_at: '', updated_at: new Date().toISOString() } as AcademicMaterial;
  } catch (error) {
    handleServiceError(error, 'content.updateMaterial');
  }
}

export async function deleteMaterial(materialId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockDeleteMaterial } = await import('@/lib/mocks/content-management.mock');
      return mockDeleteMaterial(materialId);
    }
    console.warn('[content.deleteMaterial] fallback — not yet connected to Supabase');
    return;
  } catch (error) {
    handleServiceError(error, 'content.deleteMaterial');
  }
}

export async function listMaterials(
  academyId: string,
  _filters?: { modality?: string; type?: string },
): Promise<{ materials: AcademicMaterial[]; total: number }> {
  try {
    if (isMock()) {
      const { mockListMaterials } = await import('@/lib/mocks/content-management.mock');
      return mockListMaterials(academyId);
    }
    console.warn('[content.listMaterials] fallback — not yet connected to Supabase');
    return { materials: [], total: 0 };
  } catch (error) {
    handleServiceError(error, 'content.listMaterials');
  }
}

// ── Stats ───────────────────────────────────────────────────────────

export async function getContentStats(academyId: string): Promise<ContentStats> {
  try {
    if (isMock()) {
      const { mockGetContentStats } = await import('@/lib/mocks/content-management.mock');
      return mockGetContentStats(academyId);
    }
    console.warn('[content.getContentStats] fallback — not yet connected to Supabase');
    return { total_videos: 0, published_videos: 0, draft_videos: 0, total_series: 0, total_trails: 0, total_materials: 0, total_quiz_questions: 0, total_views: 0, total_completions: 0, avg_quiz_score: 0 } as ContentStats;
  } catch (error) {
    handleServiceError(error, 'content.getContentStats');
  }
}

export async function getVideoAnalytics(videoId: string): Promise<VideoAnalytics> {
  try {
    if (isMock()) {
      const { mockGetVideoAnalytics } = await import('@/lib/mocks/content-management.mock');
      return mockGetVideoAnalytics(videoId);
    }
    console.warn('[content.getVideoAnalytics] fallback — not yet connected to Supabase');
    return { views: 0, completions: 0, avg_watch_time: 0, quiz_avg_score: 0 } as VideoAnalytics;
  } catch (error) {
    handleServiceError(error, 'content.getVideoAnalytics');
  }
}
