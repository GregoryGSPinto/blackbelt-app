'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { BeltBadge } from '@/components/ui/BeltBadge';
import { BeltProgress } from '@/components/ui/BeltProgress';
import { Skeleton } from '@/components/ui/Skeleton';
import { BeltLevel, InvoiceStatus } from '@/lib/types';
import { BELT_ORDER, MIN_ATTENDANCE_FOR_PROMOTION } from '@/lib/types/constants';
import type { BeltColor } from '@/components/ui/BeltStripe';

// ── Inline SVG icons (project does not use lucide-react) ────────────

function SvgIcon({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      {children}
    </svg>
  );
}

function ArrowLeftIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <SvgIcon className={className} style={style}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></SvgIcon>;
}

function MailIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <SvgIcon className={className} style={style}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></SvgIcon>;
}

function PhoneIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <SvgIcon className={className} style={style}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" /></SvgIcon>;
}

function CalendarIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <SvgIcon className={className} style={style}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></SvgIcon>;
}

function TrendingUpIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <SvgIcon className={className} style={style}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></SvgIcon>;
}

function FlameIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <SvgIcon className={className} style={style}><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" /></SvgIcon>;
}

function PlayIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <SvgIcon className={className} style={style}><polygon points="5 3 19 12 5 21 5 3" /></SvgIcon>;
}

function BookOpenIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <SvgIcon className={className} style={style}><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" /></SvgIcon>;
}

function AwardIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <SvgIcon className={className} style={style}><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></SvgIcon>;
}

function AlertCircleIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <SvgIcon className={className} style={style}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></SvgIcon>;
}

function CheckCircleIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <SvgIcon className={className} style={style}><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></SvgIcon>;
}

function ClockIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <SvgIcon className={className} style={style}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></SvgIcon>;
}

function StarIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <SvgIcon className={className} style={style}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></SvgIcon>;
}

// ── Types (inline mock) ─────────────────────────────────────────────

interface StudentProfile {
  id: string;
  display_name: string;
  email: string;
  phone: string;
  avatar: string | null;
  belt: BeltLevel;
  started_at: string;
  modality: string;
}

interface BeltCriteria {
  attendance: { current: number; required: number };
  months: { current: number; required: number };
  quiz: { current: number; required: number };
}

interface AttendanceData {
  total: number;
  avg_per_week: number;
  current_streak: number;
  heatmap: HeatmapDay[];
}

interface HeatmapDay {
  date: string;
  count: number;
}

interface StreamingData {
  videos_watched: number;
  series_completed: number;
  avg_quiz_score: number;
  hours_watched: number;
}

interface MensalidadeRow {
  id: string;
  month: string;
  amount: number;
  status: InvoiceStatus;
  due_date: string;
}

interface TimelineEvent {
  id: string;
  type: 'graduation' | 'milestone' | 'evaluation';
  title: string;
  description: string;
  date: string;
}

interface StudentProfileData {
  student: StudentProfile;
  beltCriteria: BeltCriteria;
  attendance: AttendanceData;
  streaming: StreamingData;
  mensalidades: MensalidadeRow[];
  timeline: TimelineEvent[];
}

// ── Belt helpers ────────────────────────────────────────────────────

const BELT_CSS_VAR: Record<string, string> = {
  white: 'var(--bb-belt-white)', gray: 'var(--bb-belt-gray)',
  yellow: 'var(--bb-belt-yellow)', orange: 'var(--bb-belt-orange)',
  green: 'var(--bb-belt-green)', blue: 'var(--bb-belt-blue)',
  purple: 'var(--bb-belt-purple)', brown: 'var(--bb-belt-brown)',
  black: 'var(--bb-belt-black)',
};

function getNextBelt(current: BeltLevel): BeltLevel {
  const idx = BELT_ORDER.indexOf(current);
  if (idx < 0 || idx >= BELT_ORDER.length - 1) return current;
  return BELT_ORDER[idx + 1];
}

function getInitials(name: string): string {
  return name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('');
}

// ── Heatmap generator ───────────────────────────────────────────────

function generateHeatmap(): HeatmapDay[] {
  const days: HeatmapDay[] = [];
  const today = new Date();
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    let count = 0;
    if (!isWeekend) {
      const rand = Math.random();
      if (rand < 0.6) count = 1;
      else if (rand < 0.8) count = 2;
    }
    days.push({
      date: d.toISOString().split('T')[0],
      count,
    });
  }
  return days;
}

