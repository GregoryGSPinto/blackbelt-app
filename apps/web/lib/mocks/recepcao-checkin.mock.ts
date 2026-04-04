import type { AlunoCheckin, PessoaDentro, CapacidadeInfo } from '@/lib/api/recepcao-checkin.service';

const MOCK_ALUNOS: AlunoCheckin[] = [
  { id: 'a1', nome: 'João Mendes', avatar: '', faixa: 'azul', turma: 'BJJ Adulto', statusFinanceiro: 'em_dia', diasAtraso: 0, ultimoTreino: '2026-03-21' },
  { id: 'a2', nome: 'João Carlos Silva', avatar: '', faixa: 'branca', turma: 'BJJ Iniciante', statusFinanceiro: 'atrasado', diasAtraso: 12, ultimoTreino: '2026-03-18' },
  { id: 'a3', nome: 'Maria Santos', avatar: '', faixa: 'roxa', turma: 'BJJ Adulto', statusFinanceiro: 'em_dia', diasAtraso: 0, ultimoTreino: '2026-03-21' },
  { id: 'a4', nome: 'Lucas Ferreira', avatar: '', faixa: 'branca', turma: 'Muay Thai', statusFinanceiro: 'em_dia', diasAtraso: 0, ultimoTreino: '2026-03-20' },
  { id: 'a5', nome: 'Ana Paula Costa', avatar: '', faixa: 'azul', turma: 'BJJ Feminino', statusFinanceiro: 'inadimplente', diasAtraso: 35, ultimoTreino: '2026-03-15' },
];

const MOCK_DENTRO: PessoaDentro[] = [
  { id: 'p1', nome: 'João Mendes', avatar: '', faixa: 'azul', horaEntrada: '18:05', turma: 'BJJ Adulto', tipo: 'aluno' },
  { id: 'p2', nome: 'Maria Santos', avatar: '', faixa: 'roxa', horaEntrada: '18:00', turma: 'BJJ Adulto', tipo: 'aluno' },
  { id: 'p3', nome: 'Prof. André Lima', avatar: '', faixa: 'preta', horaEntrada: '17:45', turma: 'BJJ Adulto', tipo: 'professor' },
  { id: 'p4', nome: 'Carlos Oliveira', avatar: '', faixa: 'branca', horaEntrada: '18:10', turma: 'BJJ Iniciante', tipo: 'aluno' },
  { id: 'p5', nome: 'Fernanda Lima', avatar: '', faixa: 'azul', horaEntrada: '18:02', turma: 'BJJ Feminino', tipo: 'aluno' },
  { id: 'p6', nome: 'Ricardo Souza', avatar: '', faixa: 'roxa', horaEntrada: '17:55', turma: 'Muay Thai', tipo: 'aluno' },
  { id: 'p7', nome: 'Camila Rodrigues', avatar: '', faixa: 'branca', horaEntrada: '18:15', turma: 'BJJ Iniciante', tipo: 'aluno' },
  { id: 'p8', nome: 'Roberto Almeida', avatar: '', faixa: 'marrom', horaEntrada: '17:50', turma: 'BJJ Adulto', tipo: 'aluno' },
  { id: 'p9', nome: 'Prof. Marcelo Costa', avatar: '', faixa: 'preta', horaEntrada: '17:40', turma: 'Muay Thai', tipo: 'professor' },
  { id: 'p10', nome: 'Patrícia Alves', avatar: '', faixa: 'azul', horaEntrada: '18:08', turma: 'BJJ Feminino', tipo: 'aluno' },
  { id: 'p11', nome: 'Gustavo Ramos', avatar: '', faixa: 'branca', horaEntrada: '18:20', turma: 'Muay Thai', tipo: 'aluno' },
  { id: 'p12', nome: 'Visitante - Pedro', avatar: '', faixa: '', horaEntrada: '18:25', turma: '', tipo: 'visitante' },
];

export function mockBuscarAluno(query: string): AlunoCheckin[] {
  const q = query.toLowerCase();
  return MOCK_ALUNOS.filter((a) => a.nome.toLowerCase().includes(q));
}

export function mockRegistrarEntrada(_alunoId: string): { success: boolean; message: string } {
  return { success: true, message: 'Entrada registrada com sucesso!' };
}

export function mockRegistrarSaida(_alunoId: string): { success: boolean } {
  return { success: true };
}

export function mockGetDentroAgora(): { pessoas: PessoaDentro[]; capacidade: CapacidadeInfo } {
  return {
    pessoas: MOCK_DENTRO,
    capacidade: { totalDentro: MOCK_DENTRO.length, capacidadeMax: 80, percentual: (MOCK_DENTRO.length / 80) * 100 },
  };
}

export function mockRegistrarVisitante(_nome: string, _motivo: string): { success: boolean } {
  return { success: true };
}
