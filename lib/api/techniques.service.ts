import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

export type TechniqueModality = 'bjj' | 'muay-thai' | 'judo' | 'wrestling' | 'mma';
export type TechniqueCategory = 'finalização' | 'passagem' | 'raspagem' | 'queda' | 'defesa' | 'posição' | 'transição' | 'striking';
export type BeltLevel = 'branca' | 'azul' | 'roxa' | 'marrom' | 'preta';

export interface TechniqueDTO {
  id: string;
  name: string;
  modality: TechniqueModality;
  belt_level: BeltLevel;
  category: TechniqueCategory;
  tags: string[];
  description: string;
  video_url: string;
  thumbnail_url: string;
  key_points: string[];
  created_at: string;
  updated_at: string;
}

export async function listTechniques(filters?: { modality?: TechniqueModality; category?: TechniqueCategory; belt_level?: BeltLevel; search?: string }): Promise<TechniqueDTO[]> {
  try {
    if (isMock()) {
      const { mockListTechniques } = await import('@/lib/mocks/techniques.mock');
      return mockListTechniques(filters);
    }
    try {
      const params = new URLSearchParams();
      if (filters?.modality) params.set('modality', filters.modality);
      if (filters?.category) params.set('category', filters.category);
      if (filters?.belt_level) params.set('belt_level', filters.belt_level);
      if (filters?.search) params.set('search', filters.search);
      const res = await fetch(`/api/techniques?${params}`);
      if (!res.ok) throw new ServiceError(res.status, 'techniques.list');
      return res.json();
    } catch {
      console.warn('[techniques.listTechniques] API not available, using fallback');
      return [];
    }
  } catch (error) { handleServiceError(error, 'techniques.list'); }
}

export async function getTechniqueById(techniqueId: string): Promise<TechniqueDTO> {
  try {
    if (isMock()) {
      const { mockGetTechniqueById } = await import('@/lib/mocks/techniques.mock');
      return mockGetTechniqueById(techniqueId);
    }
    try {
      const res = await fetch(`/api/techniques/${techniqueId}`);
      if (!res.ok) throw new ServiceError(res.status, 'techniques.getById');
      return res.json();
    } catch {
      console.warn('[techniques.getTechniqueById] API not available, using fallback');
      return { id: "", name: "", description: "", category: "", belt_level: "white", video_url: null, modality: "", difficulty: 0 } as unknown as TechniqueDTO;
    }
  } catch (error) { handleServiceError(error, 'techniques.getById'); }
}

export async function createTechnique(technique: Omit<TechniqueDTO, 'id' | 'created_at' | 'updated_at'>): Promise<TechniqueDTO> {
  try {
    if (isMock()) {
      const { mockCreateTechnique } = await import('@/lib/mocks/techniques.mock');
      return mockCreateTechnique(technique);
    }
    try {
      const res = await fetch('/api/techniques', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(technique) });
      if (!res.ok) throw new ServiceError(res.status, 'techniques.create');
      return res.json();
    } catch {
      console.warn('[techniques.createTechnique] API not available, using fallback');
      return { id: "", name: "", description: "", category: "", belt_level: "white", video_url: null, modality: "", difficulty: 0 } as unknown as TechniqueDTO;
    }
  } catch (error) { handleServiceError(error, 'techniques.create'); }
}

export async function getByModality(modality: TechniqueModality): Promise<TechniqueDTO[]> {
  try {
    if (isMock()) {
      const { mockGetByModality } = await import('@/lib/mocks/techniques.mock');
      return mockGetByModality(modality);
    }
    try {
      const res = await fetch(`/api/techniques?modality=${modality}`);
      if (!res.ok) throw new ServiceError(res.status, 'techniques.getByModality');
      return res.json();
    } catch {
      console.warn('[techniques.getByModality] API not available, using fallback');
      return [];
    }
  } catch (error) { handleServiceError(error, 'techniques.getByModality'); }
}
