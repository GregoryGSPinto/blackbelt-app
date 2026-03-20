import type { AppNotification } from '@/lib/api/notifications-realtime.service';

const NOW = new Date();
function minutesAgo(m: number) { return new Date(NOW.getTime() - m * 60000).toISOString(); }

const MOCK_NOTIFICATIONS: AppNotification[] = [
  { id: 'n1', recipient_id: 'mock', title: 'Novo check-in', body: 'João Carlos fez check-in na turma BJJ Iniciante', type: 'checkin', read_at: null, created_at: minutesAgo(2), link: '/admin/presenca' },
  { id: 'n2', recipient_id: 'mock', title: 'Fatura paga', body: 'Rafael Santos pagou a mensalidade de Março', type: 'payment', read_at: null, created_at: minutesAgo(45), link: '/admin/financeiro' },
  { id: 'n3', recipient_id: 'mock', title: 'Aluno ausente', body: 'Marcos Silva está ausente há 7 dias', type: 'alert', read_at: null, created_at: minutesAgo(120), link: '/admin/retencao' },
  { id: 'n4', recipient_id: 'mock', title: 'Nova mensagem', body: 'Prof. Ana enviou uma mensagem sobre a turma Kids', type: 'message', read_at: null, created_at: minutesAgo(180), link: '/admin/mensagens' },
  { id: 'n5', recipient_id: 'mock', title: 'Graduação próxima', body: '3 alunos estão aptos para exame de faixa', type: 'graduation', read_at: minutesAgo(10), created_at: minutesAgo(300), link: '/admin/graduacoes' },
];

export function mockGetUnreadNotifications(_profileId: string): AppNotification[] {
  return MOCK_NOTIFICATIONS.filter((n) => !n.read_at);
}
