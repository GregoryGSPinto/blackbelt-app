import type { Aluno360, NotaAluno } from '@/lib/api/professor-aluno360.service';

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

const ALUNOS: Record<string, Aluno360> = {
  'alu-1': {
    id: 'alu-1', nome: 'Pedro Silva', email: 'pedro@email.com', telefone: '(11) 99999-0001', dataNascimento: '1998-05-20', idade: 27,
    faixaAtual: 'azul', graus: 2, dataPromocao: '2025-08-15', tempoNaFaixaAtual: '7 meses',
    historicoFaixas: [{ faixa: 'branca', data: '2023-03-01', professor: 'André Galvão' }, { faixa: 'azul', data: '2025-08-15', professor: 'André Galvão' }],
    presencaTotal: 180, presencaUltimos30Dias: 10, presencaMedia: 72, sequenciaAtual: 8, maiorSequencia: 15, frequenciaSemanal: [3, 2, 4, 3, 2, 3, 4, 3], ultimoCheckin: '2026-03-16T19:05:00Z', diasDesdeUltimoTreino: 1,
    ultimaAvaliacao: { data: '2026-03-15', mediaGeral: 5.2, recomendacao: 'quase_pronto', criterios: [{ slug: 'guarda', nome: 'Jogo de Guarda', nota: 5.5 }, { slug: 'passagem', nome: 'Passagem de Guarda', nota: 4.5 }, { slug: 'finalizacao', nome: 'Finalizações', nota: 5.5 }, { slug: 'defesa', nome: 'Defesa e Escapes', nota: 4.5 }, { slug: 'quedas', nome: 'Quedas e Projeções', nota: 3.5 }, { slug: 'posicionamento', nome: 'Controle de Posição', nota: 4.5 }, { slug: 'competitivo', nome: 'Mentalidade Competitiva', nota: 3.5 }, { slug: 'conhecimento', nome: 'Conhecimento Teórico', nota: 5.5 }] },
    evolucaoMedia: [{ data: '2025-10-15', media: 4.2 }, { data: '2025-12-18', media: 4.6 }, { data: '2026-02-19', media: 5.0 }, { data: '2026-03-15', media: 5.2 }],
    restricoesMedicas: [{ descricao: 'Lesão no joelho esquerdo — evitar guarda fechada e raspagens com pressão', desde: '2026-02-01', ativa: true }],
    lesoes: [{ descricao: 'Entorse no joelho esquerdo', data: '2026-01-28', recuperado: false }],
    turmasInscritas: [{ id: 'turma-bjj-noite', nome: 'BJJ Noite — Avançada', horario: 'Seg/Qua/Sex 19:00-20:30', modalidade: 'BJJ' }],
    notasProfessores: [{ id: 'nota-1', professorNome: 'André Galvão', data: '2026-03-10', texto: 'Precisa cuidar do joelho. Adaptando treino.', tipo: 'restricao' }, { id: 'nota-2', professorNome: 'André Galvão', data: '2026-02-20', texto: 'Excelente evolução nas raspagens. Muito dedicado.', tipo: 'destaque' }],
    competicoes: [{ nome: 'Copa Paulista de Jiu-Jitsu', data: '2025-11-15', resultado: 'Ouro', categoria: 'Azul Médio' }],
    situacaoFinanceira: 'em_dia', plano: 'Pro', planoPeriodo: 'Mensal',
  },
  'alu-2': {
    id: 'alu-2', nome: 'Ana Costa', email: 'ana@email.com', telefone: '(11) 99999-0002', dataNascimento: '1996-03-17', idade: 30,
    faixaAtual: 'roxa', graus: 1, dataPromocao: '2025-06-01', tempoNaFaixaAtual: '9 meses',
    historicoFaixas: [{ faixa: 'branca', data: '2021-01-15', professor: 'André Galvão' }, { faixa: 'azul', data: '2023-03-20', professor: 'André Galvão' }, { faixa: 'roxa', data: '2025-06-01', professor: 'André Galvão' }],
    presencaTotal: 420, presencaUltimos30Dias: 14, presencaMedia: 88, sequenciaAtual: 15, maiorSequencia: 30, frequenciaSemanal: [4, 3, 4, 4, 3, 4, 4, 4], ultimoCheckin: '2026-03-17T18:58:00Z', diasDesdeUltimoTreino: 0,
    ultimaAvaliacao: { data: '2026-03-15', mediaGeral: 7.2, recomendacao: 'quase_pronto', criterios: [{ slug: 'guarda', nome: 'Jogo de Guarda', nota: 7.5 }, { slug: 'passagem', nome: 'Passagem de Guarda', nota: 6.5 }, { slug: 'finalizacao', nome: 'Finalizações', nota: 7.5 }, { slug: 'defesa', nome: 'Defesa e Escapes', nota: 7.0 }, { slug: 'quedas', nome: 'Quedas e Projeções', nota: 5.5 }, { slug: 'posicionamento', nome: 'Controle de Posição', nota: 7.5 }, { slug: 'competitivo', nome: 'Mentalidade Competitiva', nota: 6.5 }, { slug: 'conhecimento', nome: 'Conhecimento Teórico', nota: 7.5 }] },
    evolucaoMedia: [{ data: '2025-10-15', media: 6.5 }, { data: '2025-12-18', media: 6.8 }, { data: '2026-02-19', media: 7.0 }, { data: '2026-03-15', media: 7.2 }],
    restricoesMedicas: [], lesoes: [],
    turmasInscritas: [{ id: 'turma-bjj-noite', nome: 'BJJ Noite — Avançada', horario: 'Seg/Qua/Sex 19:00-20:30', modalidade: 'BJJ' }, { id: 'turma-bjj-manha', nome: 'BJJ Manhã — Todos os níveis', horario: 'Seg/Qua/Sex 07:00-08:30', modalidade: 'BJJ' }],
    notasProfessores: [{ id: 'nota-3', professorNome: 'André Galvão', data: '2026-03-14', texto: 'Jogo de guarda muito completo. Precisa trabalhar quedas para competição.', tipo: 'observacao' }, { id: 'nota-4', professorNome: 'André Galvão', data: '2026-02-15', texto: 'Melhor aluna do semestre. Comprometimento exemplar.', tipo: 'destaque' }],
    competicoes: [{ nome: 'Copa Paulista de Jiu-Jitsu', data: '2025-11-15', resultado: 'Ouro', categoria: 'Roxa Leve' }, { nome: 'Brasileiro de Jiu-Jitsu', data: '2025-05-20', resultado: 'Bronze', categoria: 'Azul Leve' }],
    situacaoFinanceira: 'em_dia', plano: 'BlackBelt', planoPeriodo: 'Anual',
  },
  'alu-3': {
    id: 'alu-3', nome: 'João Oliveira', email: 'joao@email.com', telefone: '(11) 99999-0003', dataNascimento: '2000-08-10', idade: 25,
    faixaAtual: 'branca', graus: 4, dataPromocao: '2025-12-01', tempoNaFaixaAtual: '3 meses',
    historicoFaixas: [{ faixa: 'branca', data: '2025-06-01', professor: 'André Galvão' }],
    presencaTotal: 45, presencaUltimos30Dias: 3, presencaMedia: 42, sequenciaAtual: 0, maiorSequencia: 8, frequenciaSemanal: [2, 1, 0, 0, 1, 2, 0, 1], ultimoCheckin: '2026-03-05T19:10:00Z', diasDesdeUltimoTreino: 12,
    evolucaoMedia: [{ data: '2025-12-18', media: 2.5 }, { data: '2026-03-15', media: 2.8 }],
    restricoesMedicas: [], lesoes: [],
    turmasInscritas: [{ id: 'turma-bjj-noite', nome: 'BJJ Noite — Avançada', horario: 'Seg/Qua/Sex 19:00-20:30', modalidade: 'BJJ' }],
    notasProfessores: [{ id: 'nota-5', professorNome: 'André Galvão', data: '2026-03-05', texto: 'Frequência irregular. Precisa de mais constância.', tipo: 'atencao' }],
    competicoes: [], situacaoFinanceira: 'atrasado', plano: 'Starter', planoPeriodo: 'Mensal',
  },
  'alu-4': {
    id: 'alu-4', nome: 'Maria Santos', email: 'maria@email.com', telefone: '(11) 99999-0004', dataNascimento: '1995-11-03', idade: 30,
    faixaAtual: 'azul', graus: 4, dataPromocao: '2024-12-01', tempoNaFaixaAtual: '15 meses',
    historicoFaixas: [{ faixa: 'branca', data: '2022-01-10', professor: 'André Galvão' }, { faixa: 'azul', data: '2024-12-01', professor: 'André Galvão' }],
    presencaTotal: 310, presencaUltimos30Dias: 11, presencaMedia: 80, sequenciaAtual: 6, maiorSequencia: 22, frequenciaSemanal: [3, 3, 2, 3, 3, 2, 3, 3], ultimoCheckin: '2026-03-17T19:05:00Z', diasDesdeUltimoTreino: 0,
    ultimaAvaliacao: { data: '2026-03-15', mediaGeral: 5.8, recomendacao: 'pronto_para_promover', criterios: [{ slug: 'guarda', nome: 'Jogo de Guarda', nota: 6.5 }, { slug: 'passagem', nome: 'Passagem de Guarda', nota: 5.5 }, { slug: 'finalizacao', nome: 'Finalizações', nota: 6.0 }, { slug: 'defesa', nome: 'Defesa e Escapes', nota: 6.0 }, { slug: 'quedas', nome: 'Quedas e Projeções', nota: 5.0 }, { slug: 'posicionamento', nome: 'Controle de Posição', nota: 6.5 }, { slug: 'competitivo', nome: 'Mentalidade Competitiva', nota: 5.5 }, { slug: 'conhecimento', nome: 'Conhecimento Teórico', nota: 6.0 }] },
    evolucaoMedia: [{ data: '2025-10-15', media: 5.0 }, { data: '2025-12-18', media: 5.3 }, { data: '2026-02-19', media: 5.6 }, { data: '2026-03-15', media: 5.8 }],
    restricoesMedicas: [], lesoes: [],
    turmasInscritas: [{ id: 'turma-bjj-noite', nome: 'BJJ Noite — Avançada', horario: 'Seg/Qua/Sex 19:00-20:30', modalidade: 'BJJ' }],
    notasProfessores: [{ id: 'nota-6', professorNome: 'André Galvão', data: '2026-03-15', texto: 'Pronta para faixa roxa. Evolução consistente nos últimos 6 meses.', tipo: 'destaque' }],
    competicoes: [{ nome: 'Copa Paulista de Jiu-Jitsu', data: '2025-11-15', resultado: 'Prata', categoria: 'Azul Médio' }],
    situacaoFinanceira: 'em_dia', plano: 'Pro', planoPeriodo: 'Trimestral',
  },
  'alu-9': {
    id: 'alu-9', nome: 'Rafael Almeida', email: 'rafael@email.com', telefone: '(11) 99999-0009', dataNascimento: '1990-07-22', idade: 35,
    faixaAtual: 'marrom', graus: 1, dataPromocao: '2025-03-01', tempoNaFaixaAtual: '12 meses',
    historicoFaixas: [{ faixa: 'branca', data: '2016-01-10', professor: 'André Galvão' }, { faixa: 'azul', data: '2018-06-01', professor: 'André Galvão' }, { faixa: 'roxa', data: '2021-03-01', professor: 'André Galvão' }, { faixa: 'marrom', data: '2025-03-01', professor: 'André Galvão' }],
    presencaTotal: 1200, presencaUltimos30Dias: 16, presencaMedia: 92, sequenciaAtual: 20, maiorSequencia: 45, frequenciaSemanal: [4, 4, 4, 4, 3, 4, 4, 4], ultimoCheckin: '2026-03-17T18:50:00Z', diasDesdeUltimoTreino: 0,
    ultimaAvaliacao: { data: '2026-03-15', mediaGeral: 8.3, recomendacao: 'quase_pronto', criterios: [{ slug: 'guarda', nome: 'Jogo de Guarda', nota: 8.5 }, { slug: 'passagem', nome: 'Passagem de Guarda', nota: 8.5 }, { slug: 'finalizacao', nome: 'Finalizações', nota: 9.0 }, { slug: 'defesa', nome: 'Defesa e Escapes', nota: 8.5 }, { slug: 'quedas', nome: 'Quedas e Projeções', nota: 7.5 }, { slug: 'posicionamento', nome: 'Controle de Posição', nota: 8.5 }, { slug: 'competitivo', nome: 'Mentalidade Competitiva', nota: 7.5 }, { slug: 'conhecimento', nome: 'Conhecimento Teórico', nota: 8.5 }] },
    evolucaoMedia: [{ data: '2025-10-15', media: 7.8 }, { data: '2025-12-18', media: 8.0 }, { data: '2026-02-19', media: 8.2 }, { data: '2026-03-15', media: 8.3 }],
    restricoesMedicas: [], lesoes: [],
    turmasInscritas: [{ id: 'turma-bjj-noite', nome: 'BJJ Noite — Avançada', horario: 'Seg/Qua/Sex 19:00-20:30', modalidade: 'BJJ' }, { id: 'turma-bjj-manha', nome: 'BJJ Manhã — Todos os níveis', horario: 'Seg/Qua/Sex 07:00-08:30', modalidade: 'BJJ' }],
    notasProfessores: [{ id: 'nota-7', professorNome: 'André Galvão', data: '2026-03-10', texto: 'Referência da turma. Ajuda todos os alunos.', tipo: 'destaque' }],
    competicoes: [{ nome: 'Brasileiro de Jiu-Jitsu', data: '2025-05-20', resultado: 'Ouro', categoria: 'Marrom Pesado' }, { nome: 'Copa Paulista', data: '2025-11-15', resultado: 'Ouro', categoria: 'Marrom Pesado' }],
    situacaoFinanceira: 'em_dia', plano: 'BlackBelt', planoPeriodo: 'Anual',
  },
};

