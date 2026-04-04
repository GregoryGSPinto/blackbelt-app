import type { ChannelSender } from '@/lib/api/notification-hub.service';
import { resolveTemplate } from '@/lib/api/notification-hub.service';
import type { NotificationTemplate, NotificationResult } from '@/lib/types/notification';
import { logger } from '@/lib/monitoring/logger';

export class InAppChannel implements ChannelSender {
  readonly channel = 'in_app' as const;

  async send(_userId: string, template: NotificationTemplate, data: Record<string, string>): Promise<NotificationResult> {
    const message = resolveTemplate(template, data);
    // In production: insert into notifications table via Supabase
    logger.info('In-app notification created', { template, message });
    return {
      id: `inapp_${Date.now()}`,
      channel: this.channel,
      status: 'sent',
      sentAt: new Date().toISOString(),
    };
  }
}
