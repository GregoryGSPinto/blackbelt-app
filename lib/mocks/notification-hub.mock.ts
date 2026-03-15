import type { NotificationChannel, NotificationTemplate, NotificationResult } from '@/lib/types/notification';

const delay = () => new Promise((r) => setTimeout(r, 100));

export async function mockSendNotification(
  _userId: string,
  channels: NotificationChannel[],
  _template: NotificationTemplate,
  _data: Record<string, string>,
): Promise<NotificationResult[]> {
  await delay();
  return channels.map((channel) => ({
    id: `notif_${channel}_${Date.now()}`,
    channel,
    status: 'sent' as const,
    sentAt: new Date().toISOString(),
  }));
}
