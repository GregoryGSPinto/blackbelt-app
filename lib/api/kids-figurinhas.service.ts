import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

export interface Figurinha {
  id: string;
  nome: string;
  emoji: string;
  tema: 'animais_marciais' | 'golpes_especiais' | 'faixas_coloridas' | 'herois_tatame' | 'especial';
  raridade: 'comum' | 'rara' | 'super_rara' | 'lendaria';
  descricao: string;
  comoConseguir: string;
  coletada: boolean;
  coletadaEm?: string;
  brilho: boolean;
}

export interface AlbumTema {
  nome: string;
  emoji: string;
  total: number;
  coletadas: number;
  figurinhas: Figurinha[];
}

export interface AlbumFigurinhas {
  totalFigurinhas: number;
  coletadas: number;
  temas: AlbumTema[];
  proximaFigurinha: {
    nome: string;
    emoji: string;
    falta: string;
  };
}

export async function getAlbum(studentId: string): Promise<AlbumFigurinhas> {
  try {
    if (isMock()) {
      const { mockGetAlbum } = await import('@/lib/mocks/kids-figurinhas.mock');
      return mockGetAlbum(studentId);
    }
    try {
      const res = await fetch(`/api/kids/figurinhas/album?studentId=${studentId}`);
      if (!res.ok) throw new ServiceError(res.status, 'kids-figurinhas.album');
      return res.json();
    } catch {
      console.warn('[kids-figurinhas.getAlbum] API not available, using mock fallback');
      const { mockGetAlbum } = await import('@/lib/mocks/kids-figurinhas.mock');
      return mockGetAlbum(studentId);
    }
  } catch (error) {
    handleServiceError(error, 'kids-figurinhas.album');
  }
}
