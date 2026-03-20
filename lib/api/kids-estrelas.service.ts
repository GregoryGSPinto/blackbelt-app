import { isMock } from '@/lib/env';

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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('kids_profiles')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle();
    if (error || !data) {
      console.warn('[getKidsProfile] Supabase error:', error?.message);
      const { mockGetKidsProfile } = await import('@/lib/mocks/kids-estrelas.mock');
      return mockGetKidsProfile(studentId);
    }
    return data as unknown as KidsProfile;
  } catch (error) {
    console.warn('[getKidsProfile] Fallback:', error);
    const { mockGetKidsProfile } = await import('@/lib/mocks/kids-estrelas.mock');
    return mockGetKidsProfile(studentId);
  }
}

export async function getEstrelasHistorico(studentId: string): Promise<EstrelaHistorico[]> {
  try {
    if (isMock()) {
      const { mockGetEstrelasHistorico } = await import('@/lib/mocks/kids-estrelas.mock');
      return mockGetEstrelasHistorico(studentId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('kids_estrelas_historico')
      .select('*')
      .eq('student_id', studentId)
      .order('data', { ascending: false });
    if (error) {
      console.warn('[getEstrelasHistorico] Supabase error:', error.message);
      return [];
    }
    return (data ?? []) as unknown as EstrelaHistorico[];
  } catch (error) {
    console.warn('[getEstrelasHistorico] Fallback:', error);
    return [];
  }
}

export async function getRecompensas(studentId: string): Promise<RecompensaEstrela[]> {
  try {
    if (isMock()) {
      const { mockGetRecompensas } = await import('@/lib/mocks/kids-estrelas.mock');
      return mockGetRecompensas(studentId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('kids_recompensas')
      .select('*')
      .eq('student_id', studentId);
    if (error) {
      console.warn('[getRecompensas] Supabase error:', error.message);
      return [];
    }
    return (data ?? []) as unknown as RecompensaEstrela[];
  } catch (error) {
    console.warn('[getRecompensas] Fallback:', error);
    return [];
  }
}
