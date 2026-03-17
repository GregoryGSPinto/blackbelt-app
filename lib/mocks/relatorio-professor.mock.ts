import type { RelatorioProfessor, DetalheProfessor } from '@/lib/api/relatorio-professor.service';

const delay = () => new Promise((r) => setTimeout(r, 200));

const PROFESSORES: RelatorioProfessor[] = [
  { professorId: 'prof-1', nome: 'André Santos', totalAulasNoMes: 24, mediaAlunosPorAula: 18, taxaPresencaMedia: 90, avaliacaoMedia: 4.8, turmas: ['BJJ Fundamentos', 'BJJ All Levels', 'BJJ Noturno'], horasTotais: 36 },
  { professorId: 'prof-2', nome: 'Fernanda Oliveira', totalAulasNoMes: 16, mediaAlunosPorAula: 14, taxaPresencaMedia: 85, avaliacaoMedia: 4.5, turmas: ['Judo Adulto', 'Judo Kids'], horasTotais: 24 },
  { professorId: 'prof-3', nome: 'Thiago Nakamura', totalAulasNoMes: 12, mediaAlunosPorAula: 15, taxaPresencaMedia: 78, avaliacaoMedia: 4.2, turmas: ['BJJ Avançado', 'MMA'], horasTotais: 18 },
  { professorId: 'prof-4', nome: 'Carlos Ribeiro', totalAulasNoMes: 8, mediaAlunosPorAula: 10, taxaPresencaMedia: 65, avaliacaoMedia: 3.2, turmas: ['Karate'], horasTotais: 12 },
  { professorId: 'prof-5', nome: 'Camila Ferreira', totalAulasNoMes: 20, mediaAlunosPorAula: 16, taxaPresencaMedia: 88, avaliacaoMedia: 4.6, turmas: ['BJJ Fundamentos', 'Judo'], horasTotais: 30 },
];

