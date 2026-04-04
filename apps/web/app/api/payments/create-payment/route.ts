import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createPayment } from '@/lib/integrations/asaas';
import type { AsaasBillingType } from '@/lib/integrations/asaas';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { asaasCustomerId, value, dueDate, billingType, description, academyId, profileId } = body;

    if (!asaasCustomerId || !value || !dueDate || !billingType) {
      return NextResponse.json(
        { error: 'asaasCustomerId, value, dueDate e billingType são obrigatórios' },
        { status: 400 },
      );
    }

    // Create payment in Asaas
    const payment = await createPayment({
      customer: asaasCustomerId,
      value,
      dueDate,
      billingType: billingType as AsaasBillingType,
      description,
      externalReference: `${academyId}:${profileId ?? ''}`,
    });

    // Save payment record in Supabase
    const { data: record, error: dbError } = await supabase
      .from('pagamentos')
      .insert({
        academy_id: academyId,
        profile_id: profileId ?? null,
        asaas_payment_id: payment.id,
        asaas_customer_id: asaasCustomerId,
        amount: value,
        due_date: dueDate,
        billing_type: billingType,
        status: payment.status.toLowerCase(),
        invoice_url: payment.invoiceUrl ?? null,
        pix_qr_code: payment.pixTransaction?.pixCopiaECola ?? null,
        description: description ?? null,
      })
      .select()
      .single();

    if (dbError) {
      console.error('[create-payment] DB error:', dbError.message);
      // Payment was created in Asaas but DB failed — return Asaas data anyway
    }

    return NextResponse.json({ payment, record: record ?? null }, { status: 201 });
  } catch (error) {
    Sentry.captureException(error);
    console.error('[POST /api/payments/create-payment]', error);
    const message = error instanceof Error ? error.message : 'Erro ao criar cobrança';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
