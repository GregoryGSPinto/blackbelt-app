import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
import { logger } from '@/lib/monitoring/logger';

// ── Types ─────────────────────────────────────────────────────

export type EmailTemplate =
  | 'welcome'
  | 'payment-reminder'
  | 'payment-overdue'
  | 'belt-promotion'
  | 'weekly-summary'
  | 'plan-alert'
  | 'invoice'
  | 'class-reminder'
  | 'achievement'
  | 'monthly-report';

export interface SendEmailRequest {
  to: string;
  template: EmailTemplate;
  data: Record<string, unknown>;
}

export interface SendEmailResponse {
  success: boolean;
  messageId: string;
}

// ── Template resolver ────────────────────────────────────────

async function renderTemplate(template: EmailTemplate, data: Record<string, unknown>): Promise<string> {
  switch (template) {
    case 'welcome': {
      const { welcomeEmail } = await import('@/lib/email-templates/welcome');
      return welcomeEmail(data as Parameters<typeof welcomeEmail>[0]);
    }
    case 'payment-reminder': {
      const { paymentReminderEmail } = await import('@/lib/email-templates/payment-reminder');
      return paymentReminderEmail(data as unknown as Parameters<typeof paymentReminderEmail>[0]);
    }
    case 'payment-overdue': {
      const { paymentOverdueEmail } = await import('@/lib/email-templates/payment-overdue');
      return paymentOverdueEmail(data as unknown as Parameters<typeof paymentOverdueEmail>[0]);
    }
    case 'belt-promotion': {
      const { beltPromotionEmail } = await import('@/lib/email-templates/belt-promotion');
      return beltPromotionEmail(data as unknown as Parameters<typeof beltPromotionEmail>[0]);
    }
    case 'weekly-summary': {
      const { weeklySummaryEmail } = await import('@/lib/email-templates/weekly-summary');
      return weeklySummaryEmail(data as unknown as Parameters<typeof weeklySummaryEmail>[0]);
    }
    case 'plan-alert': {
      const { planAlertEmail } = await import('@/lib/email-templates/plan-alert');
      return planAlertEmail(data as unknown as Parameters<typeof planAlertEmail>[0]);
    }
    case 'invoice': {
      const { invoiceEmail } = await import('@/lib/email-templates/invoice');
      return invoiceEmail(data as Parameters<typeof invoiceEmail>[0]);
    }
    case 'class-reminder': {
      const { classReminderEmail } = await import('@/lib/email-templates/class-reminder');
      return classReminderEmail(data as Parameters<typeof classReminderEmail>[0]);
    }
    case 'achievement': {
      const { achievementEmail } = await import('@/lib/email-templates/achievement');
      return achievementEmail(data as Parameters<typeof achievementEmail>[0]);
    }
    case 'monthly-report': {
      const { monthlyReportEmail } = await import('@/lib/email-templates/monthly-report');
      return monthlyReportEmail(data as Parameters<typeof monthlyReportEmail>[0]);
    }
    default: {
      const _exhaustive: never = template;
      throw new ServiceError(400, 'email.send', `Unknown template: ${_exhaustive}`);
    }
  }
}

// ── Send ─────────────────────────────────────────────────────

export async function sendEmail(
  to: string,
  template: EmailTemplate,
  data: Record<string, unknown>,
): Promise<SendEmailResponse> {
  try {
    const html = await renderTemplate(template, data);

    if (isMock()) {
      const previewLength = 120;
      const plainPreview = html.replace(/<[^>]*>/g, '').slice(0, previewLength);
      logger.debug(`[EMAIL] Para: ${to}, Template: ${template}, Preview: ${plainPreview}...`);
      return {
        success: true,
        messageId: `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      };
    }

    const res = await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, template, html }),
    });

    if (!res.ok) {
      throw new ServiceError(res.status, 'email.send');
    }

    const result: SendEmailResponse = await res.json();
    return result;
  } catch (error) {
    handleServiceError(error, 'email.send');
  }
}

export async function sendBulkEmail(
  recipients: string[],
  template: EmailTemplate,
  data: Record<string, unknown>,
): Promise<SendEmailResponse[]> {
  try {
    const results = await Promise.all(
      recipients.map((to) => sendEmail(to, template, data)),
    );
    return results;
  } catch (error) {
    handleServiceError(error, 'email.sendBulk');
  }
}
