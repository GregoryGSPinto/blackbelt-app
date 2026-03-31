'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';
import {
  BILLING_STATUS_COLORS,
  BILLING_STATUS_LABELS,
  BILLING_TYPE_LABELS,
  CHARGE_MODE_OPTIONS,
  CHECKIN_GOAL_COLORS,
  CHECKIN_GOAL_LABELS,
  PAYMENT_METHOD_LABELS,
  RECURRENCE_LABELS,
  billingTypeNeedsBilling,
  billingTypeNeedsCheckinGoal,
  formatCentsToBRL,
  getMemberBilling,
  updateMemberBilling,
  type BillingType,
  type ChargeMode,
  type MemberBilling,
  type PaymentMethod,
  type Recurrence,
} from '@/lib/api/student-billing.service';

interface BillingConfigSectionProps {
  membershipId?: string;
  profileId?: string;
  academyId?: string;
  onSave?: () => void;
}

const BILLING_TYPES = Object.entries(BILLING_TYPE_LABELS) as [BillingType, string][];
const PAYMENT_METHODS = Object.entries(PAYMENT_METHOD_LABELS) as [PaymentMethod, string][];
const RECURRENCES = Object.entries(RECURRENCE_LABELS) as [Recurrence, string][];
const CHARGE_MODES = Object.entries(CHARGE_MODE_OPTIONS) as [ChargeMode, string][];

function inputStyle() {
  return {
    background: 'var(--bb-depth-4)',
    border: '1px solid var(--bb-glass-border)',
    color: 'var(--bb-ink-100)',
  } as const;
}

function parseCurrencyInput(value: string): number {
  const normalized = value.replace(/[^\d,]/g, '').replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
}

function formatCurrencyInput(cents: number): string {
  if (!cents) return '';
  return (cents / 100).toFixed(2).replace('.', ',');
}

