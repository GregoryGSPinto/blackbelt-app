'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Check,
  X as XIcon,
  ChevronDown,
  Zap,
  ArrowLeft,
} from 'lucide-react';

/* ──────────────────────────────────────────────────────────────
   Types
   ────────────────────────────────────────────────────────────── */

interface Plan {
  name: string;
  monthlyPrice: number | null; // null = consulta
  description: string;
  cta: string;
  ctaLink: string;
  highlighted: boolean;
}

interface FeatureRow {
  label: string;
  starter: string | boolean;
  essencial: string | boolean;
  pro: string | boolean;
  blackBelt: string | boolean;
  enterprise: string | boolean;
}

interface FAQItem {
  q: string;
  a: string;
}

/* ──────────────────────────────────────────────────────────────
   Data
   ────────────────────────────────────────────────────────────── */

const PLANS: Plan[] = [
  {
    name: 'Starter',
    monthlyPrice: 97,
    description: 'Para academias em inicio ou com ate 50 alunos.',
    cta: 'Comecar Trial',
    ctaLink: '/onboarding',
    highlighted: false,
  },
  {
    name: 'Essencial',
    monthlyPrice: 197,
    description: 'Para academias em crescimento que precisam de automacao.',
    cta: 'Comecar Trial',
    ctaLink: '/onboarding',
    highlighted: false,
  },
  {
    name: 'Pro',
    monthlyPrice: 347,
    description: 'Para academias consolidadas que querem escalar.',
    cta: 'Comecar Trial',
    ctaLink: '/onboarding',
    highlighted: true,
  },
  {
    name: 'Black Belt',
    monthlyPrice: 597,
    description: 'Para redes e academias de alta performance.',
    cta: 'Comecar Trial',
    ctaLink: '/onboarding',
    highlighted: false,
  },
  {
    name: 'Enterprise',
    monthlyPrice: null,
    description: 'Para franquias e redes com necessidades customizadas.',
    cta: 'Falar com Vendas',
    ctaLink: '/contato',
    highlighted: false,
  },
];

const FEATURE_CATEGORIES: { category: string; rows: FeatureRow[] }[] = [
  {
    category: 'Limites',
    rows: [
      { label: 'Alunos', starter: 'Ate 50', essencial: 'Ate 150', pro: 'Ate 500', blackBelt: 'Ilimitados', enterprise: 'Ilimitados' },
      { label: 'Unidades', starter: '1', essencial: '1', pro: 'Ate 3', blackBelt: 'Ate 10', enterprise: 'Ilimitadas' },
      { label: 'Professores', starter: '2', essencial: '5', pro: '15', blackBelt: 'Ilimitados', enterprise: 'Ilimitados' },
      { label: 'Armazenamento', starter: '5 GB', essencial: '20 GB', pro: '100 GB', blackBelt: '500 GB', enterprise: 'Ilimitado' },
    ],
  },
  {
    category: 'Modulos',
    rows: [
      { label: 'Check-in & presenca', starter: true, essencial: true, pro: true, blackBelt: true, enterprise: true },
      { label: 'Gestao de turmas', starter: true, essencial: true, pro: true, blackBelt: true, enterprise: true },
      { label: 'Graduacoes & faixas', starter: true, essencial: true, pro: true, blackBelt: true, enterprise: true },
      { label: 'App para alunos', starter: 'Basico', essencial: true, pro: true, blackBelt: true, enterprise: true },
      { label: 'Cobrancas automaticas', starter: false, essencial: true, pro: true, blackBelt: true, enterprise: true },
      { label: 'Relatorios financeiros', starter: false, essencial: 'Basico', pro: true, blackBelt: true, enterprise: true },
      { label: 'Chat professor-aluno', starter: false, essencial: true, pro: true, blackBelt: true, enterprise: true },
      { label: 'Streaming de aulas', starter: false, essencial: false, pro: true, blackBelt: true, enterprise: true },
      { label: 'IA & insights', starter: false, essencial: false, pro: true, blackBelt: true, enterprise: true },
      { label: 'WhatsApp integrado', starter: false, essencial: false, pro: true, blackBelt: true, enterprise: true },
      { label: 'Multi-perfil (Teen, Kids)', starter: false, essencial: false, pro: true, blackBelt: true, enterprise: true },
      { label: 'API aberta', starter: false, essencial: false, pro: false, blackBelt: true, enterprise: true },
      { label: 'Campeonatos', starter: false, essencial: false, pro: false, blackBelt: true, enterprise: true },
      { label: 'Marketplace', starter: false, essencial: false, pro: false, blackBelt: true, enterprise: true },
      { label: 'SSO corporativo', starter: false, essencial: false, pro: false, blackBelt: false, enterprise: true },
      { label: 'Integracao customizada', starter: false, essencial: false, pro: false, blackBelt: false, enterprise: true },
    ],
  },
  {
    category: 'Suporte',
    rows: [
      { label: 'Canal de suporte', starter: 'Email', essencial: 'Email + Chat', pro: 'Prioritario', blackBelt: '24/7 dedicado', enterprise: 'Gerente de conta' },
      { label: 'Tempo de resposta', starter: '48h', essencial: '24h', pro: '4h', blackBelt: '1h', enterprise: 'Imediato' },
      { label: 'Onboarding assistido', starter: false, essencial: true, pro: true, blackBelt: true, enterprise: 'Dedicado' },
      { label: 'SLA garantido', starter: false, essencial: false, pro: '99.5%', blackBelt: '99.9%', enterprise: '99.99%' },
    ],
  },
  {
    category: 'Excedentes',
    rows: [
      { label: 'Aluno excedente', starter: 'R$ 3/aluno', essencial: 'R$ 2,50/aluno', pro: 'R$ 2/aluno', blackBelt: 'N/A', enterprise: 'Negociavel' },
      { label: 'Unidade excedente', starter: 'N/A', essencial: 'N/A', pro: 'R$ 80/unidade', blackBelt: 'R$ 60/unidade', enterprise: 'Negociavel' },
      { label: 'Armazenamento extra', starter: 'R$ 5/GB', essencial: 'R$ 4/GB', pro: 'R$ 3/GB', blackBelt: 'R$ 2/GB', enterprise: 'Incluso' },
    ],
  },
];