// ── Mock data builder ───────────────────────────────────────────────

function buildMockData(studentId: string): StudentProfileData {
  const belt = BeltLevel.Blue;
  const nextBelt = getNextBelt(belt);
  const required = MIN_ATTENDANCE_FOR_PROMOTION[nextBelt];

  return {
    student: {
      id: studentId,
      display_name: 'Lucas Mendes',
      email: 'lucas.mendes@email.com',
      phone: '(11) 98765-4321',
      avatar: null,
      belt,
      started_at: '2023-03-15T00:00:00Z',
      modality: 'Jiu-Jitsu',
    },
    beltCriteria: {
      attendance: { current: 48, required },
      months: { current: 4, required: 6 },
      quiz: { current: 72, required: 70 },
    },
    attendance: {
      total: 187,
      avg_per_week: 3.2,
      current_streak: 12,
      heatmap: generateHeatmap(),
    },
    streaming: {
      videos_watched: 34,
      series_completed: 3,
      avg_quiz_score: 82,
      hours_watched: 18.5,
    },
    mensalidades: [
      { id: 'm-1', month: 'Mar 2026', amount: 19900, status: InvoiceStatus.Paid, due_date: '2026-03-10' },
      { id: 'm-2', month: 'Fev 2026', amount: 19900, status: InvoiceStatus.Paid, due_date: '2026-02-10' },
      { id: 'm-3', month: 'Jan 2026', amount: 19900, status: InvoiceStatus.Open, due_date: '2026-01-10' },
    ],
    timeline: [
      { id: 't-1', type: 'graduation', title: 'Promocao para Faixa Azul', description: 'Avaliado por Prof. Ricardo', date: '2025-09-20T00:00:00Z' },
      { id: 't-2', type: 'milestone', title: '150 aulas completadas', description: 'Marco de dedicacao', date: '2025-07-12T00:00:00Z' },
      { id: 't-3', type: 'evaluation', title: 'Avaliacao Tecnica', description: 'Nota 85/100 — Tecnica avancada de guarda', date: '2025-06-05T00:00:00Z' },
      { id: 't-4', type: 'graduation', title: 'Promocao para Faixa Verde', description: 'Avaliado por Prof. Ricardo', date: '2024-12-18T00:00:00Z' },
      { id: 't-5', type: 'milestone', title: '100 aulas completadas', description: 'Marco de consistencia', date: '2024-10-01T00:00:00Z' },
    ],
  };
}

// ── Status helpers ──────────────────────────────────────────────────

function invoiceStatusLabel(status: InvoiceStatus): string {
  const map: Record<InvoiceStatus, string> = {
    [InvoiceStatus.Paid]: 'Pago',
    [InvoiceStatus.Open]: 'Em aberto',
    [InvoiceStatus.Draft]: 'Rascunho',
    [InvoiceStatus.Void]: 'Cancelado',
    [InvoiceStatus.Uncollectible]: 'Inadimplente',
  };
  return map[status];
}

function invoiceStatusStyle(status: InvoiceStatus): { bg: string; text: string } {
  switch (status) {
    case InvoiceStatus.Paid:
      return { bg: 'var(--bb-success-surface)', text: 'var(--bb-success)' };
    case InvoiceStatus.Open:
      return { bg: 'var(--bb-warning-surface)', text: 'var(--bb-warning)' };
    case InvoiceStatus.Uncollectible:
      return { bg: 'rgba(239, 68, 68, 0.08)', text: 'var(--bb-error)' };
    default:
      return { bg: 'var(--bb-info-surface)', text: 'var(--bb-info)' };
  }
}

function timelineIcon(type: TimelineEvent['type']): React.ReactNode {
  switch (type) {
    case 'graduation': return <AwardIcon className="h-4 w-4" />;
    case 'milestone': return <StarIcon className="h-4 w-4" />;
    case 'evaluation': return <BookOpenIcon className="h-4 w-4" />;
  }
}

function timelineColor(type: TimelineEvent['type']): string {
  switch (type) {
    case 'graduation': return 'var(--bb-brand)';
    case 'milestone': return 'var(--bb-warning)';
    case 'evaluation': return 'var(--bb-info)';
  }
}

// ── Heatmap cell colors ─────────────────────────────────────────────

function heatmapCellColor(count: number): string {
  if (count === 0) return 'var(--bb-depth-4)';
  if (count === 1) return 'rgba(239, 68, 68, 0.3)';
  return 'rgba(239, 68, 68, 0.7)';
}

