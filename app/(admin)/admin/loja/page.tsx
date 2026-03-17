'use client';

import Link from 'next/link';
import { ShoppingBagIcon, PackageIcon, BarChartIcon } from '@/components/shell/icons';

const stats = [
  { label: 'Produtos', value: '24', icon: PackageIcon, href: '/admin/loja/produtos' },
  { label: 'Pedidos', value: '18', icon: ShoppingBagIcon, href: '/admin/loja/pedidos' },
  { label: 'Receita Loja', value: 'R$ 3.240', icon: BarChartIcon, href: '/admin/loja/pedidos' },
];

export default function LojaAdminPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>Loja</h1>
        <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          Gerencie produtos, pedidos e estoque da sua academia.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.label}
              href={s.href}
              className="flex items-center gap-4 rounded-xl border p-4 transition-transform hover:scale-[1.02]"
              style={{
                background: 'var(--bb-depth-2)',
                borderColor: 'var(--bb-glass-border)',
              }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ background: 'var(--bb-brand-surface)' }}
              >
                <Icon className="h-5 w-5" style={{ color: 'var(--bb-brand)' }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>{s.value}</p>
                <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>{s.label}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/loja/produtos"
          className="rounded-xl border p-6 transition-transform hover:scale-[1.02]"
          style={{ background: 'var(--bb-depth-2)', borderColor: 'var(--bb-glass-border)' }}
        >
          <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>Produtos</h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Gerencie kimonos, faixas, rashguards e acessórios.
          </p>
        </Link>
        <Link
          href="/admin/loja/pedidos"
          className="rounded-xl border p-6 transition-transform hover:scale-[1.02]"
          style={{ background: 'var(--bb-depth-2)', borderColor: 'var(--bb-glass-border)' }}
        >
          <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>Pedidos</h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Acompanhe pedidos pendentes e histórico de vendas.
          </p>
        </Link>
      </div>
    </div>
  );
}
