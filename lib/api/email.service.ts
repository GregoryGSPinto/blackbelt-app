import { isMock } from '@/lib/env';

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  academyId?: string;
  userId?: string;
  templateName?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

const EMAIL_API_KEY = process.env.EMAIL_API_KEY ?? '';
const EMAIL_FROM = process.env.EMAIL_FROM ?? 'noreply@blackbelt.app';

export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  try {
    // ── Mock mode ──
    if (isMock()) {
      console.info('[email.service] Mock mode — email logged to console', {
        to: params.to,
        subject: params.subject,
        template: params.templateName,
      });
      return { success: true, messageId: `mock_${Date.now()}` };
    }

    // ── Graceful fallback when API key not set ──
    if (!EMAIL_API_KEY) {
      console.error('[email.service] EMAIL_API_KEY not set — skipping send, logging attempt');
      await logToNotificationLogs(params, { success: false, error: 'API key not configured' });
      return { success: false, error: 'Email API key not configured' };
    }

    // ── Send via Resend ──
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${EMAIL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: params.to,
        subject: params.subject,
        html: params.html,
      }),
    });

    const body = (await res.json()) as { id?: string; message?: string };
    const result: SendEmailResult = res.ok
      ? { success: true, messageId: body.id }
      : { success: false, error: body.message ?? `HTTP ${res.status}` };

    // ── Log to notification_logs ──
    await logToNotificationLogs(params, result);

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[email.service] Unexpected error:', message);

    // Attempt to log even on failure
    try {
      await logToNotificationLogs(params, { success: false, error: message });
    } catch {
      // Logging itself failed — nothing more we can do
    }

    return { success: false, error: message };
  }
}

// ── Private: persist to notification_logs via Supabase ──
async function logToNotificationLogs(
  params: SendEmailParams,
  result: SendEmailResult,
): Promise<void> {
  try {
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    await supabase.from('notification_logs').insert({
      channel: 'email',
      recipient: params.to,
      subject: params.subject,
      template_name: params.templateName ?? null,
      academy_id: params.academyId ?? null,
      user_id: params.userId ?? null,
      status: result.success ? 'sent' : 'failed',
      provider_message_id: result.messageId ?? null,
      error_message: result.error ?? null,
      sent_at: new Date().toISOString(),
    });
  } catch (logError) {
    console.error('[email.service] Failed to log to notification_logs:', logError);
  }
}
