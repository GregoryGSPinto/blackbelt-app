import { isMock } from '@/lib/env';

export interface FaixaKids {
  faixaAtual: {
    nome: string;
    cor: string;
    emoji: string;
    desde: string;
    mensagem: string;
  };
  proximaFaixa: {
    nome: string;
    cor: string;
    emoji: string;
    mensagem: string;
  };
  historicoFaixas: {
    nome: string;
    cor: string;
    emoji: string;
    data: string;
    mensagem: string;
  }[];
  coisasBoas: {
    emoji: string;
    texto: string;
    feito: boolean;
  }[];
}

export async function getFaixaKids(studentId: string): Promise<FaixaKids> {
  try {
    if (isMock()) {
      const { mockGetFaixaKids } = await import('@/lib/mocks/kids-faixa.mock');
      return mockGetFaixaKids(studentId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('kids_faixas')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle();
    if (error || !data) {
      console.error('[getFaixaKids] Supabase error:', error?.message);
      const { mockGetFaixaKids } = await import('@/lib/mocks/kids-faixa.mock');
      return mockGetFaixaKids(studentId);
    }
    return data as unknown as FaixaKids;
  } catch (error) {
    console.error('[getFaixaKids] Fallback:', error);
    const { mockGetFaixaKids } = await import('@/lib/mocks/kids-faixa.mock');
    return mockGetFaixaKids(studentId);
  }
}