// Fill remaining students with simpler data
const simpleStudents: Array<[string, string, string, number, string, number, number, string]> = [
  ['alu-5', 'Lucas Mendes', 'branca', 0, '2026-03-17', 1, 1, 'em_dia'],
  ['alu-6', 'Fernanda Lima', 'azul', 1, '2026-03-09', 4, 0, 'em_dia'],
  ['alu-7', 'Carlos Souza', 'roxa', 0, '2026-03-16', 11, 12, 'em_dia'],
  ['alu-8', 'Juliana Ferreira', 'branca', 3, '2026-03-15', 9, 7, 'em_dia'],
  ['alu-10', 'Beatriz Rocha', 'azul', 3, '2026-03-14', 7, 5, 'em_dia'],
  ['alu-11', 'Thiago Nascimento', 'branca', 2, '2026-03-07', 2, 0, 'atrasado'],
  ['alu-12', 'Camila Barbosa', 'azul', 0, '2026-03-15', 8, 4, 'em_dia'],
  ['alu-13', 'Gustavo Martins', 'roxa', 2, '2026-03-16', 13, 18, 'em_dia'],
  ['alu-14', 'Patricia Gomes', 'azul', 1, '2026-02-15', 0, 0, 'inadimplente'],
  ['alu-15', 'Diego Cardoso', 'branca', 1, '2026-03-14', 6, 3, 'em_dia'],
];

