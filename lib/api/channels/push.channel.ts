import type { ChannelSender } from '@/lib/api/notification-hub.service';
import { resolveTemplate } from '@/lib/api/notification-hub.service';
import type { NotificationTemplate, NotificationResult } from '@/lib/types/notification';
import { logger } from '@/lib/monitoring/logger';

export class PushChannel implements ChannelSender {
  readonly channel = 'push' as const;

  async send(_userId: string, template: NotificationTemplate, data: Record<string, string>): Promise<NotificationResult> {
    const message = resolveTemplate(template, data);
    logger.info('Push notification sent', { template, message });
    // In production: use FCM/APNs via push.ts
    return {
      id: `push_${Date.now()}`,
      channel: this.channel,
      status: 'sent',
      sentAt: new Date().toISOString(),
    };
  }
}
