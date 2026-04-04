'use client';

import { useState, useEffect } from 'react';
import { getSubscriptionByStudent } from '@/lib/api/subscriptions.service';
import { listInvoices } from '@/lib/api/faturas.service';
import { listPlans } from '@/lib/api/planos.service';
import type { SubscriptionWithPlan } from '@/lib/api/subscriptions.service';
import type { InvoiceWithDetails } from '@/lib/api/faturas.service';
import type { Plan } from '@/lib/types';
import { InvoiceStatus } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/lib/hooks/useToast';
import { useStudentId } from '@/lib/hooks/useStudentId';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import { translateError } from '@/lib/utils/error-translator';

const STATUS_LABEL: Record<string, string> = {
  paid: 'Pago',
  open: 'Pendente',
  uncollectible: 'Atrasado',
};

export default function PagamentosPage() {
  const { toast } = useToast();
  const { studentId, loading: studentLoading } = useStudentId();
  const [subscription, setSubscription] = useState<SubscriptionWithPlan | null>(null);
  const [invoices, setInvoices] = useState<InvoiceWithDetails[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [changePlanModal, setChangePlanModal] = useState(false);

  useEffect(() => {
    if (studentLoading || !studentId) return;
    async function load() {
      try {
        const academyId = getActiveAcademyId();
        const [sub, inv, pl] = await Promise.all([
          getSubscriptionByStudent(studentId!),
          listInvoices(academyId),
          listPlans(academyId),
        ]);
        setSubscription(sub);
        setInvoices(inv.filter((i) => i.student_id === studentId));
        setPlans(pl);
      } catch (err) {
        toast(translateError(err), 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [studentId, studentLoading]);

  const hasOverdue = invoices.some((i) => i.status === InvoiceStatus.Open || i.status === InvoiceStatus.Uncollectible);

  if (loading || studentLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton variant="text" className="h-8 w-48" />
        <Skeleton variant="card" className="h-40" />
        <Skeleton variant="card" className="h-60" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>Pagamentos</h1>

      {hasOverdue && (
        <Card className="border-[var(--bb-error)] p-4" style={{ background: 'rgba(239,68,68,0.06)' }}>
          <p className="text-sm font-medium" style={{ color: 'var(--bb-error)' }}>
            Voce tem faturas pendentes. Regularize para manter seu acesso.
          </p>
        </Card>
      )}

      {/* Plano Atual */}
      {subscription && (
        <Card className="p-4">
          <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>Plano Atual</p>
          <h2 className="mt-1 text-lg font-bold" style={{ color: 'var(--bb-ink-100)' }}>{subscription.plan_name}</h2>
          <p className="text-2xl font-bold" style={{ color: 'var(--bb-brand-primary)' }}>
            R$ {subscription.plan_price.toLocaleString('pt-BR')}
            <span className="text-sm font-normal" style={{ color: 'var(--bb-ink-40)' }}>
              /{subscription.plan_interval === 'monthly' ? 'mes' : subscription.plan_interval === 'quarterly' ? 'trim' : 'ano'}
            </span>
          </p>
          <p className="mt-2 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
            Proximo vencimento: {new Date(subscription.current_period_end).toLocaleDateString('pt-BR')}
          </p>
          <Button variant="ghost" size="sm" className="mt-3" onClick={() => setChangePlanModal(true)}>
            Trocar Plano
          </Button>
        </Card>
      )}

      {/* Historico */}
      {invoices.length === 0 ? (
        <EmptyState
          icon="\uD83D\uDCB3"
          title="Nenhuma fatura encontrada"
          description="Suas faturas aparecerão aqui quando forem geradas."
          variant="first-time"
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="p-4" style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
            <h2 className="font-semibold" style={{ color: 'var(--bb-ink-100)' }}>Historico de Faturas</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--bb-depth-2)', borderBottom: '1px solid var(--bb-glass-border)' }}>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--bb-ink-40)' }}>Mes</th>
                  <th className="px-4 py-3 text-right font-medium" style={{ color: 'var(--bb-ink-40)' }}>Valor</th>
                  <th className="px-4 py-3 text-center font-medium" style={{ color: 'var(--bb-ink-40)' }}>Status</th>
                  <th className="px-4 py-3 text-right font-medium" style={{ color: 'var(--bb-ink-40)' }}>Boleto</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    style={{
                      borderBottom: '1px solid var(--bb-glass-border)',
                      ...(inv.status === 'uncollectible' ? { background: 'rgba(239,68,68,0.06)' } : {}),
                    }}
                  >
                    <td className="px-4 py-3" style={{ color: 'var(--bb-ink-100)' }}>
                      {new Date(inv.due_date).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-right" style={{ color: 'var(--bb-ink-60)' }}>
                      R$ {inv.amount.toLocaleString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{
                          ...(inv.status === 'paid'
                            ? { background: 'rgba(34,197,94,0.1)', color: 'var(--bb-success)' }
                            : inv.status === 'uncollectible'
                              ? { background: 'rgba(239,68,68,0.1)', color: 'var(--bb-error)' }
                              : { background: 'rgba(234,179,8,0.1)', color: 'var(--bb-warning)' }),
                        }}
                      >
                        {STATUS_LABEL[inv.status] || inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {inv.status !== 'paid' && (
                        <button
                          className="text-xs hover:underline"
                          style={{ color: 'var(--bb-brand-primary)' }}
                        >
                          Ver boleto
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={changePlanModal} onClose={() => setChangePlanModal(false)} title="Trocar Plano">
        <div className="space-y-3">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className="cursor-pointer p-3"
              style={subscription?.plan_id === plan.id ? { outline: '2px solid var(--bb-brand-primary)', outlineOffset: '-2px' } : undefined}
              onClick={() => {
                toast(`Plano alterado para ${plan.name}`, 'success');
                setChangePlanModal(false);
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium" style={{ color: 'var(--bb-ink-100)' }}>{plan.name}</p>
                  <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                    {plan.features.slice(0, 2).join(' · ')}
                  </p>
                </div>
                <p className="text-lg font-bold" style={{ color: 'var(--bb-brand-primary)' }}>
                  R$ {plan.price}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </Modal>
    </div>
  );
}
