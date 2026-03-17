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
    throw new Error('Not implemented');
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
    throw new Error('Not implemented');
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
    throw new Error('Not implemented');
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
    throw new Error('Not implemented');
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
    throw new Error('Not implemented');
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
    throw new Error('Not implemented');
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
    throw new Error('Not implemented');
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
    throw new Error('Not implemented');
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
    throw new Error('Not implemented');
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
    throw new Error('Not implemented');
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
    throw new Error('Not implemented');
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
    throw new Error('Not implemented');
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
    throw new Error('Not implemented');
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
    throw new Error('Not implemented');
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
    throw new Error('Not implemented');
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
    throw new Error('Not implemented');
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
    throw new Error('Not implemented');
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
    throw new Error('Not implemented');
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
    throw new Error('Not implemented');
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
    throw new Error('Not implemented');
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
    throw new Error('Not implemented');
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
    throw new Error('Not implemented');
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
    throw new Error('Not implemented');
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
    throw new Error('Not implemented');
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
    throw new Error('Not implemented');
  } catch (error) {
    handleServiceError(error, 'content.getVideoAnalytics');
  }
}
