import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createSubscription } from '@/lib/integrations/asaas';
import type { AsaasBillingType, AsaasCycle } from '@/lib/integrations/asaas';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { asaasCustomerId, value, cycle, billingType, nextDueDate, description, academyId } = body;

    if (!asaasCustomerId || !value || !cycle || !billingType || !nextDueDate) {
      return NextResponse.json(
        { error: 'asaasCustomerId, value, cycle, billingType e nextDueDate são obrigatórios' },
        { status: 400 },
      );
    }

    const subscription = await createSubscription({
      customer: asaasCustomerId,
      value,
      cycle: cycle as AsaasCycle,
      billingType: billingType as AsaasBillingType,
      nextDueDate,
      description,
      externalReference: academyId,
    });

    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    Sentry.captureException(error);
    console.error('[POST /api/payments/create-subscription]', error);
    const message = error instanceof Error ? error.message : 'Erro ao criar assinatura';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
