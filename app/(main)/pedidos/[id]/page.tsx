'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getOrderById, cancelOrder, type Order, type OrderStatus } from '@/lib/api/orders.service';
import { getShipmentStatus, type Shipment, type ShipmentStatus } from '@/lib/api/shipping.service';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/shared/PageHeader';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pendente', paid: 'Pago', shipped: 'Enviado', delivered: 'Entregue', cancelled: 'Cancelado',
};
const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700', paid: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700', delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const SHIPMENT_STATUS_COLOR: Record<ShipmentStatus, string> = {
  created: 'bg-gray-400', posted: 'bg-blue-400', in_transit: 'bg-indigo-500',
  out_for_delivery: 'bg-orange-500', delivered: 'bg-green-500', returned: 'bg-red-500',
};

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function PedidoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    setLoading(true);
    getOrderById(orderId)
      .then(async (o) => {
        setOrder(o);
        if (o.status === 'shipped' || o.status === 'delivered') {
          try {
            const s = await getShipmentStatus(o.id);
            setShipment(s);
          } catch {
            // no shipment available
          }
        }
      })
      .catch(() => {
        setOrder(null);
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  async function handleCancel() {
    if (!order) return;
    setCancelling(true);
    try {
      const updated = await cancelOrder(order.id);
      setOrder(updated);
      toast('Pedido cancelado', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center">
        <p className="text-bb-gray-500">Pedido não encontrado.</p>
        <Button variant="ghost" className="mt-4" onClick={() => router.push('/loja')}>
          Voltar para a loja
        </Button>
      </div>
    );
  }

  const estimatedDelivery = shipment?.estimated_delivery
    ? new Date(shipment.estimated_delivery).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-2 text-sm text-bb-gray-400">
        <Link href="/loja" className="hover:text-bb-primary">Loja</Link>
        <span>/</span>
        <span className="text-bb-gray-600">Pedido {order.id}</span>
      </div>

      <div className="flex items-center justify-between">
        <PageHeader title={`Pedido ${order.id}`} subtitle={`Realizado em ${formatDate(order.created_at)}`} />
        <span className={`rounded-full px-3 py-1 text-sm font-medium ${ORDER_STATUS_COLOR[order.status]}`}>
          {ORDER_STATUS_LABEL[order.status]}
        </span>
      </div>

      {/* Order timeline */}
      {order.status !== 'cancelled' && (
        <div className="rounded-xl border border-bb-gray-200 bg-white p-4">
          <h3 className="text-sm font-bold text-bb-black">Progresso do Pedido</h3>
          <div className="mt-4 flex items-center">
            {(['pending', 'paid', 'shipped', 'delivered'] as OrderStatus[]).map((step, i, arr) => {
              const currentIdx = arr.indexOf(order.status);
              const isActive = i <= currentIdx;
              const isLast = i === arr.length - 1;
              return (
                <div key={step} className={`flex items-center ${isLast ? '' : 'flex-1'}`}>
                  <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isActive ? 'bg-bb-primary text-white' : 'bg-bb-gray-200 text-bb-gray-400'
                  }`}>
                    {isActive && i <= currentIdx ? '✓' : i + 1}
                  </div>
                  {!isLast && (
                    <div className={`mx-1 h-0.5 flex-1 ${i < currentIdx ? 'bg-bb-primary' : 'bg-bb-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-xs text-bb-gray-500">
            <span>Pedido</span>
            <span>Pago</span>
            <span>Enviado</span>
            <span>Entregue</span>
          </div>
        </div>
      )}

      {order.status === 'cancelled' && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
          <p className="font-medium text-red-700">Este pedido foi cancelado</p>
          <p className="mt-1 text-xs text-red-500">Cancelado em {formatDate(order.updated_at)}</p>
        </div>
      )}

      {/* Tracking timeline */}
      {shipment && shipment.events.length > 0 && (
        <div className="rounded-xl border border-bb-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-bb-black">Rastreamento</h3>
            <span className="font-mono text-xs text-bb-gray-500">{shipment.tracking_code}</span>
          </div>

          {estimatedDelivery && (
            <p className="mt-1 text-xs text-bb-gray-500">
              Previsão de entrega: <span className="font-medium text-bb-black">{estimatedDelivery}</span>
            </p>
          )}

          <div className="mt-4 space-y-0">
            {shipment.events.map((event, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`h-3 w-3 rounded-full ${i === 0 ? SHIPMENT_STATUS_COLOR[event.status] : 'bg-bb-gray-300'}`} />
                  {i < shipment.events.length - 1 && (
                    <div className="w-0.5 flex-1 bg-bb-gray-200" />
                  )}
                </div>
                <div className="pb-4">
                  <p className={`text-sm font-medium ${i === 0 ? 'text-bb-black' : 'text-bb-gray-500'}`}>
                    {event.description}
                  </p>
                  <p className="text-xs text-bb-gray-400">
                    {event.location} - {formatDate(event.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order items */}
      <div className="rounded-xl border border-bb-gray-200 bg-white p-4">
        <h3 className="text-sm font-bold text-bb-black">Itens do Pedido</h3>
        <div className="mt-3 space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-bb-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-bb-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-bb-black">{item.product_name}</p>
                <p className="text-xs text-bb-gray-400">{item.variant_name} - Qtd: {item.quantity}</p>
              </div>
              <span className="font-bold text-bb-black">{formatBRL(item.total)}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-1 border-t border-bb-gray-200 pt-3">
          <div className="flex justify-between text-sm">
            <span className="text-bb-gray-500">Subtotal</span>
            <span className="text-bb-black">{formatBRL(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-bb-gray-500">Frete</span>
            <span className="text-bb-black">
              {order.shipping_cost === 0 ? 'Retirada na academia' : formatBRL(order.shipping_cost)}
            </span>
          </div>
          <div className="flex justify-between border-t border-bb-gray-200 pt-2">
            <span className="text-lg font-bold text-bb-black">Total</span>
            <span className="text-lg font-extrabold text-bb-black">{formatBRL(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Delivery address */}
      <div className="rounded-xl border border-bb-gray-200 bg-white p-4">
        <h3 className="text-sm font-bold text-bb-black">
          {order.delivery_option === 'pickup' ? 'Retirada na Academia' : 'Endereço de Entrega'}
        </h3>
        <p className="mt-1 text-sm text-bb-gray-600">
          {order.shipping_address.name}
        </p>
        <p className="text-sm text-bb-gray-500">
          {order.shipping_address.street}, {order.shipping_address.number}
          {order.shipping_address.complement ? `, ${order.shipping_address.complement}` : ''}
        </p>
        <p className="text-sm text-bb-gray-500">
          {order.shipping_address.neighborhood} - {order.shipping_address.city}/{order.shipping_address.state}
        </p>
        <p className="text-sm text-bb-gray-500">CEP: {order.shipping_address.cep}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link href="/loja" className="flex-1">
          <Button variant="secondary" className="w-full">Voltar para a Loja</Button>
        </Link>
        {(order.status === 'pending') && (
          <Button
            variant="danger"
            className="flex-1"
            onClick={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? <Spinner size="sm" /> : 'Cancelar Pedido'}
          </Button>
        )}
      </div>
    </div>
  );
}
