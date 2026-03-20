'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { listProducts } from '@/lib/api/store.service';
import type { Product } from '@/lib/api/store.service';
import { Skeleton } from '@/components/ui/Skeleton';
import { ShoppingBag, Package, AlertTriangle, TrendingUp } from 'lucide-react';
import { PlanGate } from '@/components/plans/PlanGate';

export default function LojaAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listProducts('academy-1')
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status === 'active').length;
  const lowStock = products.filter((p) => p.stock_total <= p.low_stock_alert && p.stock_total > 0).length;
  const outOfStock = products.filter((p) => p.stock_total === 0).length;

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
        <Skeleton variant="text" className="h-8 w-32" />
        <div className="grid gap-4 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} variant="card" className="h-24" />)}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton variant="card" className="h-28" />
          <Skeleton variant="card" className="h-28" />
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Produtos', value: totalProducts, icon: Package, color: 'var(--bb-brand)', href: '/admin/loja/produtos' },
    { label: 'Ativos', value: activeProducts, icon: TrendingUp, color: '#22c55e', href: '/admin/loja/produtos' },
    { label: 'Estoque Baixo', value: lowStock, icon: AlertTriangle, color: '#f59e0b', href: '/admin/loja/produtos' },
    { label: 'Sem Estoque', value: outOfStock, icon: ShoppingBag, color: '#ef4444', href: '/admin/loja/produtos' },
  ];

  return (
    <PlanGate module="loja">
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>Loja</h1>
        <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          Gerencie produtos, pedidos e estoque da sua academia.
        </p>
      </div>

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
                <p className="text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>{s.value}</p>
                <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>{s.label}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {lowStock > 0 && (
        <div
          className="flex items-center gap-3 rounded-lg p-4"
          style={{ background: '#f59e0b10', border: '1px solid #f59e0b30' }}
        >
          <AlertTriangle className="h-5 w-5 flex-shrink-0" style={{ color: '#f59e0b' }} />
          <p className="text-sm" style={{ color: 'var(--bb-ink-80)' }}>
            {lowStock} {lowStock === 1 ? 'produto com' : 'produtos com'} estoque baixo.{' '}
            <Link href="/admin/loja/produtos" className="font-medium underline" style={{ color: '#f59e0b' }}>
              Ver detalhes
            </Link>
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/loja/produtos"
          className="rounded-xl p-6 transition-transform hover:scale-[1.02]"
          style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
        >
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6" style={{ color: 'var(--bb-brand)' }} />
            <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>Produtos</h2>
          </div>
          <p className="mt-2 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Gerencie kimonos, faixas, rashguards e acessórios.
          </p>
        </Link>
        <Link
          href="/admin/loja/pedidos"
          className="rounded-xl p-6 transition-transform hover:scale-[1.02]"
          style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
        >
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-6 w-6" style={{ color: 'var(--bb-brand)' }} />
            <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>Pedidos</h2>
          </div>
          <p className="mt-2 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Acompanhe pedidos pendentes e histórico de vendas.
          </p>
        </Link>
      </div>
    </div>
    </PlanGate>
  );
}
