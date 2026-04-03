'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BlackBeltLogo } from '@/components/brand/BlackBeltLogo';

const NAV_LINKS = [
  { href: '#funcionalidades', label: 'Funcionalidades' },
  { href: '#precos', label: 'Preços' },
];

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handle, { passive: true });
    return () => window.removeEventListener('scroll', handle);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-3' : 'py-5'
      }`}
      style={{
        background: scrolled ? 'rgba(10, 10, 14, 0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'none',
        borderBottom: scrolled ? '1px solid var(--bb-glass-border)' : '1px solid transparent',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        <Link href="/">
          <BlackBeltLogo variant="navbar" height={28} />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm transition-colors duration-200"
              style={{ color: 'var(--bb-ink-60)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--bb-ink-100)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--bb-ink-60)'; }}
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/login"
            className="text-sm transition-colors duration-200"
            style={{ color: 'var(--bb-ink-60)' }}
          >
            Entrar
          </Link>
          <Link
            href="/cadastrar-academia"
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: '#C62828' }}
          >
            Cadastrar
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {menuOpen ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--bb-ink-200)" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="4" x2="16" y2="16" />
              <line x1="16" y1="4" x2="4" y2="16" />
            </svg>
          ) : (
            <div className="flex flex-col gap-1.5">
              <div className="w-5 h-0.5 rounded" style={{ background: 'var(--bb-ink-100)' }} />
              <div className="w-5 h-0.5 rounded" style={{ background: 'var(--bb-ink-100)' }} />
              <div className="w-5 h-0.5 rounded" style={{ background: 'var(--bb-ink-100)' }} />
            </div>
          )}
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden px-4 py-6 space-y-4" style={{ background: 'var(--bb-depth-2)' }}>
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block text-sm"
              style={{ color: 'var(--bb-ink-80)' }}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <Link href="/login" className="block text-sm" style={{ color: 'var(--bb-ink-60)' }} onClick={() => setMenuOpen(false)}>
            Entrar
          </Link>
          <Link
            href="/cadastrar-academia"
            className="block w-full text-center px-4 py-3 rounded-lg text-sm font-semibold text-white"
            style={{ background: '#C62828' }}
            onClick={() => setMenuOpen(false)}
          >
            Cadastrar academia
          </Link>
        </div>
      )}
    </nav>
  );
}
