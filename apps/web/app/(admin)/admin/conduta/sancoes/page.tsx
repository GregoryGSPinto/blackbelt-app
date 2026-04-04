'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  MessageSquare,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import {
  listSanctions,
  issueSanction,
  acknowledgeSanction,
  appealSanction,
  type ConductSanction,
  type SanctionType,
} from '@/lib/api/conduct-code.service';

// ── Labels PT-BR ────────────────────────────────────────────────────

const SANCTION_TYPE_LABELS: Record<SanctionType, string> = {
  verbal_warning: 'Advertência Verbal',
  written_warning: 'Advertência Escrita',
  suspension: 'Suspensão',
  ban: 'Banimento',
  community_service: 'Serviço Comunitário',
  other: 'Outra',
};

const SANCTION_TYPE_COLORS: Record<SanctionType, { color: string; bg: string }> = {
  verbal_warning: { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  written_warning: { color: '#CA8A04', bg: 'rgba(234,179,8,0.12)' },
  suspension: { color: '#EA580C', bg: 'rgba(234,88,12,0.12)' },
  ban: { color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
  community_service: { color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
  other: { color: '#6B7280', bg: 'rgba(107,114,128,0.12)' },
};

const SANCTION_TYPE_OPTIONS: SanctionType[] = [
  'verbal_warning',
  'written_warning',
  'suspension',
  'ban',
  'community_service',
  'other',
];

type TypeFilter = 'all' | SanctionType;

// ── Form ────────────────────────────────────────────────────────────

interface SanctionForm {
  profile_id: string;
  incident_id: string;
  sanction_type: SanctionType;
  description: string;
  severity_level: number;
  start_date: string;
  end_date: string;
}

const EMPTY_FORM: SanctionForm = {
  profile_id: '',
  incident_id: '',
  sanction_type: 'verbal_warning',
  description: '',
  severity_level: 1,
  start_date: new Date().toISOString().split('T')[0],
  end_date: '',
};

// ── Skeleton ────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Skeleton variant="text" className="h-6 w-6" />
        <Skeleton variant="text" className="h-8 w-56" />
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="text" className="h-9 w-28" />
        ))}
      </div>
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} variant="card" className="h-36" />
      ))}
    </div>
  );
}

// ── Severity Dots ───────────────────────────────────────────────────

function SeverityDots({ level }: { level: number }) {
  return (
    <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <div
          key={n}
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: n <= level ? 'var(--bb-brand)' : 'var(--bb-depth-3)',
            transition: 'background 0.2s',
          }}
        />
      ))}
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: 'var(--bb-ink-40)',
          marginLeft: 4,
        }}
      >
        {level}/5
      </span>
    </div>
  );
}

// ── Main ────────────────────────────────────────────────────────────

