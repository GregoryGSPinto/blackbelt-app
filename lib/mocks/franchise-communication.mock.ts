import type {
  Broadcast,
  BroadcastRecipient,
  ReceiptStatus,
  NetworkTraining,
  SendBroadcastData,
  ScheduleTrainingData,
} from '@/lib/api/franchise-communication.service';

const delay = () => new Promise((r) => setTimeout(r, 350));

const ACADEMIES = [
  { id: 'acad-1', name: 'Black Belt Moema' },
  { id: 'acad-2', name: 'Black Belt Alphaville' },
  { id: 'acad-3', name: 'Black Belt Barra' },
  { id: 'acad-4', name: 'Black Belt Savassi' },
  { id: 'acad-5', name: 'Black Belt Moinhos' },
];

function makeRecipients(seed: number): BroadcastRecipient[] {
  return ACADEMIES.map((a, i) => {
    const statuses: ReceiptStatus[] = ['lido', 'entregue', 'lido', 'enviado', 'falha'];
    const status = statuses[(i + seed) % statuses.length];
    return {
      academy_id: a.id,
      academy_name: a.name,
      status,
      read_at: status === 'lido' ? new Date(Date.now() - (i + 1) * 3600000).toISOString() : null,
    };
  });
}

const BROADCASTS: Broadcast[] = [
  {
    id: 'bc-1', franchise_id: 'franchise-1', type: 'comunicado', subject: 'Novo horario de verao da rede',
    body: 'Informamos que a partir de dezembro todas as unidades devem adotar o horario de verao estendido ate 22h nos dias uteis.',
    channels: ['email', 'push'], recipients: makeRecipients(0), sent_at: new Date(Date.now() - 2 * 86400000).toISOString(), created_by: 'Admin Rede',
  },
  {
    id: 'bc-2', franchise_id: 'franchise-1', type: 'novo_padrao', subject: 'Padrao de uniforme atualizado',
    body: 'O novo modelo de kimono oficial da rede esta disponivel para encomenda. Prazo de adequacao: 60 dias.',
    channels: ['email', 'in_app'], recipients: makeRecipients(1), sent_at: new Date(Date.now() - 5 * 86400000).toISOString(), created_by: 'Admin Rede',
  },
  {
    id: 'bc-3', franchise_id: 'franchise-1', type: 'marketing_material', subject: 'Kit campanha Dia das Criancas',
    body: 'Disponibilizamos artes, videos e roteiro para campanha do Dia das Criancas. Baixem no portal.',
    channels: ['email', 'push', 'in_app'], recipients: makeRecipients(2), sent_at: new Date(Date.now() - 8 * 86400000).toISOString(), created_by: 'Marketing',
  },
  {
    id: 'bc-4', franchise_id: 'franchise-1', type: 'training', subject: 'Treinamento: Gestao de Conflitos',
    body: 'Treinamento online obrigatorio sobre gestao de conflitos com alunos e pais. Data: proxima quinta.',
    channels: ['email', 'push'], recipients: makeRecipients(3), sent_at: new Date(Date.now() - 10 * 86400000).toISOString(), created_by: 'RH Rede',
  },
  {
    id: 'bc-5', franchise_id: 'franchise-1', type: 'survey', subject: 'Pesquisa de Satisfacao da Rede Q4',
    body: 'Solicitamos que todas as unidades respondam a pesquisa trimestral de satisfacao ate o dia 15.',
    channels: ['email'], recipients: makeRecipients(4), sent_at: new Date(Date.now() - 12 * 86400000).toISOString(), created_by: 'Qualidade',
  },
  {
    id: 'bc-6', franchise_id: 'franchise-1', type: 'comunicado', subject: 'Atualizacao do sistema BlackBelt v2',
    body: 'O sistema sera atualizado no sabado as 02h. Estimativa de 30 min de indisponibilidade.',
    channels: ['email', 'sms', 'push'], recipients: makeRecipients(0), sent_at: new Date(Date.now() - 15 * 86400000).toISOString(), created_by: 'TI',
  },
  {
    id: 'bc-7', franchise_id: 'franchise-1', type: 'novo_padrao', subject: 'Novo protocolo de seguranca',
    body: 'Em funcao de novas normas, atualizamos o protocolo de seguranca para aulas infantis. Documento anexo.',
    channels: ['email', 'in_app'], recipients: makeRecipients(1), sent_at: new Date(Date.now() - 18 * 86400000).toISOString(), created_by: 'Pedagogico',
  },
  {
    id: 'bc-8', franchise_id: 'franchise-1', type: 'marketing_material', subject: 'Campanha Black Friday 2026',
    body: 'Materiais da campanha Black Friday disponibilizados. Usem os descontos padronizados.',
    channels: ['email', 'push'], recipients: makeRecipients(2), sent_at: new Date(Date.now() - 20 * 86400000).toISOString(), created_by: 'Marketing',
  },
  {
    id: 'bc-9', franchise_id: 'franchise-1', type: 'training', subject: 'Workshop: Retencao de Alunos',
    body: 'Workshop presencial sobre estrategias de retencao. Local: sede SP. Vagas limitadas.',
    channels: ['email'], recipients: makeRecipients(3), sent_at: new Date(Date.now() - 25 * 86400000).toISOString(), created_by: 'Operacoes',
  },
  {
    id: 'bc-10', franchise_id: 'franchise-1', type: 'comunicado', subject: 'Resultado da rede - Janeiro 2026',
    body: 'Compartilhamos os resultados consolidados da rede em janeiro. Faturamento total de R$ 1.2M.',
    channels: ['email', 'in_app'], recipients: makeRecipients(4), sent_at: new Date(Date.now() - 30 * 86400000).toISOString(), created_by: 'Diretoria',
  },
];

