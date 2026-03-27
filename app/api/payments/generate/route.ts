import { NextResponse } from 'next/server';
import { createCustomer, findCustomerByExternalRef, createPayment } from '@/lib/payment/asaas';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Verificar se nao esta em modo mock
    if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
      return NextResponse.json({
        paymentId: `pay_mock_${Date.now()}`,
        invoiceUrl: '#mock',
        pixQrCode: null,
        status: 'mock',
      });
    }

    // Verificar se ASAAS_API_KEY esta configurada
    if (!process.env.ASAAS_API_KEY) {
      return NextResponse.json(
        { error: 'Asaas nao configurado. Configure ASAAS_API_KEY.' },
        { status: 503 },
      );
    }

    // Buscar ou criar customer no Asaas
    let customer = await findCustomerByExternalRef(body.personId);
    if (!customer) {
      customer = await createCustomer({
        name: body.customerName,
        email: body.customerEmail,
        cpfCnpj: body.customerCpf,
        phone: body.customerPhone,
        externalReference: body.personId,
      });
    }

    // Criar pagamento
    const payment = await createPayment({
      customerId: customer.id,
      billingType: body.billingType,
      value: body.amount,
      dueDate: body.dueDate,
      description: body.description,
      externalReference: body.invoiceId,
    });

    // Salvar no banco
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    await supabase
      .from('invoices')
      .update({
        external_payment_id: payment.id,
        payment_link: payment.invoiceUrl,
        pix_qr_code: payment.pixQrCode?.encodedImage,
        pix_payload: payment.pixQrCode?.payload,
        payment_method: body.billingType.toLowerCase(),
      })
      .eq('id', body.invoiceId);

    // Salvar customer mapping
    await supabase.from('payment_customers').upsert(
      {
        person_id: body.personId,
        academy_id: body.academyId,
        external_customer_id: customer.id,
        provider: 'asaas',
      },
      { onConflict: 'person_id,academy_id,provider' },
    );

    return NextResponse.json({
      paymentId: payment.id,
      invoiceUrl: payment.invoiceUrl,
      pixQrCode: payment.pixQrCode?.encodedImage,
      pixPayload: payment.pixQrCode?.payload,
      bankSlipUrl: payment.bankSlipUrl,
      status: payment.status,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao gerar pagamento';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
