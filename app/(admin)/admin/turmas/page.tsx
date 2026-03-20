'use client';

import { useState, useEffect, useCallback, type CSSProperties } from 'react';
import {
  listClasses,
  createClass,
  updateClass,
  deleteClass,
} from '@/lib/api/class.service';
import type {
  ClassItem,
  ClassStatus,
  DaySchedule,
  CreateClassDTO,
  UpdateClassDTO,
} from '@/lib/types/class';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { CalendarIcon } from '@/components/shell/icons';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';
import { exportToCSV } from '@/lib/utils/export-csv';
import { Download } from 'lucide-react';

// ── Constants ────────────────────────────────────────────────

const DAY_LABELS: Record<number, string> = {
  0: 'Dom', 1: 'Seg', 2: 'Ter', 3: 'Qua', 4: 'Qui', 5: 'Sex', 6: 'Sab',
};

const DAY_LABELS_SHORT: Record<number, string> = {
  0: 'D', 1: 'S', 2: 'T', 3: 'Q', 4: 'Q', 5: 'S', 6: 'S',
};

const MODALITY_COLORS: Record<string, { bg: string; text: string }> = {
  BJJ: { bg: 'var(--bb-brand-surface)', text: 'var(--bb-brand)' },
  Judo: { bg: 'rgba(234, 179, 8, 0.12)', text: '#ca8a04' },
  'Muay Thai': { bg: 'rgba(239, 68, 68, 0.12)', text: '#dc2626' },
  Karate: { bg: 'rgba(34, 197, 94, 0.12)', text: '#16a34a' },
  MMA: { bg: 'rgba(168, 85, 247, 0.12)', text: '#9333ea' },
};

const STATUS_LABELS: Record<ClassStatus, string> = {
  active: 'Ativa',
  inactive: 'Inativa',
  archived: 'Arquivada',
};

const STATUS_COLORS: Record<ClassStatus, { bg: string; text: string }> = {
  active: { bg: 'rgba(34, 197, 94, 0.12)', text: 'var(--bb-success)' },
  inactive: { bg: 'rgba(156, 163, 175, 0.12)', text: 'var(--bb-ink-40)' },
  archived: { bg: 'rgba(239, 68, 68, 0.12)', text: 'var(--bb-error)' },
};

const BELT_OPTIONS = [
  { value: 'white', label: 'Branca' },
  { value: 'gray', label: 'Cinza' },
  { value: 'yellow', label: 'Amarela' },
  { value: 'orange', label: 'Laranja' },
  { value: 'green', label: 'Verde' },
  { value: 'blue', label: 'Azul' },
  { value: 'purple', label: 'Roxa' },
  { value: 'brown', label: 'Marrom' },
  { value: 'black', label: 'Preta' },
];

const PROFESSORS = [
  { id: 'prof-andre', name: 'Andre Santos' },
  { id: 'prof-fernanda', name: 'Fernanda Oliveira' },
  { id: 'prof-thiago', name: 'Thiago Nakamura' },
];

const MODALITIES = ['BJJ', 'Judo', 'Muay Thai', 'Karate', 'MMA'];

// ── Helpers ──────────────────────────────────────────────────

function formatSchedule(schedule: DaySchedule[]): string {
  if (!schedule || schedule.length === 0) return '--';

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
        .join('/');
      const [start] = time.split('-');
      return `${dayStr} ${start}`;
    })
    .join(' | ');
}

function capacityPercent(enrolled: number, capacity: number): number {
  return capacity > 0 ? Math.round((enrolled / capacity) * 100) : 0;
}

function capacityBarColor(pct: number): string {
  if (pct >= 90) return 'var(--bb-error)';
  if (pct >= 70) return 'var(--bb-warning, #eab308)';
  return 'var(--bb-success)';
}

function getModalityColor(modality: string): { bg: string; text: string } {
  return MODALITY_COLORS[modality] ?? { bg: 'var(--bb-depth-4)', text: 'var(--bb-ink-60)' };
}

// ── Empty form state ─────────────────────────────────────────

interface ClassFormState {
  name: string;
  modality: string;
  professor_id: string;
  capacity: string;
  room: string;
  min_belt: string;
  max_belt: string;
  description: string;
  scheduleDays: boolean[];
  start_time: string;
  end_time: string;
}