const TRAININGS: NetworkTraining[] = [
  {
    id: 'tr-1', franchise_id: 'franchise-1', title: 'Gestao Financeira para Franqueados',
    description: 'Treinamento sobre gestao financeira, controle de caixa e analise de resultados.',
    date: '2026-03-20', time: '14:00', duration_minutes: 120, format: 'online',
    instructor: 'Prof. Marcelo Contabilidade', max_participants: 30, enrolled: 18, status: 'agendado',
  },
  {
    id: 'tr-2', franchise_id: 'franchise-1', title: 'Metodologia Kids BJJ - Nivel 2',
    description: 'Aprofundamento na metodologia ludica para aulas infantis de jiu-jitsu.',
    date: '2026-03-25', time: '10:00', duration_minutes: 180, format: 'presencial',
    instructor: 'Mestre Roberto Silva', max_participants: 20, enrolled: 15, status: 'agendado',
  },
  {
    id: 'tr-3', franchise_id: 'franchise-1', title: 'Vendas e Conversao de Leads',
    description: 'Tecnicas de vendas consultivas para converter aulas experimentais em matriculas.',
    date: '2026-02-15', time: '09:00', duration_minutes: 90, format: 'online',
    instructor: 'Carla Vendas', max_participants: 50, enrolled: 42, status: 'concluido',
  },
  {
    id: 'tr-4', franchise_id: 'franchise-1', title: 'Atualizacao do Sistema BlackBelt',
    description: 'Treinamento sobre novas funcionalidades do sistema para gestores.',
    date: '2026-04-02', time: '15:00', duration_minutes: 60, format: 'hibrido',
    instructor: 'Equipe TI', max_participants: 40, enrolled: 8, status: 'agendado',
  },
];

export async function mockSendBroadcast(franchiseId: string, data: SendBroadcastData): Promise<Broadcast> {
  await delay();
  return {
    id: `bc-${Date.now()}`,
    franchise_id: franchiseId,
    type: data.type,
    subject: data.subject,
    body: data.body,
    channels: data.channels,
    recipients: ACADEMIES.map((a) => ({
      academy_id: a.id,
      academy_name: a.name,
      status: 'enviado' as ReceiptStatus,
      read_at: null,
    })),
    sent_at: new Date().toISOString(),
    created_by: 'Admin Rede',
  };
}

export async function mockGetBroadcasts(_franchiseId: string): Promise<Broadcast[]> {
  await delay();
  return BROADCASTS;
}

export async function mockGetReceipts(broadcastId: string): Promise<BroadcastRecipient[]> {
  await delay();
  const broadcast = BROADCASTS.find((b) => b.id === broadcastId);
  return broadcast?.recipients ?? makeRecipients(0);
}

export async function mockScheduleTraining(franchiseId: string, data: ScheduleTrainingData): Promise<NetworkTraining> {
  await delay();
  return {
    id: `tr-${Date.now()}`,
    franchise_id: franchiseId,
    title: data.title,
    description: data.description,
    date: data.date,
    time: data.time,
    duration_minutes: data.duration_minutes,
    format: data.format,
    instructor: data.instructor,
    max_participants: data.max_participants,
    enrolled: 0,
    status: 'agendado',
  };
}

export async function mockGetTrainings(_franchiseId: string): Promise<NetworkTraining[]> {
  await delay();
  return TRAININGS;
}
