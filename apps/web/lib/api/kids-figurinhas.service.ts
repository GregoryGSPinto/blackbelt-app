import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('kids_albums')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle();
    if (error || !data) {
      logServiceError(error, 'kids-figurinhas');
      const { mockGetAlbum } = await import('@/lib/mocks/kids-figurinhas.mock');
      return mockGetAlbum(studentId);
    }
    return data as unknown as AlbumFigurinhas;
  } catch (error) {
    logServiceError(error, 'kids-figurinhas');
    const { mockGetAlbum } = await import('@/lib/mocks/kids-figurinhas.mock');
    return mockGetAlbum(studentId);
  }
}
