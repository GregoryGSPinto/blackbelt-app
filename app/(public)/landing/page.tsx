'use client';

import Link from 'next/link';
import { useState, type ForwardRefExoticComponent, type SVGProps } from 'react';
import {
  UsersIcon,
  CheckSquareIcon,
  VideoIcon,
  DollarIcon,
  AwardIcon,
  SettingsIcon,
  ChevronDownIcon,
  StarIcon,
  ArrowRightIcon,
  ShieldIcon,
  ZapIcon,
  CheckCircleIcon,
  QuoteIcon,
  UserIcon,
} from '@/components/shell/icons';

/* ─── Types ─── */

type IconComponent = ForwardRefExoticComponent<SVGProps<SVGSVGElement> & React.RefAttributes<SVGSVGElement>>;

interface Feature {
  icon: IconComponent;
  title: string;
  desc: string;
}

interface ProfileTab {
  id: string;
  label: string;
  icon: IconComponent;
  bullets: string[];
}

/* ─── Data ─── */

const FEATURES: Feature[] = [
  {
    icon: UsersIcon,
    title: 'Gestão de Turmas',
    desc: 'Crie turmas por modalidade, nível e horário. Controle capacidade, lista de espera e frequência em tempo real.',
  },
  {
    icon: CheckSquareIcon,
    title: 'Controle de Presença',
    desc: 'Check-in por QR code, reconhecimento facial ou lista. Relatórios automáticos de frequência e assiduidade.',
  },
  {
    icon: VideoIcon,
    title: 'Aulas em Streaming',
    desc: 'Transmita aulas ao vivo, grave técnicas e monte uma biblioteca de vídeos para seus alunos.',
  },
  {
    icon: DollarIcon,
    title: 'Financeiro Completo',
    desc: 'Cobranças automáticas via PIX, boleto e cartão. Controle inadimplência, receita e fluxo de caixa.',
  },
  {
    icon: AwardIcon,
    title: 'Sistema de Graduação',
    desc: 'Gerencie faixas, stripes e avaliações. Histórico completo de evolução e cerimônias de graduação.',
  },
  {
    icon: SettingsIcon,
    title: 'Multi-perfil',
    desc: 'Visões dedicadas para Admin, Professor, Aluno Adulto, Teen, Kids e Responsável. Cada um vê o que precisa.',
  },
];

const PROFILE_TABS: ProfileTab[] = [
  {
    id: 'admin',
    label: 'Administrador',
    icon: ShieldIcon,
    bullets: [
      'Dashboard com métricas de receita, frequência e retenção em tempo real',
      'Gestão financeira completa com cobranças automatizadas e relatórios',
      'Controle de turmas, professores, modalidades e múltiplas unidades',
    ],
  },
  {
    id: 'professor',
    label: 'Professor',
    icon: UsersIcon,
    bullets: [
      'Chamada digital com check-in por QR code e lista de presença',
      'Planejamento de aulas, avaliações de alunos e registro de evolução',
      'Comunicação direta com alunos e envio de conteúdo em vídeo',
    ],
  },
  {
    id: 'aluno',
    label: 'Aluno',
    icon: ZapIcon,
    bullets: [
      'Check-in rápido por QR code e histórico completo de treinos',
      'Acompanhamento de faixa, stripes e próximos requisitos de graduação',
      'Acesso a aulas gravadas, agenda de treinos e conquistas',
    ],
  },
  {
    id: 'teen',
    label: 'Teen',
    icon: StarIcon,
    bullets: [
      'Interface gamificada com sistema de XP, níveis e conquistas',
      'Ranking entre alunos da mesma faixa etária e desafios semanais',
      'Streaks de presença e recompensas por assiduidade',
    ],
  },
  {
    id: 'kids',
    label: 'Kids',
    icon: StarIcon,
    bullets: [
      'Visual lúdico e colorido, adaptado para crianças',
      'Sistema de estrelas, mascotes e celebrações animadas',
      'Navegação simplificada com ícones grandes e intuitivos',
    ],
  },
  {
    id: 'responsavel',
    label: 'Responsável',
    icon: UserIcon,
    bullets: [
      'Acompanhamento da evolução e presença de cada filho',
      'Recebimento de notificações sobre aulas, eventos e pagamentos',
      'Gestão de múltiplos dependentes em uma única conta',
    ],
  },
];

