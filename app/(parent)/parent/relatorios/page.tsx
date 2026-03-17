'use client';

import { useState, useEffect, useMemo } from 'react';
import { getGuardianDashboard } from '@/lib/api/responsavel.service';
import type { GuardianDashboardDTO, GuardianChildDTO } from '@/lib/api/responsavel.service';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  BarChartIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  DollarIcon,
  HeartIcon,
  AwardIcon,
} from '@/components/shell/icons';

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Marco',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

function getMonthLabel(month: number, year: number): string {
  return `${MONTHS[month]} ${year}`;
}

function getPaymentStatusStyle(status: string): {
  label: string;
  color: string;
  bg: string;
} {
  switch (status) {
    case 'em_dia':
      return {
        label: 'Em dia',
        color: 'text-green-700',
        bg: 'bg-green-50',
      };
    case 'pendente':
      return {
        label: 'Pendente',
        color: 'text-amber-700',
        bg: 'bg-amber-50',
      };
    case 'atrasado':
      return {
        label: 'Atrasado',
        color: 'text-red-700',
        bg: 'bg-red-50',
      };
    default:
      return {
        label: status,
        color: 'text-[var(--bb-ink-60)]',
        bg: 'bg-[var(--bb-depth-4)]',
      };
  }
}

function getHealthColor(score: number): string {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#f59e0b';
  return '#ef4444';
}

// ────────────────────────────────────────────────────────────
// Skeleton
// ────────────────────────────────────────────────────────────

function RelatoriosSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--bb-depth-1)] p-4">
      <div className="mx-auto max-w-lg space-y-4">
        <Skeleton variant="text" className="h-8 w-48" />
        <Skeleton variant="text" className="h-10 w-64" />
        <Skeleton variant="card" className="h-64" />
        <Skeleton variant="card" className="h-64" />
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Circular Progress
// ────────────────────────────────────────────────────────────

function CircularProgress({
  percent,
  size = 64,
  strokeWidth = 5,
  color,
}: {
  percent: number;
  size?: number;
  strokeWidth?: number;
  color: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--bb-glass-border)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-extrabold text-[var(--bb-ink-100)]">
          {percent}%
        </span>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Progress Bar
// ────────────────────────────────────────────────────────────

function ProgressBar({
  percent,
  color,
}: {
  percent: number;
  color: string;
}) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--bb-depth-4)]">
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{
          width: `${Math.min(percent, 100)}%`,
          backgroundColor: color,
        }}
      />
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Child Report Card
// ────────────────────────────────────────────────────────────

