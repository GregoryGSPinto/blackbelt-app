import type { NotificationDTO, NotificationPrefs } from '@/lib/api/notificacoes.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

const NOTIFICATIONS: NotificationDTO[] = [
  { id: 'not-1', type: 'nova_mensagem', title: 'Nova mensagem', message: 'João Mendes enviou uma mensagem', time: '14:30', read: false, link: '/professor/mensagens' },
  { id: 'not-2', type: 'aula_em_breve', title: 'Aula em 30 min', message: 'BJJ Noite começa às 19:00', time: '18:30', read: false, link: '/professor/turma-ativa' },
  { id: 'not-3', type: 'conquista', title: 'Nova conquista!', message: 'Bruna Alves desbloqueou "Streak 7 dias"', time: 'Ontem', read: true },
  { id: 'not-4', type: 'pagamento_vencido', title: 'Pagamento pendente', message: '3 faturas venceram esta semana', time: 'Ontem', read: true, link: '/admin/financeiro' },
  { id: 'not-5', type: 'avaliacao_recebida', title: 'Avaliação disponível', message: 'Prof. Carlos avaliou seu desempenho', time: '2 dias', read: true, link: '/dashboard/progresso' },
  { id: 'not-6', type: 'promocao_faixa', title: 'Promoção de faixa!', message: 'Rafael Souza promovido para faixa marrom', time: '3 dias', read: true },
];

export async function mockListNotifications(_userId: string): Promise<NotificationDTO[]> {
  await delay();
  return NOTIFICATIONS;
}

export async function mockMarkRead(_ids: string[]): Promise<void> {
  await delay();
}

export async function mockMarkAllRead(): Promise<void> {
  await delay();
}

export async function mockGetPreferences(_userId: string): Promise<NotificationPrefs> {
  await delay();
  return {
    push_enabled: true,
    email_enabled: true,
    types: {
      nova_mensagem: true,
      aula_em_breve: true,
      promocao_faixa: true,
      conquista: true,
      pagamento_vencido: true,
      avaliacao_recebida: true,
    },
  };
}

export async function mockUpdatePreferences(_userId: string, _prefs: NotificationPrefs): Promise<void> {
  await delay();
}
