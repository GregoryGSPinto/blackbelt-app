'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BlackBeltLogo } from '@/components/brand/BlackBeltLogo';
import { NotificationBell } from '@/components/shared/NotificationBell';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { TourIntegration } from '@/components/tour/TourIntegration';

const sidebarItems: { href: string; label: string; id?: string }[] = [
  { href: '/franqueador', label: 'Dashboard', id: 'sidebar-link-dashboard-fr' },
  { href: '/franqueador/unidades', label: 'Unidades', id: 'sidebar-link-unidades' },
  { href: '/franqueador/curriculo', label: 'Curriculo', id: 'sidebar-link-curriculo' },
  { href: '/franqueador/padroes', label: 'Padronizacao', id: 'sidebar-link-padroes' },
  { href: '/franqueador/royalties', label: 'Royalties', id: 'sidebar-link-royalties' },
  { href: '/franqueador/expansao', label: 'Expansao', id: 'sidebar-link-expansao' },
  { href: '/franqueador/comunicacao', label: 'Comunicacao', id: 'sidebar-link-comunicacao' },
  { href: '/franqueador/perfil', label: 'Meu Perfil', id: 'sidebar-link-perfil-fr' },
  { href: '/franqueador/configuracoes', label: 'Configuracoes', id: 'sidebar-link-configuracoes-fr' },
];

export default function FranqueadorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bb-depth-1)' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - desktop always visible, mobile slide-in */}
      <aside
        data-tour="sidebar"
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'var(--bb-depth-2)',
          borderRight: '1px solid var(--bb-glass-border)',
        }}
      >
        <div
          className="flex h-14 items-center px-6"
          style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
        >
          <BlackBeltLogo variant="navbar" mode="dark" height={28} />
          <span className="ml-1 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
            Franqueador
          </span>

          {/* Close button on mobile */}
          <button
            className="ml-auto lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Fechar menu"
            style={{ color: 'var(--bb-ink-60)' }}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                id={item.id}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                style={{
                  background: isActive ? 'var(--bb-brand-surface)' : 'transparent',
                  color: isActive ? 'var(--bb-brand)' : 'var(--bb-ink-60)',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--bb-depth-3)';
                    e.currentTarget.style.color = 'var(--bb-ink-80)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--bb-ink-60)';
                  }
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Topbar */}
        <header
          className="sticky top-0 z-20 flex h-14 items-center justify-between px-4"
          style={{
            background: 'var(--bb-depth-2)',
            borderBottom: '1px solid var(--bb-glass-border)',
          }}
        >
          {/* Hamburger (mobile) */}
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu"
            style={{ color: 'var(--bb-ink-60)' }}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="hidden lg:block" />

          <div className="flex items-center gap-3">
            <NotificationBell />
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto" style={{ background: 'var(--bb-depth-1)' }}>
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
            </div>
          }>
            {children}
          </Suspense>
        </main>
      </div>

      {/* Tour overlay — auto-triggers on first access */}
      <TourIntegration />
    </div>
  );
}
