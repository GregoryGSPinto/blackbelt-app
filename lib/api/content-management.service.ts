import { isMock } from '@/lib/env';
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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('content_videos')
      .select('source, source_url, embed_url, source_video_id, thumbnail_url, duration_seconds, original_title')
      .eq('source_url', url)
      .maybeSingle();
    if (error || !data) {
      console.warn('[extractVideoInfo] No existing video info found for URL:', url);
      return { source: 'youtube', source_url: url, embed_url: '', source_video_id: '', thumbnail_url: '', duration_seconds: 0, original_title: '' } as ExtractedVideoInfo;
    }
    return data as ExtractedVideoInfo;
  } catch (error) {
    console.warn('[extractVideoInfo] Fallback:', error);
    return { source: 'youtube', source_url: url, embed_url: '', source_video_id: '', thumbnail_url: '', duration_seconds: 0, original_title: '' } as ExtractedVideoInfo;
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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: row, error } = await supabase
      .from('content_videos')
      .insert({ ...data, academy_id: academyId, professor_id: professorId })
      .select()
      .single();
    if (error || !row) {
      console.warn('[createVideo] Insert failed:', error?.message);
      return { id: '', title: '', description: '', source: 'youtube', source_url: '', embed_url: '', source_video_id: '', thumbnail_url: '', duration_seconds: 0, original_title: '', modality: '', min_belt: '', tags: [], series_id: null, series_title: null, order: 0, is_published: false, is_free: false, professor_id: professorId, professor_name: '', views: 0, completions: 0, quiz_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as ContentVideo;
    }
    return row as unknown as ContentVideo;
  } catch (error) {
    console.warn('[createVideo] Fallback:', error);
    return { id: '', title: '', description: '', source: 'youtube', source_url: '', embed_url: '', source_video_id: '', thumbnail_url: '', duration_seconds: 0, original_title: '', modality: '', min_belt: '', tags: [], series_id: null, series_title: null, order: 0, is_published: false, is_free: false, professor_id: professorId, professor_name: '', views: 0, completions: 0, quiz_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as ContentVideo;
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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: row, error } = await supabase
      .from('content_videos')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', videoId)
      .select()
      .single();
    if (error || !row) {
      console.warn('[updateVideo] Update failed:', error?.message);
      return { id: videoId, title: '', description: '', source: 'youtube', source_url: '', embed_url: '', source_video_id: '', thumbnail_url: '', duration_seconds: 0, original_title: '', modality: '', min_belt: '', tags: [], series_id: null, series_title: null, order: 0, is_published: false, is_free: false, professor_id: '', professor_name: '', views: 0, completions: 0, quiz_count: 0, created_at: '', updated_at: new Date().toISOString() } as ContentVideo;
    }
    return row as unknown as ContentVideo;
  } catch (error) {
    console.warn('[updateVideo] Fallback:', error);
    return { id: videoId, title: '', description: '', source: 'youtube', source_url: '', embed_url: '', source_video_id: '', thumbnail_url: '', duration_seconds: 0, original_title: '', modality: '', min_belt: '', tags: [], series_id: null, series_title: null, order: 0, is_published: false, is_free: false, professor_id: '', professor_name: '', views: 0, completions: 0, quiz_count: 0, created_at: '', updated_at: new Date().toISOString() } as ContentVideo;
  }
}

export async function deleteVideo(videoId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockDeleteVideo } = await import('@/lib/mocks/content-management.mock');
      return mockDeleteVideo(videoId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from('content_videos')
      .delete()
      .eq('id', videoId);
    if (error) {
      console.warn('[deleteVideo] Delete failed:', error.message);
    }
  } catch (error) {
    console.warn('[deleteVideo] Fallback:', error);
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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('content_videos')
      .select('*', { count: 'exact' })
      .eq('academy_id', academyId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (filters?.modality) query = query.eq('modality', filters.modality);
    if (filters?.min_belt) query = query.eq('min_belt', filters.min_belt);
    if (filters?.series_id) query = query.eq('series_id', filters.series_id);
    if (filters?.is_published !== undefined) query = query.eq('is_published', filters.is_published);
    if (filters?.search) query = query.ilike('title', `%${filters.search}%`);

    const { data, count, error } = await query;
    if (error) {
      console.warn('[listVideos] Query failed:', error.message);
      return { videos: [], total: 0 };
    }
    return { videos: (data ?? []) as unknown as ContentVideo[], total: count ?? 0 };
  } catch (error) {
    console.warn('[listVideos] Fallback:', error);
    return { videos: [], total: 0 };
  }
}

