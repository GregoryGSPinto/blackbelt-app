'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/lib/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  ChevronDown,
  QrCode, Award, Trophy, Target, Video, BarChart3,
  GraduationCap, BookOpen, Clipboard, Eye, AlertTriangle, Users as UsersIcon,
  Calendar, MessageCircle, FileText, ShieldCheck,
  LayoutDashboard, DollarSign, Users, Smartphone,
  Clock, Tv, Gamepad2, Send,
} from 'lucide-react';
import { LandingHero } from '@/components/landing/LandingHero';
import { BenefitSection } from '@/components/landing/BenefitSection';
import { TeenKidsSection } from '@/components/landing/TeenKidsSection';
import { TestimonialCarousel } from '@/components/landing/TestimonialCarousel';
import { CTAFinal } from '@/components/landing/CTAFinal';
import { LandingFooter } from '@/components/landing/LandingFooter';

/* ── Rotating inspirational phrases (desktop only) ── */
const PHRASES = [
  'Evolua a cada treino.',
  'O tatame ensina mais que tecnica.',
  'Disciplina no treino, excelencia na vida.',
  'A faixa e so o comeco da jornada.',
  'Cada repeticao te faz mais forte.',
];

const BELT_COLORS = [
  '#FAFAFA', '#EAB308', '#EA580C', '#16A34A',
  '#2563EB', '#9333EA', '#92400E', '#0A0A0A',
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
  const [showArrow, setShowArrow] = useState(true);

  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => { emailRef.current?.focus(); }, []);

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

  useEffect(() => {
    function onScroll() { setShowArrow(window.scrollY < 100); }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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

  function handleScrollDown() {
    document.getElementById('landing')?.scrollIntoView({ behavior: 'smooth' });
  }

  /* ── Animations (card, shake, shimmer, phrase, scroll-reveal) ── */
  const cardAnim = shake
    ? { animation: 'bb-shake 0.3s ease-in-out', opacity: 1 }
    : success
      ? { animation: 'bb-success 0.3s ease-in-out forwards', opacity: 1 }
      : {};

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bb-card-in {
          0% { opacity: 0; transform: scale(0.95); filter: blur(8px); }
          100% { opacity: 1; transform: scale(1); filter: blur(0); }
        }
        @keyframes bb-el-in {
          0% { opacity: 0; transform: translateY(12px); filter: blur(4px); }
          100% { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes bb-fade {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes bb-shake {
          0%, 100% { transform: translateX(0); }
          12% { transform: translateX(-8px); }
          25% { transform: translateX(8px); }
          37% { transform: translateX(-4px); }
          50% { transform: translateX(4px); }
          62% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }
        @keyframes bb-success {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(0.97); opacity: 0; }
        }
        @keyframes bb-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes bb-phrase-in {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .bb-s { opacity: 0; animation-fill-mode: forwards; }
        .bb-s-card { animation: bb-card-in 0.6s cubic-bezier(0.16,1,0.3,1) 0s forwards; }
        .bb-s-logo { animation: bb-el-in 0.5s cubic-bezier(0.16,1,0.3,1) 0.2s forwards; }
        .bb-s-tag  { animation: bb-fade 0.5s ease-out 0.35s forwards; }
        .bb-s-social { animation: bb-el-in 0.5s cubic-bezier(0.16,1,0.3,1) 0.45s forwards; }
        .bb-s-div  { animation: bb-fade 0.4s ease-out 0.55s forwards; }
        .bb-s-email { animation: bb-el-in 0.5s cubic-bezier(0.16,1,0.3,1) 0.6s forwards; }
        .bb-s-pass { animation: bb-el-in 0.5s cubic-bezier(0.16,1,0.3,1) 0.7s forwards; }
        .bb-s-btn  { animation: bb-el-in 0.5s cubic-bezier(0.16,1,0.3,1) 0.85s forwards; }
        .bb-s-links { animation: bb-fade 0.5s ease-out 1s forwards; }

        .bb-shimmer { position: relative; overflow: hidden; }
        .bb-shimmer::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%);
          animation: bb-shimmer 1.5s ease-in-out infinite;
        }

        .bb-phrase-enter { animation: bb-phrase-in 0.6s ease-out forwards; }

        .scroll-reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.6s cubic-bezier(0.16,1,0.3,1),
                      transform 0.6s cubic-bezier(0.16,1,0.3,1);
        }
        .scroll-reveal.revealed {
          opacity: 1;
          transform: translateY(0);
        }
        .scroll-reveal.revealed > *:nth-child(1) { transition-delay: 0ms; }
        .scroll-reveal.revealed > *:nth-child(2) { transition-delay: 100ms; }
        .scroll-reveal.revealed > *:nth-child(3) { transition-delay: 200ms; }
        .scroll-reveal.revealed > *:nth-child(4) { transition-delay: 300ms; }
      ` }} />

      {/* ═══ ROOT — overflow-x-hidden prevents ANY horizontal scroll ═══ */}
      <div
        className="w-full overflow-x-hidden"
        style={{ backgroundColor: 'var(--bb-depth-1)' }}
      >
        {/* ═══════════ HERO LOGIN (full viewport) ═══════════ */}
        <section
          id="login-section"
          className="relative flex min-h-screen flex-col items-center justify-center px-4 sm:px-6 lg:flex-row lg:items-stretch lg:px-0"
          style={{ backgroundColor: 'var(--bb-depth-1)', minHeight: '100dvh' }}
        >
          {/* ── Desktop Left Side: Motivational (hidden below lg) ── */}
          <div
            className="hidden min-w-0 flex-col items-center justify-center px-8 lg:flex lg:w-[45%] xl:w-1/2 xl:px-12 2xl:px-16"
            style={{
              background: 'linear-gradient(135deg, var(--bb-depth-2) 0%, var(--bb-depth-1) 100%)',
              borderRight: '1px solid var(--bb-glass-border)',
            }}
          >
            <div className="w-full max-w-md text-center xl:max-w-lg">
              <h2
                className="font-extrabold leading-tight"
                style={{
                  color: 'var(--bb-ink-100)',
                  fontSize: 'clamp(1.75rem, 1rem + 2vw, 3.5rem)',
                  overflowWrap: 'break-word',
                }}
              >
                <span key={phraseIndex} className="bb-phrase-enter block">
                  {PHRASES[phraseIndex]}
                </span>
              </h2>
              <p
                className="mt-4 text-base leading-relaxed xl:text-lg"
                style={{ color: 'var(--bb-ink-60)' }}
              >
                Acompanhe sua jornada, conquiste faixas, treine com proposito.
              </p>

              {/* Belt gradient bar */}
              <div className="mx-auto mt-8 flex max-w-xs gap-1 xl:max-w-sm">
                {BELT_COLORS.map((c, i) => (
                  <div
                    key={i}
                    className="h-2 flex-1 rounded-full"
                    style={{ backgroundColor: c, opacity: 0.7 }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ── Login Form (centered mobile, right side desktop) ── */}
          <div className="flex min-w-0 w-full items-center justify-center py-10 sm:py-12 lg:w-[55%] lg:py-0 xl:w-1/2">
            <div
              className={`bb-s w-full max-w-[420px] rounded-2xl sm:rounded-3xl ${shake || success ? '' : 'bb-s-card'}`}
              style={{
                background: 'var(--bb-depth-3)',
                backdropFilter: 'blur(24px) saturate(1.3)',
                WebkitBackdropFilter: 'blur(24px) saturate(1.3)',
                border: '1px solid var(--bb-glass-border)',
                padding: 'clamp(1.5rem, 4vw, 2.75rem) clamp(1.25rem, 3.5vw, 2.25rem)',
                boxShadow: 'var(--bb-shadow-xl)',
                ...cardAnim,
              }}
            >
              {/* Logo */}
              <div className="bb-s bb-s-logo flex flex-col items-center">
                <h1
                  className="text-3xl font-extrabold sm:text-4xl"
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
                className="bb-s bb-s-tag mt-3 text-center text-xs uppercase tracking-widest sm:text-[13px]"
                style={{ color: 'var(--bb-ink-60)' }}
              >
                Sua jornada nas artes marciais
              </p>

              {/* ── Social Login Buttons (Google + Apple lado a lado) ── */}
              <div className="bb-s bb-s-social mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => toast('Login com Google em breve!', 'info')}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-medium transition-all duration-200 sm:text-sm"
                  style={{
                    border: '1px solid var(--bb-glass-border)',
                    background: 'var(--bb-depth-2)',
                    color: 'var(--bb-ink-80)',
                  }}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => toast('Login com Apple em breve!', 'info')}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-medium transition-all duration-200 sm:text-sm"
                  style={{
                    border: '1px solid var(--bb-glass-border)',
                    background: 'var(--bb-depth-2)',
                    color: 'var(--bb-ink-80)',
                  }}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.53-3.23 0-1.44.62-2.2.44-3.06-.4C3.79 16.17 4.36 9.51 8.82 9.28c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.3 4.12zM12.03 9.2C11.88 6.88 13.77 5 15.96 4.82c.29 2.65-2.4 4.63-3.93 4.38z"/>
                  </svg>
                  Apple
                </button>
              </div>

              {/* ── Divider ── */}
              <div className="bb-s bb-s-div my-5 flex items-center gap-3">
                <div className="h-px flex-1" style={{ background: 'var(--bb-glass-border)' }} />
                <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>ou</span>
                <div className="h-px flex-1" style={{ background: 'var(--bb-glass-border)' }} />
              </div>

              {/* ── Login Form ── */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Email */}
                <div className="bb-s bb-s-email relative">
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
                    className="h-12 w-full border-[var(--bb-glass-border)] bg-[var(--bb-depth-5)] pl-11 text-sm text-[var(--bb-ink-100)] placeholder:text-[var(--bb-ink-40)] focus-visible:border-[var(--bb-brand)] focus-visible:ring-[var(--bb-brand)]/20"
                  />
                </div>

                {/* Password */}
                <div className="bb-s bb-s-pass relative">
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
                    className="h-12 w-full border-[var(--bb-glass-border)] bg-[var(--bb-depth-5)] pl-11 text-sm text-[var(--bb-ink-100)] placeholder:text-[var(--bb-ink-40)] focus-visible:border-[var(--bb-brand)] focus-visible:ring-[var(--bb-brand)]/20"
                  />
                </div>

                {/* Error */}
                {error && email.trim() && password.trim() && (
                  <p className="text-center text-[13px]" style={{ color: 'var(--bb-brand)' }}>
                    {error}
                  </p>
                )}

                {/* Submit */}
                <div className="bb-s bb-s-btn mt-1">
                  <Button
                    type="submit"
                    loading={loading}
                    className={`h-12 w-full text-sm font-bold text-white transition-all duration-200 sm:text-[15px] ${loading ? 'bb-shimmer' : ''}`}
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
              <div className="bb-s bb-s-links mt-5 flex items-center justify-center gap-3 text-xs sm:text-sm">
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
              <div className="bb-s bb-s-links mt-5 pt-4" style={{ borderTop: '1px solid var(--bb-glass-border)' }}>
                <p className="text-center text-[11px] sm:text-xs" style={{ color: 'var(--bb-ink-40)', overflowWrap: 'break-word' }}>
                  Demo: roberto@guerreiros.com / BlackBelt@2026
                </p>
              </div>
            </div>
          </div>

          {/* ── Scroll-down arrow ── */}
          {showArrow && (
            <button
              type="button"
              onClick={handleScrollDown}
              className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 animate-bounce flex-col items-center gap-1 border-none bg-transparent sm:bottom-8"
              style={{ color: 'var(--bb-ink-40)', cursor: 'pointer' }}
              aria-label="Rolar para baixo"
            >
              <span className="text-[10px] uppercase tracking-widest sm:text-[11px]">Descubra mais</span>
              <ChevronDown size={22} />
            </button>
          )}
        </section>

        {/* ═══════════ LANDING PAGE (below hero) ═══════════ */}
        <div id="landing">
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
