'use client';

import { useState, useEffect } from 'react';
import { getHistory, getStats } from '@/lib/api/checkin.service';
import type { Attendance } from '@/lib/types';
import type { AttendanceStats } from '@/lib/api/checkin.service';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useStudentId } from '@/lib/hooks/useStudentId';

export default function CheckinHistoryPage() {
  const { studentId, loading: studentLoading } = useStudentId();
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
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [studentId, studentLoading]);

  const historyByMonth = history.reduce<Record<string, Attendance[]>>((acc, a) => {
    const d = new Date(a.checked_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(a);
    return acc;
  }, {});

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

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
      <h1 className="text-xl font-bold text-bb-black">Minhas Presenças</h1>
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card className="p-3 text-center"><p className="text-2xl font-bold text-bb-black">{stats.total}</p><p className="text-xs text-bb-gray-500">Total</p></Card>
          <Card className="p-3 text-center"><p className="text-2xl font-bold text-bb-black">{stats.this_month}</p><p className="text-xs text-bb-gray-500">Este mês</p></Card>
          <Card className="p-3 text-center"><p className="text-2xl font-bold text-bb-black">{stats.this_week}</p><p className="text-xs text-bb-gray-500">Esta semana</p></Card>
          <Card className="p-3 text-center"><p className="text-2xl font-bold text-bb-red">{stats.streak}</p><p className="text-xs text-bb-gray-500">Streak</p></Card>
        </div>
      )}
      <div className="space-y-4">
        {Object.entries(historyByMonth).sort(([a], [b]) => b.localeCompare(a)).map(([monthKey, attendances]) => {
          const [year, month] = monthKey.split('-');
          return (
            <div key={monthKey}>
              <h2 className="mb-2 text-sm font-semibold text-bb-gray-700">{monthNames[parseInt(month, 10) - 1]} {year}</h2>
              <div className="space-y-1">
                {attendances.map((a) => {
                  const d = new Date(a.checked_at);
                  return (
                    <div key={a.id} className="flex items-center justify-between rounded-lg bg-bb-gray-100 px-3 py-2 text-sm">
                      <span className="text-bb-black">{d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })}</span>
                      <span className="text-bb-gray-500">{d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-xs text-bb-gray-500">{a.method === 'qr_code' ? 'QR' : 'Manual'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
