import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Convite Beta',
  description: 'Voce foi convidado para o Beta do BlackBelt!',
};

export default function BetaInvitePage() {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-12"
      style={{ background: 'var(--bb-depth-1)' }}
    >
      <div className="w-full max-w-lg text-center">
        {/* Logo */}
        <div
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ background: 'linear-gradient(135deg, #C62828, #e53935)' }}
        >
          <span className="text-2xl font-black text-white">B</span>
        </div>

        {/* Title */}
        <h1 className="mb-2 text-3xl font-black" style={{ color: 'var(--bb-ink-100)' }}>
          Voce foi convidado para o Beta do BlackBelt!
        </h1>
        <p className="mb-8 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          O BlackBelt e a plataforma completa de gestao para academias de artes marciais. Voce foi selecionado como um dos primeiros a testar.
        </p>

        {/* Benefits */}
        <div
          className="mb-8 rounded-2xl p-6 text-left"
          style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
        >
          <h2 className="mb-4 text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>O que esta incluido:</h2>
          <ul className="space-y-3">
            {[
              'Acesso Pro completo — todas as funcionalidades',
              'Suporte direto com o fundador via WhatsApp',
              'Desconto vitalicio de 50% apos o beta',
              'Sua opiniao moldando o produto',
            ].map(item => (
              <li key={item} className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth={2}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-sm" style={{ color: 'var(--bb-ink-80)' }}>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* What we expect */}
        <div
          className="mb-8 rounded-2xl p-6 text-left"
          style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
        >
          <h2 className="mb-4 text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>O que esperamos:</h2>
          <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Use o sistema normalmente e nos de feedback honesto. Bugs, sugestoes, elogios — tudo ajuda. Tem um botaozinho de feedback dentro do app que torna super facil.
          </p>
        </div>

        {/* CTA */}
        <Link
          href="/cadastrar-academia"
          className="inline-flex items-center justify-center rounded-xl px-8 py-4 text-lg font-bold text-white transition-transform hover:scale-105 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #C62828, #e53935)' }}
        >
          Comecar agora
        </Link>

        {/* Footer */}
        <p className="mt-8 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
          Duvidas? Fale direto comigo no{' '}
          <a
            href="https://wa.me/5531996793625"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
            style={{ color: '#22c55e' }}
          >
            WhatsApp
          </a>
        </p>
      </div>
    </div>
  );
}
