import { isMock } from '@/lib/env';

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

    const formData = new FormData();
    formData.append('file', data.file);
    if (data.thumbnail) formData.append('thumbnail', data.thumbnail);
    formData.append('titulo', data.titulo);
    formData.append('descricao', data.descricao);
    if (data.descricaoCompleta) formData.append('descricaoCompleta', data.descricaoCompleta);
    formData.append('modalidade', data.modalidade);
    formData.append('faixaMinima', data.faixaMinima);
    formData.append('dificuldade', data.dificuldade);
    formData.append('categoria', data.categoria);
    formData.append('tags', JSON.stringify(data.tags));
    formData.append('turmaIds', JSON.stringify(data.turmaIds));
    formData.append('publicos', JSON.stringify(data.publicos));
    if (data.serieId) formData.append('serieId', data.serieId);

    const res = await fetch(`/api/video-upload/${academyId}`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch {
    console.warn('[video-upload] uploadVideo: API not available, using mock');
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

    const res = await fetch(`/api/video-upload/videos/${videoId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch {
    console.warn('[video-upload] deleteUploadedVideo: API not available, using mock');
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

    const res = await fetch(`/api/video-upload/videos/${videoId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch {
    console.warn('[video-upload] updateUploadedVideo: API not available, using mock');
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

    const res = await fetch(`/api/video-upload/videos/${videoId}/publish`, { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch {
    console.warn('[video-upload] publishUploadedVideo: API not available, using mock');
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

    const res = await fetch(`/api/video-upload/videos/${videoId}/unpublish`, { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch {
    console.warn('[video-upload] unpublishUploadedVideo: API not available, using mock');
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

    const res = await fetch(`/api/video-upload/${academyId}/videos`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch {
    console.warn('[video-upload] getVideosByAcademy: API not available, using mock');
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

    const res = await fetch(`/api/video-upload/classes/${classId}/videos`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch {
    console.warn('[video-upload] getVideosByClass: API not available, using mock');
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

    const res = await fetch(`/api/video-upload/${academyId}/videos?audience=${encodeURIComponent(audience)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch {
    console.warn('[video-upload] getVideosByAudience: API not available, using mock');
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

    const res = await fetch(`/api/video-upload/professors/${professorId}/videos`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch {
    console.warn('[video-upload] getVideosByProfessor: API not available, using mock');
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

    const res = await fetch(`/api/video-upload/${academyId}/series`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch {
    console.warn('[video-upload] createVideoSeries: API not available, using mock');
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

    const res = await fetch(`/api/video-upload/series/${seriesId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch {
    console.warn('[video-upload] updateVideoSeries: API not available, using mock');
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

    const res = await fetch(`/api/video-upload/series/${seriesId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch {
    console.warn('[video-upload] deleteVideoSeries: API not available, using mock');
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

    const res = await fetch(`/api/video-upload/series/${seriesId}/videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId, order }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch {
    console.warn('[video-upload] addVideoToSeries: API not available, using mock');
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

    const res = await fetch(`/api/video-upload/series/${seriesId}/videos/${videoId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch {
    console.warn('[video-upload] removeVideoFromSeries: API not available, using mock');
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

    const res = await fetch(`/api/video-upload/${academyId}/series`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch {
    console.warn('[video-upload] getSeriesByAcademy: API not available, using mock');
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

    const res = await fetch(`/api/video-upload/${academyId}/storage-stats`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch {
    console.warn('[video-upload] getStorageStats: API not available, using mock');
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

    const res = await fetch(`/api/video-upload/signed-url?path=${encodeURIComponent(storagePath)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json: { url: string } = await res.json();
    return json.url;
  } catch {
    console.warn('[video-upload] getSignedUrl: API not available, using mock');
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
  } catch {
    console.warn('[video-upload] generateThumbnailFromVideo: client-side failed, using mock');
    const { mockGenerateThumbnailFromVideo } = await import('@/lib/mocks/video-upload.mock');
    return mockGenerateThumbnailFromVideo(videoFile);
  }
}
