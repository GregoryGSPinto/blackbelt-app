import { isMock } from '@/lib/env';
import type { NotificationChannel, NotificationTemplate, NotificationResult } from '@/lib/types/notification';
import { logServiceError } from '@/lib/api/errors';

export interface ChannelSender {
  readonly channel: NotificationChannel;
  send(userId: string, template: NotificationTemplate, data: Record<string, string>): Promise<NotificationResult>;
}

const TEMPLATE_MESSAGES: Record<NotificationTemplate, string> = {
  aula_em_breve: 'Sua aula de {modalidade} começa em 30min',
  fatura_vencendo: 'Sua fatura de R${valor} vence em {dias} dias',
  promocao_faixa: 'Parabéns! Você foi promovido para faixa {cor}!',
  mensagem_professor: '{professor} enviou uma mensagem',
  conquista_nova: 'Você desbloqueou: {conquista}!',
  boas_vindas: 'Bem-vindo ao {academia}! Sua jornada começa agora.',
  inatividade: 'Sentimos sua falta! Volte a treinar.',
  falta_detectada: 'Percebemos que você faltou na aula de {modalidade}. Está tudo bem?',
  aniversario: 'Feliz aniversário, {nome}! O time {academia} deseja muitas felicidades.',
  relatorio_mensal: 'Seu relatório mensal de {mes} está disponível.',
};

export function resolveTemplate(template: NotificationTemplate, data: Record<string, string>): string {
  let message = TEMPLATE_MESSAGES[template];
  for (const [key, value] of Object.entries(data)) {
    message = message.replace(`{${key}}`, value);
  }
  return message;
}

export async function sendNotification(
  userId: string,
  channels: NotificationChannel[],
  template: NotificationTemplate,
  data: Record<string, string>,
): Promise<NotificationResult[]> {
  try {
    if (isMock()) {
      const { mockSendNotification } = await import('@/lib/mocks/notification-hub.mock');
      return mockSendNotification(userId, channels, template, data);
    }

    const results: NotificationResult[] = [];
    for (const channel of channels) {
      if (channel === 'in_app') {
        try {
          const { createBrowserClient } = await import('@/lib/supabase/client');
          const supabase = createBrowserClient();
          const body = resolveTemplate(template, data);
          const { data: inserted, error } = await supabase
            .from('notifications')
            .insert({
              profile_id: userId,
              title: template,
              body,
              type: channel,
            })
            .select('id')
            .single();
          if (error) {
            logServiceError(error, 'notification-hub');
            results.push({
              id: '',
              channel: 'in_app',
              status: 'failed',
              error: error.message,
            });
          } else {
            results.push({
              id: inserted?.id ?? '',
              channel: 'in_app',
              status: 'sent',
              sentAt: new Date().toISOString(),
            });
          }
        } catch (err) {
          logServiceError(err, 'notification-hub');
          results.push({
            id: '',
            channel: 'in_app',
            status: 'failed',
            error: String(err),
          });
        }
      } else {
        try {
          const sender = await getChannelSender(channel);
          const result = await sender.send(userId, template, data);
          results.push(result);
        } catch (err) {
          logServiceError(err, 'notification-hub');
          results.push({
            id: '',
            channel,
            status: 'failed',
            error: String(err),
          });
        }
      }
    }
    return results;
  } catch (error) {
    logServiceError(error, 'notification-hub');
    return [];
  }
}

async function getChannelSender(channel: NotificationChannel): Promise<ChannelSender> {
  switch (channel) {
    case 'push': {
      const { PushChannel } = await import('@/lib/api/channels/push.channel');
      return new PushChannel();
    }
    case 'email': {
      const { EmailChannel } = await import('@/lib/api/channels/email.channel');
      return new EmailChannel();
    }
    case 'whatsapp': {
      const { WhatsAppChannel } = await import('@/lib/api/channels/whatsapp.channel');
      return new WhatsAppChannel();
    }
    case 'sms': {
      const { SmsChannel } = await import('@/lib/api/channels/sms.channel');
      return new SmsChannel();
    }
    case 'in_app': {
      const { InAppChannel } = await import('@/lib/api/channels/in-app.channel');
      return new InAppChannel();
    }
  }
}
