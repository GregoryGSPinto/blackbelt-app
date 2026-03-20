import { isMock } from '@/lib/env';

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

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('franchise_curriculos')
      .select('*')
      .eq('franchise_id', franchiseId)
      .order('modality', { ascending: true });

    if (error) {
      console.warn('[getCurriculos] error:', error.message);
      return [];
    }

    return (data ?? []) as unknown as CurriculoRede[];
  } catch (error) {
    console.warn('[getCurriculos] Fallback:', error);
    return [];
  }
}

export async function getCurriculoOverview(franchiseId: string): Promise<CurriculoOverview> {
  try {
    if (isMock()) {
      const { mockGetCurriculoOverview } = await import('@/lib/mocks/franqueador-curriculo.mock');
      return mockGetCurriculoOverview(franchiseId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('franchise_curriculos')
      .select('modality, techniques')
      .eq('franchise_id', franchiseId);

    if (error) {
      console.warn('[getCurriculoOverview] error:', error.message);
      return { modalities: [], total_curriculos: 0, total_techniques: 0 };
    }

    const rows = (data ?? []) as Record<string, unknown>[];
    const modalitySet = new Set<string>();
    let totalTechniques = 0;

    for (const row of rows) {
      if (row.modality) modalitySet.add(row.modality as string);
      const techs = row.techniques as unknown[];
      if (Array.isArray(techs)) totalTechniques += techs.length;
    }

    return {
      modalities: Array.from(modalitySet),
      total_curriculos: rows.length,
      total_techniques: totalTechniques,
    };
  } catch (error) {
    console.warn('[getCurriculoOverview] Fallback:', error);
    return { modalities: [], total_curriculos: 0, total_techniques: 0 };
  }
}

export async function getCurriculoDetail(curriculoId: string): Promise<CurriculoRede> {
  try {
    if (isMock()) {
      const { mockGetCurriculoDetail } = await import('@/lib/mocks/franqueador-curriculo.mock');
      return mockGetCurriculoDetail(curriculoId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('franchise_curriculos')
      .select('*')
      .eq('id', curriculoId)
      .single();

    if (error) {
      console.warn('[getCurriculoDetail] error:', error.message);
      return {} as CurriculoRede;
    }

    return data as unknown as CurriculoRede;
  } catch (error) {
    console.warn('[getCurriculoDetail] Fallback:', error);
    return {} as CurriculoRede;
  }
}
