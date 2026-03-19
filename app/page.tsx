'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
import { LandingFooter } from '@/components/landing/LandingFooter';
import { DesktopLanding } from '@/components/landing/DesktopLanding';

/* ── Rotating inspirational phrases (mobile hero) ── */
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

export default function LandingPage() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [showArrow, setShowArrow] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % PHRASES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    function onScroll() { setShowArrow(window.scrollY < 100); }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function handleScrollDown() {
    document.getElementById('landing')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bb-phrase-in {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
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

      {/* ═══ MOBILE EXPERIENCE (< lg) ═══ */}
      <div
        className="w-full overflow-x-hidden lg:hidden"
        style={{ backgroundColor: 'var(--bb-depth-1)' }}
      >
        {/* Hero */}
        <section
          className="relative flex min-h-screen flex-col items-center justify-center px-4 sm:px-6"
          style={{ backgroundColor: 'var(--bb-depth-1)', minHeight: '100dvh' }}
        >
          {/* Brand */}
          <div className="flex flex-col items-center text-center">
            <h1
              className="text-4xl font-extrabold sm:text-5xl"
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

          {/* Rotating phrases */}
          <div className="mt-8 flex flex-col items-center text-center">
            <h2
              className="font-extrabold leading-tight"
              style={{
                color: 'var(--bb-ink-100)',
                fontSize: 'clamp(1.3rem, 0.8rem + 1.5vw, 2.2rem)',
              }}
            >
              <span key={phraseIndex} className="bb-phrase-enter block">
                {PHRASES[phraseIndex]}
              </span>
            </h2>
            <p
              className="mt-3 max-w-md text-sm leading-relaxed sm:text-base"
              style={{ color: 'var(--bb-ink-60)' }}
            >
              Gestao completa para academias de artes marciais. Do tatame ao financeiro.
            </p>
            <div className="mt-6 flex w-64 gap-1">
              {BELT_COLORS.map((c, i) => (
                <div
                  key={i}
                  className="h-1.5 flex-1 rounded-full"
                  style={{ backgroundColor: c, opacity: 0.6 }}
                />
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-10 flex w-full max-w-xs flex-col gap-3">
            <Link
              href="/cadastrar-academia"
              className="flex items-center justify-center rounded-xl py-3.5 text-sm font-bold uppercase tracking-wider text-white transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: 'var(--bb-brand-gradient)',
                boxShadow: '0 4px 24px rgba(239, 68, 68, 0.25)',
              }}
            >
              COMECAR GRATIS — 7 DIAS
            </Link>
            <Link
              href="/login"
              className="flex items-center justify-center rounded-xl py-3 text-sm font-medium transition-colors duration-200"
              style={{
                border: '1px solid var(--bb-glass-border)',
                background: 'var(--bb-depth-3)',
                color: 'var(--bb-ink-80)',
              }}
            >
              Ja tem conta? Entrar
            </Link>
          </div>

          {/* Scroll-down arrow */}
          {showArrow && (
            <button
              type="button"
              onClick={handleScrollDown}
              className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 animate-bounce flex-col items-center gap-1 border-none bg-transparent sm:bottom-8"
              style={{ color: 'var(--bb-ink-40)', cursor: 'pointer' }}
              aria-label="Rolar para baixo"
            >
              <span className="text-[10px] uppercase tracking-widest sm:text-[11px]">Saiba mais</span>
              <ChevronDown size={22} />
            </button>
          )}
        </section>

        {/* Landing Sections */}
        <div id="landing">
          <LandingHero />

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

          <TeenKidsSection />
          <TestimonialCarousel />

          {/* CTA Final */}
          <section
            className="flex flex-col items-center justify-center px-4 py-16 sm:px-6 md:py-24 lg:py-32"
            style={{
              background: 'linear-gradient(180deg, var(--bb-depth-1) 0%, var(--bb-depth-2) 50%, var(--bb-depth-1) 100%)',
            }}
          >
            <h3
              className="text-center text-xl font-bold tracking-tight sm:text-2xl md:text-4xl"
              style={{ color: 'var(--bb-ink-100)' }}
            >
              Pronto para transformar sua academia?
            </h3>

            <Link
              href="/cadastrar-academia"
              className="mt-10 inline-flex items-center justify-center rounded-xl px-10 py-4 text-base font-bold uppercase tracking-wider text-white transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: 'var(--bb-brand-gradient)',
                boxShadow: '0 4px 24px rgba(239, 68, 68, 0.25)',
              }}
            >
              COMECAR GRATIS — 7 DIAS
            </Link>

            <Link
              href="/login"
              className="mt-6 text-sm transition-colors duration-200"
              style={{ color: 'var(--bb-ink-60)' }}
            >
              Ja tem conta? <span style={{ textDecoration: 'underline' }}>Entrar</span>
            </Link>
          </section>

          <LandingFooter />
        </div>
      </div>

      {/* ═══ DESKTOP EXPERIENCE (lg+) ═══ */}
      <div className="hidden lg:block">
        <DesktopLanding onLoginClick={() => { window.location.href = '/login'; }} />
      </div>
    </>
  );
}
