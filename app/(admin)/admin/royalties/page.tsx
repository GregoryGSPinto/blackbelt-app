'use client';

import { useEffect, useState } from 'react';
import {
  getRoyaltyHistory,
  payRoyalty,
  type RoyaltyHistorySummary,
  type RoyaltyStatus,
} from '@/lib/api/royalties.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/lib/hooks/useToast';

const STATUS_LABEL: Record<RoyaltyStatus, string> = { pendente: 'Pendente', pago: 'Pago', atrasado: 'Atrasado', parcial: 'Parcial' };
const STATUS_COLOR: Record<RoyaltyStatus, string> = { pendente: 'bg-yellow-100 text-yellow-700', pago: 'bg-green-100 text-green-700', atrasado: 'bg-red-100 text-red-700', parcial: 'bg-orange-100 text-orange-700' };

export default function AdminRoyaltiesPage() {
  const { toast } = useToast();
  const [history, setHistory] = useState<RoyaltyHistorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<string | null>(null);

  useEffect(() => {
    getRoyaltyHistory('franchise-1')
      .then((data) => {
        // Filter to show only this academy's royalties
        const myCalcs = data.calculations.filter((c) => c.academy_id === 'acad-1');
        setHistory({
          ...data,
          calculations: myCalcs,
          total_collected: myCalcs.filter((c) => c.status === 'pago').reduce((s, c) => s + c.total_due, 0),
          total_pending: myCalcs.filter((c) => c.status === 'pendente').reduce((s, c) => s + c.total_due, 0),
          total_overdue: myCalcs.filter((c) => c.status === 'atrasado').reduce((s, c) => s + c.total_due, 0),
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handlePay(calcId: string) {
    setPaying(calcId);
    try {
      await payRoyalty(calcId);
      setHistory((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          calculations: prev.calculations.map((c) =>
            c.id === calcId ? { ...c, status: 'pago' as RoyaltyStatus, paid_date: new Date().toISOString() } : c
          ),
        };
      });
      toast('Pagamento registrado com sucesso', 'success');
    } catch {
      toast('Erro ao registrar pagamento', 'error');
    } finally {
      setPaying(null);
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!history) return <div className="p-6 text-bb-gray-500">Erro ao carregar dados de royalties.</div>;

  const nextDue = history.calculations.find((c) => c.status === 'pendente' || c.status === 'atrasado');

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-xl font-bold text-bb-black">Meus Royalties</h1>

      {/* Next due alert */}
      {nextDue && (
        <Card className={`border-l-4 p-4 ${nextDue.status === 'atrasado' ? 'border-l-red-500 bg-red-50' : 'border-l-yellow-500 bg-yellow-50'}`}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-bb-black">
                {nextDue.status === 'atrasado' ? 'Royalty em Atraso' : 'Proximo Vencimento'}
              </p>
              <p className="text-xs text-bb-gray-500">
                Referente a {nextDue.month} - Vencimento: {new Date(nextDue.due_date).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-lg font-bold text-bb-black">R$ {nextDue.total_due.toLocaleString('pt-BR')}</p>
              <Button
                variant={nextDue.status === 'atrasado' ? 'danger' : 'primary'}
                onClick={() => handlePay(nextDue.id)}
                loading={paying === nextDue.id}
              >
                Pagar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs text-bb-gray-500">Total Pago (12m)</p>
          <p className="mt-1 text-2xl font-bold text-green-600">R$ {history.total_collected.toLocaleString('pt-BR')}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-bb-gray-500">Pendente</p>
          <p className="mt-1 text-2xl font-bold text-yellow-600">R$ {history.total_pending.toLocaleString('pt-BR')}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-bb-gray-500">Em Atraso</p>
          <p className="mt-1 text-2xl font-bold text-red-600">R$ {history.total_overdue.toLocaleString('pt-BR')}</p>
        </Card>
      </div>

      {/* History table */}
      <Card className="overflow-hidden">
        <div className="border-b border-bb-gray-300 p-4">
          <h2 className="font-semibold text-bb-black">Historico de Royalties</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bb-gray-300 bg-bb-gray-100">
                <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Mes</th>
                <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Receita</th>
                <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Royalty (8%)</th>
                <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Fundo Mkt (2%)</th>
                <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Total</th>
                <th className="px-4 py-3 text-center font-medium text-bb-gray-500">Status</th>
                <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Vencimento</th>
                <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {history.calculations.map((calc) => (
                <tr key={calc.id} className={`border-b border-bb-gray-100 ${calc.status === 'atrasado' ? 'bg-red-50' : ''}`}>
                  <td className="px-4 py-3 font-medium text-bb-black">{calc.month}</td>
                  <td className="px-4 py-3 text-right text-bb-gray-500">R$ {calc.gross_revenue.toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-3 text-right text-bb-gray-500">R$ {calc.royalty_amount.toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-3 text-right text-bb-gray-500">R$ {calc.marketing_fund_amount.toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-3 text-right font-bold text-bb-black">R$ {calc.total_due.toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[calc.status]}`}>
                      {STATUS_LABEL[calc.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-bb-gray-500">{new Date(calc.due_date).toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 py-3 text-right">
                    {(calc.status === 'pendente' || calc.status === 'atrasado') && (
                      <button
                        onClick={() => handlePay(calc.id)}
                        disabled={paying === calc.id}
                        className="text-xs text-bb-red hover:underline disabled:opacity-50"
                      >
                        {paying === calc.id ? 'Pagando...' : 'Pagar'}
                      </button>
                    )}
                    {calc.status === 'pago' && calc.paid_date && (
                      <span className="text-xs text-bb-gray-500">Pago em {new Date(calc.paid_date).toLocaleDateString('pt-BR')}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