function ChildReportCard({ child }: { child: GuardianChildDTO }) {
  const paymentStyle = getPaymentStatusStyle(child.payment.status);
  const healthColor = getHealthColor(child.health_score.score);
  const frequencyColor =
    child.frequency_percent >= 80
      ? '#10b981'
      : child.frequency_percent >= 60
        ? '#f59e0b'
        : '#ef4444';

  return (
    <Card className="overflow-hidden p-0">
      {/* Child Header */}
      <div className="flex items-center gap-3 border-b border-[var(--bb-glass-border)] p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--bb-brand-surface)]">
          <span className="text-lg font-extrabold text-[var(--bb-brand)]">
            {child.display_name.charAt(0)}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-[var(--bb-ink-100)]">
            {child.display_name}
          </h3>
          <p className="text-xs text-[var(--bb-ink-60)]">
            {child.belt_label} — {child.age} anos
          </p>
        </div>
      </div>

      <div className="space-y-4 p-4">
        {/* Attendance */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-[var(--bb-ink-40)]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--bb-ink-40)]">
              Frequencia Mensal
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <ProgressBar percent={child.frequency_percent} color={frequencyColor} />
            </div>
            <span
              className="text-sm font-extrabold"
              style={{ color: frequencyColor }}
            >
              {child.frequency_percent}%
            </span>
          </div>
          <p className="mt-1 text-[10px] text-[var(--bb-ink-40)]">
            {child.frequency_percent >= 80
              ? 'Otima frequencia! Continue assim.'
              : child.frequency_percent >= 60
                ? 'Frequencia pode melhorar um pouco.'
                : 'Frequencia abaixo do ideal. Atencao!'}
          </p>
        </div>

        {/* Payment */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <DollarIcon className="h-4 w-4 text-[var(--bb-ink-40)]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--bb-ink-40)]">
              Pagamento
            </span>
          </div>
          <div className="flex items-center justify-between rounded-[var(--bb-radius-sm)] bg-[var(--bb-depth-4)] p-3">
            <div>
              <p className="text-sm font-bold text-[var(--bb-ink-100)]">
                {child.payment.plan_name}
              </p>
              <p className="text-xs text-[var(--bb-ink-60)]">
                R$ {child.payment.price.toFixed(2).replace('.', ',')}
              </p>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${paymentStyle.bg} ${paymentStyle.color}`}
            >
              {paymentStyle.label}
            </span>
          </div>
        </div>

        {/* Health Score */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <HeartIcon className="h-4 w-4 text-[var(--bb-ink-40)]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--bb-ink-40)]">
              Health Score
            </span>
          </div>
          <div className="flex items-center gap-4">
            <CircularProgress
              percent={child.health_score.score}
              color={healthColor}
            />
            <div>
              <p className="text-sm font-bold text-[var(--bb-ink-100)]">
                {child.health_score.label}
              </p>
              <p className="text-xs text-[var(--bb-ink-60)]">
                {child.health_score.score >= 80
                  ? 'Aluno engajado e com otimo desempenho.'
                  : child.health_score.score >= 60
                    ? 'Bom desempenho, com espaco para melhorar.'
                    : 'Precisa de atencao. Converse com o professor.'}
              </p>
            </div>
          </div>
        </div>

        {/* Journey Milestones */}
        {child.journey_milestones.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-2">
              <AwardIcon className="h-4 w-4 text-[var(--bb-ink-40)]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--bb-ink-40)]">
                Marcos do Mes
              </span>
            </div>
            <div className="space-y-2">
              {child.journey_milestones.map((ms) => (
                <div
                  key={ms.id}
                  className="flex items-center gap-2 rounded-[var(--bb-radius-sm)] bg-[var(--bb-depth-4)] p-2.5"
                >
                  <span className="text-lg">{ms.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[var(--bb-ink-100)]">
                      {ms.title}
                    </p>
                    <p className="text-[10px] text-[var(--bb-ink-40)]">
                      {new Date(ms.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {child.journey_milestones.length === 0 && (
          <div className="rounded-[var(--bb-radius-sm)] bg-[var(--bb-depth-4)] p-3 text-center">
            <p className="text-xs text-[var(--bb-ink-40)]">
              Nenhum marco registrado neste mes.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

// ────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────

export default function RelatoriosMensaisPage() {
  const [data, setData] = useState<GuardianDashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());

  useEffect(() => {
    async function load() {
      try {
        const dashboard = await getGuardianDashboard('prof-guardian-1');
        setData(dashboard);
      } catch {
        // Error handled by service
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const isCurrentMonth = useMemo(() => {
    const n = new Date();
    return selectedMonth === n.getMonth() && selectedYear === n.getFullYear();
  }, [selectedMonth, selectedYear]);

  function handlePrevMonth() {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  }

  function handleNextMonth() {
    if (isCurrentMonth) return;
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  }

  if (loading) return <RelatoriosSkeleton />;

  if (!data || data.children.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bb-depth-1)] p-4">
        <div className="text-center">
          <p className="text-4xl">📊</p>
          <h2 className="mt-4 text-lg font-bold text-[var(--bb-ink-100)]">
            Nenhum relatorio disponivel
          </h2>
          <p className="mt-1 text-sm text-[var(--bb-ink-60)]">
            Nao ha filhos vinculados para exibir relatorios.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bb-depth-1)] pb-24">
      <div className="mx-auto max-w-lg px-4 pt-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bb-brand-surface)]">
            <BarChartIcon className="h-5 w-5 text-[var(--bb-brand)]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[var(--bb-ink-100)]">
              Relatorios Mensais
            </h1>
            <p className="text-sm text-[var(--bb-ink-60)]">
              Acompanhe o progresso dos seus filhos
            </p>
          </div>
        </div>

        {/* Month Selector */}
        <div className="mt-4 flex items-center justify-center gap-4">
          <button
            onClick={handlePrevMonth}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bb-depth-3)] ring-1 ring-[var(--bb-glass-border)] transition-all hover:bg-[var(--bb-depth-4)]"
          >
            <ChevronLeftIcon className="h-4 w-4 text-[var(--bb-ink-60)]" />
          </button>
          <span className="min-w-[160px] text-center text-sm font-bold text-[var(--bb-ink-100)]">
            {getMonthLabel(selectedMonth, selectedYear)}
          </span>
          <button
            onClick={handleNextMonth}
            disabled={isCurrentMonth}
            className={`flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bb-depth-3)] ring-1 ring-[var(--bb-glass-border)] transition-all ${
              isCurrentMonth
                ? 'cursor-not-allowed opacity-30'
                : 'hover:bg-[var(--bb-depth-4)]'
            }`}
          >
            <ChevronRightIcon className="h-4 w-4 text-[var(--bb-ink-60)]" />
          </button>
        </div>

        {/* Consolidated summary */}
        {data.consolidated && data.children.length > 1 && (
          <Card className="mt-4 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--bb-ink-40)]">
                  Total Mensal
                </p>
                <p className="mt-0.5 text-xl font-extrabold text-[var(--bb-ink-100)]">
                  R$ {data.consolidated.total_monthly.toFixed(2).replace('.', ',')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--bb-ink-40)]">
                  Filhos
                </p>
                <p className="mt-0.5 text-xl font-extrabold text-[var(--bb-ink-100)]">
                  {data.consolidated.child_count}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Children Reports */}
        <div className="mt-4 space-y-4">
          {data.children.map((child) => (
            <ChildReportCard key={child.student_id} child={child} />
          ))}
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}
