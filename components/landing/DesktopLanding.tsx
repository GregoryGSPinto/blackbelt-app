'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import {
  ChevronDown, Check, Send,
  Users, QrCode, Video, DollarSign, Award, Layers,
  LayoutDashboard, GraduationCap, Gamepad2, Star, Heart,
} from 'lucide-react';

/* ━━━ Data ━━━ */

const NAV_LINKS = [
  { label: 'Funcionalidades', href: '#dt-features' },
  { label: 'Por Perfil', href: '#dt-profiles' },
  { label: 'FAQ', href: '#dt-faq' },
  { label: 'Contato', href: '#dt-contato' },
];

const FEATURES = [
  {
    icon: <Users size={24} />,
    title: 'Gestao de Turmas',
    description: 'Crie turmas por modalidade, nivel e horario. Controle capacidade, lista de espera e frequencia em tempo real.',
  },
  {
    icon: <QrCode size={24} />,
    title: 'Controle de Presenca',
    description: 'Check-in por QR code, reconhecimento facial ou lista. Relatorios automaticos de frequencia e assiduidade.',
  },
  {
    icon: <Video size={24} />,
    title: 'Aulas em Streaming',
    description: 'Transmita aulas ao vivo, grave tecnicas e monte uma biblioteca de videos para seus alunos.',
  },
  {
    icon: <DollarSign size={24} />,
    title: 'Financeiro Completo',
    description: 'Cobrancas automatizadas via PIX e cartao. Controle inadimplencia, receita e fluxo de caixa.',
  },
  {
    icon: <Award size={24} />,
    title: 'Sistema de Graduacao',
    description: 'Gerencie faixas, stripes e avaliacoes. Historico completo de evolucao e cerimonias de graduacao.',
  },
  {
    icon: <Layers size={24} />,
    title: 'Multi-perfil',
    description: 'Visoes dedicadas para Admin, Professor, Aluno Adulto, Teen, Kids e Responsavel. Cada um ve o que precisa.',
  },
];

const PROFILES = [
  {
    label: 'Administrador',
    icon: <LayoutDashboard size={18} />,
    items: [
      'Dashboard com metricas de receita, frequencia e retencao em tempo real',
      'Gestao financeira completa com cobrancas automatizadas e relatorios',
      'Controle de turmas, professores, modalidades e multiplas unidades',
    ],
  },
  {
    label: 'Professor',
    icon: <GraduationCap size={18} />,
    items: [
      'Modo aula com chamada por QR code e timer de rounds',
      'Avaliacao tecnica com grafico radar de 8 criterios',
      'Biblioteca de videos organizados por turma e nivel',
    ],
  },
  {
    label: 'Aluno',
    icon: <Award size={18} />,
    items: [
      'Check-in inteligente por QR code',
      'Acompanhamento de jornada de faixa e evolucao',
      'Sistema de conquistas e badges',
    ],
  },
  {
    label: 'Teen',
    icon: <Gamepad2 size={18} />,
    items: [
      'XP por treino com ranking e season pass',
      'Desafios semanais e competicoes',
      'Interface gamificada com levels',
    ],
  },
  {
    label: 'Kids',
    icon: <Star size={18} />,
    items: [
      'Estrelas por aula e album de figurinhas',
      'Mascote pessoal e loja de recompensas',
      'Interface ludica e divertida',
    ],
  },
  {
    label: 'Responsavel',
    icon: <Heart size={18} />,
    items: [
      'Agenda familiar com aulas de todos os filhos',
      'Chat direto com professor',
      'Relatorios mensais de evolucao',
    ],
  },
];

