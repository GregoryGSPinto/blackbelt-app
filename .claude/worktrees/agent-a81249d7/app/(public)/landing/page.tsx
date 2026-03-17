'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Users,
  CalendarCheck,
  PlayCircle,
  DollarSign,
  Award,
  UserCog,
  ChevronDown,
  Star,
  Zap,
  Shield,
  Menu,
  X,
} from 'lucide-react';

/* ──────────────────────────────────────────────────────────────
   Data
   ────────────────────────────────────────────────────────────── */

const FEATURES = [
  {
    icon: Users,
    title: 'Turmas & Alunos',
    desc: 'Organize turmas por modalidade, horário e faixa. Controle matrículas, transferências e histórico completo.',
  },
  {
    icon: CalendarCheck,
    title: 'Presença Inteligente',
    desc: 'Check-in por QR code, biometria ou reconhecimento facial. Relatórios de frequência em tempo real.',
  },
  {
    icon: PlayCircle,
    title: 'Streaming de Aulas',
    desc: 'Aulas ao vivo e gravadas. Biblioteca de técnicas com busca por faixa, posição e categoria.',
  },
  {
    icon: DollarSign,
    title: 'Financeiro Completo',
    desc: 'Cobranças automáticas via PIX, boleto e cartão. Dashboard de receita, inadimplência e projeções.',
  },
  {
    icon: Award,
    title: 'Graduação & Faixas',
    desc: 'Sistema de faixas com requisitos, tempo mínimo e avaliações. Histórico de graduações digitais.',
  },
  {
    icon: UserCog,
    title: 'Multi-perfil',
    desc: 'Admin, professor, aluno adulto, teen, kids e responsável. Cada um com sua experiência personalizada.',
  },
];

interface ProfileTab {
  key: string;
  label: string;
  bullets: string[];
}

const PROFILE_TABS: ProfileTab[] = [
  {
    key: 'admin',
    label: 'Admin',
    bullets: [
      'Dashboard completo com métricas de receita, presença e crescimento',
      'Gestão de turmas, horários, professores e matrículas',
      'Relatórios financeiros, cobranças automáticas e controle de inadimplência',
    ],
  },
  {
    key: 'professor',
    label: 'Professor',
    bullets: [
      'Chamada digital com check-in por QR code na aula',
      'Avaliação de alunos, registros de técnica e notas de evolução',
      'Planos de aula, streaming de conteúdo e biblioteca de técnicas',
    ],
  },
  {
    key: 'aluno',
    label: 'Aluno',
    bullets: [
      'Check-in rápido com QR code e histórico de presença',
      'Acompanhamento de faixa, conquistas e próxima graduação',
      'Acesso a aulas gravadas, agenda de treinos e chat com professor',
    ],
  },
  {
    key: 'teen',
    label: 'Teen',
    bullets: [
      'Interface gamificada com XP, níveis e missões diárias',
      'Ranking entre colegas de turma e conquistas desbloqueáveis',
      'Streaks de treino, desafios semanais e recompensas visuais',
    ],
  },
  {
    key: 'kids',
    label: 'Kids',
    bullets: [
      'Interface lúdica com personagens, cores e animações divertidas',
      'Sistema de estrelas e troféus por participação e comportamento',
      'Área simplificada e segura, sem acesso a dados sensíveis',
    ],
  },
  {
    key: 'responsavel',
    label: 'Responsável',
    bullets: [
      'Acompanhe presença, evolução e graduação dos filhos em tempo real',
      'Receba notificações de check-in, avaliações e comunicados da academia',
      'Gerencie pagamentos, contratos e agendamento de aulas experimentais',
    ],
  },
];

