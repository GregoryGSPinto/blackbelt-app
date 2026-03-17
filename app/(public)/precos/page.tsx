'use client';

import Link from 'next/link';
import { Fragment, useState, type ForwardRefExoticComponent, type SVGProps } from 'react';
import {
  CheckIcon,
  ChevronDownIcon,
  ArrowRightIcon,
  ZapIcon,
  CrownIcon,
  BuildingIcon,
  RocketIcon,
  StarIcon,
  MinusIcon,
} from '@/components/shell/icons';

/* ─── Types ─── */

type IconComponent = ForwardRefExoticComponent<SVGProps<SVGSVGElement> & React.RefAttributes<SVGSVGElement>>;

type FeatureValue = boolean | string;

interface Plan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number | null;
  annualPrice: number | null;
  icon: IconComponent;
  highlight: boolean;
  cta: string;
  ctaLink: string;
}

interface FeatureRow {
  label: string;
  category: string;
  values: Record<string, FeatureValue>;
}

/* ─── Data ─── */

const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Para academias iniciando a digitalização',
    monthlyPrice: 97,
    annualPrice: 77,
    icon: ZapIcon,
    highlight: false,
    cta: 'Começar Trial',
    ctaLink: '/cadastrar-academia?plano=starter',
  },
  {
    id: 'essencial',
    name: 'Essencial',
    description: 'Para academias em crescimento',
    monthlyPrice: 197,
    annualPrice: 157,
    icon: StarIcon,
    highlight: false,
    cta: 'Começar Trial',
    ctaLink: '/cadastrar-academia?plano=essencial',
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'O mais escolhido pelas academias',
    monthlyPrice: 347,
    annualPrice: 277,
    icon: RocketIcon,
    highlight: true,
    cta: 'Começar Trial',
    ctaLink: '/cadastrar-academia?plano=pro',
  },
  {
    id: 'blackbelt',
    name: 'Black Belt',
    description: 'Para academias de alto volume',
    monthlyPrice: 597,
    annualPrice: 477,
    icon: CrownIcon,
    highlight: false,
    cta: 'Começar Trial',
    ctaLink: '/cadastrar-academia?plano=blackbelt',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Redes e franquias com necessidades específicas',
    monthlyPrice: null,
    annualPrice: null,
    icon: BuildingIcon,
    highlight: false,
    cta: 'Falar com Vendas',
    ctaLink: '/contato?assunto=enterprise',
  },
];

const FEATURE_CATEGORIES = ['Limites', 'Módulos', 'Suporte'];

