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
import { useToast } from '@/lib/hooks/useToast';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';

const STATUS_LABEL: Record<string, string> = {
  paid: 'Pago',
  open: 'Pendente',
  uncollectible: 'Atrasado',
};

export default function PagamentosPage() {
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<SubscriptionWithPlan | null>(null);
  const [invoices, setInvoices] = useState<InvoiceWithDetails[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [changePlanModal, setChangePlanModal] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [sub, inv, pl] = await Promise.all([
          getSubscriptionByStudent('student-1'),
          listInvoices(getActiveAcademyId()),
          listPlans(getActiveAcademyId()),
        ]);
        setSubscription(sub);
        setInvoices(inv.filter((i) => i.student_id === 'student-1'));
        setPlans(pl);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const hasOverdue = invoices.some((i) => i.status === InvoiceStatus.Open || i.status === InvoiceStatus.Uncollectible);

  if (loading) return <div className="space-y-4 p-4"><Skeleton variant="text" className="h-8 w-48" /><Skeleton variant="card" className="h-40" /></div>;

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-xl font-bold text-bb-black">Pagamentos</h1>

      {hasOverdue && (
        <Card className="border-bb-error bg-red-50 p-4">
          <p className="text-sm font-medium text-bb-error">Você tem faturas pendentes. Regularize para manter seu acesso.</p>
        </Card>
      )}

      {/* Plano Atual */}
      {subscription && (
        <Card className="p-4">
          <p className="text-xs text-bb-gray-500">Plano Atual</p>
          <h2 className="mt-1 text-lg font-bold text-bb-black">{subscription.plan_name}</h2>
          <p className="text-2xl font-bold text-bb-red">R$ {subscription.plan_price.toLocaleString('pt-BR')}<span className="text-sm font-normal text-bb-gray-500">/{subscription.plan_interval === 'monthly' ? 'mês' : subscription.plan_interval === 'quarterly' ? 'trim' : 'ano'}</span></p>
          <p className="mt-2 text-xs text-bb-gray-500">Próximo vencimento: {new Date(subscription.current_period_end).toLocaleDateString('pt-BR')}</p>
          <Button variant="ghost" size="sm" className="mt-3" onClick={() => setChangePlanModal(true)}>Trocar Plano</Button>
        </Card>
      )}

      {/* Histórico */}
      <Card className="overflow-hidden">
        <div className="border-b border-bb-gray-300 p-4">
          <h2 className="font-semibold text-bb-black">Histórico de Faturas</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-bb-gray-300 bg-bb-gray-100">
              <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Mês</th>
              <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Valor</th>
              <th className="px-4 py-3 text-center font-medium text-bb-gray-500">Status</th>
              <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Boleto</th>
            </tr></thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className={`border-b border-bb-gray-100 ${inv.status === 'uncollectible' ? 'bg-red-50' : ''}`}>
                  <td className="px-4 py-3 text-bb-black">{new Date(inv.due_date).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</td>
                  <td className="px-4 py-3 text-right text-bb-gray-500">R$ {inv.amount.toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${inv.status === 'paid' ? 'bg-green-100 text-green-700' : inv.status === 'uncollectible' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {STATUS_LABEL[inv.status] || inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {inv.status !== 'paid' && (
                      <button className="text-xs text-bb-red hover:underline">Ver boleto</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={changePlanModal} onClose={() => setChangePlanModal(false)} title="Trocar Plano">
        <div className="space-y-3">
          {plans.map((plan) => (
            <Card key={plan.id} className={`cursor-pointer p-3 ${subscription?.plan_id === plan.id ? 'ring-2 ring-bb-red' : ''}`} onClick={() => { toast(`Plano alterado para ${plan.name}`, 'success'); setChangePlanModal(false); }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-bb-black">{plan.name}</p>
                  <p className="text-xs text-bb-gray-500">{plan.features.slice(0, 2).join(' · ')}</p>
                </div>
                <p className="text-lg font-bold text-bb-red">R$ {plan.price}</p>
              </div>
            </Card>
          ))}
        </div>
      </Modal>
    </div>
  );
}
