import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

export interface KidsProfile {
  id: string;
  nome: string;
  avatar: string;
  mascote: string;
  corFavorita: string;
  faixaAtual: string;
  faixaCor: string;
  idadeAnos: number;
  estrelasTotal: number;
  estrelasEstaSemana: number;
  estrelasEsteMes: number;
  nivel: number;
  nomeNivel: string;
  estrelasParaProximoNivel: number;
  estrelasAtualNoNivel: number;
  diasSeguidos: number;
  recordeDiasSeguidos: number;
  figurinhasColetadas: number;
  figurinhasTotal: number;
  tituloAtual: string;
}

export interface EstrelaHistorico {
  data: string;
  estrelas: number;
  motivo: string;
}

export interface RecompensaEstrela {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
  custoEstrelas: number;
  tipo: 'figurinha_especial' | 'titulo' | 'moldura_avatar' | 'premio_fisico';
  disponivel: boolean;
  jaResgatada: boolean;
  entregue?: boolean;
}

export async function getKidsProfile(studentId: string): Promise<KidsProfile> {
  try {
    if (isMock()) {
      const { mockGetKidsProfile } = await import('@/lib/mocks/kids-estrelas.mock');
      return mockGetKidsProfile(studentId);
    }
    try {
      const res = await fetch(`/api/kids/profile?studentId=${studentId}`);
      if (!res.ok) throw new ServiceError(res.status, 'kids-estrelas.profile');
      return res.json();
    } catch {
      console.warn('[kids-estrelas.getKidsProfile] API not available, using fallback');
      return { id: '', nome: '', avatar: '', mascote: '', corFavorita: '', faixaAtual: '', faixaCor: '', idadeAnos: 0, estrelasTotal: 0, estrelasEstaSemana: 0, estrelasEsteMes: 0, nivel: 0, nomeNivel: '', estrelasParaProximoNivel: 0, estrelasAtualNoNivel: 0, diasSeguidos: 0, recordeDiasSeguidos: 0, figurinhasColetadas: 0, figurinhasTotal: 0, tituloAtual: '' } as KidsProfile;
    }
  } catch (error) {
    handleServiceError(error, 'kids-estrelas.profile');
  }
}

export async function getEstrelasHistorico(studentId: string): Promise<EstrelaHistorico[]> {
  try {
    if (isMock()) {
      const { mockGetEstrelasHistorico } = await import('@/lib/mocks/kids-estrelas.mock');
      return mockGetEstrelasHistorico(studentId);
    }
    try {
      const res = await fetch(`/api/kids/estrelas/historico?studentId=${studentId}`);
      if (!res.ok) throw new ServiceError(res.status, 'kids-estrelas.historico');
      return res.json();
    } catch {
      console.warn('[kids-estrelas.getEstrelasHistorico] API not available, using fallback');
      return [];
    }
  } catch (error) {
    handleServiceError(error, 'kids-estrelas.historico');
  }
}

export async function getRecompensas(studentId: string): Promise<RecompensaEstrela[]> {
  try {
    if (isMock()) {
      const { mockGetRecompensas } = await import('@/lib/mocks/kids-estrelas.mock');
      return mockGetRecompensas(studentId);
    }
    try {
      const res = await fetch(`/api/kids/estrelas/recompensas?studentId=${studentId}`);
      if (!res.ok) throw new ServiceError(res.status, 'kids-estrelas.recompensas');
      return res.json();
    } catch {
      console.warn('[kids-estrelas.getRecompensas] API not available, using fallback');
      return [];
    }
  } catch (error) {
    handleServiceError(error, 'kids-estrelas.recompensas');
  }
}