const FAQ_ITEMS: FAQItem[] = [
  {
    q: 'Como funciona o periodo de trial?',
    a: 'Voce tem 7 dias de acesso gratuito com todas as funcionalidades do plano Black Belt. Nao pedimos cartao de credito. Ao final, voce escolhe o plano ideal e comeca a pagar.',
  },
  {
    q: 'Posso trocar de plano a qualquer momento?',
    a: 'Sim. Upgrade e imediato e o valor e proporcional. Downgrade acontece no proximo ciclo de cobranca. Sem taxas ou multas.',
  },
  {
    q: 'Quais formas de pagamento sao aceitas?',
    a: 'PIX, cartao de credito (Visa, Mastercard, Elo, Amex), boleto bancario e debito automatico. Planos anuais tem desconto de 20%.',
  },
  {
    q: 'O que acontece se eu cancelar?',
    a: 'Seus dados ficam disponiveis por 90 dias apos o cancelamento. Voce pode exportar tudo a qualquer momento. Nao ha multa de cancelamento.',
  },
  {
    q: 'Como funciona a cobranca anual?',
    a: 'No plano anual, voce paga 12 meses com 20% de desconto. O pagamento pode ser parcelado em ate 12x no cartao ou a vista com PIX/boleto.',
  },
  {
    q: 'Existe taxa sobre transacoes financeiras?',
    a: 'Nao cobramos taxa sobre os pagamentos que sua academia recebe dos alunos. As taxas de gateway (PIX, cartao, boleto) sao as padroes do mercado.',
  },
  {
    q: 'Tenho desconto para multiplas unidades?',
    a: 'Sim. A partir de 3 unidades, oferecemos desconto progressivo. Entre em contato com nosso time comercial para uma proposta personalizada.',
  },
  {
    q: 'Preciso pagar por usuario adicional?',
    a: 'Nao. O limite e por alunos ativos, nao por usuarios do sistema. Administradores, professores e responsaveis nao contam no limite de alunos.',
  },
];

/* ──────────────────────────────────────────────────────────────
   Helper components
   ────────────────────────────────────────────────────────────── */

function CellValue({ value }: { value: string | boolean }) {
  if (value === true) {
    return (
      <Check
        className="mx-auto h-4 w-4"
        style={{ color: 'var(--bb-success)' }}
      />
    );
  }
  if (value === false) {
    return (
      <XIcon
        className="mx-auto h-4 w-4"
        style={{ color: 'var(--bb-ink-20)' }}
      />
    );
  }
  return (
    <span className="text-xs" style={{ color: 'var(--bb-ink-80)' }}>
      {value}
    </span>
  );
}