export async function publishVideo(videoId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockPublishVideo } = await import('@/lib/mocks/content-management.mock');
      return mockPublishVideo(videoId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from('content_videos')
      .update({ is_published: true, updated_at: new Date().toISOString() })
      .eq('id', videoId);
    if (error) {
      console.warn('[publishVideo] Update failed:', error.message);
    }
  } catch (error) {
    console.warn('[publishVideo] Fallback:', error);
  }
}

export async function unpublishVideo(videoId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockUnpublishVideo } = await import('@/lib/mocks/content-management.mock');
      return mockUnpublishVideo(videoId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from('content_videos')
      .update({ is_published: false, updated_at: new Date().toISOString() })
      .eq('id', videoId);
    if (error) {
      console.warn('[unpublishVideo] Update failed:', error.message);
    }
  } catch (error) {
    console.warn('[unpublishVideo] Fallback:', error);
  }
}

export async function duplicateVideo(videoId: string): Promise<ContentVideo> {
  try {
    if (isMock()) {
      const { mockDuplicateVideo } = await import('@/lib/mocks/content-management.mock');
      return mockDuplicateVideo(videoId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: original, error: fetchError } = await supabase
      .from('content_videos')
      .select('*')
      .eq('id', videoId)
      .single();
    if (fetchError || !original) {
      console.warn('[duplicateVideo] Fetch original failed:', fetchError?.message);
      return { id: '', title: '', description: '', source: 'youtube', source_url: '', embed_url: '', source_video_id: '', thumbnail_url: '', duration_seconds: 0, original_title: '', modality: '', min_belt: '', tags: [], series_id: null, series_title: null, order: 0, is_published: false, is_free: false, professor_id: '', professor_name: '', views: 0, completions: 0, quiz_count: 0, created_at: '', updated_at: '' } as ContentVideo;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, created_at: _ca, updated_at: _ua, views: _v, completions: _c, ...rest } = original;
    const { data: duplicate, error: insertError } = await supabase
      .from('content_videos')
      .insert({ ...rest, title: `${original.title} (copy)`, is_published: false, views: 0, completions: 0 })
      .select()
      .single();
    if (insertError || !duplicate) {
      console.warn('[duplicateVideo] Insert failed:', insertError?.message);
      return { id: '', title: '', description: '', source: 'youtube', source_url: '', embed_url: '', source_video_id: '', thumbnail_url: '', duration_seconds: 0, original_title: '', modality: '', min_belt: '', tags: [], series_id: null, series_title: null, order: 0, is_published: false, is_free: false, professor_id: '', professor_name: '', views: 0, completions: 0, quiz_count: 0, created_at: '', updated_at: '' } as ContentVideo;
    }
    return duplicate as unknown as ContentVideo;
  } catch (error) {
    console.warn('[duplicateVideo] Fallback:', error);
    return { id: '', title: '', description: '', source: 'youtube', source_url: '', embed_url: '', source_video_id: '', thumbnail_url: '', duration_seconds: 0, original_title: '', modality: '', min_belt: '', tags: [], series_id: null, series_title: null, order: 0, is_published: false, is_free: false, professor_id: '', professor_name: '', views: 0, completions: 0, quiz_count: 0, created_at: '', updated_at: '' } as ContentVideo;
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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: row, error } = await supabase
      .from('content_series')
      .insert({ ...data, academy_id: academyId, professor_id: professorId })
      .select()
      .single();
    if (error || !row) {
      console.warn('[createSeries] Insert failed:', error?.message);
      return { id: '', title: '', description: '', thumbnail_url: '', gradient_css: '', professor_id: professorId, professor_name: '', modality: '', min_belt: '', videos: [], total_duration: '0', category: 'fundamentos', tags: [] } as StreamingSeries;
    }
    return { ...row, videos: [], total_duration: '0' } as unknown as StreamingSeries;
  } catch (error) {
    console.warn('[createSeries] Fallback:', error);
    return { id: '', title: '', description: '', thumbnail_url: '', gradient_css: '', professor_id: professorId, professor_name: '', modality: '', min_belt: '', videos: [], total_duration: '0', category: 'fundamentos', tags: [] } as StreamingSeries;
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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: row, error } = await supabase
      .from('content_series')
      .update(updates)
      .eq('id', seriesId)
      .select()
      .single();
    if (error || !row) {
      console.warn('[updateSeries] Update failed:', error?.message);
      return { id: seriesId, title: '', description: '', thumbnail_url: '', gradient_css: '', professor_id: '', professor_name: '', modality: '', min_belt: '', videos: [], total_duration: '0', category: 'fundamentos', tags: [] } as StreamingSeries;
    }
    return { ...row, videos: [], total_duration: '0' } as unknown as StreamingSeries;
  } catch (error) {
    console.warn('[updateSeries] Fallback:', error);
    return { id: seriesId, title: '', description: '', thumbnail_url: '', gradient_css: '', professor_id: '', professor_name: '', modality: '', min_belt: '', videos: [], total_duration: '0', category: 'fundamentos', tags: [] } as StreamingSeries;
  }
}

