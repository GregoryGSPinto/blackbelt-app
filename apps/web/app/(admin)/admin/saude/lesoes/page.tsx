'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import {
  listInjuries,
  updateInjury,
  clearInjuryReturn,
  addRestriction,
} from '@/lib/api/health-declaration.service';
import type {
  HealthInjury,
  RecoveryStatus,
  Severity,
  RestrictionType,
} from '@/lib/api/health-declaration.service';

// ── Labels & Colors ───────────────────────────────────────────────

const RECOVERY_LABEL: Record<RecoveryStatus, string> = {
  active: 'Ativa',
  recovering: 'Recuperando',
  recovered: 'Recuperada',
  chronic: 'Cronica',
};

const RECOVERY_COLOR: Record<RecoveryStatus, { color: string; bg: string }> = {
  active: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  recovering: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  recovered: { color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
  chronic: { color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
};

const SEVERITY_LABEL: Record<Severity, string> = {
  mild: 'Leve',
  moderate: 'Moderada',
  severe: 'Grave',
};

const SEVERITY_COLOR: Record<Severity, { color: string; bg: string }> = {
  mild: { color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
  moderate: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  severe: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
};

const OCCURRED_LABEL: Record<string, string> = {
  training: 'Treino',
  competition: 'Competicao',
  outside: 'Fora da academia',
  unknown: 'Desconhecido',
};

const TREATMENT_LABEL: Record<string, string> = {
  none: 'Nenhum',
  first_aid: 'Primeiros socorros',
  physiotherapy: 'Fisioterapia',
  surgery: 'Cirurgia',
  other: 'Outro',
};

const RESTRICTION_OPTIONS: { value: RestrictionType; label: string }[] = [
  { value: 'no_sparring', label: 'Sem sparring' },
  { value: 'no_ground', label: 'Sem solo' },
  { value: 'no_striking', label: 'Sem striking' },
  { value: 'no_takedowns', label: 'Sem quedas' },
  { value: 'limited_range', label: 'Amplitude limitada' },
  { value: 'no_contact', label: 'Sem contato' },
  { value: 'light_only', label: 'Apenas leve' },
  { value: 'observe_only', label: 'Apenas observar' },
  { value: 'custom', label: 'Personalizada' },
];

type StatusFilter = 'all' | RecoveryStatus;
type SeverityFilter = 'all' | Severity;

// ── Skeleton ──────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <Skeleton variant="text" className="h-6 w-6" />
        <Skeleton variant="text" className="h-8 w-48" />
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} variant="text" className="h-9 w-24" />
        ))}
      </div>
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} variant="card" className="h-32" />
      ))}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────