function Accordion({ item }: { item: FAQItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="overflow-hidden rounded-[var(--bb-radius-lg)] border transition-colors"
      style={{
        borderColor: open ? 'var(--bb-brand)' : 'var(--bb-glass-border)',
        backgroundColor: 'var(--bb-depth-2)',
      }}
    >
      <button
        type="button"
        className="flex w-full items-center justify-between p-5 text-left font-medium transition-colors"
        style={{ color: 'var(--bb-ink-100)' }}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span>{item.q}</span>
        <ChevronDown
          className="h-5 w-5 shrink-0 transition-transform duration-300"
          style={{
            color: 'var(--bb-ink-40)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{
          maxHeight: open ? '200px' : '0px',
          opacity: open ? 1 : 0,
        }}
      >
        <p
          className="px-5 pb-5 text-sm leading-relaxed"
          style={{ color: 'var(--bb-ink-60)' }}
        >
          {item.a}
        </p>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Pricing Page
   ────────────────────────────────────────────────────────────── */

export default function PrecosPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  function formatPrice(monthly: number | null): string {
    if (monthly === null) return 'Sob consulta';
    const value = isAnnual ? Math.round(monthly * 0.8) : monthly;
    return `R$ ${value}`;
  }

  function getPeriod(monthly: number | null): string {
    if (monthly === null) return '';
    return isAnnual ? '/mes (anual)' : '/mes';
  }

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: 'var(--bb-depth-1)',
        color: 'var(--bb-ink-100)',
      }}
    >
      {/* ── Nav ────────────────────────────────────────────── */}
      <nav
        className="border-b"
        style={{
          borderColor: 'var(--bb-glass-border)',
          backgroundColor: 'var(--bb-depth-2)',
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link
              href="/landing"
              className="flex items-center gap-1 text-sm transition-colors hover:opacity-80"
              style={{ color: 'var(--bb-ink-60)' }}
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
            <Link href="/landing" className="text-2xl font-bold">
              Black<span style={{ color: 'var(--bb-brand)' }}>Belt</span>
            </Link>
          </div>
          <Link
            href="/login"
            className="text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: 'var(--bb-ink-60)' }}
          >
            Login
          </Link>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-5 pb-6 pt-12 text-center sm:px-6 sm:pt-20">
        <div className="animate-reveal">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
            Planos e Precos
          </h1>
          <p
            className="mx-auto mt-4 max-w-xl text-lg"
            style={{ color: 'var(--bb-ink-60)' }}
          >
            Escolha o plano ideal para a sua academia. Todos incluem 7 dias de
            trial gratuito.
          </p>

          {/* Toggle Mensal/Anual */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span
              className="text-sm font-medium"
              style={{ color: isAnnual ? 'var(--bb-ink-40)' : 'var(--bb-ink-100)' }}
            >
              Mensal
            </span>
            <button
              type="button"
              className="relative h-7 w-14 rounded-full transition-colors duration-300"
              style={{
                backgroundColor: isAnnual ? 'var(--bb-brand)' : 'var(--bb-depth-5)',
              }}
              onClick={() => setIsAnnual(!isAnnual)}
              aria-label={isAnnual ? 'Mudar para mensal' : 'Mudar para anual'}
            >
              <span
                className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-300"
                style={{
                  transform: isAnnual ? 'translateX(30px)' : 'translateX(2px)',
                }}
              />
            </button>
            <span
              className="text-sm font-medium"
              style={{ color: isAnnual ? 'var(--bb-ink-100)' : 'var(--bb-ink-40)' }}
            >
              Anual
            </span>
            {isAnnual && (
              <span
                className="ml-1 rounded-[var(--bb-radius-full)] px-2.5 py-0.5 text-xs font-bold"
                style={{
                  backgroundColor: 'var(--bb-success-surface)',
                  color: 'var(--bb-success)',
                }}
              >
                -20%
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ── Plan Cards ─────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5" data-stagger>
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className="relative flex flex-col rounded-[var(--bb-radius-xl)] border p-6 transition-all duration-300"
              style={{
                borderColor: plan.highlighted ? 'var(--bb-brand)' : 'var(--bb-glass-border)',
                backgroundColor: 'var(--bb-depth-2)',
                boxShadow: plan.highlighted ? 'var(--bb-brand-glow)' : 'var(--bb-shadow-sm)',
                transform: plan.highlighted ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              {plan.highlighted && (
                <span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[var(--bb-radius-full)] px-4 py-1 text-xs font-bold text-white"
                  style={{ backgroundColor: 'var(--bb-brand)' }}
                >
                  MAIS POPULAR
                </span>
              )}

              <h3 className="text-lg font-bold">{plan.name}</h3>
              <p
                className="mt-1 text-xs leading-relaxed"
                style={{ color: 'var(--bb-ink-40)' }}
              >
                {plan.description}
              </p>

              <p className="mt-4">
                <span className="text-3xl font-extrabold">
                  {formatPrice(plan.monthlyPrice)}
                </span>
                <span
                  className="ml-1 text-sm"
                  style={{ color: 'var(--bb-ink-40)' }}
                >
                  {getPeriod(plan.monthlyPrice)}
                </span>
              </p>

              {isAnnual && plan.monthlyPrice !== null && (
                <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                  <span className="line-through">R$ {plan.monthlyPrice}/mes</span>
                  {' '}
                  <span style={{ color: 'var(--bb-success)' }}>
                    economia de R$ {Math.round(plan.monthlyPrice * 0.2 * 12)}/ano
                  </span>
                </p>
              )}

              <div className="mt-auto pt-6">
                <Link
                  href={plan.ctaLink}
                  className="block rounded-[var(--bb-radius-md)] py-3 text-center text-sm font-semibold transition-opacity hover:opacity-90"
                  style={{
                    background: plan.highlighted ? 'var(--bb-brand-gradient)' : 'var(--bb-depth-4)',
                    color: plan.highlighted ? '#fff' : 'var(--bb-ink-80)',
                  }}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Trial Banner ───────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-5 py-4 sm:px-6">
        <div
          className="flex flex-col items-center gap-4 rounded-[var(--bb-radius-xl)] p-6 text-center sm:flex-row sm:justify-between sm:text-left"
          style={{
            backgroundColor: 'var(--bb-brand-surface)',
            border: '1px solid var(--bb-brand-light)',
          }}
        >
          <div className="flex items-center gap-3">
            <Zap className="h-6 w-6 shrink-0" style={{ color: 'var(--bb-brand)' }} />
            <div>
              <p className="font-semibold" style={{ color: 'var(--bb-brand)' }}>
                7 dias gratis com acesso Black Belt completo
              </p>
              <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                Teste todas as funcionalidades sem compromisso. Sem cartao de credito.
              </p>
            </div>
          </div>
          <Link
            href="/onboarding"
            className="shrink-0 rounded-[var(--bb-radius-md)] px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--bb-brand-gradient)' }}
          >
            Comecar Agora
          </Link>
        </div>
      </section>

      {/* ── Feature Matrix ─────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-24">
        <h2 className="mb-4 text-center text-3xl font-bold sm:text-4xl">
          Comparativo completo
        </h2>
        <p
          className="mx-auto mb-12 max-w-xl text-center"
          style={{ color: 'var(--bb-ink-60)' }}
        >
          Veja em detalhe o que cada plano inclui
        </p>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full text-sm">
            <thead>
              <tr
                className="border-b"
                style={{ borderColor: 'var(--bb-glass-border)' }}
              >
                <th
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--bb-ink-40)', width: '25%' }}
                >
                  Funcionalidade
                </th>
                {PLANS.map((plan) => (
                  <th
                    key={plan.name}
                    className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider"
                    style={{
                      color: plan.highlighted ? 'var(--bb-brand)' : 'var(--bb-ink-40)',
                      width: '15%',
                    }}
                  >
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURE_CATEGORIES.map((cat) => (
                <>
                  <tr key={`cat-${cat.category}`}>
                    <td
                      colSpan={6}
                      className="px-4 pb-2 pt-6 text-xs font-bold uppercase tracking-wider"
                      style={{ color: 'var(--bb-brand)' }}
                    >
                      {cat.category}
                    </td>
                  </tr>
                  {cat.rows.map((row) => (
                    <tr
                      key={row.label}
                      className="border-b transition-colors"
                      style={{ borderColor: 'var(--bb-glass-border)' }}
                    >
                      <td
                        className="px-4 py-3 text-sm"
                        style={{ color: 'var(--bb-ink-80)' }}
                      >
                        {row.label}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <CellValue value={row.starter} />
                      </td>
                      <td className="px-3 py-3 text-center">
                        <CellValue value={row.essencial} />
                      </td>
                      <td
                        className="px-3 py-3 text-center"
                        style={{
                          backgroundColor: 'var(--bb-brand-surface)',
                        }}
                      >
                        <CellValue value={row.pro} />
                      </td>
                      <td className="px-3 py-3 text-center">
                        <CellValue value={row.blackBelt} />
                      </td>
                      <td className="px-3 py-3 text-center">
                        <CellValue value={row.enterprise} />
                      </td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile: Stacked cards per category */}
        <div className="space-y-8 lg:hidden">
          {FEATURE_CATEGORIES.map((cat) => (
            <div key={cat.category}>
              <h3
                className="mb-4 text-sm font-bold uppercase tracking-wider"
                style={{ color: 'var(--bb-brand)' }}
              >
                {cat.category}
              </h3>
              <div className="space-y-3">
                {cat.rows.map((row) => (
                  <div
                    key={row.label}
                    className="rounded-[var(--bb-radius-md)] border p-4"
                    style={{
                      borderColor: 'var(--bb-glass-border)',
                      backgroundColor: 'var(--bb-depth-2)',
                    }}
                  >
                    <p className="mb-2 text-sm font-medium">{row.label}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-5">
                      {[
                        { name: 'Starter', val: row.starter },
                        { name: 'Essencial', val: row.essencial },
                        { name: 'Pro', val: row.pro },
                        { name: 'Black Belt', val: row.blackBelt },
                        { name: 'Enterprise', val: row.enterprise },
                      ].map((cell) => (
                        <div key={cell.name} className="flex items-center gap-1.5">
                          <span
                            className="text-[10px] font-medium"
                            style={{ color: 'var(--bb-ink-40)' }}
                          >
                            {cell.name}:
                          </span>
                          {cell.val === true ? (
                            <Check className="h-3.5 w-3.5" style={{ color: 'var(--bb-success)' }} />
                          ) : cell.val === false ? (
                            <XIcon className="h-3.5 w-3.5" style={{ color: 'var(--bb-ink-20)' }} />
                          ) : (
                            <span style={{ color: 'var(--bb-ink-80)' }}>{cell.val}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-5 py-16 sm:px-6 sm:py-24">
        <h2 className="mb-4 text-center text-3xl font-bold sm:text-4xl">
          Duvidas sobre cobranca
        </h2>
        <p
          className="mx-auto mb-10 max-w-xl text-center"
          style={{ color: 'var(--bb-ink-60)' }}
        >
          Tudo que voce precisa saber sobre planos, pagamentos e cancelamento
        </p>

        <div className="space-y-3 animate-reveal" data-stagger>
          {FAQ_ITEMS.map((item) => (
            <Accordion key={item.q} item={item} />
          ))}
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-6 sm:pb-24">
        <div
          className="animate-reveal rounded-[var(--bb-radius-2xl)] p-10 text-center sm:p-16"
          style={{
            background: 'var(--bb-brand-gradient)',
            boxShadow: 'var(--bb-brand-glow-strong)',
          }}
        >
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            7 dias gratis com acesso Black Belt completo
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-white/80">
            Teste todas as funcionalidades sem compromisso. Sem cartao de
            credito, sem multa de cancelamento.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/onboarding"
              className="w-full rounded-[var(--bb-radius-lg)] bg-white px-8 py-4 text-center text-lg font-bold transition-opacity hover:opacity-90 sm:w-auto"
              style={{ color: 'var(--bb-brand-deep)' }}
            >
              Comecar Trial Gratis
            </Link>
            <Link
              href="/contato"
              className="w-full rounded-[var(--bb-radius-lg)] border border-white/30 px-8 py-4 text-center text-lg font-medium text-white transition-opacity hover:opacity-90 sm:w-auto"
            >
              Falar com Vendas
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer
        className="border-t"
        style={{
          borderColor: 'var(--bb-glass-border)',
          backgroundColor: 'var(--bb-depth-2)',
        }}
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-5 py-8 sm:flex-row sm:justify-between sm:px-6">
          <Link href="/landing" className="text-lg font-bold">
            Black<span style={{ color: 'var(--bb-brand)' }}>Belt</span>
          </Link>
          <div
            className="flex flex-wrap items-center gap-4 text-sm"
            style={{ color: 'var(--bb-ink-40)' }}
          >
            <Link href="/termos" className="transition-colors hover:opacity-80">
              Termos
            </Link>
            <Link href="/privacidade" className="transition-colors hover:opacity-80">
              Privacidade
            </Link>
            <Link href="/contato" className="transition-colors hover:opacity-80">
              Contato
            </Link>
          </div>
          <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
            &copy; {new Date().getFullYear()} BlackBelt. Feito com &#10084;&#65039; por BlackBelt
          </p>
        </div>
      </footer>
    </div>
  );
}
