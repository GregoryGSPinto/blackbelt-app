'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { MenuIcon, XIcon } from '@/components/shell/icons';
const NAV_LINKS = [
  { href: '/login', label: 'Entrar' },
  { href: '/cadastrar-academia', label: 'Cadastrar academia' },
  { href: '/contato', label: 'Contato' },
  { href: '/ajuda', label: 'Ajuda' },
  { href: '/termos', label: 'Termos' },
];

export default function PublicOperationalLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bb-depth-1)', color: 'var(--bb-ink-100)' }}>
      <header
        className="sticky top-0 z-50 backdrop-blur-xl"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--bb-depth-1) 80%, transparent)',
          borderBottom: '1px solid var(--bb-glass-border)',
        }}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/login" className="flex items-center gap-2 text-xl font-bold tracking-tight sm:text-2xl">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-black text-white"
              style={{ background: 'var(--bb-brand-gradient)' }}
            >
              BB
            </span>
            <span>
              Black<span style={{ color: 'var(--bb-brand)' }}>Belt</span> App
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                style={{ color: pathname === link.href ? 'var(--bb-ink-100)' : 'var(--bb-ink-60)' }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link href="/" className="rounded-lg px-4 py-2 text-sm font-medium" style={{ color: 'var(--bb-ink-60)' }}>
              Inicio
            </Link>
            <Link
              href="/login"
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5"
              style={{ background: 'var(--bb-brand-gradient)', boxShadow: 'var(--bb-shadow-md)' }}
            >
              Entrar
            </Link>
          </div>

          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg md:hidden"
            style={{ color: 'var(--bb-ink-80)' }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {mobileOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </nav>

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
                href="/"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-4 py-3 text-sm font-medium"
                style={{ color: 'var(--bb-ink-60)' }}
              >
                Inicio
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="mt-1 rounded-xl px-4 py-3 text-center text-sm font-semibold text-white"
                style={{ background: 'var(--bb-brand-gradient)' }}
              >
                Entrar
              </Link>
            </div>
          </div>
        )}
      </header>

      {children}

      <footer
        className="border-t"
        style={{ borderColor: 'var(--bb-glass-border)', backgroundColor: 'var(--bb-depth-2)' }}
      >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {/* Produto */}
            <div>
              <h4 className="mb-3 text-sm font-semibold" style={{ color: 'var(--bb-ink-80)' }}>Produto</h4>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--bb-ink-40)' }}>
                <li><Link href="/login" className="hover:underline">Entrar</Link></li>
                <li><Link href="/cadastrar-academia" className="hover:underline">Cadastrar academia</Link></li>
                <li><Link href="/changelog" className="hover:underline">Novidades</Link></li>
              </ul>
            </div>
            {/* Suporte */}
            <div>
              <h4 className="mb-3 text-sm font-semibold" style={{ color: 'var(--bb-ink-80)' }}>Suporte</h4>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--bb-ink-40)' }}>
                <li><Link href="/contato" className="hover:underline">Contato</Link></li>
                <li><Link href="/ajuda" className="hover:underline">Central de ajuda</Link></li>
              </ul>
            </div>
            {/* Legal */}
            <div>
              <h4 className="mb-3 text-sm font-semibold" style={{ color: 'var(--bb-ink-80)' }}>Legal</h4>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--bb-ink-40)' }}>
                <li><Link href="/termos" className="hover:underline">Termos de Uso</Link></li>
                <li><Link href="/privacidade" className="hover:underline">Privacidade</Link></li>
                <li><Link href="/excluir-conta" className="hover:underline">Excluir conta</Link></li>
              </ul>
            </div>
            {/* Institucional */}
            <div>
              <h4 className="mb-3 text-sm font-semibold" style={{ color: 'var(--bb-ink-80)' }}>Institucional</h4>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--bb-ink-40)' }}>
                <li><Link href="/" className="hover:underline">Inicio</Link></li>
              </ul>
            </div>
          </div>

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
