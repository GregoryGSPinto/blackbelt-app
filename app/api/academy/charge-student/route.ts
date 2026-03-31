import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const ASAAS_BASE_URL = process.env.ASAAS_SANDBOX === 'true'
  ? 'https://sandbox.asaas.com/api/v3'
  : 'https://api.asaas.com/api/v3';

const EMPTY_UUID = '00000000-0000-0000-0000-000000000000';

export async function POST(req: NextRequest) {
  try {
    const supabaseAuth = await createServerSupabaseClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const {
      academyId, studentProfileId, guardianPersonId,
      description, amountCents, billingType, dueDate,
      studentName, studentCpf, studentEmail, referenceMonth,
    } = body as Record<string, string | number | null | undefined>;

    if (!academyId || !studentProfileId || !amountCents || !dueDate || !studentName) {
      return NextResponse.json({ error: 'Dados obrigatorios da cobranca nao informados.' }, { status: 400 });
    }

    if (!Number.isFinite(Number(amountCents)) || Number(amountCents) <= 0) {
      return NextResponse.json({ error: 'Valor da cobranca invalido.' }, { status: 400 });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dueDate))) {
      return NextResponse.json({ error: 'Data de vencimento invalida.' }, { status: 400 });
    }

    const supabase = getAdminClient();
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', user.id);

    const profileIds = (profiles ?? []).map((profile) => profile.id);
    const isSuperadmin = (profiles ?? []).some((profile) => profile.role === 'superadmin');

    const { data: operatorMembership } = await supabase
      .from('memberships')
      .select('academy_id, role, profile_id')
      .eq('academy_id', academyId)
      .eq('status', 'active')
      .in('profile_id', profileIds.length > 0 ? profileIds : [EMPTY_UUID])
      .in('role', ['admin', 'recepcao'])
      .maybeSingle();

    if (!operatorMembership && !isSuperadmin) {
      return NextResponse.json({ error: 'Sem permissao para cobrar alunos desta academia.' }, { status: 403 });
    }

    const { data: studentMembership } = await supabase
      .from('memberships')
      .select('id')
      .eq('academy_id', academyId)
      .eq('profile_id', studentProfileId)
      .eq('status', 'active')
      .in('role', ['aluno_adulto', 'aluno_teen', 'aluno_kids'])
      .maybeSingle();

    if (!studentMembership) {
      return NextResponse.json({ error: 'Aluno nao encontrado na academia informada.' }, { status: 404 });
    }

    const { data: academy } = await supabase
      .from('academies')
      .select('asaas_subaccount_api_key, asaas_subaccount_status, name')
      .eq('id', academyId)
      .single();

    if (!academy) {
      return NextResponse.json({ error: 'Academia nao encontrada.' }, { status: 404 });
    }

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

    const academyAsaasApiKey = academy.asaas_subaccount_api_key;

    async function academyAsaasFetch(path: string, options: RequestInit = {}) {
      const res = await fetch(`${ASAAS_BASE_URL}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'access_token': academyAsaasApiKey,
          ...options.headers,
        },
      });
      return res.json();
    }

    const existingCustomers = await academyAsaasFetch(
      `/customers?cpfCnpj=${String(studentCpf ?? '').replace(/\D/g, '')}`
    );

    let customerId: string;
    if (existingCustomers.data?.length > 0) {
      customerId = existingCustomers.data[0].id;
    } else {
      const newCustomer = await academyAsaasFetch('/customers', {
        method: 'POST',
        body: JSON.stringify({
          name: studentName,
          cpfCnpj: String(studentCpf ?? '').replace(/\D/g, ''),
          email: studentEmail,
        }),
      });
      if (newCustomer.errors) {
        return NextResponse.json({ error: 'Erro ao criar cliente', details: newCustomer.errors }, { status: 400 });
      }
      customerId = newCustomer.id;
    }

    const payment = await academyAsaasFetch('/payments', {
      method: 'POST',
      body: JSON.stringify({
        customer: customerId,
        billingType: billingType || 'PIX',
        value: Number(amountCents) / 100,
        dueDate,
        description: description || `Mensalidade ${academy.name}`,
        externalReference: `bb_${academyId}_${studentProfileId}_${referenceMonth || ''}`,
      }),
    });

    if (payment.errors) {
      return NextResponse.json({ error: 'Erro ao gerar cobranca', details: payment.errors }, { status: 400 });
    }

    const { data: savedPayment } = await supabase.from('student_payments').insert({
      academy_id: academyId,
      student_profile_id: studentProfileId,
      guardian_person_id: guardianPersonId,
      membership_id: studentMembership.id,
      description: description || `Mensalidade ${academy.name}`,
      amount_cents: Number(amountCents),
      billing_type: billingType || 'PIX',
      due_date: dueDate,
      status: 'PENDING',
      asaas_payment_id: payment.id,
      asaas_customer_id: customerId,
      invoice_url: payment.invoiceUrl,
      payment_method: typeof billingType === 'string' ? billingType.toLowerCase() : null,
      pix_payload: payment.pixQrCode?.payload || null,
      pix_qr_code: payment.pixQrCode?.payload || null,
      reference_month: referenceMonth,
      source: referenceMonth ? 'recurring_charge' : 'manual_charge',
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