const TESTIMONIALS = [
  {
    quote: 'Desde que adotamos o BlackBelt, a inadimplência caiu 40% e o engajamento dos alunos subiu muito. A automação mudou nossa rotina.',
    name: 'Prof. Ricardo Almeida',
    academy: 'Alliance BJJ Centro',
    stars: 5,
  },
  {
    quote: 'A automação de cobranças economiza 10 horas por semana. O melhor investimento que fiz para minha academia nos últimos 5 anos.',
    name: 'Sensei Marcos Tanaka',
    academy: 'Tanaka Dojo',
    stars: 5,
  },
  {
    quote: 'Meus alunos adoram o app. O sistema de conquistas e faixas digitais mudou a motivação dos treinos, especialmente entre os teens.',
    name: 'Mestre Ana Luiza',
    academy: 'Arte Suave Academy',
    stars: 5,
  },
];

interface PlanCard {
  name: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  ctaLink: string;
  highlighted: boolean;
}

const PLANS: PlanCard[] = [
  {
    name: 'Starter',
    price: 'R$ 97',
    period: '/mes',
    features: ['Ate 50 alunos', '1 unidade', 'Check-in + presenca', 'App basico', 'Suporte por email'],
    cta: 'Comecar Trial',
    ctaLink: '/onboarding',
    highlighted: false,
  },
  {
    name: 'Essencial',
    price: 'R$ 197',
    period: '/mes',
    features: ['Ate 150 alunos', '1 unidade', 'Cobrancas automaticas', 'Relatorios', 'Chat professor', 'Suporte prioritario'],
    cta: 'Comecar Trial',
    ctaLink: '/onboarding',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: 'R$ 347',
    period: '/mes',
    features: ['Ate 500 alunos', 'Ate 3 unidades', 'Streaming de aulas', 'IA & insights', 'WhatsApp integrado', 'Multi-perfil completo'],
    cta: 'Comecar Trial',
    ctaLink: '/onboarding',
    highlighted: true,
  },
  {
    name: 'Black Belt',
    price: 'R$ 597',
    period: '/mes',
    features: ['Alunos ilimitados', 'Ate 10 unidades', 'Tudo do Pro', 'API aberta', 'Campeonatos', 'Marketplace', 'Suporte 24/7'],
    cta: 'Comecar Trial',
    ctaLink: '/onboarding',
    highlighted: false,
  },
  {
    name: 'Enterprise',
    price: 'Sob consulta',
    period: '',
    features: ['Unidades ilimitadas', 'SSO corporativo', 'SLA 99.9%', 'Gerente de conta', 'Onboarding dedicado', 'Integracao customizada'],
    cta: 'Falar com Vendas',
    ctaLink: '/contato',
    highlighted: false,
  },
];

interface FAQItem {
  q: string;
  a: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    q: 'Preciso de cartao de credito para comecar o trial?',
    a: 'Nao. O trial de 7 dias e totalmente gratuito e nao requer cartao de credito. Voce so paga quando decidir continuar.',
  },
  {
    q: 'Funciona para qualquer arte marcial?',
    a: 'Sim! BJJ, Muay Thai, Judo, Karate, MMA, Boxing, Taekwondo, Krav Maga e qualquer outra modalidade de luta ou arte marcial.',
  },
  {
    q: 'Como funciona o check-in dos alunos?',
    a: 'Os alunos fazem check-in pelo app usando QR code exibido na recepcao ou tablet. O processo leva menos de 3 segundos.',
  },
  {
    q: 'Posso migrar dados de outra plataforma?',
    a: 'Sim. Oferecemos importacao de dados via CSV e suporte dedicado durante toda a migracao. Sua base de alunos, historico de pagamentos e graduacoes serao preservados.',
  },
  {
    q: 'Tem contrato de fidelidade?',
    a: 'Nao. Todos os planos sao mensais, sem fidelidade. Cancele quando quiser. Seus dados sao exportaveis a qualquer momento.',
  },
  {
    q: 'O app funciona offline?',
    a: 'Sim. O BlackBelt e um PWA que funciona offline. Check-ins, consultas e agenda ficam disponiveis mesmo sem internet e sincronizam quando a conexao voltar.',
  },
  {
    q: 'Como funciona o suporte?',
    a: 'Starter tem suporte por email. Essencial e Pro tem suporte prioritario com resposta em ate 4 horas. Black Belt e Enterprise tem suporte 24/7 com canal dedicado.',
  },
  {
    q: 'Posso usar em multiplas unidades?',
    a: 'Sim. A partir do plano Pro voce pode gerenciar ate 3 unidades. Black Belt suporta ate 10, e Enterprise e ilimitado. Todas com dashboard consolidado.',
  },
];

