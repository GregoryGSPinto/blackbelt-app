'use client';

import { useState } from 'react';
import Link from 'next/link';

const PLANS = [
  {
    name: 'Starter',
    monthlyPrice: 97,
    annualPrice: 77,
    limits: { alunos: 50, profs: 3, turmas: 5, storage: '5 GB' },
    modules: ['Turmas', 'Presença', 'Comunicados'],
    missingModules: ['Streaming', 'Financeiro avançado', 'Graduação automática', 'Analytics', 'Loja'],
    support: 'Email',
    overage: 'R$ 2,50/aluno',
    cta: 'Começar Trial',
    highlight: false,
  },
  {
    name: 'Essencial',
    monthlyPrice: 197,
    annualPrice: 157,
    limits: { alunos: 150, profs: 8, turmas: 15, storage: '20 GB' },
    modules: ['Turmas', 'Presença', 'Comunicados', 'Streaming', 'Financeiro básico'],
    missingModules: ['Graduação automática', 'Analytics avançado', 'Loja', 'Multi-filial'],
    support: 'Email + Chat',
    overage: 'R$ 2,00/aluno',
    cta: 'Começar Trial',
    highlight: false,
  },
  {
    name: 'Pro',
    monthlyPrice: 347,
    annualPrice: 277,
    limits: { alunos: 200, profs: 15, turmas: 30, storage: '50 GB' },
    modules: ['Turmas', 'Presença', 'Comunicados', 'Streaming', 'Financeiro completo', 'Graduação', 'Analytics'],
    missingModules: ['Loja', 'Multi-filial'],
    support: 'Email + Chat + WhatsApp',
    overage: 'R$ 1,90/aluno',
    cta: 'Começar Trial',
    highlight: true,
  },
  {
    name: 'Black Belt',
    monthlyPrice: 597,
    annualPrice: 477,
    limits: { alunos: 'Ilimitado', profs: 'Ilimitado', turmas: 'Ilimitado', storage: '200 GB' },
    modules: ['Turmas', 'Presença', 'Comunicados', 'Streaming', 'Financeiro completo', 'Graduação', 'Analytics', 'Loja', 'Multi-filial'],
    missingModules: [],
    support: 'Prioritário + WhatsApp + Onboarding dedicado',
    overage: 'N/A',
    cta: 'Começar Trial',
    highlight: false,
  },
  {
    name: 'Enterprise',
    monthlyPrice: 0,
    annualPrice: 0,
    limits: { alunos: 'Custom', profs: 'Custom', turmas: 'Custom', storage: 'Custom' },
    modules: ['Tudo do Black Belt', 'SSO', 'API dedicada', 'SLA 99.9%', 'White-label'],
    missingModules: [],
    support: 'Gerente de conta dedicado',
    overage: 'Custom',
    cta: 'Falar com Vendas',
    highlight: false,
  },
];

const BILLING_FAQ = [
  { q: 'Quanto tempo dura o trial?', a: '7 dias com acesso Black Belt completo. Sem cartão de crédito.' },
  { q: 'Como funciona o cancelamento?', a: 'Cancele a qualquer momento pelo painel. Sem multa ou fidelidade.' },
  { q: 'Posso fazer upgrade/downgrade?', a: 'Sim, a qualquer momento. O valor é ajustado proporcionalmente.' },
  { q: 'O que acontece se eu exceder o limite de alunos?', a: 'Você paga um valor por aluno excedente, cobrado na próxima fatura.' },
  { q: 'Vocês emitem nota fiscal?', a: 'Sim. NF-e emitida automaticamente após cada pagamento confirmado.' },
  { q: 'Quais formas de pagamento aceitam?', a: 'Cartão de crédito, PIX e boleto bancário.' },
  { q: 'Existe desconto para pagamento anual?', a: 'Sim! 20% de desconto no pagamento anual de todos os planos.' },
  { q: 'Posso testar o plano Enterprise?', a: 'Sim, entre em contato para agendar uma demo personalizada.' },
];