const FEATURE_MATRIX: FeatureRow[] = [
  // Limites
  { label: 'Alunos ativos', category: 'Limites', values: { starter: 'Até 50', essencial: 'Até 150', pro: 'Até 500', blackbelt: 'Ilimitado', enterprise: 'Ilimitado' } },
  { label: 'Unidades', category: 'Limites', values: { starter: '1', essencial: 'Até 3', pro: 'Até 10', blackbelt: 'Ilimitado', enterprise: 'Ilimitado' } },
  { label: 'Professores', category: 'Limites', values: { starter: 'Até 3', essencial: 'Até 10', pro: 'Até 30', blackbelt: 'Ilimitado', enterprise: 'Ilimitado' } },
  { label: 'Armazenamento de vídeo', category: 'Limites', values: { starter: '5 GB', essencial: '25 GB', pro: '100 GB', blackbelt: '500 GB', enterprise: 'Ilimitado' } },

  // Módulos
  { label: 'Check-in QR Code', category: 'Módulos', values: { starter: true, essencial: true, pro: true, blackbelt: true, enterprise: true } },
  { label: 'Gestão de turmas', category: 'Módulos', values: { starter: true, essencial: true, pro: true, blackbelt: true, enterprise: true } },
  { label: 'Controle de faixas', category: 'Módulos', values: { starter: true, essencial: true, pro: true, blackbelt: true, enterprise: true } },
  { label: 'Cobranças automáticas', category: 'Módulos', values: { starter: false, essencial: true, pro: true, blackbelt: true, enterprise: true } },
  { label: 'Aulas em streaming', category: 'Módulos', values: { starter: false, essencial: false, pro: true, blackbelt: true, enterprise: true } },
  { label: 'Relatórios com IA', category: 'Módulos', values: { starter: false, essencial: false, pro: true, blackbelt: true, enterprise: true } },
  { label: 'App personalizado (white-label)', category: 'Módulos', values: { starter: false, essencial: false, pro: false, blackbelt: true, enterprise: true } },
  { label: 'API e webhooks', category: 'Módulos', values: { starter: false, essencial: false, pro: false, blackbelt: true, enterprise: true } },
  { label: 'SSO / SAML', category: 'Módulos', values: { starter: false, essencial: false, pro: false, blackbelt: false, enterprise: true } },
  { label: 'Integrações customizadas', category: 'Módulos', values: { starter: false, essencial: false, pro: false, blackbelt: false, enterprise: true } },

  // Suporte
  { label: 'Email', category: 'Suporte', values: { starter: true, essencial: true, pro: true, blackbelt: true, enterprise: true } },
  { label: 'Chat ao vivo', category: 'Suporte', values: { starter: false, essencial: true, pro: true, blackbelt: true, enterprise: true } },
  { label: 'Suporte prioritário', category: 'Suporte', values: { starter: false, essencial: false, pro: true, blackbelt: true, enterprise: true } },
  { label: 'WhatsApp dedicado', category: 'Suporte', values: { starter: false, essencial: false, pro: false, blackbelt: true, enterprise: true } },
  { label: 'Gerente de conta', category: 'Suporte', values: { starter: false, essencial: false, pro: false, blackbelt: false, enterprise: true } },
  { label: 'SLA garantido', category: 'Suporte', values: { starter: '99%', essencial: '99.5%', pro: '99.9%', blackbelt: '99.9%', enterprise: '99.99%' } },
];

const BILLING_FAQ = [
  {
    q: 'Posso trocar de plano a qualquer momento?',
    a: 'Sim! Faça upgrade ou downgrade quando quiser. No upgrade, o valor é proporcional ao período restante. No downgrade, o novo valor começa no próximo ciclo.',
  },
  {
    q: 'Quais formas de pagamento são aceitas?',
    a: 'Aceitamos cartão de crédito (Visa, Mastercard, Elo, Amex), PIX e boleto bancário. Para planos anuais, oferecemos parcelamento em até 12x no cartão.',
  },
  {
    q: 'O que acontece quando o trial de 7 dias acaba?',
    a: 'Você escolhe o plano que deseja e insere seus dados de pagamento. Se não escolher, sua conta é pausada (sem perda de dados) até que um plano seja ativado.',
  },
  {
    q: 'Tem desconto para pagamento anual?',
    a: 'Sim! O plano anual oferece 20% de desconto em relação ao mensal. Você paga 10 meses e ganha 12.',
  },
  {
    q: 'Posso cancelar a qualquer momento?',
    a: 'Sim, sem multa ou fidelidade. No plano mensal, o acesso continua até o fim do período pago. No anual, você pode solicitar reembolso proporcional nos primeiros 30 dias.',
  },
  {
    q: 'Emitem nota fiscal?',
    a: 'Sim! Emitimos nota fiscal de serviço (NFS-e) automaticamente para todos os pagamentos. A nota fica disponível na área administrativa.',
  },
  {
    q: 'Como funciona o plano Enterprise?',
    a: 'O Enterprise é customizado para redes e franquias. Inclui tudo do Black Belt, mais integrações customizadas, SSO, SLA 99.99% e gerente de conta dedicado. Entre em contato para um orçamento.',
  },
  {
    q: 'Existe desconto para múltiplas unidades?',
    a: 'Sim! A partir de 5 unidades, oferecemos descontos progressivos. Entre em contato com nosso time comercial para uma proposta personalizada.',
  },
];

