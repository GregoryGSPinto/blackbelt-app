import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

export interface MascoteOption {
  id: string;
  nome: string;
  emoji: string;
  desbloqueado: boolean;
  requisito?: string;
}

export interface MolduraOption {
  id: string;
  nome: string;
  css: string;
  desbloqueada: boolean;
  requisito?: string;
}

export interface CorOption {
  id: string;
  nome: string;
  hex: string;
  desbloqueada: boolean;
  requisito?: string;
}

export interface TituloOption {
  titulo: string;
  emoji: string;
  desbloqueado: boolean;
  requisito?: string;
}

export interface PersonalizacaoKids {
  mascotesDisponiveis: MascoteOption[];
  mascoteAtual: string;
  molduras: MolduraOption[];
  molduraAtual: string;
  cores: CorOption[];
  corAtual: string;
  titulosDisponiveis: TituloOption[];
  tituloAtual: string;
}

export async function getPersonalizacao(studentId: string): Promise<PersonalizacaoKids> {
  try {
    if (isMock()) {
      const { mockGetPersonalizacao } = await import('@/lib/mocks/kids-personalizacao.mock');
      return mockGetPersonalizacao(studentId);
    }
    // API not yet implemented — use mock
    const { mockGetPersonalizacao } = await import('@/lib/mocks/kids-personalizacao.mock');
      return mockGetPersonalizacao(studentId);
  } catch (error) {
    handleServiceError(error, 'kids-personalizacao.get');
  }
}

export async function setMascoteKids(studentId: string, mascoteId: string): Promise<{ sucesso: boolean }> {
  try {
    if (isMock()) {
      const { mockSetMascoteKids } = await import('@/lib/mocks/kids-personalizacao.mock');
      return mockSetMascoteKids(studentId, mascoteId);
    }
    try {
      const res = await fetch('/api/kids/personalizacao/mascote', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, mascoteId }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'kids-personalizacao.setMascote');
      return res.json();
    } catch {
      console.warn('[kids-personalizacao.setMascoteKids] API not available, using mock fallback');
      const { mockSetMascoteKids } = await import('@/lib/mocks/kids-personalizacao.mock');
      return mockSetMascoteKids(studentId, mascoteId);
    }
  } catch (error) {
    handleServiceError(error, 'kids-personalizacao.setMascote');
  }
}

export async function setCorKids(studentId: string, corId: string): Promise<{ sucesso: boolean }> {
  try {
    if (isMock()) {
      const { mockSetCorKids } = await import('@/lib/mocks/kids-personalizacao.mock');
      return mockSetCorKids(studentId, corId);
    }
    try {
      const res = await fetch('/api/kids/personalizacao/cor', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, corId }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'kids-personalizacao.setCor');
      return res.json();
    } catch {
      console.warn('[kids-personalizacao.setCorKids] API not available, using mock fallback');
      const { mockSetCorKids } = await import('@/lib/mocks/kids-personalizacao.mock');
      return mockSetCorKids(studentId, corId);
    }
  } catch (error) {
    handleServiceError(error, 'kids-personalizacao.setCor');
  }
}

export async function setTituloKids(studentId: string, titulo: string): Promise<{ sucesso: boolean }> {
  try {
    if (isMock()) {
      const { mockSetTituloKids } = await import('@/lib/mocks/kids-personalizacao.mock');
      return mockSetTituloKids(studentId, titulo);
    }
    try {
      const res = await fetch('/api/kids/personalizacao/titulo', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, titulo }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'kids-personalizacao.setTitulo');
      return res.json();
    } catch {
      console.warn('[kids-personalizacao.setTituloKids] API not available, using mock fallback');
      const { mockSetTituloKids } = await import('@/lib/mocks/kids-personalizacao.mock');
      return mockSetTituloKids(studentId, titulo);
    }
  } catch (error) {
    handleServiceError(error, 'kids-personalizacao.setTitulo');
  }
}
