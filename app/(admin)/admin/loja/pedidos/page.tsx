'use client';

import { useState, useEffect } from 'react';
import { listOrders, getOrderDetail, updateOrderStatus, getStoreDashboard, type OrderFilters, type StoreDashboard } from '@/lib/api/admin-orders.service';
import type { Order, OrderStatus } from '@/lib/api/orders.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/lib/hooks/useToast';
import { PlanGate } from '@/components/plans/PlanGate';
import { EmptyState } from '@/components/ui/EmptyState';
import { translateError } from '@/lib/utils/error-translator';

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pendente', paid: 'Pago', shipped: 'Enviado', delivered: 'Entregue', cancelled: 'Cancelado',
};
const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700', paid: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700', delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const TIMELINE_STEPS: OrderStatus[] = ['pending', 'paid', 'shipped', 'delivered'];

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminPedidosPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [dashboard, setDashboard] = useState<StoreDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPeriod, setFilterPeriod] = useState<OrderFilters['period']>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [trackingInput, setTrackingInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      listOrders(),
      getStoreDashboard(),
    ]).then(([o, d]) => {
      setOrders(o);
      setDashboard(d);
    }).finally(() => setLoading(false));
  }, []);

  async function handleFilter() {
    setLoading(true);
    try {
      const result = await listOrders({
        status: filterStatus as OrderStatus | undefined,
        period: filterPeriod,
      });
      setOrders(result);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!loading) handleFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterPeriod]);

  async function openDetail(orderId: string) {
    setDetailLoading(true);
    try {
      const detail = await getOrderDetail(orderId);
      setSelectedOrder(detail);
      setTrackingInput(detail.tracking_code ?? '');
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleStatusUpdate(status: OrderStatus) {
    if (!selectedOrder) return;
    setActionLoading(true);
    try {
      const updated = await updateOrderStatus(
        selectedOrder.id,
        status,
        status === 'shipped' ? trackingInput : undefined
      );
      setSelectedOrder(updated);
      setOrders((prev) => prev.map((o) => o.id === updated.id ? updated : o));
      toast(`Pedido atualizado para: ${STATUS_LABEL[status]}`, 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setActionLoading(false);
    }
  }

  if (loading && !orders.length) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  return (
    <PlanGate module="loja">
    <div className="space-y-6 p-6">
      <h1 className="text-xl font-bold text-bb-black">Pedidos da Loja</h1>

      {/* Dashboard KPIs */}
      {dashboard && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4">
            <p className="text-xs text-bb-gray-500">Pedidos (mês)</p>
            <p className="mt-1 text-2xl font-extrabold text-bb-black">{dashboard.orders_month}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-bb-gray-500">Receita (mês)</p>
            <p className="mt-1 text-2xl font-extrabold text-bb-black">{formatBRL(dashboard.revenue)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-bb-gray-500">Ticket Médio</p>
            <p className="mt-1 text-2xl font-extrabold text-bb-black">{formatBRL(dashboard.avg_ticket)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-bb-gray-500">Top Produto</p>
            <p className="mt-1 text-sm font-bold text-bb-black line-clamp-1">{dashboard.top_products[0]?.product_name}</p>
            <p className="text-xs text-bb-gray-400">{dashboard.top_products[0]?.quantity_sold} vendidos</p>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Todos os status</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          value={filterPeriod}
          onChange={(e) => setFilterPeriod(e.target.value as OrderFilters['period'])}
          className="rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
        >
          <option value="all">Todo o período</option>
          <option value="today">Hoje</option>
          <option value="week">Esta semana</option>
          <option value="month">Este mês</option>
        </select>
        <span className="ml-auto self-center text-sm text-bb-gray-500">{orders.length} pedidos</span>
      </div>

      {/* Orders table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bb-gray-300 bg-bb-gray-100">
                <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Pedido</th>
                <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Cliente</th>
                <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Itens</th>
                <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Total</th>
                <th className="px-4 py-3 text-center font-medium text-bb-gray-500">Status</th>
                <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Data</th>
                <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Ações</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-bb-gray-100 hover:bg-bb-gray-50">
                  <td className="px-4 py-3 font-mono text-xs font-medium text-bb-black">{order.id}</td>
                  <td className="px-4 py-3 text-bb-black">{order.user_name}</td>
                  <td className="px-4 py-3 text-bb-gray-500">{order.items.length} itens</td>
                  <td className="px-4 py-3 text-right font-bold text-bb-black">{formatBRL(order.total)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[order.status]}`}>
                      {STATUS_LABEL[order.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-bb-gray-500">{formatDate(order.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openDetail(order.id)}
                      className="text-sm text-bb-primary hover:underline"
                    >
                      Detalhes
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={7}>
                  <EmptyState
                    icon="📦"
                    title="Nenhum pedido encontrado"
                    description={filterStatus || filterPeriod !== 'all' ? "Nenhum pedido para os filtros selecionados." : "Quando clientes fizerem pedidos na loja, eles aparecerão aqui."}
                    variant={filterStatus || filterPeriod !== 'all' ? "search" : "first-time"}
                  />
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Order detail modal */}
      <Modal
        open={!!selectedOrder || detailLoading}
        onClose={() => { setSelectedOrder(null); setTrackingInput(''); }}
        title={selectedOrder ? `Pedido ${selectedOrder.id}` : 'Carregando...'}
      >
        {detailLoading && <div className="flex justify-center py-8"><Spinner /></div>}
        {selectedOrder && !detailLoading && (
          <div className="space-y-4">
            {/* Timeline */}
            {selectedOrder.status !== 'cancelled' && (
              <div className="flex items-center justify-between">
                {TIMELINE_STEPS.map((s, i) => {
                  const currentIdx = TIMELINE_STEPS.indexOf(selectedOrder.status);
                  const isActive = i <= currentIdx;
                  return (
                    <div key={s} className="flex flex-1 flex-col items-center">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                        isActive ? 'bg-bb-primary text-white' : 'bg-bb-gray-200 text-bb-gray-400'
                      }`}>
                        {i + 1}
                      </div>
                      <span className={`mt-1 text-xs ${isActive ? 'font-medium text-bb-primary' : 'text-bb-gray-400'}`}>
                        {STATUS_LABEL[s]}
                      </span>
                      {i < TIMELINE_STEPS.length - 1 && (
                        <div className={`mt-1 h-0.5 w-full ${i < currentIdx ? 'bg-bb-primary' : 'bg-bb-gray-200'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {selectedOrder.status === 'cancelled' && (
              <div className="rounded-lg bg-red-50 p-3 text-center text-sm font-medium text-red-700">
                Pedido cancelado
              </div>
            )}

            {/* Customer */}
            <div>
              <p className="text-xs font-medium text-bb-gray-400">Cliente</p>
              <p className="text-sm font-bold text-bb-black">{selectedOrder.user_name}</p>
              <p className="text-xs text-bb-gray-500">
                {selectedOrder.shipping_address.street}, {selectedOrder.shipping_address.number}
                {selectedOrder.shipping_address.complement ? `, ${selectedOrder.shipping_address.complement}` : ''} -
                {' '}{selectedOrder.shipping_address.neighborhood}, {selectedOrder.shipping_address.city}/{selectedOrder.shipping_address.state}
              </p>
            </div>

            {/* Items */}
            <div>
              <p className="text-xs font-medium text-bb-gray-400">Itens</p>
              <div className="mt-1 space-y-1">
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-bb-gray-600">{item.product_name} ({item.variant_name}) x{item.quantity}</span>
                    <span className="font-medium text-bb-black">{formatBRL(item.total)}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t pt-1 text-sm">
                  <span className="text-bb-gray-500">Frete</span>
                  <span className="text-bb-black">{selectedOrder.shipping_cost === 0 ? 'Retirada' : formatBRL(selectedOrder.shipping_cost)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-bb-black">Total</span>
                  <span className="text-bb-black">{formatBRL(selectedOrder.total)}</span>
                </div>
              </div>
            </div>

            {/* Tracking code */}
            {selectedOrder.tracking_code && (
              <div>
                <p className="text-xs font-medium text-bb-gray-400">Código de Rastreio</p>
                <p className="font-mono text-sm font-bold text-bb-black">{selectedOrder.tracking_code}</p>
              </div>
            )}

            {/* Actions */}
            {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
              <div className="space-y-3 border-t border-bb-gray-200 pt-4">
                <p className="text-xs font-medium text-bb-gray-400">Ações</p>

                {selectedOrder.status === 'paid' && (
                  <div className="space-y-2">
                    <input
                      placeholder="Código de rastreio (obrigatório)"
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                      className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
                    />
                    <Button
                      className="w-full"
                      onClick={() => handleStatusUpdate('shipped')}
                      disabled={actionLoading || !trackingInput}
                    >
                      {actionLoading ? <Spinner size="sm" /> : 'Marcar como Enviado'}
                    </Button>
                  </div>
                )}

                {selectedOrder.status === 'shipped' && (
                  <Button
                    className="w-full"
                    onClick={() => handleStatusUpdate('delivered')}
                    disabled={actionLoading}
                  >
                    {actionLoading ? <Spinner size="sm" /> : 'Marcar como Entregue'}
                  </Button>
                )}

                {(selectedOrder.status === 'pending' || selectedOrder.status === 'paid') && (
                  <Button
                    variant="danger"
                    className="w-full"
                    onClick={() => handleStatusUpdate('cancelled')}
                    disabled={actionLoading}
                  >
                    {actionLoading ? <Spinner size="sm" /> : 'Cancelar Pedido'}
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
    </PlanGate>
  );
}
