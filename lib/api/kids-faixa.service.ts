import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

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
    try {
      const res = await fetch(`/api/kids/faixa?studentId=${studentId}`);
      if (!res.ok) throw new ServiceError(res.status, 'kids-faixa.get');
      return res.json();
    } catch {
      console.warn('[kids-faixa.getFaixaKids] API not available, using fallback');
      return { studentId: "", faixaAtual: "", corFaixa: "", graus: 0, maxGraus: 0, proximaFaixa: "", requisitos: [], percentualConcluido: 0 } as unknown as FaixaKids;
    }
  } catch (error) {
    handleServiceError(error, 'kids-faixa.get');
  }
}
