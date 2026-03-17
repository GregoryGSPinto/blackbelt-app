import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

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
    console.warn('[bancoTecnicas.list] fallback — not yet connected to Supabase');
    return [];
  } catch (error) {
    handleServiceError(error, 'bancoTecnicas.list');
  }
}

export async function getTecnica(id: string): Promise<Tecnica> {
  try {
    if (isMock()) {
      const { mockGetTecnica } = await import('@/lib/mocks/banco-tecnicas.mock');
      return mockGetTecnica(id);
    }
    console.warn('[bancoTecnicas.get] fallback — not yet connected to Supabase');
    return { id, nome: '', posicao: '', categoria: '', modalidade: '', faixaMinima: '', descricao: '', criadoPor: '', tags: [] } as Tecnica;
  } catch (error) {
    handleServiceError(error, 'bancoTecnicas.get');
  }
}

export async function createTecnica(dados: CreateTecnicaPayload): Promise<Tecnica> {
  try {
    if (isMock()) {
      const { mockCreateTecnica } = await import('@/lib/mocks/banco-tecnicas.mock');
      return mockCreateTecnica(dados);
    }
    console.warn('[bancoTecnicas.create] fallback — not yet connected to Supabase');
    return { id: '', nome: dados.nome, posicao: dados.posicao, categoria: dados.categoria, modalidade: dados.modalidade, faixaMinima: dados.faixaMinima, descricao: dados.descricao, criadoPor: '', tags: dados.tags } as Tecnica;
  } catch (error) {
    handleServiceError(error, 'bancoTecnicas.create');
  }
}

export async function searchTecnicas(query: string): Promise<Tecnica[]> {
  try {
    if (isMock()) {
      const { mockSearchTecnicas } = await import('@/lib/mocks/banco-tecnicas.mock');
      return mockSearchTecnicas(query);
    }
    console.warn('[bancoTecnicas.search] fallback — not yet connected to Supabase');
    return [];
  } catch (error) {
    handleServiceError(error, 'bancoTecnicas.search');
  }
}
