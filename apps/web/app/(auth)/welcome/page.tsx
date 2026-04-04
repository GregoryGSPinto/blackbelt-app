'use client';

import Link from 'next/link';

const ENTRY_OPTIONS = [
  { icon: '🥋', title: 'Sou Academia', desc: 'Criar minha academia no BlackBelt', href: '/cadastro' },
  { icon: '👤', title: 'Sou Aluno', desc: 'Buscar minha academia e me matricular', href: '/buscar-academia' },
  { icon: '👨‍👩‍👧', title: 'Sou Responsavel', desc: 'Acompanhar meu(s) filho(s)', href: '/buscar-academia?role=responsavel' },
  { icon: '📨', title: 'Tenho Convite', desc: 'Ativar meu codigo de convite', href: '/login?invite=true' },
];

export default function WelcomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold" style={{ color: 'var(--bb-ink-100)' }}>
            BlackBelt
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Gestao completa para academias de artes marciais
          </p>
        </div>

        <div className="space-y-3">
          {ENTRY_OPTIONS.map((opt) => (
            <Link
              key={opt.href}
              href={opt.href}
              className="flex items-center gap-4 rounded-xl p-4 transition-all hover:scale-[1.01]"
              style={{ background: 'var(--bb-depth-1)', border: '1px solid var(--bb-glass-border)' }}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-lg text-2xl" style={{ background: 'var(--bb-depth-2)' }}>
                {opt.icon}
              </span>
              <div className="flex-1">
                <p className="text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>{opt.title}</p>
                <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>{opt.desc}</p>
              </div>
              <span style={{ color: 'var(--bb-ink-40)' }}>→</span>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/login"
            className="text-sm font-medium"
            style={{ color: 'var(--bb-brand)' }}
          >
            Ja tenho conta? Fazer login
          </Link>
        </div>
      </div>
    </div>
  );
}
