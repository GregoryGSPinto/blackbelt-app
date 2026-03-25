import { isMock } from '@/lib/env';

// ── Types ──────────────────────────────────────────────────────────────

export interface Tecnica {
  id: string;
  nome: string;
  posicao: string;
  categoria: string;
  modalidade: string;
  faixaMinima: string;
  descricao: string;
  passos?: string[];
  dicas?: string[];
  variacoes?: string[];
  videoUrl?: string;
  criadoPor: string;
  tags: string[];
}

export interface TecnicaFiltros {
  modalidade?: string;
  posicao?: string;
  categoria?: string;
  faixaMinima?: string;
  query?: string;
}

export interface CreateTecnicaPayload {
  nome: string;
  posicao: string;
  categoria: string;
  modalidade: string;
  faixaMinima: string;
  descricao: string;
  passos?: string[];
  dicas?: string[];
  tags: string[];
}

// ── Service Functions ──────────────────────────────────────────────────

export async function listTecnicas(filtros?: TecnicaFiltros): Promise<Tecnica[]> {
  try {
    if (isMock()) {
      const { mockListTecnicas } = await import('@/lib/mocks/banco-tecnicas.mock');
      return mockListTecnicas(filtros);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    let query = supabase.from('tecnicas').select('*');
    if (filtros?.modalidade) query = query.eq('modalidade', filtros.modalidade);
    if (filtros?.posicao) query = query.eq('posicao', filtros.posicao);
    if (filtros?.categoria) query = query.eq('categoria', filtros.categoria);
    if (filtros?.faixaMinima) query = query.eq('faixa_minima', filtros.faixaMinima);
    if (filtros?.query) query = query.ilike('nome', `%${filtros.query}%`);
    const { data, error } = await query;
    if (error) {
      console.error('[listTecnicas] error:', error.message);
      return [];
    }
    return (data ?? []) as unknown as Tecnica[];
  } catch (error) {
    console.error('[listTecnicas] Fallback:', error);
    return [];
  }
}

export async function getTecnica(id: string): Promise<Tecnica> {
  try {
    if (isMock()) {
      const { mockGetTecnica } = await import('@/lib/mocks/banco-tecnicas.mock');
      return mockGetTecnica(id);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from('tecnicas').select('*').eq('id', id).single();
    if (error) {
      console.error('[getTecnica] error:', error.message);
      return { id, nome: '', posicao: '', categoria: '', modalidade: '', faixaMinima: '', descricao: '', criadoPor: '', tags: [] } as Tecnica;
    }
    return data as unknown as Tecnica;
  } catch (error) {
    console.error('[getTecnica] Fallback:', error);
    return { id, nome: '', posicao: '', categoria: '', modalidade: '', faixaMinima: '', descricao: '', criadoPor: '', tags: [] } as Tecnica;
  }
}

export async function createTecnica(dados: CreateTecnicaPayload): Promise<Tecnica> {
  try {
    if (isMock()) {
      const { mockCreateTecnica } = await import('@/lib/mocks/banco-tecnicas.mock');
      return mockCreateTecnica(dados);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from('tecnicas').insert(dados).select().single();
    if (error) {
      console.error('[createTecnica] error:', error.message);
      return { id: '', nome: dados.nome, posicao: dados.posicao, categoria: dados.categoria, modalidade: dados.modalidade, faixaMinima: dados.faixaMinima, descricao: dados.descricao, criadoPor: '', tags: dados.tags } as Tecnica;
    }
    return data as unknown as Tecnica;
  } catch (error) {
    console.error('[createTecnica] Fallback:', error);
    return { id: '', nome: dados.nome, posicao: dados.posicao, categoria: dados.categoria, modalidade: dados.modalidade, faixaMinima: dados.faixaMinima, descricao: dados.descricao, criadoPor: '', tags: dados.tags } as Tecnica;
  }
}

export async function searchTecnicas(query: string): Promise<Tecnica[]> {
  try {
    if (isMock()) {
      const { mockSearchTecnicas } = await import('@/lib/mocks/banco-tecnicas.mock');
      return mockSearchTecnicas(query);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.from('tecnicas').select('*').ilike('nome', `%${query}%`);
    if (error) {
      console.error('[searchTecnicas] error:', error.message);
      return [];
    }
    return (data ?? []) as unknown as Tecnica[];
  } catch (error) {
    console.error('[searchTecnicas] Fallback:', error);
    return [];
  }
}
