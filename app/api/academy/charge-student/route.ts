import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const ASAAS_BASE_URL = process.env.ASAAS_SANDBOX === 'true'
  ? 'https://sandbox.asaas.com/api/v3'
  : 'https://api.asaas.com/api/v3';

export async function POST(req: NextRequest) {
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
      academyId, studentProfileId, guardianPersonId,
      description, amountCents, billingType, dueDate,
      studentName, studentCpf, studentEmail, referenceMonth,
    } = body;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Buscar API key da subconta da academia
    const { data: academy } = await supabase
      .from('academies')
      .select('asaas_subaccount_api_key, asaas_subaccount_status, name')
      .eq('id', academyId)
      .single();

    if (!academy?.asaas_subaccount_api_key) {
      return NextResponse.json({
        error: 'Academia nao configurou recebimento de pagamentos. Va em Configuracoes → Dados Bancarios.',
      }, { status: 400 });
    }

    if (academy.asaas_subaccount_status !== 'active') {
      return NextResponse.json({
        error: 'Conta de recebimento da academia esta pendente de aprovacao.',
      }, { status: 400 });
    }

    // Usar API key da subconta (nao a master)
    async function academyAsaasFetch(path: string, options: RequestInit = {}) {
      const res = await fetch(`${ASAAS_BASE_URL}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'access_token': academy!.asaas_subaccount_api_key!,
          ...options.headers,
        },
      });
      return res.json();
    }

    // 1. Criar ou buscar cliente na subconta
    const existingCustomers = await academyAsaasFetch(
      `/customers?cpfCnpj=${(studentCpf || '').replace(/\D/g, '')}`
    );

    let customerId: string;
    if (existingCustomers.data?.length > 0) {
      customerId = existingCustomers.data[0].id;
    } else {
      const newCustomer = await academyAsaasFetch('/customers', {
        method: 'POST',
        body: JSON.stringify({
          name: studentName,
          cpfCnpj: (studentCpf || '').replace(/\D/g, ''),
          email: studentEmail,
        }),
      });
      if (newCustomer.errors) {
        return NextResponse.json({ error: 'Erro ao criar cliente', details: newCustomer.errors }, { status: 400 });
      }
      customerId = newCustomer.id;
    }

    // 2. Criar cobranca
    const payment = await academyAsaasFetch('/payments', {
      method: 'POST',
      body: JSON.stringify({
        customer: customerId,
        billingType: billingType || 'PIX',
        value: amountCents / 100,
        dueDate,
        description: description || `Mensalidade ${academy.name}`,
        externalReference: `bb_${academyId}_${studentProfileId}_${referenceMonth || ''}`,
      }),
    });

    if (payment.errors) {
      return NextResponse.json({ error: 'Erro ao gerar cobranca', details: payment.errors }, { status: 400 });
    }

    // 3. Salvar no banco
    const { data: savedPayment } = await supabase.from('student_payments').insert({
      academy_id: academyId,
      student_profile_id: studentProfileId,
      guardian_person_id: guardianPersonId,
      description: description || `Mensalidade ${academy.name}`,
      amount_cents: amountCents,
      billing_type: billingType || 'PIX',
      due_date: dueDate,
      status: 'PENDING',
      asaas_payment_id: payment.id,
      asaas_customer_id: customerId,
      invoice_url: payment.invoiceUrl,
      pix_qr_code: payment.pixQrCode?.payload || null,
      reference_month: referenceMonth,
    }).select('id').single();

    return NextResponse.json({
      success: true,
      paymentId: savedPayment?.id,
      asaasPaymentId: payment.id,
      invoiceUrl: payment.invoiceUrl,
      pixQrCode: payment.pixQrCode?.payload || null,
      bankSlipUrl: payment.bankSlipUrl || null,
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro interno';
    console.error('[charge-student] Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