const TESTIMONIALS = [
  {
    quote: 'Desde que adotamos o BlackBelt, a inadimplencia caiu 40% e o engajamento dos alunos subiu muito. A automacao mudou nossa academia.',
    name: 'Prof. Ricardo Almeida',
    role: 'Proprietario',
    academy: 'Alliance BJJ Centro',
    initial: 'P',
  },
  {
    quote: 'A automacao de cobrancas economiza 10 horas por semana. Melhor investimento que fiz para minha academia nos ultimos anos.',
    name: 'Sensei Marcos Tanaka',
    role: 'Proprietario',
    academy: 'Tanaka Dojo',
    initial: 'S',
  },
  {
    quote: 'Meus alunos adoram o app. O sistema de conquistas e faixas digitais mudou completamente a motivacao dos treinos.',
    name: 'Mestre Ana Luiza',
    role: 'Professora',
    academy: 'Arte Suave Academy',
    initial: 'M',
  },
];

const FAQ_ITEMS = [
  { q: 'Preciso de cartao de credito para comecar?', a: 'Nao! O trial de 7 dias e totalmente gratuito e nao exige cartao de credito. Voce so cadastra um meio de pagamento quando decidir continuar.' },
  { q: 'Funciona para qualquer arte marcial?', a: 'Sim. BJJ, Judo, Karate, Muay Thai, Boxe, Taekwondo, MMA e qualquer outra modalidade. O sistema se adapta a sua academia.' },
  { q: 'Como funciona o check-in dos alunos?', a: 'O aluno escaneia um QR code na recepcao com o celular. A presenca e registrada automaticamente no sistema, sem papel e sem fila.' },
  { q: 'Posso migrar de outra plataforma?', a: 'Sim. Nossa equipe ajuda na importacao de dados de alunos, turmas e historico. O processo e simples e acompanhado.' },
  { q: 'Tem contrato de fidelidade?', a: 'Nao. Todos os planos sao mensais, sem fidelidade. Voce pode cancelar a qualquer momento, sem multa.' },
  { q: 'O sistema funciona no celular?', a: 'Sim. O BlackBelt e 100% responsivo e funciona como app nativo no celular (iOS e Android) via PWA. Tambem pode ser acessado pelo navegador.' },
  { q: 'Como funciona o suporte?', a: 'Suporte via chat, email e WhatsApp. Planos Pro e Black Belt tem suporte prioritario com tempo de resposta reduzido.' },
  { q: 'Posso gerenciar multiplas unidades?', a: 'Sim. Os planos Black Belt e Enterprise suportam gestao multi-unidade com dashboard consolidado, comparativos e permissoes por unidade.' },
];

const STATS = [
  { value: '500+', label: 'Academias' },
  { value: '25.000+', label: 'Alunos ativos' },
  { value: '4.9', label: 'Avaliacao media' },
];

const FOOTER_LINKS = {
  produto: [
    { label: 'Funcionalidades', href: '#dt-features' },
    { label: 'FAQ', href: '#dt-faq' },
    { label: 'Contato', href: '#dt-contato' },
    { label: 'Status', href: '#' },
  ],
  empresa: [
    { label: 'Sobre', href: '#' },
    { label: 'Comecar Gratis', href: '/comecar' },
    { label: 'Blog', href: '#' },
  ],
  legal: [
    { label: 'Termos de Uso', href: '/termos' },
    { label: 'Privacidade', href: '/privacidade' },
  ],
};

/* ━━━ Component ━━━ */

interface DesktopLandingProps {
  onLoginClick: () => void;
}

