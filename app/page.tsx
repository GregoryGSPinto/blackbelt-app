'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { FadeInSection } from '@/components/landing/FadeInSection';
import { DashboardMockup } from '@/components/landing/DashboardMockup';
import { CheckinMockup } from '@/components/landing/CheckinMockup';
import { ParentMockup } from '@/components/landing/ParentMockup';
import { BillingMockup } from '@/components/landing/BillingMockup';
import { WhatsAppFAB } from '@/components/landing/WhatsAppFAB';

/* ── FAQ Accordion ── */
const FAQ_ITEMS = [
  { q: 'Preciso de cartão de crédito para começar?', a: 'Não. O trial de 7 dias é 100% grátis. Você só informa dados de pagamento quando escolher um plano.' },
  { q: 'Funciona para qualquer arte marcial?', a: 'Sim. Jiu-Jitsu, Judô, Karatê, MMA, Muay Thai, Taekwondo — qualquer modalidade.' },
  { q: 'Como funciona o check-in dos alunos?', a: 'O aluno abre o app, escaneia o QR Code na academia, e a presença é registrada. Leva 3 segundos.' },
  { q: 'E se eu já uso outro sistema?', a: 'Sem problema. Você pode rodar os dois em paralelo durante o trial. Se gostar, migramos seus dados.' },
  { q: 'Tem contrato de fidelidade?', a: 'Não. Cancele quando quiser, sem multa.' },
  { q: 'Funciona no celular?', a: 'Sim. Web app que funciona em qualquer celular. Também disponível para iOS e Android.' },
  { q: 'Meus alunos precisam baixar alguma coisa?', a: 'Não obrigatoriamente. O app funciona no navegador do celular. Mas se quiserem, podem instalar direto da tela.' },
  { q: 'Como funciona o suporte?', a: 'WhatsApp direto com a equipe. Resposta em até 24h úteis.' },
];

/* ── Product Tabs ── */
const PRODUCT_TABS = [
  { id: 'dashboard', label: 'Dashboard do Admin', desc: 'KPIs em tempo real. Receita, presença, inadimplência. No celular.' },
  { id: 'checkin', label: 'Check-in por QR Code', desc: 'Aluno chegou? 3 segundos e a presença está registrada.' },
  { id: 'pais', label: 'Painel do Responsável', desc: 'Pais acompanham tudo. Presença, evolução, pagamentos. Sem ligar pra academia.' },
  { id: 'financeiro', label: 'Cobranças Automáticas', desc: 'PIX e boleto automáticos. Lembrete antes do vencimento. Zero constrangimento.' },
];

/* ── Profile Cards ── */
const PROFILES = [
  { emoji: '🏢', name: 'Admin', keywords: 'Dashboard, turmas, financeiro' },
  { emoji: '🥋', name: 'Professor', keywords: 'Modo aula, avaliações, técnicas' },
  { emoji: '💪', name: 'Aluno', keywords: 'Check-in, progresso, conquistas' },
  { emoji: '🎮', name: 'Teen', keywords: 'XP, ranking, desafios' },
  { emoji: '⭐', name: 'Kids', keywords: 'Estrelas, figurinhas, diversão' },
  { emoji: '👨‍👩‍👧', name: 'Pais', keywords: 'Presença, evolução, pagamentos' },
];

