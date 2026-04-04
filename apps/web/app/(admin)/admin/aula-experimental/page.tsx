'use client';

import { useEffect, useState } from 'react';
import {
  listTrialClasses,
  createTrialClass,
  updateTrialStatus,
  getTrialMetrics,
} from '@/lib/api/aula-experimental.service';
import type {
  TrialClass,
  TrialMetrics,
  TrialStatus,
  TrialOrigin,
  CreateTrialRequest,
} from '@/lib/api/aula-experimental.service';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';
import { PlanGate } from '@/components/plans/PlanGate';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';

// ── Constants ──────────────────────────────────────────────────────────

const STATUS_LABEL: Record<TrialStatus, string> = {
  agendada: 'Agendada',
  confirmada: 'Confirmada',
  compareceu: 'Compareceu',
  nao_compareceu: 'Nao Compareceu',
  matriculou: 'Matriculou',
  desistiu: 'Desistiu',
};

const STATUS_COLOR: Record<TrialStatus, string> = {
  agendada: '#3B82F6',
  confirmada: '#22C55E',
  compareceu: '#059669',
  nao_compareceu: '#EF4444',
  matriculou: '#EAB308',
  desistiu: '#6B7280',
};

const ORIGEM_LABEL: Record<TrialOrigin, string> = {
  site: 'Site',
  indicacao: 'Indicacao',
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  presencial: 'Presencial',
};

const ORIGEM_COLOR: Record<TrialOrigin, string> = {
  site: '#3B82F6',
  indicacao: '#8B5CF6',
  instagram: '#E11D48',
  whatsapp: '#22C55E',
  presencial: '#F59E0B',
};

const ALL_STATUSES: TrialStatus[] = ['agendada', 'confirmada', 'compareceu', 'nao_compareceu', 'matriculou', 'desistiu'];
const ALL_ORIGENS: TrialOrigin[] = ['site', 'indicacao', 'instagram', 'whatsapp', 'presencial'];

const TURMAS = [
  { id: 'turma-1', nome: 'BJJ Fundamentos' },
  { id: 'turma-2', nome: 'BJJ All Levels' },
  { id: 'turma-3', nome: 'Judo Adulto' },
  { id: 'turma-4', nome: 'BJJ Noturno' },
];

// ── Page ───────────────────────────────────────────────────────────────

