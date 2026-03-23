'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/shared/PageHeader';
import { useCart } from '@/lib/hooks/useCart';
import { calculateShipping, type ShippingOption } from '@/lib/api/shipping.service';
import { createOrder, type PaymentMethod, type ShippingAddress } from '@/lib/api/orders.service';

type Step = 'address' | 'shipping' | 'payment' | 'success';

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const INITIAL_ADDRESS: ShippingAddress = {
  name: '', cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '',
};

export default function CheckoutLojaPage() {
  const router = useRouter();
  const { items, cartTotal, clearCart } = useCart();
  const [step, setStep] = useState<Step>('address');
  const [address, setAddress] = useState<ShippingAddress>(INITIAL_ADDRESS);
  const [deliveryOption, setDeliveryOption] = useState<'pickup' | 'shipping'>('pickup');
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [processing, setProcessing] = useState(false);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    if (items.length === 0 && step !== 'success') {
      router.push('/carrinho');
    }
  }, [items, step, router]);

  async function handleAddressSubmit() {
    if (deliveryOption === 'pickup') {
      setStep('payment');
      return;
    }
    setLoadingShipping(true);
    try {
      const options = await calculateShipping(
        address.cep,
        items.map((i) => ({ product_id: i.product_id, variant_id: i.variant_id, quantity: i.quantity }))
      );
      setShippingOptions(options);
      if (options.length > 0) setSelectedShipping(options[0]);
      setStep('shipping');
    } finally {
      setLoadingShipping(false);
    }
  }

  async function handleConfirmOrder() {
    setProcessing(true);
    try {
      const order = await createOrder('user-1', {
        items: items.map((i) => ({
          product_id: i.product_id,
          variant_id: i.variant_id,
          quantity: i.quantity,
        })),
        shipping_address: address,
        delivery_option: deliveryOption,
        payment_method: paymentMethod,
        shipping_cost: deliveryOption === 'pickup' ? 0 : (selectedShipping?.price ?? 0),
      });
      setOrderId(order.id);
      clearCart();
      setStep('success');
    } finally {
      setProcessing(false);
    }
  }

  const shippingCost = deliveryOption === 'pickup' ? 0 : (selectedShipping?.price ?? 0);
  const grandTotal = cartTotal + shippingCost;

  const addressValid =
    address.name.length > 0 &&
    address.cep.length >= 8 &&
    address.street.length > 0 &&
    address.number.length > 0 &&
    address.neighborhood.length > 0 &&
    address.city.length > 0 &&
    address.state.length > 0;

  if (items.length === 0 && step !== 'success') return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-4 md:py-6">
      <PageHeader title="Checkout" subtitle="Finalize sua compra" />

      {/* Step indicators */}
      <div className="flex items-center gap-2 text-xs text-bb-gray-400">
        <span className={step === 'address' ? 'font-bold text-bb-primary' : ''}>Endereço</span>
        <span>/</span>
        <span className={step === 'shipping' ? 'font-bold text-bb-primary' : ''}>Entrega</span>
        <span>/</span>
        <span className={step === 'payment' ? 'font-bold text-bb-primary' : ''}>Pagamento</span>
      </div>

      {/* Order summary always visible */}
      {step !== 'success' && (
        <div className="rounded-lg border border-bb-gray-200 bg-bb-gray-50 p-4">
          <h3 className="text-sm font-bold text-bb-black">Resumo ({items.length} {items.length === 1 ? 'item' : 'itens'})</h3>
          <div className="mt-2 space-y-1">
            {items.map((item) => (
              <div key={`${item.product_id}-${item.variant_id}`} className="flex justify-between text-sm">
                <span className="text-bb-gray-500 line-clamp-1">{item.product_name} ({item.variant_name}) x{item.quantity}</span>
                <span className="flex-shrink-0 font-medium text-bb-black">{formatBRL(item.unit_price * item.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-bb-gray-200 pt-1 text-sm">
              <span className="text-bb-gray-500">Subtotal</span>
              <span className="font-bold text-bb-black">{formatBRL(cartTotal)}</span>
            </div>
            {deliveryOption === 'shipping' && selectedShipping && (
              <div className="flex justify-between text-sm">
                <span className="text-bb-gray-500">Frete ({selectedShipping.service})</span>
                <span className="font-bold text-bb-black">{formatBRL(selectedShipping.price)}</span>
              </div>
            )}
            {deliveryOption === 'pickup' && (
              <div className="flex justify-between text-sm">
                <span className="text-bb-gray-500">Retirada na academia</span>
                <span className="font-bold text-green-600">Grátis</span>
              </div>
            )}
            <div className="flex justify-between border-t border-bb-gray-200 pt-1">
              <span className="font-bold text-bb-black">Total</span>
              <span className="text-lg font-extrabold text-bb-black">{formatBRL(grandTotal)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Step: Address */}
      {step === 'address' && (
        <div className="space-y-4">
          <h3 className="font-bold text-bb-black">Entrega</h3>

          <div className="flex gap-3">
            <button
              onClick={() => setDeliveryOption('pickup')}
              className={`flex-1 rounded-lg border-2 p-4 text-left transition-colors ${
                deliveryOption === 'pickup' ? 'border-bb-primary bg-red-50' : 'border-bb-gray-200'
              }`}
            >
              <p className="font-medium text-bb-black">Retirar na Academia</p>
              <p className="mt-1 text-xs text-bb-gray-500">Grátis - Disponível em 1 dia útil</p>
            </button>
            <button
              onClick={() => setDeliveryOption('shipping')}
              className={`flex-1 rounded-lg border-2 p-4 text-left transition-colors ${
                deliveryOption === 'shipping' ? 'border-bb-primary bg-red-50' : 'border-bb-gray-200'
              }`}
            >
              <p className="font-medium text-bb-black">Enviar para Endereço</p>
              <p className="mt-1 text-xs text-bb-gray-500">Frete calculado pelo CEP</p>
            </button>
          </div>

          {deliveryOption === 'shipping' && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-bb-black">Endereço de Entrega</h4>
              <input
                placeholder="Nome completo"
                value={address.name}
                onChange={(e) => setAddress({ ...address, name: e.target.value })}
                className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  placeholder="CEP"
                  value={address.cep}
                  onChange={(e) => setAddress({ ...address, cep: e.target.value.replace(/\D/g, '').slice(0, 8) })}
                  className="rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
                />
                <input
                  placeholder="Estado (UF)"
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value.toUpperCase().slice(0, 2) })}
                  className="rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
                />
                <input
                  placeholder="Cidade"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className="rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <input
                placeholder="Bairro"
                value={address.neighborhood}
                onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })}
                className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
              />
              <div className="grid grid-cols-4 gap-2">
                <input
                  placeholder="Rua / Avenida"
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  className="col-span-2 rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
                />
                <input
                  placeholder="Número"
                  value={address.number}
                  onChange={(e) => setAddress({ ...address, number: e.target.value })}
                  className="rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
                />
                <input
                  placeholder="Complemento"
                  value={address.complement}
                  onChange={(e) => setAddress({ ...address, complement: e.target.value })}
                  className="rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleAddressSubmit}
            disabled={deliveryOption === 'shipping' && !addressValid}
          >
            {loadingShipping ? <Spinner size="sm" /> : 'Continuar'}
          </Button>
        </div>
      )}

      {/* Step: Shipping */}
      {step === 'shipping' && (
        <div className="space-y-4">
          <h3 className="font-bold text-bb-black">Escolha a forma de envio</h3>
          <div className="space-y-2">
            {shippingOptions.map((opt, i) => (
              <button
                key={i}
                onClick={() => setSelectedShipping(opt)}
                className={`flex w-full items-center justify-between rounded-lg border-2 p-4 text-left transition-colors ${
                  selectedShipping?.service === opt.service && selectedShipping?.carrier === opt.carrier
                    ? 'border-bb-primary bg-red-50'
                    : 'border-bb-gray-200 hover:border-bb-gray-300'
                }`}
              >
                <div>
                  <p className="font-medium text-bb-black">{opt.carrier} - {opt.service}</p>
                  <p className="text-xs text-bb-gray-500">Entrega em até {opt.delivery_days} dias úteis</p>
                </div>
                <span className="font-bold text-bb-black">{formatBRL(opt.price)}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setStep('address')}>
              Voltar
            </Button>
            <Button className="flex-1" onClick={() => setStep('payment')} disabled={!selectedShipping}>
              Continuar
            </Button>
          </div>
        </div>
      )}

      {/* Step: Payment */}
      {step === 'payment' && (
        <div className="space-y-4">
          <h3 className="font-bold text-bb-black">Forma de Pagamento</h3>
          {([
            { id: 'pix' as const, label: 'PIX', desc: 'Confirmação instantânea - 5% de desconto' },
            { id: 'boleto' as const, label: 'Boleto Bancário', desc: 'Até 3 dias úteis para confirmação' },
            { id: 'credit_card' as const, label: 'Cartão de Crédito', desc: 'Confirmação imediata - até 12x' },
          ]).map((opt) => (
            <button
              key={opt.id}
              onClick={() => setPaymentMethod(opt.id)}
              className={`flex w-full items-center gap-4 rounded-lg border-2 p-4 text-left transition-colors ${
                paymentMethod === opt.id ? 'border-bb-primary bg-red-50' : 'border-bb-gray-200 hover:border-bb-gray-300'
              }`}
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

          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setStep(deliveryOption === 'shipping' ? 'shipping' : 'address')}
            >
              Voltar
            </Button>
            <Button className="flex-1" onClick={handleConfirmOrder} disabled={processing}>
              {processing ? <Spinner size="sm" /> : `Pagar ${formatBRL(grandTotal)}`}
            </Button>
          </div>
        </div>
      )}

      {/* Step: Success */}
      {step === 'success' && (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
            ✓
          </div>
          <h3 className="text-xl font-bold text-bb-black">Pedido Confirmado!</h3>
          <p className="text-sm text-bb-gray-500">
            Seu pedido <span className="font-bold text-bb-black">#{orderId}</span> foi realizado com sucesso.
          </p>
          <p className="text-sm text-bb-gray-500">
            {paymentMethod === 'pix'
              ? 'Aguarde a confirmação do pagamento via PIX.'
              : paymentMethod === 'boleto'
                ? 'O boleto foi gerado. Pague até a data de vencimento.'
                : 'O pagamento com cartão de crédito foi aprovado.'}
          </p>
          <div className="flex flex-col gap-2">
            <Button className="w-full" onClick={() => router.push('/loja')}>
              Continuar Comprando
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => router.push('/pedidos/' + orderId)}>
              Acompanhar Pedido
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
