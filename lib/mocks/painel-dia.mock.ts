import type { DailyBriefingDTO } from '@/lib/api/painel-dia.service';

const delay = () => new Promise((r) => setTimeout(r, 200));

const BRIEFING: DailyBriefingDTO = {
  aulasHoje: [
    { id: 'aula-1', turma: 'BJJ Fundamentos', horario: '07:00', professor: 'André Santos', alunosEsperados: 18, sala: 'Tatame 1' },
    { id: 'aula-2', turma: 'BJJ All Levels', horario: '10:00', professor: 'André Santos', alunosEsperados: 22, sala: 'Tatame 1' },
    { id: 'aula-3', turma: 'Judo Adulto', horario: '18:00', professor: 'Fernanda Oliveira', alunosEsperados: 14, sala: 'Tatame 2' },
    { id: 'aula-4', turma: 'BJJ Noturno', horario: '21:00', professor: 'André Santos', alunosEsperados: 20, sala: 'Tatame 1' },
  ],
  aniversariantes: [
    { id: 'aniv-1', nome: 'João Mendes', idade: 28 },
    { id: 'aniv-2', nome: 'Maria Santos', idade: 35 },
  ],
  vencendoAmanha: [
    { id: 'venc-1', aluno: 'Carlos Pereira', valor: 189, diasAtraso: 1 },
    { id: 'venc-2', aluno: 'Luciana Ferraz', valor: 249, diasAtraso: 2 },
    { id: 'venc-3', aluno: 'Roberto Almeida', valor: 149, diasAtraso: 3 },
  ],
  alunosRisco: [
    { id: 'risco-1', nome: 'Felipe Gonçalves', ultimoCheckin: '2026-03-10T19:00:00Z', diasAusente: 7, faixa: 'azul' },
    { id: 'risco-2', nome: 'Tatiana Borges', ultimoCheckin: '2026-03-03T08:00:00Z', diasAusente: 14, faixa: 'branca' },
    { id: 'risco-3', nome: 'Renato Dias', ultimoCheckin: '2026-02-24T20:00:00Z', diasAusente: 21, faixa: 'roxa' },
    { id: 'risco-4', nome: 'Priscila Monteiro', ultimoCheckin: '2026-03-07T07:00:00Z', diasAusente: 10, faixa: 'azul' },
  ],
  graduacoesProntas: [
    { id: 'grad-1', aluno: 'Lucas Teixeira', faixaAtual: 'branca', proximaFaixa: 'azul', requisitosOk: true },
    { id: 'grad-2', aluno: 'Amanda Vieira', faixaAtual: 'azul', proximaFaixa: 'roxa', requisitosOk: true },
  ],
  resumo: {
    alunosAtivos: 142,
    aulasHoje: 4,
    presencasHoje: 23,
    receitaMes: 28500,
    taxaPresencaSemana: 78,
  },
};

export async function mockGetDailyBriefing(_academyId: string): Promise<DailyBriefingDTO> {
  await delay();
  return {
    ...BRIEFING,
    aulasHoje: BRIEFING.aulasHoje.map((a) => ({ ...a })),
    aniversariantes: BRIEFING.aniversariantes.map((a) => ({ ...a })),
    vencendoAmanha: BRIEFING.vencendoAmanha.map((v) => ({ ...v })),
    alunosRisco: BRIEFING.alunosRisco.map((a) => ({ ...a })),
    graduacoesProntas: BRIEFING.graduacoesProntas.map((g) => ({ ...g })),
    resumo: { ...BRIEFING.resumo },
  };
}
