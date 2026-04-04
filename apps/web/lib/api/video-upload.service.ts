import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

// ── Types ───────────────────────────────────────────────────────────

export interface VideoUploadData {
  file: File;
  thumbnail?: File;
  titulo: string;
  descricao: string;
  descricaoCompleta?: string;
  modalidade: string;
  faixaMinima: string;
  dificuldade: 'iniciante' | 'intermediario' | 'avancado' | 'expert';
  categoria: string;
  tags: string[];
  turmaIds: string[];
  publicos: ('kids' | 'teen' | 'adulto' | 'todos')[];
  serieId?: string;
}

export interface VideoUploadResult {
  videoId: string;
  storageUrl: string;
  thumbnailUrl: string;
  status: 'processing' | 'ready';
}

export interface UploadProgress {
  percent: number;
  bytesUploaded: number;
  bytesTotal: number;
  status: 'uploading' | 'processing_thumbnail' | 'saving_metadata' | 'ready' | 'error';
  message: string;
}

export interface StorageStats {
  totalVideos: number;
  totalSizeBytes: number;
  totalSizeFormatted: string;
  limitBytes: number;
  limitFormatted: string;
  usagePercent: number;
  videosThisMonth: number;
}

export interface UploadedVideo {
  id: string;
  titulo: string;
  descricao: string;
  thumbnailUrl: string;
  storagePath: string;
  duracao: number;
  duracaoFormatada: string;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  mimeType: string;
  modalidade: string;
  faixaMinima: string;
  dificuldade: string;
  categoria: string;
  tags: string[];
  turmas: { id: string; nome: string }[];
  publicos: string[];
  isPublished: boolean;
  publishedAt?: string;
  uploadedBy: string;
  uploadedByName: string;
  viewsCount: number;
  likesCount: number;
  createdAt: string;
}

export interface VideoSeriesData {
  id: string;
  titulo: string;
  descricao?: string;
  thumbnailUrl?: string;
  modalidade?: string;
  faixaMinima?: string;
  publico: string;
  isPublished: boolean;
  videos: { id: string; titulo: string; thumbnail: string; duracao: string; sortOrder: number }[];
}

// ── Helpers ─────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
  return `${(bytes / 1e3).toFixed(1)} KB`;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function mapRowToUploadedVideo(row: Record<string, unknown>, turmas: { id: string; nome: string }[], publicos: string[]): UploadedVideo {
  return {
    id: row.id as string,
    titulo: (row.title as string) || '',
    descricao: (row.description as string) || '',
    thumbnailUrl: (row.thumbnail_storage_url as string) || '',
    storagePath: (row.storage_path as string) || '',
    duracao: (row.duration as number) || 0,
    duracaoFormatada: formatDuration((row.duration as number) || 0),
    fileSizeBytes: (row.file_size_bytes as number) || 0,
    fileSizeFormatted: formatBytes((row.file_size_bytes as number) || 0),
    mimeType: (row.mime_type as string) || '',
    modalidade: (row.modality as string) || '',
    faixaMinima: (row.min_belt as string) || '',
    dificuldade: (row.difficulty as string) || '',
    categoria: (row.category as string) || '',
    tags: (row.tags as string[]) || [],
    turmas,
    publicos,
    isPublished: (row.is_published as boolean) ?? true,
    publishedAt: (row.published_at as string) || undefined,
    uploadedBy: (row.uploaded_by as string) || '',
    uploadedByName: '',
    viewsCount: (row.views_count as number) || 0,
    likesCount: (row.likes_count as number) || 0,
    createdAt: (row.created_at as string) || '',
  };
}

// ── Upload ──────────────────────────────────────────────────────────

