'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getJornadaDependente } from '@/lib/api/responsavel-jornada.service';
import type { JornadaDependente, JornadaMilestone } from '@/lib/api/responsavel-jornada.service';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { ChevronLeftIcon } from '@/components/shell/icons';

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

const BELT_COLORS: Record<string, string> = {
  white: '#e5e7eb',
  gray: '#9ca3af',
  yellow: '#fbbf24',
  orange: '#f97316',
  green: '#22c55e',
  blue: '#3b82f6',
  purple: '#a855f7',
  brown: '#92400e',
  black: '#1f2937',
};

const TYPE_COLORS: Record<JornadaMilestone['type'], { bg: string; border: string }> = {
  belt: { bg: 'bg-amber-50', border: 'border-amber-400' },
  achievement: { bg: 'bg-blue-50', border: 'border-blue-400' },
  streak: { bg: 'bg-orange-50', border: 'border-orange-400' },
  competition: { bg: 'bg-purple-50', border: 'border-purple-400' },
  special: { bg: 'bg-emerald-50', border: 'border-emerald-400' },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function daysSince(dateStr: string): number {
  const start = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

// ────────────────────────────────────────────────────────────
// Skeleton
// ────────────────────────────────────────────────────────────

function JornadaSkeleton() {
  return (
    <div className="p-4 lg:p-6">
      <div className="space-y-4">
        <Skeleton variant="text" className="h-8 w-32" />
        <Skeleton variant="card" className="h-36" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton variant="card" className="h-24" />
          <Skeleton variant="card" className="h-24" />
          <Skeleton variant="card" className="h-24" />
          <Skeleton variant="card" className="h-24" />
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Timeline Item
// ────────────────────────────────────────────────────────────

function TimelineItem({
  milestone,
  isLast,
}: {
  milestone: JornadaMilestone;
  isLast: boolean;
}) {
  const colors = TYPE_COLORS[milestone.type];

  return (
    <div className="flex gap-4">
      {/* Timeline Line + Dot */}
      <div className="flex flex-col items-center">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-lg ${colors.bg} ${colors.border}`}
        >
          {milestone.emoji}
        </div>
        {!isLast && (
          <div className="w-0.5 flex-1 bg-[var(--bb-glass-border)]" />
        )}
      </div>

      {/* Content */}
      <div className={`pb-6 ${isLast ? '' : ''}`}>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--bb-ink-40)]">
          {formatDate(milestone.date)}
        </p>
        <h3 className="mt-0.5 text-sm font-bold text-[var(--bb-ink-100)]">
          {milestone.title}
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-[var(--bb-ink-60)]">
          {milestone.description}
        </p>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────

export default function JornadaDependentePage() {
  const params = useParams();
  const studentId = params.id as string;

  const [data, setData] = useState<JornadaDependente | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const jornada = await getJornadaDependente(studentId);
        setData(jornada);
      } catch {
        // Error handled by service
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [studentId]);

  if (loading) return <JornadaSkeleton />;

  if (!data || data.milestones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <p className="text-4xl">🗺️</p>
          <h2 className="mt-4 text-lg font-bold text-[var(--bb-ink-100)]">
            Nenhum marco encontrado
          </h2>
          <p className="mt-1 text-sm text-[var(--bb-ink-60)]">
            A jornada deste dependente sera exibida aqui conforme ele avanca.
          </p>
        </div>
      </div>
    );
  }

  const sortedMilestones = [...data.milestones].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const beltColor = BELT_COLORS[data.belt] ?? BELT_COLORS.white;
  const totalDays = daysSince(data.started_at);

  return (
    <div className="p-4 lg:p-6">
      <div className="max-w-3xl">
        {/* Header */}
        <button
          onClick={() => window.history.back()}
          className="mb-4 flex items-center gap-1 text-sm font-semibold text-[var(--bb-brand)] transition-colors hover:opacity-80"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Voltar
        </button>

        <h1 className="text-xl font-extrabold text-[var(--bb-ink-100)]">
          Jornada de {data.display_name}
        </h1>
        <p className="mt-1 text-sm text-[var(--bb-ink-60)]">
          Acompanhe toda a evolucao no Jiu-Jitsu
        </p>

        {/* Student Info Card */}
        <Card className="mt-4 p-4">
          <div className="flex items-center gap-4">
            {/* Belt indicator */}
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4"
              style={{ borderColor: beltColor }}
            >
              <span className="text-xl font-extrabold text-[var(--bb-ink-100)]">
                {data.display_name.charAt(0)}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold text-[var(--bb-ink-100)]">
                {data.display_name}
              </h2>
              <div className="mt-1 flex items-center gap-2">
                <div
                  className="h-3 w-12 rounded-sm shadow-sm"
                  style={{ backgroundColor: beltColor }}
                />
                <span className="text-xs font-medium text-[var(--bb-ink-60)]">
                  {data.belt_label}
                </span>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-[var(--bb-radius-sm)] bg-[var(--bb-depth-4)] p-2.5 text-center">
              <p className="text-lg font-extrabold text-[var(--bb-ink-100)]">
                {data.total_classes}
              </p>
              <p className="text-[10px] font-semibold uppercase text-[var(--bb-ink-40)]">
                Aulas
              </p>
            </div>
            <div className="rounded-[var(--bb-radius-sm)] bg-[var(--bb-depth-4)] p-2.5 text-center">
              <p className="text-lg font-extrabold text-[var(--bb-ink-100)]">
                {totalDays}
              </p>
              <p className="text-[10px] font-semibold uppercase text-[var(--bb-ink-40)]">
                Dias
              </p>
            </div>
            <div className="rounded-[var(--bb-radius-sm)] bg-[var(--bb-depth-4)] p-2.5 text-center">
              <p className="text-lg font-extrabold text-[var(--bb-ink-100)]">
                {data.milestones.length}
              </p>
              <p className="text-[10px] font-semibold uppercase text-[var(--bb-ink-40)]">
                Marcos
              </p>
            </div>
          </div>

          {/* Start date */}
          <p className="mt-3 text-center text-[10px] text-[var(--bb-ink-40)]">
            Inicio: {formatDate(data.started_at)}
          </p>
        </Card>

        {/* Timeline */}
        <div className="mt-6">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-[var(--bb-ink-40)]">
            Linha do Tempo
          </h2>
          <div>
            {sortedMilestones.map((milestone, idx) => (
              <TimelineItem
                key={milestone.id}
                milestone={milestone}
                isLast={idx === sortedMilestones.length - 1}
              />
            ))}
          </div>
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}
