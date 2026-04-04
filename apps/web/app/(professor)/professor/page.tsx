'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { trackFeatureUsage } from '@/lib/api/beta-analytics.service';
import { useCountUp } from '@/lib/hooks/useCountUp';
import { Skeleton } from '@/components/ui/Skeleton';
import { Avatar } from '@/components/ui/Avatar';
import { useSWRFetch } from '@/lib/hooks/useSWRFetch';
import { isMock } from '@/lib/env';
import { translateError } from '@/lib/utils/error-translator';

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
  HelpCircleIcon,
} from '@/components/shell/icons';
import { getDuvidasPendentes } from '@/lib/api/video-experience.service';
import type { Duvida } from '@/lib/api/video-experience.service';
import { listTrialStudents } from '@/lib/api/trial.service';
import type { TrialStudent } from '@/lib/api/trial.service';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';

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

// ── Trial Students Preview ────────────────────────────────────────────

function TrialStudentsPreview() {
  const [trials, setTrials] = useState<TrialStudent[]>([]);

  useEffect(() => {
    listTrialStudents(getActiveAcademyId(), { status: 'active' })
      .then(setTrials)
      .catch(() => {});
  }, []);

  if (trials.length === 0) return null;

  return (
    <section className="animate-reveal" style={{ animationDelay: '0.22s' }}>
      <div className="mb-3">
        <h2
          className="text-base font-semibold"
          style={{ color: 'var(--bb-ink-100)' }}
        >
          {'\uD83E\uDD4B'} Alunos em Periodo Experimental ({trials.length})
        </h2>
        <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
          Receba bem — eles estao conhecendo a academia!
        </p>
      </div>

      <div className="space-y-2">
        {trials.slice(0, 4).map((t) => {
          const days = Math.max(
            0,
            Math.ceil(
              (new Date(t.trial_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
            ),
          );
          const initials = t.name
            .split(' ')
            .slice(0, 2)
            .map((w) => w[0])
            .join('')
            .toUpperCase();

          return (
            <div
              key={t.id}
              className="flex items-center gap-3 p-3"
              style={{
                background: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
                borderRadius: 'var(--bb-radius-md)',
              }}
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ background: 'var(--bb-brand)' }}
              >
                {initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                  {t.name}
                </p>
                <p className="text-[11px]" style={{ color: 'var(--bb-ink-40)' }}>
                  {t.modalities_interest.slice(0, 2).join(', ')} &middot; {t.trial_classes_attended} aula{t.trial_classes_attended !== 1 ? 's' : ''}
                </p>
              </div>
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                style={{
                  background: days <= 2 ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
                  color: days <= 2 ? '#ef4444' : '#22c55e',
                }}
              >
                {days}d
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── Main Component ────────────────────────────────────────────────────

export default function ProfessorDashboardPage() {
  const { profile } = useAuth();
  const { data: duvidasPendentes, loading: loadingDuvidas } = useSWRFetch<(Duvida & { videoTitulo: string; videoId: string })[]>(
    'professor-duvidas-pendentes',
    () => getDuvidasPendentes(),
  );

  const [aulasHoje, setAulasHoje] = useState<AulaHoje[]>([]);
  const [totalAlunos, setTotalAlunos] = useState(0);
  const [pendingEvaluations, setPendingEvaluations] = useState(0);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  const statsSection = useInView(0.1);

  useEffect(() => { trackFeatureUsage('dashboard', 'view', { role: 'professor' }); }, []);

  // ── Fetch real dashboard data ────────────────────────────────────
  const loadDashboardData = useCallback(async () => {
    if (isMock()) {
      setAulasHoje(MOCK_AULAS_HOJE);
      setTotalAlunos(42);
      setPendingEvaluations(5);
      setLoadingDashboard(false);
      return;
    }

    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      const academyId = getActiveAcademyId();
      const professorId = profile?.id;
      if (!professorId) { setLoadingDashboard(false); return; }

      // 1. Get professor's classes with schedule & enrollment count
      const { data: classes } = await supabase
        .from('classes')
        .select('id, name, schedule, capacity, modalities(name), class_enrollments(count)')
        .eq('academy_id', academyId)
        .eq('professor_id', professorId);

      const now = new Date();
      const currentDay = now.getDay();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      const todayClasses: AulaHoje[] = [];
      for (const cls of classes ?? []) {
        const schedule = (cls.schedule ?? []) as Array<{ day_of_week: number; start_time: string; end_time: string }>;
        const enrollments = cls.class_enrollments as Array<Record<string, number>> | null;
        const enrolledCount = enrollments?.[0]?.count ?? 0;
        const modality = cls.modalities as Record<string, unknown> | null;

        for (const slot of schedule) {
          if (slot.day_of_week === currentDay) {
            let status: AulaHoje['status'] = 'agendada';
            if (slot.end_time <= currentTime) {
              status = 'concluida';
            } else if (slot.start_time <= currentTime && slot.end_time > currentTime) {
              status = 'em_andamento';
            } else {
              // Find the closest future class
              const upcoming = schedule
                .filter((s: { day_of_week: number; start_time: string }) => s.day_of_week === currentDay && s.start_time > currentTime)
                .sort((a: { start_time: string }, b: { start_time: string }) => a.start_time.localeCompare(b.start_time));
              if (upcoming.length > 0 && upcoming[0].start_time === slot.start_time) {
                status = 'proxima';
              }
            }

            todayClasses.push({
              id: cls.id,
              horario: slot.start_time.slice(0, 5),
              horaFim: slot.end_time.slice(0, 5),
              nome: cls.name ?? (modality?.name as string) ?? 'Turma',
              modalidade: (modality?.name as string) ?? '',
              inscritos: enrolledCount,
              capacidade: (cls.capacity as number) ?? 25,
              status,
            });
          }
        }
      }

      todayClasses.sort((a, b) => a.horario.localeCompare(b.horario));
      setAulasHoje(todayClasses);

      // 2. Count unique active students across professor's classes
      const classIds = (classes ?? []).map((c: Record<string, unknown>) => c.id as string);
      let studentCount = 0;
      if (classIds.length > 0) {
        const { data: enrollments } = await supabase
          .from('class_enrollments')
          .select('student_id')
          .in('class_id', classIds)
          .eq('status', 'active');
        const uniqueStudents = new Set((enrollments ?? []).map((e: Record<string, unknown>) => e.student_id as string));
        studentCount = uniqueStudents.size;
      }
      setTotalAlunos(studentCount);

      // 3. Count pending evaluations (students not evaluated in the last 90 days)
      if (classIds.length > 0) {
        const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000).toISOString();
        const { data: recentEvals } = await supabase
          .from('student_evaluations')
          .select('student_id')
          .eq('professor_id', professorId)
          .gte('created_at', ninetyDaysAgo);
        const evaluatedStudentIds = new Set((recentEvals ?? []).map((e: Record<string, unknown>) => e.student_id as string));
        const pending = studentCount - evaluatedStudentIds.size;
        setPendingEvaluations(Math.max(0, pending));
      }
    } catch (err) {
      console.error(translateError(err));
    } finally {
      setLoadingDashboard(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const loading = loadingDashboard || loadingDuvidas;

  const greeting = useMemo(() => getGreeting(), []);
  const firstName = profile?.display_name ? getFirstName(profile.display_name) : 'Professor';
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

      {/* ── ACOES RAPIDAS ────────────────────────────────────────────── */}
      <div className="mb-4">
        <p
          className="text-xs font-medium mb-2"
          style={{ color: 'var(--bb-ink-50)' }}
        >
          Acoes Rapidas
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Presenca', href: '/professor/turma-ativa' },
            { label: 'Avaliar', href: '/professor/avaliacoes' },
            { label: 'Upload Video', href: '/professor/conteudo' },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:brightness-110"
              style={{
                background: 'var(--bb-depth-3)',
                border: '1px solid var(--bb-glass-border)',
                borderRadius: 'var(--bb-radius-md)',
                color: 'var(--bb-ink-80)',
              }}
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── STAT CARDS ──────────────────────────────────────────────── */}
      <section ref={statsSection.ref}>
        <div className="grid grid-cols-2 gap-3" data-stagger>
          <StatCard
            label="Alunos ativos"
            value={totalAlunos}
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
            label="Aval. pendentes"
            value={pendingEvaluations}
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

      {/* ── ALUNOS EM PERIODO EXPERIMENTAL ─────────────────────────── */}
      <TrialStudentsPreview />

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

      {/* ── DUVIDAS PENDENTES ─────────────────────────────────────── */}
      {(duvidasPendentes ?? []).length > 0 && (
        <section className="animate-reveal" style={{ animationDelay: '0.37s' }}>
          <div className="mb-3 flex items-center justify-between">
            <h2
              className="text-base font-semibold"
              style={{ color: 'var(--bb-ink-100)' }}
            >
              Duvidas Pendentes
              <span
                className="ml-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[11px] font-bold text-white"
                style={{ background: 'var(--bb-warning)' }}
              >
                {(duvidasPendentes ?? []).length}
              </span>
            </h2>
            <Link
              href="/professor/duvidas"
              className="flex items-center gap-1 text-xs font-medium transition-colors"
              style={{ color: 'var(--bb-brand)' }}
            >
              Ver todas <ChevronRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-2" data-stagger>
            {(duvidasPendentes ?? []).slice(0, 3).map((duvida) => (
              <Link
                key={duvida.id}
                href={`/professor/duvidas`}
                className="block p-3 transition-all duration-200 hover:scale-[1.01]"
                style={{
                  background: 'var(--bb-depth-2)',
                  border: '1px solid var(--bb-glass-border)',
                  borderRadius: 'var(--bb-radius-lg)',
                  borderLeft: '3px solid var(--bb-warning)',
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center"
                    style={{
                      borderRadius: 'var(--bb-radius-full)',
                      background: 'var(--bb-warning-surface)',
                      color: 'var(--bb-warning)',
                    }}
                  >
                    <HelpCircleIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-sm font-medium line-clamp-2"
                      style={{ color: 'var(--bb-ink-100)' }}
                    >
                      &quot;{duvida.pergunta}&quot;
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-[11px]" style={{ color: 'var(--bb-ink-40)' }}>
                      <span>{duvida.alunoNome}</span>
                      <span>·</span>
                      <span>{duvida.videoTitulo}</span>
                      {duvida.timestampFormatado && (
                        <>
                          <span>·</span>
                          <span>{duvida.timestampFormatado}</span>
                        </>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-[11px]" style={{ color: 'var(--bb-ink-40)' }}>
                      <span>{duvida.votos} votos</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

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
