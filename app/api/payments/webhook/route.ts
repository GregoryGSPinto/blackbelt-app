import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { getAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    // Verify webhook token (required)
    const webhookToken = process.env.ASAAS_WEBHOOK_TOKEN;
    if (!webhookToken) {
      console.error('[webhook] ASAAS_WEBHOOK_TOKEN not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
    }
    const token = request.headers.get('asaas-access-token');
    if (token !== webhookToken) {
      return NextResponse.json({ error: 'Invalid webhook token' }, { status: 401 });
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

    // If payment confirmed, activate/renew membership + send email
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

      // Send payment confirmed email (fire-and-forget)
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://blackbeltv2.vercel.app';
      const internalToken = process.env.ASAAS_WEBHOOK_TOKEN ?? '';
      fetch(`${appUrl}/api/emails/payment-confirmed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-internal-token': internalToken },
        body: JSON.stringify({ asaasPaymentId: payment.id }),
      }).catch((err) => console.error('[webhook] email send failed:', err));
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
    Sentry.captureException(error);
    console.error('[POST /api/payments/webhook]', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
