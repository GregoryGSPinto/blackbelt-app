import type { TrialClass, TrialMetrics, CreateTrialRequest, TrialFilters } from '@/lib/api/aula-experimental.service';

const delay = () => new Promise((r) => setTimeout(r, 200));

const TRIALS: TrialClass[] = [
  { id: 'trial-1', leadNome: 'Gabriel Souza', leadEmail: 'gabriel@email.com', leadTelefone: '(11) 98765-4321', leadOrigem: 'instagram', turmaId: 'turma-1', turmaNome: 'BJJ Fundamentos', dataAgendada: '2026-03-18T07:00:00Z', status: 'agendada', professorId: 'prof-1', professorNome: 'André Santos', followUpEnviado: false, createdAt: '2026-03-15T10:00:00Z' },
  { id: 'trial-2', leadNome: 'Carla Mendes', leadEmail: 'carla@email.com', leadTelefone: '(11) 97654-3210', leadOrigem: 'site', turmaId: 'turma-2', turmaNome: 'BJJ All Levels', dataAgendada: '2026-03-18T10:00:00Z', status: 'confirmada', professorId: 'prof-1', professorNome: 'André Santos', followUpEnviado: true, createdAt: '2026-03-14T14:00:00Z' },
  { id: 'trial-3', leadNome: 'Marcos Ribeiro', leadEmail: 'marcos@email.com', leadTelefone: '(11) 96543-2109', leadOrigem: 'indicacao', turmaId: 'turma-1', turmaNome: 'BJJ Fundamentos', dataAgendada: '2026-03-17T07:00:00Z', status: 'compareceu', professorId: 'prof-1', professorNome: 'André Santos', observacoes: 'Gostou bastante, quer treinar 3x por semana', followUpEnviado: true, createdAt: '2026-03-12T09:00:00Z' },
  { id: 'trial-4', leadNome: 'Juliana Pereira', leadEmail: 'juliana@email.com', leadTelefone: '(11) 95432-1098', leadOrigem: 'whatsapp', turmaId: 'turma-3', turmaNome: 'Judo Adulto', dataAgendada: '2026-03-16T18:00:00Z', status: 'matriculou', professorId: 'prof-2', professorNome: 'Fernanda Oliveira', observacoes: 'Fechou plano trimestral', followUpEnviado: true, createdAt: '2026-03-10T11:00:00Z' },
  { id: 'trial-5', leadNome: 'Rafael Costa', leadEmail: 'rafael@email.com', leadTelefone: '(11) 94321-0987', leadOrigem: 'presencial', turmaId: 'turma-1', turmaNome: 'BJJ Fundamentos', dataAgendada: '2026-03-15T07:00:00Z', status: 'nao_compareceu', professorId: 'prof-1', professorNome: 'André Santos', followUpEnviado: true, createdAt: '2026-03-11T16:00:00Z' },
  { id: 'trial-6', leadNome: 'Ana Paula Lima', leadEmail: 'anapaula@email.com', leadTelefone: '(11) 93210-9876', leadOrigem: 'instagram', turmaId: 'turma-2', turmaNome: 'BJJ All Levels', dataAgendada: '2026-03-19T10:00:00Z', status: 'agendada', professorId: 'prof-1', professorNome: 'André Santos', followUpEnviado: false, createdAt: '2026-03-16T08:00:00Z' },
  { id: 'trial-7', leadNome: 'Thiago Barbosa', leadEmail: 'thiago@email.com', leadTelefone: '(11) 92109-8765', leadOrigem: 'site', turmaId: 'turma-4', turmaNome: 'BJJ Noturno', dataAgendada: '2026-03-17T21:00:00Z', status: 'compareceu', professorId: 'prof-1', professorNome: 'André Santos', observacoes: 'Experiência prévia em wrestling', followUpEnviado: true, createdAt: '2026-03-13T20:00:00Z' },
  { id: 'trial-8', leadNome: 'Fernanda Alves', leadEmail: 'fernanda.a@email.com', leadTelefone: '(11) 91098-7654', leadOrigem: 'indicacao', turmaId: 'turma-3', turmaNome: 'Judo Adulto', dataAgendada: '2026-03-16T18:00:00Z', status: 'matriculou', professorId: 'prof-2', professorNome: 'Fernanda Oliveira', observacoes: 'Indicada pela aluna Maria Santos', followUpEnviado: true, createdAt: '2026-03-09T15:00:00Z' },
  { id: 'trial-9', leadNome: 'Bruno Nascimento', leadEmail: 'bruno@email.com', leadTelefone: '(11) 90987-6543', leadOrigem: 'whatsapp', turmaId: 'turma-1', turmaNome: 'BJJ Fundamentos', dataAgendada: '2026-03-20T07:00:00Z', status: 'agendada', professorId: 'prof-1', professorNome: 'André Santos', followUpEnviado: false, createdAt: '2026-03-16T12:00:00Z' },
  { id: 'trial-10', leadNome: 'Patrícia Duarte', leadEmail: 'patricia@email.com', leadTelefone: '(11) 99876-5432', leadOrigem: 'instagram', turmaId: 'turma-2', turmaNome: 'BJJ All Levels', dataAgendada: '2026-03-14T10:00:00Z', status: 'compareceu', professorId: 'prof-1', professorNome: 'André Santos', followUpEnviado: true, createdAt: '2026-03-08T10:00:00Z' },
  { id: 'trial-11', leadNome: 'Diego Oliveira', leadEmail: 'diego@email.com', leadTelefone: '(11) 98765-1111', leadOrigem: 'site', turmaId: 'turma-4', turmaNome: 'BJJ Noturno', dataAgendada: '2026-03-13T21:00:00Z', status: 'desistiu', professorId: 'prof-1', professorNome: 'André Santos', observacoes: 'Disse que o horário não funciona para ele', followUpEnviado: true, createdAt: '2026-03-07T18:00:00Z' },
  { id: 'trial-12', leadNome: 'Camila Rocha', leadEmail: 'camila@email.com', leadTelefone: '(11) 98765-2222', leadOrigem: 'presencial', turmaId: 'turma-1', turmaNome: 'BJJ Fundamentos', dataAgendada: '2026-03-19T07:00:00Z', status: 'confirmada', professorId: 'prof-1', professorNome: 'André Santos', followUpEnviado: true, createdAt: '2026-03-16T09:00:00Z' },
  { id: 'trial-13', leadNome: 'Eduardo Martins', leadEmail: 'eduardo@email.com', leadTelefone: '(11) 98765-3333', leadOrigem: 'indicacao', turmaId: 'turma-3', turmaNome: 'Judo Adulto', dataAgendada: '2026-03-20T18:00:00Z', status: 'agendada', professorId: 'prof-2', professorNome: 'Fernanda Oliveira', followUpEnviado: false, createdAt: '2026-03-17T07:00:00Z' },
  { id: 'trial-14', leadNome: 'Letícia Campos', leadEmail: 'leticia@email.com', leadTelefone: '(11) 98765-4444', leadOrigem: 'instagram', turmaId: 'turma-2', turmaNome: 'BJJ All Levels', dataAgendada: '2026-03-18T10:00:00Z', status: 'confirmada', professorId: 'prof-1', professorNome: 'André Santos', followUpEnviado: true, createdAt: '2026-03-15T13:00:00Z' },
  { id: 'trial-15', leadNome: 'Vinícius Teixeira', leadEmail: 'vinicius@email.com', leadTelefone: '(11) 98765-5555', leadOrigem: 'site', turmaId: 'turma-1', turmaNome: 'BJJ Fundamentos', dataAgendada: '2026-03-21T07:00:00Z', status: 'agendada', professorId: 'prof-1', professorNome: 'André Santos', followUpEnviado: false, createdAt: '2026-03-17T11:00:00Z' },
];

