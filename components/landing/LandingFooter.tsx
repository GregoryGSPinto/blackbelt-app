'use client';

import Link from 'next/link';

const footerLinks = [
  { label: 'Termos de Uso', href: '/termos' },
  { label: 'Politica de Privacidade', href: '/privacidade' },
  { label: 'Suporte', href: '/ajuda' },
];

export function LandingFooter() {
  return (
    <footer
      className="px-6 py-10"
      style={{
        background: 'var(--bb-depth-0)',
        borderTop: '1px solid var(--bb-glass-border)',
      }}
    >
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4">
        <span
          className="text-lg font-extrabold tracking-tight"
          style={{
            color: 'var(--bb-brand)',
            letterSpacing: '-0.03em',
          }}
        >
          BLACKBELT
        </span>

        <nav className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs transition-colors duration-200 md:text-sm"
              style={{ color: 'var(--bb-ink-40)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--bb-ink-80)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--bb-ink-40)';
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p
          className="mt-2 text-xs"
          style={{ color: 'var(--bb-ink-20)' }}
        >
          2026 BlackBelt. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
