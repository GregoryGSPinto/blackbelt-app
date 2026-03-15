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

type CheckoutStep = 'select-child' | 'select-method' | 'payment' | 'success' | 'error';

const MOCK_CHILDREN = [
  { id: 'child-1', name: 'Lucas Silva' },
  { id: 'child-2', name: 'Ana Silva' },
];

export default function ParentCheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const planId = params.planId as string;

  const [plan, setPlan] = useState<Plan | null>(null);
  const [step, setStep] = useState<CheckoutStep>('select-child');
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [paymentLink, setPaymentLink] = useState<PaymentLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    getPlanById(planId).then(setPlan).finally(() => setLoading(false));
  }, [planId]);

  const handleSelectMethod = useCallback(async (m: PaymentMethod) => {
    setMethod(m);
    setProcessing(true);
    try {
      const gateway = await getPaymentGateway();
      const invoice = await gateway.generateInvoice('preview', plan?.price ?? 0);
      const link = await gateway.getPaymentLink(invoice.externalId, m);
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
    setTimeout(() => {
      setStep('success');
      setProcessing(false);
    }, 1500);
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!plan) return <div className="py-20 text-center text-bb-gray-500">Plano não encontrado.</div>;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <PageHeader title="Checkout" subtitle={`Plano ${plan.name} para seu filho(a)`} />

      {/* Plan Summary */}
      <div className="rounded-lg border border-bb-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-bb-black">{plan.name}</h3>
            <p className="text-sm text-bb-gray-500">R$ {plan.price.toFixed(2).replace('.', ',')}</p>
          </div>
          {selectedChild && (
            <span className="text-sm text-bb-gray-500">
              Para: {MOCK_CHILDREN.find((c) => c.id === selectedChild)?.name}
            </span>
          )}
        </div>
      </div>

      {/* Step: Select Child */}
      {step === 'select-child' && (
        <div className="space-y-3">
          <h4 className="font-semibold text-bb-black">Selecione o(a) filho(a)</h4>
          {MOCK_CHILDREN.map((child) => (
            <button
              key={child.id}
              onClick={() => { setSelectedChild(child.id); setStep('select-method'); }}
              className="flex w-full items-center gap-3 rounded-lg border border-bb-gray-200 p-4 text-left transition-colors hover:border-bb-primary"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bb-gray-100 text-sm font-bold text-bb-black">
                {child.name.charAt(0)}
              </div>
              <span className="font-medium text-bb-black">{child.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Step: Select Payment Method */}
      {step === 'select-method' && (
        <div className="space-y-3">
          <h4 className="font-semibold text-bb-black">Forma de Pagamento</h4>
          {([
            { id: 'pix' as const, label: 'PIX' },
            { id: 'boleto' as const, label: 'Boleto Bancário' },
            { id: 'credit_card' as const, label: 'Cartão de Crédito' },
          ]).map((opt) => (
            <button
              key={opt.id}
              disabled={processing}
              onClick={() => handleSelectMethod(opt.id)}
              className="flex w-full items-center gap-3 rounded-lg border border-bb-gray-200 p-4 text-left transition-colors hover:border-bb-primary"
            >
              <span className="font-medium text-bb-black">{opt.label}</span>
            </button>
          ))}
          <Button variant="ghost" className="w-full" onClick={() => setStep('select-child')}>Voltar</Button>
        </div>
      )}

      {/* Step: Payment */}
      {step === 'payment' && paymentLink && (
        <div className="space-y-4">
          {method === 'pix' && paymentLink.qrCode && (
            <div className="rounded-lg bg-bb-gray-50 p-3">
              <p className="text-xs text-bb-gray-500">Código PIX:</p>
              <p className="mt-1 break-all font-mono text-xs">{paymentLink.qrCode}</p>
            </div>
          )}
          {method === 'boleto' && paymentLink.barCode && (
            <div className="rounded-lg bg-bb-gray-50 p-3">
              <p className="text-xs text-bb-gray-500">Código de barras:</p>
              <p className="mt-1 font-mono text-xs">{paymentLink.barCode}</p>
            </div>
          )}
          <Button variant="primary" className="w-full" onClick={handleConfirm} disabled={processing}>
            {processing ? <Spinner size="sm" /> : 'Confirmar Pagamento'}
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => setStep('select-method')}>Voltar</Button>
        </div>
      )}

      {/* Step: Success */}
      {step === 'success' && (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">✓</div>
          <h4 className="text-lg font-bold text-bb-black">Pagamento Confirmado!</h4>
          <Button variant="primary" className="w-full" onClick={() => router.push('/parent')}>Voltar</Button>
        </div>
      )}

      {/* Step: Error */}
      {step === 'error' && (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl">✕</div>
          <h4 className="text-lg font-bold text-bb-black">Erro no Pagamento</h4>
          <Button variant="primary" className="w-full" onClick={() => setStep('select-method')}>Tentar Novamente</Button>
        </div>
      )}
    </div>
  );
}