export default function AulaExperimentalPage() {
  const { toast } = useToast();
  const [trials, setTrials] = useState<TrialClass[]>([]);
  const [metrics, setMetrics] = useState<TrialMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<TrialStatus | ''>('');
  const [filterOrigem, setFilterOrigem] = useState<TrialOrigin | ''>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState<CreateTrialRequest>({
    leadNome: '',
    leadEmail: '',
    leadTelefone: '',
    leadOrigem: 'site',
    turmaId: 'turma-1',
    dataAgendada: '',
  });

  useEffect(() => {
    async function load() {
      try {
        const [trialList, trialMetrics] = await Promise.all([
          listTrialClasses(getActiveAcademyId()),
          getTrialMetrics(getActiveAcademyId()),
        ]);
        setTrials(trialList);
        setMetrics(trialMetrics);
      } catch (err) {
        toast(translateError(err), 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Actions ────────────────────────────────────────────────────────

  async function handleStatusChange(id: string, newStatus: TrialStatus) {
    try {
      const updated = await updateTrialStatus(id, newStatus);
      setTrials((prev) => prev.map((t) => (t.id === id ? updated : t)));
      toast(`Status atualizado para ${STATUS_LABEL[newStatus]}`, 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  async function handleCreate() {
    if (!form.leadNome || !form.dataAgendada) {
      toast('Preencha nome e data/hora', 'error');
      return;
    }
    try {
      const created = await createTrialClass(getActiveAcademyId(), form);
      setTrials((prev) => [created, ...prev]);
      setShowCreateModal(false);
      setForm({ leadNome: '', leadEmail: '', leadTelefone: '', leadOrigem: 'site', turmaId: 'turma-1', dataAgendada: '' });
      toast('Aula experimental agendada com sucesso', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  // ── Filter ─────────────────────────────────────────────────────────

  const filteredTrials = trials.filter((t) => {
    if (filterStatus && t.status !== filterStatus) return false;
    if (filterOrigem && t.leadOrigem !== filterOrigem) return false;
    return true;
  });

  // ── Skeleton ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton variant="text" className="h-8 w-64" />
        <Skeleton variant="card" className="h-24" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="card" className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  // ── Funnel helpers ─────────────────────────────────────────────────

  const funnelSteps = metrics
    ? [
        { label: 'Agendadas', value: metrics.agendadas, color: '#3B82F6' },
        { label: 'Confirmadas', value: metrics.confirmadas, color: '#22C55E' },
        { label: 'Compareceram', value: metrics.compareceram, color: '#059669' },
        { label: 'Matricularam', value: metrics.matricularam, color: '#EAB308' },
      ]
    : [];

  function funnelPercent(from: number, to: number): string {
    if (from === 0) return '0%';
    return `${Math.round((to / from) * 100)}%`;
  }

  return (
    <PlanGate module="landing_page">
    <div className="space-y-6 p-6">
      {/* Funnel Section */}
      {metrics && (
        <Card className="p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
              Funil de Conversao
            </h2>
            <span
              className="text-lg font-bold"
              style={{ color: 'var(--bb-brand)' }}
            >
              {metrics.taxaConversao}% conversao
            </span>
          </div>

          {/* Desktop funnel */}
          <div className="hidden items-center gap-2 md:flex">
            {funnelSteps.map((step, i) => (
              <div key={step.label} className="flex flex-1 items-center gap-2">
                <div className="flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                      {step.label}
                    </span>
                    <span className="text-sm font-bold" style={{ color: step.color }}>
                      {step.value}
                    </span>
                  </div>
                  <div
                    className="h-3 w-full overflow-hidden"
                    style={{ borderRadius: 'var(--bb-radius-sm)', background: 'var(--bb-depth-4)' }}
                  >
                    <div
                      className="h-full transition-all"
                      style={{
                        width: funnelSteps[0].value > 0 ? `${(step.value / funnelSteps[0].value) * 100}%` : '0%',
                        background: step.color,
                        borderRadius: 'var(--bb-radius-sm)',
                      }}
                    />
                  </div>
                </div>
                {i < funnelSteps.length - 1 && (
                  <span
                    className="shrink-0 text-xs font-bold"
                    style={{ color: 'var(--bb-ink-60)' }}
                  >
                    {funnelPercent(funnelSteps[i].value, funnelSteps[i + 1].value)}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Mobile funnel */}
          <div className="space-y-3 md:hidden">
            {funnelSteps.map((step, i) => (
              <div key={step.label}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                    {step.label}
                  </span>
                  <span className="text-sm font-bold" style={{ color: step.color }}>
                    {step.value}
                  </span>
                </div>
                <div
                  className="h-3 w-full overflow-hidden"
                  style={{ borderRadius: 'var(--bb-radius-sm)', background: 'var(--bb-depth-4)' }}
                >
                  <div
                    className="h-full transition-all"
                    style={{
                      width: funnelSteps[0].value > 0 ? `${(step.value / funnelSteps[0].value) * 100}%` : '0%',
                      background: step.color,
                      borderRadius: 'var(--bb-radius-sm)',
                    }}
                  />
                </div>
                {i < funnelSteps.length - 1 && (
                  <div className="mt-1 text-center">
                    <span className="text-[10px] font-bold" style={{ color: 'var(--bb-ink-40)' }}>
                      {funnelPercent(funnelSteps[i].value, funnelSteps[i + 1].value)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
          Aulas Experimentais
        </h1>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          Nova Aula
        </Button>
      </div>

      {/* Filters */}
      <Card className="space-y-3 p-4">
        {/* Status filter */}
        <div>
          <p className="mb-2 text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
            Status
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus('')}
              className="px-3 py-1 text-xs font-medium transition-colors"
              style={{
                borderRadius: 'var(--bb-radius-sm)',
                background: filterStatus === '' ? 'var(--bb-brand)' : 'var(--bb-depth-4)',
                color: filterStatus === '' ? '#fff' : 'var(--bb-ink-60)',
              }}
            >
              Todas
            </button>
            {ALL_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
                className="px-3 py-1 text-xs font-medium transition-colors"
                style={{
                  borderRadius: 'var(--bb-radius-sm)',
                  background: filterStatus === s ? STATUS_COLOR[s] : 'var(--bb-depth-4)',
                  color: filterStatus === s ? '#fff' : 'var(--bb-ink-60)',
                }}
              >
                {STATUS_LABEL[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Origem filter */}
        <div>
          <p className="mb-2 text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
            Origem
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterOrigem('')}
              className="px-3 py-1 text-xs font-medium transition-colors"
              style={{
                borderRadius: 'var(--bb-radius-sm)',
                background: filterOrigem === '' ? 'var(--bb-brand)' : 'var(--bb-depth-4)',
                color: filterOrigem === '' ? '#fff' : 'var(--bb-ink-60)',
              }}
            >
              Todas
            </button>
            {ALL_ORIGENS.map((o) => (
              <button
                key={o}
                onClick={() => setFilterOrigem(filterOrigem === o ? '' : o)}
                className="px-3 py-1 text-xs font-medium transition-colors"
                style={{
                  borderRadius: 'var(--bb-radius-sm)',
                  background: filterOrigem === o ? ORIGEM_COLOR[o] : 'var(--bb-depth-4)',
                  color: filterOrigem === o ? '#fff' : 'var(--bb-ink-60)',
                }}
              >
                {ORIGEM_LABEL[o]}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Trial Cards (Mobile) */}
      <div className="space-y-3 md:hidden">
        {filteredTrials.map((trial) => (
          <TrialCard
            key={trial.id}
            trial={trial}
            onStatusChange={handleStatusChange}
          />
        ))}
        {filteredTrials.length === 0 && (
          <div className="py-8 text-center text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Nenhuma aula experimental encontrada
          </div>
        )}
      </div>

      {/* Trial Table (Desktop) */}
      <Card className="hidden overflow-hidden p-0 md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                {['Lead', 'Origem', 'Turma', 'Data', 'Status', 'Follow-up', 'Acoes'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium"
                    style={{ color: 'var(--bb-ink-60)', background: 'var(--bb-depth-4)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTrials.map((trial) => (
                <tr
                  key={trial.id}
                  style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bb-depth-4)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium" style={{ color: 'var(--bb-ink-100)' }}>{trial.leadNome}</p>
                    <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>{trial.leadEmail}</p>
                    <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>{trial.leadTelefone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-block px-2 py-0.5 text-[10px] font-medium text-white"
                      style={{ borderRadius: 'var(--bb-radius-sm)', background: ORIGEM_COLOR[trial.leadOrigem] }}
                    >
                      {ORIGEM_LABEL[trial.leadOrigem]}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--bb-ink-80)' }}>{trial.turmaNome}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--bb-ink-80)' }}>
                    {new Date(trial.dataAgendada).toLocaleDateString('pt-BR')}
                    <br />
                    <span className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                      {new Date(trial.dataAgendada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-block px-2 py-0.5 text-[10px] font-bold"
                      style={{
                        borderRadius: 'var(--bb-radius-sm)',
                        background: `${STATUS_COLOR[trial.status]}20`,
                        color: STATUS_COLOR[trial.status],
                      }}
                    >
                      {STATUS_LABEL[trial.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs"
                      style={{ color: trial.followUpEnviado ? 'var(--bb-success)' : 'var(--bb-ink-40)' }}
                    >
                      {trial.followUpEnviado ? 'Enviado' : 'Pendente'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <TrialActions trial={trial} onStatusChange={handleStatusChange} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTrials.length === 0 && (
            <div className="py-8 text-center text-sm" style={{ color: 'var(--bb-ink-60)' }}>
              Nenhuma aula experimental encontrada
            </div>
          )}
        </div>
      </Card>

      {/* Create Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nova Aula Experimental"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
              Nome
            </label>
            <input
              type="text"
              value={form.leadNome}
              onChange={(e) => setForm({ ...form, leadNome: e.target.value })}
              className="w-full px-3 py-2 text-sm"
              style={{
                borderRadius: 'var(--bb-radius-sm)',
                background: 'var(--bb-depth-4)',
                color: 'var(--bb-ink-100)',
                border: '1px solid var(--bb-glass-border)',
              }}
              placeholder="Nome do lead"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
              Email
            </label>
            <input
              type="email"
              value={form.leadEmail}
              onChange={(e) => setForm({ ...form, leadEmail: e.target.value })}
              className="w-full px-3 py-2 text-sm"
              style={{
                borderRadius: 'var(--bb-radius-sm)',
                background: 'var(--bb-depth-4)',
                color: 'var(--bb-ink-100)',
                border: '1px solid var(--bb-glass-border)',
              }}
              placeholder="email@exemplo.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
              Telefone
            </label>
            <input
              type="tel"
              value={form.leadTelefone}
              onChange={(e) => setForm({ ...form, leadTelefone: e.target.value })}
              className="w-full px-3 py-2 text-sm"
              style={{
                borderRadius: 'var(--bb-radius-sm)',
                background: 'var(--bb-depth-4)',
                color: 'var(--bb-ink-100)',
                border: '1px solid var(--bb-glass-border)',
              }}
              placeholder="(11) 99999-9999"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
              Origem
            </label>
            <select
              value={form.leadOrigem}
              onChange={(e) => setForm({ ...form, leadOrigem: e.target.value as TrialOrigin })}
              className="w-full px-3 py-2 text-sm"
              style={{
                borderRadius: 'var(--bb-radius-sm)',
                background: 'var(--bb-depth-4)',
                color: 'var(--bb-ink-100)',
                border: '1px solid var(--bb-glass-border)',
              }}
            >
              {ALL_ORIGENS.map((o) => (
                <option key={o} value={o}>{ORIGEM_LABEL[o]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
              Turma
            </label>
            <select
              value={form.turmaId}
              onChange={(e) => setForm({ ...form, turmaId: e.target.value })}
              className="w-full px-3 py-2 text-sm"
              style={{
                borderRadius: 'var(--bb-radius-sm)',
                background: 'var(--bb-depth-4)',
                color: 'var(--bb-ink-100)',
                border: '1px solid var(--bb-glass-border)',
              }}
            >
              {TURMAS.map((t) => (
                <option key={t.id} value={t.id}>{t.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
              Data/Hora
            </label>
            <input
              type="datetime-local"
              value={form.dataAgendada}
              onChange={(e) => setForm({ ...form, dataAgendada: e.target.value })}
              className="w-full px-3 py-2 text-sm"
              style={{
                borderRadius: 'var(--bb-radius-sm)',
                background: 'var(--bb-depth-4)',
                color: 'var(--bb-ink-100)',
                border: '1px solid var(--bb-glass-border)',
              }}
            />
          </div>
          <Button variant="primary" className="w-full" onClick={handleCreate}>
            Agendar
          </Button>
        </div>
      </Modal>
    </div>
    </PlanGate>
  );
}

// ── Trial Card (Mobile) ──────────────────────────────────────────────

function TrialCard({
  trial,
  onStatusChange,
}: {
  trial: TrialClass;
  onStatusChange: (id: string, status: TrialStatus) => void;
}) {
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="font-medium" style={{ color: 'var(--bb-ink-100)' }}>{trial.leadNome}</p>
          <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>{trial.leadEmail}</p>
          <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>{trial.leadTelefone}</p>
        </div>
        <span
          className="inline-block px-2 py-0.5 text-[10px] font-medium text-white"
          style={{ borderRadius: 'var(--bb-radius-sm)', background: ORIGEM_COLOR[trial.leadOrigem] }}
        >
          {ORIGEM_LABEL[trial.leadOrigem]}
        </span>
      </div>

      <div className="mb-3 flex items-center gap-3 text-xs" style={{ color: 'var(--bb-ink-80)' }}>
        <span>{trial.turmaNome}</span>
        <span>|</span>
        <span>{new Date(trial.dataAgendada).toLocaleDateString('pt-BR')}</span>
        <span>{new Date(trial.dataAgendada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <span
          className="inline-block px-2 py-0.5 text-[10px] font-bold"
          style={{
            borderRadius: 'var(--bb-radius-sm)',
            background: `${STATUS_COLOR[trial.status]}20`,
            color: STATUS_COLOR[trial.status],
          }}
        >
          {STATUS_LABEL[trial.status]}
        </span>
        <span
          className="text-[10px]"
          style={{ color: trial.followUpEnviado ? 'var(--bb-success)' : 'var(--bb-ink-40)' }}
        >
          Follow-up: {trial.followUpEnviado ? 'Enviado' : 'Pendente'}
        </span>
      </div>

      <TrialActions trial={trial} onStatusChange={onStatusChange} />
    </Card>
  );
}

// ── Trial Actions ────────────────────────────────────────────────────

function TrialActions({
  trial,
  onStatusChange,
}: {
  trial: TrialClass;
  onStatusChange: (id: string, status: TrialStatus) => void;
}) {
  const { status, id } = trial;

  if (status === 'matriculou' || status === 'desistiu') return null;

  return (
    <div className="flex flex-wrap gap-2">
      {status === 'agendada' && (
        <>
          <Button size="sm" variant="primary" onClick={() => onStatusChange(id, 'confirmada')}>
            Confirmar
          </Button>
          <Button size="sm" variant="danger" onClick={() => onStatusChange(id, 'desistiu')}>
            Cancelar
          </Button>
        </>
      )}
      {status === 'confirmada' && (
        <>
          <Button size="sm" variant="primary" onClick={() => onStatusChange(id, 'compareceu')}>
            Check-in
          </Button>
          <Button size="sm" variant="danger" onClick={() => onStatusChange(id, 'nao_compareceu')}>
            Nao compareceu
          </Button>
        </>
      )}
      {status === 'compareceu' && (
        <>
          <Button size="sm" variant="primary" onClick={() => onStatusChange(id, 'matriculou')}>
            Matricular
          </Button>
          <Button size="sm" variant="secondary" onClick={() => onStatusChange(id, 'compareceu')}>
            Follow-up
          </Button>
        </>
      )}
      {status === 'nao_compareceu' && (
        <Button size="sm" variant="secondary" onClick={() => onStatusChange(id, 'agendada')}>
          Reagendar
        </Button>
      )}
    </div>
  );
}
