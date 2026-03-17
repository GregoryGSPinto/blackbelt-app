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
    const res = await fetch(`/api/kids/faixa?studentId=${studentId}`);
    if (!res.ok) throw new ServiceError(res.status, 'kids-faixa.get');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'kids-faixa.get');
  }
}
