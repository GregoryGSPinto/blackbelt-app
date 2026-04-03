'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { isMock } from '@/lib/env';
import { listAttendanceRecord, checkIn, markAbsent, getAttendanceSummary, getAttendanceAnalytics } from '@/lib/api/attendance.service';
import type { AttendanceRecord, AttendanceSummary, AttendanceAnalytics } from '@/lib/types/attendance';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import { CheckSquareIcon } from '@/components/shell/icons';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { translateError } from '@/lib/utils/error-translator';

// Dynamic Recharts imports (SSR safe)
const BarChart = dynamic(() => import('recharts').then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then((m) => m.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then((m) => m.ResponsiveContainer), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then((m) => m.CartesianGrid), { ssr: false });

const MOCK_CLASSES = [
  { id: 'class-1', name: 'BJJ Fundamentos', time: '07:00' },
  { id: 'class-2', name: 'BJJ All Levels', time: '10:00' },
  { id: 'class-3', name: 'Judô Adulto', time: '18:00' },
  { id: 'class-4', name: 'BJJ Avançado', time: '19:00' },
  { id: 'class-5', name: 'BJJ Noturno', time: '21:00' },
];

interface ClassOption {
  id: string;
  name: string;
  time: string;
}

type StatusValue = 'present' | 'absent' | 'justified';
type Tab = 'chamada' | 'relatorio';

const STATUS_COLORS: Record<StatusValue, { bg: string; text: string }> = {
  present: { bg: 'rgba(34,197,94,0.15)', text: '#22C55E' },
  absent: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444' },
  justified: { bg: 'rgba(234,179,8,0.15)', text: '#EAB308' },
};

const STATUS_LABEL: Record<StatusValue, string> = {
  present: 'Presente',
  absent: 'Ausente',
  justified: 'Justificado',
};

export default function AdminPresencaPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>('chamada');
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendances, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Analytics state
  const [analytics, setAnalytics] = useState<AttendanceAnalytics | null>(null);
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'30d' | '60d' | '90d'>('30d');
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const academyId = getActiveAcademyId();

  const loadClasses = useCallback(async () => {
    if (isMock()) {
      setClasses(MOCK_CLASSES);
      setSelectedClass(MOCK_CLASSES[0].id);
      return;
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      const { data } = await supabase
        .from('classes')
        .select('id, name, schedule')
        .eq('academy_id', academyId);

      const result: ClassOption[] = [];
      for (const cls of data ?? []) {
        const schedules = (cls.schedule ?? []) as Array<{ day_of_week: number; start_time: string }>;
        const firstTime = schedules.length > 0 ? schedules[0].start_time : '00:00';
        result.push({ id: cls.id, name: cls.name, time: firstTime });
      }
      result.sort((a, b) => a.time.localeCompare(b.time));
      setClasses(result);
      if (result.length > 0) setSelectedClass(result[0].id);
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }, [academyId, toast]);

  useEffect(() => {
    loadClasses();
    getAttendanceSummary(academyId).then(setSummary).catch(() => {});
  }, [loadClasses, academyId]);

  useEffect(() => {
    if (!selectedClass || tab !== 'chamada') return;
    setLoading(true);
    listAttendanceRecord(selectedClass, selectedDate)
      .then(setAttendanceRecords)
      .catch((err) => toast(translateError(err), 'error'))
      .finally(() => setLoading(false));
  }, [selectedClass, selectedDate, toast, tab]);

  // Load analytics when tab switches or period changes
  useEffect(() => {
    if (tab !== 'relatorio') return;
    setAnalyticsLoading(true);
    getAttendanceAnalytics(academyId, analyticsPeriod)
      .then(setAnalytics)
      .catch((err) => toast(translateError(err), 'error'))
      .finally(() => setAnalyticsLoading(false));
  }, [tab, analyticsPeriod, academyId, toast]);

  function toggleStatus(studentId: string, current: StatusValue) {
    const cycle: StatusValue[] = ['present', 'absent', 'justified'];
    const next = cycle[(cycle.indexOf(current) + 1) % cycle.length];

    setAttendanceRecords((prev) =>
      prev.map((a) =>
        a.student_id === studentId ? { ...a, status: next } : a,
      ),
    );
  }

  async function handleSave() {
    try {
      for (const a of attendances) {
        if (a.status === 'present') {
          await checkIn(a.student_id, selectedClass, 'manual');
        } else if (a.status === 'absent') {
          await markAbsent(a.student_id, selectedClass, selectedDate);
        }
      }
      toast('Presenca salva com sucesso!', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  async function handleExportPDF() {
    if (!analytics) return;
    setExporting(true);
    try {
      const { generateAttendancePDF } = await import('@/lib/reports/attendance-pdf');
      const rows = analytics.topStudents.concat(analytics.bottomStudents).map((s) => ({
        studentName: s.studentName,
        className: '',
        attendancePercent: s.attendanceRate,
        absences: 0,
      }));
      const blob = await generateAttendancePDF({
        academyName: 'BlackBelt',
        period: analyticsPeriod === '30d' ? 'Ultimos 30 dias' : analyticsPeriod === '60d' ? 'Ultimos 60 dias' : 'Ultimos 90 dias',
        rows,
      });
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `presenca-${analyticsPeriod}-${new Date().toISOString().slice(0, 10)}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast('PDF exportado com sucesso!', 'success');
      }
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setExporting(false);
    }
  }

  const present = attendances.filter((a) => a.status === 'present').length;
  const absent = attendances.filter((a) => a.status === 'absent').length;

  return (
    <div className="min-h-screen space-y-6 p-4 sm:p-6" data-stagger>
      {/* Header */}
      <section className="animate-reveal">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: 'var(--bb-brand-surface)' }}
          >
            <CheckSquareIcon className="h-5 w-5 text-[var(--bb-brand)]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold" style={{ color: 'var(--bb-ink-100)' }}>Presenca</h1>
            <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>Gerenciar presenca e relatorios</p>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="animate-reveal flex gap-1 rounded-lg p-1" style={{ background: 'var(--bb-depth-2)' }}>
        {(['chamada', 'relatorio'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className="flex-1 rounded-md px-4 py-2 text-sm font-semibold transition-all"
            style={{
              background: tab === t ? 'var(--bb-brand)' : 'transparent',
              color: tab === t ? '#fff' : 'var(--bb-ink-60)',
            }}
          >
            {t === 'chamada' ? 'Chamada' : 'Relatorio'}
          </button>
        ))}
      </section>

      {/* ═══ TAB: CHAMADA ═══ */}
      {tab === 'chamada' && (
        <>
          {/* Summary cards */}
          {summary && (
            <section className="animate-reveal grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold" style={{ color: 'var(--bb-brand)' }}>{summary.total_present}</p>
                <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Presencas (30d)</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold" style={{ color: '#22C55E' }}>{summary.attendance_rate}%</p>
                <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Taxa de Presenca</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>{classes.length}</p>
                <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Turmas</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold" style={{ color: '#EAB308' }}>{summary.total_absent}</p>
                <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Ausencias (30d)</p>
              </Card>
            </section>
          )}

          {/* Selectors */}
          <section className="animate-reveal flex flex-col gap-3 sm:flex-row">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="rounded-lg px-3 py-2 text-sm"
              style={{
                background: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
                color: 'var(--bb-ink-100)',
              }}
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.time} — {c.name}</option>
              ))}
            </select>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-lg px-3 py-2 text-sm"
              style={{
                background: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
                color: 'var(--bb-ink-100)',
              }}
            />
          </section>

          {/* Stats mini */}
          <section className="animate-reveal flex gap-4">
            <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: 'rgba(34,197,94,0.1)' }}>
              <CheckSquareIcon className="h-4 w-4" style={{ color: '#22C55E' }} />
              <span className="text-sm font-semibold" style={{ color: '#22C55E' }}>{present} presentes</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: 'rgba(239,68,68,0.1)' }}>
              <span className="text-sm font-semibold" style={{ color: '#EF4444' }}>{absent} ausentes</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: 'var(--bb-depth-3)' }}>
              <span className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>{attendances.length} alunos</span>
            </div>
          </section>

          {/* Student list */}
          <section className="animate-reveal space-y-2">
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} variant="card" className="h-14" />)}
              </div>
            ) : attendances.length === 0 ? (
              <EmptyState
                icon="📝"
                title="Nenhum aluno nesta turma"
                description="Nao ha registros de presenca para a turma e data selecionadas."
                variant="search"
              />
            ) : (
              attendances.map((a) => {
                const sc = STATUS_COLORS[a.status];
                return (
                  <div
                    key={a.student_id}
                    className="flex items-center gap-3 rounded-lg p-3 transition-all"
                    style={{
                      background: 'var(--bb-depth-2)',
                      border: '1px solid var(--bb-glass-border)',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleStatus(a.student_id, a.status)}
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-all"
                      style={{ background: sc.bg }}
                      aria-label={`Alterar status de ${a.student_name}`}
                    >
                      {a.status === 'present' ? '\u2705' : a.status === 'absent' ? '\u274C' : '\u26A0\uFE0F'}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--bb-ink-100)' }}>
                        {a.student_name}
                      </p>
                    </div>
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-semibold"
                      style={{ background: sc.bg, color: sc.text }}
                    >
                      {STATUS_LABEL[a.status]}
                    </span>
                  </div>
                );
              })
            )}
          </section>

          {/* Save button */}
          {attendances.length > 0 && (
            <section className="animate-reveal">
              <button
                type="button"
                onClick={handleSave}
                className="w-full rounded-lg py-3 text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: 'var(--bb-brand)', color: '#fff' }}
              >
                Salvar Presenca
              </button>
            </section>
          )}
        </>
      )}

      {/* ═══ TAB: RELATÓRIO ═══ */}
      {tab === 'relatorio' && (
        <>
          {/* Period selector + PDF export */}
          <section className="animate-reveal flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-1 rounded-lg p-1" style={{ background: 'var(--bb-depth-2)' }}>
              {(['30d', '60d', '90d'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAnalyticsPeriod(p)}
                  className="rounded-md px-3 py-1.5 text-xs font-semibold transition-all"
                  style={{
                    background: analyticsPeriod === p ? 'var(--bb-brand)' : 'transparent',
                    color: analyticsPeriod === p ? '#fff' : 'var(--bb-ink-60)',
                  }}
                >
                  {p === '30d' ? '30 dias' : p === '60d' ? '60 dias' : '90 dias'}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={handleExportPDF}
              disabled={exporting || !analytics}
              className="flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--bb-brand)', color: '#fff' }}
            >
              {exporting ? 'Exportando...' : 'Exportar PDF'}
            </button>
          </section>

          {analyticsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} variant="card" className="h-64" />)}
            </div>
          ) : analytics ? (
            <>
              {/* ── Presença por turma ── */}
              <section className="animate-reveal">
                <Card className="p-4">
                  <h3 className="mb-4 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                    Presenca por Turma
                  </h3>
                  <div style={{ width: '100%', height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.byClass} layout="vertical" margin={{ left: 10, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--bb-glass-border)" />
                        <XAxis type="number" tick={{ fill: 'var(--bb-ink-60)', fontSize: 11 }} />
                        <YAxis
                          type="category"
                          dataKey="className"
                          width={130}
                          tick={{ fill: 'var(--bb-ink-80)', fontSize: 11 }}
                        />
                        <Tooltip
                          contentStyle={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', borderRadius: 8, color: 'var(--bb-ink-100)' }}
                          formatter={(value) => [`${value} check-ins`, 'Total']}
                        />
                        <Bar dataKey="totalCheckins" fill="var(--bb-brand)" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Attendance rate badges */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {analytics.byClass.map((c) => (
                      <span
                        key={c.classId}
                        className="rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{
                          background: c.attendanceRate >= 80 ? 'rgba(34,197,94,0.15)' : c.attendanceRate >= 60 ? 'rgba(234,179,8,0.15)' : 'rgba(239,68,68,0.15)',
                          color: c.attendanceRate >= 80 ? '#22C55E' : c.attendanceRate >= 60 ? '#EAB308' : '#EF4444',
                        }}
                      >
                        {c.className}: {c.attendanceRate}%
                      </span>
                    ))}
                  </div>
                </Card>
              </section>

              {/* ── Presença por dia da semana + Horário de pico ── */}
              <section className="animate-reveal grid gap-4 md:grid-cols-2">
                {/* By day of week */}
                <Card className="p-4">
                  <h3 className="mb-4 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                    Presenca por Dia da Semana
                  </h3>
                  <div style={{ width: '100%', height: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.byDayOfWeek.filter((d) => d.avgCheckins > 0)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--bb-glass-border)" />
                        <XAxis dataKey="day" tick={{ fill: 'var(--bb-ink-60)', fontSize: 10 }} />
                        <YAxis tick={{ fill: 'var(--bb-ink-60)', fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', borderRadius: 8, color: 'var(--bb-ink-100)' }}
                          formatter={(value) => [`${value} media`, 'Check-ins']}
                        />
                        <Bar dataKey="avgCheckins" fill="#6366F1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Peak hours */}
                <Card className="p-4">
                  <h3 className="mb-4 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                    Horario de Pico
                  </h3>
                  <div style={{ width: '100%', height: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.peakHours}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--bb-glass-border)" />
                        <XAxis dataKey="hour" tick={{ fill: 'var(--bb-ink-60)', fontSize: 10 }} />
                        <YAxis tick={{ fill: 'var(--bb-ink-60)', fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', borderRadius: 8, color: 'var(--bb-ink-100)' }}
                          formatter={(value) => [`${value}`, 'Check-ins']}
                        />
                        <Bar dataKey="checkins" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </section>

              {/* ── Ranking de alunos ── */}
              <section className="animate-reveal grid gap-4 md:grid-cols-2">
                {/* Top 10 */}
                <Card className="p-4">
                  <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                    Top 10 — Mais Frequentes
                  </h3>
                  <div className="space-y-2">
                    {analytics.topStudents.map((s, i) => (
                      <div
                        key={s.studentId}
                        className="flex items-center gap-3 rounded-lg p-2"
                        style={{ background: 'var(--bb-depth-3)' }}
                      >
                        <span
                          className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                          style={{
                            background: i < 3 ? 'var(--bb-brand)' : 'var(--bb-depth-2)',
                            color: i < 3 ? '#fff' : 'var(--bb-ink-60)',
                          }}
                        >
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: 'var(--bb-ink-100)' }}>
                            {s.studentName}
                          </p>
                        </div>
                        <span className="text-sm font-bold" style={{ color: '#22C55E' }}>
                          {s.checkins}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Bottom 10 */}
                <Card className="p-4">
                  <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                    Bottom 10 — Menos Frequentes
                  </h3>
                  {analytics.bottomStudents.length === 0 ? (
                    <p className="text-sm py-8 text-center" style={{ color: 'var(--bb-ink-40)' }}>
                      Poucos alunos para exibir ranking
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {analytics.bottomStudents.map((s, i) => (
                        <div
                          key={s.studentId}
                          className="flex items-center gap-3 rounded-lg p-2"
                          style={{ background: 'var(--bb-depth-3)' }}
                        >
                          <span
                            className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                            style={{
                              background: i < 3 ? 'rgba(239,68,68,0.15)' : 'var(--bb-depth-2)',
                              color: i < 3 ? '#EF4444' : 'var(--bb-ink-60)',
                            }}
                          >
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: 'var(--bb-ink-100)' }}>
                              {s.studentName}
                            </p>
                          </div>
                          <span className="text-sm font-bold" style={{ color: '#EF4444' }}>
                            {s.checkins}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </section>
            </>
          ) : null}
        </>
      )}
    </div>
  );
}
