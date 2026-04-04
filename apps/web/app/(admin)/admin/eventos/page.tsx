'use client';

import { useState, useEffect } from 'react';
import {
  listAcademyEvents,
  createAcademyEvent,
  updateAcademyEvent,
  deleteAcademyEvent,
} from '@/lib/api/events.service';
import type { AcademyEvent, CreateEventData, EventType, EventStatus } from '@/lib/types/event';
import { BeltLevel } from '@/lib/types/domain';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { useToast } from '@/lib/hooks/useToast';
import {
  PlusIcon,
  CalendarCheckIcon,
  MapPinIcon,
  UsersIcon,
  EditIcon,
  TrashIcon,
  XIcon,
  DollarIcon,
} from '@/components/shell/icons';
import { translateError } from '@/lib/utils/error-translator';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';

// ── Constants ──────────────────────────────────────────────────────────

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  competition: 'Competicao',
  seminar: 'Seminario',
  graduation: 'Graduacao',
  open_mat: 'Open Mat',
  workshop: 'Workshop',
};

const EVENT_TYPE_COLORS: Record<EventType, { bg: string; text: string }> = {
  competition: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444' },
  seminar: { bg: 'rgba(59,130,246,0.15)', text: '#3B82F6' },
  graduation: { bg: 'rgba(168,85,247,0.15)', text: '#A855F7' },
  open_mat: { bg: 'rgba(34,197,94,0.15)', text: '#22C55E' },
  workshop: { bg: 'rgba(234,179,8,0.15)', text: '#EAB308' },
};

const STATUS_LABELS: Record<EventStatus, string> = {
  draft: 'Rascunho',
  published: 'Publicado',
  cancelled: 'Cancelado',
  completed: 'Concluido',
};

const STATUS_COLORS: Record<EventStatus, { bg: string; text: string }> = {
  draft: { bg: 'rgba(107,114,128,0.15)', text: '#6B7280' },
  published: { bg: 'rgba(34,197,94,0.15)', text: '#22C55E' },
  cancelled: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444' },
  completed: { bg: 'rgba(59,130,246,0.15)', text: '#3B82F6' },
};

