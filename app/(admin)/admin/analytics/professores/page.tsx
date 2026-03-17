'use client';

import { useState, useEffect } from 'react';
import { getProfessorPerformance } from '@/lib/api/analytics.service';
import type { ProfessorMetricsDTO } from '@/lib/api/analytics.service';
import {
  UsersIcon,
  AwardIcon,
  BarChartIcon,
  StarIcon,
} from '@/components/shell/icons';

type SortKey = 'retention_rate' | 'avg_attendance' | 'avg_evaluation' | 'total_students';

export default function ProfessorAnalyticsPage() {
  const [professors, setProfessors] = useState<ProfessorMetricsDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortKey>('retention_rate');

  useEffect(() => {
    getProfessorPerformance('academy-1')
      .then(setProfessors)
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...professors].sort((a, b) => {
    switch (sortBy) {
      case 'retention_rate': return b.retention_rate - a.retention_rate;
      case 'avg_attendance': return b.avg_attendance - a.avg_attendance;
      case 'avg_evaluation': return b.avg_evaluation - a.avg_evaluation;
      case 'total_students': return b.total_students - a.total_students;
      default: return 0;
    }
  });

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: 'retention_rate', label: 'Retenção' },
    { key: 'avg_attendance', label: 'Presença' },
    { key: 'avg_evaluation', label: 'Avaliação' },
    { key: 'total_students', label: 'Alunos' },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
          Analytics por Professor
        </h1>
        <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          Ranking e comparativo de desempenho entre professores.
        </p>
      </div>

      {/* Sort */}
      <div className="flex flex-wrap gap-2">
        {sortOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSortBy(opt.key)}
            className="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
            style={{
              background: sortBy === opt.key ? 'var(--bb-brand)' : 'var(--bb-depth-3)',
              color: sortBy === opt.key ? 'white' : 'var(--bb-ink-60)',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl" style={{ background: 'var(--bb-depth-3)' }} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((prof, idx) => (
            <div
              key={prof.professor_id}
              className="rounded-xl border p-4 transition-colors"
              style={{
                background: 'var(--bb-depth-2)',
                borderColor: 'var(--bb-glass-border)',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold"
                    style={{
                      background: idx === 0 ? 'var(--bb-brand)' : 'var(--bb-depth-4)',
                      color: idx === 0 ? 'white' : 'var(--bb-ink-60)',
                    }}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                      {prof.professor_name}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                      {prof.total_classes} turmas
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <MetricCard
                  icon={AwardIcon}
                  label="Retenção"
                  value={`${prof.retention_rate}%`}
                  color={prof.retention_rate >= 90 ? '#22C55E' : prof.retention_rate >= 80 ? '#F59E0B' : '#EF4444'}
                />
                <MetricCard
                  icon={BarChartIcon}
                  label="Presença Média"
                  value={`${prof.avg_attendance}%`}
                  color="#3B82F6"
                />
                <MetricCard
                  icon={StarIcon}
                  label="Avaliação"
                  value={`${prof.avg_evaluation}%`}
                  color="#8B5CF6"
                />
                <MetricCard
                  icon={UsersIcon}
                  label="Alunos"
                  value={String(prof.total_students)}
                  color="var(--bb-brand)"
                />
              </div>

              {/* Comparison bars */}
              <div className="mt-4 space-y-2">
                <BarRow label="Retenção" value={prof.retention_rate} max={100} color="#22C55E" />
                <BarRow label="Presença" value={prof.avg_attendance} max={100} color="#3B82F6" />
                <BarRow label="Avaliação" value={prof.avg_evaluation} max={100} color="#8B5CF6" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof UsersIcon;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        style={{ background: `${color}20` }}
      >
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
      <div>
        <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{label}</p>
        <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>{value}</p>
      </div>
    </div>
  );
}

function BarRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-xs" style={{ color: 'var(--bb-ink-40)' }}>{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: 'var(--bb-depth-4)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="w-10 text-right text-xs font-medium" style={{ color: 'var(--bb-ink-80)' }}>
        {value}%
      </span>
    </div>
  );
}