export async function uploadVideo(
  academyId: string,
  data: VideoUploadData,
  onProgress?: (p: UploadProgress) => void,
): Promise<VideoUploadResult> {
  try {
    if (isMock()) {
      const { mockUploadVideo } = await import('@/lib/mocks/video-upload.mock');
      return mockUploadVideo(academyId, data, onProgress);
    }

    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      onProgress?.({ percent: 0, bytesUploaded: 0, bytesTotal: data.file.size, status: 'uploading', message: 'Iniciando upload...' });

      // Upload video file to Supabase Storage
      const filePath = `videos/${academyId}/${Date.now()}_${data.file.name}`;
      const { error: uploadErr } = await supabase.storage
        .from('videos')
        .upload(filePath, data.file, { upsert: false });

      if (uploadErr) {
        logServiceError(uploadErr, 'video-upload');
      }

      onProgress?.({ percent: 60, bytesUploaded: data.file.size, bytesTotal: data.file.size, status: 'processing_thumbnail', message: 'Processando thumbnail...' });

      // Upload thumbnail if provided
      let thumbnailUrl = '';
      if (data.thumbnail) {
        const thumbPath = `thumbnails/${academyId}/${Date.now()}_thumb.jpg`;
        const { error: thumbErr } = await supabase.storage
          .from('videos')
          .upload(thumbPath, data.thumbnail, { upsert: false });

        if (!thumbErr) {
          const { data: thumbUrlData } = supabase.storage.from('videos').getPublicUrl(thumbPath);
          thumbnailUrl = thumbUrlData?.publicUrl || '';
        }
      }

      const { data: urlData } = supabase.storage.from('videos').getPublicUrl(filePath);
      const storageUrl = urlData?.publicUrl || '';

      onProgress?.({ percent: 80, bytesUploaded: data.file.size, bytesTotal: data.file.size, status: 'saving_metadata', message: 'Salvando metadados...' });

      // Insert video record
      const userId = (await supabase.auth.getUser()).data.user?.id ?? null;

      const { data: videoRow, error: insertErr } = await supabase
        .from('videos')
        .insert({
          academy_id: academyId,
          title: data.titulo,
          description: data.descricao,
          url: storageUrl,
          storage_path: filePath,
          storage_url: storageUrl,
          thumbnail_storage_url: thumbnailUrl,
          file_size_bytes: data.file.size,
          mime_type: data.file.type,
          upload_status: 'ready',
          uploaded_by: userId,
          modality: data.modalidade,
          min_belt: data.faixaMinima,
          difficulty: data.dificuldade,
          category: data.categoria,
          tags: data.tags,
          is_published: true,
          published_at: new Date().toISOString(),
          provider: 'supabase',
          metadata: { descricao_completa: data.descricaoCompleta },
        })
        .select()
        .single();

      if (insertErr || !videoRow) {
        logServiceError(insertErr, 'video-upload');
        const { mockUploadVideo } = await import('@/lib/mocks/video-upload.mock');
        return mockUploadVideo(academyId, data, onProgress);
      }

      // Insert audience records
      if (data.publicos?.length) {
        const audienceRows = data.publicos.map((a) => ({ video_id: videoRow.id, audience: a }));
        await supabase.from('video_audiences').insert(audienceRows);
      }

      // Insert class assignments
      if (data.turmaIds?.length) {
        const classRows = data.turmaIds.map((cid) => ({
          video_id: videoRow.id,
          class_id: cid,
          assigned_by: userId,
        }));
        await supabase.from('video_class_assignments').insert(classRows);
      }

      // Link to series if specified
      if (data.serieId) {
        await supabase.from('video_series_items').insert({
          series_id: data.serieId,
          video_id: videoRow.id,
          sort_order: 0,
        });
      }

      // Update storage_usage
      await supabase.rpc('update_storage_usage_on_upload', { p_academy_id: academyId, p_file_size: data.file.size }).then(() => {}).catch(() => {
        // If RPC doesn't exist, manually update
        supabase
          .from('storage_usage')
          .upsert({
            academy_id: academyId,
            total_videos: 1,
            total_size_bytes: data.file.size,
            last_calculated_at: new Date().toISOString(),
          }, { onConflict: 'academy_id' })
          .then(() => {});
      });

      onProgress?.({ percent: 100, bytesUploaded: data.file.size, bytesTotal: data.file.size, status: 'ready', message: 'Upload concluido!' });

      return {
        videoId: videoRow.id,
        storageUrl,
        thumbnailUrl,
        status: 'ready',
      };
    } catch (err) {
      logServiceError(err, 'video-upload');
      const { mockUploadVideo } = await import('@/lib/mocks/video-upload.mock');
      return mockUploadVideo(academyId, data, onProgress);
    }
  } catch (error) {
    logServiceError(error, 'video-upload');
    const { mockUploadVideo } = await import('@/lib/mocks/video-upload.mock');
    return mockUploadVideo(academyId, data, onProgress);
  }
}

// ── Delete ──────────────────────────────────────────────────────────

