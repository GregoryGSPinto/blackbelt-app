'use client';

import { useState, useEffect } from 'react';
import { getHistory, getStats } from '@/lib/api/checkin.service';
import type { Attendance } from '@/lib/types';
import type { AttendanceStats } from '@/lib/api/checkin.service';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useStudentId } from '@/lib/hooks/useStudentId';
import { translateError } from '@/lib/utils/error-translator';
import { useToast } from '@/lib/hooks/useToast';

export default function TeenCheckinPage() {
  const { studentId, loading: studentLoading } = useStudentId();
  const { toast } = useToast();
  const [history, setHistory] = useState<Attendance[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentLoading || !studentId) return;
    async function load() {
      try {
        const [h, s] = await Promise.all([getHistory(studentId!), getStats(studentId!)]);
        setHistory(h);
        setStats(s);
      } catch (err) {
        toast(translateError(err), 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [studentId, studentLoading]); // eslint-disable-line react-hooks/exhaustive-deps

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

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton variant="text" className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} variant="card" className="h-20" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
        Minhas Presencas
      </h1>

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
            <p className="text-2xl font-bold" style={{ color: 'var(--bb-brand)' }}>{stats.streak}</p>
            <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>Streak</p>
          </Card>
        </div>
      )}

      {history.length === 0 && (
        <EmptyState
          icon="\u2705"
          title="Nenhum check-in registrado"
          description="Seus check-ins aparecerrao aqui conforme voce frequentar as aulas."
          variant="default"
        />
      )}

      {Object.entries(historyByMonth)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([key, items]) => {
          const [year, month] = key.split('-');
          return (
            <div key={key}>
              <h2 className="mb-2 text-sm font-semibold" style={{ color: 'var(--bb-ink-60)' }}>
                {monthNames[parseInt(month, 10) - 1]} {year}
              </h2>
              <div className="space-y-2">
                {items.map((a) => {
                  const dt = new Date(a.checked_at);
                  const dateStr = dt.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
                  const timeStr = dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                  return (
                    <Card key={a.id} className="flex items-center justify-between p-3">
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                          Aula
                        </p>
                        <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>{dateStr}</p>
                      </div>
                      <span className="text-sm font-medium" style={{ color: 'var(--bb-brand)' }}>
                        {timeStr}
                      </span>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
    </div>
  );
}