// ── Main ────────────────────────────────────────────────────────────

export default function AdminStudentProfilePage() {
  const params = useParams();
  const studentId = typeof params.id === 'string' ? params.id : 'stu-1';

  const [data, setData] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Action modals state ─────────────────────────────────────────
  const [showGraduar, setShowGraduar] = useState(false);
  const [showTrancar, setShowTrancar] = useState(false);
  const [showCancelar, setShowCancelar] = useState(false);
  const [showTransferir, setShowTransferir] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [novaFaixa, setNovaFaixa] = useState('');
  const [motivoTrancar, setMotivoTrancar] = useState('');
  const [motivoCancelar, setMotivoCancelar] = useState('');
  const [novaTurma, setNovaTurma] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setData(buildMockData(studentId));
      } catch (err) {
        console.error('[AdminStudentProfilePage]', err);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [studentId]);

  if (loading || !data) {
    return (
      <div className="space-y-4 p-6" data-stagger>
        <Skeleton variant="text" className="h-6 w-40" />
        <Skeleton variant="card" className="h-28" />
        <Skeleton variant="card" className="h-40" />
        <Skeleton variant="card" className="h-32" />
        <Skeleton variant="card" className="h-32" />
        <Skeleton variant="card" className="h-24" />
      </div>
    );
  }

  const { student, beltCriteria, attendance, streaming, mensalidades, timeline } = data;
  const nextBelt = getNextBelt(student.belt);
  const beltProgress = nextBelt !== student.belt
    ? Math.round((beltCriteria.attendance.current / beltCriteria.attendance.required) * 100)
    : 100;
  const hasOverdue = mensalidades.some(
    m => m.status === InvoiceStatus.Open || m.status === InvoiceStatus.Uncollectible,
  );

  return (
    <div className="space-y-6 p-6 animate-reveal">
      {/* ── Back nav ─────────────────────────────────────────── */}
      <Link
        href="/admin/alunos"
        className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
        style={{ color: 'var(--bb-ink-60)' }}
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Voltar para alunos
      </Link>

      {/* ── Header ───────────────────────────────────────────── */}
      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          {/* Avatar */}
          <div
            className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full text-xl font-bold text-white"
            style={{ background: BELT_CSS_VAR[student.belt] }}
          >
            {getInitials(student.display_name)}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1
                className="text-xl font-bold"
                style={{ color: 'var(--bb-ink-100)' }}
              >
                {student.display_name}
              </h1>
              <BeltBadge color={student.belt as BeltColor} size="md" />
            </div>
            <div className="flex flex-wrap gap-4 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              <span className="inline-flex items-center gap-1.5">
                <MailIcon className="h-3.5 w-3.5" /> {student.email}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <PhoneIcon className="h-3.5 w-3.5" /> {student.phone}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5" />
                Treina desde {new Date(student.started_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Action Buttons ──────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => { setNovaFaixa(getNextBelt(student.belt)); setShowGraduar(true); }} className="rounded-lg px-4 py-2 text-sm font-medium" style={{ background: '#22c55e20', color: '#22c55e' }}>
          🎖️ Graduar
        </button>
        <button onClick={() => setShowTrancar(true)} className="rounded-lg px-4 py-2 text-sm font-medium" style={{ background: '#f59e0b20', color: '#f59e0b' }}>
          🔒 Trancar Matrícula
        </button>
        <button onClick={() => setShowCancelar(true)} className="rounded-lg px-4 py-2 text-sm font-medium" style={{ background: '#ef444420', color: '#ef4444' }}>
          ❌ Cancelar Matrícula
        </button>
        <button onClick={() => setShowTransferir(true)} className="rounded-lg px-4 py-2 text-sm font-medium" style={{ background: '#3b82f620', color: '#3b82f6' }}>
          🔄 Transferir Turma
        </button>
      </div>

      {/* ── Belt Section ─────────────────────────────────────── */}
      <Card className="p-6">
        <h2
          className="mb-4 text-base font-semibold"
          style={{ color: 'var(--bb-ink-100)' }}
        >
          Progressao de Faixa
        </h2>

        <div className="mb-4">
          <BeltProgress
            current={student.belt as BeltColor}
            next={nextBelt as BeltColor}
            progress={beltProgress}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* Attendance */}
          <div
            className="rounded-[var(--bb-radius-md)] p-4"
            style={{ background: 'var(--bb-depth-4)', border: '1px solid var(--bb-glass-border)' }}
          >
            <p className="text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
              Presenca
            </p>
            <p className="mt-1 text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              {beltCriteria.attendance.current}/{beltCriteria.attendance.required}
            </p>
            <div
              className="mt-2 h-1.5 overflow-hidden rounded-full"
              style={{ background: 'var(--bb-depth-5)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min((beltCriteria.attendance.current / beltCriteria.attendance.required) * 100, 100)}%`,
                  background: 'var(--bb-brand)',
                }}
              />
            </div>
          </div>

          {/* Months */}
          <div
            className="rounded-[var(--bb-radius-md)] p-4"
            style={{ background: 'var(--bb-depth-4)', border: '1px solid var(--bb-glass-border)' }}
          >
            <p className="text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
              Tempo na faixa
            </p>
            <p className="mt-1 text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              {beltCriteria.months.current}/{beltCriteria.months.required} meses
            </p>
            <div
              className="mt-2 h-1.5 overflow-hidden rounded-full"
              style={{ background: 'var(--bb-depth-5)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min((beltCriteria.months.current / beltCriteria.months.required) * 100, 100)}%`,
                  background: 'var(--bb-info)',
                }}
              />
            </div>
          </div>

          {/* Quiz */}
          <div
            className="rounded-[var(--bb-radius-md)] p-4"
            style={{ background: 'var(--bb-depth-4)', border: '1px solid var(--bb-glass-border)' }}
          >
            <p className="text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
              Quiz aprovacao
            </p>
            <p className="mt-1 text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              {beltCriteria.quiz.current}%
              <span className="text-sm font-normal" style={{ color: 'var(--bb-ink-60)' }}>
                {' '}/ {beltCriteria.quiz.required}%
              </span>
            </p>
            <div
              className="mt-2 h-1.5 overflow-hidden rounded-full"
              style={{ background: 'var(--bb-depth-5)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min((beltCriteria.quiz.current / beltCriteria.quiz.required) * 100, 100)}%`,
                  background: beltCriteria.quiz.current >= beltCriteria.quiz.required
                    ? 'var(--bb-success)' : 'var(--bb-warning)',
                }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* ── Attendance Section ───────────────────────────────── */}
      <Card className="p-6">
        <h2
          className="mb-4 text-base font-semibold"
          style={{ color: 'var(--bb-ink-100)' }}
        >
          Frequencia
        </h2>

        <div className="mb-6 grid grid-cols-3 gap-3">
          <div
            className="rounded-[var(--bb-radius-md)] p-4 text-center"
            style={{ background: 'var(--bb-depth-4)', border: '1px solid var(--bb-glass-border)' }}
          >
            <TrendingUpIcon className="mx-auto h-5 w-5" style={{ color: 'var(--bb-brand)' }} />
            <p className="mt-2 text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              {attendance.total}
            </p>
            <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Total</p>
          </div>
          <div
            className="rounded-[var(--bb-radius-md)] p-4 text-center"
            style={{ background: 'var(--bb-depth-4)', border: '1px solid var(--bb-glass-border)' }}
          >
            <CalendarIcon className="mx-auto h-5 w-5" style={{ color: 'var(--bb-info)' }} />
            <p className="mt-2 text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              {attendance.avg_per_week}
            </p>
            <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Media/semana</p>
          </div>
          <div
            className="rounded-[var(--bb-radius-md)] p-4 text-center"
            style={{ background: 'var(--bb-depth-4)', border: '1px solid var(--bb-glass-border)' }}
          >
            <FlameIcon className="mx-auto h-5 w-5" style={{ color: 'var(--bb-warning)' }} />
            <p className="mt-2 text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              {attendance.current_streak}
            </p>
            <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Sequencia</p>
          </div>
        </div>

        {/* Mini Heatmap */}
        <div>
          <p className="mb-2 text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
            Ultimas 12 semanas
          </p>
          <div className="flex flex-wrap gap-[3px]">
            {attendance.heatmap.map(day => (
              <div
                key={day.date}
                className="h-3 w-3 rounded-[2px] transition-colors"
                style={{ background: heatmapCellColor(day.count) }}
                title={`${day.date}: ${day.count} aula${day.count !== 1 ? 's' : ''}`}
              />
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2 text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>
            <span>Menos</span>
            <div className="h-2.5 w-2.5 rounded-[2px]" style={{ background: 'var(--bb-depth-4)' }} />
            <div className="h-2.5 w-2.5 rounded-[2px]" style={{ background: 'rgba(239, 68, 68, 0.3)' }} />
            <div className="h-2.5 w-2.5 rounded-[2px]" style={{ background: 'rgba(239, 68, 68, 0.7)' }} />
            <span>Mais</span>
          </div>
        </div>
      </Card>

      {/* ── Streaming Section ────────────────────────────────── */}
      <Card className="p-6">
        <h2
          className="mb-4 text-base font-semibold"
          style={{ color: 'var(--bb-ink-100)' }}
        >
          Streaming
        </h2>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div
            className="rounded-[var(--bb-radius-md)] p-4 text-center"
            style={{ background: 'var(--bb-depth-4)', border: '1px solid var(--bb-glass-border)' }}
          >
            <PlayIcon className="mx-auto h-5 w-5" style={{ color: 'var(--bb-brand)' }} />
            <p className="mt-2 text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              {streaming.videos_watched}
            </p>
            <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Videos</p>
          </div>
          <div
            className="rounded-[var(--bb-radius-md)] p-4 text-center"
            style={{ background: 'var(--bb-depth-4)', border: '1px solid var(--bb-glass-border)' }}
          >
            <BookOpenIcon className="mx-auto h-5 w-5" style={{ color: 'var(--bb-info)' }} />
            <p className="mt-2 text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              {streaming.series_completed}
            </p>
            <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Series</p>
          </div>
          <div
            className="rounded-[var(--bb-radius-md)] p-4 text-center"
            style={{ background: 'var(--bb-depth-4)', border: '1px solid var(--bb-glass-border)' }}
          >
            <AwardIcon className="mx-auto h-5 w-5" style={{ color: 'var(--bb-success)' }} />
            <p className="mt-2 text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              {streaming.avg_quiz_score}%
            </p>
            <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Quiz</p>
          </div>
          <div
            className="rounded-[var(--bb-radius-md)] p-4 text-center"
            style={{ background: 'var(--bb-depth-4)', border: '1px solid var(--bb-glass-border)' }}
          >
            <ClockIcon className="mx-auto h-5 w-5" style={{ color: 'var(--bb-warning)' }} />
            <p className="mt-2 text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              {streaming.hours_watched}h
            </p>
            <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Assistidas</p>
          </div>
        </div>
      </Card>

      {/* ── Financial Section ────────────────────────────────── */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2
            className="text-base font-semibold"
            style={{ color: 'var(--bb-ink-100)' }}
          >
            Financeiro
          </h2>
          {hasOverdue && (
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                color: 'var(--bb-error)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
              }}
            >
              <AlertCircleIcon className="h-3.5 w-3.5" />
              Pagamento pendente
            </span>
          )}
        </div>

        <div className="space-y-2">
          {mensalidades.map(m => {
            const statusStyle = invoiceStatusStyle(m.status);
            return (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-[var(--bb-radius-sm)] px-4 py-3"
                style={{ background: 'var(--bb-depth-4)', border: '1px solid var(--bb-glass-border)' }}
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                    {m.month}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                    Vence {new Date(m.due_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                    R$ {(m.amount / 100).toFixed(2).replace('.', ',')}
                  </span>
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{ background: statusStyle.bg, color: statusStyle.text }}
                  >
                    {m.status === InvoiceStatus.Paid && <CheckCircleIcon className="h-3 w-3" />}
                    {m.status === InvoiceStatus.Open && <ClockIcon className="h-3 w-3" />}
                    {invoiceStatusLabel(m.status)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── History Section (Timeline) ───────────────────────── */}
      <Card className="p-6">
        <h2
          className="mb-4 text-base font-semibold"
          style={{ color: 'var(--bb-ink-100)' }}
        >
          Historico
        </h2>

        <div className="relative space-y-0">
          {/* Vertical line */}
          <div
            className="absolute left-[15px] top-2 bottom-2 w-px"
            style={{ background: 'var(--bb-glass-border)' }}
          />

          {timeline.map((event, i) => {
            const color = timelineColor(event.type);
            return (
              <div
                key={event.id}
                className="relative flex gap-4 py-3"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {/* Dot */}
                <div
                  className="relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
                  style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
                >
                  {timelineIcon(event.type)}
                </div>

                {/* Content */}
                <div className="flex-1 pt-0.5">
                  <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                    {event.title}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                    {event.description}
                  </p>
                  <p className="mt-1 text-[11px]" style={{ color: 'var(--bb-ink-40)' }}>
                    {new Date(event.date).toLocaleDateString('pt-BR', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── Action Modals ──────────────────────────────────────── */}

      {/* Graduar */}
      {showGraduar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => setShowGraduar(false)}>
          <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: 'var(--bb-depth-3)' }} onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>Graduar Aluno</h3>
            <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>Graduando: {student.display_name}</p>
            <div className="mt-3">
              <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Nova faixa</label>
              <select value={novaFaixa} onChange={(e) => setNovaFaixa(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm" style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}>
                {['branca', 'azul', 'roxa', 'marrom', 'preta'].map((f) => <option key={f} value={f}>Faixa {f}</option>)}
              </select>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setShowGraduar(false)} className="flex-1 rounded-lg px-4 py-2 text-sm" style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-80)' }}>Cancelar</button>
              <button onClick={() => { setActionMsg(`${student.display_name} graduado para faixa ${novaFaixa}!`); setShowGraduar(false); setTimeout(() => setActionMsg(''), 3000); }} className="flex-1 rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: '#22c55e' }}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* Trancar */}
      {showTrancar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => setShowTrancar(false)}>
          <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: 'var(--bb-depth-3)' }} onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>Trancar Matrícula</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Motivo</label>
                <select value={motivoTrancar} onChange={(e) => setMotivoTrancar(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm" style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}>
                  <option value="">Selecionar...</option>
                  <option value="viagem">Viagem</option>
                  <option value="saude">Saúde / Lesão</option>
                  <option value="financeiro">Financeiro</option>
                  <option value="pessoal">Motivo pessoal</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setShowTrancar(false)} className="flex-1 rounded-lg px-4 py-2 text-sm" style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-80)' }}>Cancelar</button>
              <button onClick={() => { setActionMsg('Matrícula trancada!'); setShowTrancar(false); setTimeout(() => setActionMsg(''), 3000); }} className="flex-1 rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: '#f59e0b' }}>Trancar</button>
            </div>
          </div>
        </div>
      )}

      {/* Cancelar */}
      {showCancelar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => setShowCancelar(false)}>
          <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: 'var(--bb-depth-3)' }} onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-bold" style={{ color: '#ef4444' }}>Cancelar Matrícula</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Motivo do cancelamento</label>
                <select value={motivoCancelar} onChange={(e) => setMotivoCancelar(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm" style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}>
                  <option value="">Selecionar...</option>
                  <option value="mudanca">Mudança de cidade</option>
                  <option value="financeiro">Financeiro</option>
                  <option value="desinteresse">Desinteresse</option>
                  <option value="saude">Problema de saúde</option>
                  <option value="insatisfacao">Insatisfação</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setShowCancelar(false)} className="flex-1 rounded-lg px-4 py-2 text-sm" style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-80)' }}>Voltar</button>
              <button onClick={() => { setActionMsg('Matrícula cancelada.'); setShowCancelar(false); setTimeout(() => setActionMsg(''), 3000); }} className="flex-1 rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: '#ef4444' }}>Confirmar Cancelamento</button>
            </div>
          </div>
        </div>
      )}

      {/* Transferir */}
      {showTransferir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => setShowTransferir(false)}>
          <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: 'var(--bb-depth-3)' }} onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>Transferir Turma</h3>
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--bb-ink-80)' }}>Nova turma</label>
              <select value={novaTurma} onChange={(e) => setNovaTurma(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm" style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}>
                <option value="">Selecionar...</option>
                <option value="bjj-adulto">BJJ Adulto (Seg/Qua/Sex 18h)</option>
                <option value="bjj-iniciante">BJJ Iniciante (Seg/Qua 06:30)</option>
                <option value="bjj-feminino">BJJ Feminino (Ter/Qui 10h)</option>
                <option value="muay-thai">Muay Thai (Seg/Qua/Sex 19:30)</option>
              </select>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setShowTransferir(false)} className="flex-1 rounded-lg px-4 py-2 text-sm" style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-80)' }}>Cancelar</button>
              <button onClick={() => { setActionMsg('Aluno transferido de turma!'); setShowTransferir(false); setTimeout(() => setActionMsg(''), 3000); }} disabled={!novaTurma} className="flex-1 rounded-lg px-4 py-2 text-sm font-bold text-white disabled:opacity-50" style={{ background: '#3b82f6' }}>Transferir</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast-like action message */}
      {actionMsg && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg" style={{ background: 'var(--bb-brand)' }}>
          {actionMsg}
        </div>
      )}
    </div>
  );
}