export async function mockCreateTrialClass(_academyId: string, data: CreateTrialRequest): Promise<TrialClass> {
  await delay();
  const trial: TrialClass = {
    id: `trial-${Date.now()}`,
    leadNome: data.leadNome,
    leadEmail: data.leadEmail,
    leadTelefone: data.leadTelefone,
    leadOrigem: data.leadOrigem,
    turmaId: data.turmaId,
    turmaNome: 'BJJ Fundamentos',
    dataAgendada: data.dataAgendada,
    status: 'agendada',
    professorId: 'prof-1',
    professorNome: 'André Santos',
    followUpEnviado: false,
    createdAt: new Date().toISOString(),
  };
  TRIALS.push(trial);
  return trial;
}

export async function mockListTrialClasses(_academyId: string, filters?: TrialFilters): Promise<TrialClass[]> {
  await delay();
  let result = TRIALS.map((t) => ({ ...t }));
  if (filters?.status) result = result.filter((t) => t.status === filters.status);
  if (filters?.origem) result = result.filter((t) => t.leadOrigem === filters.origem);
  return result;
}

export async function mockUpdateTrialStatus(id: string, status: TrialClass['status']): Promise<TrialClass> {
  await delay();
  const trial = TRIALS.find((t) => t.id === id);
  if (trial) trial.status = status;
  return { ...(trial ?? TRIALS[0]), status };
}

export async function mockGetTrialMetrics(_academyId: string): Promise<TrialMetrics> {
  await delay();
  return { agendadas: 15, confirmadas: 12, compareceram: 10, matricularam: 6, taxaConversao: 40 };
}
