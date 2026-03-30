'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/lib/hooks/useToast';
import { getChildrenBills } from '@/lib/api/parent-payment.service';
import type { ChildBill } from '@/lib/api/parent-payment.service';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { PlanGate } from '@/components/plans/PlanGate';
import { translateError } from '@/lib/utils/error-translator';

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  paid: { label: 'Pago', color: 'var(--bb-success)', bg: 'var(--bb-success-surface)' },
  pending: { label: 'Pendente', color: 'var(--bb-warning)', bg: 'var(--bb-warning-surface)' },
  overdue: { label: 'Atrasado', color: 'var(--bb-error)', bg: 'rgba(239, 68, 68, 0.08)' },
};

export default function ParentPagamentosPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [bills, setBills] = useState<ChildBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChildId, setSelectedChildId] = useState<string>('');

  const parentId = profile?.id ?? '';

  const loadData = useCallback(async () => {
    if (!parentId) return;
    try {
      const data = await getChildrenBills(parentId);
      setBills(data);
      // Auto-select first child if present
      if (data.length > 0) {
        const firstChildId = data[0].childId;
        setSelectedChildId(firstChildId);
      }
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="space-y-4 p-4 lg:p-6">
        <Skeleton variant="text" className="h-8 w-48" />
        <Skeleton variant="card" className="h-40" />
        <Skeleton variant="card" className="h-64" />
      </div>
    );
  }

  // Get unique children from bills
  const childrenMap = new Map<string, { id: string; name: string }>();
  for (const bill of bills) {
    if (!childrenMap.has(bill.childId)) {
      childrenMap.set(bill.childId, { id: bill.childId, name: bill.childName });
    }
  }
  const children = [...childrenMap.values()];

  // Filter bills for selected child
  const selectedBills = selectedChildId
    ? bills.filter((b) => b.childId === selectedChildId)
    : bills;

  const pendingBills = selectedBills.filter((b) => b.status !== 'paid');
  const paidBills = selectedBills.filter((b) => b.status === 'paid');

  // Calculate total pending amount
  const totalPending = pendingBills.reduce((sum, b) => sum + b.amount, 0);

  return (
    <PlanGate module="financeiro">
      <div className="space-y-6 p-4 lg:p-6">
        <h1 className="text-xl font-extrabold text-[var(--bb-ink-100)]">Pagamentos</h1>
        <p className="text-sm text-[var(--bb-ink-60)]">Gerencie as mensalidades dos seus filhos</p>

        {/* Total consolidado */}
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase text-[var(--bb-ink-40)]">Total Pendente</p>
          <p className="mt-1 text-2xl font-extrabold text-[var(--bb-brand)]">
            R$ {totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-[var(--bb-ink-40)]">
            {pendingBills.length} fatura{pendingBills.length !== 1 ? 's' : ''} pendente{pendingBills.length !== 1 ? 's' : ''}
          </p>
        </Card>

        {/* Seletor de filho */}
        {children.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedChildId('')}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                !selectedChildId
                  ? 'text-white shadow-md'
                  : 'bg-[var(--bb-depth-4)] text-[var(--bb-ink-60)]'
              }`}
              style={!selectedChildId ? { background: 'var(--bb-brand-gradient)' } : {}}
            >
              Todos
            </button>
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => setSelectedChildId(child.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                  selectedChildId === child.id
                    ? 'text-white shadow-md'
                    : 'bg-[var(--bb-depth-4)] text-[var(--bb-ink-60)]'
                }`}
                style={selectedChildId === child.id ? { background: 'var(--bb-brand-gradient)' } : {}}
              >
                {child.name}
              </button>
            ))}
          </div>
        )}

        {/* Faturas pendentes */}
        {pendingBills.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-[var(--bb-ink-40)]">
              Pendentes
            </h2>
            <div className="space-y-3">
              {pendingBills.map((bill) => {
                const st = STATUS_LABEL[bill.status] ?? STATUS_LABEL.pending;
                return (
                  <Card key={bill.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-[var(--bb-ink-100)]">
                          {bill.childName} — {bill.plan}
                        </p>
                        <p className="mt-0.5 text-xs text-[var(--bb-ink-40)]">
                          Ref: {bill.referenceMonth} | Vence: {new Date(bill.dueDate).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                          style={{ backgroundColor: st.bg, color: st.color }}
                        >
                          {st.label}
                        </span>
                        <span className="text-sm font-extrabold text-[var(--bb-ink-100)]">
                          R$ {bill.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Historico de pagamentos */}
        <div>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-[var(--bb-ink-40)]">
            Historico
          </h2>
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'var(--bb-depth-4)', borderBottom: '1px solid var(--bb-glass-border)' }}>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--bb-ink-40)]">Filho</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--bb-ink-40)]">Ref.</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[var(--bb-ink-40)]">Valor</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--bb-ink-40)]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paidBills.length === 0 && pendingBills.length === 0 ? (
                    <tr>
                      <td colSpan={4}>
                        <EmptyState
                          icon="📄"
                          title="Nenhuma fatura encontrada"
                          description="As faturas dos seus filhos aparecerão aqui quando forem geradas."
                          variant="first-time"
                        />
                      </td>
                    </tr>
                  ) : paidBills.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-sm text-[var(--bb-ink-40)]">
                        Nenhum pagamento registrado ainda
                      </td>
                    </tr>
                  ) : (
                    paidBills.map((bill) => {
                      const st = STATUS_LABEL[bill.status] ?? STATUS_LABEL.paid;
                      return (
                        <tr key={bill.id} style={{ borderBottom: '1px solid var(--bb-glass-border)' }}>
                          <td className="px-4 py-3 font-medium text-[var(--bb-ink-100)]">{bill.childName}</td>
                          <td className="px-4 py-3 text-[var(--bb-ink-60)]">{bill.referenceMonth}</td>
                          <td className="px-4 py-3 text-right text-[var(--bb-ink-60)]">
                            R$ {bill.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold"
                              style={{ backgroundColor: st.bg, color: st.color }}
                            >
                              {st.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </PlanGate>
  );
}