export function BillingConfigSection({
  membershipId: propMembershipId,
  profileId,
  academyId,
  onSave,
}: BillingConfigSectionProps) {
  const { toast } = useToast();
  const [resolvedMembershipId, setResolvedMembershipId] = useState(propMembershipId ?? '');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [billing, setBilling] = useState<MemberBilling | null>(null);

  const [financialModel, setFinancialModel] = useState<BillingType>('particular');
  const [chargeMode, setChargeMode] = useState<ChargeMode>('manual');
  const [paymentMethodDefault, setPaymentMethodDefault] = useState<PaymentMethod>('pix');
  const [recurrence, setRecurrence] = useState<Recurrence>('monthly');
  const [amount, setAmount] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [scholarshipPercent, setScholarshipPercent] = useState('0');
  const [dueDay, setDueDay] = useState('10');
  const [notes, setNotes] = useState('');
  const [monthlyCheckinMinimum, setMonthlyCheckinMinimum] = useState('8');
  const [alertDaysBeforeMonthEnd, setAlertDaysBeforeMonthEnd] = useState('5');
  const [partnershipName, setPartnershipName] = useState('');
  const [partnershipTransferMode, setPartnershipTransferMode] = useState('');
  const [exemptionReason, setExemptionReason] = useState('');
  const [periodStartDate, setPeriodStartDate] = useState('');
  const [periodEndDate, setPeriodEndDate] = useState('');

  const load = useCallback(async () => {
    try {
      let membershipId = resolvedMembershipId;

      if (!membershipId && profileId && academyId) {
        const { createBrowserClient } = await import('@/lib/supabase/client');
        const supabase = createBrowserClient();
        let resolvedProfileId = profileId;

        const { data: membershipByProfile } = await supabase
          .from('memberships')
          .select('id')
          .eq('profile_id', resolvedProfileId)
          .eq('academy_id', academyId)
          .in('role', ['aluno_adulto', 'aluno_teen', 'aluno_kids'])
          .limit(1)
          .maybeSingle();

        if (!membershipByProfile?.id) {
          const { data: student } = await supabase
            .from('students')
            .select('profile_id')
            .eq('id', profileId)
            .maybeSingle();
          if (student?.profile_id) {
            resolvedProfileId = student.profile_id;
          }
        }

        const { data } = membershipByProfile?.id
          ? { data: membershipByProfile }
          : await supabase
            .from('memberships')
            .select('id')
            .eq('profile_id', resolvedProfileId)
            .eq('academy_id', academyId)
            .in('role', ['aluno_adulto', 'aluno_teen', 'aluno_kids'])
            .limit(1)
            .maybeSingle();

        if (data?.id) {
          membershipId = data.id;
          setResolvedMembershipId(data.id);
        }
      }

      if (!membershipId) {
        setLoading(false);
        return;
      }

      const data = await getMemberBilling(membershipId);
      setBilling(data);

      if (data) {
        setFinancialModel(data.financial_model);
        setChargeMode(data.charge_mode);
        setPaymentMethodDefault(data.payment_method_default);
        setRecurrence(data.recurrence);
        setAmount(formatCurrencyInput(data.amount_cents));
        setDiscountAmount(formatCurrencyInput(data.discount_amount_cents));
        setScholarshipPercent(String(data.scholarship_percent || 0));
        setDueDay(data.due_day ? String(data.due_day) : '10');
        setNotes(data.notes ?? '');
        setMonthlyCheckinMinimum(String(data.monthly_checkin_minimum ?? 0));
        setAlertDaysBeforeMonthEnd(String(data.alert_days_before_month_end ?? 5));
        setPartnershipName(data.partnership_name ?? '');
        setPartnershipTransferMode(data.partnership_transfer_mode ?? '');
        setExemptionReason(data.exemption_reason ?? '');
        setPeriodStartDate(data.period_start_date ?? '');
        setPeriodEndDate(data.period_end_date ?? '');
      }
    } finally {
      setLoading(false);
    }
  }, [academyId, profileId, resolvedMembershipId]);

  useEffect(() => {
    load();
  }, [load]);

  const directCharge = billingTypeNeedsBilling(financialModel);
  const externalPlatform = billingTypeNeedsCheckinGoal(financialModel);
  const exempt = ['cortesia', 'funcionario'].includes(financialModel);
  const scholarship = financialModel === 'bolsista';
  const convenio = financialModel === 'convenio';
  const avulso = financialModel === 'avulso';

  async function handleSave() {
    if (!resolvedMembershipId) return;

    setSaving(true);
    try {
      await updateMemberBilling(resolvedMembershipId, {
        financial_model: financialModel,
        charge_mode: externalPlatform ? 'manual' : chargeMode,
        payment_method_default: externalPlatform ? 'external_platform' : directCharge ? paymentMethodDefault : 'none',
        recurrence: exempt ? 'none' : avulso ? 'per_class' : recurrence,
        amount_cents: directCharge ? parseCurrencyInput(amount) : 0,
        discount_amount_cents: scholarship ? parseCurrencyInput(discountAmount) : 0,
        scholarship_percent: scholarship ? Number(scholarshipPercent || 0) : 0,
        due_day: directCharge && !avulso ? Number(dueDay || 10) : null,
        notes,
        monthly_checkin_minimum: externalPlatform ? Number(monthlyCheckinMinimum || 0) : 0,
        alert_days_before_month_end: externalPlatform ? Number(alertDaysBeforeMonthEnd || 5) : 5,
        partnership_name: convenio ? partnershipName : externalPlatform ? BILLING_TYPE_LABELS[financialModel] : null,
        partnership_transfer_mode: convenio ? partnershipTransferMode : externalPlatform ? 'Repasse externo por check-in' : null,
        exemption_reason: exempt || scholarship ? exemptionReason : null,
        period_start_date: periodStartDate || null,
        period_end_date: periodEndDate || null,
      });
      toast('Configuração financeira salva.', 'success');
      await load();
      onSave?.();
    } catch (error) {
      toast(translateError(error), 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Card className="space-y-3 p-6">
        <Skeleton variant="text" className="h-6 w-56" />
        <Skeleton variant="card" className="h-20" />
        <Skeleton variant="card" className="h-40" />
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
            Configuração Financeira
          </h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
            Defina vínculo, cobrança, vencimento, repasse externo e regras de alerta.
          </p>
        </div>

        {billing && (
          <div className="flex flex-wrap gap-2">
            <span
              className="rounded-full px-2.5 py-1 text-xs font-medium"
              style={{
                background: BILLING_STATUS_COLORS[billing.financial_status].bg,
                color: BILLING_STATUS_COLORS[billing.financial_status].text,
              }}
            >
              {BILLING_STATUS_LABELS[billing.financial_status]}
            </span>
            {externalPlatform && (
              <span
                className="rounded-full px-2.5 py-1 text-xs font-medium"
                style={{
                  background: CHECKIN_GOAL_COLORS[billing.checkin_goal_status].bg,
                  color: CHECKIN_GOAL_COLORS[billing.checkin_goal_status].text,
                }}
              >
                {CHECKIN_GOAL_LABELS[billing.checkin_goal_status]}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
              Vínculo financeiro
            </label>
            <select
              value={financialModel}
              onChange={(event) => setFinancialModel(event.target.value as BillingType)}
              className="w-full rounded-lg px-3 py-2 text-sm"
              style={inputStyle()}
            >
              {BILLING_TYPES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
              Período da condição
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={periodStartDate}
                onChange={(event) => setPeriodStartDate(event.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm"
                style={inputStyle()}
              />
              <input
                type="date"
                value={periodEndDate}
                onChange={(event) => setPeriodEndDate(event.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm"
                style={inputStyle()}
              />
            </div>
          </div>
        </div>

        {directCharge && (
          <section className="space-y-4 rounded-xl p-4" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                  Modo de cobrança
                </label>
                <select
                  value={chargeMode}
                  onChange={(event) => setChargeMode(event.target.value as ChargeMode)}
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  style={inputStyle()}
                >
                  {CHARGE_MODES.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                  Pagamento padrão
                </label>
                <select
                  value={paymentMethodDefault}
                  onChange={(event) => setPaymentMethodDefault(event.target.value as PaymentMethod)}
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  style={inputStyle()}
                >
                  {PAYMENT_METHODS.filter(([value]) => value !== 'external_platform').map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                  Recorrência
                </label>
                <select
                  value={avulso ? 'per_class' : recurrence}
                  onChange={(event) => setRecurrence(event.target.value as Recurrence)}
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  style={inputStyle()}
                  disabled={avulso}
                >
                  {RECURRENCES.filter(([value]) => value !== 'none').map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                  {avulso ? 'Valor por aula/evento' : 'Valor base'}
                </label>
                <input
                  type="text"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="150,00"
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  style={inputStyle()}
                />
              </div>

              {scholarship && (
                <>
                  <div>
                    <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                      Desconto (R$)
                    </label>
                    <input
                      type="text"
                      value={discountAmount}
                      onChange={(event) => setDiscountAmount(event.target.value)}
                      placeholder="50,00"
                      className="w-full rounded-lg px-3 py-2 text-sm"
                      style={inputStyle()}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                      Bolsa (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={scholarshipPercent}
                      onChange={(event) => setScholarshipPercent(event.target.value)}
                      className="w-full rounded-lg px-3 py-2 text-sm"
                      style={inputStyle()}
                    />
                  </div>
                </>
              )}

              {!avulso && (
                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                    Dia de vencimento
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={dueDay}
                    onChange={(event) => setDueDay(event.target.value)}
                    className="w-full rounded-lg px-3 py-2 text-sm"
                    style={inputStyle()}
                  />
                </div>
              )}

              <div className="rounded-lg px-3 py-2 text-sm" style={{ background: 'var(--bb-depth-4)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}>
                <span className="block text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                  Valor líquido
                </span>
                {formatCentsToBRL(Math.max(parseCurrencyInput(amount) - parseCurrencyInput(discountAmount), 0))}
              </div>
            </div>
          </section>
        )}

        {externalPlatform && (
          <section className="space-y-4 rounded-xl p-4" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.22)' }}>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                Repasse por plataforma externa
              </p>
              <p className="mt-1 text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                O aluno não entra em cobrança direta. O acompanhamento é por meta mensal de check-ins e alertas.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                  Check-ins mínimos no mês
                </label>
                <input
                  type="number"
                  min={0}
                  value={monthlyCheckinMinimum}
                  onChange={(event) => setMonthlyCheckinMinimum(event.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  style={inputStyle()}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                  Alertar antes do fim do mês
                </label>
                <input
                  type="number"
                  min={0}
                  max={15}
                  value={alertDaysBeforeMonthEnd}
                  onChange={(event) => setAlertDaysBeforeMonthEnd(event.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  style={inputStyle()}
                />
              </div>

              <div className="rounded-lg px-3 py-2 text-sm" style={{ background: 'var(--bb-depth-4)', border: '1px solid var(--bb-glass-border)' }}>
                <span className="block text-xs" style={{ color: 'var(--bb-ink-60)' }}>
                  Check-ins do mês
                </span>
                <span style={{ color: 'var(--bb-ink-100)' }}>
                  {billing?.current_month_checkins ?? 0}
                </span>
              </div>
            </div>
          </section>
        )}

        {convenio && (
          <section className="grid gap-4 rounded-xl p-4 md:grid-cols-2" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                Nome do convênio/parceria
              </label>
              <input
                type="text"
                value={partnershipName}
                onChange={(event) => setPartnershipName(event.target.value)}
                placeholder="Ex: Empresa XPTO"
                className="w-full rounded-lg px-3 py-2 text-sm"
                style={inputStyle()}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
                Forma de repasse
              </label>
              <input
                type="text"
                value={partnershipTransferMode}
                onChange={(event) => setPartnershipTransferMode(event.target.value)}
                placeholder="Ex: repasse mensal por colaborador ativo"
                className="w-full rounded-lg px-3 py-2 text-sm"
                style={inputStyle()}
              />
            </div>
          </section>
        )}

        {(exempt || scholarship) && (
          <section className="rounded-xl p-4" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.22)' }}>
            <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
              Motivo da condição especial
            </label>
            <input
              type="text"
              value={exemptionReason}
              onChange={(event) => setExemptionReason(event.target.value)}
              placeholder="Ex: atleta da equipe, colaborador, ação promocional"
              className="w-full rounded-lg px-3 py-2 text-sm"
              style={inputStyle()}
            />
          </section>
        )}

        <div>
          <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>
            Observações
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm"
            style={inputStyle()}
          />
        </div>

        {billing && (
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg p-3" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
              <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Próximo vencimento</p>
              <p className="mt-1 text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                {billing.next_due_date ? new Date(`${billing.next_due_date}T00:00:00`).toLocaleDateString('pt-BR') : '—'}
              </p>
            </div>
            <div className="rounded-lg p-3" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
              <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Último alerta</p>
              <p className="mt-1 text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                {billing.last_alert_sent_at ? new Date(billing.last_alert_sent_at).toLocaleString('pt-BR') : 'Nenhum'}
              </p>
            </div>
            <div className="rounded-lg p-3" style={{ background: 'var(--bb-depth-2)', border: '1px solid var(--bb-glass-border)' }}>
              <p className="text-xs" style={{ color: 'var(--bb-ink-60)' }}>Canal padrão</p>
              <p className="mt-1 text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                {PAYMENT_METHOD_LABELS[billing.payment_method_default]}
              </p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !resolvedMembershipId}
          className="w-full rounded-lg py-2.5 text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60"
          style={{ background: 'var(--bb-brand)', color: '#fff' }}
        >
          {saving ? 'Salvando...' : 'Salvar configuração financeira'}
        </button>
      </div>
    </Card>
  );
}