const TESTIMONIALS = [
  {
    quote: 'Desde que adotamos o BlackBelt, a inadimplência caiu 40% e o engajamento dos alunos subiu muito. A automação mudou nossa academia.',
    name: 'Prof. Ricardo Almeida',
    academy: 'Alliance BJJ Centro',
    role: 'Proprietário',
  },
  {
    quote: 'A automação de cobranças economiza 10 horas por semana. O melhor investimento que fiz para minha academia nos últimos anos.',
    name: 'Sensei Marcos Tanaka',
    academy: 'Tanaka Dojo',
    role: 'Proprietário',
  },
  {
    quote: 'Meus alunos adoram o app. O sistema de conquistas e faixas digitais mudou completamente a motivação dos treinos.',
    name: 'Mestre Ana Luíza',
    academy: 'Arte Suave Academy',
    role: 'Professora',
  },
];

const FAQ_ITEMS = [
  {
    q: 'Preciso de cartão de crédito para começar?',
    a: 'Não. Você pode testar o BlackBelt por 7 dias gratuitamente, sem necessidade de cartão de crédito. Ao final do trial, escolha o plano que melhor atende sua academia.',
  },
  {
    q: 'Funciona para qualquer arte marcial?',
    a: 'Sim! BJJ, Muay Thai, Judô, Karatê, MMA, Boxe, Taekwondo, Kung Fu e qualquer modalidade de luta. O sistema de faixas é configurável por modalidade.',
  },
  {
    q: 'Como funciona o check-in dos alunos?',
    a: 'Os alunos fazem check-in pelo app usando QR code na recepção da academia. Também é possível usar lista de presença digital ou reconhecimento facial (plano Pro+).',
  },
  {
    q: 'Posso migrar de outra plataforma?',
    a: 'Sim! Oferecemos importação de dados via CSV/Excel e suporte dedicado durante toda a migração. Nos planos Pro e acima, a migração é assistida por nossa equipe.',
  },
  {
    q: 'Tem contrato de fidelidade?',
    a: 'Não. Todos os planos são mensais sem fidelidade. Cancele quando quiser e seus dados são exportáveis a qualquer momento.',
  },
  {
    q: 'O sistema funciona no celular?',
    a: 'Sim! O BlackBelt é mobile-first. Funciona perfeitamente no navegador do celular e também tem apps nativos para iOS e Android.',
  },
  {
    q: 'Como funciona o suporte?',
    a: 'Todos os planos incluem suporte por email. Planos Pro e acima incluem suporte prioritário via chat. Black Belt inclui suporte via WhatsApp e gerente de conta dedicado.',
  },
  {
    q: 'Posso gerenciar múltiplas unidades?',
    a: 'Sim! A partir do plano Essencial você pode gerenciar até 3 unidades. O plano Pro suporta até 10, e o Black Belt oferece unidades ilimitadas com dashboard consolidado.',
  },
];

/* ─── Accordion Component ─── */

