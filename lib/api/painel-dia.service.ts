import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

export interface AulaHoje {
  id: string;
  turma: string;
  horario: string;
  professor: string;
  alunosEsperados: number;
  sala: string;
}

export interface Aniversariante {
  id: string;
  nome: string;
  idade: number;
  avatar?: string;
}

export interface PagamentoVencendo {
  id: string;
  aluno: string;
  valor: number;
  diasAtraso: number;
}

export interface AlunoRisco {
  id: string;
  nome: string;
  ultimoCheckin: string;
  diasAusente: number;
  faixa: string;
}

export interface GraduacaoPronta {
  id: string;
  aluno: string;
  faixaAtual: string;
  proximaFaixa: string;
  requisitosOk: boolean;
}

export interface ResumoDia {
  alunosAtivos: number;
  aulasHoje: number;
  receitaMes: number;
  taxaPresencaSemana: number;
}

export interface DailyBriefingDTO {
  aulasHoje: AulaHoje[];
  aniversariantes: Aniversariante[];
  vencendoAmanha: PagamentoVencendo[];
  alunosRisco: AlunoRisco[];
  graduacoesProntas: GraduacaoPronta[];
  resumo: ResumoDia;
}

export async function getDailyBriefing(academyId: string): Promise<DailyBriefingDTO> {
  try {
    if (isMock()) {
      const { mockGetDailyBriefing } = await import('@/lib/mocks/painel-dia.mock');
      return mockGetDailyBriefing(academyId);
    }
    const res = await fetch(`/api/painel-dia?academyId=${academyId}`);
    if (!res.ok) throw new ServiceError(res.status, 'painel-dia.briefing');
    return res.json();
  } catch (error) { handleServiceError(error, 'painel-dia.briefing'); }
}
