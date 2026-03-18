import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

// --- DTOs ---

export interface TecnicaCurriculo {
  id: string;
  name: string;
  category: 'fundamento' | 'avancado' | 'competicao' | 'defesa_pessoal';
  description: string;
  video_url: string | null;
  required: boolean;
}

export interface CurriculoRede {
  id: string;
  modality: string;
  belt_level: string;
  name: string;
  description: string;
  techniques: TecnicaCurriculo[];
  min_classes_required: number;
  evaluation_criteria: string[];
  created_at: string;
  updated_at: string;
}

export interface CurriculoOverview {
  modalities: string[];
  total_curriculos: number;
  total_techniques: number;
}

// --- Service Functions ---

export async function getCurriculos(franchiseId: string): Promise<CurriculoRede[]> {
  try {
    if (isMock()) {
      const { mockGetCurriculos } = await import('@/lib/mocks/franqueador-curriculo.mock');
      return mockGetCurriculos(franchiseId);
    }
    try {
      const res = await fetch(`/api/franchise/${franchiseId}/curriculos`);
      if (!res.ok) throw new ServiceError(res.status, 'franqueador-curriculo.list');
      return res.json();
    } catch {
      console.warn('[franqueador-curriculo.getCurriculos] API not available, using mock fallback');
      const { mockGetCurriculos } = await import('@/lib/mocks/franqueador-curriculo.mock');
      return mockGetCurriculos(franchiseId);
    }
  } catch (error) { handleServiceError(error, 'franqueador-curriculo.list'); }
}

export async function getCurriculoOverview(franchiseId: string): Promise<CurriculoOverview> {
  try {
    if (isMock()) {
      const { mockGetCurriculoOverview } = await import('@/lib/mocks/franqueador-curriculo.mock');
      return mockGetCurriculoOverview(franchiseId);
    }
    try {
      const res = await fetch(`/api/franchise/${franchiseId}/curriculos/overview`);
      if (!res.ok) throw new ServiceError(res.status, 'franqueador-curriculo.overview');
      return res.json();
    } catch {
      console.warn('[franqueador-curriculo.getCurriculoOverview] API not available, using mock fallback');
      const { mockGetCurriculoOverview } = await import('@/lib/mocks/franqueador-curriculo.mock');
      return mockGetCurriculoOverview(franchiseId);
    }
  } catch (error) { handleServiceError(error, 'franqueador-curriculo.overview'); }
}

export async function getCurriculoDetail(curriculoId: string): Promise<CurriculoRede> {
  try {
    if (isMock()) {
      const { mockGetCurriculoDetail } = await import('@/lib/mocks/franqueador-curriculo.mock');
      return mockGetCurriculoDetail(curriculoId);
    }
    try {
      const res = await fetch(`/api/franchise/curriculos/${curriculoId}`);
      if (!res.ok) throw new ServiceError(res.status, 'franqueador-curriculo.detail');
      return res.json();
    } catch {
      console.warn('[franqueador-curriculo.getCurriculoDetail] API not available, using mock fallback');
      const { mockGetCurriculoDetail } = await import('@/lib/mocks/franqueador-curriculo.mock');
      return mockGetCurriculoDetail(curriculoId);
    }
  } catch (error) { handleServiceError(error, 'franqueador-curriculo.detail'); }
}