function FAQAccordion({ item }: { item: { q: string; a: string } }) {
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

/* ─── Page ─── */

export default function LandingPage() {
  const [activeProfile, setActiveProfile] = useState('admin');
  const activeTab = PROFILE_TABS.find((t) => t.id === activeProfile) ?? PROFILE_TABS[0];
  const ActiveTabIcon = activeTab.icon;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24 lg:px-8">
        {/* Background glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 50% 0%, var(--bb-brand-surface) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-5xl text-center">
          {/* Badge */}
          <div
            className="animate-reveal mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5"
            style={{
              backgroundColor: 'var(--bb-brand-surface)',
              border: '1px solid var(--bb-brand-light)',
              animationDelay: '0s',
            }}
          >
            <ZapIcon className="h-3.5 w-3.5" style={{ color: 'var(--bb-brand)' }} />
            <span className="text-xs font-semibold sm:text-sm" style={{ color: 'var(--bb-brand)' }}>
              7 dias grátis &mdash; sem cartão de crédito
            </span>
          </div>

          {/* Headline */}
          <h1
            className="animate-reveal mx-auto max-w-4xl text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl"
            style={{ animationDelay: '0.1s' }}
          >
            O software que toda academia de artes marciais{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'var(--bb-brand-gradient)' }}
            >
              precisa
            </span>
          </h1>

          {/* Subheadline */}
          <p
            className="animate-reveal mx-auto mt-6 max-w-2xl text-base leading-relaxed sm:text-lg lg:text-xl"
            style={{ color: 'var(--bb-ink-60)', animationDelay: '0.2s' }}
          >
            Gestão completa. Do tatame ao financeiro.
            Turmas, presenças, cobranças, faixas e IA — tudo em uma plataforma feita para quem vive artes marciais.
          </p>

          {/* CTA */}
          <div
            className="animate-reveal mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
            style={{ animationDelay: '0.3s' }}
          >
            <Link
              href="/cadastrar-academia"
              className="inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-bold text-white shadow-xl transition-all hover:-translate-y-0.5 sm:text-lg"
              style={{
                background: 'var(--bb-brand-gradient)',
                boxShadow: 'var(--bb-brand-glow)',
              }}
            >
              Começar Trial Grátis
              <ArrowRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
            <Link
              href="/precos"
              className="inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-medium transition-all sm:text-lg"
              style={{
                border: '1px solid var(--bb-glass-border)',
                color: 'var(--bb-ink-80)',
                backgroundColor: 'var(--bb-depth-2)',
              }}
            >
              Ver Planos
            </Link>
          </div>

          {/* Social Proof mini */}
          <div
            className="animate-reveal mt-12 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-8"
            style={{ animationDelay: '0.4s' }}
          >
            {[
              { value: '500+', label: 'Academias' },
              { value: '25.000+', label: 'Alunos ativos' },
              { value: '4.9', label: 'Avaliação média' },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-2">
                <span className="text-lg font-bold sm:text-xl" style={{ color: 'var(--bb-brand)' }}>
                  {stat.value}
                </span>
                <span className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="funcionalidades" className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--bb-brand)' }}>
              Funcionalidades
            </p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl lg:text-4xl">
              Tudo que sua academia precisa, em um só lugar
            </h2>
            <p className="mt-4 text-base" style={{ color: 'var(--bb-ink-60)' }}>
              Módulos integrados que cobrem 100% da operação, do check-in à gestão financeira.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-stagger>
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group relative overflow-hidden p-6 transition-all duration-200 hover:-translate-y-1"
                  style={{
                    borderRadius: 'var(--bb-radius-xl)',
                    border: '1px solid var(--bb-glass-border)',
                    backgroundColor: 'var(--bb-depth-2)',
                    boxShadow: 'var(--bb-shadow-sm)',
                  }}
                >
                  <div
                    className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{ backgroundColor: 'var(--bb-brand-surface)' }}
                  >
                    <Icon className="h-5 w-5" style={{ color: 'var(--bb-brand)' }} />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--bb-ink-60)' }}>
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Por Perfil */}
      <section
        id="por-perfil"
        className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
        style={{ backgroundColor: 'var(--bb-depth-2)' }}
      >
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--bb-brand)' }}>
              Por Perfil
            </p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl lg:text-4xl">
              Uma experiência para cada tipo de usuário
            </h2>
            <p className="mt-4 text-base" style={{ color: 'var(--bb-ink-60)' }}>
              Cada perfil tem sua própria interface, otimizada para suas necessidades.
            </p>
          </div>

          {/* Tabs */}
          <div className="mt-12 flex flex-wrap justify-center gap-2">
            {PROFILE_TABS.map((tab) => {
              const isActive = tab.id === activeProfile;
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveProfile(tab.id)}
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all"
                  style={{
                    backgroundColor: isActive ? 'var(--bb-brand-surface)' : 'transparent',
                    color: isActive ? 'var(--bb-brand)' : 'var(--bb-ink-60)',
                    border: isActive ? '1px solid var(--bb-brand-light)' : '1px solid transparent',
                  }}
                >
                  <TabIcon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div
            className="mt-8 p-6 sm:p-8"
            style={{
              borderRadius: 'var(--bb-radius-xl)',
              border: '1px solid var(--bb-glass-border)',
              backgroundColor: 'var(--bb-depth-3)',
              boxShadow: 'var(--bb-shadow-md)',
            }}
          >
            <div className="mb-6 flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: 'var(--bb-brand-surface)' }}
              >
                <ActiveTabIcon className="h-5 w-5" style={{ color: 'var(--bb-brand)' }} />
              </div>
              <h3 className="text-lg font-semibold">{activeTab.label}</h3>
            </div>
            <ul className="space-y-4">
              {activeTab.bullets.map((bullet, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircleIcon
                    className="mt-0.5 h-4 w-4 shrink-0 sm:h-5 sm:w-5"
                    style={{ color: 'var(--bb-success)' }}
                  />
                  <span className="text-sm leading-relaxed sm:text-base" style={{ color: 'var(--bb-ink-80)' }}>
                    {bullet}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--bb-brand)' }}>
              Depoimentos
            </p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl lg:text-4xl">
              Usado por <span style={{ color: 'var(--bb-brand)' }}>500+ academias</span> em todo o Brasil
            </h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-stagger>
            {TESTIMONIALS.map((testimonial) => (
              <div
                key={testimonial.name}
                className="relative p-6"
                style={{
                  borderRadius: 'var(--bb-radius-xl)',
                  border: '1px solid var(--bb-glass-border)',
                  backgroundColor: 'var(--bb-depth-2)',
                  boxShadow: 'var(--bb-shadow-sm)',
                }}
              >
                <QuoteIcon
                  className="mb-4 h-6 w-6"
                  style={{ color: 'var(--bb-brand-light)' }}
                />
                <p className="text-sm leading-relaxed" style={{ color: 'var(--bb-ink-80)' }}>
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ background: 'var(--bb-brand-gradient)' }}
                  >
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{testimonial.name}</p>
                    <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                      {testimonial.role} &middot; {testimonial.academy}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--bb-brand)' }}>
              FAQ
            </p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Perguntas Frequentes</h2>
          </div>

          <div className="mt-12 space-y-3">
            {FAQ_ITEMS.map((item) => (
              <FAQAccordion key={item.q} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div
          className="relative mx-auto max-w-4xl overflow-hidden p-8 text-center sm:p-12 lg:p-16"
          style={{
            borderRadius: 'var(--bb-radius-2xl)',
            background: 'var(--bb-brand-gradient)',
            boxShadow: 'var(--bb-brand-glow-strong)',
          }}
        >
          {/* Decorative circles */}
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-20"
            style={{ backgroundColor: 'white' }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full opacity-10"
            style={{ backgroundColor: 'white' }}
            aria-hidden="true"
          />

          <div className="relative">
            <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
              Pronto para transformar sua academia?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-white/80 sm:text-base">
              Junte-se a mais de 500 academias que já usam o BlackBelt.
              Comece seu trial de 7 dias grátis hoje.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/cadastrar-academia"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold shadow-xl transition-all hover:-translate-y-0.5 sm:text-lg"
                style={{ color: 'var(--bb-brand-deep)' }}
              >
                Começar Trial Grátis
                <ArrowRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
              <Link
                href="/precos"
                className="rounded-xl border border-white/30 px-8 py-4 text-base font-medium text-white transition-all hover:bg-white/10"
              >
                Ver Planos
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
