'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Plus,
  AlertTriangle,
  Shield,
  X,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import {
  listIncidents,
  reportIncident,
  ConductIncident,
  IncidentCategory,
  IncidentSeverity,
} from '@/lib/api/conduct-code.service';

// -- Labels PT-BR --------------------------------------------------------

const CATEGORY_LABELS: Record<IncidentCategory, string> = {
  hygiene: 'Higiene',
  disrespect: 'Desrespeito',
  aggression: 'Agressao',
  property_damage: 'Dano Material',
  sparring_violation: 'Violacao de Sparring',
  attendance: 'Frequencia',
  substance: 'Substancia',
  harassment: 'Assedio',
  safety_violation: 'Violacao de Seguranca',
  other: 'Outro',
};

const CATEGORY_COLOR: Record<IncidentCategory, { color: string; bg: string }> = {
  hygiene: { color: '#06B6D4', bg: 'rgba(6,182,212,0.12)' },
  disrespect: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  aggression: { color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
  property_damage: { color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
  sparring_violation: { color: '#F97316', bg: 'rgba(249,115,22,0.12)' },
  attendance: { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  substance: { color: '#EC4899', bg: 'rgba(236,72,153,0.12)' },
  harassment: { color: '#DC2626', bg: 'rgba(220,38,38,0.12)' },
  safety_violation: { color: '#D97706', bg: 'rgba(217,119,6,0.12)' },
  other: { color: '#6B7280', bg: 'rgba(107,114,128,0.12)' },
};

const SEVERITY_LABELS: Record<IncidentSeverity, string> = {
  minor: 'Leve',
  moderate: 'Moderada',
  serious: 'Grave',
  critical: 'Critica',
};

const SEVERITY_COLOR: Record<IncidentSeverity, { color: string; bg: string }> = {
  minor: { color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
  moderate: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  serious: { color: '#F97316', bg: 'rgba(249,115,22,0.12)' },
  critical: { color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
};

const ALL_CATEGORIES: IncidentCategory[] = [
  'hygiene',
  'disrespect',
  'aggression',
  'property_damage',
  'sparring_violation',
  'attendance',
  'substance',
  'harassment',
  'safety_violation',
  'other',
];

const ALL_SEVERITIES: IncidentSeverity[] = ['minor', 'moderate', 'serious', 'critical'];

type CategoryFilter = 'all' | IncidentCategory;
type SeverityFilter = 'all' | IncidentSeverity;

// -- Empty form ----------------------------------------------------------

interface IncidentForm {
  profile_id: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  incident_date: string;
  description: string;
  witnesses: string;
  evidence_urls: string;
}

const EMPTY_FORM: IncidentForm = {
  profile_id: '',
  category: 'other',
  severity: 'minor',
  incident_date: new Date().toISOString().split('T')[0],
  description: '',
  witnesses: '',
  evidence_urls: '',
};

// -- Skeleton ------------------------------------------------------------

function PageSkeleton() {
  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Skeleton variant="text" className="h-6 w-6" />
        <Skeleton variant="text" className="h-8 w-64" />
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="text" className="h-9 w-28" />
        ))}
      </div>
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} variant="card" className="h-28" />
      ))}
    </div>
  );
}

// -- Page ----------------------------------------------------------------

