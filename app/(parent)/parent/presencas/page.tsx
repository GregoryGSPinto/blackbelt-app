'use client';

import { useState, useEffect } from 'react';
import { getGuardianDashboard } from '@/lib/api/responsavel.service';
import type { GuardianDashboardDTO, GuardianChildDTO, WeekdayAttendance } from '@/lib/api/responsavel.service';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

const WEEKDAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'] as const;

const STATUS_ICON: Record<WeekdayAttendance, { icon: string; bg: string; text: string }> = {
  present: { icon: '\u2705', bg: 'bg-green-50', text: 'text-green-700' },
  absent: { icon: '\u274C', bg: 'bg-red-50', text: 'text-red-700' },
  pending: { icon: '\u23F3', bg: 'bg-yellow-50', text: 'text-yellow-700' },
  none: { icon: '\u00B7', bg: 'bg-bb-gray-50', text: 'text-bb-gray-400' },
};

interface AttendanceEntry {
  day: string;
  date: string;
  status: WeekdayAttendance;
}

function getWeekEntries(child: GuardianChildDTO): AttendanceEntry[] {
  const w = child.week_attendance;
  const statuses: WeekdayAttendance[] = [w.mon, w.tue, w.wed, w.thu, w.fri];
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  return WEEKDAY_LABELS.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      day: label,
      date: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      status: statuses[i],
    };
  });
}

// ────────────────────────────────────────────────────────────
// Child Attendance Card
// ────────────────────────────────────────────────────────────

function ChildAttendanceCard({ child }: { child: GuardianChildDTO }) {
  const entries = getWeekEntries(child);
  const presentCount = entries.filter((e) => e.status === 'present').length;
  const totalDays = entries.filter((e) => e.status !== 'none').length;

  return (
    <Card className="overflow-hidden">
      {/* Child Header */}
      <div className="flex items-center gap-3 border-b border-bb-gray-100 p-4">
        <Avatar name={child.display_name} size="md" />
        <div className="flex-1">
          <h3 className="text-sm font-bold text-bb-gray-900">{child.display_name}</h3>
          <div className="mt-0.5 flex items-center gap-2">
            <Badge variant="belt" size="sm">{child.belt_label}</Badge>
            <span className="text-xs text-bb-gray-500">{child.age} anos</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-bb-gray-900">{child.frequency_percent}%</p>
          <p className="text-[10px] text-bb-gray-500">Frequencia</p>
        </div>
      </div>

      {/* Weekly Attendance Table */}
      <div className="p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-bb-gray-500">
          Presencas da Semana
        </p>
        <div className="space-y-2">
          {entries.map((entry) => {
            const s = STATUS_ICON[entry.status];
            return (
              <div
                key={entry.day}
                className={`flex items-center justify-between rounded-lg px-3 py-2 ${s.bg}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 text-sm font-semibold text-bb-gray-700">{entry.day}</span>
                  <span className="text-xs text-bb-gray-500">{entry.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${s.text}`}>
                    {entry.status === 'present' && 'Presente'}
                    {entry.status === 'absent' && 'Faltou'}
                    {entry.status === 'pending' && 'Pendente'}
                    {entry.status === 'none' && '--'}
                  </span>
                  <span className="text-sm">{s.icon}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-4 flex items-center justify-between rounded-lg bg-bb-gray-100 px-3 py-2">
          <span className="text-xs font-medium text-bb-gray-500">Resumo da semana</span>
          <span className="text-sm font-bold text-bb-gray-900">
            {presentCount}/{totalDays} aulas
          </span>
        </div>
      </div>

      {/* Milestones */}
      {child.journey_milestones.length > 0 && (
        <div className="border-t border-bb-gray-100 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-bb-gray-500">
            Marcos Recentes
          </p>
          <div className="space-y-2">
            {child.journey_milestones.slice(0, 3).map((ms) => (
              <div key={ms.id} className="flex items-center gap-2">
                <span className="text-sm">{ms.emoji}</span>
                <span className="flex-1 text-xs text-bb-gray-700">{ms.title}</span>
                <span className="text-[10px] text-bb-gray-500">
                  {new Date(ms.date).toLocaleDateString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

// ────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────

export default function ParentPresencasPage() {
  const [data, setData] = useState<GuardianDashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChildId, setSelectedChildId] = useState<string>('');

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
      <div className="p-4 lg:p-6">
        <div className="space-y-4">
          <Skeleton variant="text" className="h-8 w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Skeleton variant="card" className="h-24" />
            <Skeleton variant="card" className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.children.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <p className="text-4xl">📋</p>
          <h2 className="mt-4 text-lg font-bold text-bb-gray-900">Nenhum filho encontrado</h2>
          <p className="mt-1 text-sm text-bb-gray-500">
            Nao ha filhos vinculados para exibir presencas.
          </p>
        </div>
      </div>
    );
  }

  const hasMultipleChildren = data.children.length > 1;
  const selectedChild = data.children.find((c) => c.student_id === selectedChildId) ?? data.children[0];

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <h1 className="text-xl font-bold text-bb-gray-900">Presencas</h1>
      <p className="text-sm text-bb-gray-500">Acompanhe a frequencia dos seus filhos</p>

      {/* Child Selector */}
      {hasMultipleChildren && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {data.children.map((child) => (
            <button
              key={child.student_id}
              onClick={() => setSelectedChildId(child.student_id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                selectedChildId === child.student_id
                  ? 'bg-bb-red-500 text-white shadow-md shadow-bb-red-500/20'
                  : 'bg-white text-bb-gray-700 ring-1 ring-bb-gray-200'
              }`}
            >
              <Avatar name={child.display_name} size="sm" />
              {child.display_name}
            </button>
          ))}
        </div>
      )}

      {/* Desktop: side-by-side layout */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Card for Selected Child */}
        <div>
          {selectedChild && <ChildAttendanceCard child={selectedChild} />}
        </div>

        {/* Consolidated Overview (multiple children) */}
        {hasMultipleChildren && (
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-bb-gray-500">
              Visao Geral
            </h2>
            <Card className="p-4">
              <div className="space-y-3">
                {data.children.map((child) => {
                  const w = child.week_attendance;
                  const statuses: WeekdayAttendance[] = [w.mon, w.tue, w.wed, w.thu, w.fri];
                  return (
                    <div key={child.student_id} className="flex items-center gap-3">
                      <Avatar name={child.display_name} size="sm" />
                      <span className="w-20 truncate text-sm font-medium text-bb-gray-700">
                        {child.display_name}
                      </span>
                      <div className="flex flex-1 justify-end gap-1">
                        {WEEKDAY_LABELS.map((day, i) => (
                          <div
                            key={day}
                            className={`flex h-7 w-7 items-center justify-center rounded text-xs ${
                              statuses[i] === 'present'
                                ? 'bg-green-100 text-green-700'
                                : statuses[i] === 'absent'
                                  ? 'bg-red-100 text-red-700'
                                  : statuses[i] === 'pending'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-bb-gray-50 text-bb-gray-400'
                            }`}
                          >
                            {day.charAt(0)}
                          </div>
                        ))}
                      </div>
                      <span className="w-12 text-right text-sm font-bold text-bb-gray-900">
                        {child.frequency_percent}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
