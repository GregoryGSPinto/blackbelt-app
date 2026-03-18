'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/lib/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  QrCode, Award, Trophy, Target, Video, BarChart3,
  GraduationCap, BookOpen, Clipboard, Eye, AlertTriangle, Users as UsersIcon,
  Calendar, MessageCircle, FileText, ShieldCheck,
  LayoutDashboard, DollarSign, Users, Smartphone,
  Clock, Tv, Gamepad2, Send,
} from 'lucide-react';
import { ScrollDownArrow } from '@/components/landing/ScrollDownArrow';
import { LandingHero } from '@/components/landing/LandingHero';
import { BenefitSection } from '@/components/landing/BenefitSection';
import { TeenKidsSection } from '@/components/landing/TeenKidsSection';
import { TestimonialCarousel } from '@/components/landing/TestimonialCarousel';
import { CTAFinal } from '@/components/landing/CTAFinal';
import { LandingFooter } from '@/components/landing/LandingFooter';

// ── Rotating inspirational phrases (desktop only) ────────────────────
const PHRASES = [
  'Evolua a cada treino.',
  'O tatame ensina mais que tecnica.',
  'Disciplina no treino, excelencia na vida.',
  'A faixa e so o comeco da jornada.',
  'Cada repeticao te faz mais forte.',
];

