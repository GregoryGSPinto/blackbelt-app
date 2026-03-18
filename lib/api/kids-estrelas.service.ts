import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

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
    // API not yet implemented — use mock
    const { mockGetKidsProfile } = await import('@/lib/mocks/kids-estrelas.mock');
      return mockGetKidsProfile(studentId);
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
    // API not yet implemented — use mock
    const { mockGetEstrelasHistorico } = await import('@/lib/mocks/kids-estrelas.mock');
      return mockGetEstrelasHistorico(studentId);
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
    // API not yet implemented — use mock
    const { mockGetRecompensas } = await import('@/lib/mocks/kids-estrelas.mock');
      return mockGetRecompensas(studentId);
  } catch (error) {
    handleServiceError(error, 'kids-estrelas.recompensas');
  }
}