export function DesktopLanding({ onLoginClick }: DesktopLandingProps) {
  const [activeProfile, setActiveProfile] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({ nome: '', email: '', telefone: '', assunto: '', mensagem: '' });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSent, setContactSent] = useState(false);

  function scrollTo(href: string) {
    if (href.startsWith('#')) {
      const el = document.getElementById(href.slice(1));
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  async function handleContactSubmit(e: FormEvent) {
    e.preventDefault();
    if (!contactForm.nome.trim() || !contactForm.email.trim() || !contactForm.mensagem.trim()) return;
    setContactLoading(true);
    try {
      await fetch('/api/contato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      setContactSent(true);
    } catch {
      // silent fail
    } finally {
      setContactLoading(false);
    }
  }

  return (
    <div style={{ background: 'var(--bb-depth-1)', color: 'var(--bb-ink-100)' }}>

      {/* ━━━ NAV ━━━ */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 xl:px-16"
        style={{
          background: 'rgba(10, 10, 10, 0.85)',
          backdropFilter: 'blur(16px) saturate(1.3)',
          WebkitBackdropFilter: 'blur(16px) saturate(1.3)',
          borderBottom: '1px solid var(--bb-glass-border)',
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black text-white"
            style={{ background: 'var(--bb-brand)' }}
          >
            BB
          </span>
          <span className="text-lg font-extrabold" style={{ color: 'var(--bb-ink-100)', letterSpacing: '-0.03em' }}>
            BlackBelt
          </span>
        </div>

        <nav className="flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <button
              key={link.label}
              type="button"
              onClick={() => scrollTo(link.href)}
              className="border-none bg-transparent text-sm font-medium transition-colors duration-200"
              style={{ color: 'var(--bb-ink-60)', cursor: 'pointer' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--bb-ink-100)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--bb-ink-60)'; }}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onLoginClick}
            className="border-none bg-transparent text-sm font-medium transition-colors duration-200"
            style={{ color: 'var(--bb-ink-80)', cursor: 'pointer' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--bb-ink-100)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--bb-ink-80)'; }}
          >
            Entrar
          </button>
          <Link
            href="/comecar"
            className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: 'var(--bb-brand-gradient)' }}
          >
            Comecar Gratis
          </Link>
        </div>
      </header>

      {/* ━━━ HERO ━━━ */}
      <section className="flex flex-col items-center px-8 pb-24 pt-20 text-center xl:px-16 xl:pt-28 xl:pb-32">
        <span
          className="mb-6 inline-block rounded-full px-4 py-1.5 text-xs font-medium"
          style={{ background: 'var(--bb-brand-surface)', color: 'var(--bb-brand)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          7 dias gratis — sem cartao de credito
        </span>

        <h1
          className="mx-auto max-w-4xl font-extrabold leading-tight tracking-tight"
          style={{ fontSize: 'clamp(2.25rem, 1.5rem + 2.5vw, 4rem)' }}
        >
          O software que toda academia de artes marciais precisa
        </h1>

        <p
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed xl:text-xl"
          style={{ color: 'var(--bb-ink-60)' }}
        >
          Gestao completa. Do tatame ao financeiro. Turmas, presencas, cobrancas, faixas e IA — tudo em uma plataforma feita para quem vive artes marciais.
        </p>

        <div className="mt-10 flex items-center gap-4">
          <Link
            href="/comecar"
            className="rounded-xl px-8 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: 'var(--bb-brand-gradient)', boxShadow: '0 4px 24px rgba(239,68,68,0.25)' }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--bb-brand-glow)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 24px rgba(239,68,68,0.25)'; }}
          >
            Comecar Trial Gratis
          </Link>
          <button
            type="button"
            onClick={() => scrollTo('#dt-contato')}
            className="rounded-xl px-8 py-3.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: 'var(--bb-depth-3)',
              border: '1px solid var(--bb-glass-border)',
              color: 'var(--bb-ink-80)',
              cursor: 'pointer',
            }}
          >
            Falar com a Gente
          </button>
        </div>

        {/* Stats */}
        <div className="mt-16 flex items-center gap-12 xl:gap-16">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-extrabold xl:text-4xl" style={{ color: 'var(--bb-ink-100)' }}>
                {stat.value}
              </p>
              <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-40)' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ━━━ FEATURES ━━━ */}
      <section
        id="dt-features"
        className="px-8 py-24 xl:px-16 xl:py-32"
        style={{ background: 'var(--bb-depth-2)' }}
      >
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-sm font-semibold uppercase tracking-widest" style={{ color: 'var(--bb-brand)' }}>
            Funcionalidades
          </p>
          <h2 className="mt-4 text-center text-3xl font-bold tracking-tight xl:text-4xl">
            Tudo que sua academia precisa, em um so lugar
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base" style={{ color: 'var(--bb-ink-60)' }}>
            Modulos integrados que cobrem 100% da operacao, do check-in a gestao financeira.
          </p>

          <div className="mt-16 grid grid-cols-2 gap-6 xl:grid-cols-3 xl:gap-8">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl p-7 transition-all duration-200 hover:-translate-y-1 xl:p-8"
                style={{
                  background: 'var(--bb-depth-3)',
                  border: '1px solid var(--bb-glass-border)',
                }}
              >
                <div
                  className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ background: 'var(--bb-brand-surface)', color: 'var(--bb-brand)' }}
                >
                  {feature.icon}
                </div>
                <h4 className="text-lg font-semibold">{feature.title}</h4>
                <p className="mt-2 text-sm leading-relaxed xl:text-base" style={{ color: 'var(--bb-ink-60)' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ PROFILES ━━━ */}
      <section
        id="dt-profiles"
        className="px-8 py-24 xl:px-16 xl:py-32"
        style={{ background: 'var(--bb-depth-1)' }}
      >
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-sm font-semibold uppercase tracking-widest" style={{ color: 'var(--bb-brand)' }}>
            Por Perfil
          </p>
          <h2 className="mt-4 text-center text-3xl font-bold tracking-tight xl:text-4xl">
            Uma experiencia para cada tipo de usuario
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base" style={{ color: 'var(--bb-ink-60)' }}>
            Cada perfil tem sua propria interface, otimizada para suas necessidades.
          </p>

          {/* Tabs */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
            {PROFILES.map((profile, i) => (
              <button
                key={profile.label}
                type="button"
                onClick={() => setActiveProfile(i)}
                className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-200"
                style={{
                  background: i === activeProfile ? 'var(--bb-brand-surface)' : 'transparent',
                  border: i === activeProfile ? '1px solid rgba(239,68,68,0.3)' : '1px solid transparent',
                  color: i === activeProfile ? 'var(--bb-brand)' : 'var(--bb-ink-60)',
                  cursor: 'pointer',
                }}
              >
                {profile.icon}
                {profile.label}
              </button>
            ))}
          </div>

          {/* Active profile content */}
          <div
            className="mx-auto mt-10 max-w-2xl rounded-2xl p-8 xl:p-10"
            style={{
              background: 'var(--bb-depth-2)',
              border: '1px solid var(--bb-glass-border)',
            }}
          >
            <h3 className="mb-6 text-xl font-bold">{PROFILES[activeProfile].label}</h3>
            <div className="flex flex-col gap-4">
              {PROFILES[activeProfile].items.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <Check size={18} className="mt-0.5 shrink-0" style={{ color: 'var(--bb-brand)' }} />
                  <p className="text-base leading-relaxed" style={{ color: 'var(--bb-ink-80)' }}>
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ TESTIMONIALS ━━━ */}
      <section
        className="px-8 py-24 xl:px-16 xl:py-32"
        style={{ background: 'var(--bb-depth-2)' }}
      >
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-sm font-semibold uppercase tracking-widest" style={{ color: 'var(--bb-brand)' }}>
            Depoimentos
          </p>
          <h2 className="mt-4 text-center text-3xl font-bold tracking-tight xl:text-4xl">
            Usado por 500+ academias em todo o Brasil
          </h2>

          <div className="mt-16 grid grid-cols-3 gap-6 xl:gap-8">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl p-7 transition-all duration-200 hover:-translate-y-1 xl:p-8"
                style={{
                  background: 'var(--bb-depth-3)',
                  border: '1px solid var(--bb-glass-border)',
                }}
              >
                <p className="text-base italic leading-relaxed" style={{ color: 'var(--bb-ink-80)' }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ background: 'var(--bb-brand)' }}
                  >
                    {t.initial}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                      {t.role} · {t.academy}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ FAQ ━━━ */}
      <section
        id="dt-faq"
        className="px-8 py-24 xl:px-16 xl:py-32"
        style={{ background: 'var(--bb-depth-2)' }}
      >
        <div className="mx-auto max-w-3xl">
          <p className="text-center text-sm font-semibold uppercase tracking-widest" style={{ color: 'var(--bb-brand)' }}>
            FAQ
          </p>
          <h2 className="mt-4 text-center text-3xl font-bold tracking-tight xl:text-4xl">
            Perguntas Frequentes
          </h2>

          <div className="mt-12 flex flex-col gap-3">
            {FAQ_ITEMS.map((item, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-xl transition-colors duration-200"
                style={{
                  background: 'var(--bb-depth-3)',
                  border: '1px solid var(--bb-glass-border)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-medium transition-colors duration-200 xl:text-base"
                  style={{ background: 'transparent', border: 'none', color: 'var(--bb-ink-100)', cursor: 'pointer' }}
                >
                  {item.q}
                  <ChevronDown
                    size={18}
                    className="shrink-0 transition-transform duration-200"
                    style={{
                      color: 'var(--bb-ink-40)',
                      transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)',
                    }}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5">
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--bb-ink-60)' }}>
                      {item.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ CONTATO ━━━ */}
      <section
        id="dt-contato"
        className="px-8 py-24 xl:px-16 xl:py-32"
        style={{ background: 'var(--bb-depth-1)' }}
      >
        <div className="mx-auto max-w-2xl">
          <p className="text-center text-sm font-semibold uppercase tracking-widest" style={{ color: 'var(--bb-brand)' }}>
            Contato
          </p>
          <h2 className="mt-4 text-center text-3xl font-bold tracking-tight xl:text-4xl">
            Fale com a gente
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-center text-base" style={{ color: 'var(--bb-ink-60)' }}>
            Tem alguma duvida ou quer saber mais? Envie uma mensagem e retornamos em ate 24h.
          </p>

          {contactSent ? (
            <div
              className="mt-12 rounded-2xl p-10 text-center"
              style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}
            >
              <div
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                style={{ background: 'var(--bb-brand-surface)' }}
              >
                <Check size={28} style={{ color: 'var(--bb-brand)' }} />
              </div>
              <h3 className="text-xl font-bold">Mensagem enviada!</h3>
              <p className="mt-2 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                Nossa equipe vai responder em breve.
              </p>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="mt-12 flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Nome *</label>
                  <input
                    type="text"
                    placeholder="Seu nome"
                    value={contactForm.nome}
                    onChange={(e) => setContactForm((p) => ({ ...p, nome: e.target.value }))}
                    required
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-[var(--bb-brand)]/30"
                    style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Email *</label>
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm((p) => ({ ...p, email: e.target.value }))}
                    required
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-[var(--bb-brand)]/30"
                    style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Telefone</label>
                  <input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={contactForm.telefone}
                    onChange={(e) => setContactForm((p) => ({ ...p, telefone: e.target.value }))}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-[var(--bb-brand)]/30"
                    style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Assunto</label>
                  <input
                    type="text"
                    placeholder="Ex: Duvida sobre planos"
                    value={contactForm.assunto}
                    onChange={(e) => setContactForm((p) => ({ ...p, assunto: e.target.value }))}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-[var(--bb-brand)]/30"
                    style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Mensagem *</label>
                <textarea
                  placeholder="Escreva sua mensagem..."
                  value={contactForm.mensagem}
                  onChange={(e) => setContactForm((p) => ({ ...p, mensagem: e.target.value }))}
                  required
                  rows={4}
                  className="w-full resize-none rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-[var(--bb-brand)]/30"
                  style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
                />
              </div>
              <button
                type="submit"
                disabled={contactLoading}
                className="flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:opacity-90 disabled:opacity-50"
                style={{ background: 'var(--bb-brand-gradient)' }}
              >
                {contactLoading ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Send size={16} />
                    Enviar Mensagem
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ━━━ CTA FINAL ━━━ */}
      <section
        className="px-8 py-24 text-center xl:px-16 xl:py-32"
        style={{
          background: 'linear-gradient(180deg, var(--bb-depth-1) 0%, var(--bb-depth-2) 50%, var(--bb-depth-1) 100%)',
        }}
      >
        <h2 className="text-3xl font-bold tracking-tight xl:text-4xl">
          Pronto para transformar sua academia?
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-base" style={{ color: 'var(--bb-ink-60)' }}>
          Junte-se a mais de 500 academias que ja usam o BlackBelt. Comece seu trial de 7 dias gratis hoje.
        </p>

        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/comecar"
            className="rounded-xl px-8 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: 'var(--bb-brand-gradient)', boxShadow: '0 4px 24px rgba(239,68,68,0.25)' }}
          >
            Comecar Trial Gratis
          </Link>
          <button
            type="button"
            onClick={() => scrollTo('#dt-contato')}
            className="rounded-xl px-8 py-3.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: 'var(--bb-depth-3)',
              border: '1px solid var(--bb-glass-border)',
              color: 'var(--bb-ink-80)',
              cursor: 'pointer',
            }}
          >
            Falar com a Gente
          </button>
        </div>
      </section>

      {/* ━━━ FOOTER ━━━ */}
      <footer
        id="dt-footer"
        className="px-8 py-16 xl:px-16"
        style={{ background: 'var(--bb-depth-0)', borderTop: '1px solid var(--bb-glass-border)' }}
      >
        <div className="mx-auto grid max-w-6xl grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black text-white"
                style={{ background: 'var(--bb-brand)' }}
              >
                BB
              </span>
              <div>
                <span className="block text-sm font-extrabold" style={{ letterSpacing: '-0.03em' }}>Black</span>
                <span className="block text-sm font-extrabold" style={{ letterSpacing: '-0.03em' }}>Belt</span>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--bb-ink-40)' }}>
              Plataforma completa de gestao para academias de artes marciais. Do tatame ao financeiro, tudo em um so lugar.
            </p>
          </div>

          {/* Produto */}
          <div>
            <h5 className="mb-4 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--bb-ink-40)' }}>
              Produto
            </h5>
            <ul className="flex flex-col gap-3">
              {FOOTER_LINKS.produto.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors duration-200"
                    style={{ color: 'var(--bb-ink-60)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--bb-ink-100)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--bb-ink-60)'; }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h5 className="mb-4 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--bb-ink-40)' }}>
              Empresa
            </h5>
            <ul className="flex flex-col gap-3">
              {FOOTER_LINKS.empresa.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors duration-200"
                    style={{ color: 'var(--bb-ink-60)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--bb-ink-100)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--bb-ink-60)'; }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h5 className="mb-4 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--bb-ink-40)' }}>
              Legal
            </h5>
            <ul className="flex flex-col gap-3">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors duration-200"
                    style={{ color: 'var(--bb-ink-60)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--bb-ink-100)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--bb-ink-60)'; }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className="mx-auto mt-12 max-w-6xl border-t pt-8"
          style={{ borderColor: 'var(--bb-glass-border)' }}
        >
          <p className="text-center text-xs" style={{ color: 'var(--bb-ink-20)' }}>
            &copy; 2026 BlackBelt. Todos os direitos reservados.
          </p>
          <p className="mt-2 text-center text-xs" style={{ color: 'var(--bb-ink-20)' }}>
            Feito com 🥋 por BlackBelt
          </p>
        </div>
      </footer>
    </div>
  );
}
