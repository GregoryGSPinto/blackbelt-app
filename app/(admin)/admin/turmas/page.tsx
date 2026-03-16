'use client';

import { useState, useEffect } from 'react';
import { listClasses } from '@/lib/api/turmas.service';
import type { ClassWithDetails } from '@/lib/api/turmas.service';
import { handleServiceError } from '@/lib/api/errors';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import type { ScheduleSlot } from '@/lib/types';

// ── Helpers ──────────────────────────────────────────────────────────

const DAY_LABELS: Record<number, string> = {
  0: 'Dom',
  1: 'Seg',
  2: 'Ter',
  3: 'Qua',
  4: 'Qui',
  5: 'Sex',
  6: 'Sab',
};

function formatSchedule(schedule: ScheduleSlot[]): string {
  if (!schedule || schedule.length === 0) return '—';

  // Group by time range
  const groups = new Map<string, number[]>();
  for (const slot of schedule) {
    const timeKey = `${slot.start_time}-${slot.end_time}`;
    const days = groups.get(timeKey) ?? [];
    days.push(slot.day_of_week);
    groups.set(timeKey, days);
  }

  return [...groups.entries()]
    .map(([time, days]) => {
      const dayStr = days
        .sort((a, b) => a - b)
        .map((d) => DAY_LABELS[d] ?? `D${d}`)
        .join(', ');
      const [start, end] = time.split('-');
      return `${dayStr} ${start}–${end}`;
    })
    .join(' | ');
}

function capacityColor(enrolled: number, max: number): string {
  const pct = max > 0 ? (enrolled / max) * 100 : 0;
  if (pct >= 90) return 'text-bb-error';
  if (pct >= 70) return 'text-yellow-500';
  return 'text-green-500';
}

function capacityBgColor(enrolled: number, max: number): string {
  const pct = max > 0 ? (enrolled / max) * 100 : 0;
  if (pct >= 90) return 'bg-bb-error';
  if (pct >= 70) return 'bg-yellow-400';
  return 'bg-green-400';
}

// ── Main ─────────────────────────────────────────────────────────────

export default function AdminTurmasPage() {
  const [classes, setClasses] = useState<ClassWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterModality, setFilterModality] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await listClasses('academy-1');
        setClasses(data);
      } catch (error) {
        handleServiceError(error, 'admin.turmas');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Extract unique modalities for filter
  const modalities = [...new Set(classes.map((c) => c.modality_name))].sort();

  const filtered = filterModality
    ? classes.filter((c) => c.modality_name === filterModality)
    : classes;

  const totalEnrolled = filtered.reduce((sum, c) => sum + c.enrolled_count, 0);
  const totalCapacity = filtered.reduce((sum, c) => sum + c.max_students, 0);

  return (
    <div className="space-y-6 p-6">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-bb-black">Turmas</h1>
          <p className="mt-1 text-sm text-bb-gray-500">
            {filtered.length} turma{filtered.length !== 1 ? 's' : ''} &middot;{' '}
            {totalEnrolled}/{totalCapacity} alunos matriculados
          </p>
        </div>
        <Button onClick={() => {}}>Nova Turma</Button>
      </div>

      {/* ── Filters ─────────────────────────────────────────────────── */}
      {modalities.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilterModality('')}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filterModality === ''
                ? 'bg-bb-red text-bb-white'
                : 'bg-bb-gray-100 text-bb-gray-700 hover:bg-bb-gray-300'
            }`}
          >
            Todas
          </button>
          {modalities.map((mod) => (
            <button
              key={mod}
              type="button"
              onClick={() => setFilterModality(mod)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filterModality === mod
                  ? 'bg-bb-red text-bb-white'
                  : 'bg-bb-gray-100 text-bb-gray-700 hover:bg-bb-gray-300'
              }`}
            >
              {mod}
            </button>
          ))}
        </div>
      )}

      {/* ── Table ───────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-sm text-bb-gray-500">Nenhuma turma encontrada.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-bb-gray-300 bg-bb-gray-100">
                  <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Modalidade</th>
                  <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Unidade</th>
                  <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Horario</th>
                  <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Professor</th>
                  <th className="px-4 py-3 text-center font-medium text-bb-gray-500">Alunos</th>
                  <th className="px-4 py-3 text-center font-medium text-bb-gray-500">Lotacao</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((cls) => {
                  const pct = cls.max_students > 0
                    ? Math.round((cls.enrolled_count / cls.max_students) * 100)
                    : 0;
                  return (
                    <tr key={cls.id} className="border-b border-bb-gray-100 hover:bg-bb-gray-100/50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-bb-black">{cls.modality_name}</p>
                      </td>
                      <td className="px-4 py-3 text-bb-gray-500">{cls.unit_name}</td>
                      <td className="px-4 py-3 text-bb-gray-700">
                        <span className="text-xs">{formatSchedule(cls.schedule)}</span>
                      </td>
                      <td className="px-4 py-3 text-bb-gray-700">{cls.professor_name}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-semibold ${capacityColor(cls.enrolled_count, cls.max_students)}`}>
                          {cls.enrolled_count}
                        </span>
                        <span className="text-bb-gray-500">/{cls.max_students}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-2 w-16 rounded-full bg-bb-gray-100">
                            <div
                              className={`h-2 rounded-full transition-all ${capacityBgColor(cls.enrolled_count, cls.max_students)}`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-bb-gray-500">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
