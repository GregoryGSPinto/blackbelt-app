import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { mapAsaasStatus } from '@/lib/payment/asaas';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const event = body.event;
    const payment = body.payment;

    if (!event || !payment) {
      return NextResponse.json({ error: 'Webhook invalido' }, { status: 400 });
    }

    // Validar access token (Asaas envia como query param)
    const url = new URL(request.url);
    const token = url.searchParams.get('access_token');
    if (token !== process.env.ASAAS_WEBHOOK_TOKEN) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }

    // Log do webhook (auditoria)
    await supabase.from('webhook_log').insert({
      source: 'asaas',
      event_type: event,
      payload: body,
      external_id: payment.id,
      processed: false,
    });

    // Processar por tipo de evento
    const newStatus = mapAsaasStatus(payment.status);
    const externalRef = payment.externalReference;

    if (externalRef) {
      // Atualizar invoice/fatura no banco
      const { error } = await supabase
        .from('invoices')
        .update({
          status: newStatus,
          paid_at: payment.confirmedDate || null,
          payment_method: payment.billingType?.toLowerCase(),
          external_payment_id: payment.id,
          net_value: payment.netValue,
          updated_at: new Date().toISOString(),
        })
        .eq('id', externalRef);

      if (error) {
        console.error('Erro ao atualizar invoice:', error);
      }

      // Atualizar family_invoice se existe
      await supabase
        .from('family_invoices')
        .update({
          status: newStatus,
          paid_at: payment.confirmedDate || null,
          payment_method: payment.billingType?.toLowerCase(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', externalRef);

      if (event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_RECEIVED') {
        console.log(`[asaas-webhook] Payment confirmed for ref=${externalRef}`);
      }

      if (event === 'PAYMENT_OVERDUE') {
        console.log(`[asaas-webhook] Payment overdue for ref=${externalRef}`);
      }
    }

    // --- Subscription payment events ---
    if (payment.subscription) {
      const { data: sub } = await supabase
        .from('academy_subscriptions')
        .select('academy_id')
        .eq('asaas_subscription_id', payment.subscription)
        .single();

      if (sub) {
        if (event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_RECEIVED') {
          await supabase.from('academy_subscriptions').update({
            status: 'active',
            updated_at: new Date().toISOString(),
          }).eq('asaas_subscription_id', payment.subscription);

          await supabase.from('academies').update({
            subscription_status: 'active',
            trial_converted: true,
          }).eq('id', sub.academy_id);
        }

        if (event === 'PAYMENT_OVERDUE') {
          await supabase.from('academy_subscriptions').update({
            status: 'past_due',
            updated_at: new Date().toISOString(),
          }).eq('asaas_subscription_id', payment.subscription);

          await supabase.from('academies').update({
            subscription_status: 'past_due',
          }).eq('id', sub.academy_id);
        }
      }
    }

    // --- Student payment events (externalReference starts with "bb_") ---
    if (externalRef?.startsWith('bb_')) {
      const { data: studentPayment } = await supabase
        .from('student_payments')
        .select('id, academy_id, student_profile_id')
        .eq('asaas_payment_id', payment.id)
        .single();

      if (studentPayment) {
        const spStatus = (event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_RECEIVED')
          ? 'CONFIRMED'
          : event === 'PAYMENT_OVERDUE'
          ? 'OVERDUE'
          : event === 'PAYMENT_REFUNDED'
          ? 'REFUNDED'
          : null;

        if (spStatus) {
          await supabase.from('student_payments').update({
            status: spStatus,
            ...(spStatus === 'CONFIRMED' ? { paid_at: new Date().toISOString() } : {}),
            updated_at: new Date().toISOString(),
          }).eq('id', studentPayment.id);

          // Criar timeline event pro aluno (se pagamento confirmado)
          if (spStatus === 'CONFIRMED') {
            await supabase.from('student_timeline_events').insert({
              profile_id: studentPayment.student_profile_id,
              academy_id: studentPayment.academy_id,
              event_type: 'pagamento',
              title: 'Pagamento confirmado',
              description: `Pagamento de R$${(payment.value || 0).toFixed(2)} confirmado`,
              event_date: new Date().toISOString(),
            });
          }
        }
      }
    }

    // Audit log
    await supabase.from('audit_log').insert({
      action: 'payment',
      entity_type: 'webhook',
      entity_id: payment.id,
      new_data: { event, status: newStatus, externalRef: externalRef },
    });

    // Marcar webhook como processado
    await supabase
      .from('webhook_log')
      .update({ processed: true })
      .eq('external_id', payment.id)
      .eq('event_type', event);

    // SEMPRE retornar 200 (mesmo se erro interno) para evitar retry infinito do Asaas
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ received: true }); // 200 mesmo com erro
  }
}
