import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getPayment, getPaymentPixQrCode } from '@/lib/integrations/asaas';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;

    // First check our database
    const { data: localPayment } = await supabase
      .from('pagamentos')
      .select('*')
      .eq('id', id)
      .single();

    if (!localPayment?.asaas_payment_id) {
      // Return local data only
      if (localPayment) {
        return NextResponse.json(localPayment);
      }
      return NextResponse.json({ error: 'Pagamento não encontrado' }, { status: 404 });
    }

    // Fetch latest status from Asaas
    const asaasPayment = await getPayment(localPayment.asaas_payment_id);

    // If PIX, also fetch QR code
    let pixData = null;
    if (asaasPayment.billingType === 'PIX' && asaasPayment.status === 'PENDING') {
      try {
        pixData = await getPaymentPixQrCode(localPayment.asaas_payment_id);
      } catch {
        // QR code may not be available yet
      }
    }

    // Update local status if changed
    if (localPayment.status !== asaasPayment.status.toLowerCase()) {
      await supabase
        .from('pagamentos')
        .update({
          status: asaasPayment.status.toLowerCase(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
    }

    return NextResponse.json({
      ...localPayment,
      status: asaasPayment.status.toLowerCase(),
      asaas: asaasPayment,
      pix: pixData,
    });
  } catch (error) {
    console.error('[GET /api/payments/[id]]', error);
    const message = error instanceof Error ? error.message : 'Erro ao consultar pagamento';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