export async function deleteUploadedVideo(videoId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockDeleteUploadedVideo } = await import('@/lib/mocks/video-upload.mock');
      return mockDeleteUploadedVideo(videoId);
    }

    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      // Get storage path before deleting the record
      const { data: video } = await supabase
        .from('videos')
        .select('storage_path')
        .eq('id', videoId)
        .single();

      // Delete from storage if path exists
      if (video?.storage_path) {
        await supabase.storage.from('videos').remove([video.storage_path]);
      }

      // Delete the DB record (cascade will clean up annotations, audiences, etc.)
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId);

      if (error) {
        logServiceError(error, 'video-upload');
      }
    } catch (err) {
      logServiceError(err, 'video-upload');
      const { mockDeleteUploadedVideo } = await import('@/lib/mocks/video-upload.mock');
      return mockDeleteUploadedVideo(videoId);
    }
  } catch (error) {
    logServiceError(error, 'video-upload');
    const { mockDeleteUploadedVideo } = await import('@/lib/mocks/video-upload.mock');
    return mockDeleteUploadedVideo(videoId);
  }
}

// ── Update ──────────────────────────────────────────────────────────

export async function updateUploadedVideo(
  videoId: string,
  data: Partial<VideoUploadData>,
): Promise<UploadedVideo> {
  try {
    if (isMock()) {
      const { mockUpdateUploadedVideo } = await import('@/lib/mocks/video-upload.mock');
      return mockUpdateUploadedVideo(videoId, data);
    }

    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      const updatePayload: Record<string, unknown> = {};
      if (data.titulo !== undefined) updatePayload.title = data.titulo;
      if (data.descricao !== undefined) updatePayload.description = data.descricao;
      if (data.modalidade !== undefined) updatePayload.modality = data.modalidade;
      if (data.faixaMinima !== undefined) updatePayload.min_belt = data.faixaMinima;
      if (data.dificuldade !== undefined) updatePayload.difficulty = data.dificuldade;
      if (data.categoria !== undefined) updatePayload.category = data.categoria;
      if (data.tags !== undefined) updatePayload.tags = data.tags;

      const { data: row, error } = await supabase
        .from('videos')
        .update(updatePayload)
        .eq('id', videoId)
        .select()
        .single();

      if (error || !row) {
        logServiceError(error, 'video-upload');
        const { mockUpdateUploadedVideo } = await import('@/lib/mocks/video-upload.mock');
        return mockUpdateUploadedVideo(videoId, data);
      }

      // Update audiences if provided
      if (data.publicos !== undefined) {
        await supabase.from('video_audiences').delete().eq('video_id', videoId);
        if (data.publicos.length) {
          const audienceRows = data.publicos.map((a) => ({ video_id: videoId, audience: a }));
          await supabase.from('video_audiences').insert(audienceRows);
        }
      }

      // Update class assignments if provided
      if (data.turmaIds !== undefined) {
        await supabase.from('video_class_assignments').delete().eq('video_id', videoId);
        if (data.turmaIds.length) {
          const userId = (await supabase.auth.getUser()).data.user?.id ?? null;
          const classRows = data.turmaIds.map((cid) => ({
            video_id: videoId,
            class_id: cid,
            assigned_by: userId,
          }));
          await supabase.from('video_class_assignments').insert(classRows);
        }
      }

      // Fetch turmas and publicos for the response
      const { data: turmaRows } = await supabase
        .from('video_class_assignments')
        .select('class_id, classes(name)')
        .eq('video_id', videoId);

      const turmas = (turmaRows || []).map((t: Record<string, unknown>) => ({
        id: t.class_id as string,
        nome: ((t as Record<string, unknown>).classes as Record<string, string>)?.name || '',
      }));

      const { data: audienceRows } = await supabase
        .from('video_audiences')
        .select('audience')
        .eq('video_id', videoId);

      const publicos = (audienceRows || []).map((a: Record<string, unknown>) => a.audience as string);

      return mapRowToUploadedVideo(row as Record<string, unknown>, turmas, publicos);
    } catch (err) {
      logServiceError(err, 'video-upload');
      const { mockUpdateUploadedVideo } = await import('@/lib/mocks/video-upload.mock');
      return mockUpdateUploadedVideo(videoId, data);
    }
  } catch (error) {
    logServiceError(error, 'video-upload');
    const { mockUpdateUploadedVideo } = await import('@/lib/mocks/video-upload.mock');
    return mockUpdateUploadedVideo(videoId, data);
  }
}

// ── Publish / Unpublish ─────────────────────────────────────────────

