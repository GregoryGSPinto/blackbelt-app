'use client';

import Link from 'next/link';
import { useScrollReveal } from '@/lib/hooks/useScrollReveal';

export function CTAFinal() {
  const sectionRef = useScrollReveal();

  function handleScrollToTop() {
    const loginSection = document.getElementById('login-section');
    if (loginSection) {
      loginSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  return (
    <section
      ref={sectionRef}
      className="scroll-reveal flex flex-col items-center justify-center px-4 py-16 sm:px-6 md:py-24 lg:py-32"
      style={{
        background:
          'linear-gradient(180deg, var(--bb-depth-1) 0%, var(--bb-depth-2) 50%, var(--bb-depth-1) 100%)',
      }}
    >
      <h3
        className="text-center text-xl font-bold tracking-tight sm:text-2xl md:text-4xl"
        style={{ color: 'var(--bb-ink-100)' }}
      >
        Pronto para comecar sua jornada?
      </h3>

      <Link
        href="/cadastro"
        className="mt-10 inline-flex items-center justify-center rounded-xl px-10 py-4 text-base font-bold uppercase tracking-wider text-white transition-all duration-200 hover:-translate-y-0.5"
        style={{
          background: 'var(--bb-brand-gradient)',
          boxShadow: '0 4px 24px rgba(239, 68, 68, 0.25)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = 'var(--bb-brand-glow)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 24px rgba(239, 68, 68, 0.25)';
        }}
      >
        CRIAR MINHA CONTA
      </Link>

      <button
        type="button"
        onClick={handleScrollToTop}
        className="mt-6 border-none bg-transparent text-sm transition-colors duration-200"
        style={{
          color: 'var(--bb-ink-60)',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--bb-ink-100)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--bb-ink-60)';
        }}
      >
        Ja tem conta? <span style={{ textDecoration: 'underline' }}>Entrar</span>
      </button>
    </section>
  );
}
