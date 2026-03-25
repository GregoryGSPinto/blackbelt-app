import { isMock } from '@/lib/env';

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
  const fallback: PersonalizacaoKids = { mascotesDisponiveis: [], mascoteAtual: '', molduras: [], molduraAtual: '', cores: [], corAtual: '', titulosDisponiveis: [], tituloAtual: '' };
  try {
    if (isMock()) {
      const { mockGetPersonalizacao } = await import('@/lib/mocks/kids-personalizacao.mock');
      return mockGetPersonalizacao(studentId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('kids_personalizacao')
      .select('*')
      .eq('student_id', studentId)
      .single();
    if (error || !data) {
      console.error('[getPersonalizacao] Supabase error:', error?.message);
      return fallback;
    }
    return data as unknown as PersonalizacaoKids;
  } catch (error) {
    console.error('[getPersonalizacao] Fallback:', error);
    return fallback;
  }
}

export async function setMascoteKids(studentId: string, mascoteId: string): Promise<{ sucesso: boolean }> {
  try {
    if (isMock()) {
      const { mockSetMascoteKids } = await import('@/lib/mocks/kids-personalizacao.mock');
      return mockSetMascoteKids(studentId, mascoteId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from('kids_personalizacao')
      .update({ mascote_atual: mascoteId })
      .eq('student_id', studentId);
    if (error) {
      console.error('[setMascoteKids] Supabase error:', error.message);
      return { sucesso: false };
    }
    return { sucesso: true };
  } catch (error) {
    console.error('[setMascoteKids] Fallback:', error);
    return { sucesso: false };
  }
}

export async function setCorKids(studentId: string, corId: string): Promise<{ sucesso: boolean }> {
  try {
    if (isMock()) {
      const { mockSetCorKids } = await import('@/lib/mocks/kids-personalizacao.mock');
      return mockSetCorKids(studentId, corId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from('kids_personalizacao')
      .update({ cor_atual: corId })
      .eq('student_id', studentId);
    if (error) {
      console.error('[setCorKids] Supabase error:', error.message);
      return { sucesso: false };
    }
    return { sucesso: true };
  } catch (error) {
    console.error('[setCorKids] Fallback:', error);
    return { sucesso: false };
  }
}

export async function setTituloKids(studentId: string, titulo: string): Promise<{ sucesso: boolean }> {
  try {
    if (isMock()) {
      const { mockSetTituloKids } = await import('@/lib/mocks/kids-personalizacao.mock');
      return mockSetTituloKids(studentId, titulo);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from('kids_personalizacao')
      .update({ titulo_atual: titulo })
      .eq('student_id', studentId);
    if (error) {
      console.error('[setTituloKids] Supabase error:', error.message);
      return { sucesso: false };
    }
    return { sucesso: true };
  } catch (error) {
    console.error('[setTituloKids] Fallback:', error);
    return { sucesso: false };
  }
}