const INITIAL_FORM: ClassFormState = {
  name: '',
  modality: 'BJJ',
  professor_id: '',
  capacity: '25',
  room: '',
  min_belt: 'white',
  max_belt: 'black',
  description: '',
  scheduleDays: [false, false, false, false, false, false, false],
  start_time: '19:00',
  end_time: '20:30',
};

// ── Skeleton Loader ──────────────────────────────────────────

function TurmasSkeletonLoader() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Stats skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="card" className="h-24" />
        ))}
      </div>
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton variant="text" className="h-8 w-40" />
        <Skeleton variant="text" className="h-10 w-32" />
      </div>
      {/* Cards skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} variant="card" className="h-52" />
        ))}
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────

export default function AdminTurmasPage() {
  const { toast } = useToast();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterModality, setFilterModality] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ClassFormState>(INITIAL_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadClasses = useCallback(async () => {
    try {
      const data = await listClasses('academy-1');
      setClasses(data);
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  // ── Filter ──────────────────────────────────────────────────

  const modalities = [...new Set(classes.map((c) => c.modality))].sort();

  const filtered = filterModality
    ? classes.filter((c) => c.modality === filterModality)
    : classes;

  // ── Stats ───────────────────────────────────────────────────

  const totalClasses = classes.length;
  const activeClasses = classes.filter((c) => c.status === 'active').length;
  const totalEnrolled = classes.reduce((sum, c) => sum + c.enrolled_count, 0);

  // ── Open edit modal ─────────────────────────────────────────

  function openEdit(cls: ClassItem) {
    const days = [false, false, false, false, false, false, false];
    cls.schedule.forEach((s) => { days[s.day_of_week] = true; });
    setForm({
      name: cls.name,
      modality: cls.modality,
      professor_id: cls.professor_id,
      capacity: String(cls.capacity),
      room: cls.room || '',
      min_belt: cls.min_belt || 'white',
      max_belt: cls.max_belt || 'black',
      description: cls.description || '',
      scheduleDays: days,
      start_time: cls.schedule[0]?.start_time || '19:00',
      end_time: cls.schedule[0]?.end_time || '20:30',
    });
    setEditingId(cls.id);
    setShowFormModal(true);
  }

  // ── Save handler (create or update) ────────────────────────

  async function handleSave() {
    if (!form.name.trim() || !form.professor_id) {
      toast('Preencha nome e professor', 'error');
      return;
    }

    const selectedDays = form.scheduleDays
      .map((checked, idx) => (checked ? idx : -1))
      .filter((d) => d >= 0);

    if (selectedDays.length === 0) {
      toast('Selecione pelo menos um dia', 'error');
      return;
    }

    const schedule: DaySchedule[] = selectedDays.map((day) => ({
      day_of_week: day,
      start_time: form.start_time,
      end_time: form.end_time,
    }));

    setSaving(true);
    try {
      if (editingId) {
        const dto: UpdateClassDTO = {
          name: form.name,
          modality: form.modality,
          professor_id: form.professor_id,
          schedule,
          capacity: parseInt(form.capacity, 10) || 25,
          room: form.room,
          min_belt: form.min_belt,
          max_belt: form.max_belt,
          description: form.description,
        };
        const updated = await updateClass(editingId, dto);
        setClasses((prev) => prev.map((c) => (c.id === editingId ? updated : c)));
        toast('Turma atualizada com sucesso', 'success');
      } else {
        const dto: CreateClassDTO = {
          academy_id: 'academy-1',
          name: form.name,
          modality: form.modality,
          professor_id: form.professor_id,
          schedule,
          capacity: parseInt(form.capacity, 10) || 25,
          room: form.room,
          min_belt: form.min_belt,
          max_belt: form.max_belt,
          description: form.description,
        };
        const newClass = await createClass(dto);
        setClasses((prev) => [...prev, newClass]);
        toast('Turma criada com sucesso', 'success');
      }
      setShowFormModal(false);
      setEditingId(null);
      setForm(INITIAL_FORM);
    } catch {
      toast(editingId ? 'Erro ao atualizar turma' : 'Erro ao criar turma', 'error');
    } finally {
      setSaving(false);
    }
  }

  // ── Delete handler ──────────────────────────────────────────

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteClass(deleteId);
      setClasses((prev) => prev.filter((c) => c.id !== deleteId));
      setDeleteId(null);
      toast('Turma excluida com sucesso', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setDeleting(false);
    }
  }

  // ── Form updater ────────────────────────────────────────────

  function updateForm<K extends keyof ClassFormState>(key: K, value: ClassFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleDay(dayIndex: number) {
    setForm((prev) => {
      const newDays = [...prev.scheduleDays];
      newDays[dayIndex] = !newDays[dayIndex];
      return { ...prev, scheduleDays: newDays };
    });
  }

  // ── Loading ─────────────────────────────────────────────────

  if (loading) return <TurmasSkeletonLoader />;

  // ── Render ──────────────────────────────────────────────────

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* ── Stats ──────────────────────────────────────────── */}
      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-3 animate-reveal"
        data-stagger=""
      >
        <Card className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl"
            style={{ background: 'var(--bb-brand-surface)' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--bb-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </div>
          <div>
            <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>Total de Turmas</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>{totalClasses}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl"
            style={{ background: 'rgba(34, 197, 94, 0.12)' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--bb-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div>
            <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>Turmas Ativas</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>{activeClasses}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl"
            style={{ background: 'rgba(59, 130, 246, 0.12)' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
          <div>
            <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>Total Matriculados</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>{totalEnrolled}</p>
          </div>
        </Card>
      </div>

      {/* ── Header + Filter ────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-reveal">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>Turmas</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-40)' }}>
            {filtered.length} turma{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() =>
              exportToCSV(
                filtered.map((c) => ({
                  Nome: c.name,
                  Modalidade: c.modality,
                  Professor: c.professor_name,
                  Horario: formatSchedule(c.schedule),
                  Matriculados: c.enrolled_count,
                  Capacidade: c.capacity,
                  Sala: c.room || '',
                  Status: STATUS_LABELS[c.status],
                })),
                'turmas',
              )
            }
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
            style={{
              background: 'var(--bb-depth-3)',
              color: 'var(--bb-ink-80)',
              border: '1px solid var(--bb-glass-border)',
            }}
          >
            <Download className="h-3.5 w-3.5" />
            Exportar
          </button>
          <Button onClick={() => { setEditingId(null); setForm(INITIAL_FORM); setShowFormModal(true); }}>Nova Turma</Button>
        </div>
      </div>

      {/* ── Modality filters ───────────────────────────────── */}
      {modalities.length > 1 && (
        <div className="flex flex-wrap gap-2 animate-reveal">
          <button
            type="button"
            onClick={() => setFilterModality('')}
            className="rounded-full px-3 py-1.5 min-h-[44px] text-xs font-medium transition-colors"
            style={{
              background: filterModality === '' ? 'var(--bb-brand)' : 'var(--bb-depth-4)',
              color: filterModality === '' ? '#fff' : 'var(--bb-ink-60)',
            }}
          >
            Todas
          </button>
          {modalities.map((mod) => {
            const colors = getModalityColor(mod);
            return (
              <button
                key={mod}
                type="button"
                onClick={() => setFilterModality(mod)}
                className="rounded-full px-3 py-1.5 min-h-[44px] text-xs font-medium transition-colors"
                style={{
                  background: filterModality === mod ? colors.text : colors.bg,
                  color: filterModality === mod ? '#fff' : colors.text,
                }}
              >
                {mod}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Class cards ────────────────────────────────────── */}
      {filtered.length === 0 ? (
        classes.length === 0 ? (
          <EmptyState
            icon={CalendarIcon}
            title="Nenhuma turma cadastrada"
            description="Crie sua primeira turma para organizar suas aulas."
            actionLabel="Criar turma"
            onAction={() => { setEditingId(null); setForm(INITIAL_FORM); setShowFormModal(true); }}
          />
        ) : (
          <Card className="py-12 text-center">
            <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>Nenhuma turma encontrada com esses filtros.</p>
          </Card>
        )
      ) : (
        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          data-stagger=""
        >
          {filtered.map((cls) => {
            const pct = capacityPercent(cls.enrolled_count, cls.capacity);
            const modalityColor = getModalityColor(cls.modality);
            const statusColor = STATUS_COLORS[cls.status];

            return (
              <Card
                key={cls.id}
                interactive
                className="animate-reveal flex flex-col gap-4"
                style={{ '--stagger-delay': '0.05s' } as CSSProperties}
              >
                {/* Header row: name + status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3
                      className="truncate text-base font-semibold"
                      style={{ color: 'var(--bb-ink-100)' }}
                    >
                      {cls.name}
                    </h3>
                    <p
                      className="mt-0.5 text-sm"
                      style={{ color: 'var(--bb-ink-40)' }}
                    >
                      {cls.professor_name}
                    </p>
                  </div>
                  <span
                    className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{
                      background: statusColor.bg,
                      color: statusColor.text,
                    }}
                  >
                    {STATUS_LABELS[cls.status]}
                  </span>
                </div>

                {/* Modality badge */}
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    style={{
                      background: modalityColor.bg,
                      color: modalityColor.text,
                    }}
                  >
                    {cls.modality}
                  </span>
                  {cls.room && (
                    <span
                      className="text-xs"
                      style={{ color: 'var(--bb-ink-40)' }}
                    >
                      {cls.room}
                    </span>
                  )}
                </div>

                {/* Schedule visual: day dots */}
                <div className="flex flex-col gap-2">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                      const isActive = cls.schedule.some((s) => s.day_of_week === day);
                      return (
                        <div
                          key={day}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium"
                          style={{
                            background: isActive ? 'var(--bb-brand)' : 'var(--bb-depth-4)',
                            color: isActive ? '#fff' : 'var(--bb-ink-30)',
                          }}
                          title={DAY_LABELS[day]}
                        >
                          {DAY_LABELS_SHORT[day]}
                        </div>
                      );
                    })}
                  </div>
                  <p
                    className="text-xs"
                    style={{ color: 'var(--bb-ink-60)' }}
                  >
                    {formatSchedule(cls.schedule)}
                  </p>
                </div>

                {/* Capacity progress */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: 'var(--bb-ink-40)' }}>Matriculados</span>
                    <span style={{ color: 'var(--bb-ink-80)' }}>
                      <span className="font-semibold">{cls.enrolled_count}</span>
                      /{cls.capacity}
                    </span>
                  </div>
                  <div
                    className="h-2 w-full overflow-hidden rounded-full"
                    style={{ background: 'var(--bb-depth-4)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(pct, 100)}%`,
                        background: capacityBarColor(pct),
                      }}
                    />
                  </div>
                  <p className="text-right text-xs" style={{ color: 'var(--bb-ink-30)' }}>
                    {pct}% ocupado
                  </p>
                </div>

                {/* Actions */}
                <div
                  className="flex items-center justify-end gap-2 border-t pt-3"
                  style={{ borderColor: 'var(--bb-glass-border)' }}
                >
                  <button
                    type="button"
                    className="text-xs font-medium transition-colors hover:underline min-h-[44px] min-w-[44px] px-2"
                    style={{ color: 'var(--bb-brand)' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(cls);
                    }}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="text-xs font-medium transition-colors hover:underline min-h-[44px] min-w-[44px] px-2"
                    style={{ color: 'var(--bb-error)' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteId(cls.id);
                    }}
                  >
                    Excluir
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Create/Edit Class Modal ────────────────────────── */}
      <Modal
        open={showFormModal}
        onClose={() => { setShowFormModal(false); setEditingId(null); setForm(INITIAL_FORM); }}
        title={editingId ? 'Editar Turma' : 'Nova Turma'}
      >
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
              Nome da Turma
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateForm('name', e.target.value)}
              placeholder="Ex: BJJ Fundamentos"
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2"
              style={{
                borderColor: 'var(--bb-glass-border)',
                background: 'var(--bb-depth-2)',
                color: 'var(--bb-ink-100)',
              }}
            />
          </div>

          {/* Modality + Professor row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                Modalidade
              </label>
              <select
                value={form.modality}
                onChange={(e) => updateForm('modality', e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
                style={{
                  borderColor: 'var(--bb-glass-border)',
                  background: 'var(--bb-depth-2)',
                  color: 'var(--bb-ink-100)',
                }}
              >
                {MODALITIES.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                Professor
              </label>
              <select
                value={form.professor_id}
                onChange={(e) => updateForm('professor_id', e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
                style={{
                  borderColor: 'var(--bb-glass-border)',
                  background: 'var(--bb-depth-2)',
                  color: 'var(--bb-ink-100)',
                }}
              >
                <option value="">Selecione...</option>
                {PROFESSORS.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Schedule: Day picker */}
          <div>
            <label className="block text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
              Dias da Semana
            </label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-xs font-medium transition-all"
                  style={{
                    background: form.scheduleDays[day] ? 'var(--bb-brand)' : 'var(--bb-depth-4)',
                    color: form.scheduleDays[day] ? '#fff' : 'var(--bb-ink-40)',
                  }}
                >
                  {DAY_LABELS[day]}
                </button>
              ))}
            </div>
          </div>

          {/* Time range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                Inicio
              </label>
              <input
                type="time"
                value={form.start_time}
                onChange={(e) => updateForm('start_time', e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
                style={{
                  borderColor: 'var(--bb-glass-border)',
                  background: 'var(--bb-depth-2)',
                  color: 'var(--bb-ink-100)',
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                Termino
              </label>
              <input
                type="time"
                value={form.end_time}
                onChange={(e) => updateForm('end_time', e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
                style={{
                  borderColor: 'var(--bb-glass-border)',
                  background: 'var(--bb-depth-2)',
                  color: 'var(--bb-ink-100)',
                }}
              />
            </div>
          </div>

          {/* Capacity + Room */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                Capacidade
              </label>
              <input
                type="number"
                value={form.capacity}
                onChange={(e) => updateForm('capacity', e.target.value)}
                min="1"
                max="100"
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
                style={{
                  borderColor: 'var(--bb-glass-border)',
                  background: 'var(--bb-depth-2)',
                  color: 'var(--bb-ink-100)',
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                Sala
              </label>
              <input
                type="text"
                value={form.room}
                onChange={(e) => updateForm('room', e.target.value)}
                placeholder="Tatame A"
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
                style={{
                  borderColor: 'var(--bb-glass-border)',
                  background: 'var(--bb-depth-2)',
                  color: 'var(--bb-ink-100)',
                }}
              />
            </div>
          </div>

          {/* Belt range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                Faixa Minima
              </label>
              <select
                value={form.min_belt}
                onChange={(e) => updateForm('min_belt', e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
                style={{
                  borderColor: 'var(--bb-glass-border)',
                  background: 'var(--bb-depth-2)',
                  color: 'var(--bb-ink-100)',
                }}
              >
                {BELT_OPTIONS.map((b) => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                Faixa Maxima
              </label>
              <select
                value={form.max_belt}
                onChange={(e) => updateForm('max_belt', e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
                style={{
                  borderColor: 'var(--bb-glass-border)',
                  background: 'var(--bb-depth-2)',
                  color: 'var(--bb-ink-100)',
                }}
              >
                {BELT_OPTIONS.map((b) => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
              Descricao
            </label>
            <textarea
              value={form.description}
              onChange={(e) => updateForm('description', e.target.value)}
              rows={3}
              placeholder="Descricao da turma..."
              className="mt-1 w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none"
              style={{
                borderColor: 'var(--bb-glass-border)',
                background: 'var(--bb-depth-2)',
                color: 'var(--bb-ink-100)',
              }}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => { setShowFormModal(false); setEditingId(null); setForm(INITIAL_FORM); }}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1"
              onClick={handleSave}
              loading={saving}
              disabled={!form.name.trim() || !form.professor_id}
            >
              {editingId ? 'Salvar' : 'Criar Turma'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Delete Confirm Modal ───────────────────────────── */}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Excluir Turma"
        variant="confirm"
      >
        <div className="space-y-4">
          <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Tem certeza que deseja excluir esta turma? Esta acao nao pode ser desfeita.
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => setDeleteId(null)}>
              Cancelar
            </Button>
            <Button variant="danger" className="flex-1" loading={deleting} onClick={handleDelete}>
              Excluir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
