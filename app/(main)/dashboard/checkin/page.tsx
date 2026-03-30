'use client';

import { useState, useEffect, useCallback } from 'react';
import { getHistory, getStats, doCheckin } from '@/lib/api/checkin.service';
import { getAlunoDashboard } from '@/lib/api/aluno.service';
import type { Attendance, AttendanceMethod } from '@/lib/types';
import type { AttendanceStats } from '@/lib/api/checkin.service';
import type { ProximaAulaDTO } from '@/lib/api/aluno.service';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useStudentId } from '@/lib/hooks/useStudentId';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';

// ── Helpers ───────────────────────────────────────────────────────
function isClassNow(startTime: string, endTime: string): boolean {
  const now = new Date();
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const start = new Date(now);
  start.setHours(sh, sm, 0, 0);
  const end = new Date(now);
  end.setHours(eh, em, 0, 0);
  return now >= start && now <= end;
}

function isClassSoon(startTime: string): boolean {
  const now = new Date();
  const [h, m] = startTime.split(':').map(Number);
  const target = new Date(now);
  target.setHours(h, m, 0, 0);
  const diffMs = target.getTime() - now.getTime();
  return diffMs > 0 && diffMs <= 30 * 60 * 1000; // within 30 min
}

export default function CheckinPage() {
  const { studentId, loading: studentLoading } = useStudentId();
  const { toast } = useToast();
  const [history, setHistory] = useState<Attendance[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [currentClass, setCurrentClass] = useState<ProximaAulaDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [justCheckedIn, setJustCheckedIn] = useState(false);

  const loadData = useCallback(async () => {
    if (!studentId) return;
    try {
      const [h, s, dashboard] = await Promise.all([
        getHistory(studentId),
        getStats(studentId),
        getAlunoDashboard(studentId),
      ]);
      setHistory(h);
      setStats(s);
      setCurrentClass(dashboard.proximaAula);
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [studentId, toast]);

  useEffect(() => {
    if (studentLoading || !studentId) return;
    loadData();
  }, [studentId, studentLoading, loadData]);

  // Check if already checked in today for this class
  const alreadyCheckedIn = currentClass
    ? history.some((a) => {
        const checkedDate = new Date(a.checked_at).toDateString();
        const today = new Date().toDateString();
        return a.class_id === currentClass.class_id && checkedDate === today;
      })
    : false;

  const handleCheckin = async () => {
    if (!studentId || !currentClass) return;
    setCheckinLoading(true);
    try {
      await doCheckin(studentId, currentClass.class_id, 'manual' as AttendanceMethod);
      setJustCheckedIn(true);
      toast('Check-in realizado com sucesso!', 'success');
      // Refresh data
      await loadData();
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setCheckinLoading(false);
    }
  };

  const classActive = currentClass && isClassNow(currentClass.start_time, currentClass.end_time);
  const classSoon = currentClass && !classActive && isClassSoon(currentClass.start_time);
  const canCheckin = classActive && !alreadyCheckedIn && !justCheckedIn;

  const historyByMonth = history.reduce<Record<string, Attendance[]>>((acc, a) => {
    const d = new Date(a.checked_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(a);
    return acc;
  }, {});

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  if (loading || studentLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton variant="text" className="h-8 w-48" />
        <Skeleton variant="card" className="h-40" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="card" className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
        Check-in
      </h1>

      {/* ── Hero: Check-in Button ─────────────────────────────────── */}
      {currentClass ? (
        <Card
          variant="elevated"
          className="relative overflow-hidden p-6 text-center"
          style={{ borderLeft: '4px solid var(--bb-brand-primary)' }}
        >
          {classActive && (
            <div className="absolute right-3 top-3">
              <span className="relative flex h-3 w-3">
                <span
                  className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                  style={{ background: 'var(--bb-brand-primary)' }}
                />
                <span
                  className="relative inline-flex h-3 w-3 rounded-full"
                  style={{ background: 'var(--bb-brand-primary)' }}
                />
              </span>
            </div>
          )}

          <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-40)' }}>
            {classActive ? 'Aula em andamento' : classSoon ? 'Proxima aula' : 'Proxima aula hoje'}
          </p>
          <p className="mt-1 text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
            {currentClass.modality_name}
            {currentClass.level_label ? ` · ${currentClass.level_label}` : ''}
          </p>
          <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>
            {currentClass.start_time} - {currentClass.end_time} · Prof. {currentClass.professor_name}
          </p>

          {alreadyCheckedIn || justCheckedIn ? (
            <div className="mt-4">
              <div
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
                style={{ background: 'rgba(34,197,94,0.1)' }}
              >
                <span className="text-3xl">&#x2705;</span>
              </div>
              <p className="mt-2 text-sm font-semibold" style={{ color: 'var(--bb-success)' }}>
                Check-in realizado!
              </p>
            </div>
          ) : (
            <Button
              variant="primary"
              size="lg"
              className="mt-4 w-full text-lg font-bold"
              style={classActive ? { animation: 'pulse 2s ease-in-out infinite' } : {}}
              disabled={!canCheckin || checkinLoading}
              onClick={handleCheckin}
              aria-label="Fazer check-in"
            >
              {checkinLoading
                ? 'Registrando...'
                : classActive
                  ? 'FAZER CHECK-IN'
                  : 'Aguarde o inicio da aula'}
            </Button>
          )}
        </Card>
      ) : (
        <Card variant="elevated" className="p-6 text-center">
          <p className="text-3xl">&#x1F634;</p>
          <p className="mt-2 font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
            Sem aula agora
          </p>
          <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-40)' }}>
            O check-in estara disponivel quando sua proxima aula comecar.
          </p>
        </Card>
      )}

      {/* ── Stats ───────────────────────────────────────────────────── */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>{stats.total}</p>
            <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>Total</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>{stats.this_month}</p>
            <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>Este mes</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>{stats.this_week}</p>
            <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>Esta semana</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold" style={{ color: 'var(--bb-brand-primary)' }}>{stats.streak}</p>
            <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>Streak</p>
          </Card>
        </div>
      )}

      {/* ── History ──────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h2 className="font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
          Historico de Presencas
        </h2>
        {history.length === 0 ? (
          <EmptyState
            icon="&#x1F4CB;"
            title="Nenhuma presenca registrada"
            description="Seu historico de check-ins aparecera aqui."
            variant="first-time"
          />
        ) : (
          Object.entries(historyByMonth)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([monthKey, attendances]) => {
              const [year, month] = monthKey.split('-');
              return (
                <div key={monthKey}>
                  <h3
                    className="mb-2 text-sm font-semibold"
                    style={{ color: 'var(--bb-ink-60)' }}
                  >
                    {monthNames[parseInt(month, 10) - 1]} {year}
                  </h3>
                  <div className="space-y-1">
                    {attendances.map((a) => {
                      const d = new Date(a.checked_at);
                      return (
                        <div
                          key={a.id}
                          className="flex items-center justify-between rounded-lg px-3 py-2 text-sm"
                          style={{ background: 'var(--bb-depth-2)' }}
                        >
                          <span style={{ color: 'var(--bb-ink-100)' }}>
                            {d.toLocaleDateString('pt-BR', {
                              weekday: 'short',
                              day: '2-digit',
                              month: '2-digit',
                            })}
                          </span>
                          <span style={{ color: 'var(--bb-ink-40)' }}>
                            {d.toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                            {a.method === 'qr_code' ? 'QR' : 'Manual'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
}
