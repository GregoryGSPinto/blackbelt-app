import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createCustomer, findCustomerByCpfCnpj } from '@/lib/integrations/asaas';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, cpfCnpj, mobilePhone, academyId } = body;

    if (!name || !cpfCnpj) {
      return NextResponse.json({ error: 'Nome e CPF/CNPJ são obrigatórios' }, { status: 400 });
    }

    // Check if customer already exists in Asaas
    const existing = await findCustomerByCpfCnpj(cpfCnpj);
    if (existing) {
      // Update academy with existing customer ID
      if (academyId) {
        await supabase
          .from('academies')
          .update({ asaas_customer_id: existing.id })
          .eq('id', academyId);
      }
      return NextResponse.json(existing);
    }

    // Create new customer in Asaas
    const customer = await createCustomer({
      name,
      email: email ?? user.email ?? '',
      cpfCnpj,
      mobilePhone,
      externalReference: academyId,
    });

    // Save Asaas customer ID to academy
    if (academyId) {
      await supabase
        .from('academies')
        .update({ asaas_customer_id: customer.id })
        .eq('id', academyId);
    }

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error('[POST /api/payments/create-customer]', error);
    const message = error instanceof Error ? error.message : 'Erro ao criar cliente';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
