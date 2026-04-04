'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, Crown, Lightbulb, Server, TrendingUp } from 'lucide-react';

const TABS = [
  { href: '/cockpit/ceo', label: 'CEO', icon: Crown },
  { href: '/cockpit/cpo', label: 'CPO', icon: Lightbulb },
  { href: '/cockpit/cto', label: 'CTO', icon: Server },
  { href: '/cockpit/growth', label: 'Growth', icon: TrendingUp },
] as const;

export default function CockpitLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen" style={{ background: 'var(--bb-depth-1)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-30 px-4 sm:px-6 py-3"
        style={{
          background: 'var(--bb-depth-2)',
          borderBottom: '1px solid var(--bb-depth-1)',
        }}
      >
        <div className="flex items-center gap-3">
          <Link
            href="/superadmin"
            aria-label="Voltar ao Super Admin"
            className="flex items-center justify-center rounded-lg p-2 transition-colors"
            style={{ color: 'var(--bb-ink-2)' }}
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1
              className="text-lg font-bold leading-tight"
              style={{ color: 'var(--bb-ink-1)' }}
            >
              Cockpit
            </h1>
            <p
              className="text-xs"
              style={{ color: 'var(--bb-ink-3)' }}
            >
              Painel do Founder
            </p>
          </div>
        </div>
      </header>

      {/* Tab bar */}
      <nav
        aria-label="Abas do Cockpit"
        className="sticky top-[60px] z-20 overflow-x-auto"
        style={{
          background: 'var(--bb-depth-2)',
          borderBottom: '1px solid var(--bb-depth-1)',
        }}
      >
        <div className="flex min-w-max">
          {TABS.map((tab) => {
            const active = pathname.startsWith(tab.href);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-label={`Aba ${tab.label}`}
                className="relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors"
                style={{
                  color: active ? 'var(--bb-brand)' : 'var(--bb-ink-3)',
                }}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {active && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ background: 'var(--bb-brand)' }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Content */}
      <main>{children}</main>
    </div>
  );
}
