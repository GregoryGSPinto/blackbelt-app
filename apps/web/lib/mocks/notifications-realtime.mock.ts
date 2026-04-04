import type { AppNotification } from '@/lib/api/notifications-realtime.service';

const NOW = new Date();
function minutesAgo(m: number) { return new Date(NOW.getTime() - m * 60000).toISOString(); }

const MOCK_NOTIFICATIONS: AppNotification[] = [
  { id: 'n1', user_id: 'mock', title: 'Novo check-in', body: 'João Carlos fez check-in na turma BJJ Iniciante', type: 'checkin', read: false, created_at: minutesAgo(2) },
  { id: 'n2', user_id: 'mock', title: 'Fatura paga', body: 'Rafael Santos pagou a mensalidade de Março', type: 'payment', read: false, created_at: minutesAgo(45) },
  { id: 'n3', user_id: 'mock', title: 'Aluno ausente', body: 'Marcos Silva está ausente há 7 dias', type: 'alert', read: false, created_at: minutesAgo(120) },
  { id: 'n4', user_id: 'mock', title: 'Nova mensagem', body: 'Prof. Ana enviou uma mensagem sobre a turma Kids', type: 'message', read: false, created_at: minutesAgo(180) },
  { id: 'n5', user_id: 'mock', title: 'Graduação próxima', body: '3 alunos estão aptos para exame de faixa', type: 'graduation', read: true, created_at: minutesAgo(300) },
];

export function mockGetUnreadNotifications(_profileId: string): AppNotification[] {
  return MOCK_NOTIFICATIONS.filter((n) => !n.read);
}
