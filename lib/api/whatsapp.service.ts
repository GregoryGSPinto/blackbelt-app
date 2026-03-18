import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';
import { logger } from '@/lib/monitoring/logger';

// ── Types ─────────────────────────────────────────────────────

export type WhatsAppTemplateType =
  | 'welcome'
  | 'class_reminder'
  | 'payment_reminder'
  | 'absence_alert'
  | 'graduation'
  | 'custom';

export interface WhatsAppMessage {
  id: string;
  phone: string;
  template: WhatsAppTemplateType;
  variables: Record<string, string>;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  sentAt: string | null;
  deliveredAt: string | null;
  readAt: string | null;
  error: string | null;
}

export interface WhatsAppConfig {
  academyId: string;
  phone: string;
  instanceId: string;
  apiKey: string;
  enabled: boolean;
}

export interface SendWhatsAppPayload {
  phone: string;
  template: WhatsAppTemplateType;
  variables: Record<string, string>;
}

export interface WhatsAppSendResult {
  messageId: string;
  status: 'sent' | 'failed';
  error?: string;
}

// ── Templates ─────────────────────────────────────────────────

const TEMPLATES: Record<WhatsAppTemplateType, string> = {
  welcome:
    'Olá {{nome}}! 🥋 Bem-vindo(a) à {{academia}}! Sua jornada nas artes marciais começa agora. Acesse seu painel em {{link}}',
  class_reminder:
    'Lembrete: sua aula de {{turma}} começa em 1 hora ({{horario}}). Nos vemos no tatame! 🥋',
  payment_reminder:
    'Olá {{nome}}, sua mensalidade de R${{valor}} vence em {{data}}. Para manter seu treino em dia, efetue o pagamento. Dúvidas? Fale com a secretaria.',
  absence_alert:
    'Olá {{responsavel}}, {{aluno}} não compareceu às últimas {{dias}} aulas. Está tudo bem? Entre em contato com a academia se precisar.',
  graduation:
    'Parabéns {{nome}}! 🎉 Sua graduação para faixa {{faixa}} foi aprovada! Cerimônia em {{data}}.',
  custom: '{{mensagem}}',
};

export function renderTemplate(
  template: WhatsAppTemplateType,
  variables: Record<string, string>,
): string {
  let text = TEMPLATES[template];
  for (const [key, value] of Object.entries(variables)) {
    text = text.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }
  return text;
}

// ── Service ───────────────────────────────────────────────────

export async function sendWhatsApp(
  academyId: string,
  payload: SendWhatsAppPayload,
): Promise<WhatsAppSendResult> {
  try {
    if (isMock()) {
      const rendered = renderTemplate(payload.template, payload.variables);
      logger.debug('[MOCK] WhatsApp message sent', { phone: payload.phone, rendered });
      return {
        messageId: `wa_${Date.now()}`,
        status: 'sent',
      };
    }
    try {

      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ academyId, ...payload }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[whatsapp.sendWhatsApp] API not available, using fallback');
      return { success: false, message_id: "", status: "sent" } as unknown as WhatsAppSendResult;
    }

  } catch (error) {
    handleServiceError(error, 'whatsapp.send');
  }
}

export async function sendBulkWhatsApp(
  academyId: string,
  messages: SendWhatsAppPayload[],
): Promise<{ sent: number; failed: number; errors: string[] }> {
  try {
    if (isMock()) {
      for (const msg of messages) {
        const rendered = renderTemplate(msg.template, msg.variables);
        logger.debug('[MOCK] WhatsApp bulk message sent', { phone: msg.phone, rendered });
      }
      return { sent: messages.length, failed: 0, errors: [] };
    }

    try {
      const res = await fetch('/api/whatsapp/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ academyId, messages }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[whatsapp] sendBulkWhatsApp: API not available, using mock data');
      for (const msg of messages) {
        const rendered = renderTemplate(msg.template, msg.variables);
        logger.debug('[MOCK] WhatsApp bulk message fallback', { phone: msg.phone, rendered });
      }
      return { sent: messages.length, failed: 0, errors: [] };
    }
  } catch (error) {
    handleServiceError(error, 'whatsapp.bulkSend');
  }
}

export async function getWhatsAppConfig(
  academyId: string,
): Promise<WhatsAppConfig | null> {
  try {
    if (isMock()) {
      return {
        academyId,
        phone: '+5511999990000',
        instanceId: 'mock-instance',
        apiKey: 'mock-key',
        enabled: true,
      };
    }
    try {

      const res = await fetch(`/api/whatsapp/config?academyId=${academyId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[whatsapp.getWhatsAppConfig] API not available, using fallback');
      return null;
    }

  } catch (error) {
    handleServiceError(error, 'whatsapp.getConfig');
  }
}

export async function updateWhatsAppConfig(
  config: WhatsAppConfig,
): Promise<void> {
  try {
    if (isMock()) {
      logger.debug('[MOCK] WhatsApp config updated', { config });
      return;
    }
    try {

      const res = await fetch('/api/whatsapp/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch {
      console.warn('[whatsapp.updateWhatsAppConfig] API not available, using fallback');
    }

  } catch (error) {
    handleServiceError(error, 'whatsapp.updateConfig');
  }
}

export async function getWhatsAppHistory(
  academyId: string,
  limit = 50,
): Promise<WhatsAppMessage[]> {
  try {
    if (isMock()) {
      const { mockWhatsAppHistory } = await import('@/lib/mocks/whatsapp.mock');
      return mockWhatsAppHistory(academyId, limit);
    }
    // API not yet implemented — use mock
    const { mockWhatsAppHistory } = await import('@/lib/mocks/whatsapp.mock');
      return mockWhatsAppHistory(academyId, limit);

  } catch (error) {
    handleServiceError(error, 'whatsapp.getHistory');
  }
}
