import type { ModoAulaDTO, AlunoNaAula, AlertaAula } from '@/lib/api/modo-aula.service';

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

const ALUNOS: AlunoNaAula[] = [
  { id: 'alu-1', nome: 'Pedro Silva', faixa: 'azul', graus: 2, presente: true, metodoCheckin: 'qr_code', checkinHora: '19:02', restricaoMedica: 'Joelho esquerdo — evitar guarda fechada e raspagens com pressão', diasDesdeUltimoTreino: 1, totalAulasNoMes: 10, sequenciaPresenca: 8, aniversarioHoje: false },
  { id: 'alu-2', nome: 'Ana Costa', faixa: 'roxa', graus: 1, presente: true, metodoCheckin: 'qr_code', checkinHora: '18:58', diasDesdeUltimoTreino: 1, totalAulasNoMes: 12, sequenciaPresenca: 15, aniversarioHoje: true },
  { id: 'alu-3', nome: 'João Oliveira', faixa: 'branca', graus: 4, presente: false, diasDesdeUltimoTreino: 12, totalAulasNoMes: 3, sequenciaPresenca: 0, aniversarioHoje: false },
  { id: 'alu-4', nome: 'Maria Santos', faixa: 'azul', graus: 4, presente: true, metodoCheckin: 'manual', checkinHora: '19:05', diasDesdeUltimoTreino: 2, totalAulasNoMes: 8, sequenciaPresenca: 6, aniversarioHoje: false },
  { id: 'alu-5', nome: 'Lucas Mendes', faixa: 'branca', graus: 0, presente: true, metodoCheckin: 'manual', checkinHora: '19:01', diasDesdeUltimoTreino: 0, totalAulasNoMes: 1, sequenciaPresenca: 1, aniversarioHoje: false },
  { id: 'alu-6', nome: 'Fernanda Lima', faixa: 'azul', graus: 1, presente: false, diasDesdeUltimoTreino: 8, totalAulasNoMes: 4, sequenciaPresenca: 0, aniversarioHoje: false },
  { id: 'alu-7', nome: 'Carlos Souza', faixa: 'roxa', graus: 0, presente: true, metodoCheckin: 'qr_code', checkinHora: '18:55', restricaoMedica: 'Ombro direito — limitar movimentos acima da cabeça', diasDesdeUltimoTreino: 1, totalAulasNoMes: 11, sequenciaPresenca: 12, aniversarioHoje: false },
  { id: 'alu-8', nome: 'Juliana Ferreira', faixa: 'branca', graus: 3, presente: true, metodoCheckin: 'qr_code', checkinHora: '19:00', diasDesdeUltimoTreino: 2, totalAulasNoMes: 9, sequenciaPresenca: 7, aniversarioHoje: false },
  { id: 'alu-9', nome: 'Rafael Almeida', faixa: 'marrom', graus: 1, presente: true, metodoCheckin: 'automatico', checkinHora: '18:50', diasDesdeUltimoTreino: 1, totalAulasNoMes: 14, sequenciaPresenca: 20, aniversarioHoje: false },
  { id: 'alu-10', nome: 'Beatriz Rocha', faixa: 'azul', graus: 3, presente: true, metodoCheckin: 'qr_code', checkinHora: '18:57', diasDesdeUltimoTreino: 3, totalAulasNoMes: 7, sequenciaPresenca: 5, aniversarioHoje: false },
  { id: 'alu-11', nome: 'Thiago Nascimento', faixa: 'branca', graus: 2, presente: false, diasDesdeUltimoTreino: 10, totalAulasNoMes: 2, sequenciaPresenca: 0, aniversarioHoje: false },
  { id: 'alu-12', nome: 'Camila Barbosa', faixa: 'azul', graus: 0, presente: true, metodoCheckin: 'manual', checkinHora: '19:03', diasDesdeUltimoTreino: 2, totalAulasNoMes: 8, sequenciaPresenca: 4, aniversarioHoje: false },
  { id: 'alu-13', nome: 'Gustavo Martins', faixa: 'roxa', graus: 2, presente: true, metodoCheckin: 'qr_code', checkinHora: '18:56', diasDesdeUltimoTreino: 1, totalAulasNoMes: 13, sequenciaPresenca: 18, aniversarioHoje: false },
  { id: 'alu-14', nome: 'Patricia Gomes', faixa: 'azul', graus: 1, presente: false, diasDesdeUltimoTreino: 30, totalAulasNoMes: 0, sequenciaPresenca: 0, aniversarioHoje: false },
  { id: 'alu-15', nome: 'Diego Cardoso', faixa: 'branca', graus: 1, presente: true, metodoCheckin: 'qr_code', checkinHora: '19:04', diasDesdeUltimoTreino: 3, totalAulasNoMes: 6, sequenciaPresenca: 3, aniversarioHoje: false },
  { id: 'alu-16', nome: 'Amanda Ribeiro', faixa: 'azul', graus: 2, presente: true, metodoCheckin: 'manual', checkinHora: '19:06', diasDesdeUltimoTreino: 1, totalAulasNoMes: 10, sequenciaPresenca: 9, aniversarioHoje: false },
  { id: 'alu-17', nome: 'Felipe Torres', faixa: 'roxa', graus: 0, presente: false, diasDesdeUltimoTreino: 5, totalAulasNoMes: 5, sequenciaPresenca: 0, aniversarioHoje: false },
  { id: 'alu-18', nome: 'Larissa Pereira', faixa: 'branca', graus: 0, presente: true, metodoCheckin: 'manual', checkinHora: '19:08', diasDesdeUltimoTreino: 1, totalAulasNoMes: 9, sequenciaPresenca: 6, aniversarioHoje: false },
];

