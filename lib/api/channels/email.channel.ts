import type { ChannelSender } from '@/lib/api/notification-hub.service';
import { resolveTemplate } from '@/lib/api/notification-hub.service';
import type { NotificationTemplate, NotificationResult } from '@/lib/types/notification';
import { logger } from '@/lib/monitoring/logger';

const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER ?? 'mock';
const EMAIL_API_KEY = process.env.EMAIL_API_KEY ?? '';
const EMAIL_FROM = process.env.EMAIL_FROM ?? 'noreply@blackbelt.app';

export class EmailChannel implements ChannelSender {
  readonly channel = 'email' as const;

  async send(_userId: string, template: NotificationTemplate, data: Record<string, string>): Promise<NotificationResult> {
    const message = resolveTemplate(template, data);

    if (EMAIL_PROVIDER === 'resend' && EMAIL_API_KEY) {
      return this.sendViaResend(data['email'] ?? '', template, message);
    }

    // Mock/fallback
    logger.info('Email sent (mock)', { template, message, from: EMAIL_FROM });
    return {
      id: `email_${Date.now()}`,
      channel: this.channel,
      status: 'sent',
      sentAt: new Date().toISOString(),
    };
  }

  private async sendViaResend(to: string, subject: string, html: string): Promise<NotificationResult> {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${EMAIL_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: EMAIL_FROM, to, subject, html }),
      });
      const result = await res.json() as { id?: string };
      return {
        id: result.id ?? `email_${Date.now()}`,
        channel: this.channel,
        status: res.ok ? 'sent' : 'failed',
        sentAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Email send failed', { error: error instanceof Error ? error.message : 'unknown' });
      return { id: `email_${Date.now()}`, channel: this.channel, status: 'failed', error: 'Send failed' };
    }
  }
}