export async function publishUploadedVideo(videoId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockPublishUploadedVideo } = await import('@/lib/mocks/video-upload.mock');
      return mockPublishUploadedVideo(videoId);
    }

    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      const { error } = await supabase
        .from('videos')
        .update({ is_published: true, published_at: new Date().toISOString() })
        .eq('id', videoId);

      if (error) {
        logServiceError(error, 'video-upload');
      }
    } catch (err) {
      logServiceError(err, 'video-upload');
      const { mockPublishUploadedVideo } = await import('@/lib/mocks/video-upload.mock');
      return mockPublishUploadedVideo(videoId);
    }
  } catch (error) {
    logServiceError(error, 'video-upload');
    const { mockPublishUploadedVideo } = await import('@/lib/mocks/video-upload.mock');
    return mockPublishUploadedVideo(videoId);
  }
}

export async function unpublishUploadedVideo(videoId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockUnpublishUploadedVideo } = await import('@/lib/mocks/video-upload.mock');
      return mockUnpublishUploadedVideo(videoId);
    }

    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      const { error } = await supabase
        .from('videos')
        .update({ is_published: false })
        .eq('id', videoId);

      if (error) {
        logServiceError(error, 'video-upload');
      }
    } catch (err) {
      logServiceError(err, 'video-upload');
      const { mockUnpublishUploadedVideo } = await import('@/lib/mocks/video-upload.mock');
      return mockUnpublishUploadedVideo(videoId);
    }
  } catch (error) {
    logServiceError(error, 'video-upload');
    const { mockUnpublishUploadedVideo } = await import('@/lib/mocks/video-upload.mock');
    return mockUnpublishUploadedVideo(videoId);
  }
}

// ── Query: by academy ───────────────────────────────────────────────

export async function getVideosByAcademy(academyId: string): Promise<UploadedVideo[]> {
  try {
    if (isMock()) {
      const { mockGetVideosByAcademy } = await import('@/lib/mocks/video-upload.mock');
      return mockGetVideosByAcademy(academyId);
    }

    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      const { data: rows, error } = await supabase
        .from('videos')
        .select('*')
        .eq('academy_id', academyId)
        .order('created_at', { ascending: false });

      if (error) {
        logServiceError(error, 'video-upload');
        return [];
      }

      // Batch fetch audiences and class assignments for all videos
      const videoIds = (rows || []).map((r: Record<string, unknown>) => r.id as string);

      const { data: allAudiences } = await supabase
        .from('video_audiences')
        .select('video_id, audience')
        .in('video_id', videoIds);

      const { data: allClasses } = await supabase
        .from('video_class_assignments')
        .select('video_id, class_id, classes(name)')
        .in('video_id', videoIds);

      return (rows || []).map((row: Record<string, unknown>) => {
        const publicos = (allAudiences || [])
          .filter((a: Record<string, unknown>) => a.video_id === row.id)
          .map((a: Record<string, unknown>) => a.audience as string);
        const turmas = (allClasses || [])
          .filter((c: Record<string, unknown>) => c.video_id === row.id)
          .map((c: Record<string, unknown>) => ({
            id: c.class_id as string,
            nome: ((c as Record<string, unknown>).classes as Record<string, string>)?.name || '',
          }));
        return mapRowToUploadedVideo(row, turmas, publicos);
      });
    } catch (err) {
      logServiceError(err, 'video-upload');
      const { mockGetVideosByAcademy } = await import('@/lib/mocks/video-upload.mock');
      return mockGetVideosByAcademy(academyId);
    }
  } catch (error) {
    logServiceError(error, 'video-upload');
    const { mockGetVideosByAcademy } = await import('@/lib/mocks/video-upload.mock');
    return mockGetVideosByAcademy(academyId);
  }
}

// ── Query: by class ─────────────────────────────────────────────────

export async function getVideosByClass(classId: string): Promise<UploadedVideo[]> {
  try {
    if (isMock()) {
      const { mockGetVideosByClass } = await import('@/lib/mocks/video-upload.mock');
      return mockGetVideosByClass(classId);
    }

    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      // Get video IDs assigned to this class
      const { data: assignments } = await supabase
        .from('video_class_assignments')
        .select('video_id')
        .eq('class_id', classId);

      const videoIds = (assignments || []).map((a: Record<string, unknown>) => a.video_id as string);
      if (!videoIds.length) return [];

      const { data: rows, error } = await supabase
        .from('videos')
        .select('*')
        .in('id', videoIds)
        .order('created_at', { ascending: false });

      if (error) {
        logServiceError(error, 'video-upload');
        return [];
      }

      return (rows || []).map((row: Record<string, unknown>) => mapRowToUploadedVideo(row, [], []));
    } catch (err) {
      logServiceError(err, 'video-upload');
      const { mockGetVideosByClass } = await import('@/lib/mocks/video-upload.mock');
      return mockGetVideosByClass(classId);
    }
  } catch (error) {
    logServiceError(error, 'video-upload');
    const { mockGetVideosByClass } = await import('@/lib/mocks/video-upload.mock');
    return mockGetVideosByClass(classId);
  }
}

