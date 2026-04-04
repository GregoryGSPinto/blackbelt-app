import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

export interface RecompensaKids {
  id: string;
  nome: string;
  descricao: string;
  emoji: string;
  custoEstrelas: number;
  tipo: 'figurinha_especial' | 'titulo' | 'moldura' | 'cor_perfil' | 'premio_fisico';
  disponivel: boolean;
  jaResgatada: boolean;
  entregue?: boolean;
  estoque?: number | null;
}

export interface HistoricoResgate {
  id: string;
  recompensa: string;
  emoji: string;
  custoEstrelas: number;
  data: string;
  tipo: string;
  entregue: boolean;
}

export async function getRecompensasKids(studentId: string): Promise<RecompensaKids[]> {
  try {
    if (isMock()) {
      const { mockGetRecompensasKids } = await import('@/lib/mocks/kids-recompensas.mock');
      return mockGetRecompensasKids(studentId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('kids_recompensas')
      .select('*')
      .eq('student_id', studentId);
    if (error || !data) {
      logServiceError(error, 'kids-recompensas');
      return [];
    }
    return data as unknown as RecompensaKids[];
  } catch (error) {
    logServiceError(error, 'kids-recompensas');
    return [];
  }
}

export async function getHistoricoResgates(studentId: string): Promise<HistoricoResgate[]> {
  try {
    if (isMock()) {
      const { mockGetHistoricoResgates } = await import('@/lib/mocks/kids-recompensas.mock');
      return mockGetHistoricoResgates(studentId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('kids_resgates')
      .select('*')
      .eq('student_id', studentId)
      .order('data', { ascending: false });
    if (error || !data) {
      logServiceError(error, 'kids-recompensas');
      return [];
    }
    return data as unknown as HistoricoResgate[];
  } catch (error) {
    logServiceError(error, 'kids-recompensas');
    return [];
  }
}

export async function resgatarRecompensa(studentId: string, recompensaId: string): Promise<HistoricoResgate> {
  try {
    if (isMock()) {
      const { mockResgatarRecompensa } = await import('@/lib/mocks/kids-recompensas.mock');
      return mockResgatarRecompensa(studentId, recompensaId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase.rpc('resgatar_recompensa_kids', { p_student_id: studentId, p_recompensa_id: recompensaId });
    if (error || !data) {
      logServiceError(error, 'kids-recompensas');
      return {} as HistoricoResgate;
    }
    return data as unknown as HistoricoResgate;
  } catch (error) {
    logServiceError(error, 'kids-recompensas');
    return {} as HistoricoResgate;
  }
}
