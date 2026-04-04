// BlackBelt v2 — Resend Email Client
// SERVER-ONLY: Only use in API routes and server actions.

import { Resend } from 'resend';

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? process.env.EMAIL_FROM ?? 'onboarding@resend.dev';

let resendClient: Resend | null = null;

function getClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail({ to, subject, html, replyTo }: SendEmailParams) {
  const client = getClient();
  if (!client) {
    console.warn('[resend] RESEND_API_KEY not set, skipping email to:', to);
    return null;
  }

  const { data, error } = await client.emails.send({
    from: `BlackBelt <${FROM_EMAIL}>`,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    replyTo,
  });

  if (error) {
    console.error('[resend] Failed to send email:', error.message);
    throw new Error(`Erro ao enviar email: ${error.message}`);
  }

  return data;
}