const BELT_LABELS: Record<BeltLevel, string> = {
  [BeltLevel.White]: 'Branca',
  [BeltLevel.Gray]: 'Cinza',
  [BeltLevel.Yellow]: 'Amarela',
  [BeltLevel.Orange]: 'Laranja',
  [BeltLevel.Green]: 'Verde',
  [BeltLevel.Blue]: 'Azul',
  [BeltLevel.Purple]: 'Roxa',
  [BeltLevel.Brown]: 'Marrom',
  [BeltLevel.Black]: 'Preta',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatBRL(value: number): string {
  if (value === 0) return 'Gratis';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ── Page ───────────────────────────────────────────────────────────────

export default function AdminEventosPage() {
  const { toast } = useToast();
  const [events, setEvents] = useState<AcademyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AcademyEvent | null>(null);
  const [filterType, setFilterType] = useState<string>('');

  // ── Form state ─────────────────────────────────────────────────────

  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formType, setFormType] = useState<EventType>('competition');
  const [formMaxParticipants, setFormMaxParticipants] = useState(30);
  const [formModalities, setFormModalities] = useState('Jiu-Jitsu');
  const [formMinBelt, setFormMinBelt] = useState<BeltLevel>(BeltLevel.White);
  const [formFee, setFormFee] = useState(0);
  const [formStatus, setFormStatus] = useState<EventStatus>('draft');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await listAcademyEvents(getActiveAcademyId());
        setEvents(data);
      } catch (err) {
        toast(translateError(err), 'error');
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resetForm() {
    setFormTitle('');
    setFormDescription('');
    setFormDate('');
    setFormLocation('');
    setFormType('competition');
    setFormMaxParticipants(30);
    setFormModalities('Jiu-Jitsu');
    setFormMinBelt(BeltLevel.White);
    setFormFee(0);
    setFormStatus('draft');
    setEditingEvent(null);
  }

  function openCreate() {
    resetForm();
    setShowForm(true);
  }

  function openEdit(event: AcademyEvent) {
    setEditingEvent(event);
    setFormTitle(event.title);
    setFormDescription(event.description);
    setFormDate(event.date.split('T')[0]);
    setFormLocation(event.location);
    setFormType(event.type);
    setFormMaxParticipants(event.max_participants);
    setFormModalities(event.modalities.join(', '));
    setFormMinBelt(event.min_belt);
    setFormFee(event.fee);
    setFormStatus(event.status);
    setShowForm(true);
  }

  async function handleSave() {
    if (!formTitle.trim() || !formDate || !formLocation.trim()) {
      toast('Preencha titulo, data e local', 'error');
      return;
    }

    setSaving(true);
    const data: CreateEventData = {
      title: formTitle.trim(),
      description: formDescription.trim(),
      date: new Date(formDate).toISOString(),
      location: formLocation.trim(),
      type: formType,
      max_participants: formMaxParticipants,
      modalities: formModalities.split(',').map((m) => m.trim()).filter(Boolean),
      min_belt: formMinBelt,
      fee: formFee,
      status: formStatus,
    };

    try {
      if (editingEvent) {
        const updated = await updateAcademyEvent(editingEvent.id, data);
        setEvents((prev) => prev.map((e) => (e.id === editingEvent.id ? updated : e)));
        toast('Evento atualizado!', 'success');
      } else {
        const created = await createAcademyEvent(getActiveAcademyId(), data);
        setEvents((prev) => [...prev, created]);
        toast('Evento criado!', 'success');
      }
      setShowForm(false);
      resetForm();
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(eventId: string) {
    try {
      await deleteAcademyEvent(eventId);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      toast('Evento removido', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  const filtered = filterType
    ? events.filter((e) => e.type === filterType)
    : events;

  // ── Skeleton ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-4 p-4 sm:p-6">
        <Skeleton variant="text" className="h-8 w-48" />
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} variant="text" className="h-8 w-24" />)}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} variant="card" className="h-56" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6 p-4 sm:p-6 overflow-x-hidden" data-stagger>
      {/* ── Header ────────────────────────────────────────────────── */}
      <section className="animate-reveal flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--bb-ink-100)' }}>
            Eventos
          </h1>
          <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>
            {events.length} evento{events.length !== 1 ? 's' : ''} cadastrado{events.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg px-4 py-2 min-h-[44px] text-sm font-medium transition-all hover:opacity-80"
          style={{ background: 'var(--bb-brand)', color: '#fff' }}
        >
          <PlusIcon className="h-4 w-4" />
          Novo Evento
        </button>
      </section>

      {/* ── Filters ───────────────────────────────────────────────── */}
      <section className="animate-reveal">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            type="button"
            onClick={() => setFilterType('')}
            className="flex-shrink-0 rounded-full px-4 py-1.5 min-h-[36px] text-sm font-medium transition-all"
            style={{
              background: !filterType ? 'var(--bb-brand)' : 'var(--bb-depth-3)',
              color: !filterType ? '#fff' : 'var(--bb-ink-60)',
            }}
          >
            Todos
          </button>
          {(Object.keys(EVENT_TYPE_LABELS) as EventType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilterType(type)}
              className="flex-shrink-0 rounded-full px-4 py-1.5 min-h-[36px] text-sm font-medium transition-all"
              style={{
                background: filterType === type ? 'var(--bb-brand)' : 'var(--bb-depth-3)',
                color: filterType === type ? '#fff' : 'var(--bb-ink-60)',
              }}
            >
              {EVENT_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      </section>

      {/* ── Form Panel ────────────────────────────────────────────── */}
      {showForm && (
        <section className="animate-reveal">
          <div
            className="rounded-lg p-5"
            style={{
              background: 'var(--bb-depth-2)',
              border: '1px solid var(--bb-glass-border)',
              borderRadius: 'var(--bb-radius-lg)',
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                {editingEvent ? 'Editar Evento' : 'Novo Evento'}
              </h2>
              <button
                type="button"
                onClick={() => { setShowForm(false); resetForm(); }}
                className="flex items-center justify-center rounded-lg min-h-[44px] min-w-[44px]"
                style={{ color: 'var(--bb-ink-60)' }}
                aria-label="Fechar"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Title */}
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>Titulo *</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Nome do evento"
                  className="w-full rounded-lg px-3 py-2 min-h-[44px] text-sm outline-none"
                  style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
                />
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>Descricao</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Descreva o evento..."
                  rows={3}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
                  style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
                />
              </div>

              {/* Date */}
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>Data *</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 min-h-[44px] text-sm outline-none"
                  style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
                />
              </div>

              {/* Location */}
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>Local *</label>
                <input
                  type="text"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="Tatame Principal"
                  className="w-full rounded-lg px-3 py-2 min-h-[44px] text-sm outline-none"
                  style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
                />
              </div>

              {/* Type */}
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>Tipo</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as EventType)}
                  className="w-full rounded-lg px-3 py-2 min-h-[44px] text-sm outline-none"
                  style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
                >
                  {(Object.keys(EVENT_TYPE_LABELS) as EventType[]).map((t) => (
                    <option key={t} value={t}>{EVENT_TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </div>

              {/* Max Participants */}
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>Vagas</label>
                <input
                  type="number"
                  value={formMaxParticipants}
                  onChange={(e) => setFormMaxParticipants(Number(e.target.value))}
                  min={1}
                  className="w-full rounded-lg px-3 py-2 min-h-[44px] text-sm outline-none"
                  style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
                />
              </div>

              {/* Modalities */}
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>Modalidades (separar por virgula)</label>
                <input
                  type="text"
                  value={formModalities}
                  onChange={(e) => setFormModalities(e.target.value)}
                  placeholder="Jiu-Jitsu, Muay Thai"
                  className="w-full rounded-lg px-3 py-2 min-h-[44px] text-sm outline-none"
                  style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
                />
              </div>

              {/* Min Belt */}
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>Faixa Minima</label>
                <select
                  value={formMinBelt}
                  onChange={(e) => setFormMinBelt(e.target.value as BeltLevel)}
                  className="w-full rounded-lg px-3 py-2 min-h-[44px] text-sm outline-none"
                  style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
                >
                  {Object.values(BeltLevel).map((b) => (
                    <option key={b} value={b}>{BELT_LABELS[b]}</option>
                  ))}
                </select>
              </div>

              {/* Fee */}
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>Valor (R$)</label>
                <input
                  type="number"
                  value={formFee}
                  onChange={(e) => setFormFee(Number(e.target.value))}
                  min={0}
                  step={10}
                  className="w-full rounded-lg px-3 py-2 min-h-[44px] text-sm outline-none"
                  style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
                />
              </div>

              {/* Status */}
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as EventStatus)}
                  className="w-full rounded-lg px-3 py-2 min-h-[44px] text-sm outline-none"
                  style={{ background: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
                >
                  {(Object.keys(STATUS_LABELS) as EventStatus[]).map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => { setShowForm(false); resetForm(); }}
                className="rounded-lg px-4 py-2 min-h-[44px] text-sm font-medium transition-all hover:opacity-80"
                style={{
                  background: 'var(--bb-depth-3)',
                  color: 'var(--bb-ink-100)',
                  border: '1px solid var(--bb-glass-border)',
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg px-6 py-2 min-h-[44px] text-sm font-medium transition-all hover:opacity-80 disabled:opacity-50"
                style={{ background: 'var(--bb-brand)', color: '#fff' }}
              >
                {saving ? 'Salvando...' : editingEvent ? 'Salvar' : 'Criar Evento'}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── Event Cards ───────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <section className="animate-reveal">
          {events.length === 0 ? (
            <EmptyState
              icon={CalendarCheckIcon}
              title="Nenhum evento criado"
              description="Crie eventos para engajar seus alunos."
              actionLabel="Novo Evento"
              onAction={openCreate}
            />
          ) : (
            <div className="py-12 text-center">
              <CalendarCheckIcon className="mx-auto mb-3 h-12 w-12" style={{ color: 'var(--bb-ink-20)' }} />
              <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>
                Nenhum evento encontrado com esses filtros.
              </p>
            </div>
          )}
        </section>
      ) : (
        <section className="animate-reveal grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((event) => {
              const tc = EVENT_TYPE_COLORS[event.type];
              const sc = STATUS_COLORS[event.status];
              const enrollPct = event.max_participants > 0
                ? Math.round((event.enrolled / event.max_participants) * 100)
                : 0;

              return (
                <div
                  key={event.id}
                  className="flex flex-col overflow-hidden"
                  style={{
                    background: 'var(--bb-depth-2)',
                    border: '1px solid var(--bb-glass-border)',
                    borderRadius: 'var(--bb-radius-lg)',
                  }}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between p-4 pb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        style={{ background: tc.bg, color: tc.text }}
                      >
                        {EVENT_TYPE_LABELS[event.type]}
                      </span>
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{ background: sc.bg, color: sc.text }}
                      >
                        {STATUS_LABELS[event.status]}
                      </span>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => openEdit(event)}
                        className="rounded-lg p-1.5 min-h-[36px] min-w-[36px] flex items-center justify-center transition-all hover:opacity-80"
                        style={{ color: 'var(--bb-ink-40)' }}
                        aria-label="Editar"
                      >
                        <EditIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(event.id)}
                        className="rounded-lg p-1.5 min-h-[36px] min-w-[36px] flex items-center justify-center transition-all hover:opacity-80"
                        style={{ color: '#EF4444' }}
                        aria-label="Excluir"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="flex-1 px-4 pb-2">
                    <h3 className="text-base font-bold leading-tight line-clamp-2" style={{ color: 'var(--bb-ink-100)' }}>
                      {event.title}
                    </h3>
                    <p className="mt-1 text-xs line-clamp-2" style={{ color: 'var(--bb-ink-40)' }}>
                      {event.description}
                    </p>
                  </div>

                  {/* Card Details */}
                  <div className="space-y-2 px-4 pb-3">
                    <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                      <CalendarCheckIcon className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                      <MapPinIcon className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                      <UsersIcon className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>{event.enrolled}/{event.max_participants} inscritos</span>
                    </div>
                    {event.fee > 0 && (
                      <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                        <DollarIcon className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>{formatBRL(event.fee)}</span>
                      </div>
                    )}
                  </div>

                  {/* Enrollment progress */}
                  <div className="px-4 pb-4">
                    <div
                      className="h-1.5 w-full overflow-hidden rounded-full"
                      style={{ background: 'var(--bb-depth-4)' }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(enrollPct, 100)}%`,
                          background: enrollPct >= 90 ? '#EF4444' : enrollPct >= 70 ? '#EAB308' : '#22C55E',
                        }}
                      />
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>
                      <span>{enrollPct}% preenchido</span>
                      <span>Min: {BELT_LABELS[event.min_belt]}</span>
                    </div>
                  </div>

                  {/* Modalities */}
                  {event.modalities.length > 0 && (
                    <div
                      className="flex flex-wrap gap-1 px-4 py-2"
                      style={{ borderTop: '1px solid var(--bb-glass-border)' }}
                    >
                      {event.modalities.map((m) => (
                        <span
                          key={m}
                          className="rounded px-2 py-0.5 text-[10px] font-medium"
                          style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-60)' }}
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
        </section>
      )}
    </div>
  );
}
