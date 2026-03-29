import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

export type TechniqueModality = 'bjj' | 'muay-thai' | 'judo' | 'wrestling' | 'mma';
export type TechniqueCategory = 'finaliza\u00e7\u00e3o' | 'passagem' | 'raspagem' | 'queda' | 'defesa' | 'posi\u00e7\u00e3o' | 'transi\u00e7\u00e3o' | 'striking';
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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    let query = supabase.from('techniques').select('*');
    if (filters?.modality) query = query.eq('modality', filters.modality);
    if (filters?.category) query = query.eq('category', filters.category);
    if (filters?.belt_level) query = query.eq('belt_level', filters.belt_level);
    if (filters?.search) query = query.ilike('name', `%${filters.search}%`);
    const { data, error } = await query.order('name');
    if (error) {
      logServiceError(error, 'techniques');
      return [];
    }
    return (data ?? []) as TechniqueDTO[];
  } catch (error) {
    logServiceError(error, 'techniques');
    return [];
  }
}

export async function getTechniqueById(techniqueId: string): Promise<TechniqueDTO> {
  try {
    if (isMock()) {
      const { mockGetTechniqueById } = await import('@/lib/mocks/techniques.mock');
      return mockGetTechniqueById(techniqueId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('techniques')
      .select('*')
      .eq('id', techniqueId)
      .single();
    if (error || !data) {
      logServiceError(error, 'techniques');
      const { mockGetTechniqueById } = await import('@/lib/mocks/techniques.mock');
      return mockGetTechniqueById(techniqueId);
    }
    return data as TechniqueDTO;
  } catch (error) {
    logServiceError(error, 'techniques');
    const { mockGetTechniqueById } = await import('@/lib/mocks/techniques.mock');
    return mockGetTechniqueById(techniqueId);
  }
}

export async function createTechnique(technique: Omit<TechniqueDTO, 'id' | 'created_at' | 'updated_at'>): Promise<TechniqueDTO> {
  try {
    if (isMock()) {
      const { mockCreateTechnique } = await import('@/lib/mocks/techniques.mock');
      return mockCreateTechnique(technique);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('techniques')
      .insert(technique)
      .select()
      .single();
    if (error || !data) {
      logServiceError(error, 'techniques');
      const { mockCreateTechnique } = await import('@/lib/mocks/techniques.mock');
      return mockCreateTechnique(technique);
    }
    return data as TechniqueDTO;
  } catch (error) {
    logServiceError(error, 'techniques');
    const { mockCreateTechnique } = await import('@/lib/mocks/techniques.mock');
    return mockCreateTechnique(technique);
  }
}

export async function getByModality(modality: TechniqueModality): Promise<TechniqueDTO[]> {
  try {
    if (isMock()) {
      const { mockGetByModality } = await import('@/lib/mocks/techniques.mock');
      return mockGetByModality(modality);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('techniques')
      .select('*')
      .eq('modality', modality)
      .order('name');
    if (error) {
      logServiceError(error, 'techniques');
      return [];
    }
    return (data ?? []) as TechniqueDTO[];
  } catch (error) {
    logServiceError(error, 'techniques');
    return [];
  }
}
