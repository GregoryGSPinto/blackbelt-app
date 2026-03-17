'use client';

import { useState, useEffect } from 'react';
import {
  getBillingSummary,
  getPlans,
  getInvoices,
  getAlerts,
  getOverageProjection,
  dismissAlert,
  requestUpgrade,
  requestDowngrade,
} from '@/lib/api/billing.service';
import { handleServiceError } from '@/lib/api/errors';
import type {
  BillingSummary,
  PlanDefinition,
  BillingInvoice,
  UsageAlert,
  UsageMetric,
  OverageProjection,
} from '@/lib/types/billing';
import { Skeleton } from '@/components/ui/Skeleton';

// ── Helpers ──────────────────────────────────────────────────────────

function centsToReais(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

function getBarColor(percent: number): string {
  if (percent >= 100) return '#EF4444';
  if (percent >= 90) return '#F97316';
  if (percent >= 80) return '#F59E0B';
  return '#22C55E';
}

function getStatusIcon(status: UsageMetric['status']): string {
  switch (status) {
    case 'exceeded': return '\uD83D\uDD34';
    case 'critical': return '\uD83D\uDD36';
    case 'warning': return '\u26A0\uFE0F';
    default: return '\u2705';
  }
}

function getStatusLabel(status: UsageMetric['status']): string {
  switch (status) {
    case 'exceeded': return 'Excedido';
    case 'critical': return 'Critico — proximo do limite';
    case 'warning': return 'Alerta — proximo do limite';
    default: return 'Normal';
  }
}

function getSupportLabel(level: PlanDefinition['support_level']): string {
  switch (level) {
    case 'email': return 'Email';
    case 'email_chat': return 'Email + Chat';
    case 'priority': return 'Prioritario';
    case 'dedicated': return 'Dedicado';
    case 'account_manager': return 'Gerente de Conta';
  }
}

function getOverageCentsForResource(
  plan: PlanDefinition,
  resource: UsageMetric['resource'],
): number {
  switch (resource) {
    case 'students': return plan.overage.student_cents;
    case 'professors': return plan.overage.professor_cents;
    case 'classes': return plan.overage.class_cents;
    case 'storage_gb': return plan.overage.storage_gb_cents;
  }
}

function getOverageLabel(resource: UsageMetric['resource']): string {
  switch (resource) {
    case 'students': return 'aluno';
    case 'professors': return 'prof';
    case 'classes': return 'turma';
    case 'storage_gb': return 'GB';
  }
}

// ── Loading skeleton ────────────────────────────────────────────────
function PlanPageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton variant="text" className="h-8 w-64" />
      <Skeleton variant="text" className="h-4 w-48" />
      <Skeleton variant="card" className="h-48" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="card" className="h-40" />
        ))}
      </div>
      <Skeleton variant="card" className="h-48" />
      <Skeleton variant="card" className="h-64" />
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────

