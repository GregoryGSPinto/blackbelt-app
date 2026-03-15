import type { IntelligentNotification } from '@/lib/api/notifications.service';

const delay = () => new Promise((r) => setTimeout(r, 200));

const NOTIFICATIONS: IntelligentNotification[] = [
  {
    id: 'notif-1',
    priority: 'urgent',
    category: 'payment',
    title: 'Pagamentos vencidos',
    message: '5 faturas vencidas ha mais de 7 dias. Valor total: R$ 1.250,00',
    groupedNames: null,
    createdAt: '2026-03-15T08:00:00Z',
    read: false,
    actionUrl: '/admin/financeiro',
  },
  {
    id: 'notif-2',
    priority: 'urgent',
    category: 'attendance',
    title: 'Aluno em risco de evasao',
    message: 'Rafael Souza nao treina ha 15 dias e tem pagamento em dia.',
    groupedNames: null,
    createdAt: '2026-03-15T07:30:00Z',
    read: false,
    actionUrl: '/admin/alunos/rafael-souza',
  },
  {
    id: 'notif-3',
    priority: 'important',
    category: 'attendance',
    title: 'Treinos de hoje',
    message: 'Sophia, Miguel e Laura treinaram hoje',
    groupedNames: ['Sophia', 'Miguel', 'Laura'],
    createdAt: '2026-03-15T21:00:00Z',
    read: false,
    actionUrl: '/admin/checkins',
  },
  {
    id: 'notif-4',
    priority: 'important',
    category: 'lead',
    title: 'Novo lead aguardando',
    message: 'Carlos Ferreira preencheu formulario de interesse ha 2h.',
    groupedNames: null,
    createdAt: '2026-03-15T14:00:00Z',
    read: false,
    actionUrl: '/admin/leads',
  },
  {
    id: 'notif-5',
    priority: 'important',
    category: 'class',
    title: 'Turma lotada',
    message: 'BJJ Avancado Noite atingiu 100% da capacidade para amanha.',
    groupedNames: null,
    createdAt: '2026-03-15T12:00:00Z',
    read: false,
    actionUrl: '/admin/turmas',
  },
  {
    id: 'notif-6',
    priority: 'info',
    category: 'achievement',
    title: 'Conquistas desbloqueadas',
    message: 'Ana, Pedro e Bruna desbloquearam conquistas hoje',
    groupedNames: ['Ana', 'Pedro', 'Bruna'],
    createdAt: '2026-03-15T20:00:00Z',
    read: false,
    actionUrl: '/dashboard/conquistas',
  },
  {
    id: 'notif-7',
    priority: 'info',
    category: 'message',
    title: 'Nova mensagem',
    message: 'Prof. Carlos enviou mensagem no grupo BJJ Avancado.',
    groupedNames: null,
    createdAt: '2026-03-15T16:30:00Z',
    read: true,
    actionUrl: '/dashboard/mensagens',
  },
  {
    id: 'notif-8',
    priority: 'info',
    category: 'system',
    title: 'Relatorio semanal pronto',
    message: 'O relatorio de presenca da semana 11 esta disponivel.',
    groupedNames: null,
    createdAt: '2026-03-14T09:00:00Z',
    read: true,
    actionUrl: '/admin/relatorios',
  },
  {
    id: 'notif-9',
    priority: 'silent',
    category: 'system',
    title: 'Backup concluido',
    message: 'Backup automatico realizado com sucesso as 03:00.',
    groupedNames: null,
    createdAt: '2026-03-15T03:00:00Z',
    read: true,
    actionUrl: null,
  },
  {
    id: 'notif-10',
    priority: 'silent',
    category: 'attendance',
    title: 'Check-in automatico',
    message: 'Fernanda Rocha fez check-in via QR code.',
    groupedNames: null,
    createdAt: '2026-03-15T19:05:00Z',
    read: true,
    actionUrl: null,
  },
];

export async function mockGetNotifications(
  _profileId: string,
): Promise<IntelligentNotification[]> {
  await delay();
  return NOTIFICATIONS.map((n) => ({ ...n }));
}

export async function mockMarkAsRead(_notificationId: string): Promise<void> {
  await delay();
}

export async function mockMarkAllNotificationsRead(
  _profileId: string,
): Promise<void> {
  await delay();
}
