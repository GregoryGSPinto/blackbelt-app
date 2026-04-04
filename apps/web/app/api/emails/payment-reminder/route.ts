import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/integrations/resend';
import { paymentReminderEmail } from '@/lib/emails/templates';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { email, customerName, value, dueDate, paymentUrl } = body;

    if (!email || !customerName || !value || !dueDate) {
      return NextResponse.json({ error: 'email, customerName, value e dueDate são obrigatórios' }, { status: 400 });
    }

    const template = paymentReminderEmail({
      customerName,
      value,
      dueDate,
      paymentUrl,
    });

    const result = await sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
    });

    return NextResponse.json({ sent: true, id: result?.id ?? null });
  } catch (error) {
    console.error('[POST /api/emails/payment-reminder]', error);
    const message = error instanceof Error ? error.message : 'Erro ao enviar email';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
