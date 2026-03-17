'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { getDashboardData } from '@/lib/api/admin-dashboard.service';
import type { DashboardData } from '@/lib/types/admin-dashboard';
import { getDailyBriefing } from '@/lib/api/painel-dia.service';
import type { DailyBriefingDTO } from '@/lib/api/painel-dia.service';
import { useCountUp } from '@/lib/hooks/useCountUp';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  UsersIcon,
  DollarIcon,
  TrendingUpIcon,
  CalendarIcon,
  VideoIcon,
  LinkIcon,
  SendIcon,
  BarChartIcon,
  StarIcon,
  UserIcon,
  AwardIcon,
  DownloadIcon,
} from '@/components/shell/icons';
import { ReportViewer } from '@/components/reports/ReportViewer';
import { generateMonthlyReport } from '@/lib/reports/monthly-report';
import type { MonthlyReportData } from '@/lib/types/report';

// ── Dynamic Recharts (no SSR) ──────────────────────────────────────
const AreaChart = dynamic(() => import('recharts').then((m) => m.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then((m) => m.Area), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(
  () => import('recharts').then((m) => m.ResponsiveContainer),
  { ssr: false },
);

// ── Helpers ────────────────────────────────────────────────────────

function getGreetingLabel(tod: 'morning' | 'afternoon' | 'evening'): string {
  if (tod === 'morning') return 'Bom dia';
  if (tod === 'afternoon') return 'Boa tarde';
  return 'Boa noite';
}

function getDayOfWeek(): string {
  const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  return days[new Date().getDay()];
}

function getFormattedDate(): string {
  return new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 0 });
}

function getFeedEmoji(type: string): string {
  const map: Record<string, string> = {
    check_in: '\uD83E\uDD4B',
    signup: '\uD83C\uDF89',
    belt_promotion: '\uD83E\uDD4B',
    payment: '\uD83D\uDCB0',
    video_watched: '\uD83D\uDCFA',
    quiz_completed: '\uD83D\uDCDD',
    absence_alert: '\u26A0\uFE0F',
    achievement: '\uD83C\uDFC6',
  };
  return map[type] ?? '\u2705';
}

function getBeltColor(belt: string): string {
  const map: Record<string, string> = {
    branca: '#E5E7EB',
    azul: '#3B82F6',
    roxa: '#A855F7',
    marrom: '#92400E',
    preta: '#1F2937',
  };
  return map[belt] ?? '#9CA3AF';
}

// ── Intersection Observer hook ─────────────────────────────────────

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

// ── Counter headline card ──────────────────────────────────────────

interface HeadlineCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  subtext: string;
  sparkline?: number[];
  icon: React.ReactNode;
  inView: boolean;
}

function HeadlineCard({ label, value, prefix, suffix, change, trend, subtext, sparkline, icon, inView }: HeadlineCardProps) {
  const animatedValue = useCountUp(inView ? value : 0, 1000, suffix === '%' ? 1 : 0);

  return (
    <div
      className="group relative overflow-hidden p-5 transition-all duration-300 hover:scale-[1.02]"
      style={{
        background: 'var(--bb-depth-2)',
        border: '1px solid var(--bb-glass-border)',
        borderRadius: 'var(--bb-radius-lg)',
        boxShadow: 'var(--bb-shadow-sm)',
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="h-4 w-4" style={{ color: 'var(--bb-ink-40)' }}>{icon}</span>
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>
              {label}
            </p>
          </div>
          <p
            className="mt-3 font-extrabold"
            style={{ fontSize: '32px', lineHeight: 1.1, color: 'var(--bb-ink-100)' }}
          >
            {prefix}{animatedValue}{suffix}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
              style={{
                color: trend === 'up' ? '#22C55E' : trend === 'down' ? '#EF4444' : 'var(--bb-ink-60)',
                background: trend === 'up' ? 'rgba(34,197,94,0.1)' : trend === 'down' ? 'rgba(239,68,68,0.1)' : 'var(--bb-depth-3)',
              }}
            >
              {trend === 'up' ? '\u2191' : trend === 'down' ? '\u2193' : '\u2192'} {change}
            </span>
            <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{subtext}</span>
          </div>
        </div>
        {sparkline && sparkline.length > 1 && (
          <SparklineSVG data={sparkline} color={trend === 'down' ? '#EF4444' : '#22C55E'} inView={inView} />
        )}
      </div>
    </div>
  );
}

// ── SVG Sparkline ──────────────────────────────────────────────────

function SparklineSVG({ data, color, inView }: { data: number[]; color: string; inView: boolean }) {
  const w = 60;
  const h = 24;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={w} height={h} className="flex-shrink-0" style={{ opacity: inView ? 1 : 0, transition: 'opacity 0.8s ease' }}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        style={{
          strokeDasharray: inView ? '0' : '200',
          strokeDashoffset: inView ? '0' : '200',
          transition: 'stroke-dasharray 0.8s ease, stroke-dashoffset 0.8s ease',
        }}
      />
    </svg>
  );
}

// ── SVG Donut ──────────────────────────────────────────────────────

function RetentionDonut({ percent, inView }: { percent: number; inView: boolean }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circumference * (inView ? percent : 0)) / 100;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--bb-ink-20)" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="#22C55E"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-2xl font-extrabold" style={{ color: 'var(--bb-ink-100)' }}>
          {inView ? percent.toFixed(1) : '0.0'}%
        </p>
        <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>retenção</p>
      </div>
    </div>
  );
}

