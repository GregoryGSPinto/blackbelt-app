'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { listProducts } from '@/lib/api/store.service';
import type { Product } from '@/lib/api/store.service';
import { listOrders, getStoreDashboard, type StoreDashboard } from '@/lib/api/admin-orders.service';
import type { Order } from '@/lib/api/orders.service';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  ShoppingBag, Package, AlertTriangle, TrendingUp,
  DollarSign, ClipboardList, Tag, Ruler, Star,
} from 'lucide-react';
import { PlanGate } from '@/components/plans/PlanGate';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

const STATUS_DOT_COLOR: Record<string, string> = {
  pending: '#f59e0b',
  paid: '#3b82f6',
  shipped: '#6366f1',
  delivered: '#22c55e',
  cancelled: '#ef4444',
};

export default function LojaAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [dashboard, setDashboard] = useState<StoreDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const academyId = getActiveAcademyId();
    Promise.all([
      listProducts(academyId),
      listOrders({ period: 'month' }),
      getStoreDashboard(),
    ])
      .then(([prods, ords, dash]) => {
        setProducts(prods);
        setOrders(ords);
        setDashboard(dash);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status === 'active').length;
  const lowStock = products.filter((p) => p.stock_total <= p.low_stock_alert && p.stock_total > 0).length;
  const outOfStock = products.filter((p) => p.stock_total === 0).length;
  const featuredProducts = products.filter((p) => p.featured || p.is_featured);
  const recentOrders = orders.slice(0, 5);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
        <Skeleton variant="text" className="h-8 w-32" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} variant="card" className="h-24" />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} variant="card" className="h-28" />
          ))}
        </div>
        <Skeleton variant="card" className="h-48" />
      </div>
    );
  }

  const statCards = [
    { label: 'Produtos', value: totalProducts, icon: Package, color: 'var(--bb-brand)', href: '/admin/loja/produtos' },
    { label: 'Ativos', value: activeProducts, icon: TrendingUp, color: '#22c55e', href: '/admin/loja/produtos' },
    { label: 'Estoque Baixo', value: lowStock, icon: AlertTriangle, color: '#f59e0b', href: '/admin/loja/produtos' },
    { label: 'Sem Estoque', value: outOfStock, icon: ShoppingBag, color: '#ef4444', href: '/admin/loja/produtos' },
  ];

  const dashCards = dashboard
    ? [
        { label: 'Pedidos do mes', value: String(dashboard.orders_month), icon: ClipboardList, color: '#3b82f6' },
        { label: 'Receita do mes', value: formatBRL(dashboard.revenue), icon: DollarSign, color: '#22c55e' },
      ]
    : [];

  return (
    <PlanGate module="loja">
      <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
            Loja
          </h1>
          <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Gerencie produtos, pedidos e estoque da sua academia.
          </p>
        </div>

        {/* Product stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.label}
                href={s.href}
                className="flex items-center gap-4 rounded-xl p-4 transition-transform hover:scale-[1.02]"
                style={{
                  background: 'var(--bb-depth-2)',
                  border: '1px solid var(--bb-glass-border)',
                }}
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ background: `${s.color}15` }}
                >
                  <Icon className="h-5 w-5" style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                    {s.value}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                    {s.label}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Dashboard KPI cards */}
        {dashCards.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {dashCards.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="flex items-center gap-4 rounded-xl p-4"
                  style={{
                    background: 'var(--bb-depth-2)',
                    border: '1px solid var(--bb-glass-border)',
                  }}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ background: `${s.color}15` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: s.color }} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                      {s.value}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                      {s.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Low stock alert */}
        {lowStock > 0 && (
          <div
            className="flex items-center gap-3 rounded-lg p-4"
            style={{ background: '#f59e0b10', border: '1px solid #f59e0b30' }}
          >
            <AlertTriangle className="h-5 w-5 flex-shrink-0" style={{ color: '#f59e0b' }} />
            <p className="text-sm" style={{ color: 'var(--bb-ink-80)' }}>
              {lowStock} {lowStock === 1 ? 'produto com' : 'produtos com'} estoque baixo.{' '}
              <Link
                href="/admin/loja/produtos"
                className="font-medium underline"
                style={{ color: '#f59e0b' }}
              >
                Ver detalhes
              </Link>
            </p>
          </div>
        )}

        {/* Recent orders */}
        {recentOrders.length > 0 && (
          <div
            className="rounded-xl p-4"
            style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                Pedidos Recentes
              </h2>
              <Link
                href="/admin/loja/pedidos"
                className="text-xs font-medium transition-colors"
                style={{ color: 'var(--bb-brand)' }}
              >
                Ver todos
              </Link>
            </div>
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href="/admin/loja/pedidos"
                  className="flex items-center justify-between rounded-lg p-2.5 transition-colors"
                  style={{ background: 'var(--bb-depth-3)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bb-depth-2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bb-depth-3)')}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="h-2 w-2 flex-shrink-0 rounded-full"
                      style={{ background: STATUS_DOT_COLOR[order.status] || '#888' }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--bb-ink-100)' }}>
                        {order.user_name}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                        {order.items.length} {order.items.length === 1 ? 'item' : 'itens'} — {formatDate(order.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{
                        background: `${STATUS_DOT_COLOR[order.status]}15`,
                        color: STATUS_DOT_COLOR[order.status],
                      }}
                    >
                      {STATUS_LABEL[order.status] || order.status}
                    </span>
                    <span className="text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                      {formatBRL(order.total)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Featured products */}
        {featuredProducts.length > 0 && (
          <div
            className="rounded-xl p-4"
            style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Star className="h-4 w-4" style={{ color: '#f59e0b' }} />
              <h2 className="text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                Produtos em Destaque
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {featuredProducts.slice(0, 6).map((p) => (
                <Link
                  key={p.id}
                  href="/admin/loja/produtos"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors"
                  style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--bb-brand)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--bb-glass-border)')}
                >
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded"
                    style={{ background: 'var(--bb-depth-2)' }}
                  >
                    {p.images[0] ? (
                      <img src={p.images[0]} alt="" className="h-8 w-8 rounded object-cover" />
                    ) : (
                      <Package className="h-4 w-4" style={{ color: 'var(--bb-ink-40)' }} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: 'var(--bb-ink-100)' }}>
                      {p.name}
                    </p>
                    <p className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>
                      {formatBRL(p.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick links */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/loja/produtos"
            className="rounded-xl p-5 transition-transform hover:scale-[1.02]"
            style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
          >
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5" style={{ color: 'var(--bb-brand)' }} />
              <h2 className="text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                Produtos
              </h2>
            </div>
            <p className="mt-1.5 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
              Kimonos, faixas, rashguards e acessorios.
            </p>
          </Link>
          <Link
            href="/admin/loja/pedidos"
            className="rounded-xl p-5 transition-transform hover:scale-[1.02]"
            style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-5 w-5" style={{ color: 'var(--bb-brand)' }} />
              <h2 className="text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                Pedidos
              </h2>
            </div>
            <p className="mt-1.5 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
              Pedidos pendentes e historico de vendas.
            </p>
          </Link>
          <Link
            href="/admin/loja/categorias"
            className="rounded-xl p-5 transition-transform hover:scale-[1.02]"
            style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
          >
            <div className="flex items-center gap-3">
              <Tag className="h-5 w-5" style={{ color: 'var(--bb-brand)' }} />
              <h2 className="text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                Categorias
              </h2>
            </div>
            <p className="mt-1.5 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
              Organize seus produtos em categorias.
            </p>
          </Link>
          <Link
            href="/admin/loja/tamanhos"
            className="rounded-xl p-5 transition-transform hover:scale-[1.02]"
            style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
          >
            <div className="flex items-center gap-3">
              <Ruler className="h-5 w-5" style={{ color: 'var(--bb-brand)' }} />
              <h2 className="text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                Guias de Tamanho
              </h2>
            </div>
            <p className="mt-1.5 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
              Ajude alunos a escolher o tamanho certo.
            </p>
          </Link>
        </div>
      </div>
    </PlanGate>
  );
}
