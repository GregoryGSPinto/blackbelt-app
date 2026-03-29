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
      academyId, name, cpfCnpj, email, phone, birthDate,
      companyType, bankCode, bankAgency, bankAccount,
      bankAccountDigit, bankAccountType,
    } = body;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Verificar se ja tem subconta
    const { data: academy } = await supabase
      .from('academies')
      .select('asaas_subaccount_id')
      .eq('id', academyId)
      .single();

    if (academy?.asaas_subaccount_id) {
      return NextResponse.json({ error: 'Academia ja tem subconta configurada' }, { status: 400 });
    }

    // Criar subconta no Asaas
    const subaccount = await asaasFetch('/accounts', {
      method: 'POST',
      body: JSON.stringify({
        name,
        cpfCnpj: cpfCnpj.replace(/\D/g, ''),
        email,
        phone: phone?.replace(/\D/g, ''),
        ...(birthDate ? { birthDate } : {}),
        companyType: companyType || (cpfCnpj.replace(/\D/g, '').length > 11 ? 'LIMITED' : 'MEI'),
        bankAccount: {
          bank: { code: bankCode },
          accountName: name,
          ownerName: name,
          cpfCnpj: cpfCnpj.replace(/\D/g, ''),
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

    // Salvar no banco
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

    // Audit log
    await supabase.from('audit_log').insert({
      academy_id: academyId,
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
