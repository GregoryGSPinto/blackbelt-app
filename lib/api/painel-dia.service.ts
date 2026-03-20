import { isMock } from '@/lib/env';

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
    try {
      const res = await fetch(`/api/painel-dia?academyId=${academyId}`);
      if (!res.ok) {
        console.warn('[getDailyBriefing] error:', `HTTP ${res.status}`);
        return {
          aulasHoje: [],
          aniversariantes: [],
          vencendoAmanha: [],
          alunosRisco: [],
          graduacoesProntas: [],
          resumo: { alunosAtivos: 0, aulasHoje: 0, receitaMes: 0, taxaPresencaSemana: 0 },
        };
      }
      return res.json();
    } catch {
      console.warn('[painel-dia.getDailyBriefing] API not available, using fallback');
      return {
        aulasHoje: [],
        aniversariantes: [],
        vencendoAmanha: [],
        alunosRisco: [],
        graduacoesProntas: [],
        resumo: { alunosAtivos: 0, aulasHoje: 0, receitaMes: 0, taxaPresencaSemana: 0 },
      };
    }
  } catch (error) {
    console.warn('[getDailyBriefing] Fallback:', error);
    return {
      aulasHoje: [],
      aniversariantes: [],
      vencendoAmanha: [],
      alunosRisco: [],
      graduacoesProntas: [],
      resumo: { alunosAtivos: 0, aulasHoje: 0, receitaMes: 0, taxaPresencaSemana: 0 },
    };
  }
}
