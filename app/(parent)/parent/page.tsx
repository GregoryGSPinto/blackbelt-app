'use client';

import { useState, useEffect } from 'react';
import { getGuardianDashboard } from '@/lib/api/responsavel.service';
import type {
  GuardianDashboardDTO,
  GuardianChildDTO,
  WeekdayAttendance,
} from '@/lib/api/responsavel.service';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

const ATTENDANCE_ICON: Record<WeekdayAttendance, string> = {
  present: '✅',
  absent: '—',
  pending: '⏳',
  none: '·',
};

const WEEKDAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'] as const;

const STATUS_STYLES: Record<string, { text: string; label: string }> = {
  em_dia: { text: 'text-bb-success', label: 'Em dia ✅' },
  pendente: { text: 'text-bb-warning', label: 'Pendente' },
  atrasado: { text: 'text-bb-error', label: 'Atrasado' },
};

function getAttendanceArray(child: GuardianChildDTO): WeekdayAttendance[] {
  const w = child.week_attendance;
  return [w.mon, w.tue, w.wed, w.thu, w.fri];
}

// ────────────────────────────────────────────────────────────
// Child Card Sub-component
// ────────────────────────────────────────────────────────────

function ChildSection({ child }: { child: GuardianChildDTO }) {
  const attendance = getAttendanceArray(child);
  const payStatus = STATUS_STYLES[child.payment.status] ?? STATUS_STYLES.em_dia;

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <Avatar name={child.display_name} size="lg" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[var(--bb-ink-100)]">{child.display_name}</h2>
              <span className="text-sm text-[var(--bb-ink-40)]">{child.age} anos</span>
            </div>
            <div className="mt-0.5 flex items-center gap-2">
              <Badge variant="belt" size="sm">{child.belt_label}</Badge>
              <span className="text-xs text-[var(--bb-ink-40)]">
                Frequência: {child.frequency_percent}%
              </span>
            </div>
          </div>
          {/* Health Score */}
          <div className="flex flex-col items-center">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-extrabold text-white"
              style={{ backgroundColor: child.health_score.color }}
            >
              {child.health_score.score}
            </div>
            <p className="mt-0.5 text-[10px] text-[var(--bb-ink-40)]">{child.health_score.label}</p>
          </div>
        </div>
      </Card>

      {/* Weekly Attendance */}
      <Card className="p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--bb-ink-40)]">
          Presença da Semana
        </p>
        <div className="flex justify-between">
          {WEEKDAY_LABELS.map((day, i) => (
            <div key={day} className="flex flex-col items-center gap-1">
              <span className="text-xs font-medium text-[var(--bb-ink-40)]">{day}</span>
              <span className="text-lg">{ATTENDANCE_ICON[attendance[i]]}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Evolution: last 3 milestones */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--bb-ink-40)]">
            Evolução
          </p>
          <button className="text-xs font-semibold text-bb-red-500 transition-colors hover:text-bb-red-500/80">
            Ver completo →
          </button>
        </div>
        <div className="mt-3 space-y-2">
          {child.journey_milestones.map((ms) => (
            <div key={ms.id} className="flex items-center gap-3">
              <span className="text-lg">{ms.emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-[var(--bb-ink-100)]">{ms.title}</p>
                <p className="text-[10px] text-[var(--bb-ink-40)]">
                  {new Date(ms.date).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Messages */}
      <Card className="p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--bb-ink-40)]">
          Mensagens do Professor
        </p>
        <div className="space-y-2">
          {child.messages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-lg p-3 ${
                msg.unread ? 'bg-bb-red-500/5 ring-1 ring-bb-red-500/20' : 'bg-[var(--bb-depth-3)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[var(--bb-ink-100)]">{msg.teacher_name}</p>
                <span className="text-[10px] text-[var(--bb-ink-40)]">{msg.time}</span>
              </div>
              <p className="mt-1 text-sm text-[var(--bb-ink-60)] line-clamp-2">{msg.preview}</p>
              {msg.unread && (
                <button className="mt-2 text-xs font-semibold text-bb-red-500">
                  Responder
                </button>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Payment */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--bb-ink-40)]">
              Pagamento
            </p>
            <p className="mt-1 text-sm text-[var(--bb-ink-100)]">
              {child.payment.plan_name}{' '}
              <span className="font-bold">R${child.payment.price}</span>
            </p>
          </div>
          <span className={`text-sm font-bold ${payStatus.text}`}>{payStatus.label}</span>
        </div>
        <div className="mt-3 flex gap-2">
          <button className="flex-1 rounded-lg bg-[var(--bb-depth-3)] py-2 text-xs font-semibold text-[var(--bb-ink-60)] transition-colors hover:bg-[var(--bb-depth-1)]">
            Faturas
          </button>
          <button className="flex-1 rounded-lg bg-[var(--bb-depth-3)] py-2 text-xs font-semibold text-[var(--bb-ink-60)] transition-colors hover:bg-[var(--bb-depth-1)]">
            Trocar plano
          </button>
        </div>
      </Card>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────

export default function ParentDashboardPage() {
  const [data, setData] = useState<GuardianDashboardDTO | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const d = await getGuardianDashboard('prof-guardian-1');
        setData(d);
        if (d.children.length > 0) setSelectedChildId(d.children[0].student_id);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bb-depth-1)] p-4">
        <div className="mx-auto max-w-lg space-y-4">
          <Skeleton variant="card" className="h-16" />
          <Skeleton variant="card" className="h-32" />
          <Skeleton variant="card" className="h-24" />
          <Skeleton variant="card" className="h-40" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const selectedChild = data.children.find((c) => c.student_id === selectedChildId) ?? data.children[0];
  const hasMultipleChildren = data.children.length > 1;

  return (
    <div className="min-h-screen bg-[var(--bb-depth-1)] pb-24">
      <div className="mx-auto max-w-lg px-4 pt-6">
        {/* Header */}
        <h1 className="text-xl font-bold text-[var(--bb-ink-100)]">
          Olá, {data.guardian_name.split(' ')[0]}!
        </h1>
        <p className="text-sm text-[var(--bb-ink-40)]">Acompanhe seus filhos</p>

        {/* Child tabs (if 2+ children) */}
        {hasMultipleChildren && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {data.children.map((child) => (
              <button
                key={child.student_id}
                onClick={() => setSelectedChildId(child.student_id)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  selectedChildId === child.student_id
                    ? 'bg-bb-red-500 text-white shadow-md shadow-bb-red-500/20'
                    : 'bg-[var(--bb-depth-3)] text-[var(--bb-ink-60)] ring-1 ring-[var(--bb-glass-border)]'
                }`}
              >
                <Avatar name={child.display_name} size="sm" />
                {child.display_name} ({child.age})
              </button>
            ))}
          </div>
        )}

        {/* Per-child section */}
        <div className="mt-4">
          {selectedChild && <ChildSection child={selectedChild} />}
        </div>

        {/* Consolidated (2+ children) */}
        {hasMultipleChildren && data.consolidated && (
          <section className="mt-6">
            <Card className="bg-gradient-to-r from-[var(--bb-depth-1)] to-[var(--bb-depth-3)] p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--bb-ink-40)]">
                Consolidado Familiar
              </p>
              <p className="mt-2 text-2xl font-extrabold text-white">
                R${data.consolidated.total_monthly}/mês
              </p>
              <p className="mt-0.5 text-xs text-[var(--bb-ink-40)]">
                {data.consolidated.child_count} filhos matriculados
              </p>

              {/* Mini calendar preview */}
              <div className="mt-4 rounded-lg bg-[var(--bb-depth-3)]/10 p-3">
                <p className="mb-2 text-xs font-semibold text-[var(--bb-ink-80)]">
                  Agenda da Semana
                </p>
                <div className="space-y-1">
                  {data.children.map((child) => {
                    const days = getAttendanceArray(child);
                    return (
                      <div key={child.student_id} className="flex items-center gap-2">
                        <span className="w-16 text-xs font-medium text-[var(--bb-ink-80)]">
                          {child.display_name}
                        </span>
                        <div className="flex gap-1">
                          {WEEKDAY_LABELS.map((day, i) => (
                            <span
                              key={day}
                              className={`flex h-6 w-6 items-center justify-center rounded text-[10px] ${
                                days[i] === 'present'
                                  ? 'bg-bb-success/20 text-bb-success'
                                  : days[i] === 'pending'
                                    ? 'bg-bb-warning/20 text-bb-warning'
                                    : days[i] === 'absent'
                                      ? 'bg-bb-error/20 text-bb-error'
                                      : 'bg-[var(--bb-depth-3)]/5 text-[var(--bb-ink-40)]'
                              }`}
                            >
                              {day.charAt(0)}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <a
                href="/agenda"
                className="mt-3 block text-center text-xs font-semibold text-bb-red-500 transition-colors hover:text-bb-red-500/80"
              >
                Ver agenda completa →
              </a>
            </Card>
          </section>
        )}
      </div>
    </div>
  );
}