export async function deleteSeries(seriesId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockDeleteSeries } = await import('@/lib/mocks/content-management.mock');
      return mockDeleteSeries(seriesId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from('content_series')
      .delete()
      .eq('id', seriesId);
    if (error) {
      console.warn('[deleteSeries] Delete failed:', error.message);
    }
  } catch (error) {
    console.warn('[deleteSeries] Fallback:', error);
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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    let query = supabase
      .from('content_series')
      .select('*')
      .eq('academy_id', academyId)
      .order('created_at', { ascending: false });

    if (_filters?.modality) query = query.eq('modality', _filters.modality);

    const { data, error } = await query;
    if (error) {
      console.warn('[listSeries] Query failed:', error.message);
      return [];
    }
    return (data ?? []).map((row: Record<string, unknown>) => ({ ...row, videos: [], total_duration: '0' })) as unknown as StreamingSeries[];
  } catch (error) {
    console.warn('[listSeries] Fallback:', error);
    return [];
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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: row, error } = await supabase
      .from('content_trails')
      .insert({ ...data, academy_id: academyId })
      .select()
      .single();
    if (error || !row) {
      console.warn('[createTrail] Insert failed:', error?.message);
      return { id: '', name: '', description: '', gradient_css: '', series: [], total_videos: 0, total_duration: '0', min_belt: '', certificate_available: false } as StreamingTrail;
    }
    return { ...row, series: [], total_videos: 0, total_duration: '0' } as unknown as StreamingTrail;
  } catch (error) {
    console.warn('[createTrail] Fallback:', error);
    return { id: '', name: '', description: '', gradient_css: '', series: [], total_videos: 0, total_duration: '0', min_belt: '', certificate_available: false } as StreamingTrail;
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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: row, error } = await supabase
      .from('content_trails')
      .update(updates)
      .eq('id', trailId)
      .select()
      .single();
    if (error || !row) {
      console.warn('[updateTrail] Update failed:', error?.message);
      return { id: trailId, name: '', description: '', gradient_css: '', series: [], total_videos: 0, total_duration: '0', min_belt: '', certificate_available: false } as StreamingTrail;
    }
    return { ...row, series: [], total_videos: 0, total_duration: '0' } as unknown as StreamingTrail;
  } catch (error) {
    console.warn('[updateTrail] Fallback:', error);
    return { id: trailId, name: '', description: '', gradient_css: '', series: [], total_videos: 0, total_duration: '0', min_belt: '', certificate_available: false } as StreamingTrail;
  }
}

export async function deleteTrail(trailId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockDeleteTrail } = await import('@/lib/mocks/content-management.mock');
      return mockDeleteTrail(trailId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from('content_trails')
      .delete()
      .eq('id', trailId);
    if (error) {
      console.warn('[deleteTrail] Delete failed:', error.message);
    }
  } catch (error) {
    console.warn('[deleteTrail] Fallback:', error);
  }
}