// ── Query: by audience ──────────────────────────────────────────────

export async function getVideosByAudience(
  academyId: string,
  audience: string,
): Promise<UploadedVideo[]> {
  try {
    if (isMock()) {
      const { mockGetVideosByAudience } = await import('@/lib/mocks/video-upload.mock');
      return mockGetVideosByAudience(academyId, audience);
    }

    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      // Get video IDs for this audience
      const { data: audienceRows } = await supabase
        .from('video_audiences')
        .select('video_id')
        .eq('audience', audience);

      const videoIds = (audienceRows || []).map((a: Record<string, unknown>) => a.video_id as string);
      if (!videoIds.length) return [];

      const { data: rows, error } = await supabase
        .from('videos')
        .select('*')
        .eq('academy_id', academyId)
        .in('id', videoIds)
        .order('created_at', { ascending: false });

      if (error) {
        logServiceError(error, 'video-upload');
        return [];
      }

      return (rows || []).map((row: Record<string, unknown>) => mapRowToUploadedVideo(row, [], [audience]));
    } catch (err) {
      logServiceError(err, 'video-upload');
      const { mockGetVideosByAudience } = await import('@/lib/mocks/video-upload.mock');
      return mockGetVideosByAudience(academyId, audience);
    }
  } catch (error) {
    logServiceError(error, 'video-upload');
    const { mockGetVideosByAudience } = await import('@/lib/mocks/video-upload.mock');
    return mockGetVideosByAudience(academyId, audience);
  }
}

// ── Query: by professor ─────────────────────────────────────────────

export async function getVideosByProfessor(professorId: string): Promise<UploadedVideo[]> {
  try {
    if (isMock()) {
      const { mockGetVideosByProfessor } = await import('@/lib/mocks/video-upload.mock');
      return mockGetVideosByProfessor(professorId);
    }

    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      const { data: rows, error } = await supabase
        .from('videos')
        .select('*')
        .eq('uploaded_by', professorId)
        .order('created_at', { ascending: false });

      if (error) {
        logServiceError(error, 'video-upload');
        return [];
      }

      return (rows || []).map((row: Record<string, unknown>) => mapRowToUploadedVideo(row, [], []));
    } catch (err) {
      logServiceError(err, 'video-upload');
      const { mockGetVideosByProfessor } = await import('@/lib/mocks/video-upload.mock');
      return mockGetVideosByProfessor(professorId);
    }
  } catch (error) {
    logServiceError(error, 'video-upload');
    const { mockGetVideosByProfessor } = await import('@/lib/mocks/video-upload.mock');
    return mockGetVideosByProfessor(professorId);
  }
}

// ── Series CRUD ─────────────────────────────────────────────────────

export async function createVideoSeries(
  academyId: string,
  data: Omit<VideoSeriesData, 'id' | 'videos'>,
): Promise<VideoSeriesData> {
  try {
    if (isMock()) {
      const { mockCreateVideoSeries } = await import('@/lib/mocks/video-upload.mock');
      return mockCreateVideoSeries(academyId, data);
    }

    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      const userId = (await supabase.auth.getUser()).data.user?.id ?? null;

      const { data: row, error } = await supabase
        .from('video_series')
        .insert({
          academy_id: academyId,
          professor_id: userId,
          title: data.titulo,
          description: data.descricao || null,
          thumbnail_url: data.thumbnailUrl || null,
          modality: data.modalidade || null,
          min_belt: data.faixaMinima || null,
          audience: data.publico,
          is_published: data.isPublished,
        })
        .select()
        .single();

      if (error || !row) {
        logServiceError(error, 'video-upload');
        const { mockCreateVideoSeries } = await import('@/lib/mocks/video-upload.mock');
        return mockCreateVideoSeries(academyId, data);
      }

      return {
        id: row.id,
        titulo: row.title,
        descricao: row.description || undefined,
        thumbnailUrl: row.thumbnail_url || undefined,
        modalidade: row.modality || undefined,
        faixaMinima: row.min_belt || undefined,
        publico: row.audience || '',
        isPublished: row.is_published ?? true,
        videos: [],
      };
    } catch (err) {
      logServiceError(err, 'video-upload');
      const { mockCreateVideoSeries } = await import('@/lib/mocks/video-upload.mock');
      return mockCreateVideoSeries(academyId, data);
    }
  } catch (error) {
    logServiceError(error, 'video-upload');
    const { mockCreateVideoSeries } = await import('@/lib/mocks/video-upload.mock');
    return mockCreateVideoSeries(academyId, data);
  }
}

