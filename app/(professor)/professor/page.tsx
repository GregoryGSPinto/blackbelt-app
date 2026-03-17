'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCountUp } from '@/lib/hooks/useCountUp';
import { Skeleton } from '@/components/ui/Skeleton';
import { Avatar } from '@/components/ui/Avatar';

import {
  UsersIcon,
  CalendarIcon,
  CheckSquareIcon,
  VideoIcon,
  ClockIcon,
  AwardIcon,
  ChevronRightIcon,
  StarIcon,
  AlertTriangleIcon,
  TrendingUpIcon,
  EyeIcon,
  PlusIcon,
} from '@/components/shell/icons';

// ── Types ─────────────────────────────────────────────────────────────

interface AulaHoje {
  id: string;
  horario: string;
  horaFim: string;
  nome: string;
  modalidade: string;
  inscritos: number;
  capacidade: number;
  status: 'concluida' | 'em_andamento' | 'proxima' | 'agendada';
}

interface AlunoDestaque {
  id: string;
  nome: string;
  avatar: string | null;
  tipo: 'mais_treinou' | 'completou_serie' | 'em_risco';
  detalhe: string;
  faixa: string;
}

interface GraduacaoPendente {
  id: string;
  nome: string;
  avatar: string | null;
  faixaAtual: string;
  faixaProxima: string;
  aulasRealizadas: number;
  aulasNecessarias: number;
  tempoNaFaixa: string;
}

interface VideoPublicado {
  id: string;
  titulo: string;
  views: number;
  publicadoEm: string;
  thumbnail: string | null;
}

// ── Mock data ─────────────────────────────────────────────────────────

const MOCK_AULAS_HOJE: AulaHoje[] = [
  {
    id: 'aula-1',
    horario: '06:30',
    horaFim: '07:30',
    nome: 'Jiu-Jitsu Iniciante',
    modalidade: 'Jiu-Jitsu',
    inscritos: 18,
    capacidade: 25,
    status: 'concluida',
  },
  {
    id: 'aula-2',
    horario: '09:00',
    horaFim: '10:00',
    nome: 'Jiu-Jitsu Avancado',
    modalidade: 'Jiu-Jitsu',
    inscritos: 12,
    capacidade: 20,
    status: 'em_andamento',
  },
  {
    id: 'aula-3',
    horario: '18:00',
    horaFim: '19:30',
    nome: 'Muay Thai Competicao',
    modalidade: 'Muay Thai',
    inscritos: 22,
    capacidade: 30,
    status: 'agendada',
  },
];

const MOCK_DESTAQUES: AlunoDestaque[] = [
  {
    id: 'd-1',
    nome: 'Lucas Ferreira',
    avatar: null,
    tipo: 'mais_treinou',
    detalhe: '6 treinos esta semana',
    faixa: 'blue',
  },
  {
    id: 'd-2',
    nome: 'Marina Costa',
    avatar: null,
    tipo: 'completou_serie',
    detalhe: 'Completou serie de raspagens',
    faixa: 'purple',
  },
  {
    id: 'd-3',
    nome: 'Pedro Almeida',
    avatar: null,
    tipo: 'em_risco',
    detalhe: '12 dias sem treinar',
    faixa: 'white',
  },
];

const MOCK_GRADUACOES: GraduacaoPendente[] = [
  {
    id: 'g-1',
    nome: 'Ana Beatriz',
    avatar: null,
    faixaAtual: 'white',
    faixaProxima: 'gray',
    aulasRealizadas: 48,
    aulasNecessarias: 40,
    tempoNaFaixa: '6 meses',
  },
  {
    id: 'g-2',
    nome: 'Rafael Santos',
    avatar: null,
    faixaAtual: 'blue',
    faixaProxima: 'purple',
    aulasRealizadas: 120,
    aulasNecessarias: 100,
    tempoNaFaixa: '1 ano e 4 meses',
  },
];

