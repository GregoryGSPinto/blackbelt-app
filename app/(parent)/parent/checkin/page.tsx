'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { AttendanceMethod } from '@/lib/types';
import {
  getTodayClasses,
  doParentCheckin,
  getCheckinHistory,
} from '@/lib/api/parent-checkin.service';
import type { ParentChildClass, ParentCheckinHistory } from '@/lib/api/parent-checkin.service';
import {
  CheckSquareIcon,
  ClockIcon,
  CalendarIcon,
} from '@/components/shell/icons';

// ────────────────────────────────────────────────────────────
// Skeleton
// ────────────────────────────────────────────────────────────

function CheckinSkeleton() {
  return (
    <div className="p-4 lg:p-6 space-y-4">
      <Skeleton variant="text" className="h-8 w-48" />
      <Skeleton variant="text" className="h-4 w-64" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton variant="card" className="h-40" />
        <Skeleton variant="card" className="h-40" />
      </div>
      <Skeleton variant="card" className="h-64" />
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Formatters
// ────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Agora';
  if (mins < 60) return `${mins}min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  return `${days}d atrás`;
}

// ────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────

export default function ParentCheckinPage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [todayClasses, setTodayClasses] = useState<ParentChildClass[]>([]);
  const [history, setHistory] = useState<ParentCheckinHistory[]>([]);
  const [checkingIn, setCheckingIn] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const guardianId = profile?.id ?? 'prof-guardian-1';

  const loadData = useCallback(async () => {
    try {
      const [classes, hist] = await Promise.all([
        getTodayClasses(guardianId),
        getCheckinHistory(guardianId),
      ]);
      setTodayClasses(classes);
      setHistory(hist);
    } finally {
      setLoading(false);
    }
  }, [guardianId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleCheckin(childId: string, classId: string, childName: string) {
    const key = `${childId}-${classId}`;
    setCheckingIn(key);
    setError(null);
    setSuccess(null);
    try {
      await doParentCheckin(childId, classId, AttendanceMethod.Manual);
      setSuccess(`Check-in de ${childName} realizado!`);
      // Reload data to reflect change
      const classes = await getTodayClasses(guardianId);
      setTodayClasses(classes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao realizar check-in.');
    } finally {
      setCheckingIn(null);
    }
  }

  if (loading) return <CheckinSkeleton />;

  const pendingClasses = todayClasses.filter((c) => !c.checked_in);
  const completedClasses = todayClasses.filter((c) => c.checked_in);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bb-brand-surface)]">
            <CheckSquareIcon className="h-5 w-5 text-[var(--bb-brand)]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[var(--bb-ink-100)]">Check-in</h1>
            <p className="text-sm text-[var(--bb-ink-60)]">Confirme a presença dos seus filhos</p>
          </div>
        </div>
      </div>

      {/* Feedback */}
      {error && (
        <div className="rounded-[var(--bb-radius-sm)] border border-[var(--bb-error)] bg-[rgba(239,68,68,0.08)] p-3">
          <p className="text-sm font-medium text-[var(--bb-error)]">{error}</p>
        </div>
      )}
      {success && (
        <div className="rounded-[var(--bb-radius-sm)] border border-[var(--bb-success)] bg-[var(--bb-success-surface)] p-3">
          <p className="text-sm font-medium text-[var(--bb-success)]">{success}</p>
        </div>
      )}

      {/* Today's Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Check-ins */}
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--bb-ink-40)]">
            <ClockIcon className="h-4 w-4 text-[var(--bb-warning)]" />
            Pendentes ({pendingClasses.length})
          </h2>
          {pendingClasses.length === 0 ? (
            <Card className="p-6 text-center">
              <CheckSquareIcon className="mx-auto h-8 w-8 text-[var(--bb-success)]" />
              <p className="mt-2 text-sm font-medium text-[var(--bb-ink-60)]">
                Todos os check-ins de hoje foram realizados!
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingClasses.map((cls) => {
                const key = `${cls.child_id}-${cls.class_id}`;
                const isLoading = checkingIn === key;
                return (
                  <Card key={key} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-bold text-[var(--bb-ink-100)]">{cls.child_name}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <CalendarIcon className="h-3.5 w-3.5 text-[var(--bb-ink-40)]" />
                          <span className="text-sm text-[var(--bb-ink-60)]">{cls.class_name}</span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-2">
                          <ClockIcon className="h-3.5 w-3.5 text-[var(--bb-ink-40)]" />
                          <span className="text-sm text-[var(--bb-ink-60)]">{cls.time}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCheckin(cls.child_id, cls.class_id, cls.child_name)}
                        disabled={isLoading}
                        className="rounded-[var(--bb-radius-lg)] px-5 py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                        style={{ background: 'var(--bb-brand-gradient)' }}
                      >
                        {isLoading ? 'Enviando...' : 'Check-in'}
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Completed Check-ins */}
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--bb-ink-40)]">
            <CheckSquareIcon className="h-4 w-4 text-[var(--bb-success)]" />
            Realizados hoje ({completedClasses.length})
          </h2>
          {completedClasses.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-sm font-medium text-[var(--bb-ink-40)]">
                Nenhum check-in realizado hoje ainda
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {completedClasses.map((cls) => (
                <Card key={`${cls.child_id}-${cls.class_id}`} className="p-4" style={{ borderLeft: '3px solid var(--bb-success)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-bold text-[var(--bb-ink-100)]">{cls.child_name}</p>
                      <p className="text-sm text-[var(--bb-ink-60)]">{cls.class_name} — {cls.time}</p>
                      {cls.checked_at && (
                        <p className="mt-0.5 text-xs text-[var(--bb-success)]">
                          Confirmado {timeAgo(cls.checked_at)}
                        </p>
                      )}
                    </div>
                    <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ backgroundColor: 'var(--bb-success-surface)', color: 'var(--bb-success)' }}>
                      Presente
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* History */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--bb-ink-40)]">
          <CalendarIcon className="h-4 w-4 text-[var(--bb-brand)]" />
          Histórico Recente
        </h2>
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--bb-depth-4)', borderBottom: '1px solid var(--bb-glass-border)' }}>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--bb-ink-40)]">Filho</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--bb-ink-40)]">Aula</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--bb-ink-40)]">Data</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--bb-ink-40)]">Hora</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-[var(--bb-ink-40)]">
                      Nenhum check-in registrado recentemente
                    </td>
                  </tr>
                ) : (
                  history.slice(0, 20).map((h) => (
                    <tr key={h.id} style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                      <td className="px-4 py-3 font-medium text-[var(--bb-ink-100)]">{h.child_name}</td>
                      <td className="px-4 py-3 text-[var(--bb-ink-60)]">{h.class_name}</td>
                      <td className="px-4 py-3 text-[var(--bb-ink-60)]">{formatDate(h.checked_at)}</td>
                      <td className="px-4 py-3 text-[var(--bb-ink-60)]">{formatTime(h.checked_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