export async function updateVideoSeries(
  seriesId: string,
  data: Partial<VideoSeriesData>,
): Promise<VideoSeriesData> {
  try {
    if (isMock()) {
      const { mockUpdateVideoSeries } = await import('@/lib/mocks/video-upload.mock');
      return mockUpdateVideoSeries(seriesId, data);
    }

    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      const updatePayload: Record<string, unknown> = {};
      if (data.titulo !== undefined) updatePayload.title = data.titulo;
      if (data.descricao !== undefined) updatePayload.description = data.descricao;
      if (data.thumbnailUrl !== undefined) updatePayload.thumbnail_url = data.thumbnailUrl;
      if (data.modalidade !== undefined) updatePayload.modality = data.modalidade;
      if (data.faixaMinima !== undefined) updatePayload.min_belt = data.faixaMinima;
      if (data.publico !== undefined) updatePayload.audience = data.publico;
      if (data.isPublished !== undefined) updatePayload.is_published = data.isPublished;

      const { data: row, error } = await supabase
        .from('video_series')
        .update(updatePayload)
        .eq('id', seriesId)
        .select()
        .single();

      if (error || !row) {
        logServiceError(error, 'video-upload');
        const { mockUpdateVideoSeries } = await import('@/lib/mocks/video-upload.mock');
        return mockUpdateVideoSeries(seriesId, data);
      }

      // Fetch series items
      const { data: items } = await supabase
        .from('video_series_items')
        .select('video_id, sort_order, videos(title, thumbnail_storage_url, duration)')
        .eq('series_id', seriesId)
        .order('sort_order');

      const videos = (items || []).map((i: Record<string, unknown>) => {
        const v = (i as Record<string, unknown>).videos as Record<string, unknown> | null;
        return {
          id: i.video_id as string,
          titulo: (v?.title as string) || '',
          thumbnail: (v?.thumbnail_storage_url as string) || '',
          duracao: formatDuration((v?.duration as number) || 0),
          sortOrder: (i.sort_order as number) || 0,
        };
      });

      return {
        id: row.id,
        titulo: row.title,
        descricao: row.description || undefined,
        thumbnailUrl: row.thumbnail_url || undefined,
        modalidade: row.modality || undefined,
        faixaMinima: row.min_belt || undefined,
        publico: row.audience || '',
        isPublished: row.is_published ?? true,
        videos,
      };
    } catch (err) {
      logServiceError(err, 'video-upload');
      const { mockUpdateVideoSeries } = await import('@/lib/mocks/video-upload.mock');
      return mockUpdateVideoSeries(seriesId, data);
    }
  } catch (error) {
    logServiceError(error, 'video-upload');
    const { mockUpdateVideoSeries } = await import('@/lib/mocks/video-upload.mock');
    return mockUpdateVideoSeries(seriesId, data);
  }
}

export async function deleteVideoSeries(seriesId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockDeleteVideoSeries } = await import('@/lib/mocks/video-upload.mock');
      return mockDeleteVideoSeries(seriesId);
    }

    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      const { error } = await supabase
        .from('video_series')
        .delete()
        .eq('id', seriesId);

      if (error) {
        logServiceError(error, 'video-upload');
      }
    } catch (err) {
      logServiceError(err, 'video-upload');
      const { mockDeleteVideoSeries } = await import('@/lib/mocks/video-upload.mock');
      return mockDeleteVideoSeries(seriesId);
    }
  } catch (error) {
    logServiceError(error, 'video-upload');
    const { mockDeleteVideoSeries } = await import('@/lib/mocks/video-upload.mock');
    return mockDeleteVideoSeries(seriesId);
  }
}

// ── Series video management ─────────────────────────────────────────

