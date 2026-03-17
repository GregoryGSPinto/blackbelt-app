import type { ExperimentalRecepcao, FunnelExperimental } from '@/lib/api/recepcao-experimental.service';

const MOCK_HOJE: ExperimentalRecepcao[] = [
  { id: 'exp-1', nome: 'Fernanda Lima', telefone: '(11) 99999-1234', email: 'fernanda@email.com', idade: 8, modalidade: 'Jiu-Jitsu', turma: 'Kids BJJ', horario: '14:00', data: '2026-03-17', origem: 'Instagram', observacoes: 'Mae quer que filha pratique esporte', status: 'confirmada', criadoEm: '2026-03-15' },
  { id: 'exp-2', nome: 'Gustavo Rocha', telefone: '(11) 98888-5678', email: 'gustavo@email.com', idade: 25, modalidade: 'Muay Thai', turma: 'Muay Thai', horario: '18:00', data: '2026-03-17', origem: 'Indicacao', observacoes: 'Indicado por Lucas Ferreira', status: 'agendada', criadoEm: '2026-03-16' },
];

const MOCK_FOLLOWUP: ExperimentalRecepcao[] = [
  { id: 'exp-3', nome: 'Carla Mendes', telefone: '(11) 97777-9999', email: 'carla@email.com', idade: 30, modalidade: 'Jiu-Jitsu', turma: 'Jiu-Jitsu Iniciante', horario: '06:30', data: '2026-03-14', origem: 'Site', observacoes: 'Gostou muito da aula, pediu para pensar', status: 'follow_up', criadoEm: '2026-03-12' },
  { id: 'exp-4', nome: 'Roberto Silva', telefone: '(11) 96666-8888', email: 'roberto@email.com', idade: 35, modalidade: 'MMA', turma: 'MMA', horario: '20:30', data: '2026-03-13', origem: 'Walk-in', observacoes: 'Disse que volta semana que vem', status: 'follow_up', criadoEm: '2026-03-13' },
];

const MOCK_HISTORICO: ExperimentalRecepcao[] = [
  { id: 'exp-5', nome: 'Amanda Torres', telefone: '(11) 95555-7777', email: 'amanda@email.com', idade: 22, modalidade: 'Jiu-Jitsu', turma: 'Jiu-Jitsu Iniciante', horario: '06:30', data: '2026-03-10', origem: 'Instagram', observacoes: '', status: 'matriculou', criadoEm: '2026-03-08' },
  { id: 'exp-6', nome: 'Diego Ramos', telefone: '(11) 94444-6666', email: 'diego@email.com', idade: 28, modalidade: 'Muay Thai', turma: 'Muay Thai', horario: '18:00', data: '2026-03-07', origem: 'Indicacao', observacoes: '', status: 'matriculou', criadoEm: '2026-03-05' },
  { id: 'exp-7', nome: 'Patricia Alves', telefone: '(11) 93333-5555', email: 'patricia@email.com', idade: 40, modalidade: 'Jiu-Jitsu', turma: 'Jiu-Jitsu Iniciante', horario: '09:00', data: '2026-03-05', origem: 'WhatsApp', observacoes: '', status: 'nao_veio', criadoEm: '2026-03-03' },
  { id: 'exp-8', nome: 'Marcos Vieira', telefone: '(11) 92222-4444', email: 'marcos@email.com', idade: 18, modalidade: 'MMA', turma: 'MMA', horario: '20:30', data: '2026-03-03', origem: 'Site', observacoes: '', status: 'desistiu', criadoEm: '2026-03-01' },
];

export function mockListExperimentais(): {
  hoje: ExperimentalRecepcao[];
  followUp: ExperimentalRecepcao[];
  historico: ExperimentalRecepcao[];
  funnel: FunnelExperimental;
} {
  return {
    hoje: MOCK_HOJE,
    followUp: MOCK_FOLLOWUP,
    historico: MOCK_HISTORICO,
    funnel: { agendadas: 12, vieram: 9, matricularam: 5, conversao: 55.6 },
  };
}

export function mockMarcarChegou(_id: string): { ok: boolean } { return { ok: true }; }
export function mockMarcarNaoVeio(_id: string): { ok: boolean } { return { ok: true }; }
export function mockMarcarMatriculou(_id: string): { ok: boolean } { return { ok: true }; }