const ALERTAS: AlertaAula[] = [
  { tipo: 'restricao_medica', alunoId: 'alu-1', alunoNome: 'Pedro Silva', mensagem: 'Restrição no joelho esquerdo — evitar guarda fechada', urgencia: 'alta' },
  { tipo: 'restricao_medica', alunoId: 'alu-7', alunoNome: 'Carlos Souza', mensagem: 'Ombro direito limitado — evitar movimentos acima da cabeça', urgencia: 'alta' },
  { tipo: 'ausencia_prolongada', alunoId: 'alu-3', alunoNome: 'João Oliveira', mensagem: 'Não treina há 12 dias', urgencia: 'media' },
  { tipo: 'ausencia_prolongada', alunoId: 'alu-11', alunoNome: 'Thiago Nascimento', mensagem: 'Não treina há 10 dias', urgencia: 'media' },
  { tipo: 'ausencia_prolongada', alunoId: 'alu-6', alunoNome: 'Fernanda Lima', mensagem: 'Não treina há 8 dias', urgencia: 'media' },
  { tipo: 'aniversario', alunoId: 'alu-2', alunoNome: 'Ana Costa', mensagem: 'Faz aniversário hoje!', urgencia: 'info' },
  { tipo: 'graduacao_pronta', alunoId: 'alu-4', alunoNome: 'Maria Santos', mensagem: 'Completou requisitos para faixa roxa', urgencia: 'info' },
  { tipo: 'primeiro_dia', alunoId: 'alu-5', alunoNome: 'Lucas Mendes', mensagem: 'Primeiro dia na turma', urgencia: 'info' },
  { tipo: 'retorno', alunoId: 'alu-14', alunoNome: 'Patricia Gomes', mensagem: 'Retornando após 30 dias ausente', urgencia: 'info' },
];

export async function mockGetModoAula(_turmaId: string): Promise<ModoAulaDTO> {
  await delay(500);
  return {
    turma: {
      id: 'turma-bjj-noite',
      nome: 'BJJ Noite — Avançada',
      modalidade: 'Brazilian Jiu-Jitsu',
      horario: '19:00 - 20:30',
      sala: 'Tatame Principal',
      capacidade: 20,
    },
    alunos: [...ALUNOS],
    alertas: [...ALERTAS],
    aulaAnterior: {
      data: '2026-03-14',
      tecnicasEnsinadas: ['Armbar da guarda fechada', 'Triângulo', 'Combinação armbar → triângulo'],
      observacoes: 'Turma focou em transições. Boa evolução geral.',
      presentes: 15,
    },
  };
}

export async function mockRegistrarPresenca(_turmaId: string, alunoId: string, presente: boolean): Promise<void> {
  await delay(200);
  const aluno = ALUNOS.find((a) => a.id === alunoId);
  if (aluno) {
    aluno.presente = presente;
    if (presente) {
      aluno.metodoCheckin = 'manual';
      aluno.checkinHora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
  }
}

export async function mockEncerrarAula(_turmaId: string): Promise<{ totalPresentes: number; totalAlunos: number }> {
  await delay(400);
  const presentes = ALUNOS.filter((a) => a.presente).length;
  return { totalPresentes: presentes, totalAlunos: ALUNOS.length };
}
