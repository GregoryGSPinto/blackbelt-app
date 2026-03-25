import { isMock } from '@/lib/env';
import type { BeltLevel } from '@/lib/types';

export interface MeuProgressoDTO {
  faixa_atual: BeltLevel;
  data_promocao: string;
  tempo_na_faixa_dias: number;
  total_aulas: number;
  media_avaliacoes: number;
}

export interface HistoricoFaixaDTO {
  id: string;
  from_belt: BeltLevel;
  to_belt: BeltLevel;
  date: string;
  evaluated_by_name: string;
}

export interface RequisitoProximaFaixaDTO {
  proxima_faixa: BeltLevel;
  presenca: { necessario: number; atual: number; percentual: number };
  avaliacao: { necessario: number; atual: number; percentual: number };
  tempo_minimo_meses: number;
  tempo_atual_meses: number;
  completo: boolean;
}

export async function getMeuProgresso(studentId: string): Promise<MeuProgressoDTO> {
  try {
    if (isMock()) {
      const { mockGetMeuProgresso } = await import('@/lib/mocks/evolucao.mock');
      return mockGetMeuProgresso(studentId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('student_progress')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle();
    if (error || !data) {
      console.error('[getMeuProgresso] Supabase error:', error?.message);
      const { mockGetMeuProgresso } = await import('@/lib/mocks/evolucao.mock');
      return mockGetMeuProgresso(studentId);
    }
    return data as unknown as MeuProgressoDTO;
  } catch (error) {
    console.error('[getMeuProgresso] Fallback:', error);
    const { mockGetMeuProgresso } = await import('@/lib/mocks/evolucao.mock');
    return mockGetMeuProgresso(studentId);
  }
}

export async function getHistoricoFaixas(studentId: string): Promise<HistoricoFaixaDTO[]> {
  try {
    if (isMock()) {
      const { mockGetHistoricoFaixas } = await import('@/lib/mocks/evolucao.mock');
      return mockGetHistoricoFaixas(studentId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('belt_history')
      .select('*')
      .eq('student_id', studentId)
      .order('date', { ascending: true });
    if (error) {
      console.error('[getHistoricoFaixas] Supabase error:', error.message);
      return [];
    }
    return (data ?? []) as unknown as HistoricoFaixaDTO[];
  } catch (error) {
    console.error('[getHistoricoFaixas] Fallback:', error);
    return [];
  }
}

export async function getRequisitoProximaFaixa(studentId: string): Promise<RequisitoProximaFaixaDTO> {
  try {
    if (isMock()) {
      const { mockGetRequisitoProximaFaixa } = await import('@/lib/mocks/evolucao.mock');
      return mockGetRequisitoProximaFaixa(studentId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('belt_requirements')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle();
    if (error || !data) {
      console.error('[getRequisitoProximaFaixa] Supabase error:', error?.message);
      const { mockGetRequisitoProximaFaixa } = await import('@/lib/mocks/evolucao.mock');
      return mockGetRequisitoProximaFaixa(studentId);
    }
    return data as unknown as RequisitoProximaFaixaDTO;
  } catch (error) {
    console.error('[getRequisitoProximaFaixa] Fallback:', error);
    const { mockGetRequisitoProximaFaixa } = await import('@/lib/mocks/evolucao.mock');
    return mockGetRequisitoProximaFaixa(studentId);
  }
}
