'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getMyOrders, cancelOrder, type Order, type OrderStatus } from '@/lib/api/orders.service';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';
import { ShoppingCartIcon } from '@/components/shell/icons';

// -- Helpers -----------------------------------------------------------------

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(iso: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function truncateId(id: string): string {
  if (id.length <= 8) return id;
  return id.slice(0, 8).toUpperCase();
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string }> = {
  pending:   { bg: '#FEF3C7', text: '#92400E' },
  paid:      { bg: '#DBEAFE', text: '#1E40AF' },
  shipped:   { bg: '#E0E7FF', text: '#3730A3' },
  delivered: { bg: '#DCFCE7', text: '#15803D' },
  cancelled: { bg: '#FEE2E2', text: '#991B1B' },
};

const PAYMENT_LABEL: Record<string, string> = {
  pix: 'PIX',
  boleto: 'Boleto',
  credit_card: 'Cartao',
  academy_payment: 'Na academia',
};

// -- Page --------------------------------------------------------------------

export default function MeusPedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    getMyOrders('user-1')
      .then(setOrders)
      .catch((err) => toast(translateError(err), 'error'))
      .finally(() => setLoading(false));
  }, [toast]);

  const handleCancel = useCallback(async (orderId: string) => {
    setCancellingId(orderId);
    try {
      const updated = await cancelOrder(orderId);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: updated.status, updated_at: updated.updated_at } : o)));
      toast('Pedido cancelado com sucesso', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setCancellingId(null);
      setConfirmCancelId(null);
    }
  }, [toast]);

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  // -- Skeleton loading ------------------------------------------------------

  if (loading) {
    return (
      <div className="space-y-4 p-4 sm:p-6">
        <Skeleton variant="text" className="h-8 w-48" />
        <Skeleton variant="text" className="h-5 w-64" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="card" className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  // -- Empty state -----------------------------------------------------------

  if (orders.length === 0) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--bb-ink-100)' }}>
            Meus Pedidos
          </h1>
          <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>
            Acompanhe seus pedidos da loja
          </p>
        </div>
        <div className="py-16 text-center">
          <ShoppingCartIcon className="mx-auto mb-3 h-16 w-16" style={{ color: 'var(--bb-ink-20)' }} />
          <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
            Nenhum pedido ainda
          </h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-40)' }}>
            Explore a loja e faca sua primeira compra!
          </p>
          <Link href="/loja">
            <Button className="mt-6">Ir para a Loja</Button>
          </Link>
        </div>
      </div>
    );
  }

  // -- Order list ------------------------------------------------------------

  return (
    <div className="min-h-screen space-y-5 p-4 sm:p-6" data-stagger>
      {/* Header */}
      <section className="animate-reveal">
        <h1 className="text-2xl font-extrabold" style={{ color: 'var(--bb-ink-100)' }}>
          Meus Pedidos
        </h1>
        <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>
          {orders.length} pedido{orders.length !== 1 ? 's' : ''}
        </p>
      </section>

      {/* Orders */}
      <section className="animate-reveal space-y-3">
        {orders.map((order) => {
          const expanded = expandedId === order.id;
          const statusColor = STATUS_COLORS[order.status];
          const itemsSummary = order.items.length <= 2
            ? order.items.map((i) => i.product_name).join(', ')
            : `${order.items[0].product_name} + ${order.items.length - 1} mais`;

          return (
            <div
              key={order.id}
              className="overflow-hidden transition-all"
              style={{
                background: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
                borderRadius: 'var(--bb-radius-lg)',
              }}
            >
              {/* Order header - clickable */}
              <button
                type="button"
                onClick={() => toggleExpand(order.id)}
                className="w-full p-4 text-left transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                        #{truncateId(order.id)}
                      </span>
                      <span
                        className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                        style={{ background: statusColor.bg, color: statusColor.text }}
                      >
                        {STATUS_LABEL[order.status]}
                      </span>
                    </div>
                    <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                      {formatDate(order.created_at)}
                    </p>
                    <p className="mt-1 text-sm line-clamp-1" style={{ color: 'var(--bb-ink-60)' }}>
                      {itemsSummary}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-base font-extrabold" style={{ color: 'var(--bb-ink-100)' }}>
                      {formatBRL(order.total)}
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      style={{
                        color: 'var(--bb-ink-40)',
                        transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Expanded details */}
              {expanded && (
                <div
                  className="space-y-4 px-4 pb-4"
                  style={{ borderTop: '1px solid var(--bb-glass-border)' }}
                >
                  {/* Order info */}
                  <div className="grid gap-3 pt-4 text-sm sm:grid-cols-2">
                    <div>
                      <span style={{ color: 'var(--bb-ink-40)' }}>Pagamento:</span>{' '}
                      <span style={{ color: 'var(--bb-ink-100)' }}>{PAYMENT_LABEL[order.payment_method] ?? order.payment_method}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--bb-ink-40)' }}>Entrega:</span>{' '}
                      <span style={{ color: 'var(--bb-ink-100)' }}>
                        {order.delivery_option === 'pickup' ? 'Retirada na academia' : 'Envio'}
                      </span>
                    </div>
                    {order.tracking_code && (
                      <div className="sm:col-span-2">
                        <span style={{ color: 'var(--bb-ink-40)' }}>Rastreio:</span>{' '}
                        <span className="font-mono font-bold" style={{ color: 'var(--bb-brand)' }}>
                          {order.tracking_code}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Items list */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>
                      Itens
                    </h4>
                    {order.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-lg p-2"
                        style={{ background: 'var(--bb-depth-3)' }}
                      >
                        {/* Image placeholder */}
                        <div
                          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded"
                          style={{ background: 'var(--bb-depth-2)' }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1}
                            style={{ color: 'var(--bb-ink-20)' }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1" style={{ color: 'var(--bb-ink-100)' }}>
                            {item.product_name}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                            {item.variant_name} &middot; Qtd: {item.quantity}
                          </p>
                        </div>
                        <span className="text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                          {formatBRL(item.total)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="space-y-1 text-sm" style={{ borderTop: '1px solid var(--bb-glass-border)', paddingTop: '0.75rem' }}>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--bb-ink-40)' }}>Subtotal</span>
                      <span style={{ color: 'var(--bb-ink-100)' }}>{formatBRL(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--bb-ink-40)' }}>Frete</span>
                      <span style={{ color: order.shipping_cost === 0 ? '#15803D' : 'var(--bb-ink-100)' }}>
                        {order.shipping_cost === 0 ? 'Gratis' : formatBRL(order.shipping_cost)}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span style={{ color: 'var(--bb-ink-100)' }}>Total</span>
                      <span style={{ color: 'var(--bb-ink-100)' }}>{formatBRL(order.total)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    {order.status === 'pending' && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setConfirmCancelId(order.id)}
                        disabled={cancellingId === order.id}
                      >
                        {cancellingId === order.id ? <Spinner size="sm" /> : 'Cancelar pedido'}
                      </Button>
                    )}
                    {order.status === 'delivered' && (
                      <>
                        {order.items.map((item) => (
                          <Link key={item.product_id} href={`/loja/${item.product_id}`}>
                            <Button variant="secondary" size="sm">
                              Avaliar {order.items.length > 1 ? item.product_name.slice(0, 15) + '...' : 'produto'}
                            </Button>
                          </Link>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* Link back to store */}
      <section className="animate-reveal text-center">
        <Link href="/loja">
          <Button variant="ghost">Voltar para a Loja</Button>
        </Link>
      </section>

      {/* Cancel confirmation modal */}
      <Modal
        open={!!confirmCancelId}
        onClose={() => setConfirmCancelId(null)}
        variant="confirm"
        title="Cancelar pedido?"
      >
        <div className="space-y-4">
          <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Tem certeza que deseja cancelar o pedido #{confirmCancelId ? truncateId(confirmCancelId) : ''}? Esta acao nao pode ser desfeita.
          </p>
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setConfirmCancelId(null)}>
              Manter pedido
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={() => confirmCancelId && handleCancel(confirmCancelId)}
              disabled={!!cancellingId}
            >
              {cancellingId ? <Spinner size="sm" /> : 'Confirmar cancelamento'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
