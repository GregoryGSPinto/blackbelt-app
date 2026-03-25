import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    // Verify webhook token if configured
    const webhookToken = process.env.ASAAS_WEBHOOK_TOKEN;
    if (webhookToken) {
      const token = request.headers.get('asaas-access-token');
      if (token !== webhookToken) {
        return NextResponse.json({ error: 'Invalid webhook token' }, { status: 401 });
      }
    }

    const body = await request.json();
    const { event, payment } = body;

    if (!event || !payment?.id) {
      return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
    }

    const admin = getAdminClient();

    // Update payment status in our database
    const { error: updateError } = await admin
      .from('pagamentos')
      .update({
        status: payment.status?.toLowerCase() ?? event.toLowerCase(),
        updated_at: new Date().toISOString(),
      })
      .eq('asaas_payment_id', payment.id);

    if (updateError) {
      console.error('[webhook] update pagamentos error:', updateError.message);
    }

    // If payment confirmed, activate/renew membership
    if (event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_RECEIVED') {
      const { data: pgto } = await admin
        .from('pagamentos')
        .select('academy_id, profile_id')
        .eq('asaas_payment_id', payment.id)
        .single();

      if (pgto?.academy_id && pgto?.profile_id) {
        // Calculate next payment date (30 days from now)
        const paidUntil = new Date();
        paidUntil.setDate(paidUntil.getDate() + 30);

        await admin
          .from('memberships')
          .update({
            status: 'active',
            paid_until: paidUntil.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('academy_id', pgto.academy_id)
          .eq('profile_id', pgto.profile_id);
      }
    }

    // If payment overdue, mark membership
    if (event === 'PAYMENT_OVERDUE') {
      const { data: pgto } = await admin
        .from('pagamentos')
        .select('academy_id, profile_id')
        .eq('asaas_payment_id', payment.id)
        .single();

      if (pgto?.academy_id && pgto?.profile_id) {
        await admin
          .from('memberships')
          .update({
            status: 'overdue',
            updated_at: new Date().toISOString(),
          })
          .eq('academy_id', pgto.academy_id)
          .eq('profile_id', pgto.profile_id);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[POST /api/payments/webhook]', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
