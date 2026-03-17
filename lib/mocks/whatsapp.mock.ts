import type { WhatsAppMessage } from '@/lib/api/whatsapp.service';

export function mockWhatsAppHistory(
  _academyId: string,
  limit: number,
): WhatsAppMessage[] {
  const messages: WhatsAppMessage[] = [
    {
      id: 'wa-1',
      phone: '+5511999001001',
      template: 'welcome',
      variables: { nome: 'Lucas Ferreira', academia: 'Guerreiros BJJ', link: 'https://app.blackbelt.com' },
      status: 'read',
      sentAt: '2026-03-17T10:00:00Z',
      deliveredAt: '2026-03-17T10:00:02Z',
      readAt: '2026-03-17T10:05:00Z',
      error: null,
    },
    {
      id: 'wa-2',
      phone: '+5511999002002',
      template: 'class_reminder',
      variables: { turma: 'BJJ Fundamentos', horario: '19:00' },
      status: 'delivered',
      sentAt: '2026-03-17T17:00:00Z',
      deliveredAt: '2026-03-17T17:00:03Z',
      readAt: null,
      error: null,
    },
    {
      id: 'wa-3',
      phone: '+5511999003003',
      template: 'payment_reminder',
      variables: { nome: 'Marcos Oliveira', valor: '197,00', data: '20/03/2026' },
      status: 'sent',
      sentAt: '2026-03-17T09:00:00Z',
      deliveredAt: null,
      readAt: null,
      error: null,
    },
    {
      id: 'wa-4',
      phone: '+5511999004004',
      template: 'absence_alert',
      variables: { responsavel: 'Maria Santos', aluno: 'Pedro Santos', dias: '5' },
      status: 'read',
      sentAt: '2026-03-16T14:00:00Z',
      deliveredAt: '2026-03-16T14:00:01Z',
      readAt: '2026-03-16T14:30:00Z',
      error: null,
    },
    {
      id: 'wa-5',
      phone: '+5511999005005',
      template: 'graduation',
      variables: { nome: 'Ana Clara', faixa: 'Azul', data: '25/03/2026' },
      status: 'failed',
      sentAt: null,
      deliveredAt: null,
      readAt: null,
      error: 'Número inválido',
    },
  ];

  return messages.slice(0, limit);
}
