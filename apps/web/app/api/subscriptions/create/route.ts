import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
const ASAAS_BASE_URL = process.env.ASAAS_SANDBOX === 'true'
  ? 'https://sandbox.asaas.com/api/v3'
  : 'https://api.asaas.com/api/v3';

async function asaasFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${ASAAS_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'access_token': ASAAS_API_KEY!,
      ...options.headers,
    },
  });
  return res.json();
}

export async function POST(req: NextRequest) {
  if (!ASAAS_API_KEY) {
    return NextResponse.json({ error: 'Asaas nao configurado' }, { status: 500 });
  }

  try {
    // Auth check
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get(name: string) { return req.cookies.get(name)?.value; }, set() {}, remove() {} } },
    );
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const {
      academyId, planId, planName, priceCents,
      billingType, name, cpfCnpj, email, phone, address,
    } = body;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // 1. Create customer in Asaas
    const customer = await asaasFetch('/customers', {
      method: 'POST',
      body: JSON.stringify({
        name,
        cpfCnpj: cpfCnpj.replace(/\D/g, ''),
        email,
        phone: phone.replace(/\D/g, ''),
        ...(address ? {
          address: address.street,
          addressNumber: address.number,
          complement: address.complement,
          province: address.neighborhood,
          postalCode: address.cep?.replace(/\D/g, ''),
          city: address.city,
          state: address.state,
        } : {}),
      }),
    });

    if (customer.errors) {
      return NextResponse.json({ error: 'Erro ao criar cliente no Asaas', details: customer.errors }, { status: 400 });
    }

    // 2. Calculate first billing date (7 days from now)
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + 7);
    const dueDateStr = nextDueDate.toISOString().split('T')[0];

    // 3. Create subscription in Asaas
    const subscription = await asaasFetch('/subscriptions', {
      method: 'POST',
      body: JSON.stringify({
        customer: customer.id,
        billingType: billingType === 'credit_card' ? 'CREDIT_CARD' : billingType === 'boleto' ? 'BOLETO' : 'PIX',
        value: priceCents / 100,
        cycle: 'MONTHLY',
        description: `BlackBelt v2 — Plano ${planName}`,
        nextDueDate: dueDateStr,
        ...(billingType === 'pix' ? {
          discount: { value: 5, type: 'PERCENTAGE', dueDateLimitDays: 0 },
        } : {}),
      }),
    });

    if (subscription.errors) {
      return NextResponse.json({ error: 'Erro ao criar assinatura', details: subscription.errors }, { status: 400 });
    }

    // 4. Update academy
    await supabase.from('academies').update({
      plan_id: planId,
      subscription_status: 'trial',
      trial_starts_at: new Date().toISOString(),
      trial_ends_at: nextDueDate.toISOString(),
      trial_converted: false,
      asaas_customer_id: customer.id,
      asaas_subscription_id: subscription.id,
      billing_type: billingType,
      billing_name: name,
      billing_cpf_cnpj: cpfCnpj,
      billing_email: email,
      billing_phone: phone,
      ...(address ? {
        billing_address_cep: address.cep,
        billing_address_street: address.street,
        billing_address_number: address.number,
        billing_address_complement: address.complement,
        billing_address_neighborhood: address.neighborhood,
        billing_address_city: address.city,
        billing_address_state: address.state,
      } : {}),
    }).eq('id', academyId);

    // 5. Create subscription record
    await supabase.from('academy_subscriptions').upsert({
      academy_id: academyId,
      plan_id: planId,
      plan_name: planName,
      price_cents: priceCents,
      billing_type: billingType,
      asaas_subscription_id: subscription.id,
      asaas_customer_id: customer.id,
      status: 'pending',
      next_due_date: dueDateStr,
      current_period_start: new Date().toISOString(),
      current_period_end: nextDueDate.toISOString(),
    }, { onConflict: 'academy_id' });

    // 6. Audit log
    await supabase.from('audit_log').insert({
      academy_id: academyId,
      action: 'subscription_created',
      entity_type: 'subscription',
      entity_id: subscription.id,
      new_data: { planId, planName, billingType, customerId: customer.id },
    });

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      customerId: customer.id,
      nextDueDate: dueDateStr,
      trialEndsAt: nextDueDate.toISOString(),
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