for (const [id, nome, faixa, graus, ultimoCheckin, presUlt30, seq, fin] of simpleStudents) {
  if (!ALUNOS[id]) {
    ALUNOS[id] = {
      id, nome, email: `${nome.split(' ')[0].toLowerCase()}@email.com`, telefone: '(11) 99999-0000', dataNascimento: '1997-01-01', idade: 29,
      faixaAtual: faixa, graus, dataPromocao: '2025-06-01', tempoNaFaixaAtual: '9 meses',
      historicoFaixas: [{ faixa: 'branca', data: '2024-01-01', professor: 'André Galvão' }],
      presencaTotal: presUlt30 * 10, presencaUltimos30Dias: presUlt30, presencaMedia: presUlt30 * 5, sequenciaAtual: seq, maiorSequencia: Math.max(seq, 10),
      frequenciaSemanal: [2, 2, 3, 2, 2, 3, 2, 2], ultimoCheckin, diasDesdeUltimoTreino: Math.max(0, Math.floor((new Date('2026-03-17').getTime() - new Date(ultimoCheckin).getTime()) / 86400000)),
      evolucaoMedia: [{ data: '2025-12-18', media: 4.0 }, { data: '2026-03-15', media: 4.5 }],
      restricoesMedicas: id === 'alu-7' ? [{ descricao: 'Ombro direito — limitar movimentos acima da cabeça', desde: '2026-01-15', ativa: true }] : [],
      lesoes: [],
      turmasInscritas: [{ id: 'turma-bjj-noite', nome: 'BJJ Noite — Avançada', horario: 'Seg/Qua/Sex 19:00-20:30', modalidade: 'BJJ' }],
      notasProfessores: [],
      competicoes: [],
      situacaoFinanceira: fin as 'em_dia' | 'atrasado' | 'inadimplente', plano: 'Starter', planoPeriodo: 'Mensal',
    };
  }
}

export async function mockGetAluno360(alunoId: string): Promise<Aluno360> {
  await delay(500);
  return ALUNOS[alunoId] ?? ALUNOS['alu-1'];
}

export async function mockAddNotaAluno(
  alunoId: string,
  nota: { texto: string; tipo: 'observacao' | 'destaque' | 'atencao' | 'restricao' },
): Promise<NotaAluno> {
  await delay(400);
  const newNota: NotaAluno = {
    id: `nota-${Date.now()}`,
    alunoId,
    professorId: 'prof-1',
    professorNome: 'André Galvão',
    data: new Date().toISOString().split('T')[0],
    texto: nota.texto,
    tipo: nota.tipo,
  };
  const aluno = ALUNOS[alunoId];
  if (aluno) {
    aluno.notasProfessores.unshift({ id: newNota.id, professorNome: newNota.professorNome, data: newNota.data, texto: newNota.texto, tipo: newNota.tipo });
  }
  return newNota;
}
