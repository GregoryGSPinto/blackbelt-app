'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPlanById } from '@/lib/api/planos.service';
import type { Plan } from '@/lib/types';
import { getPaymentGateway } from '@/lib/api/payment-gateway.service';
import type { PaymentLink, PaymentMethod } from '@/lib/types/payment';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

type CheckoutStep = 'select' | 'payment' | 'success' | 'error';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const planId = params.planId as string;

  const [plan, setPlan] = useState<Plan | null>(null);
  const [step, setStep] = useState<CheckoutStep>('select');
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [paymentLink, setPaymentLink] = useState<PaymentLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    getPlanById(planId).then(setPlan).finally(() => setLoading(false));
  }, [planId]);

  const handleSelectMethod = useCallback(async (selectedMethod: PaymentMethod) => {
    setMethod(selectedMethod);
    setProcessing(true);
    try {
      const gateway = await getPaymentGateway();
      const invoice = await gateway.generateInvoice('preview', plan?.price ?? 0);
      const link = await gateway.getPaymentLink(invoice.externalId, selectedMethod);
      setPaymentLink(link);
      setStep('payment');
    } catch {
      setStep('error');
    } finally {
      setProcessing(false);
    }
  }, [plan?.price]);

  const handleConfirm = useCallback(() => {
    setProcessing(true);
    // Simulate payment confirmation
    setTimeout(() => {
      setStep('success');
      setProcessing(false);
    }, 1500);
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!plan) return <div className="py-20 text-center text-bb-gray-500">Plano não encontrado.</div>;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <PageHeader title="Checkout" subtitle={plan.name} />

      {/* Plan Summary */}
      <div className="rounded-lg border border-bb-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-bb-black">{plan.name}</h3>
            <p className="text-sm text-bb-gray-500">
              {plan.interval === 'monthly' ? 'Mensal' : plan.interval === 'quarterly' ? 'Trimestral' : 'Anual'}
            </p>
          </div>
          <span className="text-2xl font-extrabold text-bb-black">
            R$ {plan.price.toFixed(2).replace('.', ',')}
          </span>
        </div>
      </div>

      {/* Step: Select Payment Method */}
      {step === 'select' && (
        <div className="space-y-3">
          <h4 className="font-semibold text-bb-black">Forma de Pagamento</h4>
          {([
            { id: 'pix' as const, label: 'PIX', desc: 'Confirmação instantânea' },
            { id: 'boleto' as const, label: 'Boleto Bancário', desc: 'Até 3 dias úteis' },
            { id: 'credit_card' as const, label: 'Cartão de Crédito', desc: 'Confirmação imediata' },
          ]).map((opt) => (
            <button
              key={opt.id}
              disabled={processing}
              onClick={() => handleSelectMethod(opt.id)}
              className="flex w-full items-center gap-4 rounded-lg border border-bb-gray-200 p-4 text-left transition-colors hover:border-bb-primary hover:bg-red-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bb-gray-100 text-lg">
                {opt.id === 'pix' ? '⚡' : opt.id === 'boleto' ? '📄' : '💳'}
              </div>
              <div>
                <p className="font-medium text-bb-black">{opt.label}</p>
                <p className="text-xs text-bb-gray-500">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Step: Payment Details */}
      {step === 'payment' && paymentLink && (
        <div className="space-y-4">
          <h4 className="font-semibold text-bb-black">
            {method === 'pix' ? 'Pague com PIX' : method === 'boleto' ? 'Boleto Bancário' : 'Cartão de Crédito'}
          </h4>

          {method === 'pix' && paymentLink.qrCode && (
            <div className="space-y-3">
              <div className="flex justify-center rounded-lg bg-white p-6">
                <div className="flex h-48 w-48 items-center justify-center rounded-lg border-2 border-dashed border-bb-gray-300 text-sm text-bb-gray-500">
                  QR Code PIX
                </div>
              </div>
              <div className="rounded-lg bg-bb-gray-50 p-3">
                <p className="text-xs text-bb-gray-500">Código PIX:</p>
                <p className="mt-1 break-all font-mono text-xs text-bb-black">{paymentLink.qrCode}</p>
              </div>
              <Button variant="secondary" className="w-full" onClick={() => navigator.clipboard.writeText(paymentLink.qrCode ?? '')}>
                Copiar Código
              </Button>
            </div>
          )}

          {method === 'boleto' && paymentLink.barCode && (
            <div className="space-y-3">
              <div className="rounded-lg bg-bb-gray-50 p-3">
                <p className="text-xs text-bb-gray-500">Código de barras:</p>
                <p className="mt-1 font-mono text-xs text-bb-black">{paymentLink.barCode}</p>
              </div>
              <Button variant="secondary" className="w-full" onClick={() => navigator.clipboard.writeText(paymentLink.barCode ?? '')}>
                Copiar Código
              </Button>
            </div>
          )}

          {method === 'credit_card' && (
            <div className="space-y-3">
              <p className="text-sm text-bb-gray-500">
                Você será redirecionado para o ambiente seguro de pagamento.
              </p>
            </div>
          )}

          <Button variant="primary" className="w-full" onClick={handleConfirm} disabled={processing}>
            {processing ? <Spinner size="sm" /> : 'Confirmar Pagamento'}
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => setStep('select')}>
            Voltar
          </Button>
        </div>
      )}

      {/* Step: Success */}
      {step === 'success' && (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
            ✓
          </div>
          <h4 className="text-lg font-bold text-bb-black">Pagamento Confirmado!</h4>
          <p className="text-sm text-bb-gray-500">Seu plano {plan.name} foi ativado com sucesso.</p>
          <Button variant="primary" className="w-full" onClick={() => router.push('/dashboard')}>
            Ir para o Dashboard
          </Button>
        </div>
      )}

      {/* Step: Error */}
      {step === 'error' && (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl">
            ✕
          </div>
          <h4 className="text-lg font-bold text-bb-black">Erro no Pagamento</h4>
          <p className="text-sm text-bb-gray-500">Não foi possível processar o pagamento. Tente novamente.</p>
          <Button variant="primary" className="w-full" onClick={() => setStep('select')}>
            Tentar Novamente
          </Button>
        </div>
      )}
    </div>
  );
}