const DETALHES_MAP: Record<string, DetalheProfessor> = {
  'prof-1': {
    ...PROFESSORES[0],
    aulasDetalhadas: [
      { data: '2026-03-17T07:00:00Z', turma: 'BJJ Fundamentos', presentes: 18, total: 22, avaliacao: 4.9 },
      { data: '2026-03-17T10:00:00Z', turma: 'BJJ All Levels', presentes: 20, total: 24, avaliacao: 4.8 },
      { data: '2026-03-17T21:00:00Z', turma: 'BJJ Noturno', presentes: 16, total: 20, avaliacao: 4.7 },
      { data: '2026-03-16T07:00:00Z', turma: 'BJJ Fundamentos', presentes: 17, total: 22, avaliacao: 4.9 },
      { data: '2026-03-16T10:00:00Z', turma: 'BJJ All Levels', presentes: 19, total: 24, avaliacao: 4.8 },
      { data: '2026-03-15T07:00:00Z', turma: 'BJJ Fundamentos', presentes: 20, total: 22, avaliacao: 5.0 },
      { data: '2026-03-15T21:00:00Z', turma: 'BJJ Noturno', presentes: 15, total: 20, avaliacao: 4.6 },
      { data: '2026-03-14T07:00:00Z', turma: 'BJJ Fundamentos', presentes: 16, total: 22, avaliacao: 4.7 },
      { data: '2026-03-14T10:00:00Z', turma: 'BJJ All Levels', presentes: 21, total: 24, avaliacao: 4.9 },
      { data: '2026-03-13T07:00:00Z', turma: 'BJJ Fundamentos', presentes: 18, total: 22, avaliacao: 4.8 },
      { data: '2026-03-13T21:00:00Z', turma: 'BJJ Noturno', presentes: 17, total: 20, avaliacao: 4.7 },
      { data: '2026-03-12T10:00:00Z', turma: 'BJJ All Levels', presentes: 22, total: 24, avaliacao: 4.9 },
    ],
    evolucaoMensal: [
      { mes: '2025-10', aulas: 22, mediaPresenca: 85 },
      { mes: '2025-11', aulas: 24, mediaPresenca: 87 },
      { mes: '2025-12', aulas: 20, mediaPresenca: 83 },
      { mes: '2026-01', aulas: 24, mediaPresenca: 88 },
      { mes: '2026-02', aulas: 22, mediaPresenca: 89 },
      { mes: '2026-03', aulas: 24, mediaPresenca: 90 },
    ],
  },
  'prof-2': {
    ...PROFESSORES[1],
    aulasDetalhadas: [
      { data: '2026-03-17T18:00:00Z', turma: 'Judo Adulto', presentes: 14, total: 18, avaliacao: 4.5 },
      { data: '2026-03-17T15:00:00Z', turma: 'Judo Kids', presentes: 12, total: 14, avaliacao: 4.6 },
      { data: '2026-03-16T18:00:00Z', turma: 'Judo Adulto', presentes: 13, total: 18, avaliacao: 4.4 },
      { data: '2026-03-15T15:00:00Z', turma: 'Judo Kids', presentes: 11, total: 14, avaliacao: 4.7 },
      { data: '2026-03-15T18:00:00Z', turma: 'Judo Adulto', presentes: 15, total: 18, avaliacao: 4.5 },
      { data: '2026-03-14T18:00:00Z', turma: 'Judo Adulto', presentes: 14, total: 18, avaliacao: 4.3 },
      { data: '2026-03-14T15:00:00Z', turma: 'Judo Kids', presentes: 13, total: 14, avaliacao: 4.8 },
      { data: '2026-03-13T18:00:00Z', turma: 'Judo Adulto', presentes: 12, total: 18, avaliacao: 4.4 },
      { data: '2026-03-12T15:00:00Z', turma: 'Judo Kids', presentes: 14, total: 14, avaliacao: 4.9 },
      { data: '2026-03-12T18:00:00Z', turma: 'Judo Adulto', presentes: 16, total: 18, avaliacao: 4.6 },
    ],
    evolucaoMensal: [
      { mes: '2025-10', aulas: 14, mediaPresenca: 80 },
      { mes: '2025-11', aulas: 16, mediaPresenca: 82 },
      { mes: '2025-12', aulas: 12, mediaPresenca: 78 },
      { mes: '2026-01', aulas: 16, mediaPresenca: 83 },
      { mes: '2026-02', aulas: 15, mediaPresenca: 84 },
      { mes: '2026-03', aulas: 16, mediaPresenca: 85 },
    ],
  },
  'prof-3': {
    ...PROFESSORES[2],
    aulasDetalhadas: [
      { data: '2026-03-17T19:00:00Z', turma: 'BJJ Avançado', presentes: 15, total: 18, avaliacao: 4.3 },
      { data: '2026-03-17T20:30:00Z', turma: 'MMA', presentes: 12, total: 16, avaliacao: 4.1 },
      { data: '2026-03-16T19:00:00Z', turma: 'BJJ Avançado', presentes: 14, total: 18, avaliacao: 4.2 },
      { data: '2026-03-15T19:00:00Z', turma: 'BJJ Avançado', presentes: 16, total: 18, avaliacao: 4.4 },
      { data: '2026-03-15T20:30:00Z', turma: 'MMA', presentes: 13, total: 16, avaliacao: 4.0 },
      { data: '2026-03-14T19:00:00Z', turma: 'BJJ Avançado', presentes: 15, total: 18, avaliacao: 4.3 },
      { data: '2026-03-13T19:00:00Z', turma: 'BJJ Avançado', presentes: 14, total: 18, avaliacao: 4.2 },
      { data: '2026-03-13T20:30:00Z', turma: 'MMA', presentes: 11, total: 16, avaliacao: 4.1 },
      { data: '2026-03-12T19:00:00Z', turma: 'BJJ Avançado', presentes: 16, total: 18, avaliacao: 4.5 },
      { data: '2026-03-12T20:30:00Z', turma: 'MMA', presentes: 14, total: 16, avaliacao: 4.2 },
    ],
    evolucaoMensal: [
      { mes: '2025-10', aulas: 10, mediaPresenca: 72 },
      { mes: '2025-11', aulas: 12, mediaPresenca: 74 },
      { mes: '2025-12', aulas: 10, mediaPresenca: 70 },
      { mes: '2026-01', aulas: 12, mediaPresenca: 75 },
      { mes: '2026-02', aulas: 11, mediaPresenca: 76 },
      { mes: '2026-03', aulas: 12, mediaPresenca: 78 },
    ],
  },
  'prof-4': {
    ...PROFESSORES[3],
    aulasDetalhadas: [
      { data: '2026-03-17T16:00:00Z', turma: 'Karate', presentes: 8, total: 14, avaliacao: 3.0 },
      { data: '2026-03-16T16:00:00Z', turma: 'Karate', presentes: 10, total: 14, avaliacao: 3.2 },
      { data: '2026-03-15T16:00:00Z', turma: 'Karate', presentes: 9, total: 14, avaliacao: 3.4 },
      { data: '2026-03-14T16:00:00Z', turma: 'Karate', presentes: 11, total: 14, avaliacao: 3.1 },
      { data: '2026-03-13T16:00:00Z', turma: 'Karate', presentes: 10, total: 14, avaliacao: 3.3 },
      { data: '2026-03-12T16:00:00Z', turma: 'Karate', presentes: 9, total: 14, avaliacao: 3.0 },
      { data: '2026-03-11T16:00:00Z', turma: 'Karate', presentes: 12, total: 14, avaliacao: 3.5 },
      { data: '2026-03-10T16:00:00Z', turma: 'Karate', presentes: 8, total: 14, avaliacao: 3.1 },
      { data: '2026-03-09T16:00:00Z', turma: 'Karate', presentes: 10, total: 14, avaliacao: 3.2 },
      { data: '2026-03-08T16:00:00Z', turma: 'Karate', presentes: 11, total: 14, avaliacao: 3.4 },
    ],
    evolucaoMensal: [
      { mes: '2025-10', aulas: 8, mediaPresenca: 60 },
      { mes: '2025-11', aulas: 8, mediaPresenca: 62 },
      { mes: '2025-12', aulas: 6, mediaPresenca: 58 },
      { mes: '2026-01', aulas: 8, mediaPresenca: 63 },
      { mes: '2026-02', aulas: 8, mediaPresenca: 64 },
      { mes: '2026-03', aulas: 8, mediaPresenca: 65 },
    ],
  },
  'prof-5': {
    ...PROFESSORES[4],
    aulasDetalhadas: [
      { data: '2026-03-17T08:00:00Z', turma: 'BJJ Fundamentos', presentes: 16, total: 20, avaliacao: 4.7 },
      { data: '2026-03-17T17:00:00Z', turma: 'Judo', presentes: 14, total: 16, avaliacao: 4.5 },
      { data: '2026-03-16T08:00:00Z', turma: 'BJJ Fundamentos', presentes: 18, total: 20, avaliacao: 4.8 },
      { data: '2026-03-16T17:00:00Z', turma: 'Judo', presentes: 15, total: 16, avaliacao: 4.6 },
      { data: '2026-03-15T08:00:00Z', turma: 'BJJ Fundamentos', presentes: 17, total: 20, avaliacao: 4.7 },
      { data: '2026-03-14T08:00:00Z', turma: 'BJJ Fundamentos', presentes: 15, total: 20, avaliacao: 4.5 },
      { data: '2026-03-14T17:00:00Z', turma: 'Judo', presentes: 13, total: 16, avaliacao: 4.4 },
      { data: '2026-03-13T08:00:00Z', turma: 'BJJ Fundamentos', presentes: 16, total: 20, avaliacao: 4.6 },
      { data: '2026-03-13T17:00:00Z', turma: 'Judo', presentes: 15, total: 16, avaliacao: 4.7 },
      { data: '2026-03-12T08:00:00Z', turma: 'BJJ Fundamentos', presentes: 18, total: 20, avaliacao: 4.8 },
      { data: '2026-03-12T17:00:00Z', turma: 'Judo', presentes: 14, total: 16, avaliacao: 4.5 },
      { data: '2026-03-11T08:00:00Z', turma: 'BJJ Fundamentos', presentes: 17, total: 20, avaliacao: 4.6 },
    ],
    evolucaoMensal: [
      { mes: '2025-10', aulas: 18, mediaPresenca: 83 },
      { mes: '2025-11', aulas: 20, mediaPresenca: 85 },
      { mes: '2025-12', aulas: 16, mediaPresenca: 80 },
      { mes: '2026-01', aulas: 20, mediaPresenca: 86 },
      { mes: '2026-02', aulas: 19, mediaPresenca: 87 },
      { mes: '2026-03', aulas: 20, mediaPresenca: 88 },
    ],
  },
};

export async function mockGetRelatorioProfessores(_academyId: string, _periodo?: string): Promise<RelatorioProfessor[]> {
  await delay();
  return PROFESSORES.map((p) => ({ ...p, turmas: [...p.turmas] }));
}

export async function mockGetDetalheProfessor(professorId: string, _periodo?: string): Promise<DetalheProfessor> {
  await delay();
  const detalhe = DETALHES_MAP[professorId];
  if (detalhe) {
    return {
      ...detalhe,
      turmas: [...detalhe.turmas],
      aulasDetalhadas: detalhe.aulasDetalhadas.map((a) => ({ ...a })),
      evolucaoMensal: detalhe.evolucaoMensal.map((e) => ({ ...e })),
    };
  }
  const fallback = DETALHES_MAP['prof-1'];
  return {
    ...fallback,
    professorId,
    turmas: [...fallback.turmas],
    aulasDetalhadas: fallback.aulasDetalhadas.map((a) => ({ ...a })),
    evolucaoMensal: fallback.evolucaoMensal.map((e) => ({ ...e })),
  };
}
