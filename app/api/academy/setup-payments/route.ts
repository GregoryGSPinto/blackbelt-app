import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
const ASAAS_BASE_URL = process.env.ASAAS_SANDBOX === 'true'
  ? 'https://sandbox.asaas.com/api/v3'
  : 'https://api.asaas.com/api/v3';

const EMPTY_UUID = '00000000-0000-0000-0000-000000000000';

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
    const supabaseAuth = await createServerSupabaseClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const {
      academyId, name, cpfCnpj, email, phone, birthDate,
      companyType, bankCode, bankAgency, bankAccount,
      bankAccountDigit, bankAccountType,
    } = body as Record<string, string | undefined>;

    if (!academyId || !name || !cpfCnpj || !email || !bankCode || !bankAgency || !bankAccount) {
      return NextResponse.json({ error: 'Dados bancarios obrigatorios nao informados.' }, { status: 400 });
    }

    const supabase = getAdminClient();
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', user.id);

    const profileIds = (profiles ?? []).map((profile) => profile.id);
    const isSuperadmin = (profiles ?? []).some((profile) => profile.role === 'superadmin');

    const { data: membership } = await supabase
      .from('memberships')
      .select('academy_id, role, profile_id')
      .eq('academy_id', academyId)
      .eq('status', 'active')
      .in('profile_id', profileIds.length > 0 ? profileIds : [EMPTY_UUID])
      .in('role', ['admin'])
      .maybeSingle();

    if (!membership && !isSuperadmin) {
      return NextResponse.json({ error: 'Sem permissao para configurar recebimento desta academia.' }, { status: 403 });
    }

    const { data: academy } = await supabase
      .from('academies')
      .select('asaas_subaccount_id')
      .eq('id', academyId)
      .single();

    if (academy?.asaas_subaccount_id) {
      return NextResponse.json({ error: 'Academia ja tem subconta configurada' }, { status: 400 });
    }

    const normalizedCpfCnpj = cpfCnpj.replace(/\D/g, '');
    const subaccount = await asaasFetch('/accounts', {
      method: 'POST',
      body: JSON.stringify({
        name,
        cpfCnpj: normalizedCpfCnpj,
        email,
        phone: phone?.replace(/\D/g, ''),
        ...(birthDate ? { birthDate } : {}),
        companyType: companyType || (normalizedCpfCnpj.length > 11 ? 'LIMITED' : 'MEI'),
        bankAccount: {
          bank: { code: bankCode },
          accountName: name,
          ownerName: name,
          cpfCnpj: normalizedCpfCnpj,
          agency: bankAgency,
          account: bankAccount,
          accountDigit: bankAccountDigit,
          bankAccountType: bankAccountType || 'CONTA_CORRENTE',
        },
      }),
    });

    if (subaccount.errors) {
      console.error('[setup-payments] Asaas error:', subaccount.errors);
      return NextResponse.json({
        error: 'Erro ao criar conta de recebimento',
        details: subaccount.errors,
      }, { status: 400 });
    }

    await supabase.from('academies').update({
      bank_account_configured: true,
      bank_owner_name: name,
      bank_owner_cpf_cnpj: cpfCnpj,
      bank_owner_email: email,
      bank_owner_phone: phone,
      bank_owner_birth_date: birthDate,
      bank_company_type: companyType,
      bank_code: bankCode,
      bank_agency: bankAgency,
      bank_account: bankAccount,
      bank_account_digit: bankAccountDigit,
      bank_account_type: bankAccountType,
      asaas_subaccount_id: subaccount.id,
      asaas_subaccount_api_key: subaccount.apiKey,
      asaas_subaccount_wallet_id: subaccount.walletId,
      asaas_subaccount_status: 'active',
    }).eq('id', academyId);

    await supabase.from('audit_log').insert({
      academy_id: academyId,
      profile_id: membership?.profile_id ?? profiles?.[0]?.id ?? null,
      action: 'subaccount_created',
      entity_type: 'academy',
      entity_id: academyId,
      new_data: { subaccountId: subaccount.id, walletId: subaccount.walletId },
    });

    return NextResponse.json({
      success: true,
      subaccountId: subaccount.id,
      walletId: subaccount.walletId,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro interno';
    console.error('[setup-payments] Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
