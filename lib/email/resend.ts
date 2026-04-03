// ============================================================
// BlackBelt v2 — Resend Email Service (F5)
// Wrapper para envio de emails transacionais via Resend SDK.
// Se RESEND_API_KEY nao estiver configurada, loga no console.
// ============================================================

import { Resend } from 'resend';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

interface SendEmailResult {
  success: boolean;
  id?: string;
  mock?: boolean;
  error?: unknown;
}

let resendInstance: Resend | null = null;

function getResendClient(): Resend {
  if (!resendInstance) {
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[EMAIL] RESEND_API_KEY nao configurada — email nao enviado');
    console.log(`[EMAIL] Para: ${options.to} | Assunto: ${options.subject}`);
    return { success: true, mock: true };
  }

  try {
    const resend = getResendClient();
    const fromAddress = options.from
      || `BlackBelt <${process.env.RESEND_DOMAIN ? `noreply@${process.env.RESEND_DOMAIN}` : 'gregoryguimaraes12@gmail.com'}>`;

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error('[EMAIL] Erro ao enviar:', error);
      return { success: false, error };
    }

    return { success: true, id: data?.id };
  } catch (error) {
    console.error('[EMAIL] Erro ao enviar:', error);
    return { success: false, error };
  }
}