export default function LesoesPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [injuries, setInjuries] = useState<HealthInjury[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const academyId = getActiveAcademyId();
        const data = await listInjuries(academyId);
        setInjuries(data);
      } catch (err) {
        toast(translateError(err), 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Actions ─────────────────────────────────────────────────────

  async function handleUpdateStatus(injury: HealthInjury, newStatus: RecoveryStatus) {
    setUpdatingId(injury.id);
    try {
      const updated = await updateInjury(injury.id, { recovery_status: newStatus });
      if (updated) {
        setInjuries((prev) => prev.map((i) => (i.id === injury.id ? updated : i)));
        toast('Status atualizado', 'success');
      } else {
        toast('Erro ao atualizar status', 'error');
      }
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleClearReturn(injury: HealthInjury) {
    setUpdatingId(injury.id);
    try {
      const updated = await clearInjuryReturn(injury.id, 'admin');
      if (updated) {
        setInjuries((prev) => prev.map((i) => (i.id === injury.id ? updated : i)));
        toast('Retorno liberado com sucesso', 'success');
      } else {
        toast('Erro ao liberar retorno', 'error');
      }
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleAddRestriction(injury: HealthInjury, restrictionType: RestrictionType) {
    setUpdatingId(injury.id);
    try {
      const academyId = getActiveAcademyId();
      const result = await addRestriction(academyId, injury.profile_id, {
        injury_id: injury.id,
        restriction_type: restrictionType,
        body_part: injury.body_part,
        description: `Restricao por lesao: ${injury.description}`,
        severity: injury.severity === 'severe' ? 'high' : injury.severity === 'moderate' ? 'moderate' : 'low',
        start_date: new Date().toISOString().split('T')[0],
        is_permanent: false,
      });
      if (result) {
        toast('Restricao adicionada', 'success');
      } else {
        toast('Erro ao adicionar restricao', 'error');
      }
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setUpdatingId(null);
    }
  }

  // ── Filters ─────────────────────────────────────────────────────

  const filtered = injuries.filter((i) => {
    if (statusFilter !== 'all' && i.recovery_status !== statusFilter) return false;
    if (severityFilter !== 'all' && i.severity !== severityFilter) return false;
    return true;
  });

  if (loading) return <PageSkeleton />;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/saude" className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors" style={{ background: 'var(--bb-depth-3)' }}>
          <ArrowLeft size={16} style={{ color: 'var(--bb-ink-60)' }} />
        </Link>
        <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>Lesoes</h1>
        <span
          className="ml-2 rounded-full px-2.5 py-0.5 text-xs font-semibold"
          style={{ background: 'var(--bb-depth-3)', color: 'var(--bb-ink-60)' }}
        >
          {filtered.length}
        </span>
      </div>

      {/* Filters: Status */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {(['all', 'active', 'recovering', 'recovered', 'chronic'] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
              style={{
                background: statusFilter === s ? 'var(--bb-brand)' : 'var(--bb-depth-3)',
                color: statusFilter === s ? '#fff' : 'var(--bb-ink-60)',
                border: '1px solid var(--bb-glass-border)',
              }}
            >
              {s === 'all' ? 'Todos' : RECOVERY_LABEL[s]}
            </button>
          ))}
        </div>

        {/* Filters: Severity */}
        <div className="flex flex-wrap gap-2">
          {(['all', 'mild', 'moderate', 'severe'] as SeverityFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className="rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
              style={{
                background: severityFilter === s ? 'var(--bb-brand)' : 'var(--bb-depth-3)',
                color: severityFilter === s ? '#fff' : 'var(--bb-ink-60)',
                border: '1px solid var(--bb-glass-border)',
              }}
            >
              {s === 'all' ? 'Todas Gravidades' : SEVERITY_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Injury Cards */}
      <div className="space-y-3">
        {filtered.map((injury) => {
          const isExpanded = expandedId === injury.id;
          const isUpdating = updatingId === injury.id;

          return (
            <Card
              key={injury.id}
              className="overflow-hidden p-0"
              style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)', borderRadius: 'var(--bb-radius-lg)' }}
            >
              {/* Summary row */}
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : injury.id)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors"
                style={{ background: 'transparent' }}
              >
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: SEVERITY_COLOR[injury.severity].bg }}>
                  <AlertTriangle size={16} style={{ color: SEVERITY_COLOR[injury.severity].color }} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold truncate" style={{ color: 'var(--bb-ink-100)' }}>
                      {injury.body_part}
                    </span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                      style={{
                        color: SEVERITY_COLOR[injury.severity].color,
                        background: SEVERITY_COLOR[injury.severity].bg,
                      }}
                    >
                      {SEVERITY_LABEL[injury.severity]}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs truncate" style={{ color: 'var(--bb-ink-60)' }}>
                    {injury.profile_id.slice(0, 8)}... &middot; {injury.occurred_during ? OCCURRED_LABEL[injury.occurred_during] : '—'}
                  </p>
                </div>

                <span
                  className="flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                  style={{
                    color: RECOVERY_COLOR[injury.recovery_status].color,
                    background: RECOVERY_COLOR[injury.recovery_status].bg,
                  }}
                >
                  {RECOVERY_LABEL[injury.recovery_status]}
                </span>

                {isExpanded ? (
                  <ChevronUp size={16} style={{ color: 'var(--bb-ink-40)' }} />
                ) : (
                  <ChevronDown size={16} style={{ color: 'var(--bb-ink-40)' }} />
                )}
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div className="space-y-4 px-4 pb-4" style={{ borderTop: '1px solid var(--bb-glass-border)' }}>
                  <div className="grid grid-cols-1 gap-3 pt-3 sm:grid-cols-2">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>Descricao</p>
                      <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-80)' }}>{injury.description || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>Data da Lesao</p>
                      <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-80)' }}>
                        {new Date(injury.injury_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>Tratamento</p>
                      <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-80)' }}>
                        {injury.treatment_type ? TREATMENT_LABEL[injury.treatment_type] : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>Detalhes do Tratamento</p>
                      <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-80)' }}>{injury.treatment_details || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>Previsao de Recuperacao</p>
                      <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-80)' }}>
                        {injury.estimated_recovery_days ? `${injury.estimated_recovery_days} dias` : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--bb-ink-40)' }}>Data de Recuperacao</p>
                      <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-80)' }}>
                        {injury.actual_recovery_date ? new Date(injury.actual_recovery_date).toLocaleDateString('pt-BR') : '—'}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-2" style={{ borderTop: '1px solid var(--bb-glass-border)' }}>
                    {/* Update status buttons */}
                    {injury.recovery_status === 'active' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={isUpdating}
                        onClick={() => handleUpdateStatus(injury, 'recovering')}
                      >
                        <Clock size={14} className="mr-1" />
                        Marcar Recuperando
                      </Button>
                    )}
                    {(injury.recovery_status === 'active' || injury.recovery_status === 'recovering') && (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={isUpdating}
                        onClick={() => handleUpdateStatus(injury, 'recovered')}
                      >
                        <CheckCircle2 size={14} className="mr-1" />
                        Marcar Recuperada
                      </Button>
                    )}
                    {injury.recovery_status !== 'recovered' && (
                      <Button
                        size="sm"
                        disabled={isUpdating}
                        onClick={() => handleClearReturn(injury)}
                      >
                        <CheckCircle2 size={14} className="mr-1" />
                        Liberar Retorno
                      </Button>
                    )}

                    {/* Add restriction dropdown */}
                    <div className="relative">
                      <select
                        className="h-8 rounded-md px-2 text-xs font-medium"
                        style={{
                          background: 'var(--bb-depth-3)',
                          border: '1px solid var(--bb-glass-border)',
                          color: 'var(--bb-ink-80)',
                          borderRadius: 'var(--bb-radius-md)',
                        }}
                        disabled={isUpdating}
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAddRestriction(injury, e.target.value as RestrictionType);
                            e.target.value = '';
                          }
                        }}
                      >
                        <option value="" disabled>
                          + Restricao
                        </option>
                        {RESTRICTION_OPTIONS.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <Shield size={40} className="mx-auto mb-3" style={{ color: 'var(--bb-ink-20)' }} />
            <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>
              Nenhuma lesao encontrada com os filtros selecionados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
