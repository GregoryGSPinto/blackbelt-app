import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

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
      console.log(`[MOCK] WhatsApp → ${payload.phone}: ${rendered}`);
      return {
        messageId: `wa_${Date.now()}`,
        status: 'sent',
      };
    }

    const res = await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ academyId, ...payload }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
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
        console.log(`[MOCK] WhatsApp bulk → ${msg.phone}: ${rendered}`);
      }
      return { sent: messages.length, failed: 0, errors: [] };
    }

    const res = await fetch('/api/whatsapp/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ academyId, messages }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
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

    const res = await fetch(`/api/whatsapp/config?academyId=${academyId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    handleServiceError(error, 'whatsapp.getConfig');
  }
}

export async function updateWhatsAppConfig(
  config: WhatsAppConfig,
): Promise<void> {
  try {
    if (isMock()) {
      console.log('[MOCK] WhatsApp config updated:', config);
      return;
    }

    const res = await fetch('/api/whatsapp/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
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

    const res = await fetch(
      `/api/whatsapp/history?academyId=${academyId}&limit=${limit}`,
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    handleServiceError(error, 'whatsapp.getHistory');
  }
}
