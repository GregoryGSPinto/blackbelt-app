import type { ChannelSender } from '@/lib/api/notification-hub.service';
import { resolveTemplate } from '@/lib/api/notification-hub.service';
import type { NotificationTemplate, NotificationResult } from '@/lib/types/notification';
import { logger } from '@/lib/monitoring/logger';

export class SmsChannel implements ChannelSender {
  readonly channel = 'sms' as const;

  async send(_userId: string, template: NotificationTemplate, data: Record<string, string>): Promise<NotificationResult> {
    const message = resolveTemplate(template, data);
    // SMS is a placeholder — will integrate with Twilio/Vonage in future
    logger.info('SMS sent (placeholder)', { template, message });
    return {
      id: `sms_${Date.now()}`,
      channel: this.channel,
      status: 'queued',
      sentAt: new Date().toISOString(),
    };
  }
}
