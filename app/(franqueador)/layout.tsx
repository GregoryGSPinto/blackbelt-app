'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BlackBeltLogo } from '@/components/brand/BlackBeltLogo';
import { NotificationBell } from '@/components/shared/NotificationBell';
import { CommandPalette } from '@/components/shared/CommandPalette';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { TourIntegration } from '@/components/tour/TourIntegration';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/lib/hooks/useAuth';

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
  const { profile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userMenuButtonRef = useRef<HTMLButtonElement>(null);

  const userName = profile?.display_name || 'Franqueador';

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Close user menu on click outside
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (
      userMenuRef.current &&
      !userMenuRef.current.contains(e.target as Node) &&
      userMenuButtonRef.current &&
      !userMenuButtonRef.current.contains(e.target as Node)
    ) {
      setUserMenuOpen(false);
    }
  }, []);

  useEffect(() => {
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [userMenuOpen, handleClickOutside]);

  async function handleLogout() {
    setUserMenuOpen(false);
    const { performLogout } = await import('@/lib/auth/logout');
    await performLogout();
  }

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
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col transition-transform lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:overflow-y-auto lg:translate-x-0 ${
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
          <BlackBeltLogo variant="navbar" height={28} />
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
            <button
              onClick={() => setSearchOpen(true)}
              className="rounded-lg p-2 transition-colors"
              style={{ color: 'var(--bb-ink-60)' }}
              aria-label="Buscar"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <NotificationBell />
            <ThemeToggle />

            {/* User Menu */}
            <div className="relative">
              <button
                ref={userMenuButtonRef}
                data-tour="profile-menu"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                aria-label="Menu do usuario"
                className="flex h-9 w-9 items-center justify-center cursor-pointer"
              >
                <Avatar name={userName} size="sm" />
              </button>

              {userMenuOpen && (
                <div
                  ref={userMenuRef}
                  className="absolute right-0 top-full mt-2 w-64 z-50 overflow-hidden"
                  style={{
                    background: 'var(--bb-depth-3)',
                    border: '1px solid var(--bb-glass-border)',
                    boxShadow: 'var(--bb-shadow-lg)',
                    borderRadius: 'var(--bb-radius-lg)',
                    animation: 'scaleIn 0.15s ease-out',
                    transformOrigin: 'top right',
                  }}
                >
                  <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                    <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                      {userName}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                      Franqueador
                    </p>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/franqueador/perfil"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                      style={{ color: 'var(--bb-ink-80)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bb-depth-4)'; e.currentTarget.style.color = 'var(--bb-ink-100)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--bb-ink-80)'; }}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      Meu Perfil
                    </Link>
                    <Link
                      href="/franqueador/configuracoes"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                      style={{ color: 'var(--bb-ink-80)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bb-depth-4)'; e.currentTarget.style.color = 'var(--bb-ink-100)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--bb-ink-80)'; }}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      Configuracoes
                    </Link>
                  </div>

                  <div style={{ borderTop: '1px solid var(--bb-glass-border)' }}>
                    <button
                      onClick={() => { setUserMenuOpen(false); sessionStorage.setItem('bb_profile_switch', '1'); window.location.href = '/selecionar-perfil'; }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                      style={{ color: 'var(--bb-ink-80)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bb-depth-4)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                      Trocar Perfil
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                      style={{ color: 'var(--bb-danger, var(--bb-brand))' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bb-depth-4)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
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

      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} hideToggle />

      {/* Tour overlay — auto-triggers on first access */}
      <TourIntegration />
    </div>
  );
}