export default function PrecosPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bb-depth-1)', color: 'var(--bb-ink-100)' }}>
      {/* Nav */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/landing" className="text-2xl font-bold">
          Black<span style={{ color: 'var(--bb-brand)' }}>Belt</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>Login</Link>
          <Link
            href="/cadastrar-academia"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
            style={{ background: 'var(--bb-brand)' }}
          >
            Começar Trial
          </Link>
        </div>
      </nav>

      {/* Header */}
      <section className="mx-auto max-w-7xl px-6 py-16 text-center">
        <h1 className="text-4xl font-extrabold sm:text-5xl">Planos e Preços</h1>
        <p className="mx-auto mt-4 max-w-xl" style={{ color: 'var(--bb-ink-60)' }}>
          Escolha o plano ideal para sua academia. Comece com 7 dias grátis.
        </p>

        {/* Toggle */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <span className={`text-sm font-medium ${!annual ? '' : ''}`} style={{ color: !annual ? 'var(--bb-ink-100)' : 'var(--bb-ink-40)' }}>
            Mensal
          </span>
          <button
            onClick={() => setAnnual(!annual)}
            className="relative h-7 w-12 rounded-full transition-colors"
            style={{ background: annual ? 'var(--bb-brand)' : 'var(--bb-depth-4)' }}
          >
            <span
              className="absolute top-0.5 h-6 w-6 rounded-full transition-transform"
              style={{
                background: 'white',
                left: annual ? '1.375rem' : '0.125rem',
              }}
            />
          </button>
          <span className="text-sm font-medium" style={{ color: annual ? 'var(--bb-ink-100)' : 'var(--bb-ink-40)' }}>
            Anual <span className="rounded-full px-2 py-0.5 text-xs font-bold text-white" style={{ background: 'var(--bb-brand)' }}>-20%</span>
          </span>
        </div>
      </section>

      {/* Trial banner */}
      <div
        className="mx-auto mb-8 max-w-4xl rounded-xl border px-6 py-3 text-center text-sm font-medium"
        style={{ borderColor: 'var(--bb-brand)', background: 'var(--bb-depth-2)', color: 'var(--bb-ink-80)' }}
      >
        🥋 7 dias grátis com acesso Black Belt completo. Sem cartão de crédito.
      </div>

      {/* Plans */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-6 lg:grid-cols-5">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className="relative flex flex-col rounded-2xl border p-6"
              style={{
                borderColor: plan.highlight ? 'var(--bb-brand)' : 'var(--bb-glass-border)',
                background: plan.highlight ? 'var(--bb-depth-3)' : 'var(--bb-depth-2)',
              }}
            >
              {plan.highlight && (
                <span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-bold text-white"
                  style={{ background: 'var(--bb-brand)' }}
                >
                  MAIS POPULAR
                </span>
              )}

              <h3 className="text-lg font-bold">{plan.name}</h3>

              <div className="mt-3">
                {plan.monthlyPrice > 0 ? (
                  <>
                    <span className="text-3xl font-extrabold">
                      R$ {annual ? plan.annualPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>/mês</span>
                    {annual && (
                      <p className="mt-1 text-xs" style={{ color: 'var(--bb-brand)' }}>
                        Economia de R$ {(plan.monthlyPrice - plan.annualPrice) * 12}/ano
                      </p>
                    )}
                  </>
                ) : (
                  <span className="text-2xl font-bold">Sob consulta</span>
                )}
              </div>

              {/* Limits */}
              <div className="mt-4 space-y-1.5 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                <p>Alunos: <span className="font-medium" style={{ color: 'var(--bb-ink-80)' }}>{plan.limits.alunos}</span></p>
                <p>Professores: <span className="font-medium" style={{ color: 'var(--bb-ink-80)' }}>{plan.limits.profs}</span></p>
                <p>Turmas: <span className="font-medium" style={{ color: 'var(--bb-ink-80)' }}>{plan.limits.turmas}</span></p>
                <p>Storage: <span className="font-medium" style={{ color: 'var(--bb-ink-80)' }}>{plan.limits.storage}</span></p>
              </div>

              {/* Modules */}
              <div className="mt-4 flex-1">
                <p className="mb-2 text-xs font-semibold" style={{ color: 'var(--bb-ink-40)' }}>MÓDULOS</p>
                <ul className="space-y-1.5">
                  {plan.modules.map((m) => (
                    <li key={m} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--bb-ink-80)' }}>
                      <span style={{ color: 'var(--bb-brand)' }}>✓</span> {m}
                    </li>
                  ))}
                  {plan.missingModules.map((m) => (
                    <li key={m} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                      <span>✗</span> {m}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Support + Overage */}
              <div className="mt-4 space-y-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                <p>Suporte: {plan.support}</p>
                <p>Excedente: {plan.overage}</p>
              </div>

              {/* CTA */}
              <Link
                href={plan.cta === 'Falar com Vendas' ? '/contato' : '/cadastrar-academia'}
                className="mt-6 block rounded-lg py-3 text-center text-sm font-semibold transition-opacity hover:opacity-90"
                style={{
                  background: plan.highlight ? 'var(--bb-brand)' : 'var(--bb-depth-4)',
                  color: plan.highlight ? 'white' : 'var(--bb-ink-80)',
                }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Billing FAQ */}
      <section className="mx-auto max-w-3xl px-6 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold">Dúvidas sobre pagamento</h2>
        <div className="space-y-4">
          {BILLING_FAQ.map((item) => (
            <details
              key={item.q}
              className="group rounded-xl border"
              style={{ borderColor: 'var(--bb-glass-border)', background: 'var(--bb-depth-2)' }}
            >
              <summary className="flex cursor-pointer items-center justify-between p-4 font-medium">
                {item.q}
                <span className="transition-transform group-open:rotate-45" style={{ color: 'var(--bb-ink-40)' }}>+</span>
              </summary>
              <p className="px-4 pb-4 text-sm" style={{ color: 'var(--bb-ink-60)' }}>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-8 text-center text-sm" style={{ borderColor: 'var(--bb-glass-border)', color: 'var(--bb-ink-40)' }}>
        <p>&copy; 2026 BlackBelt. <Link href="/termos">Termos</Link> · <Link href="/privacidade">Privacidade</Link></p>
      </footer>
    </div>
  );
}
