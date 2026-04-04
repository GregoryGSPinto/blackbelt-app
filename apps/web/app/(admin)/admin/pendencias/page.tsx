'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';
import { getDataHealthReport } from '@/lib/api/data-health.service';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import type { DataHealthReport, DataHealthIssue } from '@/lib/api/data-health.service';

const SEVERITY_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  high: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444', label: 'Alta' },
  medium: { bg: 'rgba(234,179,8,0.15)', text: '#eab308', label: 'Media' },
  low: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6', label: 'Baixa' },
};

export default function PendenciasPage() {
  const { toast } = useToast();
  const [report, setReport] = useState<DataHealthReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDataHealthReport(getActiveAcademyId())
      .then(setReport)
      .catch((err) => toast(translateError(err), 'error'))
      .finally(() => setLoading(false));
  }, [toast]);

  if (loading) {
    return (
      <div className="space-y-4 p-4 sm:p-6">
        <Skeleton variant="text" className="h-8 w-48" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="card" className="h-32" />
        ))}
      </div>
    );
  }

  if (!report || report.totalIssues === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-4 text-center">
        <span className="text-4xl">🎉</span>
        <h2 className="mt-3 text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
          Tudo em ordem!
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          Nenhuma pendencia encontrada na academia.
        </p>
      </div>
    );
  }

  const progressPercent = report.totalIssues > 0
    ? Math.round((report.resolvedIssues / (report.totalIssues + report.resolvedIssues)) * 100)
    : 100;

  return (
    <div className="min-h-screen space-y-6 p-4 sm:p-6" data-stagger>
      {/* Header */}
      <section className="animate-reveal">
        <h1 className="text-2xl font-extrabold" style={{ color: 'var(--bb-ink-100)' }}>
          Corrigir Pendencias
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          {report.totalIssues} pendencias encontradas
        </p>
      </section>

      {/* Progress */}
      <div className="animate-reveal rounded-xl p-4" style={{ background: 'var(--bb-depth-1)', border: '1px solid var(--bb-glass-border)' }}>
        <div className="flex items-center justify-between text-sm">
          <span style={{ color: 'var(--bb-ink-80)' }}>Progresso geral</span>
          <span className="font-bold" style={{ color: 'var(--bb-brand)' }}>{progressPercent}%</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full" style={{ background: 'var(--bb-depth-3)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${progressPercent}%`, background: 'var(--bb-brand)' }} />
        </div>
        <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
          {report.resolvedIssues} resolvidas de {report.totalIssues + report.resolvedIssues} total
        </p>
      </div>

      {/* Categories */}
      {report.categories.map((cat) => (
        <div key={cat.name} className="animate-reveal rounded-xl p-4" style={{ background: 'var(--bb-depth-1)', border: '1px solid var(--bb-glass-border)' }}>
          <div className="mb-3 flex items-center gap-2">
            <span className="text-lg">{cat.icon}</span>
            <h2 className="text-base font-bold" style={{ color: 'var(--bb-ink-100)' }}>{cat.name}</h2>
            <span className="ml-auto rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-60)' }}>
              {cat.issues.length}
            </span>
          </div>

          <div className="space-y-2">
            {cat.issues.map((issue: DataHealthIssue) => {
              const sev = SEVERITY_STYLE[issue.severity] ?? SEVERITY_STYLE.low;
              return (
                <div key={issue.id} className="flex items-center gap-3 rounded-lg p-3" style={{ background: 'var(--bb-depth-2)' }}>
                  <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold" style={{ background: sev.bg, color: sev.text }}>
                    {sev.label}
                  </span>
                  <p className="flex-1 text-sm" style={{ color: 'var(--bb-ink-80)' }}>
                    {issue.description}
                  </p>
                  <Link
                    href={issue.actionRoute}
                    className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium"
                    style={{ background: 'var(--bb-brand)', color: '#fff' }}
                  >
                    {issue.actionLabel}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
