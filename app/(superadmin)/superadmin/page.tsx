'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import type { PlatformStats, AcademyFull } from '@/lib/types';
import { getPlatformStats, listAcademies } from '@/lib/api/superadmin.service';

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e', label: 'Ativa' },
  trial: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6', label: 'Trial' },
  suspended: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444', label: 'Suspensa' },
  pending: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b', label: 'Pendente' },
  cancelled: { bg: 'rgba(156,163,175,0.15)', text: 'var(--bb-ink-60)', label: 'Cancelada' },
};

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function SuperAdminDashboardPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [academies, setAcademies] = useState<AcademyFull[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, a] = await Promise.all([getPlatformStats(), listAcademies()]);
        setStats(s);
        setAcademies(a);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton variant="text" className="h-8 w-64" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} variant="card" className="h-24" />)}
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} variant="card" className="h-20" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
          Dashboard da Plataforma
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          Visao geral de todas as academias BlackBelt
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Academias', value: stats.total_academies, icon: '🏟️', color: '#f59e0b' },
            { label: 'Alunos', value: stats.total_students, icon: '👥', color: '#3b82f6' },
            { label: 'MRR', value: formatCurrency(stats.total_revenue_monthly), icon: '💰', color: '#22c55e' },
            { label: 'Novos este mes', value: `+${stats.new_academies_this_month}`, icon: '📈', color: '#a855f7' },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl p-4"
              style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)' }}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{s.icon}</span>
                <span className="text-2xl font-bold" style={{ color: s.color }}>
                  {s.value}
                </span>
              </div>
              <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Quick breakdown */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Ativas', value: stats.active_academies, color: '#22c55e' },
            { label: 'Trial', value: stats.trial_academies, color: '#3b82f6' },
            { label: 'Suspensas', value: stats.suspended_academies, color: '#ef4444' },
            { label: 'Professores', value: stats.total_professors, color: '#f59e0b' },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-lg p-3 text-center"
              style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)' }}
            >
              <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Academies list */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>Academias</h2>
          <Link
            href="/superadmin/academias"
            className="text-sm font-medium"
            style={{ color: '#f59e0b' }}
          >
            Ver todas →
          </Link>
        </div>

        <div className="space-y-3">
          {academies.map((academy) => {
            const st = STATUS_STYLES[academy.status] ?? STATUS_STYLES.active;
            return (
              <Link key={academy.id} href={`/superadmin/academias/${academy.id}`}>
                <Card interactive className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                          {academy.name}
                        </h3>
                        <span
                          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
                          style={{ background: st.bg, color: st.text }}
                        >
                          {st.label}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                        <span>{academy.plan?.name ?? '-'}</span>
                        <span>{academy.city}/{academy.state}</span>
                        <span>{academy.total_students ?? 0}/{academy.max_students} alunos</span>
                        <span>{academy.total_professors ?? 0}/{academy.max_professors} profs</span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold" style={{ color: '#22c55e' }}>
                        {formatCurrency(academy.monthly_revenue ?? 0)}
                      </p>
                      <p className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>/mes</p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
