import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/integrations/resend';
import { inviteEmail } from '@/lib/emails/templates';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { email, inviteeName, academyName, role, inviterName, token } = body;

    if (!email || !academyName || !role) {
      return NextResponse.json({ error: 'email, academyName e role são obrigatórios' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://blackbeltv2.vercel.app';
    const acceptUrl = token
      ? `${appUrl}/convite/${token}`
      : `${appUrl}/cadastrar-aluno`;

    const template = inviteEmail({
      inviteeName: inviteeName ?? '',
      academyName,
      role,
      inviterName: inviterName ?? 'A administração',
      acceptUrl,
    });

    const result = await sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
    });

    return NextResponse.json({ sent: true, id: result?.id ?? null });
  } catch (error) {
    console.error('[POST /api/emails/invite]', error);
    const message = error instanceof Error ? error.message : 'Erro ao enviar email';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