export async function addVideoToSeries(
  seriesId: string,
  videoId: string,
  order: number,
): Promise<void> {
  try {
    if (isMock()) {
      const { mockAddVideoToSeries } = await import('@/lib/mocks/video-upload.mock');
      return mockAddVideoToSeries(seriesId, videoId, order);
    }

    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      const { error } = await supabase
        .from('video_series_items')
        .upsert(
          { series_id: seriesId, video_id: videoId, sort_order: order },
          { onConflict: 'series_id,video_id' },
        );

      if (error) {
        logServiceError(error, 'video-upload');
      }
    } catch (err) {
      logServiceError(err, 'video-upload');
      const { mockAddVideoToSeries } = await import('@/lib/mocks/video-upload.mock');
      return mockAddVideoToSeries(seriesId, videoId, order);
    }
  } catch (error) {
    logServiceError(error, 'video-upload');
    const { mockAddVideoToSeries } = await import('@/lib/mocks/video-upload.mock');
    return mockAddVideoToSeries(seriesId, videoId, order);
  }
}

export async function removeVideoFromSeries(
  seriesId: string,
  videoId: string,
): Promise<void> {
  try {
    if (isMock()) {
      const { mockRemoveVideoFromSeries } = await import('@/lib/mocks/video-upload.mock');
      return mockRemoveVideoFromSeries(seriesId, videoId);
    }

    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      const { error } = await supabase
        .from('video_series_items')
        .delete()
        .eq('series_id', seriesId)
        .eq('video_id', videoId);

      if (error) {
        logServiceError(error, 'video-upload');
      }
    } catch (err) {
      logServiceError(err, 'video-upload');
      const { mockRemoveVideoFromSeries } = await import('@/lib/mocks/video-upload.mock');
      return mockRemoveVideoFromSeries(seriesId, videoId);
    }
  } catch (error) {
    logServiceError(error, 'video-upload');
    const { mockRemoveVideoFromSeries } = await import('@/lib/mocks/video-upload.mock');
    return mockRemoveVideoFromSeries(seriesId, videoId);
  }
}

// ── Query: series by academy ────────────────────────────────────────

export async function getSeriesByAcademy(academyId: string): Promise<VideoSeriesData[]> {
  try {
    if (isMock()) {
      const { mockGetSeriesByAcademy } = await import('@/lib/mocks/video-upload.mock');
      return mockGetSeriesByAcademy(academyId);
    }

    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      const { data: seriesRows, error } = await supabase
        .from('video_series')
        .select('*')
        .eq('academy_id', academyId)
        .order('sort_order');

      if (error) {
        logServiceError(error, 'video-upload');
        return [];
      }

      const seriesIds = (seriesRows || []).map((s: Record<string, unknown>) => s.id as string);

      const { data: allItems } = await supabase
        .from('video_series_items')
        .select('series_id, video_id, sort_order, videos(title, thumbnail_storage_url, duration)')
        .in('series_id', seriesIds)
        .order('sort_order');

      return (seriesRows || []).map((s: Record<string, unknown>) => {
        const items = (allItems || []).filter((i: Record<string, unknown>) => i.series_id === s.id);
        const videos = items.map((i: Record<string, unknown>) => {
          const v = (i as Record<string, unknown>).videos as Record<string, unknown> | null;
          return {
            id: i.video_id as string,
            titulo: (v?.title as string) || '',
            thumbnail: (v?.thumbnail_storage_url as string) || '',
            duracao: formatDuration((v?.duration as number) || 0),
            sortOrder: (i.sort_order as number) || 0,
          };
        });

        return {
          id: s.id as string,
          titulo: (s.title as string) || '',
          descricao: (s.description as string) || undefined,
          thumbnailUrl: (s.thumbnail_url as string) || undefined,
          modalidade: (s.modality as string) || undefined,
          faixaMinima: (s.min_belt as string) || undefined,
          publico: (s.audience as string) || '',
          isPublished: (s.is_published as boolean) ?? true,
          videos,
        };
      });
    } catch (err) {
      logServiceError(err, 'video-upload');
      const { mockGetSeriesByAcademy } = await import('@/lib/mocks/video-upload.mock');
      return mockGetSeriesByAcademy(academyId);
    }
  } catch (error) {
    logServiceError(error, 'video-upload');
    const { mockGetSeriesByAcademy } = await import('@/lib/mocks/video-upload.mock');
    return mockGetSeriesByAcademy(academyId);
  }
}

// ── Storage stats ───────────────────────────────────────────────────

