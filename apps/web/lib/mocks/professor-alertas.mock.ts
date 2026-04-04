import type { AlertaProfessor } from '@/lib/api/professor-alertas.service';

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

const ALERTAS: AlertaProfessor[] = [
  { id: 'alrt-1', tipo: 'ausencia', titulo: 'Ausência prolongada', mensagem: 'João Oliveira não treina há 14 dias', alunoId: 'alu-3', alunoNome: 'João Oliveira', urgencia: 'alta', acao: { label: 'Ver perfil', rota: '/professor/alunos/alu-3' }, lido: false, criadoEm: '2026-03-17T08:00:00Z' },
  { id: 'alrt-2', tipo: 'ausencia', titulo: 'Ausência prolongada', mensagem: 'Maria Oliveira não treina há 10 dias', alunoId: 'alu-11', alunoNome: 'Thiago Nascimento', urgencia: 'alta', acao: { label: 'Ver perfil', rota: '/professor/alunos/alu-11' }, lido: false, criadoEm: '2026-03-17T08:00:00Z' },
  { id: 'alrt-3', tipo: 'ausencia', titulo: 'Ausência prolongada', mensagem: 'Fernanda Lima não treina há 8 dias', alunoId: 'alu-6', alunoNome: 'Fernanda Lima', urgencia: 'alta', acao: { label: 'Ver perfil', rota: '/professor/alunos/alu-6' }, lido: false, criadoEm: '2026-03-17T08:00:00Z' },
  { id: 'alrt-4', tipo: 'graduacao_pronta', titulo: 'Pronto para promoção', mensagem: 'Maria Santos atingiu requisitos para faixa roxa', alunoId: 'alu-4', alunoNome: 'Maria Santos', urgencia: 'alta', acao: { label: 'Ver avaliação', rota: '/professor/avaliacoes' }, lido: false, criadoEm: '2026-03-16T10:00:00Z' },
  { id: 'alrt-5', tipo: 'graduacao_pronta', titulo: 'Pronto para promoção', mensagem: 'Rafael Almeida pronto para 2º grau na marrom', alunoId: 'alu-9', alunoNome: 'Rafael Almeida', urgencia: 'alta', acao: { label: 'Ver avaliação', rota: '/professor/avaliacoes' }, lido: false, criadoEm: '2026-03-16T10:00:00Z' },
  { id: 'alrt-6', tipo: 'aniversario', titulo: 'Aniversário', mensagem: 'Carlos Souza faz 25 anos amanhã', alunoId: 'alu-7', alunoNome: 'Carlos Souza', urgencia: 'info', lido: false, criadoEm: '2026-03-17T06:00:00Z' },
  { id: 'alrt-7', tipo: 'aniversario', titulo: 'Aniversário', mensagem: 'Ana Costa faz 30 anos hoje!', alunoId: 'alu-2', alunoNome: 'Ana Costa', urgencia: 'info', lido: false, criadoEm: '2026-03-17T06:00:00Z' },
  { id: 'alrt-8', tipo: 'turma_lotada', titulo: 'Turma quase lotada', mensagem: 'Terça Avançada: 18/20 alunos — considere abrir nova turma', turmaId: 'turma-bjj-noite', turmaNome: 'BJJ Noite — Avançada', urgencia: 'media', acao: { label: 'Ver turma', rota: '/professor/turmas' }, lido: false, criadoEm: '2026-03-16T14:00:00Z' },
  { id: 'alrt-9', tipo: 'primeiro_dia', titulo: 'Aluno novo', mensagem: 'Lucas Mendes começa na turma de Segunda', alunoId: 'alu-5', alunoNome: 'Lucas Mendes', turmaId: 'turma-bjj-noite', turmaNome: 'BJJ Noite — Avançada', urgencia: 'info', acao: { label: 'Ver perfil', rota: '/professor/alunos/alu-5' }, lido: false, criadoEm: '2026-03-17T07:00:00Z' },
  { id: 'alrt-10', tipo: 'retorno', titulo: 'Aluno retornando', mensagem: 'Patricia Gomes voltou após 45 dias ausente', alunoId: 'alu-14', alunoNome: 'Patricia Gomes', urgencia: 'info', acao: { label: 'Ver perfil', rota: '/professor/alunos/alu-14' }, lido: false, criadoEm: '2026-03-17T07:00:00Z' },
  { id: 'alrt-11', tipo: 'avaliacao_pendente', titulo: 'Avaliações pendentes', mensagem: '5 alunos sem avaliação há mais de 3 meses', urgencia: 'media', acao: { label: 'Avaliar', rota: '/professor/avaliacoes' }, lido: false, criadoEm: '2026-03-16T08:00:00Z' },
  { id: 'alrt-12', tipo: 'lesao_reportada', titulo: 'Lesão reportada', mensagem: 'Pedro Silva reportou lesão no joelho esquerdo', alunoId: 'alu-1', alunoNome: 'Pedro Silva', urgencia: 'alta', acao: { label: 'Ver perfil', rota: '/professor/alunos/alu-1' }, lido: false, criadoEm: '2026-03-15T16:00:00Z' },
];

export async function mockGetAlertas(_professorId: string): Promise<AlertaProfessor[]> {
  await delay(400);
  return ALERTAS.map((a) => ({ ...a }));
}

export async function mockGetAlertasCount(_professorId: string): Promise<number> {
  await delay(200);
  return ALERTAS.filter((a) => !a.lido).length;
}

export async function mockMarcarLido(alertaId: string): Promise<void> {
  await delay(200);
  const alerta = ALERTAS.find((a) => a.id === alertaId);
  if (alerta) alerta.lido = true;
}

export async function mockMarcarTodosLidos(_professorId: string): Promise<void> {
  await delay(300);
  ALERTAS.forEach((a) => { a.lido = true; });
}