export async function listTrails(academyId: string): Promise<StreamingTrail[]> {
  try {
    if (isMock()) {
      const { mockListTrails } = await import('@/lib/mocks/content-management.mock');
      return mockListTrails(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('content_trails')
      .select('*')
      .eq('academy_id', academyId)
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('[listTrails] Query failed:', error.message);
      return [];
    }
    return (data ?? []).map((row: Record<string, unknown>) => ({ ...row, series: [], total_videos: 0, total_duration: '0' })) as unknown as StreamingTrail[];
  } catch (error) {
    console.warn('[listTrails] Fallback:', error);
    return [];
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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    // Delete existing quiz questions first
    await supabase.from('content_quiz_questions').delete().eq('video_id', videoId);
    // Insert new questions
    const rows = questions.map((q, i) => ({ ...q, video_id: videoId, order: i }));
    const { data, error } = await supabase
      .from('content_quiz_questions')
      .insert(rows)
      .select();
    if (error) {
      console.warn('[setQuizForVideo] Insert failed:', error.message);
      return [];
    }
    return (data ?? []) as unknown as QuizQuestion[];
  } catch (error) {
    console.warn('[setQuizForVideo] Fallback:', error);
    return [];
  }
}

export async function getQuizForVideo(videoId: string): Promise<QuizQuestion[]> {
  try {
    if (isMock()) {
      const { mockGetQuizForVideo } = await import('@/lib/mocks/content-management.mock');
      return mockGetQuizForVideo(videoId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('content_quiz_questions')
      .select('*')
      .eq('video_id', videoId)
      .order('order', { ascending: true });
    if (error) {
      console.warn('[getQuizForVideo] Query failed:', error.message);
      return [];
    }
    return (data ?? []) as unknown as QuizQuestion[];
  } catch (error) {
    console.warn('[getQuizForVideo] Fallback:', error);
    return [];
  }
}

export async function deleteQuizForVideo(videoId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockDeleteQuizForVideo } = await import('@/lib/mocks/content-management.mock');
      return mockDeleteQuizForVideo(videoId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from('content_quiz_questions')
      .delete()
      .eq('video_id', videoId);
    if (error) {
      console.warn('[deleteQuizForVideo] Delete failed:', error.message);
    }
  } catch (error) {
    console.warn('[deleteQuizForVideo] Fallback:', error);
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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: row, error } = await supabase
      .from('content_materials')
      .insert({ ...data, academy_id: academyId, created_by: professorId })
      .select()
      .single();
    if (error || !row) {
      console.warn('[createMaterial] Insert failed:', error?.message);
      return { id: '', title: '', description: '', type: 'pdf', file_url: '', file_size_bytes: 0, modality: '', min_belt: '', tags: [], series_id: null, downloads: 0, is_published: false, created_by: professorId, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as AcademicMaterial;
    }
    return row as unknown as AcademicMaterial;
  } catch (error) {
    console.warn('[createMaterial] Fallback:', error);
    return { id: '', title: '', description: '', type: 'pdf', file_url: '', file_size_bytes: 0, modality: '', min_belt: '', tags: [], series_id: null, downloads: 0, is_published: false, created_by: professorId, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as AcademicMaterial;
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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: row, error } = await supabase
      .from('content_materials')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', materialId)
      .select()
      .single();
    if (error || !row) {
      console.warn('[updateMaterial] Update failed:', error?.message);
      return { id: materialId, title: '', description: '', type: 'pdf', file_url: '', file_size_bytes: 0, modality: '', min_belt: '', tags: [], series_id: null, downloads: 0, is_published: false, created_by: '', created_at: '', updated_at: new Date().toISOString() } as AcademicMaterial;
    }
    return row as unknown as AcademicMaterial;
  } catch (error) {
    console.warn('[updateMaterial] Fallback:', error);
    return { id: materialId, title: '', description: '', type: 'pdf', file_url: '', file_size_bytes: 0, modality: '', min_belt: '', tags: [], series_id: null, downloads: 0, is_published: false, created_by: '', created_at: '', updated_at: new Date().toISOString() } as AcademicMaterial;
  }
}

export async function deleteMaterial(materialId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockDeleteMaterial } = await import('@/lib/mocks/content-management.mock');
      return mockDeleteMaterial(materialId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from('content_materials')
      .delete()
      .eq('id', materialId);
    if (error) {
      console.warn('[deleteMaterial] Delete failed:', error.message);
    }
  } catch (error) {
    console.warn('[deleteMaterial] Fallback:', error);
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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    let query = supabase
      .from('content_materials')
      .select('*', { count: 'exact' })
      .eq('academy_id', academyId)
      .order('created_at', { ascending: false });

    if (_filters?.modality) query = query.eq('modality', _filters.modality);
    if (_filters?.type) query = query.eq('type', _filters.type);

    const { data, count, error } = await query;
    if (error) {
      console.warn('[listMaterials] Query failed:', error.message);
      return { materials: [], total: 0 };
    }
    return { materials: (data ?? []) as unknown as AcademicMaterial[], total: count ?? 0 };
  } catch (error) {
    console.warn('[listMaterials] Fallback:', error);
    return { materials: [], total: 0 };
  }
}

// ── Stats ───────────────────────────────────────────────────────────

export async function getContentStats(academyId: string): Promise<ContentStats> {
  try {
    if (isMock()) {
      const { mockGetContentStats } = await import('@/lib/mocks/content-management.mock');
      return mockGetContentStats(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const [videosRes, seriesRes, trailsRes, materialsRes] = await Promise.all([
      supabase.from('content_videos').select('id, is_published, views, completions', { count: 'exact' }).eq('academy_id', academyId),
      supabase.from('content_series').select('id', { count: 'exact' }).eq('academy_id', academyId),
      supabase.from('content_trails').select('id', { count: 'exact' }).eq('academy_id', academyId),
      supabase.from('content_materials').select('id', { count: 'exact' }).eq('academy_id', academyId),
    ]);

    const videos = (videosRes.data ?? []) as Record<string, unknown>[];
    const published = videos.filter((v: Record<string, unknown>) => v.is_published).length;
    const totalViews = videos.reduce((sum: number, v: Record<string, unknown>) => sum + ((v.views as number) || 0), 0);
    const totalCompletions = videos.reduce((sum: number, v: Record<string, unknown>) => sum + ((v.completions as number) || 0), 0);

    return {
      total_videos: videosRes.count ?? 0,
      published_videos: published,
      draft_videos: (videosRes.count ?? 0) - published,
      total_series: seriesRes.count ?? 0,
      total_trails: trailsRes.count ?? 0,
      total_materials: materialsRes.count ?? 0,
      total_quiz_questions: 0,
      total_views: totalViews,
      total_completions: totalCompletions,
      avg_quiz_score: 0,
    } as ContentStats;
  } catch (error) {
    console.warn('[getContentStats] Fallback:', error);
    return { total_videos: 0, published_videos: 0, draft_videos: 0, total_series: 0, total_trails: 0, total_materials: 0, total_quiz_questions: 0, total_views: 0, total_completions: 0, avg_quiz_score: 0 } as ContentStats;
  }
}

export async function getVideoAnalytics(videoId: string): Promise<VideoAnalytics> {
  try {
    if (isMock()) {
      const { mockGetVideoAnalytics } = await import('@/lib/mocks/content-management.mock');
      return mockGetVideoAnalytics(videoId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('content_videos')
      .select('views, completions')
      .eq('id', videoId)
      .single();
    if (error || !data) {
      console.warn('[getVideoAnalytics] Query failed:', error?.message);
      return { views: 0, completions: 0, avg_watch_time: 0, quiz_avg_score: 0 } as VideoAnalytics;
    }
    return {
      views: (data.views as number) || 0,
      completions: (data.completions as number) || 0,
      avg_watch_time: 0,
      quiz_avg_score: 0,
    } as VideoAnalytics;
  } catch (error) {
    console.warn('[getVideoAnalytics] Fallback:', error);
    return { views: 0, completions: 0, avg_watch_time: 0, quiz_avg_score: 0 } as VideoAnalytics;
  }
}
