import type { ChannelSender } from '@/lib/api/notification-hub.service';
import { resolveTemplate } from '@/lib/api/notification-hub.service';
import type { NotificationTemplate, NotificationResult } from '@/lib/types/notification';
import type { WhatsAppSendResult, WhatsAppIncoming } from '@/lib/types/whatsapp';
import { logger } from '@/lib/monitoring/logger';

const WA_API_URL = process.env.WHATSAPP_API_URL ?? '';
const WA_API_KEY = process.env.WHATSAPP_API_KEY ?? '';
const WA_INSTANCE = process.env.WHATSAPP_INSTANCE ?? 'default';

export class WhatsAppChannel implements ChannelSender {
  readonly channel = 'whatsapp' as const;

  async send(_userId: string, template: NotificationTemplate, data: Record<string, string>): Promise<NotificationResult> {
    const message = resolveTemplate(template, data);
    const phone = data['phone'] ?? '';

    if (WA_API_URL && WA_API_KEY) {
      return this.sendViaEvolution(phone, message);
    }

    // Mock fallback
    logger.info('WhatsApp sent (mock)', { template, message, phone });
    return {
      id: `wa_${Date.now()}`,
      channel: this.channel,
      status: 'sent',
      sentAt: new Date().toISOString(),
    };
  }

  private async sendViaEvolution(phone: string, message: string): Promise<NotificationResult> {
    try {
      const res = await fetch(`${WA_API_URL}/message/sendText/${WA_INSTANCE}`, {
        method: 'POST',
        headers: { apikey: WA_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: phone, text: message }),
      });
      const result = await res.json() as WhatsAppSendResult;
      return {
        id: result.messageId ?? `wa_${Date.now()}`,
        channel: this.channel,
        status: res.ok ? 'sent' : 'failed',
        sentAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('WhatsApp send failed', { error: error instanceof Error ? error.message : 'unknown' });
      return { id: `wa_${Date.now()}`, channel: this.channel, status: 'failed', error: 'Send failed' };
    }
  }
}

export function parseIncomingWhatsApp(payload: Record<string, unknown>): WhatsAppIncoming {
  const data = payload.data as Record<string, unknown> | undefined;
  const message = data?.message as Record<string, unknown> | undefined;
  return {
    messageId: (data?.key as Record<string, string>)?.id ?? '',
    from: (data?.key as Record<string, string>)?.remoteJid ?? '',
    body: (message?.conversation as string) ?? '',
    timestamp: new Date().toISOString(),
    type: 'text',
  };
}
