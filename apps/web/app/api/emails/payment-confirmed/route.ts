import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/integrations/resend';
import { paymentConfirmedEmail } from '@/lib/emails/templates';

// Called internally by the webhook — uses admin client, no user auth required.
// Protected by being called only from server-side code.
export async function POST(request: NextRequest) {
  try {
    // Verify internal call via secret header
    const internalToken = request.headers.get('x-internal-token');
    const expected = process.env.ASAAS_WEBHOOK_TOKEN ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!expected || internalToken !== expected) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { asaasPaymentId } = body;

    if (!asaasPaymentId) {
      return NextResponse.json({ error: 'asaasPaymentId é obrigatório' }, { status: 400 });
    }

    const admin = getAdminClient();

    // Fetch payment + related profile
    const { data: pgto } = await admin
      .from('pagamentos')
      .select('value, description, academy_id, profile_id, invoice_url, created_at')
      .eq('asaas_payment_id', asaasPaymentId)
      .single();

    if (!pgto?.profile_id) {
      return NextResponse.json({ error: 'Pagamento não encontrado' }, { status: 404 });
    }

    // Fetch profile email
    const { data: profile } = await admin
      .from('profiles')
      .select('display_name, email, user_id')
      .eq('id', pgto.profile_id)
      .single();

    // Try getting email from profile or auth.users
    let email = profile?.email;
    if (!email && profile?.user_id) {
      const { data: { user } } = await admin.auth.admin.getUserById(profile.user_id);
      email = user?.email;
    }

    if (!email) {
      return NextResponse.json({ error: 'Email do cliente não encontrado' }, { status: 404 });
    }

    const template = paymentConfirmedEmail({
      customerName: profile?.display_name ?? 'Cliente',
      value: pgto.value ?? 0,
      description: pgto.description ?? 'Mensalidade BlackBelt',
      paymentDate: new Date(pgto.created_at ?? Date.now()).toLocaleDateString('pt-BR'),
      invoiceUrl: pgto.invoice_url ?? undefined,
    });

    const result = await sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
    });

    return NextResponse.json({ sent: true, id: result?.id ?? null });
  } catch (error) {
    console.error('[POST /api/emails/payment-confirmed]', error);
    const message = error instanceof Error ? error.message : 'Erro ao enviar email';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