export default function LoginPage() {
  const router = useRouter();
  const { login, selectProfile } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);

  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  // Rotate phrases every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % PHRASES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (shake) {
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [shake]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Preencha email e senha.');
      setShake(true);
      return;
    }

    setLoading(true);
    try {
      const profiles = await login(email, password);
      setSuccess(true);
      await new Promise((resolve) => setTimeout(resolve, 400));

      if (profiles.length === 1) {
        await selectProfile(profiles[0].id);
      } else {
        router.push('/selecionar-perfil');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer login.';
      setError(message);
      setShake(true);
      toast(message, 'error');
      setLoading(false);
    }
  }

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes bb-login-card-in {
              0% { opacity: 0; transform: scale(0.95); filter: blur(8px); }
              100% { opacity: 1; transform: scale(1); filter: blur(0); }
            }
            @keyframes bb-login-element-in {
              0% { opacity: 0; transform: translateY(12px); filter: blur(4px); }
              100% { opacity: 1; transform: translateY(0); filter: blur(0); }
            }
            @keyframes bb-login-fade-in {
              0% { opacity: 0; }
              100% { opacity: 1; }
            }
            @keyframes bb-login-shake {
              0%, 100% { transform: translateX(0); }
              12% { transform: translateX(-8px); }
              25% { transform: translateX(8px); }
              37% { transform: translateX(-4px); }
              50% { transform: translateX(4px); }
              62% { transform: translateX(-2px); }
              75% { transform: translateX(2px); }
            }
            @keyframes bb-login-success {
              0% { transform: scale(1); opacity: 1; }
              100% { transform: scale(0.97); opacity: 0; }
            }
            @keyframes bb-login-shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
            @keyframes bb-phrase-in {
              0% { opacity: 0; transform: translateY(8px); }
              100% { opacity: 1; transform: translateY(0); }
            }

            .bb-stagger { opacity: 0; animation-fill-mode: forwards; }
            .bb-stagger-card { animation: bb-login-card-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.0s forwards; }
            .bb-stagger-logo { animation: bb-login-element-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards; }
            .bb-stagger-tagline { animation: bb-login-fade-in 0.5s ease-out 0.4s forwards; }
            .bb-stagger-email { animation: bb-login-element-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards; }
            .bb-stagger-password { animation: bb-login-element-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.7s forwards; }
            .bb-stagger-button { animation: bb-login-element-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.9s forwards; }
            .bb-stagger-links { animation: bb-login-fade-in 0.5s ease-out 1.1s forwards; }

            .bb-btn-shimmer { position: relative; overflow: hidden; }
            .bb-btn-shimmer::after {
              content: '';
              position: absolute;
              inset: 0;
              background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%);
              animation: bb-login-shimmer 1.5s ease-in-out infinite;
            }

            .bb-phrase-enter {
              animation: bb-phrase-in 0.6s ease-out forwards;
            }

            /* Scroll reveal */
            .scroll-reveal {
              opacity: 0;
              transform: translateY(30px);
              transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1),
                          transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .scroll-reveal.revealed {
              opacity: 1;
              transform: translateY(0);
            }
            .scroll-reveal.revealed > *:nth-child(1) { transition-delay: 0ms; }
            .scroll-reveal.revealed > *:nth-child(2) { transition-delay: 100ms; }
            .scroll-reveal.revealed > *:nth-child(3) { transition-delay: 200ms; }
            .scroll-reveal.revealed > *:nth-child(4) { transition-delay: 300ms; }
          `,
        }}
      />

      <div className="min-h-screen" style={{ backgroundColor: 'var(--bb-depth-1)' }}>
        {/* ═══════════ LOGIN SECTION (100vh) ═══════════ */}
        <section
          id="login-section"
          className="relative flex min-h-screen flex-col items-center justify-center md:flex-row"
          style={{ backgroundColor: 'var(--bb-depth-1)' }}
        >
          {/* ── Desktop Left Side: Motivational ── */}
          <div
            className="hidden w-1/2 flex-col items-center justify-center px-12 md:flex"
            style={{ minHeight: '100vh' }}
          >
            <div className="max-w-md text-center">
              <h2
                className="text-4xl font-extrabold leading-tight lg:text-5xl"
                style={{ color: 'var(--bb-ink-100)' }}
              >
                <span key={phraseIndex} className="bb-phrase-enter inline-block">
                  {PHRASES[phraseIndex]}
                </span>
              </h2>
              <p
                className="mt-4 text-lg leading-relaxed"
                style={{ color: 'var(--bb-ink-60)' }}
              >
                Acompanhe sua jornada, conquiste faixas, treine com proposito.
              </p>

              {/* Decorative belt gradient bar */}
              <div className="mx-auto mt-8 flex gap-1">
                {['#FAFAFA', '#EAB308', '#EA580C', '#16A34A', '#2563EB', '#9333EA', '#92400E', '#0A0A0A'].map((c, i) => (
                  <div
                    key={i}
                    className="h-2 flex-1 rounded-full"
                    style={{
                      backgroundColor: c,
                      opacity: 0.7,
                      animationDelay: `${i * 100}ms`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ── Login Form (centered on mobile, right on desktop) ── */}
          <div className="flex w-full items-center justify-center px-4 py-12 md:w-1/2 md:py-0">
            <div
              className={`bb-stagger w-full ${shake ? '' : success ? '' : 'bb-stagger-card'}`}
              style={{
                maxWidth: 420,
                background: 'var(--bb-depth-3)',
                backdropFilter: 'blur(24px) saturate(1.3)',
                WebkitBackdropFilter: 'blur(24px) saturate(1.3)',
                border: '1px solid var(--bb-glass-border)',
                borderRadius: 24,
                padding: '48px 40px',
                boxShadow: 'var(--bb-shadow-xl)',
                ...(shake
                  ? { animation: 'bb-login-shake 0.3s ease-in-out', opacity: 1 }
                  : success
                    ? { animation: 'bb-login-success 0.3s ease-in-out forwards', opacity: 1 }
                    : {}),
              }}
            >
              {/* Logo */}
              <div className="bb-stagger bb-stagger-logo flex flex-col items-center">
                <h1
                  className="font-display text-4xl font-extrabold"
                  style={{
                    letterSpacing: '-0.03em',
                    color: 'var(--bb-brand)',
                    filter: 'drop-shadow(0 0 30px rgba(239, 68, 68, 0.3))',
                  }}
                >
                  BLACKBELT
                </h1>
                <div
                  className="mt-3"
                  style={{ width: 40, height: 3, borderRadius: 2, background: 'var(--bb-brand)' }}
                />
              </div>

              {/* Tagline */}
              <p
                className="bb-stagger bb-stagger-tagline mt-4 text-center font-sans uppercase"
                style={{ fontSize: 13, letterSpacing: '0.08em', color: 'var(--bb-ink-60)' }}
              >
                Sua jornada nas artes marciais
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
                {/* Email */}
                <div className="bb-stagger bb-stagger-email relative">
                  <span className="pointer-events-none absolute left-4 top-[38px] z-10" style={{ color: 'var(--bb-ink-40)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </span>
                  <Input
                    ref={emailRef}
                    label="Email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    error={error && !email.trim() ? 'Campo obrigatorio' : undefined}
                    className="h-12 border-[var(--bb-glass-border)] bg-[var(--bb-depth-5)] pl-11 text-sm text-[var(--bb-ink-100)] placeholder:text-[var(--bb-ink-40)] focus-visible:border-[var(--bb-brand)] focus-visible:ring-[var(--bb-brand)]/20"
                  />
                </div>

                {/* Password */}
                <div className="bb-stagger bb-stagger-password relative">
                  <span className="pointer-events-none absolute left-4 top-[38px] z-10" style={{ color: 'var(--bb-ink-40)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <Input
                    label="Senha"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    error={error && !password.trim() ? 'Campo obrigatorio' : undefined}
                    className="h-12 border-[var(--bb-glass-border)] bg-[var(--bb-depth-5)] pl-11 text-sm text-[var(--bb-ink-100)] placeholder:text-[var(--bb-ink-40)] focus-visible:border-[var(--bb-brand)] focus-visible:ring-[var(--bb-brand)]/20"
                  />
                </div>

                {/* Error */}
                {error && email.trim() && password.trim() && (
                  <p className="text-center text-[13px]" style={{ color: 'var(--bb-brand)' }}>
                    {error}
                  </p>
                )}

                {/* Submit */}
                <div className="bb-stagger bb-stagger-button mt-1">
                  <Button
                    type="submit"
                    loading={loading}
                    className={`h-12 w-full text-[15px] font-bold text-white transition-all duration-200 ${loading ? 'bb-btn-shimmer' : ''}`}
                    style={{ background: 'var(--bb-brand-gradient)', borderRadius: 'var(--bb-radius-md)' }}
                    onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.boxShadow = 'var(--bb-brand-glow)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.filter = 'brightness(0.9)'; }}
                    onMouseUp={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
                  >
                    {loading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </div>
              </form>

              {/* Links */}
              <div className="bb-stagger bb-stagger-links mt-6 flex items-center justify-center gap-3 text-sm">
                <Link
                  href="/esqueci-senha"
                  className="transition-colors duration-200"
                  style={{ color: 'var(--bb-ink-60)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--bb-ink-100)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--bb-ink-60)'; }}
                >
                  Esqueci senha
                </Link>
                <span style={{ color: 'var(--bb-ink-20)' }}>|</span>
                <Link
                  href="/cadastro"
                  className="transition-colors duration-200"
                  style={{ color: 'var(--bb-ink-60)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--bb-ink-100)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--bb-ink-60)'; }}
                >
                  Criar conta
                </Link>
              </div>

              {/* Demo credentials */}
              <div className="bb-stagger bb-stagger-links mt-6 pt-4" style={{ borderTop: '1px solid var(--bb-glass-border)' }}>
                <p className="text-center text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                  Demo: roberto@guerreiros.com / BlackBelt@2026
                </p>
              </div>
            </div>
          </div>

          {/* Scroll Down Arrow */}
          <ScrollDownArrow />
        </section>

        {/* ═══════════ LANDING PAGE (Below Login) ═══════════ */}
        <div id="landing">
          {/* Hero */}
          <LandingHero />

          {/* Aluno */}
          <BenefitSection
            id="benefit-aluno"
            icon={<QrCode size={28} />}
            title="Para o Aluno"
            subtitle="Sua evolucao, na palma da mao."
            features={[
              { icon: <QrCode size={22} />, title: 'Check-in inteligente', description: 'Chegou na academia? Escaneie o QR code e sua presenca e registrada automaticamente.' },
              { icon: <Award size={22} />, title: 'Jornada de faixa', description: 'Acompanhe seu progresso rumo a proxima graduacao. Presencas, avaliacoes e tempo de treino.' },
              { icon: <Trophy size={22} />, title: 'Conquistas', description: 'Desbloqueie badges treinando. Da primeira aula ao Streak 365. Algumas sao lendarias.' },
            ]}
            extraFeatures={[
              { icon: <Video size={16} />, label: 'Biblioteca de videos' },
              { icon: <BarChart3 size={16} />, label: 'Analytics de treino' },
              { icon: <GraduationCap size={16} />, label: 'Academia teorica' },
              { icon: <Smartphone size={16} />, label: 'Carteirinha digital' },
              { icon: <BookOpen size={16} />, label: 'Notas pessoais' },
              { icon: <Target size={16} />, label: 'Streak de treino' },
            ]}
          />

          {/* Professor */}
          <BenefitSection
            id="benefit-professor"
            icon={<GraduationCap size={28} />}
            title="Para o Professor"
            subtitle="Foco no que importa: ensinar."
            reversed
            features={[
              { icon: <Target size={22} />, title: 'Modo Aula', description: 'Tela fullscreen durante a aula. Chamada por QR, timer de rounds, alertas de alunos e notas rapidas. Sem papel, sem planilha.' },
              { icon: <BarChart3 size={22} />, title: 'Avaliacao Tecnica com Radar', description: '8 criterios visuais. Guarda, passagem, finalizacao, defesa, quedas, posicionamento. Evolucao ao longo do tempo.' },
              { icon: <Video size={22} />, title: 'Envie Videos para suas Turmas', description: 'Grave no celular, suba no app. Organize por turma, faixa e nivel. Seus alunos assistem na hora.' },
            ]}
            extraFeatures={[
              { icon: <Clipboard size={16} />, label: 'Diario de aulas' },
              { icon: <BookOpen size={16} />, label: 'Plano de aula semanal' },
              { icon: <Award size={16} />, label: 'Banco de 60+ tecnicas' },
              { icon: <Eye size={16} />, label: 'Visao 360 do aluno' },
              { icon: <MessageCircle size={16} />, label: 'Duvidas dos videos' },
              { icon: <AlertTriangle size={16} />, label: 'Alertas inteligentes' },
            ]}
          />

          {/* Pais e Responsaveis */}
          <BenefitSection
            id="benefit-pais"
            icon={<UsersIcon size={28} />}
            title="Para Pais e Responsaveis"
            subtitle="Acompanhe a evolucao dos seus filhos com tranquilidade."
            features={[
              { icon: <Calendar size={22} />, title: 'Agenda Familiar', description: 'Aulas de TODOS os filhos num calendario. Saiba quando levar e buscar.' },
              { icon: <MessageCircle size={22} />, title: 'Chat com Professor', description: 'Canal direto com quem cuida do seu filho no tatame. Pergunte, acompanhe.' },
              { icon: <FileText size={22} />, title: 'Relatorio Mensal', description: 'Todo mes: presencas, evolucao, nota do professor. No WhatsApp ou PDF.' },
              { icon: <ShieldCheck size={22} />, title: 'Autorizacoes', description: 'Campeonato, evento, viagem. Autorize pelo app. Controle total.' },
            ]}
            extraFeatures={[]}
          />

          {/* Admin */}
          <BenefitSection
            id="benefit-admin"
            icon={<LayoutDashboard size={28} />}
            title="Para a Academia"
            subtitle="Tudo num lugar so. Sem papel, sem planilha."
            reversed
            features={[
              { icon: <LayoutDashboard size={22} />, title: 'Dashboard', description: 'KPIs em tempo real. Alunos ativos, receita, presencas, retencao. Tudo no seu celular.' },
              { icon: <DollarSign size={22} />, title: 'Financeiro', description: 'Mensalidades, PIX, cobrancas automaticas. Controle total do caixa.' },
              { icon: <Users size={22} />, title: 'Gestao de Alunos', description: 'Cadastro, faixas, evolucao, historico. Tudo organizado.' },
            ]}
            extraFeatures={[
              { icon: <Clock size={16} />, label: 'Turmas e horarios' },
              { icon: <Tv size={16} />, label: 'Biblioteca de videos' },
              { icon: <Gamepad2 size={16} />, label: 'Gamificacao' },
              { icon: <Send size={16} />, label: 'WhatsApp automatico' },
            ]}
          />

          {/* Teen + Kids */}
          <TeenKidsSection />

          {/* Depoimentos */}
          <TestimonialCarousel />

          {/* CTA Final */}
          <CTAFinal />

          {/* Footer */}
          <LandingFooter />
        </div>
      </div>
    </>
  );
}