export async function getStorageStats(academyId: string): Promise<StorageStats> {
  try {
    if (isMock()) {
      const { mockGetStorageStats } = await import('@/lib/mocks/video-upload.mock');
      return mockGetStorageStats(academyId);
    }

    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      // Get from storage_usage table first
      const { data: usage } = await supabase
        .from('storage_usage')
        .select('*')
        .eq('academy_id', academyId)
        .single();

      if (usage) {
        const limitBytes = usage.storage_limit_bytes || 5368709120; // 5GB default
        const totalBytes = usage.total_size_bytes || 0;
        return {
          totalVideos: usage.total_videos || 0,
          totalSizeBytes: totalBytes,
          totalSizeFormatted: formatBytes(totalBytes),
          limitBytes,
          limitFormatted: formatBytes(limitBytes),
          usagePercent: limitBytes > 0 ? Math.round((totalBytes / limitBytes) * 100) : 0,
          videosThisMonth: 0, // Computed below if needed
        };
      }

      // Fallback: compute from videos table directly
      const { count } = await supabase
        .from('videos')
        .select('*', { count: 'exact', head: true })
        .eq('academy_id', academyId);

      const { data: sizeRows } = await supabase
        .from('videos')
        .select('file_size_bytes, created_at')
        .eq('academy_id', academyId);

      const totalBytes = (sizeRows || []).reduce(
        (sum: number, r: Record<string, unknown>) => sum + (Number(r.file_size_bytes) || 0),
        0,
      );

      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);
      const videosThisMonth = (sizeRows || []).filter(
        (r: Record<string, unknown>) => new Date(r.created_at as string) >= thisMonth,
      ).length;

      const limitBytes = 5368709120; // 5GB default

      return {
        totalVideos: count || 0,
        totalSizeBytes: totalBytes,
        totalSizeFormatted: formatBytes(totalBytes),
        limitBytes,
        limitFormatted: formatBytes(limitBytes),
        usagePercent: limitBytes > 0 ? Math.round((totalBytes / limitBytes) * 100) : 0,
        videosThisMonth,
      };
    } catch (err) {
      logServiceError(err, 'video-upload');
      const { mockGetStorageStats } = await import('@/lib/mocks/video-upload.mock');
      return mockGetStorageStats(academyId);
    }
  } catch (error) {
    logServiceError(error, 'video-upload');
    const { mockGetStorageStats } = await import('@/lib/mocks/video-upload.mock');
    return mockGetStorageStats(academyId);
  }
}

// ── Signed URL ──────────────────────────────────────────────────────

export async function getSignedUrl(storagePath: string): Promise<string> {
  try {
    if (isMock()) {
      const { mockGetSignedUrl } = await import('@/lib/mocks/video-upload.mock');
      return mockGetSignedUrl(storagePath);
    }

    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      const { data, error } = await supabase.storage
        .from('videos')
        .createSignedUrl(storagePath, 3600); // 1 hour expiry

      if (error || !data?.signedUrl) {
        logServiceError(error, 'video-upload');
        const { mockGetSignedUrl } = await import('@/lib/mocks/video-upload.mock');
        return mockGetSignedUrl(storagePath);
      }

      return data.signedUrl;
    } catch (err) {
      logServiceError(err, 'video-upload');
      const { mockGetSignedUrl } = await import('@/lib/mocks/video-upload.mock');
      return mockGetSignedUrl(storagePath);
    }
  } catch (error) {
    logServiceError(error, 'video-upload');
    const { mockGetSignedUrl } = await import('@/lib/mocks/video-upload.mock');
    return mockGetSignedUrl(storagePath);
  }
}

// ── Thumbnail generation (client-side) ──────────────────────────────

export async function generateThumbnailFromVideo(videoFile: File): Promise<Blob> {
  try {
    if (isMock()) {
      const { mockGenerateThumbnailFromVideo } = await import('@/lib/mocks/video-upload.mock');
      return mockGenerateThumbnailFromVideo(videoFile);
    }

    return new Promise<Blob>((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context not available'));
        return;
      }

      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;

      video.onloadeddata = () => {
        video.currentTime = Math.min(1, video.duration * 0.1);
      };

      video.onseeked = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(video.src);
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to generate thumbnail blob'));
            }
          },
          'image/jpeg',
          0.85,
        );
      };

      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        reject(new Error('Failed to load video for thumbnail generation'));
      };

      video.src = URL.createObjectURL(videoFile);
    });
  } catch (error) {
    logServiceError(error, 'video-upload');
    const { mockGenerateThumbnailFromVideo } = await import('@/lib/mocks/video-upload.mock');
    return mockGenerateThumbnailFromVideo(videoFile);
  }
}