// ── Progress Ring (achievements) ───────────────────────────────────

function ProgressRing({ progress, size = 56, unlocked }: { progress: number; size?: number; unlocked: boolean }) {
  const r = (size - 6) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (circumference * progress) / 100;

  return (
    <svg width={size} height={size} className="absolute inset-0">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--bb-ink-20)"
        strokeWidth="3"
        strokeDasharray={unlocked ? '0' : '4 4'}
      />
      {progress > 0 && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={unlocked ? '#22C55E' : 'var(--bb-brand)'}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      )}
    </svg>
  );
}

// ── Usage bar ──────────────────────────────────────────────────────

function UsageBar({ label, current, limit, suffix, inView }: { label: string; current: number; limit: number; suffix?: string; inView: boolean }) {
  const pct = Math.min((current / limit) * 100, 100);
  const color = pct >= 90 ? '#EF4444' : pct >= 80 ? '#F59E0B' : '#22C55E';
  const icon = pct >= 80 ? '\u26A0\uFE0F' : '\u2705';

  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-xs font-medium" style={{ color: 'var(--bb-ink-80)' }}>{label}</span>
      <div className="flex-1">
        <div className="h-2 overflow-hidden rounded-full" style={{ background: 'var(--bb-depth-5, var(--bb-ink-20))' }}>
          <div
            className="h-full rounded-full"
            style={{
              width: inView ? `${pct}%` : '0%',
              background: color,
              transition: 'width 0.8s ease-out',
            }}
          />
        </div>
      </div>
      <span className="w-24 text-right font-mono text-xs" style={{ color: 'var(--bb-ink-80)' }}>
        {suffix === 'GB' ? `${current.toFixed(0)}/${limit}GB` : `${current}/${limit}`}
      </span>
      <span className="w-12 text-right text-xs">{icon} {pct.toFixed(0)}%</span>
    </div>
  );
}

// ── Quick action icons map ─────────────────────────────────────────

function QuickActionIcon({ iconName }: { iconName: string }) {
  const map: Record<string, React.ReactNode> = {
    'user-plus': <UserIcon className="h-6 w-6" />,
    'link': <LinkIcon className="h-6 w-6" />,
    'megaphone': <SendIcon className="h-6 w-6" />,
    'dollar': <DollarIcon className="h-6 w-6" />,
    'chart': <BarChartIcon className="h-6 w-6" />,
    'video': <VideoIcon className="h-6 w-6" />,
  };
  return <span style={{ color: 'var(--bb-ink-60)' }}>{map[iconName] ?? <StarIcon className="h-6 w-6" />}</span>;
}

// ── Achievement icon map ───────────────────────────────────────────

function AchievementEmoji({ icon }: { icon: string }) {
  const map: Record<string, string> = {
    belt: '\uD83E\uDD4B',
    users: '\uD83D\uDC65',
    stadium: '\uD83C\uDFDF\uFE0F',
    target: '\uD83C\uDFAF',
    video: '\uD83D\uDCFA',
    star: '\u2B50',
    dollar: '\uD83D\uDCB0',
    check: '\u2705',
  };
  return <span className="text-2xl">{map[icon] ?? '\uD83C\uDFC6'}</span>;
}

// ── Tooltip style ──────────────────────────────────────────────────
const chartTooltipStyle: React.CSSProperties = {
  backgroundColor: 'var(--bb-depth-4, #1a1a2e)',
  border: '1px solid var(--bb-glass-border)',
  borderRadius: '8px',
  boxShadow: 'var(--bb-shadow-md)',
  color: 'var(--bb-ink-100)',
  fontSize: '12px',
};