export default function OcorrenciasPage() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [incidents, setIncidents] = useState<ConductIncident[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<IncidentForm>(EMPTY_FORM);

  // -- Fetch -------------------------------------------------------------

  useEffect(() => {
    async function load() {
      try {
        const academyId = getActiveAcademyId();
        const data = await listIncidents(academyId);
        setIncidents(data);
      } catch (err) {
        toast(translateError(err), 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // -- Submit new incident -----------------------------------------------

  async function handleSubmit() {
    if (!form.profile_id.trim()) {
      toast('Informe o ID do perfil', 'error');
      return;
    }
    if (!form.description.trim()) {
      toast('Informe a descricao da ocorrencia', 'error');
      return;
    }

    setSaving(true);
    try {
      const academyId = getActiveAcademyId();
      const witnesses = form.witnesses
        .split(',')
        .map((w) => w.trim())
        .filter(Boolean);
      const evidenceUrls = form.evidence_urls
        .split(',')
        .map((u) => u.trim())
        .filter(Boolean);

      const result = await reportIncident(academyId, form.profile_id.trim(), {
        incident_date: form.incident_date,
        category: form.category,
        severity: form.severity,
        description: form.description.trim(),
        witnesses: witnesses.length ? witnesses : undefined,
        evidence_urls: evidenceUrls.length ? evidenceUrls : undefined,
      });

      if (result) {
        setIncidents((prev) => [result, ...prev]);
        setForm(EMPTY_FORM);
        setShowForm(false);
        toast('Ocorrencia registrada com sucesso', 'success');
      } else {
        toast('Erro ao registrar ocorrencia', 'error');
      }
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  // -- Filters -----------------------------------------------------------

  const filtered = incidents.filter((i) => {
    if (categoryFilter !== 'all' && i.category !== categoryFilter) return false;
    if (severityFilter !== 'all' && i.severity !== severityFilter) return false;
    return true;
  });

  // -- Loading -----------------------------------------------------------

  if (loading) return <PageSkeleton />;

  // -- Render ------------------------------------------------------------

  return (
    <div style={{ padding: '16px', maxWidth: '56rem', margin: '0 auto' }}>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            href="/admin/conduta"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--bb-depth-3)',
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={16} style={{ color: 'var(--bb-ink-60)' }} />
          </Link>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--bb-ink-100)', margin: 0 }}>
              Ocorrencias Disciplinares
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--bb-ink-60)', margin: '4px 0 0 0' }}>
              Gerencie as ocorrencias de conduta da academia
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setShowForm(true);
            setForm(EMPTY_FORM);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: '#fff',
            background: 'var(--bb-brand)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          <Plus size={16} />
          Nova Ocorrencia
        </button>
      </div>

      {/* ── Filters ────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        {/* Category filter */}
        <div>
          <label
            style={{ display: 'block', fontSize: '0.625rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--bb-ink-40)', marginBottom: '6px' }}
          >
            Categoria
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
            style={{
              width: '100%',
              maxWidth: '280px',
              padding: '8px 12px',
              fontSize: '0.8125rem',
              background: 'var(--bb-depth-3)',
              color: 'var(--bb-ink-100)',
              border: '1px solid var(--bb-glass-border)',
              borderRadius: '8px',
              outline: 'none',
            }}
          >
            <option value="all">Todas as categorias</option>
            {ALL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>

        {/* Severity filter */}
        <div>
          <label
            style={{ display: 'block', fontSize: '0.625rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--bb-ink-40)', marginBottom: '6px' }}
          >
            Gravidade
          </label>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as SeverityFilter)}
            style={{
              width: '100%',
              maxWidth: '280px',
              padding: '8px 12px',
              fontSize: '0.8125rem',
              background: 'var(--bb-depth-3)',
              color: 'var(--bb-ink-100)',
              border: '1px solid var(--bb-glass-border)',
              borderRadius: '8px',
              outline: 'none',
            }}
          >
            <option value="all">Todas as gravidades</option>
            {ALL_SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {SEVERITY_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── New Incident Modal ─────────────────────────────────────── */}
      {showForm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            background: 'rgba(0,0,0,0.5)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowForm(false);
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '540px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: 'var(--bb-depth-2)',
              border: '1px solid var(--bb-glass-border)',
              borderRadius: '16px',
              padding: '24px',
            }}
          >
            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bb-ink-100)', margin: 0 }}>
                Nova Ocorrencia
              </h2>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  background: 'var(--bb-depth-3)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                <X size={16} style={{ color: 'var(--bb-ink-60)' }} />
              </button>
            </div>

            {/* Form fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Profile ID */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--bb-ink-60)', marginBottom: '4px' }}>
                  ID do Perfil
                </label>
                <input
                  type="text"
                  placeholder="ID do aluno"
                  value={form.profile_id}
                  onChange={(e) => setForm((f) => ({ ...f, profile_id: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '0.8125rem',
                    background: 'var(--bb-depth-3)',
                    color: 'var(--bb-ink-100)',
                    border: '1px solid var(--bb-glass-border)',
                    borderRadius: '8px',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Category + Severity row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--bb-ink-60)', marginBottom: '4px' }}>
                    Categoria
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as IncidentCategory }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '0.8125rem',
                      background: 'var(--bb-depth-3)',
                      color: 'var(--bb-ink-100)',
                      border: '1px solid var(--bb-glass-border)',
                      borderRadius: '8px',
                      outline: 'none',
                    }}
                  >
                    {ALL_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {CATEGORY_LABELS[c]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--bb-ink-60)', marginBottom: '4px' }}>
                    Gravidade
                  </label>
                  <select
                    value={form.severity}
                    onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value as IncidentSeverity }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '0.8125rem',
                      background: 'var(--bb-depth-3)',
                      color: 'var(--bb-ink-100)',
                      border: '1px solid var(--bb-glass-border)',
                      borderRadius: '8px',
                      outline: 'none',
                    }}
                  >
                    {ALL_SEVERITIES.map((s) => (
                      <option key={s} value={s}>
                        {SEVERITY_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--bb-ink-60)', marginBottom: '4px' }}>
                  Data da Ocorrencia
                </label>
                <input
                  type="date"
                  value={form.incident_date}
                  onChange={(e) => setForm((f) => ({ ...f, incident_date: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '0.8125rem',
                    background: 'var(--bb-depth-3)',
                    color: 'var(--bb-ink-100)',
                    border: '1px solid var(--bb-glass-border)',
                    borderRadius: '8px',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--bb-ink-60)', marginBottom: '4px' }}>
                  Descricao
                </label>
                <textarea
                  rows={4}
                  placeholder="Descreva a ocorrencia em detalhes..."
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '0.8125rem',
                    background: 'var(--bb-depth-3)',
                    color: 'var(--bb-ink-100)',
                    border: '1px solid var(--bb-glass-border)',
                    borderRadius: '8px',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Witnesses */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--bb-ink-60)', marginBottom: '4px' }}>
                  Testemunhas (separadas por virgula)
                </label>
                <input
                  type="text"
                  placeholder="Nome 1, Nome 2..."
                  value={form.witnesses}
                  onChange={(e) => setForm((f) => ({ ...f, witnesses: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '0.8125rem',
                    background: 'var(--bb-depth-3)',
                    color: 'var(--bb-ink-100)',
                    border: '1px solid var(--bb-glass-border)',
                    borderRadius: '8px',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Evidence URLs */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--bb-ink-60)', marginBottom: '4px' }}>
                  URLs de Evidencias (separadas por virgula)
                </label>
                <input
                  type="text"
                  placeholder="https://exemplo.com/foto1.jpg, https://..."
                  value={form.evidence_urls}
                  onChange={(e) => setForm((f) => ({ ...f, evidence_urls: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '0.8125rem',
                    background: 'var(--bb-depth-3)',
                    color: 'var(--bb-ink-100)',
                    border: '1px solid var(--bb-glass-border)',
                    borderRadius: '8px',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={saving}
                style={{
                  width: '100%',
                  padding: '10px 0',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#fff',
                  background: saving ? 'var(--bb-ink-40)' : 'var(--bb-brand)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? 'Salvando...' : 'Registrar Ocorrencia'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Count badge ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--bb-ink-80)' }}>
          Resultados
        </span>
        <span
          style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            padding: '2px 10px',
            borderRadius: '9999px',
            background: 'var(--bb-depth-3)',
            color: 'var(--bb-ink-60)',
          }}
        >
          {filtered.length}
        </span>
      </div>

      {/* ── Incidents list ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.map((incident) => {
          const isExpanded = expandedId === incident.id;
          const catColor = CATEGORY_COLOR[incident.category];
          const sevColor = SEVERITY_COLOR[incident.severity];

          return (
            <div
              key={incident.id}
              style={{
                background: 'var(--bb-depth-2)',
                border: '1px solid var(--bb-glass-border)',
                borderRadius: '12px',
                overflow: 'hidden',
              }}
            >
              {/* Summary row */}
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : incident.id)}
                style={{
                  display: 'flex',
                  width: '100%',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {/* Alert icon */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    flexShrink: 0,
                    borderRadius: '8px',
                    background: sevColor.bg,
                  }}
                >
                  <AlertTriangle size={16} style={{ color: sevColor.color }} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {/* Category badge */}
                    <span
                      style={{
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        color: catColor.color,
                        background: catColor.bg,
                      }}
                    >
                      {CATEGORY_LABELS[incident.category]}
                    </span>

                    {/* Severity badge */}
                    <span
                      style={{
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        color: sevColor.color,
                        background: sevColor.bg,
                      }}
                    >
                      {SEVERITY_LABELS[incident.severity]}
                    </span>
                  </div>

                  <p
                    style={{
                      margin: '4px 0 0 0',
                      fontSize: '0.8125rem',
                      color: 'var(--bb-ink-80)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {incident.description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--bb-ink-40)' }}>
                      {new Date(incident.incident_date).toLocaleDateString('pt-BR')}
                    </span>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--bb-ink-40)' }}>
                      Perfil: {incident.profile_id.slice(0, 8)}...
                    </span>
                  </div>
                </div>

                {/* Chevron */}
                {isExpanded ? (
                  <ChevronUp size={16} style={{ color: 'var(--bb-ink-40)', flexShrink: 0 }} />
                ) : (
                  <ChevronDown size={16} style={{ color: 'var(--bb-ink-40)', flexShrink: 0 }} />
                )}
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--bb-glass-border)' }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr',
                      gap: '12px',
                      paddingTop: '12px',
                    }}
                  >
                    {/* Description */}
                    <div>
                      <p style={{ fontSize: '0.625rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--bb-ink-40)', margin: 0 }}>
                        Descricao completa
                      </p>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--bb-ink-80)', margin: '4px 0 0 0', whiteSpace: 'pre-wrap' }}>
                        {incident.description}
                      </p>
                    </div>

                    {/* Two-col grid for metadata */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <p style={{ fontSize: '0.625rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--bb-ink-40)', margin: 0 }}>
                          Data da Ocorrencia
                        </p>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--bb-ink-80)', margin: '4px 0 0 0' }}>
                          {new Date(incident.incident_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.625rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--bb-ink-40)', margin: 0 }}>
                          Registrada em
                        </p>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--bb-ink-80)', margin: '4px 0 0 0' }}>
                          {new Date(incident.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.625rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--bb-ink-40)', margin: 0 }}>
                          ID do Perfil
                        </p>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--bb-ink-80)', margin: '4px 0 0 0', wordBreak: 'break-all' }}>
                          {incident.profile_id}
                        </p>
                      </div>
                      {incident.reported_by_id && (
                        <div>
                          <p style={{ fontSize: '0.625rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--bb-ink-40)', margin: 0 }}>
                            Reportado por
                          </p>
                          <p style={{ fontSize: '0.8125rem', color: 'var(--bb-ink-80)', margin: '4px 0 0 0', wordBreak: 'break-all' }}>
                            {incident.reported_by_id}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Witnesses */}
                    {incident.witnesses && incident.witnesses.length > 0 && (
                      <div>
                        <p style={{ fontSize: '0.625rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--bb-ink-40)', margin: 0 }}>
                          Testemunhas
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                          {incident.witnesses.map((w, idx) => (
                            <span
                              key={idx}
                              style={{
                                fontSize: '0.6875rem',
                                fontWeight: 500,
                                padding: '2px 10px',
                                borderRadius: '9999px',
                                background: 'var(--bb-depth-3)',
                                color: 'var(--bb-ink-60)',
                              }}
                            >
                              {w}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Evidence */}
                    {incident.evidence_urls && incident.evidence_urls.length > 0 && (
                      <div>
                        <p style={{ fontSize: '0.625rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--bb-ink-40)', margin: 0 }}>
                          Evidencias
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                          {incident.evidence_urls.map((url, idx) => (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                fontSize: '0.75rem',
                                color: 'var(--bb-brand)',
                                wordBreak: 'break-all',
                              }}
                            >
                              {url}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div
            style={{
              padding: '48px 16px',
              textAlign: 'center',
              background: 'var(--bb-depth-2)',
              border: '1px solid var(--bb-glass-border)',
              borderRadius: '12px',
            }}
          >
            <Shield size={40} style={{ color: 'var(--bb-ink-20)', margin: '0 auto 12px' }} />
            <p style={{ fontSize: '0.875rem', color: 'var(--bb-ink-40)', margin: 0 }}>
              Nenhuma ocorrencia encontrada com os filtros selecionados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