export default function SancoesPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [sanctions, setSanctions] = useState<ConductSanction[]>([]);
  const [activeOnly, setActiveOnly] = useState(false);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<SanctionForm>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [appealModalId, setAppealModalId] = useState<string | null>(null);
  const [appealNotes, setAppealNotes] = useState('');

  // ── Load ─────────────────────────────────────────────────────────

  useEffect(() => {
    async function load() {
      try {
        const academyId = getActiveAcademyId();
        const data = await listSanctions(academyId);
        setSanctions(data);
      } catch (err) {
        toast(translateError(err), 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Filters ──────────────────────────────────────────────────────

  const filtered = sanctions.filter((s) => {
    if (activeOnly && !s.is_active) return false;
    if (typeFilter !== 'all' && s.sanction_type !== typeFilter) return false;
    return true;
  });

  // ── Actions ──────────────────────────────────────────────────────

  async function handleCreate() {
    if (!form.profile_id.trim() || !form.description.trim()) {
      toast('Preencha os campos obrigatórios', 'error');
      return;
    }
    setSaving(true);
    try {
      const academyId = getActiveAcademyId();
      const result = await issueSanction(academyId, form.profile_id.trim(), {
        incident_id: form.incident_id.trim() || undefined,
        sanction_type: form.sanction_type,
        description: form.description.trim(),
        severity_level: form.severity_level,
        start_date: form.start_date,
        end_date: form.end_date || undefined,
      });
      if (result) {
        setSanctions((prev) => [result, ...prev]);
        setShowForm(false);
        setForm({ ...EMPTY_FORM });
        toast('Sanção registrada com sucesso', 'success');
      } else {
        toast('Erro ao registrar sanção', 'error');
      }
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleAcknowledge(sanctionId: string) {
    setActionId(sanctionId);
    try {
      const result = await acknowledgeSanction(sanctionId);
      if (result) {
        setSanctions((prev) => prev.map((s) => (s.id === sanctionId ? result : s)));
        toast('Ciência registrada com sucesso', 'success');
      } else {
        toast('Erro ao registrar ciência', 'error');
      }
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setActionId(null);
    }
  }

  async function handleAppealSubmit(sanctionId: string) {
    if (!appealNotes.trim()) {
      toast('Informe as notas do recurso', 'error');
      return;
    }
    setActionId(sanctionId);
    try {
      const result = await appealSanction(sanctionId, appealNotes.trim());
      if (result) {
        setSanctions((prev) => prev.map((s) => (s.id === sanctionId ? result : s)));
        setAppealModalId(null);
        setAppealNotes('');
        toast('Recurso registrado com sucesso', 'success');
      } else {
        toast('Erro ao registrar recurso', 'error');
      }
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setActionId(null);
    }
  }

  // ── Render ───────────────────────────────────────────────────────

  if (loading) return <PageSkeleton />;

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            href="/admin/conduta"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'var(--bb-depth-3)',
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={16} style={{ color: 'var(--bb-ink-60)' }} />
          </Link>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--bb-ink-100)', margin: 0 }}>
            Sanções Disciplinares
          </h1>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--bb-ink-60)',
              background: 'var(--bb-depth-3)',
              borderRadius: 9999,
              padding: '2px 10px',
            }}
          >
            {filtered.length}
          </span>
        </div>
        <Button variant="primary" onClick={() => { setShowForm(true); setForm({ ...EMPTY_FORM }); }}>
          <Plus size={16} style={{ marginRight: 4 }} />
          Nova Sanção
        </Button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Active-only toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setActiveOnly(!activeOnly)}
            style={{
              width: 36,
              height: 20,
              borderRadius: 10,
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              background: activeOnly ? 'var(--bb-brand)' : 'var(--bb-depth-4)',
              transition: 'background 0.2s',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: 2,
                left: activeOnly ? 18 : 2,
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: '#fff',
                transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
              }}
            />
          </button>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--bb-ink-80)' }}>
            Apenas ativas
          </span>
        </div>

        {/* Type filter */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          <button
            type="button"
            onClick={() => setTypeFilter('all')}
            style={{
              padding: '4px 12px',
              borderRadius: 9999,
              fontSize: 12,
              fontWeight: 500,
              border: '1px solid var(--bb-glass-border)',
              cursor: 'pointer',
              background: typeFilter === 'all' ? 'var(--bb-brand)' : 'var(--bb-depth-3)',
              color: typeFilter === 'all' ? '#fff' : 'var(--bb-ink-60)',
              transition: 'background 0.2s, color 0.2s',
            }}
          >
            Todos
          </button>
          {SANCTION_TYPE_OPTIONS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              style={{
                padding: '4px 12px',
                borderRadius: 9999,
                fontSize: 12,
                fontWeight: 500,
                border: '1px solid var(--bb-glass-border)',
                cursor: 'pointer',
                background: typeFilter === t ? SANCTION_TYPE_COLORS[t].bg : 'var(--bb-depth-3)',
                color: typeFilter === t ? SANCTION_TYPE_COLORS[t].color : 'var(--bb-ink-60)',
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              {SANCTION_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* New Sanction Form */}
      {showForm && (
        <Card
          style={{
            background: 'var(--bb-depth-2)',
            border: '2px solid var(--bb-brand)',
            borderRadius: 12,
            padding: '20px',
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--bb-ink-100)', margin: '0 0 16px 0' }}>
            Nova Sanção
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* profile_id */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--bb-ink-60)', marginBottom: 4 }}>
                ID do Aluno *
              </label>
              <input
                type="text"
                value={form.profile_id}
                onChange={(e) => setForm((f) => ({ ...f, profile_id: e.target.value }))}
                placeholder="UUID do perfil do aluno"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: 14,
                  borderRadius: 8,
                  border: '1px solid var(--bb-glass-border)',
                  background: 'var(--bb-depth-1)',
                  color: 'var(--bb-ink-100)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* incident_id */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--bb-ink-60)', marginBottom: 4 }}>
                ID da Ocorrência (opcional)
              </label>
              <input
                type="text"
                value={form.incident_id}
                onChange={(e) => setForm((f) => ({ ...f, incident_id: e.target.value }))}
                placeholder="UUID da ocorrência vinculada"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: 14,
                  borderRadius: 8,
                  border: '1px solid var(--bb-glass-border)',
                  background: 'var(--bb-depth-1)',
                  color: 'var(--bb-ink-100)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* sanction_type + severity_level */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--bb-ink-60)', marginBottom: 4 }}>
                  Tipo de Sanção *
                </label>
                <select
                  value={form.sanction_type}
                  onChange={(e) => setForm((f) => ({ ...f, sanction_type: e.target.value as SanctionType }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: 14,
                    borderRadius: 8,
                    border: '1px solid var(--bb-glass-border)',
                    background: 'var(--bb-depth-1)',
                    color: 'var(--bb-ink-100)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  {SANCTION_TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>{SANCTION_TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--bb-ink-60)', marginBottom: 4 }}>
                  Gravidade (1-5) *
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={form.severity_level}
                  onChange={(e) => setForm((f) => ({ ...f, severity_level: Math.min(5, Math.max(1, Number(e.target.value))) }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: 14,
                    borderRadius: 8,
                    border: '1px solid var(--bb-glass-border)',
                    background: 'var(--bb-depth-1)',
                    color: 'var(--bb-ink-100)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* description */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--bb-ink-60)', marginBottom: 4 }}>
                Descrição *
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Descreva a sanção aplicada..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: 14,
                  borderRadius: 8,
                  border: '1px solid var(--bb-glass-border)',
                  background: 'var(--bb-depth-1)',
                  color: 'var(--bb-ink-100)',
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            {/* start_date + end_date */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--bb-ink-60)', marginBottom: 4 }}>
                  Data Início *
                </label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: 14,
                    borderRadius: 8,
                    border: '1px solid var(--bb-glass-border)',
                    background: 'var(--bb-depth-1)',
                    color: 'var(--bb-ink-100)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--bb-ink-60)', marginBottom: 4 }}>
                  Data Fim (opcional)
                </label>
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: 14,
                    borderRadius: 8,
                    border: '1px solid var(--bb-glass-border)',
                    background: 'var(--bb-depth-1)',
                    color: 'var(--bb-ink-100)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '8px', paddingTop: 4 }}>
              <Button variant="primary" onClick={handleCreate} disabled={saving}>
                {saving ? 'Salvando...' : 'Registrar Sanção'}
              </Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Sanctions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 16px' }}>
            <ShieldAlert
              size={40}
              style={{ color: 'var(--bb-ink-20)', margin: '0 auto 12px auto', display: 'block' }}
            />
            <p style={{ fontSize: 14, color: 'var(--bb-ink-40)', margin: 0 }}>
              Nenhuma sanção encontrada com os filtros selecionados.
            </p>
          </div>
        )}

        {filtered.map((sanction) => {
          const typeColor = SANCTION_TYPE_COLORS[sanction.sanction_type];
          const isUpdating = actionId === sanction.id;

          return (
            <Card
              key={sanction.id}
              style={{
                background: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
                borderRadius: 12,
                padding: 0,
                overflow: 'hidden',
              }}
            >
              {/* Card header */}
              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Top row: type badge + active badge + acknowledged badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em',
                      padding: '3px 10px',
                      borderRadius: 9999,
                      color: typeColor.color,
                      background: typeColor.bg,
                    }}
                  >
                    {SANCTION_TYPE_LABELS[sanction.sanction_type]}
                  </span>

                  {sanction.is_active ? (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 9999,
                        color: '#16A34A',
                        background: 'rgba(34,197,94,0.12)',
                      }}
                    >
                      Ativa
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 9999,
                        color: 'var(--bb-ink-40)',
                        background: 'var(--bb-depth-3)',
                      }}
                    >
                      Inativa
                    </span>
                  )}

                  {sanction.student_acknowledged && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 9999,
                        color: '#3B82F6',
                        background: 'rgba(59,130,246,0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                      }}
                    >
                      <CheckCircle2 size={10} />
                      Ciente
                    </span>
                  )}

                  {sanction.appeal_notes && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 9999,
                        color: '#D97706',
                        background: 'rgba(217,119,6,0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                      }}
                    >
                      <MessageSquare size={10} />
                      {sanction.appeal_resolved ? 'Recurso Resolvido' : 'Recurso Pendente'}
                    </span>
                  )}
                </div>

                {/* Severity */}
                <SeverityDots level={sanction.severity_level} />

                {/* Description */}
                <p style={{ fontSize: 14, color: 'var(--bb-ink-80)', margin: 0, lineHeight: 1.5 }}>
                  {sanction.description}
                </p>

                {/* Dates + profile ID */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: 12, color: 'var(--bb-ink-60)' }}>
                  <span>
                    <strong style={{ color: 'var(--bb-ink-40)', fontWeight: 600, textTransform: 'uppercase', fontSize: 10 }}>Início:</strong>{' '}
                    {new Date(sanction.start_date).toLocaleDateString('pt-BR')}
                  </span>
                  <span>
                    <strong style={{ color: 'var(--bb-ink-40)', fontWeight: 600, textTransform: 'uppercase', fontSize: 10 }}>Fim:</strong>{' '}
                    {sanction.end_date ? new Date(sanction.end_date).toLocaleDateString('pt-BR') : 'Indefinido'}
                  </span>
                  <span>
                    <strong style={{ color: 'var(--bb-ink-40)', fontWeight: 600, textTransform: 'uppercase', fontSize: 10 }}>Aluno:</strong>{' '}
                    {sanction.profile_id.slice(0, 8)}...
                  </span>
                  {sanction.incident_id && (
                    <span>
                      <strong style={{ color: 'var(--bb-ink-40)', fontWeight: 600, textTransform: 'uppercase', fontSize: 10 }}>Ocorrência:</strong>{' '}
                      {sanction.incident_id.slice(0, 8)}...
                    </span>
                  )}
                </div>

                {/* Appeal notes if present */}
                {sanction.appeal_notes && (
                  <div
                    style={{
                      background: 'rgba(217,119,6,0.06)',
                      border: '1px solid rgba(217,119,6,0.2)',
                      borderRadius: 8,
                      padding: '10px 12px',
                    }}
                  >
                    <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: '#D97706', margin: '0 0 4px 0' }}>
                      Notas do Recurso
                    </p>
                    <p style={{ fontSize: 13, color: 'var(--bb-ink-80)', margin: 0, lineHeight: 1.4 }}>
                      {sanction.appeal_notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions bar */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  padding: '10px 16px',
                  borderTop: '1px solid var(--bb-glass-border)',
                  background: 'var(--bb-depth-1)',
                }}
              >
                {!sanction.student_acknowledged && (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={isUpdating}
                    onClick={() => handleAcknowledge(sanction.id)}
                  >
                    <CheckCircle2 size={14} style={{ marginRight: 4 }} />
                    Registrar Ciência
                  </Button>
                )}
                {!sanction.appeal_notes && (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={isUpdating}
                    onClick={() => {
                      setAppealModalId(sanction.id);
                      setAppealNotes('');
                    }}
                  >
                    <MessageSquare size={14} style={{ marginRight: 4 }} />
                    Registrar Recurso
                  </Button>
                )}
              </div>

              {/* Inline appeal form */}
              {appealModalId === sanction.id && (
                <div
                  style={{
                    padding: '12px 16px',
                    borderTop: '1px solid var(--bb-glass-border)',
                    background: 'var(--bb-depth-1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--bb-ink-60)' }}>
                    Notas do Recurso
                  </label>
                  <textarea
                    value={appealNotes}
                    onChange={(e) => setAppealNotes(e.target.value)}
                    placeholder="Descreva o recurso apresentado pelo aluno..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: 13,
                      borderRadius: 8,
                      border: '1px solid var(--bb-glass-border)',
                      background: 'var(--bb-depth-2)',
                      color: 'var(--bb-ink-100)',
                      outline: 'none',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                    }}
                  />
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <Button
                      size="sm"
                      variant="primary"
                      disabled={isUpdating}
                      onClick={() => handleAppealSubmit(sanction.id)}
                    >
                      {isUpdating ? 'Salvando...' : 'Enviar Recurso'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setAppealModalId(null);
                        setAppealNotes('');
                      }}
                    >
                      <XCircle size={14} style={{ marginRight: 4 }} />
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