const MOCK_VIDEOS: VideoPublicado[] = [
  {
    id: 'v-1',
    titulo: 'Passagem de guarda X',
    views: 342,
    publicadoEm: '2 dias atras',
    thumbnail: null,
  },
  {
    id: 'v-2',
    titulo: 'Raspagem em hook',
    views: 218,
    publicadoEm: '5 dias atras',
    thumbnail: null,
  },
  {
    id: 'v-3',
    titulo: 'Finalizacao partindo das costas',
    views: 567,
    publicadoEm: '1 semana atras',
    thumbnail: null,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function getFirstName(displayName: string): string {
  return displayName.split(' ')[0] || displayName;
}

function getBeltCSSVar(belt: string): string {
  const map: Record<string, string> = {
    white: 'var(--bb-belt-white)',
    gray: 'var(--bb-belt-gray)',
    yellow: 'var(--bb-belt-yellow)',
    orange: 'var(--bb-belt-orange)',
    green: 'var(--bb-belt-green)',
    blue: 'var(--bb-belt-blue)',
    purple: 'var(--bb-belt-purple)',
    brown: 'var(--bb-belt-brown)',
    black: 'var(--bb-belt-black)',
  };
  return map[belt] ?? 'var(--bb-ink-40)';
}

function getStatusConfig(status: AulaHoje['status']) {
  switch (status) {
    case 'concluida':
      return { label: 'Concluida', dot: 'var(--bb-ink-40)', bg: 'var(--bb-depth-4)' };
    case 'em_andamento':
      return { label: 'Em andamento', dot: 'var(--bb-success)', bg: 'var(--bb-success-surface)' };
    case 'proxima':
      return { label: 'Proxima', dot: 'var(--bb-warning)', bg: 'var(--bb-warning-surface)' };
    case 'agendada':
      return { label: 'Agendada', dot: 'var(--bb-info)', bg: 'var(--bb-info-surface)' };
  }
}

function getDestaqueConfig(tipo: AlunoDestaque['tipo']) {
  switch (tipo) {
    case 'mais_treinou':
      return { label: 'Mais treinou', color: 'var(--bb-success)', icon: <TrendingUpIcon className="h-3.5 w-3.5" /> };
    case 'completou_serie':
      return { label: 'Serie completa', color: 'var(--bb-info)', icon: <StarIcon className="h-3.5 w-3.5" /> };
    case 'em_risco':
      return { label: 'Em risco', color: 'var(--bb-warning)', icon: <AlertTriangleIcon className="h-3.5 w-3.5" /> };
  }
}

// ── Intersection Observer hook ────────────────────────────────────────

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

// ── Stat Card ─────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: string;
  inView: boolean;
}

function StatCard({ label, value, icon, accent, inView }: StatCardProps) {
  const animated = useCountUp(inView ? value : 0, 900);

  return (
    <div
      className="relative overflow-hidden p-4 transition-all duration-300 hover:scale-[1.02]"
      style={{
        background: 'var(--bb-depth-2)',
        border: '1px solid var(--bb-glass-border)',
        borderRadius: 'var(--bb-radius-lg)',
        boxShadow: 'var(--bb-shadow-sm)',
      }}
    >
      {/* Accent bar */}
      {accent && (
        <div
          className="absolute left-0 top-0 h-full w-1"
          style={{ background: accent, borderRadius: 'var(--bb-radius-lg) 0 0 var(--bb-radius-lg)' }}
        />
      )}
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center"
          style={{
            borderRadius: 'var(--bb-radius-md)',
            background: accent ? `color-mix(in srgb, ${accent} 10%, transparent)` : 'var(--bb-depth-4)',
            color: accent ?? 'var(--bb-ink-60)',
          }}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: 'var(--bb-ink-40)' }}
          >
            {label}
          </p>
          <p
            className="text-2xl font-extrabold tabular-nums"
            style={{ color: 'var(--bb-ink-100)' }}
          >
            {animated}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────

export default function ProfessorDashboardPage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);

  const statsSection = useInView(0.1);

  // Simulate data load
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const greeting = useMemo(() => getGreeting(), []);
  const firstName = profile?.display_name ? getFirstName(profile.display_name) : 'Professor';
  const aulasHoje = MOCK_AULAS_HOJE;
  const totalAulasHoje = aulasHoje.length;

  // ── Loading skeleton ────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-5 p-4 pb-24">
        {/* Greeting skeleton */}
        <div className="space-y-2">
          <Skeleton variant="text" className="h-7 w-48" />
          <Skeleton variant="text" className="h-4 w-64" />
        </div>
        {/* Stat cards skeleton */}
        <div className="grid grid-cols-2 gap-3">
          <Skeleton variant="card" className="h-24" />
          <Skeleton variant="card" className="h-24" />
          <Skeleton variant="card" className="h-24" />
          <Skeleton variant="card" className="h-24" />
        </div>
        {/* Timeline skeleton */}
        <Skeleton variant="card" className="h-48" />
        {/* Destaques skeleton */}
        <Skeleton variant="card" className="h-36" />
        {/* Graduacoes skeleton */}
        <Skeleton variant="card" className="h-32" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 pb-24">
      {/* ── GREETING ────────────────────────────────────────────────── */}
      <section className="animate-reveal">
        <h1
          className="text-2xl font-bold"
          style={{ color: 'var(--bb-ink-100)' }}
        >
          {greeting}, {firstName}.
        </h1>
        <p
          className="mt-1 text-sm"
          style={{ color: 'var(--bb-ink-60)' }}
        >
          Hoje voce tem {totalAulasHoje} aula{totalAulasHoje !== 1 ? 's' : ''}.
        </p>
      </section>

      {/* ── STAT CARDS ──────────────────────────────────────────────── */}
      <section ref={statsSection.ref}>
        <div className="grid grid-cols-2 gap-3" data-stagger>
          <StatCard
            label="Alunos ativos"
            value={42}
            icon={<UsersIcon className="h-5 w-5" />}
            accent="var(--bb-brand)"
            inView={statsSection.inView}
          />
          <StatCard
            label="Aulas hoje"
            value={totalAulasHoje}
            icon={<CalendarIcon className="h-5 w-5" />}
            accent="var(--bb-info)"
            inView={statsSection.inView}
          />
          <StatCard
            label="Avaliacoes"
            value={5}
            icon={<CheckSquareIcon className="h-5 w-5" />}
            accent="var(--bb-warning)"
            inView={statsSection.inView}
          />
          <StatCard
            label="Videos"
            value={18}
            icon={<VideoIcon className="h-5 w-5" />}
            accent="var(--bb-success)"
            inView={statsSection.inView}
          />
        </div>
      </section>

      {/* ── MINHAS AULAS HOJE (timeline) ────────────────────────────── */}
      <section className="animate-reveal" style={{ animationDelay: '0.15s' }}>
        <div className="mb-3 flex items-center justify-between">
          <h2
            className="text-base font-semibold"
            style={{ color: 'var(--bb-ink-100)' }}
          >
            Minhas Aulas Hoje
          </h2>
          <Link
            href="/professor/agenda"
            className="flex items-center gap-1 text-xs font-medium transition-colors"
            style={{ color: 'var(--bb-brand)' }}
          >
            Ver agenda <ChevronRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="relative space-y-0">
          {/* Timeline vertical line */}
          <div
            className="absolute left-[19px] top-4 bottom-4"
            style={{
              width: '2px',
              background: 'var(--bb-glass-border)',
            }}
          />

          {aulasHoje.map((aula, i) => {
            const statusCfg = getStatusConfig(aula.status);
            const pct = Math.round((aula.inscritos / aula.capacidade) * 100);

            return (
              <div
                key={aula.id}
                className="relative flex gap-4 py-3"
                style={{
                  opacity: 0,
                  animation: `reveal 0.5s cubic-bezier(0.16,1,0.3,1) forwards`,
                  animationDelay: `${0.2 + i * 0.08}s`,
                }}
              >
                {/* Timeline dot */}
                <div className="relative z-10 flex flex-col items-center">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center"
                    style={{
                      borderRadius: 'var(--bb-radius-full)',
                      background: statusCfg.bg,
                      border: `2px solid ${statusCfg.dot}`,
                    }}
                  >
                    <ClockIcon className="h-4 w-4" style={{ color: statusCfg.dot }} />
                  </div>
                </div>

                {/* Card */}
                <div
                  className="flex-1 p-4 transition-all duration-200"
                  style={{
                    background: 'var(--bb-depth-2)',
                    border: '1px solid var(--bb-glass-border)',
                    borderRadius: 'var(--bb-radius-lg)',
                    boxShadow: aula.status === 'em_andamento' ? 'var(--bb-brand-glow)' : 'var(--bb-shadow-xs)',
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-sm font-bold tabular-nums"
                          style={{ color: 'var(--bb-ink-100)' }}
                        >
                          {aula.horario} - {aula.horaFim}
                        </span>
                        {aula.status === 'em_andamento' && (
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                            style={{
                              background: 'var(--bb-success-surface)',
                              color: 'var(--bb-success)',
                            }}
                          >
                            <span
                              className="inline-block h-1.5 w-1.5 animate-pulse rounded-full"
                              style={{ background: 'var(--bb-success)' }}
                            />
                            Ao vivo
                          </span>
                        )}
                      </div>
                      <p
                        className="mt-1 text-sm font-medium"
                        style={{ color: 'var(--bb-ink-80)' }}
                      >
                        {aula.nome}
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        <span
                          className="text-xs"
                          style={{ color: 'var(--bb-ink-40)' }}
                        >
                          {aula.inscritos}/{aula.capacidade} alunos
                        </span>
                        {/* Mini progress bar */}
                        <div
                          className="h-1.5 flex-1 overflow-hidden"
                          style={{
                            borderRadius: 'var(--bb-radius-full)',
                            background: 'var(--bb-depth-4)',
                            maxWidth: '80px',
                          }}
                        >
                          <div
                            className="h-full transition-all duration-700"
                            style={{
                              width: `${pct}%`,
                              background: pct >= 80 ? 'var(--bb-warning)' : 'var(--bb-brand)',
                              borderRadius: 'var(--bb-radius-full)',
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {aula.status !== 'concluida' && (
                      <Link
                        href="/professor/presenca"
                        className="shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-all duration-200"
                        style={{
                          background: 'var(--bb-brand-gradient)',
                          color: '#fff',
                          borderRadius: 'var(--bb-radius-md)',
                        }}
                      >
                        <CheckSquareIcon className="h-3.5 w-3.5" />
                        Abrir Presenca
                      </Link>
                    )}
                    {aula.status === 'concluida' && (
                      <span
                        className="shrink-0 px-3 py-2 text-xs font-medium"
                        style={{
                          background: 'var(--bb-depth-4)',
                          color: 'var(--bb-ink-40)',
                          borderRadius: 'var(--bb-radius-md)',
                        }}
                      >
                        Concluida
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── ALUNOS EM DESTAQUE ──────────────────────────────────────── */}
      <section className="animate-reveal" style={{ animationDelay: '0.25s' }}>
        <div className="mb-3 flex items-center justify-between">
          <h2
            className="text-base font-semibold"
            style={{ color: 'var(--bb-ink-100)' }}
          >
            Alunos em Destaque
          </h2>
          <Link
            href="/professor/alunos"
            className="flex items-center gap-1 text-xs font-medium transition-colors"
            style={{ color: 'var(--bb-brand)' }}
          >
            Ver todos <ChevronRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="space-y-2" data-stagger>
          {MOCK_DESTAQUES.map((aluno) => {
            const cfg = getDestaqueConfig(aluno.tipo);
            return (
              <div
                key={aluno.id}
                className="flex items-center gap-3 p-3 transition-all duration-200"
                style={{
                  background: 'var(--bb-depth-2)',
                  border: '1px solid var(--bb-glass-border)',
                  borderRadius: 'var(--bb-radius-lg)',
                  borderLeft: `3px solid ${cfg.color}`,
                }}
              >
                <Avatar name={aluno.nome} size="md" />
                <div className="min-w-0 flex-1">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: 'var(--bb-ink-100)' }}
                  >
                    {aluno.nome}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span
                      className="inline-flex items-center gap-1 text-[11px] font-medium"
                      style={{ color: cfg.color }}
                    >
                      {cfg.icon} {cfg.label}
                    </span>
                    <span
                      className="text-[11px]"
                      style={{ color: 'var(--bb-ink-40)' }}
                    >
                      {aluno.detalhe}
                    </span>
                  </div>
                </div>
                <div
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{
                    background: getBeltCSSVar(aluno.faixa),
                    border: aluno.faixa === 'white' ? '1px solid var(--bb-ink-20)' : 'none',
                  }}
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* ── GRADUACOES PENDENTES ─────────────────────────────────────── */}
      <section className="animate-reveal" style={{ animationDelay: '0.3s' }}>
        <div className="mb-3 flex items-center justify-between">
          <h2
            className="text-base font-semibold"
            style={{ color: 'var(--bb-ink-100)' }}
          >
            Graduacoes Pendentes
            <span
              className="ml-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[11px] font-bold text-white"
              style={{ background: 'var(--bb-brand)' }}
            >
              {MOCK_GRADUACOES.length}
            </span>
          </h2>
          <Link
            href="/professor/avaliacoes"
            className="flex items-center gap-1 text-xs font-medium transition-colors"
            style={{ color: 'var(--bb-brand)' }}
          >
            Avaliar <ChevronRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="space-y-2" data-stagger>
          {MOCK_GRADUACOES.map((grad) => {
            const pctAulas = Math.round((grad.aulasRealizadas / grad.aulasNecessarias) * 100);

            return (
              <div
                key={grad.id}
                className="p-4 transition-all duration-200"
                style={{
                  background: 'var(--bb-depth-2)',
                  border: '1px solid var(--bb-glass-border)',
                  borderRadius: 'var(--bb-radius-lg)',
                }}
              >
                <div className="flex items-center gap-3">
                  <Avatar name={grad.nome} size="md" />
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-sm font-semibold"
                      style={{ color: 'var(--bb-ink-100)' }}
                    >
                      {grad.nome}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      {/* Current belt */}
                      <div
                        className="h-2.5 w-8 rounded-sm"
                        style={{
                          background: getBeltCSSVar(grad.faixaAtual),
                          border: grad.faixaAtual === 'white' ? '1px solid var(--bb-ink-20)' : 'none',
                        }}
                      />
                      <ChevronRightIcon className="h-3 w-3" style={{ color: 'var(--bb-ink-40)' }} />
                      {/* Next belt */}
                      <div
                        className="h-2.5 w-8 rounded-sm"
                        style={{
                          background: getBeltCSSVar(grad.faixaProxima),
                          border: grad.faixaProxima === 'white' ? '1px solid var(--bb-ink-20)' : 'none',
                        }}
                      />
                      <span
                        className="ml-1 text-[11px]"
                        style={{ color: 'var(--bb-ink-40)' }}
                      >
                        {grad.tempoNaFaixa}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/promover/${grad.id}`}
                    className="shrink-0 flex items-center gap-1 px-3 py-1.5 text-xs font-semibold transition-all duration-200"
                    style={{
                      background: 'var(--bb-brand-surface)',
                      color: 'var(--bb-brand)',
                      borderRadius: 'var(--bb-radius-md)',
                      border: '1px solid var(--bb-brand)',
                    }}
                  >
                    <AwardIcon className="h-3.5 w-3.5" />
                    Propor
                  </Link>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span style={{ color: 'var(--bb-ink-40)' }}>
                      {grad.aulasRealizadas}/{grad.aulasNecessarias} aulas
                    </span>
                    <span
                      className="font-semibold"
                      style={{ color: pctAulas >= 100 ? 'var(--bb-success)' : 'var(--bb-ink-60)' }}
                    >
                      {pctAulas}%
                    </span>
                  </div>
                  <div
                    className="mt-1 h-1.5 w-full overflow-hidden"
                    style={{
                      borderRadius: 'var(--bb-radius-full)',
                      background: 'var(--bb-depth-4)',
                    }}
                  >
                    <div
                      className="h-full transition-all duration-700"
                      style={{
                        width: `${Math.min(pctAulas, 100)}%`,
                        background: pctAulas >= 100 ? 'var(--bb-success)' : 'var(--bb-brand)',
                        borderRadius: 'var(--bb-radius-full)',
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CONTEUDO ────────────────────────────────────────────────── */}
      <section className="animate-reveal" style={{ animationDelay: '0.35s' }}>
        <div className="mb-3 flex items-center justify-between">
          <h2
            className="text-base font-semibold"
            style={{ color: 'var(--bb-ink-100)' }}
          >
            Conteudo Publicado
          </h2>
          <Link
            href="/professor/conteudo"
            className="flex items-center gap-1 text-xs font-medium transition-colors"
            style={{ color: 'var(--bb-brand)' }}
          >
            Gerenciar Conteudo <ChevronRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="space-y-2" data-stagger>
          {MOCK_VIDEOS.map((video) => (
            <div
              key={video.id}
              className="flex items-center gap-3 p-3 transition-all duration-200"
              style={{
                background: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
                borderRadius: 'var(--bb-radius-lg)',
              }}
            >
              {/* Video thumbnail placeholder */}
              <div
                className="flex h-12 w-16 shrink-0 items-center justify-center"
                style={{
                  background: 'var(--bb-depth-4)',
                  borderRadius: 'var(--bb-radius-sm)',
                }}
              >
                <VideoIcon className="h-5 w-5" style={{ color: 'var(--bb-ink-40)' }} />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-sm font-medium"
                  style={{ color: 'var(--bb-ink-100)' }}
                >
                  {video.titulo}
                </p>
                <div className="mt-0.5 flex items-center gap-3 text-[11px]" style={{ color: 'var(--bb-ink-40)' }}>
                  <span className="flex items-center gap-1">
                    <EyeIcon className="h-3 w-3" /> {video.views}
                  </span>
                  <span>{video.publicadoEm}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── QUICK ACTIONS ───────────────────────────────────────────── */}
      <section className="animate-reveal" style={{ animationDelay: '0.4s' }}>
        <h2
          className="mb-3 text-base font-semibold"
          style={{ color: 'var(--bb-ink-100)' }}
        >
          Acoes Rapidas
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" data-stagger>
          <Link
            href="/professor/presenca"
            className="group flex flex-col items-center gap-2 p-4 text-center transition-all duration-200 hover:scale-[1.03]"
            style={{
              background: 'var(--bb-depth-2)',
              border: '1px solid var(--bb-glass-border)',
              borderRadius: 'var(--bb-radius-lg)',
            }}
          >
            <div
              className="flex h-11 w-11 items-center justify-center transition-all duration-200"
              style={{
                borderRadius: 'var(--bb-radius-full)',
                background: 'var(--bb-brand-surface)',
                color: 'var(--bb-brand)',
              }}
            >
              <CheckSquareIcon className="h-5 w-5" />
            </div>
            <span
              className="text-xs font-semibold"
              style={{ color: 'var(--bb-ink-80)' }}
            >
              Abrir Presenca
            </span>
          </Link>

          <Link
            href="/professor/avaliacoes"
            className="group flex flex-col items-center gap-2 p-4 text-center transition-all duration-200 hover:scale-[1.03]"
            style={{
              background: 'var(--bb-depth-2)',
              border: '1px solid var(--bb-glass-border)',
              borderRadius: 'var(--bb-radius-lg)',
            }}
          >
            <div
              className="flex h-11 w-11 items-center justify-center transition-all duration-200"
              style={{
                borderRadius: 'var(--bb-radius-full)',
                background: 'var(--bb-warning-surface)',
                color: 'var(--bb-warning)',
              }}
            >
              <AwardIcon className="h-5 w-5" />
            </div>
            <span
              className="text-xs font-semibold"
              style={{ color: 'var(--bb-ink-80)' }}
            >
              Nova Avaliacao
            </span>
          </Link>

          <Link
            href="/professor/conteudo"
            className="group flex flex-col items-center gap-2 p-4 text-center transition-all duration-200 hover:scale-[1.03]"
            style={{
              background: 'var(--bb-depth-2)',
              border: '1px solid var(--bb-glass-border)',
              borderRadius: 'var(--bb-radius-lg)',
            }}
          >
            <div
              className="flex h-11 w-11 items-center justify-center transition-all duration-200"
              style={{
                borderRadius: 'var(--bb-radius-full)',
                background: 'var(--bb-success-surface)',
                color: 'var(--bb-success)',
              }}
            >
              <PlusIcon className="h-5 w-5" />
            </div>
            <span
              className="text-xs font-semibold"
              style={{ color: 'var(--bb-ink-80)' }}
            >
              Novo Video
            </span>
          </Link>

          <Link
            href="/professor/turmas"
            className="group flex flex-col items-center gap-2 p-4 text-center transition-all duration-200 hover:scale-[1.03]"
            style={{
              background: 'var(--bb-depth-2)',
              border: '1px solid var(--bb-glass-border)',
              borderRadius: 'var(--bb-radius-lg)',
            }}
          >
            <div
              className="flex h-11 w-11 items-center justify-center transition-all duration-200"
              style={{
                borderRadius: 'var(--bb-radius-full)',
                background: 'var(--bb-info-surface)',
                color: 'var(--bb-info)',
              }}
            >
              <UsersIcon className="h-5 w-5" />
            </div>
            <span
              className="text-xs font-semibold"
              style={{ color: 'var(--bb-ink-80)' }}
            >
              Ver Turmas
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
