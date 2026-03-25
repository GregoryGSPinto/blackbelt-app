'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { MenuIcon, XIcon } from '@/components/shell/icons';

const NAV_LINKS = [
  { href: '/#funcionalidades', label: 'Funcionalidades' },
  { href: '/cadastrar-academia', label: 'Planos' },
  { href: '/#perfis', label: 'Perfis' },
  { href: '/#faq', label: 'FAQ' },
  { href: '/contato', label: 'Contato' },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bb-depth-1)', color: 'var(--bb-ink-100)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50 backdrop-blur-xl"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--bb-depth-1) 80%, transparent)',
          borderBottom: '1px solid var(--bb-glass-border)',
        }}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight sm:text-2xl">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-black text-white"
              style={{ background: 'var(--bb-brand-gradient)' }}
            >
              BB
            </span>
            <span>
              Black<span style={{ color: 'var(--bb-brand)' }}>Belt</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                style={{ color: pathname === link.href ? 'var(--bb-ink-100)' : 'var(--bb-ink-60)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--bb-ink-100)';
                  e.currentTarget.style.backgroundColor = 'var(--bb-glass)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = pathname === link.href ? 'var(--bb-ink-100)' : 'var(--bb-ink-60)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              style={{ color: 'var(--bb-ink-60)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--bb-ink-100)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--bb-ink-60)'; }}
            >
              Entrar
            </Link>
            <Link
              href="/cadastrar-academia"
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5"
              style={{
                background: 'var(--bb-brand-gradient)',
                boxShadow: 'var(--bb-shadow-md)',
              }}
            >
              Começar Grátis
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg md:hidden"
            style={{ color: 'var(--bb-ink-80)' }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {mobileOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </nav>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div
            className="animate-reveal border-t px-4 pb-6 pt-2 md:hidden"
            style={{ borderColor: 'var(--bb-glass-border)', backgroundColor: 'var(--bb-depth-2)' }}
          >
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm font-medium transition-colors"
                  style={{ color: 'var(--bb-ink-80)' }}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="my-2" style={{ borderColor: 'var(--bb-glass-border)' }} />
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-4 py-3 text-sm font-medium"
                style={{ color: 'var(--bb-ink-60)' }}
              >
                Entrar
              </Link>
              <Link
                href="/cadastrar-academia"
                onClick={() => setMobileOpen(false)}
                className="mt-1 rounded-xl px-4 py-3 text-center text-sm font-semibold text-white"
                style={{ background: 'var(--bb-brand-gradient)' }}
              >
                Começar Grátis
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Content */}
      {children}

      {/* Footer */}
      <footer
        className="border-t"
        style={{ borderColor: 'var(--bb-glass-border)', backgroundColor: 'var(--bb-depth-2)' }}
      >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {/* Brand */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-2 text-xl font-bold">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-md text-xs font-black text-white"
                  style={{ background: 'var(--bb-brand-gradient)' }}
                >
                  BB
                </span>
                Black<span style={{ color: 'var(--bb-brand)' }}>Belt</span>
              </Link>
              <p className="mt-3 max-w-sm text-sm" style={{ color: 'var(--bb-ink-40)' }}>
                Plataforma completa de gestão para academias de artes marciais.
                Do tatame ao financeiro, tudo em um só lugar.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>
                Produto
              </h4>
              <ul className="space-y-3">
                {[
                  { href: '/#funcionalidades', label: 'Funcionalidades' },
                  { href: '/cadastrar-academia', label: 'Planos e Preços' },
                  { href: '/#faq', label: 'FAQ' },
                  { href: '/status', label: 'Status' },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm transition-colors" style={{ color: 'var(--bb-ink-60)' }}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>
                Empresa
              </h4>
              <ul className="space-y-3">
                {[
                  { href: '/sobre', label: 'Sobre' },
                  { href: '/contato', label: 'Contato' },
                  { href: '/blog', label: 'Blog' },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm transition-colors" style={{ color: 'var(--bb-ink-60)' }}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>
                Legal
              </h4>
              <ul className="space-y-3">
                {[
                  { href: '/termos', label: 'Termos de Uso' },
                  { href: '/privacidade', label: 'Privacidade' },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm transition-colors" style={{ color: 'var(--bb-ink-60)' }}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row"
            style={{ borderColor: 'var(--bb-glass-border)' }}
          >
            <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>
              &copy; {new Date().getFullYear()} BlackBelt. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
