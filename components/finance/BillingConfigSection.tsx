'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';
import {
  getMemberBilling,
  updateMemberBilling,
  BILLING_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
  RECURRENCE_LABELS,
  BILLING_STATUS_LABELS,
  BILLING_STATUS_COLORS,
  formatCentsToBRL,
  billingTypeNeedsBilling,
} from '@/lib/api/student-billing.service';
import type {
  BillingType,
  PaymentMethod,
  Recurrence,
  MemberBilling,
} from '@/lib/api/student-billing.service';
import { Skeleton } from '@/components/ui/Skeleton';

interface BillingConfigSectionProps {
  membershipId?: string;
  profileId?: string;
  academyId?: string;
  onSave?: () => void;
}

const BILLING_TYPES = Object.entries(BILLING_TYPE_LABELS) as [BillingType, string][];
const PAYMENT_METHODS = Object.entries(PAYMENT_METHOD_LABELS) as [PaymentMethod, string][];
const RECURRENCES = Object.entries(RECURRENCE_LABELS) as [Recurrence, string][];

export function BillingConfigSection({ membershipId: propMembershipId, profileId, academyId, onSave }: BillingConfigSectionProps) {
  const [resolvedMembershipId, setResolvedMembershipId] = useState(propMembershipId ?? '');
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [billing, setBilling] = useState<MemberBilling | null>(null);

  // Form state
  const [billingType, setBillingType] = useState<BillingType>('particular');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('pix');
  const [recurrence, setRecurrence] = useState<Recurrence>('mensal');
  const [monthlyAmount, setMonthlyAmount] = useState(''); // display R$ string
  const [discountPercent, setDiscountPercent] = useState('0');
  const [discountReason, setDiscountReason] = useState('');
  const [billingDay, setBillingDay] = useState('10');
  const [contractStart, setContractStart] = useState('');
  const [contractEnd, setContractEnd] = useState('');
  const [billingNotes, setBillingNotes] = useState('');

  const loadBilling = useCallback(async () => {
    try {
      let mId = resolvedMembershipId;

      // If no membershipId, look it up from profileId + academyId
      if (!mId && profileId && academyId) {
        const { isMock: checkMock } = await import('@/lib/env');
        if (!checkMock()) {
          const { createBrowserClient } = await import('@/lib/supabase/client');
          const supabase = createBrowserClient();
          const { data: membership } = await supabase
            .from('memberships')
            .select('id')
            .eq('profile_id', profileId)
            .eq('academy_id', academyId)
            .limit(1)
            .single();
          if (membership) {
            mId = membership.id;
            setResolvedMembershipId(mId);
          }
        }
      }

      if (!mId) { setLoading(false); return; }

      const data = await getMemberBilling(mId);
      if (data) {
        setBilling(data);
        setBillingType(data.billing_type);
        setPaymentMethod(data.payment_method ?? '');
        setRecurrence(data.recurrence);
        setMonthlyAmount(data.monthly_amount > 0 ? (data.monthly_amount / 100).toFixed(2).replace('.', ',') : '');
        setDiscountPercent(String(data.discount_percent));
        setDiscountReason(data.discount_reason ?? '');
        setBillingDay(String(data.billing_day));
        setContractStart(data.contract_start ?? '');
        setContractEnd(data.contract_end ?? '');
        setBillingNotes(data.billing_notes ?? '');
      }
    } finally {
      setLoading(false);
    }
  }, [resolvedMembershipId, profileId, academyId]);

  useEffect(() => {
    loadBilling();
  }, [loadBilling]);

  function parseCents(value: string): number {
    const cleaned = value.replace(/[^\d,]/g, '').replace(',', '.');
    return Math.round(parseFloat(cleaned || '0') * 100);
  }

  const amountCents = parseCents(monthlyAmount);
  const discount = Number(discountPercent) || 0;
  const discountedAmount = Math.round(amountCents * (1 - discount / 100));

  const showPaymentFields = billingTypeNeedsBilling(billingType);
  const isPartnerPlatform = billingType === 'gympass' || billingType === 'totalpass' || billingType === 'smartfit';
  const isFree = billingType === 'cortesia' || billingType === 'funcionario';

  async function handleSave() {
    setSaving(true);
    try {
      await updateMemberBilling(resolvedMembershipId, {
        billing_type: billingType,
        payment_method: showPaymentFields && paymentMethod ? paymentMethod as PaymentMethod : null,
        recurrence: showPaymentFields ? recurrence : 'avulso',
        monthly_amount: showPaymentFields ? amountCents : 0,
        discount_percent: billingType === 'bolsista' ? discount : 0,
        discount_reason: billingType === 'bolsista' ? discountReason || null : null,
        billing_day: showPaymentFields ? Number(billingDay) || 10 : 10,
        billing_status: isFree ? 'cortesia' : isPartnerPlatform ? 'gympass' : undefined,
        contract_start: contractStart || null,
        contract_end: contractEnd || null,
        billing_notes: billingNotes || null,
      });
      toast('Dados financeiros salvos!', 'success');
      onSave?.();
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Card className="p-6 space-y-3">
        <Skeleton variant="text" className="h-6 w-48" />
        <Skeleton variant="card" className="h-10" />
        <Skeleton variant="card" className="h-10" />
      </Card>
    );
  }

  const statusColors = billing ? BILLING_STATUS_COLORS[billing.billing_status] : null;

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
          Dados Financeiros
        </h2>
        {billing && statusColors && (
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{ background: statusColors.bg, color: statusColors.text }}
          >
            {BILLING_STATUS_LABELS[billing.billing_status]}
          </span>
        )}
      </div>

      <div className="space-y-4">
        {/* Tipo de Vínculo */}
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--bb-ink-60)' }}>
            Tipo de Vínculo
          </label>
          <select
            value={billingType}
            onChange={(e) => setBillingType(e.target.value as BillingType)}
            className="w-full rounded-lg px-3 py-2 text-sm"
            style={{ background: 'var(--bb-depth-4)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
          >
            {BILLING_TYPES.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Partner platform info */}
        {isPartnerPlatform && (
          <div
            className="rounded-lg p-3 text-xs"
            style={{ background: 'rgba(168,85,247,0.08)', color: '#A855F7', border: '1px solid rgba(168,85,247,0.2)' }}
          >
            Pagamento gerenciado pela plataforma parceira. Receita contabilizada por check-in.
          </div>
        )}

        {/* Free info */}
        {isFree && (
          <div
            className="rounded-lg p-3 text-xs"
            style={{ background: 'rgba(59,130,246,0.08)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.2)' }}
          >
            Sem cobrança. Acesso liberado.
          </div>
        )}

        {/* Payment fields for particular/bolsista/avulso */}
        {showPaymentFields && (
          <>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--bb-ink-60)' }}>
                Forma de Pagamento
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full rounded-lg px-3 py-2 text-sm"
                style={{ background: 'var(--bb-depth-4)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
              >
                <option value="">Selecionar...</option>
                {PAYMENT_METHODS.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {billingType !== 'avulso' && (
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--bb-ink-60)' }}>
                  Recorrência
                </label>
                <select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value as Recurrence)}
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  style={{ background: 'var(--bb-depth-4)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
                >
                  {RECURRENCES.filter(([v]) => v !== 'avulso').map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--bb-ink-60)' }}>
                  Valor Mensal (R$)
                </label>
                <input
                  type="text"
                  value={monthlyAmount}
                  onChange={(e) => setMonthlyAmount(e.target.value)}
                  placeholder="149,00"
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  style={{ background: 'var(--bb-depth-4)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--bb-ink-60)' }}>
                  Dia de Vencimento
                </label>
                <input
                  type="number"
                  min={1}
                  max={28}
                  value={billingDay}
                  onChange={(e) => setBillingDay(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  style={{ background: 'var(--bb-depth-4)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
                />
              </div>
            </div>

            {/* Bolsista discount */}
            {billingType === 'bolsista' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--bb-ink-60)' }}>
                      Desconto (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(e.target.value)}
                      className="w-full rounded-lg px-3 py-2 text-sm"
                      style={{ background: 'var(--bb-depth-4)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--bb-ink-60)' }}>
                      Valor com desconto
                    </label>
                    <div
                      className="rounded-lg px-3 py-2 text-sm font-semibold"
                      style={{ background: 'var(--bb-depth-4)', border: '1px solid var(--bb-glass-border)', color: '#22C55E' }}
                    >
                      {formatCentsToBRL(discountedAmount)}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--bb-ink-60)' }}>
                    Motivo do Desconto
                  </label>
                  <input
                    type="text"
                    value={discountReason}
                    onChange={(e) => setDiscountReason(e.target.value)}
                    placeholder="Ex: Competidor da equipe"
                    className="w-full rounded-lg px-3 py-2 text-sm"
                    style={{ background: 'var(--bb-depth-4)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
                  />
                </div>
              </>
            )}
          </>
        )}

        {/* Contract dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--bb-ink-60)' }}>
              Início do Contrato
            </label>
            <input
              type="date"
              value={contractStart}
              onChange={(e) => setContractStart(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm"
              style={{ background: 'var(--bb-depth-4)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--bb-ink-60)' }}>
              Fim do Contrato (opcional)
            </label>
            <input
              type="date"
              value={contractEnd}
              onChange={(e) => setContractEnd(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm"
              style={{ background: 'var(--bb-depth-4)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--bb-ink-60)' }}>
            Observações
          </label>
          <textarea
            value={billingNotes}
            onChange={(e) => setBillingNotes(e.target.value)}
            rows={2}
            className="w-full rounded-lg px-3 py-2 text-sm resize-none"
            style={{ background: 'var(--bb-depth-4)', border: '1px solid var(--bb-glass-border)', color: 'var(--bb-ink-100)' }}
          />
        </div>

        {/* Save */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-lg py-2.5 text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60"
          style={{ background: 'var(--bb-brand)', color: '#fff' }}
        >
          {saving ? 'Salvando...' : 'Salvar Dados Financeiros'}
        </button>
      </div>
    </Card>
  );
}
