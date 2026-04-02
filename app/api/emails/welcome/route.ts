import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/integrations/resend';
import { welcomeEmail } from '@/lib/emails/templates';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { ownerName, academyName, email } = body;

    if (!ownerName || !academyName || !email) {
      return NextResponse.json({ error: 'ownerName, academyName e email são obrigatórios' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.blackbelt.com';
    const template = welcomeEmail({
      ownerName,
      academyName,
      loginUrl: `${appUrl}/login`,
    });

    const result = await sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
    });

    return NextResponse.json({ sent: true, id: result?.id ?? null });
  } catch (error) {
    console.error('[POST /api/emails/welcome]', error);
    const message = error instanceof Error ? error.message : 'Erro ao enviar email';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
