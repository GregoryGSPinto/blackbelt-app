import type { NotificationPreferences, NotificationTemplate, NotificationChannel } from '@/lib/types/notification';

const delay = () => new Promise((r) => setTimeout(r, 200));

const ALL_TEMPLATES: NotificationTemplate[] = [
  'aula_em_breve', 'fatura_vencendo', 'promocao_faixa', 'mensagem_professor',
  'conquista_nova', 'boas_vindas', 'inatividade', 'falta_detectada',
  'aniversario', 'relatorio_mensal',
];

const DEFAULT_CHANNELS: NotificationChannel[] = ['push', 'in_app'];

let mockPrefs: NotificationPreferences | null = null;

function getDefaultPrefs(userId: string): NotificationPreferences {
  const channels: Record<NotificationTemplate, NotificationChannel[]> = {} as Record<NotificationTemplate, NotificationChannel[]>;
  for (const t of ALL_TEMPLATES) {
    channels[t] = [...DEFAULT_CHANNELS];
  }
  return {
    userId,
    muteAll: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    channels,
  };
}

export async function mockGetPreferences(userId: string): Promise<NotificationPreferences> {
  await delay();
  if (!mockPrefs) mockPrefs = getDefaultPrefs(userId);
  return { ...mockPrefs };
}

export async function mockUpdatePreferences(
  userId: string,
  partial: Partial<NotificationPreferences>,
): Promise<NotificationPreferences> {
  await delay();
  if (!mockPrefs) mockPrefs = getDefaultPrefs(userId);
  mockPrefs = { ...mockPrefs, ...partial, userId };
  return { ...mockPrefs };
}