/* ──────────────────────────────────────────────────────────────
   Intersection Observer hook for scroll animations
   ────────────────────────────────────────────────────────────── */

function useRevealOnScroll(): React.RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('animate-reveal');
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return ref;
}

/* ──────────────────────────────────────────────────────────────
   Accordion component for FAQ
   ────────────────────────────────────────────────────────────── */

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
   Section wrapper with reveal animation
   ────────────────────────────────────────────────────────────── */

function Section({
  id,
  children,
  className = '',
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRevealOnScroll();
  return (
    <section
      id={id}
      ref={ref}
      className={`mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-24 ${className}`}
      style={{ opacity: 0 }}
    >
      {children}
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   Landing Page
   ────────────────────────────────────────────────────────────── */

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('admin');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeProfile = PROFILE_TABS.find((t) => t.key === activeTab)!;

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
        className="sticky top-0 z-50 border-b backdrop-blur-xl"
        style={{
          backgroundColor: 'rgba(var(--bb-depth-1), 0.8)',
          borderColor: 'var(--bb-glass-border)',
          background: 'color-mix(in srgb, var(--bb-depth-1) 85%, transparent)',
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6">
          <Link href="/landing" className="text-2xl font-bold">
            Black<span style={{ color: 'var(--bb-brand)' }}>Belt</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#funcionalidades"
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: 'var(--bb-ink-60)' }}
            >
              Funcionalidades
            </a>
            <a
              href="#perfis"
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: 'var(--bb-ink-60)' }}
            >
              Perfis
            </a>
            <a
              href="#planos"
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: 'var(--bb-ink-60)' }}
            >
              Planos
            </a>
            <a
              href="#faq"
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: 'var(--bb-ink-60)' }}
            >
              FAQ
            </a>
            <Link
              href="/login"
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: 'var(--bb-ink-60)' }}
            >
              Login
            </Link>
            <Link
              href="/onboarding"
              className="rounded-[var(--bb-radius-md)] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: 'var(--bb-brand-gradient)' }}
            >
              Comecar Trial Gratis
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" style={{ color: 'var(--bb-ink-80)' }} />
            ) : (
              <Menu className="h-6 w-6" style={{ color: 'var(--bb-ink-80)' }} />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div
            className="border-t px-5 pb-6 pt-4 md:hidden"
            style={{
              borderColor: 'var(--bb-glass-border)',
              backgroundColor: 'var(--bb-depth-2)',
            }}
          >
            <div className="flex flex-col gap-4">
              <a
                href="#funcionalidades"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium"
                style={{ color: 'var(--bb-ink-60)' }}
              >
                Funcionalidades
              </a>
              <a
                href="#perfis"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium"
                style={{ color: 'var(--bb-ink-60)' }}
              >
                Perfis
              </a>
              <a
                href="#planos"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium"
                style={{ color: 'var(--bb-ink-60)' }}
              >
                Planos
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium"
                style={{ color: 'var(--bb-ink-60)' }}
              >
                FAQ
              </a>
              <Link
                href="/login"
                className="text-sm font-medium"
                style={{ color: 'var(--bb-ink-60)' }}
              >
                Login
              </Link>
              <Link
                href="/onboarding"
                className="rounded-[var(--bb-radius-md)] px-5 py-3 text-center text-sm font-semibold text-white"
                style={{ background: 'var(--bb-brand-gradient)' }}
              >
                Comecar Trial Gratis
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-5 pb-16 pt-16 text-center sm:px-6 sm:pb-24 sm:pt-28">
        <div className="animate-reveal">
          <div
            className="mx-auto mb-6 inline-flex items-center gap-2 rounded-[var(--bb-radius-full)] px-4 py-2 text-xs font-semibold"
            style={{
              backgroundColor: 'var(--bb-brand-surface)',
              color: 'var(--bb-brand)',
            }}
          >
            <Zap className="h-3.5 w-3.5" />
            7 dias gratis — sem cartao de credito
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            O software que toda academia de artes marciais{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'var(--bb-brand-gradient)' }}
            >
              precisa
            </span>
          </h1>

          <p
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed sm:text-xl"
            style={{ color: 'var(--bb-ink-60)' }}
          >
            Gestao completa. Do tatame ao financeiro.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/onboarding"
              className="w-full rounded-[var(--bb-radius-lg)] px-8 py-4 text-center text-lg font-bold text-white shadow-lg transition-all hover:opacity-90 sm:w-auto"
              style={{
                background: 'var(--bb-brand-gradient)',
                boxShadow: 'var(--bb-brand-glow)',
              }}
            >
              Comecar Trial Gratis
            </Link>
            <Link
              href="/precos"
              className="w-full rounded-[var(--bb-radius-lg)] border px-8 py-4 text-center text-lg font-medium transition-colors hover:opacity-80 sm:w-auto"
              style={{
                borderColor: 'var(--bb-glass-border)',
                color: 'var(--bb-ink-80)',
              }}
            >
              Ver Planos
            </Link>
          </div>

          {/* Trust badges */}
          <div
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm"
            style={{ color: 'var(--bb-ink-40)' }}
          >
            <span className="flex items-center gap-1.5">
              <Shield className="h-4 w-4" /> Dados criptografados
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-4 w-4" /> Setup em 2 minutos
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="h-4 w-4" /> 4.9/5 avaliacao
            </span>
          </div>
        </div>
      </section>

      {/* ── Features (6 cards) ────────────────────────────── */}
      <Section id="funcionalidades">
        <h2 className="mb-4 text-center text-3xl font-bold sm:text-4xl">
          Tudo que sua academia precisa
        </h2>
        <p
          className="mx-auto mb-12 max-w-xl text-center"
          style={{ color: 'var(--bb-ink-60)' }}
        >
          Desde o controle de turmas ate o financeiro, o BlackBelt cobre cada
          aspecto da gestao da sua academia.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-stagger>
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group rounded-[var(--bb-radius-xl)] border p-6 transition-all duration-300 hover:-translate-y-1"
                style={{
                  borderColor: 'var(--bb-glass-border)',
                  backgroundColor: 'var(--bb-depth-2)',
                  boxShadow: 'var(--bb-shadow-sm)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--bb-shadow-md)';
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--bb-glass-border-hover)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--bb-shadow-sm)';
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--bb-glass-border)';
                }}
              >
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--bb-radius-md)]"
                  style={{
                    backgroundColor: 'var(--bb-brand-surface)',
                    color: 'var(--bb-brand)',
                  }}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--bb-ink-60)' }}>
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── By Profile (tabs) ────────────────────────────── */}
      <Section id="perfis">
        <h2 className="mb-4 text-center text-3xl font-bold sm:text-4xl">
          Uma experiencia para cada perfil
        </h2>
        <p
          className="mx-auto mb-10 max-w-xl text-center"
          style={{ color: 'var(--bb-ink-60)' }}
        >
          Cada usuario tem sua interface personalizada, adaptada ao que realmente
          importa para ele.
        </p>

        {/* Tab buttons */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {PROFILE_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className="rounded-[var(--bb-radius-full)] px-4 py-2 text-sm font-medium transition-all"
              style={{
                backgroundColor:
                  activeTab === tab.key
                    ? 'var(--bb-brand)'
                    : 'var(--bb-depth-4)',
                color:
                  activeTab === tab.key ? '#fff' : 'var(--bb-ink-60)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div
          className="mx-auto max-w-2xl rounded-[var(--bb-radius-xl)] border p-8"
          style={{
            borderColor: 'var(--bb-glass-border)',
            backgroundColor: 'var(--bb-depth-2)',
            boxShadow: 'var(--bb-shadow-md)',
          }}
        >
          <h3
            className="mb-6 text-xl font-bold"
            style={{ color: 'var(--bb-brand)' }}
          >
            {activeProfile.label}
          </h3>
          <ul className="space-y-4">
            {activeProfile.bullets.map((bullet, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm leading-relaxed animate-reveal"
                style={{
                  color: 'var(--bb-ink-80)',
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: 'var(--bb-brand)' }}
                >
                  {i + 1}
                </span>
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* ── Social Proof ─────────────────────────────────── */}
      <Section id="depoimentos">
        <div
          className="mb-10 text-center"
        >
          <p
            className="mb-2 text-sm font-semibold uppercase tracking-wider"
            style={{ color: 'var(--bb-brand)' }}
          >
            Prova Social
          </p>
          <h2 className="text-3xl font-bold sm:text-4xl">
            Usado por 150+ academias
          </h2>
          <p className="mt-2" style={{ color: 'var(--bb-ink-60)' }}>
            Veja o que nossos clientes dizem sobre o BlackBelt
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3" data-stagger>
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="rounded-[var(--bb-radius-xl)] border p-6"
              style={{
                borderColor: 'var(--bb-glass-border)',
                backgroundColor: 'var(--bb-depth-2)',
                boxShadow: 'var(--bb-shadow-sm)',
              }}
            >
              {/* Stars */}
              <div className="mb-4 flex gap-1">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-current"
                    style={{ color: 'var(--bb-warning)' }}
                  />
                ))}
              </div>
              <p
                className="mb-4 text-sm leading-relaxed"
                style={{ color: 'var(--bb-ink-80)' }}
              >
                &ldquo;{t.quote}&rdquo;
              </p>
              <div
                className="border-t pt-4"
                style={{ borderColor: 'var(--bb-glass-border)' }}
              >
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                  {t.academy}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Plans ─────────────────────────────────────────── */}
      <Section id="planos">
        <h2 className="mb-4 text-center text-3xl font-bold sm:text-4xl">
          Planos e Precos
        </h2>
        <p
          className="mx-auto mb-12 max-w-xl text-center"
          style={{ color: 'var(--bb-ink-60)' }}
        >
          Escolha o plano ideal para o tamanho da sua academia. Todos incluem 7
          dias gratis.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5" data-stagger>
          {PLANS.map((p) => (
            <div
              key={p.name}
              className="relative flex flex-col rounded-[var(--bb-radius-xl)] border p-6 transition-all duration-300"
              style={{
                borderColor: p.highlighted ? 'var(--bb-brand)' : 'var(--bb-glass-border)',
                backgroundColor: 'var(--bb-depth-2)',
                boxShadow: p.highlighted ? 'var(--bb-brand-glow)' : 'var(--bb-shadow-sm)',
                transform: p.highlighted ? 'scale(1.03)' : 'scale(1)',
              }}
            >
              {p.highlighted && (
                <span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[var(--bb-radius-full)] px-4 py-1 text-xs font-bold text-white"
                  style={{ backgroundColor: 'var(--bb-brand)' }}
                >
                  MAIS POPULAR
                </span>
              )}
              <h3 className="text-lg font-bold">{p.name}</h3>
              <p className="mt-2">
                <span className="text-2xl font-extrabold">{p.price}</span>
                <span className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>
                  {p.period}
                </span>
              </p>
              <ul className="mt-5 flex-1 space-y-2.5">
                {p.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-xs"
                    style={{ color: 'var(--bb-ink-60)' }}
                  >
                    <span style={{ color: 'var(--bb-success)' }}>&#10003;</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={p.ctaLink}
                className="mt-6 block rounded-[var(--bb-radius-md)] py-2.5 text-center text-sm font-semibold transition-opacity hover:opacity-90"
                style={{
                  background: p.highlighted ? 'var(--bb-brand-gradient)' : 'var(--bb-depth-4)',
                  color: p.highlighted ? '#fff' : 'var(--bb-ink-80)',
                }}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>

        <p
          className="mt-8 text-center text-sm"
          style={{ color: 'var(--bb-ink-40)' }}
        >
          Todos os planos incluem 7 dias de trial com acesso Black Belt
          completo.{' '}
          <Link
            href="/precos"
            className="font-medium underline"
            style={{ color: 'var(--bb-brand)' }}
          >
            Comparar planos em detalhe
          </Link>
        </p>
      </Section>

      {/* ── FAQ ────────────────────────────────────────────── */}
      <Section id="faq">
        <h2 className="mb-4 text-center text-3xl font-bold sm:text-4xl">
          Perguntas Frequentes
        </h2>
        <p
          className="mx-auto mb-10 max-w-xl text-center"
          style={{ color: 'var(--bb-ink-60)' }}
        >
          Tire suas duvidas sobre a plataforma
        </p>

        <div className="mx-auto max-w-2xl space-y-3" data-stagger>
          {FAQ_ITEMS.map((item) => (
            <Accordion key={item.q} item={item} />
          ))}
        </div>
      </Section>

      {/* ── CTA Final ──────────────────────────────────────── */}
      <Section>
        <div
          className="rounded-[var(--bb-radius-2xl)] p-10 text-center sm:p-16"
          style={{
            background: 'var(--bb-brand-gradient)',
            boxShadow: 'var(--bb-brand-glow-strong)',
          }}
        >
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Pronto para transformar sua academia?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-white/80">
            Comece agora com 7 dias gratis. Sem cartao de credito, sem
            compromisso.
          </p>
          <Link
            href="/onboarding"
            className="mt-8 inline-block rounded-[var(--bb-radius-lg)] bg-white px-8 py-4 text-lg font-bold transition-opacity hover:opacity-90"
            style={{ color: 'var(--bb-brand-deep)' }}
          >
            Comecar Trial Gratis
          </Link>
        </div>
      </Section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer
        className="border-t"
        style={{
          borderColor: 'var(--bb-glass-border)',
          backgroundColor: 'var(--bb-depth-2)',
        }}
      >
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          <div>
            <span className="text-xl font-bold">
              Black<span style={{ color: 'var(--bb-brand)' }}>Belt</span>
            </span>
            <p
              className="mt-3 text-sm leading-relaxed"
              style={{ color: 'var(--bb-ink-40)' }}
            >
              Plataforma de gestao inteligente para academias de artes marciais.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider">
              Produto
            </h4>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--bb-ink-40)' }}>
              <li>
                <a href="#funcionalidades" className="transition-colors hover:opacity-80">
                  Funcionalidades
                </a>
              </li>
              <li>
                <Link href="/precos" className="transition-colors hover:opacity-80">
                  Precos
                </Link>
              </li>
              <li>
                <a href="#faq" className="transition-colors hover:opacity-80">
                  FAQ
                </a>
              </li>
              <li>
                <Link href="/status" className="transition-colors hover:opacity-80">
                  Status
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider">
              Empresa
            </h4>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--bb-ink-40)' }}>
              <li>
                <Link href="/sobre" className="transition-colors hover:opacity-80">
                  Sobre
                </Link>
              </li>
              <li>
                <Link href="/contato" className="transition-colors hover:opacity-80">
                  Contato
                </Link>
              </li>
              <li>
                <Link href="/blog" className="transition-colors hover:opacity-80">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/developers" className="transition-colors hover:opacity-80">
                  Developers
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--bb-ink-40)' }}>
              <li>
                <Link href="/termos" className="transition-colors hover:opacity-80">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="/privacidade" className="transition-colors hover:opacity-80">
                  Privacidade
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div
          className="border-t px-5 py-6 text-center text-sm"
          style={{
            borderColor: 'var(--bb-glass-border)',
            color: 'var(--bb-ink-40)',
          }}
        >
          &copy; {new Date().getFullYear()} BlackBelt. Todos os direitos
          reservados. Feito com &#10084;&#65039; por BlackBelt
        </div>
      </footer>
    </div>
  );
}