export default function AdminPlanoPage() {
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [plans, setPlans] = useState<PlanDefinition[]>([]);
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [alerts, setAlerts] = useState<UsageAlert[]>([]);
  const [projection, setProjection] = useState<OverageProjection | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedInvoice, setExpandedInvoice] = useState<string | null>(null);
  const [showPlans, setShowPlans] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [s, p, inv, al, proj] = await Promise.all([
          getBillingSummary('academy-1'),
          getPlans(),
          getInvoices('academy-1'),
          getAlerts('academy-1'),
          getOverageProjection('academy-1'),
        ]);
        setSummary(s);
        setPlans(p);
        setInvoices(inv);
        setAlerts(al);
        setProjection(proj);
      } catch (error) {
        handleServiceError(error, 'billing.page');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleDismissAlert(alertId: string) {
    try {
      await dismissAlert(alertId);
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    } catch (error) {
      handleServiceError(error, 'billing.dismissAlert');
    }
  }

  async function handleUpgrade(planSlug: string) {
    try {
      const result = await requestUpgrade('academy-1', planSlug);
      if (result.success) {
        alert(`Upgrade para ${planSlug} solicitado com sucesso!`);
      }
    } catch (error) {
      handleServiceError(error, 'billing.upgrade');
    }
  }

  async function handleDowngrade(planSlug: string) {
    try {
      const result = await requestDowngrade('academy-1', planSlug);
      if (result.success) {
        alert(`Downgrade para ${planSlug} sera aplicado no proximo ciclo.`);
      }
    } catch (error) {
      handleServiceError(error, 'billing.downgrade');
    }
  }

  if (loading || !summary) return <PlanPageSkeleton />;

  const currentPlanIndex = plans.findIndex((p) => p.id === summary.plan.id);

  return (
    <div className="min-h-screen space-y-6 p-6" data-stagger>
      {/* ── Header ───────────────────────────────────────────────── */}
      <section className="animate-reveal">
        <h1
          className="font-display font-bold"
          style={{ fontSize: '28px', color: 'var(--bb-ink-100)' }}
        >
          Meu Plano & Uso
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          Monitore seu consumo e gerencie seu plano
        </p>
      </section>

      {/* ── Trial banner ─────────────────────────────────────────── */}
      {summary.trial.is_trial && (
        <section
          className="animate-reveal flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
          style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 'var(--bb-radius-lg)',
          }}
        >
          <div>
            <p className="text-sm font-semibold" style={{ color: '#F59E0B' }}>
              {'\u23F0'} Seu periodo de teste termina em {summary.trial.days_remaining} dias.
            </p>
            <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-80)' }}>
              Voce esta usando recursos do plano Black Belt gratuitamente.
              Escolha um plano para continuar.
            </p>
          </div>
          <button
            onClick={() => setShowPlans(true)}
            className="shrink-0 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: '#F59E0B' }}
          >
            Escolher Plano
          </button>
        </section>
      )}

      {/* ── Active alerts ────────────────────────────────────────── */}
      {alerts.length > 0 && (
        <section className="animate-reveal space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              style={{
                background: alert.level === 'exceeded'
                  ? 'rgba(239, 68, 68, 0.08)'
                  : alert.level === 'critical'
                    ? 'rgba(249, 115, 22, 0.08)'
                    : 'rgba(245, 158, 11, 0.08)',
                border: `1px solid ${alert.level === 'exceeded' ? 'rgba(239, 68, 68, 0.3)' : alert.level === 'critical' ? 'rgba(249, 115, 22, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                borderRadius: 'var(--bb-radius-md)',
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">
                  {alert.level === 'exceeded' ? '\uD83D\uDD34' : alert.level === 'critical' ? '\uD83D\uDD36' : '\u26A0\uFE0F'}
                </span>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                    {alert.message}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                    Ao atingir o limite, cada unidade extra sera cobrada no fim do mes.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPlans(true)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
                  style={{ background: 'var(--bb-brand)' }}
                >
                  Fazer Upgrade
                </button>
                <button
                  onClick={() => handleDismissAlert(alert.id)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                  style={{
                    background: 'var(--bb-depth-4)',
                    color: 'var(--bb-ink-80)',
                  }}
                >
                  Dispensar
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ── Current plan card ────────────────────────────────────── */}
      <section className="animate-reveal">
        <div
          className="p-6"
          style={{
            background: 'var(--bb-depth-2)',
            border: '1px solid var(--bb-glass-border)',
            borderRadius: 'var(--bb-radius-lg)',
          }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                  Seu plano: {summary.plan.name}
                  {summary.plan.is_popular && ' \u2B50'}
                </h2>
                {summary.trial.is_trial && (
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-bold text-white"
                    style={{ background: '#F59E0B' }}
                  >
                    TRIAL
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                {summary.plan.price_monthly > 0
                  ? `R$${centsToReais(summary.billing_cycle === 'monthly' ? summary.plan.price_monthly : summary.plan.price_yearly)}/${summary.billing_cycle === 'monthly' ? 'mes' : 'ano'} \u00B7 Ciclo ${summary.billing_cycle === 'monthly' ? 'mensal' : 'anual'}`
                  : 'Sob consulta'}
              </p>
              <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                Proxima cobranca: {new Date(summary.next_invoice_date).toLocaleDateString('pt-BR')}
              </p>

              {/* Modules */}
              <div className="mt-4 flex flex-wrap gap-3">
                {[
                  { key: 'streaming', label: 'Biblioteca' },
                  { key: 'store', label: 'Loja' },
                  { key: 'financial', label: 'Financeiro' },
                  { key: 'events', label: 'Eventos' },
                  { key: 'multi_branch', label: 'Multi-filial' },
                  { key: 'api', label: 'API' },
                ].map(({ key, label }) => {
                  const enabled = summary.plan.modules[key as keyof typeof summary.plan.modules];
                  return (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                      style={{
                        background: enabled ? 'rgba(34, 197, 94, 0.1)' : 'var(--bb-depth-4)',
                        color: enabled ? '#22C55E' : 'var(--bb-ink-40)',
                      }}
                    >
                      {enabled ? '\u2705' : '\u274C'} {label}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 sm:items-end">
              {summary.billing_cycle === 'monthly' && summary.plan.price_monthly > 0 && (
                <button
                  className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                  style={{
                    background: 'var(--bb-depth-4)',
                    color: 'var(--bb-ink-80)',
                  }}
                >
                  Mudar para Anual (20% off)
                </button>
              )}
              <button
                onClick={() => setShowPlans(true)}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: 'var(--bb-brand)' }}
              >
                Fazer Upgrade
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Usage bars ───────────────────────────────────────────── */}
      <section className="animate-reveal">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" data-stagger>
          {summary.usage.map((metric) => {
            const barPercent = Math.min(metric.percent, 100);
            const barColor = getBarColor(metric.percent);
            const overageCents = getOverageCentsForResource(summary.plan, metric.resource);
            const overageLabel = getOverageLabel(metric.resource);

            return (
              <div
                key={metric.resource}
                className="p-5"
                style={{
                  background: 'var(--bb-depth-2)',
                  border: `1px solid ${metric.status !== 'normal' ? barColor + '40' : 'var(--bb-glass-border)'}`,
                  borderRadius: 'var(--bb-radius-lg)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                    {metric.icon} {metric.label}
                  </span>
                  <span className="text-sm font-mono font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                    {metric.resource === 'storage_gb' ? metric.current.toFixed(1) : metric.current}
                    {metric.limit === -1 ? '' : ` / ${metric.limit}`}
                    {metric.resource === 'storage_gb' ? ' GB' : ''}
                  </span>
                </div>

                {/* Progress bar */}
                <div
                  className="mt-3 h-2.5 overflow-hidden rounded-full"
                  style={{ background: 'var(--bb-depth-5)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: metric.limit === -1 ? '10%' : `${barPercent}%`,
                      background: barColor,
                    }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs" style={{ color: barColor }}>
                    {getStatusIcon(metric.status)} {metric.limit === -1 ? 'Ilimitado' : `${metric.percent}%`}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                    {getStatusLabel(metric.status)}
                  </span>
                </div>

                {/* Overage info */}
                {metric.overage_count > 0 && (
                  <div
                    className="mt-3 rounded-md p-2 text-xs"
                    style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#EF4444' }}
                  >
                    {metric.overage_count} excedentes: R${centsToReais(metric.overage_cost_cents)}
                  </div>
                )}

                {metric.status !== 'normal' && metric.overage_count === 0 && (
                  <p className="mt-2 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                    Excedente: R${centsToReais(overageCents)}/{overageLabel}/mes
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Overage projection ───────────────────────────────────── */}
      {projection && (
        <section className="animate-reveal">
          <div
            className="p-6"
            style={{
              background: 'var(--bb-depth-2)',
              border: '1px solid var(--bb-glass-border)',
              borderRadius: 'var(--bb-radius-lg)',
            }}
          >
            <h3 className="flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--bb-ink-100)' }}>
              {'\uD83D\uDCB0'} Estimativa da proxima fatura
            </h3>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--bb-ink-80)' }}>
                  Plano {summary.plan.name} ({summary.billing_cycle === 'monthly' ? 'mensal' : 'anual'})
                </span>
                <span className="font-mono" style={{ color: 'var(--bb-ink-100)' }}>
                  R$ {centsToReais(projection.base_cost_cents)}
                </span>
              </div>
              {projection.overage_students.count > 0 && (
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--bb-ink-80)' }}>
                    Excedente alunos ({projection.overage_students.count} extra)
                  </span>
                  <span className="font-mono" style={{ color: '#EF4444' }}>
                    R$ {centsToReais(projection.overage_students.cost_cents)}
                  </span>
                </div>
              )}
              {projection.overage_professors.count > 0 && (
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--bb-ink-80)' }}>
                    Excedente profs ({projection.overage_professors.count} extra)
                  </span>
                  <span className="font-mono" style={{ color: '#EF4444' }}>
                    R$ {centsToReais(projection.overage_professors.cost_cents)}
                  </span>
                </div>
              )}
              {projection.overage_classes.count === 0 && projection.overage_students.count === 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--bb-ink-80)' }}>Excedente alunos (0 extra)</span>
                    <span className="font-mono" style={{ color: 'var(--bb-ink-60)' }}>R$ 0,00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--bb-ink-80)' }}>Excedente profs (0 extra)</span>
                    <span className="font-mono" style={{ color: 'var(--bb-ink-60)' }}>R$ 0,00</span>
                  </div>
                </>
              )}

              <div
                className="my-2"
                style={{ borderTop: '1px solid var(--bb-glass-border)' }}
              />

              <div className="flex justify-between text-sm font-bold">
                <span style={{ color: 'var(--bb-ink-100)' }}>Total estimado</span>
                <span className="font-mono" style={{ color: 'var(--bb-ink-100)' }}>
                  R$ {centsToReais(projection.total_cents)}
                </span>
              </div>
            </div>

            {/* Upgrade suggestion */}
            <div className="mt-4 space-y-1">
              <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                {'\u2139\uFE0F'} Se atingir {summary.usage[0].limit} alunos, cada extra = R${centsToReais(summary.plan.overage.student_cents)}/mes
              </p>
              {projection.upgrade_suggestion && (
                <p className="text-xs" style={{ color: 'var(--bb-info, #3B82F6)' }}>
                  {'\uD83D\uDCA1'} Upgrade pro {projection.upgrade_suggestion.plan.name}: R${centsToReais(projection.upgrade_suggestion.plan.price_monthly)} com {projection.upgrade_suggestion.plan.limits.students} alunos
                  (compensa a partir de {projection.upgrade_suggestion.breakeven_overage} alunos excedentes)
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Plan comparison ──────────────────────────────────────── */}
      {showPlans && (
        <section className="animate-reveal">
          <div
            className="p-6"
            style={{
              background: 'var(--bb-depth-2)',
              border: '1px solid var(--bb-glass-border)',
              borderRadius: 'var(--bb-radius-lg)',
            }}
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                Comparar Planos
              </h3>
              <button
                onClick={() => setShowPlans(false)}
                className="text-sm transition-colors"
                style={{ color: 'var(--bb-ink-60)' }}
              >
                Fechar
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {plans.map((plan, idx) => {
                const isCurrent = plan.id === summary.plan.id;
                const isUpgrade = idx > currentPlanIndex;
                const isDowngrade = idx < currentPlanIndex;

                return (
                  <div
                    key={plan.id}
                    className="flex flex-col p-5"
                    style={{
                      background: 'var(--bb-depth-3)',
                      border: isCurrent ? '2px solid var(--bb-brand)' : '1px solid var(--bb-glass-border)',
                      borderRadius: 'var(--bb-radius-lg)',
                      boxShadow: isCurrent ? 'var(--bb-brand-glow)' : 'none',
                    }}
                  >
                    {/* Badge */}
                    <div className="mb-3 flex items-center gap-2">
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-bold text-white"
                        style={{ background: plan.badge_color }}
                      >
                        {plan.name}
                      </span>
                      {isCurrent && (
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-bold text-white"
                          style={{ background: 'var(--bb-brand)' }}
                        >
                          Seu plano
                        </span>
                      )}
                      {plan.is_popular && (
                        <span className="text-xs" style={{ color: '#F59E0B' }}>{'\u2B50'}</span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      {plan.price_monthly > 0 ? (
                        <>
                          <span className="text-2xl font-bold font-mono" style={{ color: 'var(--bb-ink-100)' }}>
                            R${centsToReais(plan.price_monthly)}
                          </span>
                          <span className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>/mes</span>
                        </>
                      ) : (
                        <span className="text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                          Sob consulta
                        </span>
                      )}
                    </div>

                    {/* Limits */}
                    <div className="mb-4 space-y-1.5 text-xs" style={{ color: 'var(--bb-ink-80)' }}>
                      <p>{plan.limits.students === -1 ? 'Alunos ilimitados' : `${plan.limits.students} alunos`}</p>
                      <p>{plan.limits.professors === -1 ? 'Profs ilimitados' : `${plan.limits.professors} professores`}</p>
                      <p>{plan.limits.classes === -1 ? 'Turmas ilimitadas' : `${plan.limits.classes} turmas`}</p>
                      <p>{plan.limits.storage_gb} GB storage</p>
                    </div>

                    {/* Modules */}
                    <div className="mb-4 space-y-1 text-xs">
                      {[
                        { key: 'streaming', label: 'Biblioteca' },
                        { key: 'store', label: 'Loja' },
                        { key: 'financial', label: 'Financeiro' },
                        { key: 'events', label: 'Eventos' },
                        { key: 'multi_branch', label: 'Multi-filial' },
                        { key: 'api', label: 'API' },
                      ].map(({ key, label }) => {
                        const enabled = plan.modules[key as keyof typeof plan.modules];
                        return (
                          <p key={key} style={{ color: enabled ? '#22C55E' : 'var(--bb-ink-40)' }}>
                            {enabled ? '\u2705' : '\u274C'} {label}
                          </p>
                        );
                      })}
                    </div>

                    {/* Overage prices */}
                    <div className="mb-4 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                      <p>Excedente aluno: R${centsToReais(plan.overage.student_cents)}</p>
                      <p>Suporte: {getSupportLabel(plan.support_level)}</p>
                    </div>

                    {/* Action button */}
                    <div className="mt-auto">
                      {isCurrent ? (
                        <button
                          disabled
                          className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold opacity-50"
                          style={{ background: 'var(--bb-depth-5)', color: 'var(--bb-ink-60)' }}
                        >
                          Plano Atual
                        </button>
                      ) : plan.slug === 'enterprise' ? (
                        <button
                          className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
                          style={{ background: plan.badge_color, color: 'white' }}
                        >
                          Falar com Vendas
                        </button>
                      ) : isUpgrade ? (
                        <button
                          onClick={() => handleUpgrade(plan.slug)}
                          className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                          style={{ background: 'var(--bb-brand)' }}
                        >
                          Fazer Upgrade
                        </button>
                      ) : isDowngrade ? (
                        <button
                          onClick={() => handleDowngrade(plan.slug)}
                          className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
                          style={{ background: 'var(--bb-depth-5)', color: 'var(--bb-ink-80)' }}
                        >
                          Fazer Downgrade
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {!showPlans && (
        <section className="animate-reveal flex justify-center">
          <button
            onClick={() => setShowPlans(true)}
            className="rounded-lg px-6 py-2.5 text-sm font-medium transition-colors"
            style={{
              background: 'var(--bb-depth-4)',
              color: 'var(--bb-ink-80)',
              border: '1px solid var(--bb-glass-border)',
            }}
          >
            Comparar todos os planos
          </button>
        </section>
      )}

      {/* ── Invoices ─────────────────────────────────────────────── */}
      <section className="animate-reveal">
        <div
          className="p-6"
          style={{
            background: 'var(--bb-depth-2)',
            border: '1px solid var(--bb-glass-border)',
            borderRadius: 'var(--bb-radius-lg)',
          }}
        >
          <h3
            className="mb-4 font-mono uppercase"
            style={{ fontSize: '11px', letterSpacing: '0.08em', color: 'var(--bb-ink-40)' }}
          >
            Historico de Faturas
          </h3>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                  {['Periodo', 'Plano', 'Base', 'Excedente', 'Total', 'Status', ''].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2 text-left font-mono text-xs uppercase"
                      style={{ color: 'var(--bb-ink-40)', letterSpacing: '0.05em' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <>
                    <tr
                      key={inv.id}
                      className="cursor-pointer transition-colors"
                      style={{ borderBottom: '1px solid var(--bb-glass-border)' }}
                      onClick={() => setExpandedInvoice(expandedInvoice === inv.id ? null : inv.id)}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bb-depth-4)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <td className="px-3 py-3 font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                        {inv.period}
                      </td>
                      <td className="px-3 py-3" style={{ color: 'var(--bb-ink-80)' }}>
                        {summary.plan.name}
                      </td>
                      <td className="px-3 py-3 font-mono" style={{ color: 'var(--bb-ink-80)' }}>
                        R${centsToReais(inv.base_cost_cents)}
                      </td>
                      <td
                        className="px-3 py-3 font-mono"
                        style={{ color: inv.overage_total_cents > 0 ? '#EF4444' : 'var(--bb-ink-60)' }}
                      >
                        R${centsToReais(inv.overage_total_cents)}
                      </td>
                      <td className="px-3 py-3 font-mono font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                        R${centsToReais(inv.total_cents)}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{
                            background: inv.status === 'paid' ? 'rgba(34, 197, 94, 0.1)' : inv.status === 'overdue' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                            color: inv.status === 'paid' ? '#22C55E' : inv.status === 'overdue' ? '#EF4444' : '#F59E0B',
                          }}
                        >
                          {inv.status === 'paid' ? '\u2705 Pago' : inv.status === 'overdue' ? 'Vencido' : 'Pendente'}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        {inv.pdf_url && (
                          <span className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>{'\uD83D\uDCC4'}</span>
                        )}
                      </td>
                    </tr>

                    {/* Expanded details */}
                    {expandedInvoice === inv.id && inv.overage_details.length > 0 && (
                      <tr key={`${inv.id}-details`}>
                        <td
                          colSpan={7}
                          className="px-6 py-4"
                          style={{ background: 'var(--bb-depth-4)' }}
                        >
                          <p className="mb-2 text-xs font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                            Excedente {inv.period}:
                          </p>
                          {inv.overage_details.map((d, i) => (
                            <p key={i} className="text-xs" style={{ color: 'var(--bb-ink-80)' }}>
                              {d.count} {d.resource.toLowerCase()} x R${centsToReais(d.unit_cost_cents)} = R${centsToReais(d.total_cents)}
                            </p>
                          ))}
                        </td>
                      </tr>
                    )}

                    {expandedInvoice === inv.id && inv.overage_details.length === 0 && (
                      <tr key={`${inv.id}-details`}>
                        <td
                          colSpan={7}
                          className="px-6 py-4"
                          style={{ background: 'var(--bb-depth-4)' }}
                        >
                          <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                            Nenhum excedente neste periodo.
                          </p>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 sm:hidden">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="rounded-lg p-4"
                style={{
                  background: 'var(--bb-depth-3)',
                  border: '1px solid var(--bb-glass-border)',
                }}
                onClick={() => setExpandedInvoice(expandedInvoice === inv.id ? null : inv.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                    {inv.period}
                  </span>
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{
                      background: inv.status === 'paid' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: inv.status === 'paid' ? '#22C55E' : '#F59E0B',
                    }}
                  >
                    {inv.status === 'paid' ? '\u2705 Pago' : 'Pendente'}
                  </span>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span style={{ color: 'var(--bb-ink-60)' }}>Total</span>
                  <span className="font-mono font-bold" style={{ color: 'var(--bb-ink-100)' }}>
                    R${centsToReais(inv.total_cents)}
                  </span>
                </div>
                {inv.overage_total_cents > 0 && (
                  <div className="mt-1 flex justify-between text-xs">
                    <span style={{ color: 'var(--bb-ink-60)' }}>Excedente</span>
                    <span className="font-mono" style={{ color: '#EF4444' }}>
                      R${centsToReais(inv.overage_total_cents)}
                    </span>
                  </div>
                )}
                {expandedInvoice === inv.id && inv.overage_details.length > 0 && (
                  <div className="mt-3 rounded-md p-3" style={{ background: 'var(--bb-depth-4)' }}>
                    {inv.overage_details.map((d, i) => (
                      <p key={i} className="text-xs" style={{ color: 'var(--bb-ink-80)' }}>
                        {d.count} {d.resource.toLowerCase()} x R${centsToReais(d.unit_cost_cents)} = R${centsToReais(d.total_cents)}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
