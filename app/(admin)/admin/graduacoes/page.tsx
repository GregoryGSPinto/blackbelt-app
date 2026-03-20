'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import { BeltLevel } from '@/lib/types/domain';
import type { BeltPromotion, GraduationHistoryItem } from '@/lib/types/graduation';
import {
  listPending,
  approvePromotion,
  rejectPromotion,
  listGraduationHistory,
} from '@/lib/api/graduation.service';
import { PlanGate } from '@/components/plans/PlanGate';
import { translateError } from '@/lib/utils/error-translator';

// ── Constants ───────────────────────────────────────────────────────────

const ACADEMY_ID = 'academy-bb-001';

type TabKey = 'pending' | 'history';

const BELT_LABELS: Record<string, string> = {
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

const BELT_COLORS: Record<string, string> = {
  [BeltLevel.White]: '#f8fafc',
  [BeltLevel.Gray]: '#9ca3af',
  [BeltLevel.Yellow]: '#facc15',
  [BeltLevel.Orange]: '#f97316',
  [BeltLevel.Green]: '#22c55e',
  [BeltLevel.Blue]: '#3b82f6',
  [BeltLevel.Purple]: '#a855f7',
  [BeltLevel.Brown]: '#92400e',
  [BeltLevel.Black]: '#1e1e1e',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatDateFull(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

// ── Belt badge component ────────────────────────────────────────────────

function BeltBadge({ belt }: { belt: BeltLevel }) {
  const color = BELT_COLORS[belt];
  const isLight = belt === BeltLevel.White || belt === BeltLevel.Yellow;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{
        background: color,
        color: isLight ? '#1a1a1a' : '#ffffff',
        border: belt === BeltLevel.White ? '1px solid var(--bb-glass-border)' : 'none',
      }}
    >
      {BELT_LABELS[belt]}
    </span>
  );
}

// ── Criteria indicator ──────────────────────────────────────────────────

function CriteriaIndicator({
  label,
  required,
  current,
  met,
  unit,
}: {
  label: string;
  required: number;
  current: number;
  met: boolean;
  unit: string;
}) {
  const percent = Math.min((current / required) * 100, 100);
  return (
    <div className="flex-1 min-w-[120px]">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium" style={{ color: 'var(--bb-ink-80)' }}>
          {label}
        </span>
        <span className="text-xs font-bold" style={{ color: met ? '#22c55e' : '#ef4444' }}>
          {met ? '\u2705' : '\u274C'}
        </span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full"
        style={{ background: 'var(--bb-depth-4)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percent}%`,
            background: met ? '#22c55e' : percent >= 70 ? '#f59e0b' : '#ef4444',
          }}
        />
      </div>
      <div className="mt-0.5 flex justify-between">
        <span className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>
          {current}{unit}
        </span>
        <span className="text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>
          {required}{unit}
        </span>
      </div>
    </div>
  );
}

// ── Certificate preview ─────────────────────────────────────────────────

function CertificatePreview({
  studentName,
  fromBelt,
  toBelt,
  approvedByName,
  approvedAt,
}: {
  studentName: string;
  fromBelt: BeltLevel;
  toBelt: BeltLevel;
  approvedByName: string;
  approvedAt: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-xl p-6 sm:p-8 text-center"
      style={{
        background: 'linear-gradient(135deg, var(--bb-depth-2) 0%, var(--bb-depth-3) 100%)',
        border: '2px solid var(--bb-brand)',
        boxShadow: 'var(--bb-shadow-lg)',
      }}
    >
      {/* Decorative corners */}
      <div
        className="absolute left-0 top-0 h-16 w-16"
        style={{
          borderTop: '3px solid var(--bb-brand)',
          borderLeft: '3px solid var(--bb-brand)',
          borderRadius: 'var(--bb-radius-lg) 0 0 0',
          opacity: 0.5,
        }}
      />
      <div
        className="absolute right-0 bottom-0 h-16 w-16"
        style={{
          borderBottom: '3px solid var(--bb-brand)',
          borderRight: '3px solid var(--bb-brand)',
          borderRadius: '0 0 var(--bb-radius-lg) 0',
          opacity: 0.5,
        }}
      />

      <p
        className="text-xs font-semibold uppercase tracking-[0.2em]"
        style={{ color: 'var(--bb-brand)' }}
      >
        Certificado de Graduacao
      </p>
      <h3
        className="mt-3 text-xl font-bold sm:text-2xl"
        style={{ color: 'var(--bb-ink-100)' }}
      >
        {studentName}
      </h3>
      <p className="mt-2 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
        promovido de
      </p>
      <div className="mt-2 flex items-center justify-center gap-3">
        <BeltBadge belt={fromBelt} />
        <span style={{ color: 'var(--bb-ink-40)' }}>&rarr;</span>
        <BeltBadge belt={toBelt} />
      </div>
      <div
        className="mx-auto mt-4 h-px w-32"
        style={{ background: 'var(--bb-glass-border)' }}
      />
      <p className="mt-3 text-xs" style={{ color: 'var(--bb-ink-60)' }}>
        Aprovado por <span style={{ color: 'var(--bb-ink-100)' }}>{approvedByName}</span>
      </p>
      <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
        {formatDateFull(approvedAt)}
      </p>
      <p
        className="mt-3 text-[10px] font-bold uppercase tracking-widest"
        style={{
          color: 'var(--bb-brand)',
          filter: 'drop-shadow(0 0 4px var(--bb-brand))',
        }}
      >
        Guerreiros BJJ
      </p>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────

export default function GraduacoesPage() {
  const { toast } = useToast();

  const [tab, setTab] = useState<TabKey>('pending');
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<BeltPromotion[]>([]);
  const [history, setHistory] = useState<GraduationHistoryItem[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Certificate modal
  const [certItem, setCertItem] = useState<GraduationHistoryItem | null>(null);

  // Confirm modal
  const [confirmAction, setConfirmAction] = useState<{
    type: 'approve' | 'reject';
    promo: BeltPromotion;
  } | null>(null);

  // Animation refs
  const listRef = useRef<HTMLDivElement>(null);

  // ── Load data ──────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    try {
      const [pendingList, historyList] = await Promise.all([
        listPending(ACADEMY_ID),
        listGraduationHistory(ACADEMY_ID),
      ]);
      setPending(pendingList);
      setHistory(historyList);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Actions ────────────────────────────────────────────────────────

  async function handleApprove(promo: BeltPromotion) {
    setActionLoading(promo.id);
    try {
      await approvePromotion(promo.id);
      setPending((prev) => prev.filter((p) => p.id !== promo.id));
      const newHistory = await listGraduationHistory(ACADEMY_ID);
      setHistory(newHistory);
      toast('Graduacao aprovada com sucesso!', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setActionLoading(null);
      setConfirmAction(null);
    }
  }

  async function handleReject(promo: BeltPromotion) {
    setActionLoading(promo.id);
    try {
      await rejectPromotion(promo.id);
      setPending((prev) => prev.filter((p) => p.id !== promo.id));
      toast('Graduacao rejeitada.', 'info');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setActionLoading(null);
      setConfirmAction(null);
    }
  }

  // ── Loading state ──────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        <Skeleton variant="text" className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton variant="text" className="h-10 w-32" />
          <Skeleton variant="text" className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="card" className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  // ── Tabs ───────────────────────────────────────────────────────────

  const tabs: Array<{ key: TabKey; label: string; count: number }> = [
    { key: 'pending', label: 'Pendentes', count: pending.length },
    { key: 'history', label: 'Historico', count: history.length },
  ];

  return (
    <PlanGate module="graduacoes">
      <div className="space-y-6 p-4 sm:p-6 animate-reveal">
        {/* Header */}
        <div>
          <h1
            className="text-xl font-bold sm:text-2xl"
            style={{ color: 'var(--bb-ink-100)' }}
          >
            Graduacoes
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Gerencie promocoes de faixa e historico de graduacoes
          </p>
        </div>

        {/* Tab Selector */}
        <div
          className="flex gap-1 rounded-xl p-1"
          style={{
            background: 'var(--bb-depth-2)',
            border: '1px solid var(--bb-glass-border)',
          }}
        >
          {tabs.map((t) => {
            const isActive = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all"
                style={{
                  background: isActive ? 'var(--bb-depth-4)' : 'transparent',
                  color: isActive ? 'var(--bb-ink-100)' : 'var(--bb-ink-60)',
                  boxShadow: isActive ? 'var(--bb-shadow-sm)' : 'none',
                }}
              >
                {t.label}
                <span
                  className="rounded-full px-2 py-0.5 text-xs"
                  style={{
                    background: isActive ? 'var(--bb-brand)' : 'var(--bb-depth-4)',
                    color: isActive ? '#fff' : 'var(--bb-ink-60)',
                  }}
                >
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ─── Pending Tab ──────────────────────────────────────────── */}
        {tab === 'pending' && (
          <div ref={listRef} className="space-y-4">
            {pending.length === 0 ? (
              <div
                className="py-16 text-center rounded-xl"
                style={{
                  background: 'var(--bb-depth-2)',
                  border: '1px solid var(--bb-glass-border)',
                }}
              >
                <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>
                  Nenhuma graduacao pendente no momento.
                </p>
              </div>
            ) : (
              pending.map((promo, index) => {
                const allMet =
                  promo.criteria_met.attendance.met &&
                  promo.criteria_met.months.met &&
                  promo.criteria_met.quiz_avg.met;
                return (
                  <Card
                    key={promo.id}
                    className="p-4 sm:p-5"
                    style={{
                      animationDelay: `${index * 80}ms`,
                    }}
                    data-stagger={index}
                  >
                    {/* Header */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                          style={{
                            background: 'var(--bb-brand-surface)',
                            color: 'var(--bb-brand)',
                          }}
                        >
                          {promo.student_name.charAt(0)}
                        </div>
                        <div>
                          <h3
                            className="font-semibold"
                            style={{ color: 'var(--bb-ink-100)' }}
                          >
                            {promo.student_name}
                          </h3>
                          <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                            Proposto por {promo.proposed_by_name} em{' '}
                            {formatDate(promo.proposed_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <BeltBadge belt={promo.from_belt} />
                        <span style={{ color: 'var(--bb-ink-40)' }}>&rarr;</span>
                        <BeltBadge belt={promo.to_belt} />
                      </div>
                    </div>

                    {/* Criteria */}
                    <div
                      className="mt-4 rounded-lg p-3 sm:p-4"
                      style={{
                        background: 'var(--bb-depth-2)',
                        border: '1px solid var(--bb-glass-border)',
                      }}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span
                          className="text-xs font-semibold uppercase tracking-wide"
                          style={{ color: 'var(--bb-ink-60)' }}
                        >
                          Criterios de Promocao
                        </span>
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                          style={{
                            background: allMet
                              ? 'rgba(34,197,94,0.15)'
                              : 'rgba(239,68,68,0.15)',
                            color: allMet ? '#22c55e' : '#ef4444',
                          }}
                        >
                          {allMet ? 'Todos atendidos' : 'Pendencias'}
                        </span>
                      </div>
                      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                        <CriteriaIndicator
                          label="Presencas"
                          required={promo.criteria_met.attendance.required}
                          current={promo.criteria_met.attendance.current}
                          met={promo.criteria_met.attendance.met}
                          unit=""
                        />
                        <CriteriaIndicator
                          label="Meses"
                          required={promo.criteria_met.months.required}
                          current={promo.criteria_met.months.current}
                          met={promo.criteria_met.months.met}
                          unit="m"
                        />
                        <CriteriaIndicator
                          label="Media Quiz"
                          required={promo.criteria_met.quiz_avg.required}
                          current={promo.criteria_met.quiz_avg.current}
                          met={promo.criteria_met.quiz_avg.met}
                          unit="%"
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={actionLoading === promo.id}
                        onClick={() =>
                          setConfirmAction({ type: 'reject', promo })
                        }
                      >
                        Rejeitar
                      </Button>
                      <Button
                        size="sm"
                        disabled={actionLoading === promo.id}
                        loading={actionLoading === promo.id}
                        onClick={() =>
                          setConfirmAction({ type: 'approve', promo })
                        }
                      >
                        Aprovar Graduacao
                      </Button>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* ─── History Tab ──────────────────────────────────────────── */}
        {tab === 'history' && (
          <div className="space-y-4">
            {history.length === 0 ? (
              <div
                className="py-16 text-center rounded-xl"
                style={{
                  background: 'var(--bb-depth-2)',
                  border: '1px solid var(--bb-glass-border)',
                }}
              >
                <p className="text-sm" style={{ color: 'var(--bb-ink-40)' }}>
                  Nenhuma graduacao registrada ainda.
                </p>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div
                  className="absolute left-5 top-0 bottom-0 hidden w-px sm:block"
                  style={{ background: 'var(--bb-glass-border)' }}
                />

                {history.map((item, index) => (
                  <div
                    key={item.id}
                    className="relative flex gap-4 pb-6 animate-reveal"
                    style={{ animationDelay: `${index * 80}ms` }}
                    data-stagger={index}
                  >
                    {/* Timeline dot */}
                    <div className="relative z-10 hidden sm:block">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full"
                        style={{
                          background: BELT_COLORS[item.to_belt],
                          border: '3px solid var(--bb-depth-1)',
                          boxShadow: 'var(--bb-shadow-sm)',
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke={
                            item.to_belt === BeltLevel.White ||
                            item.to_belt === BeltLevel.Yellow
                              ? '#1a1a1a'
                              : '#ffffff'
                          }
                          strokeWidth={2}
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    </div>

                    {/* Card */}
                    <Card className="flex-1 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h4
                            className="font-semibold"
                            style={{ color: 'var(--bb-ink-100)' }}
                          >
                            {item.student_name}
                          </h4>
                          <div className="mt-1 flex items-center gap-2">
                            <BeltBadge belt={item.from_belt} />
                            <span style={{ color: 'var(--bb-ink-40)' }}>&rarr;</span>
                            <BeltBadge belt={item.to_belt} />
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                            {formatDate(item.approved_at)}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                            por {item.approved_by_name}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => setCertItem(item)}
                          className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                          style={{
                            background: 'var(--bb-brand-surface)',
                            color: 'var(--bb-brand)',
                            border: '1px solid var(--bb-brand)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--bb-brand)';
                            e.currentTarget.style.color = '#fff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'var(--bb-brand-surface)';
                            e.currentTarget.style.color = 'var(--bb-brand)';
                          }}
                        >
                          Ver Certificado
                        </button>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── Confirm Action Modal ─────────────────────────────────── */}
        <Modal
          open={!!confirmAction}
          onClose={() => setConfirmAction(null)}
          title={
            confirmAction?.type === 'approve'
              ? 'Aprovar Graduacao'
              : 'Rejeitar Graduacao'
          }
        >
          {confirmAction && (
            <div className="space-y-4">
              <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                {confirmAction.type === 'approve'
                  ? `Confirma a promocao de ${confirmAction.promo.student_name} de faixa ${BELT_LABELS[confirmAction.promo.from_belt]} para ${BELT_LABELS[confirmAction.promo.to_belt]}?`
                  : `Tem certeza que deseja rejeitar a promocao de ${confirmAction.promo.student_name}?`}
              </p>

              {confirmAction.type === 'approve' && (
                <div
                  className="rounded-lg p-3"
                  style={{
                    background: 'var(--bb-depth-2)',
                    border: '1px solid var(--bb-glass-border)',
                  }}
                >
                  <div className="flex items-center justify-center gap-3">
                    <BeltBadge belt={confirmAction.promo.from_belt} />
                    <span style={{ color: 'var(--bb-ink-40)' }}>&rarr;</span>
                    <BeltBadge belt={confirmAction.promo.to_belt} />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setConfirmAction(null)}
                >
                  Cancelar
                </Button>
                <Button
                  variant={confirmAction.type === 'approve' ? 'primary' : 'danger'}
                  className="flex-1"
                  loading={actionLoading === confirmAction.promo.id}
                  onClick={() =>
                    confirmAction.type === 'approve'
                      ? handleApprove(confirmAction.promo)
                      : handleReject(confirmAction.promo)
                  }
                >
                  {confirmAction.type === 'approve' ? 'Aprovar' : 'Rejeitar'}
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* ─── Certificate Modal ────────────────────────────────────── */}
        <Modal
          open={!!certItem}
          onClose={() => setCertItem(null)}
          title="Certificado de Graduacao"
        >
          {certItem && (
            <div className="space-y-4">
              <CertificatePreview
                studentName={certItem.student_name}
                fromBelt={certItem.from_belt}
                toBelt={certItem.to_belt}
                approvedByName={certItem.approved_by_name}
                approvedAt={certItem.approved_at}
              />
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setCertItem(null)}
                >
                  Fechar
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => toast('PDF sera gerado em breve!', 'info')}
                >
                  Gerar PDF
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </PlanGate>
  );
}