/* ─── Components ─── */

function BillingFAQAccordion({ item }: { item: { q: string; a: string } }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="overflow-hidden transition-all"
      style={{
        borderRadius: 'var(--bb-radius-lg)',
        border: '1px solid var(--bb-glass-border)',
        backgroundColor: 'var(--bb-depth-2)',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium sm:text-base"
        style={{ color: 'var(--bb-ink-100)' }}
        aria-expanded={open}
      >
        <span className="pr-4">{item.q}</span>
        <ChevronDownIcon
          className="h-4 w-4 shrink-0 transition-transform duration-200"
          style={{
            color: 'var(--bb-ink-40)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-200"
        style={{
          maxHeight: open ? '200px' : '0px',
          opacity: open ? 1 : 0,
        }}
      >
        <p className="px-5 pb-4 text-sm leading-relaxed" style={{ color: 'var(--bb-ink-60)' }}>
          {item.a}
        </p>
      </div>
    </div>
  );
}

function FeatureCell({ value }: { value: FeatureValue }) {
  if (typeof value === 'boolean') {
    return value ? (
      <CheckIcon className="h-4 w-4" style={{ color: 'var(--bb-success)' }} />
    ) : (
      <MinusIcon className="h-4 w-4" style={{ color: 'var(--bb-ink-20)' }} />
    );
  }
  return (
    <span className="text-xs font-medium sm:text-sm" style={{ color: 'var(--bb-ink-80)' }}>
      {value}
    </span>
  );
}

/* ─── Page ─── */

export default function PrecosPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  function getPrice(plan: Plan): string {
    if (plan.monthlyPrice === null) return 'Consulte';
    const price = isAnnual ? plan.annualPrice! : plan.monthlyPrice;
    return `R$ ${price}`;
  }

  function getSavings(plan: Plan): string | null {
    if (plan.monthlyPrice === null || plan.annualPrice === null) return null;
    const savings = (plan.monthlyPrice - plan.annualPrice) * 12;
    return `Economize R$ ${savings}/ano`;
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-12 pt-16 sm:px-6 sm:pb-16 sm:pt-24 lg:px-8">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 50% 0%, var(--bb-brand-surface) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-3xl text-center">
          <h1
            className="animate-reveal text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl"
            style={{ animationDelay: '0s' }}
          >
            Planos e{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'var(--bb-brand-gradient)' }}
            >
              Preços
            </span>
          </h1>
          <p
            className="animate-reveal mx-auto mt-4 max-w-xl text-base sm:text-lg"
            style={{ color: 'var(--bb-ink-60)', animationDelay: '0.1s' }}
          >
            Escolha o plano ideal para sua academia. Todos incluem 7 dias grátis.
          </p>

          {/* Toggle Mensal/Anual */}
          <div
            className="animate-reveal mt-8 inline-flex items-center gap-3 rounded-full p-1"
            style={{
              backgroundColor: 'var(--bb-depth-3)',
              border: '1px solid var(--bb-glass-border)',
              animationDelay: '0.2s',
            }}
          >
            <button
              onClick={() => setIsAnnual(false)}
              className="rounded-full px-5 py-2 text-sm font-medium transition-all"
              style={{
                backgroundColor: !isAnnual ? 'var(--bb-brand-surface)' : 'transparent',
                color: !isAnnual ? 'var(--bb-brand)' : 'var(--bb-ink-60)',
              }}
            >
              Mensal
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className="flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all"
              style={{
                backgroundColor: isAnnual ? 'var(--bb-brand-surface)' : 'transparent',
                color: isAnnual ? 'var(--bb-brand)' : 'var(--bb-ink-60)',
              }}
            >
              Anual
              <span
                className="rounded-full px-2 py-0.5 text-xs font-bold"
                style={{
                  backgroundColor: 'var(--bb-success-surface)',
                  color: 'var(--bb-success)',
                }}
              >
                -20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Plan Cards */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {PLANS.map((plan) => {
              const Icon = plan.icon;
              const savings = isAnnual ? getSavings(plan) : null;

              return (
                <div
                  key={plan.id}
                  className="relative flex flex-col p-5 transition-all duration-200 hover:-translate-y-1"
                  style={{
                    borderRadius: 'var(--bb-radius-xl)',
                    border: plan.highlight
                      ? '2px solid var(--bb-brand)'
                      : '1px solid var(--bb-glass-border)',
                    backgroundColor: 'var(--bb-depth-2)',
                    boxShadow: plan.highlight
                      ? 'var(--bb-brand-glow)'
                      : 'var(--bb-shadow-sm)',
                  }}
                >
                  {plan.highlight && (
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-bold text-white"
                      style={{ background: 'var(--bb-brand-gradient)' }}
                    >
                      MAIS POPULAR
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{
                        backgroundColor: plan.highlight
                          ? 'var(--bb-brand-surface)'
                          : 'var(--bb-depth-4)',
                      }}
                    >
                      <Icon
                        className="h-4 w-4"
                        style={{
                          color: plan.highlight
                            ? 'var(--bb-brand)'
                            : 'var(--bb-ink-60)',
                        }}
                      />
                    </div>
                    <h3 className="text-base font-bold">{plan.name}</h3>
                  </div>

                  <p className="mt-2 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                    {plan.description}
                  </p>

                  <div className="mt-4">
                    <span
                      className="text-3xl font-extrabold"
                      style={{
                        color: plan.highlight
                          ? 'var(--bb-brand)'
                          : 'var(--bb-ink-100)',
                      }}
                    >
                      {getPrice(plan)}
                    </span>
                    {plan.monthlyPrice !== null && (
                      <span className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>
                        /mês
                      </span>
                    )}
                  </div>

                  {savings && (
                    <p
                      className="mt-1 text-xs font-medium"
                      style={{ color: 'var(--bb-success)' }}
                    >
                      {savings}
                    </p>
                  )}

                  <div className="flex-1" />

                  <Link
                    href={plan.ctaLink}
                    className="mt-4 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5"
                    style={
                      plan.highlight
                        ? {
                            background: 'var(--bb-brand-gradient)',
                            color: 'white',
                            boxShadow: 'var(--bb-shadow-md)',
                          }
                        : {
                            backgroundColor: 'var(--bb-depth-4)',
                            color: 'var(--bb-ink-80)',
                          }
                    }
                  >
                    {plan.cta}
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Matrix */}
      <section
        className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
        style={{ backgroundColor: 'var(--bb-depth-2)' }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">Compare os planos em detalhe</h2>
            <p className="mt-3 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              Veja exatamente o que cada plano oferece.
            </p>
          </div>

          {/* Desktop table */}
          <div className="mt-12 hidden overflow-x-auto lg:block">
            <table className="w-full">
              <thead>
                <tr>
                  <th
                    className="w-64 py-4 text-left text-sm font-semibold"
                    style={{ color: 'var(--bb-ink-60)' }}
                  />
                  {PLANS.map((plan) => (
                    <th
                      key={plan.id}
                      className="px-4 py-4 text-center text-sm font-semibold"
                      style={{
                        color: plan.highlight
                          ? 'var(--bb-brand)'
                          : 'var(--bb-ink-80)',
                        minWidth: '120px',
                      }}
                    >
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURE_CATEGORIES.map((cat) => (
                  <Fragment key={cat}>
                    <tr>
                      <td
                        colSpan={6}
                        className="pb-2 pt-8 text-xs font-bold uppercase tracking-wider"
                        style={{ color: 'var(--bb-ink-40)' }}
                      >
                        {cat}
                      </td>
                    </tr>
                    {FEATURE_MATRIX.filter((f) => f.category === cat).map((feature) => (
                      <tr
                        key={feature.label}
                        className="border-b"
                        style={{ borderColor: 'var(--bb-glass-border)' }}
                      >
                        <td
                          className="py-3 pr-4 text-sm"
                          style={{ color: 'var(--bb-ink-80)' }}
                        >
                          {feature.label}
                        </td>
                        {PLANS.map((plan) => (
                          <td key={plan.id} className="px-4 py-3 text-center">
                            <div className="flex justify-center">
                              <FeatureCell value={feature.values[plan.id]} />
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: cards per plan */}
          <div className="mt-12 space-y-6 lg:hidden">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className="overflow-hidden"
                style={{
                  borderRadius: 'var(--bb-radius-xl)',
                  border: plan.highlight
                    ? '2px solid var(--bb-brand)'
                    : '1px solid var(--bb-glass-border)',
                  backgroundColor: 'var(--bb-depth-3)',
                }}
              >
                <div
                  className="px-5 py-4"
                  style={{
                    borderBottom: '1px solid var(--bb-glass-border)',
                    backgroundColor: plan.highlight
                      ? 'var(--bb-brand-surface)'
                      : 'var(--bb-depth-4)',
                  }}
                >
                  <h3
                    className="text-base font-bold"
                    style={{
                      color: plan.highlight
                        ? 'var(--bb-brand)'
                        : 'var(--bb-ink-100)',
                    }}
                  >
                    {plan.name}
                  </h3>
                  <p className="text-2xl font-extrabold">
                    {getPrice(plan)}
                    {plan.monthlyPrice !== null && (
                      <span className="text-sm font-normal" style={{ color: 'var(--bb-ink-40)' }}>
                        /mês
                      </span>
                    )}
                  </p>
                </div>
                <div className="divide-y" style={{ borderColor: 'var(--bb-glass-border)' }}>
                  {FEATURE_MATRIX.map((feature) => (
                    <div
                      key={feature.label}
                      className="flex items-center justify-between px-5 py-3"
                    >
                      <span className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                        {feature.label}
                      </span>
                      <FeatureCell value={feature.values[plan.id]} />
                    </div>
                  ))}
                </div>
                <div className="px-5 py-4">
                  <Link
                    href={plan.ctaLink}
                    className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all"
                    style={
                      plan.highlight
                        ? {
                            background: 'var(--bb-brand-gradient)',
                            color: 'white',
                          }
                        : {
                            backgroundColor: 'var(--bb-depth-5)',
                            color: 'var(--bb-ink-80)',
                          }
                    }
                  >
                    {plan.cta}
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7 dias grátis Banner */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div
          className="relative mx-auto max-w-4xl overflow-hidden p-8 text-center sm:p-12"
          style={{
            borderRadius: 'var(--bb-radius-2xl)',
            background: 'var(--bb-brand-gradient)',
            boxShadow: 'var(--bb-brand-glow-strong)',
          }}
        >
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-20"
            style={{ backgroundColor: 'white' }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-12 -left-12 h-36 w-36 rounded-full opacity-10"
            style={{ backgroundColor: 'white' }}
            aria-hidden="true"
          />

          <div className="relative">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5">
              <ZapIcon className="h-4 w-4 text-white" />
              <span className="text-sm font-semibold text-white">Trial gratuito</span>
            </div>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              7 dias grátis em qualquer plano
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-white/80 sm:text-base">
              Sem cartão de crédito. Sem compromisso. Configure sua academia em minutos
              e experimente todas as funcionalidades do plano escolhido.
            </p>
            <Link
              href="/cadastrar-academia"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold shadow-xl transition-all hover:-translate-y-0.5"
              style={{ color: 'var(--bb-brand-deep)' }}
            >
              Começar Agora
              <ArrowRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Billing FAQ */}
      <section className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--bb-brand)' }}>
              FAQ
            </p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
              Dúvidas sobre pagamento
            </h2>
          </div>

          <div className="mt-12 space-y-3">
            {BILLING_FAQ.map((item) => (
              <BillingFAQAccordion key={item.q} item={item} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