// ── Skeleton loading ───────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="space-y-2">
        <Skeleton variant="text" className="h-10 w-72" />
        <Skeleton variant="text" className="h-5 w-96" />
        <Skeleton variant="text" className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} variant="card" className="h-36" />)}
      </div>
      <Skeleton variant="card" className="h-72" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton variant="card" className="h-96" />
        <Skeleton variant="card" className="h-96" />
      </div>
      <Skeleton variant="card" className="h-48" />
      <Skeleton variant="card" className="h-32" />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════════════

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [briefing, setBriefing] = useState<DailyBriefingDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartMode, setChartMode] = useState<'students' | 'revenue'>('students');
  const [monthlyReportData, setMonthlyReportData] = useState<MonthlyReportData | null>(null);
  const [reportExporting, setReportExporting] = useState(false);

  // Intersection observer refs for each section
  const headlinesObs = useInView();
  const chartObs = useInView();
  const retentionObs = useInView();
  const alertsObs = useInView();
  const achievementsObs = useInView();
  const usageObs = useInView();

  useEffect(() => {
    async function load() {
      try {
        const d = await getDashboardData('academy-1');
        setData(d);
        const b = await getDailyBriefing('academy-1');
        setBriefing(b);
      } catch {
        // handled by service
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || !data) return <DashboardSkeleton />;

  const { greeting, headlines, growth_chart, retention, today_schedule, activity_feed, pending_promotions, financial_summary, plan_usage, streaming_summary, quick_actions, academy_achievements } = data;

  // Growth chart data for Recharts
  const chartData = growth_chart.labels.map((label, i) => ({
    name: label,
    students: growth_chart.students[i],
    revenue: growth_chart.revenue[i],
    churn: growth_chart.churn[i],
  }));

  // Totals for schedule
  const totalEnrolled = today_schedule.reduce((acc, s) => acc + s.enrolled, 0);
  const totalOverdue = financial_summary.overdue_names.reduce((acc, o) => acc + o.amount, 0);
  const readyPromotions = pending_promotions.filter((p) => p.ready);

  // Growth trend text
  const studentGrowth = growth_chart.students;
  const firstStudents = studentGrowth[0];
  const lastStudents = studentGrowth[studentGrowth.length - 1];
  const growthPct = Math.round(((lastStudents - firstStudents) / firstStudents) * 100);

  return (
    <div className="min-h-screen space-y-8 p-4 sm:p-6" data-stagger>

      {/* ═══ SECTION 1: GREETING ═══════════════════════════════════════ */}
      <section className="animate-reveal">
        <h1
          className="font-extrabold"
          style={{ fontSize: 'clamp(28px, 5vw, 40px)', color: 'var(--bb-ink-100)', lineHeight: 1.2 }}
        >
          {getGreetingLabel(greeting.time_of_day)}, {greeting.admin_name}.
        </h1>
        <p
          className="mt-2"
          style={{ fontSize: '16px', color: 'var(--bb-ink-60)', maxWidth: '500px' }}
        >
          {briefing && briefing.alunosRisco.length > 0
            ? `${briefing.alunosRisco.length} alunos precisam da sua atencao.`
            : briefing && briefing.aniversariantes.length > 0
              ? `\uD83C\uDF82 ${briefing.aniversariantes[0].nome} faz aniversario hoje!`
              : `Sua academia esta saudavel hoje. ${briefing?.resumo.aulasHoje ?? 0} aulas agendadas.`}
        </p>
        <p
          className="mt-1 italic"
          style={{ fontSize: '14px', color: 'var(--bb-ink-40)', maxWidth: '500px' }}
        >
          &ldquo;{greeting.motivation_quote}&rdquo;
        </p>
        <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-40)' }}>
          {greeting.academy_name} &middot; {getDayOfWeek()}, {getFormattedDate()}
        </p>
        <button
          type="button"
          disabled={reportExporting}
          onClick={async () => {
            setReportExporting(true);
            try {
              const report = await generateMonthlyReport('academy-1', 'Marco 2026');
              setMonthlyReportData(report);
            } catch {
              // handled
            } finally {
              setReportExporting(false);
            }
          }}
          className="mt-3 inline-flex items-center gap-2 rounded-lg px-4 py-2 min-h-[44px] text-sm font-medium transition-all hover:opacity-80 disabled:opacity-50"
          style={{
            background: 'var(--bb-depth-3)',
            color: 'var(--bb-ink-100)',
            border: '1px solid var(--bb-glass-border)',
          }}
        >
          <DownloadIcon className="h-4 w-4" />
          {reportExporting ? 'Gerando...' : 'Exportar PDF'}
        </button>
      </section>

      {/* ═══ SECTION: HOJE (Daily Briefing) ═══════════════════════════ */}
      {briefing && (
        <section className="animate-reveal space-y-4">
          <h2
            className="text-lg font-bold"
            style={{ color: 'var(--bb-ink-100)' }}
          >
            HOJE
          </h2>

          {/* Aulas de Hoje */}
          <div
            className="overflow-hidden"
            style={{
              background: 'var(--bb-depth-2)',
              border: '1px solid var(--bb-glass-border)',
              borderRadius: 'var(--bb-radius-lg)',
            }}
          >
            <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                {'\uD83D\uDCDA'} Aulas de Hoje ({briefing.aulasHoje.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                    <th className="px-4 py-2 text-left text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>Horario</th>
                    <th className="px-4 py-2 text-left text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>Turma</th>
                    <th className="px-4 py-2 text-left text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>Professor</th>
                    <th className="px-4 py-2 text-right text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>Alunos</th>
                    <th className="px-4 py-2 text-left text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>Sala</th>
                  </tr>
                </thead>
                <tbody>
                  {briefing.aulasHoje.map((aula) => (
                    <tr key={aula.id} style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                      <td className="px-4 py-2 font-mono text-sm font-semibold" style={{ color: 'var(--bb-brand)' }}>{aula.horario}</td>
                      <td className="px-4 py-2 text-sm" style={{ color: 'var(--bb-ink-100)' }}>{aula.turma}</td>
                      <td className="px-4 py-2 text-sm" style={{ color: 'var(--bb-ink-60)' }}>{aula.professor}</td>
                      <td className="px-4 py-2 text-right text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>{aula.alunosEsperados}</td>
                      <td className="px-4 py-2 text-sm" style={{ color: 'var(--bb-ink-60)' }}>{aula.sala}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Aniversariantes */}
          {briefing.aniversariantes.length > 0 && (
            <div
              className="p-4"
              style={{
                background: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
                borderRadius: 'var(--bb-radius-lg)',
              }}
            >
              <h3 className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                {'\uD83C\uDF82'} Aniversariantes
              </h3>
              <div className="mt-3 flex flex-wrap gap-3">
                {briefing.aniversariantes.map((a) => (
                  <div key={a.id} className="flex items-center gap-2">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ background: 'var(--bb-brand)' }}
                    >
                      {a.nome.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>{a.nome}</p>
                      <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{a.idade} anos</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Atencao: Pagamentos vencendo + Alunos em risco */}
          {(briefing.vencendoAmanha.length > 0 || briefing.alunosRisco.length > 0) && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Pagamentos vencendo */}
              {briefing.vencendoAmanha.length > 0 && (
                <div
                  className="p-4"
                  style={{
                    background: 'var(--bb-depth-2)',
                    border: '1px solid #F59E0B',
                    borderRadius: 'var(--bb-radius-lg)',
                  }}
                >
                  <h3 className="text-sm font-semibold" style={{ color: '#F59E0B' }}>
                    {'\u26A0\uFE0F'} Pagamentos Vencendo
                  </h3>
                  <div className="mt-2 space-y-2">
                    {briefing.vencendoAmanha.map((v) => (
                      <div key={v.id} className="flex items-center justify-between">
                        <span className="text-sm" style={{ color: 'var(--bb-ink-100)' }}>{v.aluno}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-semibold" style={{ color: '#F59E0B' }}>
                            R$ {v.valor}
                          </span>
                          <span
                            className="rounded px-1.5 py-0.5 text-[10px] font-bold"
                            style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}
                          >
                            {v.diasAtraso}d
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Alunos em risco */}
              {briefing.alunosRisco.length > 0 && (
                <div
                  className="p-4"
                  style={{
                    background: 'var(--bb-depth-2)',
                    border: '1px solid var(--bb-error)',
                    borderRadius: 'var(--bb-radius-lg)',
                  }}
                >
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--bb-error)' }}>
                    {'\uD83D\uDEA8'} Alunos em Risco
                  </h3>
                  <div className="mt-2 space-y-2">
                    {briefing.alunosRisco.map((a) => (
                      <div key={a.id} className="flex items-center justify-between">
                        <span className="text-sm" style={{ color: 'var(--bb-ink-100)' }}>{a.nome}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>{a.diasAusente}d ausente</span>
                          <span
                            className="rounded px-1.5 py-0.5 text-[10px] font-bold text-white"
                            style={{ background: getBeltColor(a.faixa) }}
                          >
                            {a.faixa}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Graduacoes Prontas */}
          {briefing.graduacoesProntas.length > 0 && (
            <div
              className="p-4"
              style={{
                background: 'var(--bb-depth-2)',
                border: '1px solid #A855F7',
                borderRadius: 'var(--bb-radius-lg)',
              }}
            >
              <h3 className="text-sm font-semibold" style={{ color: '#A855F7' }}>
                {'\uD83E\uDD4B'} Graduacoes Prontas
              </h3>
              <div className="mt-2 space-y-2">
                {briefing.graduacoesProntas.map((g) => (
                  <div key={g.id} className="flex items-center gap-3">
                    <span className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>{g.aluno}</span>
                    <div className="flex items-center gap-1">
                      <span
                        className="inline-block h-3 w-3 rounded-full"
                        style={{ background: getBeltColor(g.faixaAtual), border: g.faixaAtual === 'branca' ? '1px solid var(--bb-ink-20)' : 'none' }}
                      />
                      <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{g.faixaAtual}</span>
                      <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{'\u2192'}</span>
                      <span
                        className="inline-block h-3 w-3 rounded-full"
                        style={{ background: getBeltColor(g.proximaFaixa) }}
                      />
                      <span className="text-xs font-semibold" style={{ color: '#A855F7' }}>{g.proximaFaixa}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ═══ SECTION 2: HEADLINES ══════════════════════════════════════ */}
      <section ref={headlinesObs.ref} className="animate-reveal">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" data-stagger>
          <HeadlineCard
            label="Alunos Ativos"
            value={headlines.active_students.value}
            change={`+${headlines.active_students.change} (+${((headlines.active_students.change / (headlines.active_students.value - headlines.active_students.change)) * 100).toFixed(1)}%)`}
            trend={headlines.active_students.trend}
            subtext={headlines.active_students.period}
            sparkline={growth_chart.students}
            icon={<UsersIcon className="h-4 w-4" />}
            inView={headlinesObs.inView}
          />
          <HeadlineCard
            label="Faturamento"
            value={headlines.monthly_revenue.value}
            prefix="R$"
            change={`+R$${(headlines.monthly_revenue.change / 1000).toFixed(1)}k`}
            trend={headlines.monthly_revenue.trend}
            subtext={headlines.monthly_revenue.period}
            sparkline={growth_chart.revenue}
            icon={<DollarIcon className="h-4 w-4" />}
            inView={headlinesObs.inView}
          />
          <HeadlineCard
            label="Retenção"
            value={headlines.retention_rate.value}
            suffix="%"
            change={`+${headlines.retention_rate.change}pp`}
            trend={headlines.retention_rate.trend}
            subtext={headlines.retention_rate.period}
            icon={<TrendingUpIcon className="h-4 w-4" />}
            inView={headlinesObs.inView}
          />
          <HeadlineCard
            label="Aulas/Semana"
            value={headlines.classes_this_week.value}
            change={`${headlines.classes_this_week.fill_rate}% lotação`}
            trend="stable"
            subtext={`${Math.round(headlines.classes_this_week.total_capacity * headlines.classes_this_week.fill_rate / 100)}/${headlines.classes_this_week.total_capacity} vagas`}
            icon={<CalendarIcon className="h-4 w-4" />}
            inView={headlinesObs.inView}
          />
        </div>
      </section>

      {/* ═══ SECTION 3: GROWTH CHART ═══════════════════════════════════ */}
      <section
        ref={chartObs.ref}
        className="animate-reveal overflow-hidden p-5"
        style={{
          background: 'var(--bb-depth-2)',
          border: '1px solid var(--bb-glass-border)',
          borderRadius: 'var(--bb-radius-lg)',
        }}
      >
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <TrendingUpIcon className="h-5 w-5" style={{ color: 'var(--bb-ink-40)' }} />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>Crescimento</h2>
          </div>
          <div className="flex gap-1 rounded-lg p-1" style={{ background: 'var(--bb-depth-3)' }}>
            <button
              type="button"
              onClick={() => setChartMode('students')}
              className="rounded-md px-3 py-1 text-xs font-medium transition-all"
              style={{
                background: chartMode === 'students' ? 'var(--bb-brand)' : 'transparent',
                color: chartMode === 'students' ? '#fff' : 'var(--bb-ink-60)',
              }}
            >
              Alunos
            </button>
            <button
              type="button"
              onClick={() => setChartMode('revenue')}
              className="rounded-md px-3 py-1 text-xs font-medium transition-all"
              style={{
                background: chartMode === 'revenue' ? 'var(--bb-brand)' : 'transparent',
                color: chartMode === 'revenue' ? '#fff' : 'var(--bb-ink-60)',
              }}
            >
              Receita
            </button>
          </div>
        </div>

        <div style={{ height: '260px', opacity: chartObs.inView ? 1 : 0, transition: 'opacity 1s ease' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="gradStudents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22C55E" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                tick={{ fill: 'var(--bb-ink-40)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'var(--bb-ink-40)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={45}
                tickFormatter={chartMode === 'revenue' ? (v) => `${(v / 1000).toFixed(0)}k` : undefined}
              />
              <Tooltip
                contentStyle={chartTooltipStyle}
                formatter={(value) =>
                  chartMode === 'revenue'
                    ? [`R$ ${formatCurrency(Number(value))}`, 'Receita']
                    : [`${value}`, 'Alunos']
                }
              />
              {chartMode === 'students' ? (
                <Area
                  type="monotone"
                  dataKey="students"
                  stroke="#3B82F6"
                  strokeWidth={2.5}
                  fill="url(#gradStudents)"
                  dot={{ fill: '#3B82F6', r: 4 }}
                  activeDot={{ r: 6 }}
                  animationDuration={1500}
                />
              ) : (
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#22C55E"
                  strokeWidth={2.5}
                  fill="url(#gradRevenue)"
                  dot={{ fill: '#22C55E', r: 4 }}
                  activeDot={{ r: 6 }}
                  animationDuration={1500}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <p className="mt-3 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
          Tendência: +{growthPct}% em 6 meses (+{lastStudents - firstStudents} alunos)
        </p>
      </section>

      {/* ═══ SECTION 4: TODAY — SCHEDULE + ACTIVITY FEED ═══════════════ */}
      <section className="animate-reveal grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Schedule */}
        <div
          className="p-5"
          style={{
            background: 'var(--bb-depth-2)',
            border: '1px solid var(--bb-glass-border)',
            borderRadius: 'var(--bb-radius-lg)',
          }}
        >
          <div className="mb-4 flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" style={{ color: 'var(--bb-ink-40)' }} />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
              Hoje &mdash; {getDayOfWeek()}, {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
            </h2>
          </div>

          <div className="space-y-3">
            {today_schedule.map((item) => {
              const fillPct = (item.enrolled / item.capacity) * 100;
              return (
                <div key={item.id} className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{
                        background: item.status === 'in_progress' ? '#22C55E' : item.status === 'completed' ? 'var(--bb-ink-40)' : 'var(--bb-ink-20)',
                        boxShadow: item.status === 'in_progress' ? '0 0 6px #22C55E' : 'none',
                      }}
                    />
                    <span className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                      {item.time}
                    </span>
                    <span className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                      {item.class_name}
                    </span>
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    <span className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                      {item.professor} &middot; {item.enrolled}/{item.capacity}
                    </span>
                    {item.confirmed > 0 && (
                      <span className="text-xs font-medium" style={{ color: '#22C55E' }}>
                        {item.confirmed} &#10003;
                      </span>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--bb-ink-20)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${fillPct}%`,
                          background: fillPct >= 90 ? '#EF4444' : fillPct >= 70 ? '#F59E0B' : '#22C55E',
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-4 text-xs font-medium" style={{ color: 'var(--bb-ink-40)' }}>
            Total: {totalEnrolled} alunos em {today_schedule.length} aulas
          </p>
        </div>

        {/* Activity Feed */}
        <div
          className="p-5"
          style={{
            background: 'var(--bb-depth-2)',
            border: '1px solid var(--bb-glass-border)',
            borderRadius: 'var(--bb-radius-lg)',
          }}
        >
          <div className="mb-4 flex items-center gap-2">
            <span style={{ color: 'var(--bb-ink-40)' }}>{'\u26A1'}</span>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>Atividade</h2>
          </div>

          <div className="space-y-2" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {activity_feed.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition-all"
                style={{
                  background: 'var(--bb-depth-3)',
                  animation: `slideInRight 0.3s ease ${idx * 0.05}s both`,
                }}
              >
                <span
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm"
                  style={{ background: `${item.accent_color}20` }}
                >
                  {getFeedEmoji(item.type)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm" style={{ color: 'var(--bb-ink-100)' }}>{item.message}</p>
                </div>
                <span className="flex-shrink-0 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                  {item.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 5: ATTENTION NEEDED ═══════════════════════════════ */}
      <section ref={alertsObs.ref} className="animate-reveal space-y-4" data-stagger>
        {/* Overdue payments */}
        {financial_summary.overdue_count > 0 && (
          <div
            className="overflow-hidden p-5"
            style={{
              background: 'var(--bb-depth-2)',
              borderLeft: '4px solid #EF4444',
              borderRadius: 'var(--bb-radius-lg)',
              animation: alertsObs.inView ? 'slideInRight 0.4s ease' : 'none',
            }}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                <span>{'\uD83D\uDD34'}</span> {financial_summary.overdue_count} mensalidades em atraso
              </h3>
              <span className="text-sm font-semibold" style={{ color: '#EF4444' }}>
                Total: R${formatCurrency(totalOverdue)}
              </span>
            </div>
            <div className="space-y-2">
              {financial_summary.overdue_names.map((o) => (
                <div key={o.name} className="flex items-center justify-between text-sm">
                  <span style={{ color: 'var(--bb-ink-80)' }}>{o.name}</span>
                  <span style={{ color: 'var(--bb-ink-60)' }}>
                    R${formatCurrency(o.amount)} &middot; {o.days_overdue} dias
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className="rounded-lg px-4 py-2 text-xs font-medium transition-all hover:opacity-80"
                style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
              >
                Enviar Lembrete
              </button>
              <Link
                href="/admin/financeiro"
                className="rounded-lg px-4 py-2 text-xs font-medium transition-all hover:opacity-80"
                style={{ background: 'var(--bb-brand)', color: '#fff' }}
              >
                Ver Financeiro →
              </Link>
            </div>
          </div>
        )}

        {/* At-risk students */}
        {retention.at_risk > 0 && (
          <div
            className="overflow-hidden p-5"
            style={{
              background: 'var(--bb-depth-2)',
              borderLeft: '4px solid #F59E0B',
              borderRadius: 'var(--bb-radius-lg)',
              animation: alertsObs.inView ? 'slideInRight 0.4s ease 0.1s both' : 'none',
            }}
          >
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
              <span>{'\u26A0\uFE0F'}</span> {retention.at_risk} alunos em risco de evasão
            </h3>
            <div className="space-y-2">
              {retention.at_risk_names.slice(0, 4).map((s) => (
                <div key={s.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-3 w-3 rounded-full" style={{ background: getBeltColor(s.belt) }} />
                    <span style={{ color: 'var(--bb-ink-80)' }}>{s.name}</span>
                  </div>
                  <span style={{ color: 'var(--bb-ink-60)' }}>
                    Última presença: {s.last_attendance}
                  </span>
                </div>
              ))}
              {retention.at_risk > 4 && (
                <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                  +{retention.at_risk - 4} mais...
                </p>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className="rounded-lg px-4 py-2 text-xs font-medium transition-all hover:opacity-80"
                style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
              >
                Enviar Mensagem
              </button>
              <button
                type="button"
                className="rounded-lg px-4 py-2 text-xs font-medium transition-all hover:opacity-80"
                style={{ background: '#F59E0B', color: '#000' }}
              >
                Ver Retenção →
              </button>
            </div>
          </div>
        )}

        {/* Pending promotions */}
        {readyPromotions.length > 0 && (
          <div
            className="overflow-hidden p-5"
            style={{
              background: 'var(--bb-depth-2)',
              borderLeft: '4px solid #A855F7',
              borderRadius: 'var(--bb-radius-lg)',
              animation: alertsObs.inView ? 'slideInRight 0.4s ease 0.2s both' : 'none',
            }}
          >
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
              <span>{'\uD83E\uDD4B'}</span> {readyPromotions.length} graduações prontas para aprovar
            </h3>
            <div className="space-y-2">
              {readyPromotions.map((p) => (
                <div key={p.student_name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-3 w-3 rounded-full" style={{ background: getBeltColor(p.current_belt) }} />
                    <span style={{ color: 'var(--bb-ink-80)' }}>{p.student_name}</span>
                    <span style={{ color: 'var(--bb-ink-40)' }}>→</span>
                    <span className="inline-block h-3 w-3 rounded-full" style={{ background: getBeltColor(p.suggested_belt) }} />
                  </div>
                  <span style={{ color: 'var(--bb-ink-60)' }}>
                    {p.attendance_count} presenças &middot; Quiz {p.quiz_avg}%
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className="rounded-lg px-4 py-2 text-xs font-medium transition-all hover:opacity-80"
                style={{ background: '#A855F7', color: '#fff' }}
              >
                Aprovar Graduação
              </button>
              <button
                type="button"
                className="rounded-lg px-4 py-2 text-xs font-medium transition-all hover:opacity-80"
                style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
              >
                Ver Detalhes →
              </button>
            </div>
          </div>
        )}

        {/* All clear */}
        {financial_summary.overdue_count === 0 && retention.at_risk === 0 && readyPromotions.length === 0 && (
          <div
            className="p-5"
            style={{
              background: 'var(--bb-success-surface)',
              borderLeft: '4px solid var(--bb-success)',
              borderRadius: 'var(--bb-radius-lg)',
            }}
          >
            <p className="flex items-center gap-2 text-sm font-medium" style={{ color: '#22C55E' }}>
              {'\u2705'} Tudo em dia! Nenhum alerta ativo.
            </p>
          </div>
        )}
      </section>

      {/* ═══ SECTION 6: QUICK ACTIONS ══════════════════════════════════ */}
      <section className="animate-reveal">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6" data-stagger>
          {quick_actions.map((action) => (
            <Link
              key={action.id}
              href={action.href}
              className="group relative flex flex-col items-center justify-center gap-2 rounded-xl p-4 transition-all duration-200 hover:scale-105"
              style={{
                background: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
                minHeight: '100px',
              }}
            >
              <QuickActionIcon iconName={action.icon} />
              <span className="text-center text-xs font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                {action.label}
              </span>
              {action.badge !== undefined && action.badge > 0 && (
                <span
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ background: action.accent ?? '#EF4444' }}
                >
                  {action.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* ═══ SECTION 7: CONTENT & RETENTION ════════════════════════════ */}
      <section ref={retentionObs.ref} className="animate-reveal grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Streaming summary */}
        <div
          className="p-5"
          style={{
            background: 'var(--bb-depth-2)',
            border: '1px solid var(--bb-glass-border)',
            borderRadius: 'var(--bb-radius-lg)',
          }}
        >
          <div className="mb-4 flex items-center gap-2">
            <VideoIcon className="h-4 w-4" style={{ color: 'var(--bb-ink-40)' }} />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>Biblioteca esta semana</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-extrabold" style={{ color: 'var(--bb-ink-100)' }}>
                {streaming_summary.total_views_week}
              </span>
              <span className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>visualizações</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg p-3" style={{ background: 'var(--bb-depth-3)' }}>
                <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>Conclusão</p>
                <p className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>{streaming_summary.completion_rate}%</p>
              </div>
              <div className="rounded-lg p-3" style={{ background: 'var(--bb-depth-3)' }}>
                <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>Novos vídeos</p>
                <p className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>{streaming_summary.new_videos_this_month}</p>
              </div>
            </div>

            <div className="rounded-lg p-3" style={{ background: 'var(--bb-depth-3)' }}>
              <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>Mais assistido</p>
              <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                &ldquo;{streaming_summary.most_watched.title}&rdquo;
                <span className="ml-1" style={{ color: 'var(--bb-ink-60)' }}>({streaming_summary.most_watched.views} views)</span>
              </p>
            </div>
          </div>
        </div>

        {/* Retention donut */}
        <div
          className="flex flex-col items-center justify-center p-5"
          style={{
            background: 'var(--bb-depth-2)',
            border: '1px solid var(--bb-glass-border)',
            borderRadius: 'var(--bb-radius-lg)',
          }}
        >
          <div className="mb-4 flex w-full items-center gap-2">
            <TrendingUpIcon className="h-4 w-4" style={{ color: 'var(--bb-ink-40)' }} />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>Retenção</h2>
          </div>

          <RetentionDonut percent={retention.current_month} inView={retentionObs.inView} />

          <div className="mt-4 text-center">
            <p className="flex items-center justify-center gap-1 text-sm" style={{ color: '#22C55E' }}>
              {'\u2191'} +{(retention.current_month - retention.previous_month).toFixed(1)}pp vs mês anterior
            </p>
            <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
              {retention.at_risk} alunos em risco
            </p>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 8: ACHIEVEMENTS ═══════════════════════════════════ */}
      <section ref={achievementsObs.ref} className="animate-reveal">
        <div className="mb-3 flex items-center gap-2">
          <AwardIcon className="h-4 w-4" style={{ color: 'var(--bb-ink-40)' }} />
          <h2 className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>Conquistas da Academia</h2>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2" data-stagger>
          {academy_achievements.map((ach, idx) => (
            <div
              key={ach.title}
              className="group relative flex flex-shrink-0 flex-col items-center gap-2 rounded-xl p-4 transition-all"
              style={{
                minWidth: '100px',
                background: 'var(--bb-depth-2)',
                border: ach.unlocked ? '1px solid var(--bb-glass-border)' : '1px dashed var(--bb-ink-20)',
                opacity: ach.unlocked ? 1 : 0.6,
                animation: achievementsObs.inView ? `scaleIn 0.4s ease ${idx * 0.05}s both` : 'none',
              }}
            >
              <div className="relative flex h-14 w-14 items-center justify-center">
                <ProgressRing progress={ach.progress ?? 0} size={56} unlocked={ach.unlocked} />
                <AchievementEmoji icon={ach.icon} />
              </div>
              {ach.unlocked && (
                <span className="absolute -right-1 -top-1 text-sm">{'\u2705'}</span>
              )}
              {!ach.unlocked && ach.progress !== undefined && ach.progress > 0 && (
                <span
                  className="absolute -right-1 -top-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                  style={{ background: 'var(--bb-brand)', color: '#fff' }}
                >
                  {ach.progress}%
                </span>
              )}
              {!ach.unlocked && (ach.progress === undefined || ach.progress === 0) && (
                <span className="absolute -right-1 -top-1 text-sm">{'\uD83D\uDD12'}</span>
              )}
              <span className="text-center text-[11px] font-medium leading-tight" style={{ color: 'var(--bb-ink-80)' }}>
                {ach.title}
              </span>

              {/* Tooltip */}
              <div
                className="pointer-events-none absolute -top-12 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs opacity-0 transition-opacity group-hover:opacity-100"
                style={{ background: 'var(--bb-depth-4, #1a1a2e)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)' }}
              >
                {ach.description}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ SECTION 9: PLAN USAGE ═════════════════════════════════════ */}
      <section ref={usageObs.ref} className="animate-reveal">
        <div
          className="p-5"
          style={{
            background: 'var(--bb-depth-2)',
            border: '1px solid var(--bb-glass-border)',
            borderRadius: 'var(--bb-radius-lg)',
          }}
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChartIcon className="h-4 w-4" style={{ color: 'var(--bb-ink-40)' }} />
              <h2 className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                Plano {plan_usage.plan_name}
              </h2>
            </div>
            {plan_usage.alerts.length > 0 && (
              <span
                className="rounded-full px-2 py-0.5 text-xs font-bold text-white"
                style={{ background: '#F59E0B' }}
              >
                {plan_usage.alerts.length} alerta{plan_usage.alerts.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="space-y-3">
            <UsageBar label="Alunos" current={plan_usage.students.current} limit={plan_usage.students.limit} inView={usageObs.inView} />
            <UsageBar label="Professores" current={plan_usage.professors.current} limit={plan_usage.professors.limit} inView={usageObs.inView} />
            <UsageBar label="Turmas" current={plan_usage.classes.current} limit={plan_usage.classes.limit} inView={usageObs.inView} />
            <UsageBar label="Storage" current={plan_usage.storage_gb.current} limit={plan_usage.storage_gb.limit} suffix="GB" inView={usageObs.inView} />
          </div>

          <div
            className="mt-4 flex items-center justify-between pt-3"
            style={{ borderTop: '1px solid var(--bb-glass-border)' }}
          >
            <Link
              href="/admin/plano"
              className="text-xs font-medium transition-opacity hover:opacity-80"
              style={{ color: 'var(--bb-brand)' }}
            >
              Ver detalhes →
            </Link>
            <Link
              href="/admin/plano"
              className="rounded-lg px-4 py-2 text-xs font-medium transition-all hover:opacity-80"
              style={{ background: 'var(--bb-brand)', color: '#fff' }}
            >
              Fazer Upgrade
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ REPORT VIEWER (PDF/Print overlay) ═══════════════════════ */}
      {monthlyReportData && (
        <section className="animate-reveal">
          <ReportViewer
            type="monthly"
            data={monthlyReportData}
            onClose={() => setMonthlyReportData(null)}
          />
        </section>
      )}
    </div>
  );
}
