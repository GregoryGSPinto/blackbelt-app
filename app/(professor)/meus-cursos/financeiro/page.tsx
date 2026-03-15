'use client';

import { useEffect, useState } from 'react';
import { getCreatorBalance, requestWithdrawal, getWithdrawalHistory, type BalanceDTO, type WithdrawalRecord } from '@/lib/api/marketplace-payment.service';
import { getCourseAnalytics, type CourseAnalytics } from '@/lib/api/course-creator.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/lib/hooks/useToast';

const STATUS_LABEL: Record<string, string> = { pending: 'Pendente', processing: 'Processando', completed: 'Concluído', failed: 'Falhou' };
const STATUS_COLOR: Record<string, string> = { pending: 'bg-yellow-100 text-yellow-700', processing: 'bg-blue-100 text-blue-700', completed: 'bg-green-100 text-green-700', failed: 'bg-red-100 text-red-700' };

export default function FinanceiroPage() {
  const { toast } = useToast();
  const [balance, setBalance] = useState<BalanceDTO | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [analytics, setAnalytics] = useState<CourseAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    Promise.all([
      getCreatorBalance('prof-1'),
      getWithdrawalHistory('prof-1'),
      getCourseAnalytics('prof-1'),
    ])
      .then(([b, w, a]) => {
        setBalance(b);
        setWithdrawals(w);
        setAnalytics(a);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleWithdraw() {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0 || !balance || amount > balance.available) return;
    setWithdrawing(true);
    try {
      const record = await requestWithdrawal('prof-1', amount);
      setWithdrawals((prev) => [record, ...prev]);
      setBalance((prev) => prev ? { ...prev, available: prev.available - amount, pending: prev.pending + amount } : prev);
      setWithdrawModal(false);
      setWithdrawAmount('');
      toast('Saque solicitado com sucesso!', 'success');
    } catch {
      toast('Erro ao solicitar saque', 'error');
    } finally {
      setWithdrawing(false);
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!balance) return null;

  // Monthly revenue chart data from analytics
  const monthlyRevenue = analytics.length > 0 ? analytics[0].monthly_data : [];

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-bb-black">Financeiro</h1>
        <Button onClick={() => setWithdrawModal(true)}>Solicitar Saque</Button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Disponível', value: balance.available, color: 'text-green-600' },
          { label: 'Pendente', value: balance.pending, color: 'text-yellow-600' },
          { label: 'Total Ganho', value: balance.total_earned, color: 'text-bb-black' },
          { label: 'Total Sacado', value: balance.total_withdrawn, color: 'text-bb-gray-500' },
        ].map((item) => (
          <Card key={item.label} className="p-3">
            <p className="text-xs text-bb-gray-500">{item.label}</p>
            <p className={`mt-1 text-lg font-bold ${item.color}`}>
              R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </Card>
        ))}
      </div>

      {/* Monthly Revenue Chart */}
      {monthlyRevenue.length > 0 && (
        <Card className="p-4">
          <h2 className="mb-4 font-semibold text-bb-black">Receita Mensal</h2>
          <div className="flex items-end gap-2 h-40">
            {monthlyRevenue.map((m, i) => {
              const maxRev = Math.max(...monthlyRevenue.map((d) => d.revenue), 1);
              const height = (m.revenue / maxRev) * 100;
              return (
                <div key={i} className="group relative flex-1 flex flex-col items-center">
                  <div
                    className="w-full rounded-t bg-bb-red transition-opacity hover:opacity-80"
                    style={{ height: `${Math.max(height, 2)}%` }}
                  />
                  <span className="mt-1 text-[10px] text-bb-gray-500">{m.month}</span>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap rounded bg-bb-black px-2 py-0.5 text-[10px] text-white">
                    R$ {m.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Revenue per course */}
      <Card className="p-4">
        <h2 className="mb-3 font-semibold text-bb-black">Receita por Curso</h2>
        <div className="space-y-3">
          {analytics.filter((a) => a.revenue > 0).map((a) => (
            <div key={a.course_id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-bb-black">{a.course_title}</p>
                <p className="text-xs text-bb-gray-500">{a.sales} vendas · {a.reviews} avaliações</p>
              </div>
              <span className="font-bold text-bb-black">
                R$ {a.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Withdrawal History */}
      <Card className="overflow-hidden">
        <div className="border-b border-bb-gray-300 p-4">
          <h2 className="font-semibold text-bb-black">Histórico de Saques</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bb-gray-300 bg-bb-gray-100">
                <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Data</th>
                <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Valor</th>
                <th className="px-4 py-3 text-center font-medium text-bb-gray-500">Status</th>
                <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Conta</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w) => (
                <tr key={w.id} className="border-b border-bb-gray-100">
                  <td className="px-4 py-3 text-bb-gray-500">
                    {new Date(w.requested_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-bb-black">
                    R$ {w.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[w.status]}`}>
                      {STATUS_LABEL[w.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-bb-gray-500">{w.bank_info}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Withdraw Modal */}
      <Modal open={withdrawModal} onClose={() => setWithdrawModal(false)} title="Solicitar Saque">
        <div className="space-y-4">
          <p className="text-sm text-bb-gray-500">
            Saldo disponível: <strong className="text-green-600">R$ {balance.available.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
          </p>
          <div>
            <label className="block text-sm font-medium text-bb-black">Valor do saque (R$)</label>
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              max={balance.available}
              className="mt-1 w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <p className="text-xs text-bb-gray-500">O saque será depositado na conta bancária cadastrada em até 2 dias úteis.</p>
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => setWithdrawModal(false)}>Cancelar</Button>
            <Button
              className="flex-1"
              onClick={handleWithdraw}
              loading={withdrawing}
              disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > balance.available}
            >
              Confirmar Saque
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