/* ── FAQ Accordion Component ── */
function FAQItem({ item }: { item: { q: string; a: string } }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="overflow-hidden rounded-xl transition-colors duration-200"
      style={{
        background: 'var(--bb-depth-2)',
        border: '1px solid var(--bb-glass-border)',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium sm:text-base"
        style={{ color: 'var(--bb-ink-100)' }}
        aria-expanded={open}
      >
        <span className="pr-4">{item.q}</span>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 transition-transform duration-200"
          style={{ color: 'var(--bb-ink-40)', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div
        className="overflow-hidden transition-all duration-200"
        style={{ maxHeight: open ? '300px' : '0px', opacity: open ? 1 : 0 }}
      >
        <p className="px-5 pb-4 text-sm leading-relaxed" style={{ color: 'var(--bb-ink-60)' }}>
          {item.a}
        </p>
      </div>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* ━━━ LANDING PAGE ━━━ */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="landing-page w-full overflow-x-hidden" style={{ background: 'var(--bb-depth-1)', color: 'var(--bb-ink-100)' }}>
      <LandingNavbar />
      <WhatsAppFAB />

      {/* ━━━ 1. HERO ━━━ */}
      <section
        className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-24 pb-16 lg:flex-row lg:gap-12 lg:px-8 lg:pt-32 lg:pb-24"
        style={{ minHeight: '100dvh' }}
      >
        {/* Subtle radial glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 60% 40% at 30% 30%, rgba(198,40,40,0.05) 0%, transparent 70%)' }}
          aria-hidden="true"
        />

        {/* Text */}
        <div className="relative z-10 flex flex-col items-center text-center lg:flex-1 lg:items-start lg:text-left">
          <h1
            className="text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl"
            style={{ letterSpacing: '-0.03em' }}
          >
            Sua academia funcionando no automático.
          </h1>
          <p
            className="mt-5 max-w-xl text-base leading-relaxed sm:text-lg"
            style={{ color: 'var(--bb-ink-60)' }}
          >
            Check-in, turmas, cobranças e presença — tudo num app que seus alunos e professores vão amar.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:items-start">
            <Link
              href="/cadastrar-academia"
              className="inline-flex items-center justify-center rounded-xl px-8 py-4 text-sm font-bold uppercase tracking-wider text-white transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: '#C62828', boxShadow: '0 4px 24px rgba(198,40,40,0.3)' }}
            >
              COMEÇAR GRÁTIS — 7 DIAS
            </Link>
          </div>
          <p className="mt-3 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
            Sem cartão de crédito. Cancele quando quiser.
          </p>
        </div>

        {/* Dashboard Mockup */}
        <FadeInSection delay={200} direction="right" className="relative z-10 mt-12 lg:mt-0 lg:flex-1">
          <DashboardMockup />
        </FadeInSection>
      </section>

      {/* ━━━ 2. PROBLEMA → SOLUÇÃO ━━━ */}
      <section className="px-4 py-24 sm:px-6 lg:py-32" style={{ background: 'var(--bb-depth-2)' }}>
        <FadeInSection>
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
              Você não abriu uma academia pra virar cobrador.
            </h2>

            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <FadeInSection delay={0}>
                <div className="rounded-2xl p-6 h-full" style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)' }}>
                  <span className="text-3xl">📋</span>
                  <h3 className="mt-3 text-lg font-bold">Caderno e WhatsApp</h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--bb-ink-60)' }}>
                    Controle de presença no papel. Cobrança por mensagem. Lista de alunos na planilha. Você sabe que precisa mudar.
                  </p>
                </div>
              </FadeInSection>
              <FadeInSection delay={100}>
                <div className="rounded-2xl p-6 h-full" style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)' }}>
                  <span className="text-3xl">💸</span>
                  <h3 className="mt-3 text-lg font-bold">Inadimplência que dói</h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--bb-ink-60)' }}>
                    Todo mês é a mesma história: aluno que sumiu, mensalidade atrasada, cobrança constrangedora. Isso consome seu tempo e energia.
                  </p>
                </div>
              </FadeInSection>
              <FadeInSection delay={200}>
                <div className="rounded-2xl p-6 h-full sm:col-span-2 lg:col-span-1" style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)' }}>
                  <span className="text-3xl">😰</span>
                  <h3 className="mt-3 text-lg font-bold">Sem visão do negócio</h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--bb-ink-60)' }}>
                    Quantos alunos você tem de verdade? Qual sua taxa de retenção? Quanto entrou este mês? Se você não sabe, está voando às cegas.
                  </p>
                </div>
              </FadeInSection>
            </div>

            <FadeInSection delay={300}>
              <p
                className="mt-12 text-center text-lg font-semibold sm:text-xl"
                style={{ color: '#C62828' }}
              >
                O BlackBelt resolve tudo isso. Em um app.
              </p>
            </FadeInSection>
          </div>
        </FadeInSection>
      </section>

      {/* ━━━ 3. PRODUTO — MOCKUPS EM TABS ━━━ */}
      <section id="funcionalidades" className="px-4 py-24 sm:px-6 lg:py-32">
        <FadeInSection>
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
              Veja como funciona
            </h2>

            {/* Tabs */}
            <div className="mt-10 flex flex-wrap justify-center gap-2">
              {PRODUCT_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200"
                  style={{
                    background: activeTab === tab.id ? 'rgba(198,40,40,0.1)' : 'transparent',
                    color: activeTab === tab.id ? '#C62828' : 'var(--bb-ink-60)',
                    border: activeTab === tab.id ? '1px solid rgba(198,40,40,0.3)' : '1px solid transparent',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="mt-10 flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:gap-12">
              <div className="flex-1">
                {activeTab === 'dashboard' && <DashboardMockup />}
                {activeTab === 'checkin' && <CheckinMockup />}
                {activeTab === 'pais' && <ParentMockup />}
                {activeTab === 'financeiro' && <BillingMockup />}
              </div>
              <div className="flex-1 text-center lg:text-left lg:pt-8">
                <h3 className="text-xl font-bold sm:text-2xl">
                  {PRODUCT_TABS.find((t) => t.id === activeTab)?.label}
                </h3>
                <p className="mt-3 text-base leading-relaxed" style={{ color: 'var(--bb-ink-60)' }}>
                  {PRODUCT_TABS.find((t) => t.id === activeTab)?.desc}
                </p>
                <Link
                  href="/cadastrar-academia"
                  className="mt-6 inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5"
                  style={{ background: '#C62828' }}
                >
                  Testar Grátis
                </Link>
              </div>
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ━━━ 4. PERFIS — 6 CARDS COMPACTOS ━━━ */}
      <section id="perfis" className="px-4 py-24 sm:px-6 lg:py-32" style={{ background: 'var(--bb-depth-2)' }}>
        <FadeInSection>
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
              Cada pessoa tem sua experiência
            </h2>
            <p className="mt-3 text-center text-base" style={{ color: 'var(--bb-ink-60)' }}>
              9 perfis especializados. Cada um vê só o que precisa.
            </p>

            <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:gap-6">
              {PROFILES.map((profile, i) => (
                <FadeInSection key={profile.name} delay={i * 80}>
                  <div
                    className="flex flex-col items-center rounded-2xl p-5 text-center transition-all duration-200 hover:-translate-y-1"
                    style={{
                      background: 'var(--bb-depth-3)',
                      border: '1px solid var(--bb-glass-border)',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(198,40,40,0.4)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--bb-glass-border)'; }}
                  >
                    <span className="text-3xl">{profile.emoji}</span>
                    <h3 className="mt-2 text-sm font-bold">{profile.name}</h3>
                    <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>{profile.keywords}</p>
                  </div>
                </FadeInSection>
              ))}
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ━━━ 5. DEPOIMENTOS HONESTOS ━━━ */}
      <section className="px-4 py-24 sm:px-6 lg:py-32" style={{ background: 'var(--bb-depth-2)' }}>
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
              Feito por quem entende o tatame
            </h2>
            <div
              className="mx-auto mt-10 rounded-2xl p-8 text-left sm:p-10"
              style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)' }}
            >
              <p className="text-base leading-relaxed italic sm:text-lg" style={{ color: 'var(--bb-ink-80)' }}>
                &ldquo;O BlackBelt foi criado por praticantes de artes marciais que vivem o dia a dia de uma academia. Cada funcionalidade foi pensada para resolver problemas reais — não por um time de tech que nunca pisou num tatame.&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ background: '#C62828' }}
                >
                  G
                </div>
                <div>
                  <p className="text-sm font-semibold">Gregory Pinto</p>
                  <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>Fundador</p>
                </div>
              </div>
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ━━━ 7. FAQ ━━━ */}
      <section id="faq" className="px-4 py-24 sm:px-6 lg:py-32">
        <FadeInSection>
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
              Perguntas Frequentes
            </h2>

            <div className="mt-12 space-y-3">
              {FAQ_ITEMS.map((item) => (
                <FAQItem key={item.q} item={item} />
              ))}
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ━━━ 8. CTA FINAL ━━━ */}
      <section
        className="px-4 py-24 sm:px-6 lg:py-32"
        style={{ background: 'linear-gradient(180deg, rgba(198,40,40,0.06) 0%, var(--bb-depth-1) 100%)' }}
      >
        <FadeInSection>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
              Pronto para tirar sua academia do papel?
            </h2>
            <p className="mt-4 text-base" style={{ color: 'var(--bb-ink-60)' }}>
              7 dias grátis. Sem cartão. Sem compromisso.
            </p>
            <Link
              href="/cadastrar-academia"
              className="mt-8 inline-flex items-center justify-center rounded-xl px-10 py-4 text-base font-bold uppercase tracking-wider text-white transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: '#C62828', boxShadow: '0 4px 24px rgba(198,40,40,0.3)' }}
            >
              COMEÇAR AGORA
            </Link>
            <p className="mt-4 text-sm" style={{ color: 'var(--bb-ink-40)' }}>
              Ou{' '}
              <a
                href="https://wa.me/5531996793625?text=Olá! Quero saber mais sobre o BlackBelt"
                target="_blank"
                rel="noopener noreferrer"
                className="underline transition-colors duration-200"
                style={{ color: 'var(--bb-ink-60)' }}
              >
                fale com a gente pelo WhatsApp
              </a>
            </p>
          </div>
        </FadeInSection>
      </section>

      {/* ━━━ 9. FOOTER ━━━ */}
      <footer style={{ background: 'var(--bb-depth-2)', borderTop: '1px solid var(--bb-glass-border)' }}>
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div>
              <span className="text-lg font-extrabold tracking-tight" style={{ color: '#C62828' }}>
                BLACKBELT
              </span>
              <p className="mt-2 text-sm" style={{ color: 'var(--bb-ink-40)' }}>
                Gestão de academias de artes marciais
              </p>
            </div>

            {/* Produto */}
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>
                Produto
              </h4>
              <ul className="space-y-2">
                <li><a href="#funcionalidades" className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>Funcionalidades</a></li>
                <li><a href="#faq" className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>FAQ</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>
                Legal
              </h4>
              <ul className="space-y-2">
                <li><Link href="/termos" className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>Termos de Uso</Link></li>
                <li><Link href="/privacidade" className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>Privacidade</Link></li>
              </ul>
            </div>

            {/* Contato */}
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>
                Contato
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://wa.me/5531996793625"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm"
                    style={{ color: 'var(--bb-ink-60)' }}
                  >
                    WhatsApp — (31) 99679-3625
                  </a>
                </li>
                <li>
                  <a href="mailto:gregoryguimaraes12@gmail.com" className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                    Email
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div
            className="mt-10 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row"
            style={{ borderColor: 'var(--bb-glass-border)' }}
          >
            <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
              &copy; 2026 BlackBelt. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
