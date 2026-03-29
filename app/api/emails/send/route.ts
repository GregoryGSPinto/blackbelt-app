// ============================================================
// BlackBelt v2 — API Route: Envio de Email (F5)
// POST /api/emails/send
// Recebe { type, data }, seleciona template, envia via Resend.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { sendEmail } from '@/lib/email/resend';
import { welcomeEmail } from '@/lib/email/templates/welcome';
import { inviteEmail } from '@/lib/email/templates/invite';
import { paymentReminderEmail } from '@/lib/email/templates/payment-reminder';
import { parentalConsentEmail } from '@/lib/email/templates/parental-consent-confirmation';
import { accountDeletedEmail } from '@/lib/email/templates/account-deleted';
import { rateLimit } from '@/lib/utils/rate-limit';

type EmailType = 'welcome' | 'invite' | 'payment-reminder' | 'parental-consent' | 'account-deleted';

interface EmailRequestBody {
  type: EmailType;
  data: Record<string, unknown>;
}

function getTemplate(type: EmailType, data: Record<string, unknown>): { subject: string; html: string } | null {
  switch (type) {
    case 'welcome':
      return welcomeEmail(data as unknown as Parameters<typeof welcomeEmail>[0]);
    case 'invite':
      return inviteEmail(data as unknown as Parameters<typeof inviteEmail>[0]);
    case 'payment-reminder':
      return paymentReminderEmail(data as unknown as Parameters<typeof paymentReminderEmail>[0]);
    case 'parental-consent':
      return parentalConsentEmail(data as unknown as Parameters<typeof parentalConsentEmail>[0]);
    case 'account-deleted':
      return accountDeletedEmail(data as unknown as Parameters<typeof accountDeletedEmail>[0]);
    default:
      return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get(name: string) { return request.cookies.get(name)?.value; }, set() {}, remove() {} } },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Rate limiting: 20 emails por minuto por IP
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
    const rateLimitResult = rateLimit(`email:${ip}`, { limit: 20, windowMs: 60_000 });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Aguarde um momento.' },
        { status: 429 }
      );
    }

    const body: EmailRequestBody = await request.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json(
        { error: 'Campos obrigatorios: type, data' },
        { status: 400 }
      );
    }

    const template = getTemplate(type, data);
    if (!template) {
      return NextResponse.json(
        { error: `Tipo de email invalido: ${type}` },
        { status: 400 }
      );
    }

    const to = (data.email || data.to) as string;
    if (!to) {
      return NextResponse.json(
        { error: 'Destinatario (email/to) e obrigatorio' },
        { status: 400 }
      );
    }

    const result = await sendEmail({
      to,
      subject: template.subject,
      html: template.html,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API /emails/send] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao enviar email' },
      { status: 500 }
    );
  }
}
