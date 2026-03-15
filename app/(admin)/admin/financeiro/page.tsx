'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getFinanceiroData } from '@/lib/api/financeiro.service';
import type { FinanceiroData } from '@/lib/api/financeiro.service';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/hooks/useToast';

const BarChart = dynamic(() => import('recharts').then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then((m) => m.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then((m) => m.ResponsiveContainer), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then((m) => m.CartesianGrid), { ssr: false });

const METHOD_LABEL: Record<string, string> = {
  PIX: 'PIX',
  boleto: 'Boleto',
  cartao: 'Cartao',
};

export default function AdminFinanceiroPremiumPage() {
  const { toast } = useToast();
  const [data, setData] = useState<FinanceiroData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFinanceiroData('academy-1')
      .then(setData)
      .catch(() => toast('Erro ao carregar dados financeiros', 'error'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton variant="text" className="h-16 w-72" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="card" className="h-24" />
          ))}
        </div>
        <Skeleton variant="card" className="h-64" />
      </div>
    );
  }

  if (!data) return null;

  const trendPct = data.receitaMesAnterior > 0
    ? Math.round(((data.receitaMes - data.receitaMesAnterior) / data.receitaMesAnterior) * 100)
    : 0;
  const trendUp = trendPct >= 0;
  const goalPct = data.metaMes > 0 ? Math.round((data.receitaMes / data.metaMes) * 100) : 0;

  function handleCobrar(studentId: string) {
    toast(`Cobranca enviada para ${studentId}`, 'success');
  }

  return (
    <div className="space-y-6 p-6">
      {/* ── TOP: Receita Hero ───────────────────────────────────────── */}
      <div className="rounded-xl bg-gradient-to-r from-bb-gray-900 to-bb-gray-700 p-6 text-bb-white">
        <p className="text-sm font-medium uppercase tracking-wide opacity-70">
          Receita Marco
        </p>
        <p className="mt-1 text-4xl font-extrabold tracking-tight">
          R$ {data.receitaMes.toLocaleString('pt-BR')}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
          <span className={trendUp ? 'text-green-400' : 'text-red-400'}>
            {trendUp ? '\u2191' : '\u2193'}{Math.abs(trendPct)}% vs fev
          </span>
          <span className="opacity-70">|</span>
          <span>
            <span className={goalPct >= 90 ? 'text-green-400' : 'text-yellow-400'}>
              {goalPct}% da meta
            </span>
          </span>
          {/* Progress bar */}
          <div className="flex flex-1 items-center gap-2">
            <div className="h-2 flex-1 rounded-full bg-bb-gray-500">
              <div
                className="h-2 rounded-full bg-green-400 transition-all"
                style={{ width: `${Math.min(goalPct, 100)}%` }}
              />
            </div>
            <span className="text-xs opacity-70">R$ {data.metaMes.toLocaleString('pt-BR')}</span>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'MRR', value: `R$ ${data.mrr.toLocaleString('pt-BR')}`, sub: 'Receita recorrente' },
          { label: 'Ticket Medio', value: `R$ ${data.ticketMedio}`, sub: 'Por aluno pagante' },
          { label: 'Inadimplencia', value: `${data.inadimplenciaPct}%`, sub: 'Do total esperado', danger: data.inadimplenciaPct > 5 },
          { label: 'Previsao Abril', value: `R$ ${data.previsaoProximoMes.toLocaleString('pt-BR')}`, sub: 'Estimativa' },
        ].map((kpi) => (
          <Card key={kpi.label} className="p-4">
            <p className="text-xs font-medium uppercase text-bb-gray-500">{kpi.label}</p>
            <p className={`mt-1 text-2xl font-bold ${kpi.danger ? 'text-bb-red' : 'text-bb-gray-900'}`}>
              {kpi.value}
            </p>
            <p className="mt-0.5 text-xs text-bb-gray-500">{kpi.sub}</p>
          </Card>
        ))}
      </div>

      {/* ── RED: Quem esta devendo ──────────────────────────────────── */}
      {data.debtors.length > 0 && (
        <div className="rounded-xl border-2 border-bb-red bg-red-50 p-5">
          <h2 className="mb-3 text-lg font-bold text-bb-red">
            QUEM ESTA DEVENDO ({data.debtors.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-red-200">
                  <th className="px-3 py-2 text-left font-medium text-bb-red">Nome</th>
                  <th className="px-3 py-2 text-left font-medium text-bb-red">Plano</th>
                  <th className="px-3 py-2 text-right font-medium text-bb-red">Valor</th>
                  <th className="px-3 py-2 text-right font-medium text-bb-red">Dias atraso</th>
                  <th className="px-3 py-2 text-right font-medium text-bb-red">Acao</th>
                </tr>
              </thead>
              <tbody>
                {data.debtors.map((d) => (
                  <tr key={d.student_id} className="border-b border-red-100">
                    <td className="px-3 py-3 font-medium text-bb-gray-900">{d.name}</td>
                    <td className="px-3 py-3 text-bb-gray-700">{d.plan}</td>
                    <td className="px-3 py-3 text-right font-semibold text-bb-gray-900">
                      R$ {d.amount.toLocaleString('pt-BR')}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-bold ${
                        d.days_overdue > 15 ? 'bg-red-200 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {d.days_overdue}d
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <Button size="sm" onClick={() => handleCobrar(d.student_id)}>
                        Cobrar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Chart: Receita 6 meses ──────────────────────────────────── */}
      <Card className="p-4">
        <h2 className="mb-4 font-semibold text-bb-gray-900">Receita - Ultimos 6 Meses</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.monthlyRevenue} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}k`} />
              <Tooltip
                formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, 'Receita']}
                contentStyle={{ borderRadius: 8, fontSize: 13 }}
              />
              <Bar dataKey="receita" fill="#dc2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* ── Payments Table ──────────────────────────────────────────── */}
      <Card className="overflow-hidden">
        <div className="border-b border-bb-gray-300 p-4">
          <h2 className="font-semibold text-bb-gray-900">Pagamentos Recentes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bb-gray-300 bg-bb-gray-100">
                <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Nome</th>
                <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Plano</th>
                <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Valor</th>
                <th className="px-4 py-3 text-center font-medium text-bb-gray-500">Metodo</th>
                <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Data</th>
              </tr>
            </thead>
            <tbody>
              {data.recentPayments.map((p) => (
                <tr key={p.id} className="border-b border-bb-gray-100">
                  <td className="px-4 py-3 font-medium text-bb-gray-900">{p.name}</td>
                  <td className="px-4 py-3 text-bb-gray-500">{p.plan}</td>
                  <td className="px-4 py-3 text-right text-bb-gray-900">
                    R$ {p.amount.toLocaleString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.method === 'PIX'
                        ? 'bg-green-100 text-green-700'
                        : p.method === 'boleto'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                    }`}>
                      {METHOD_LABEL[p.method]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-bb-gray-500">
                    {new Date(p.date).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Plan Analysis ───────────────────────────────────────────── */}
      <Card className="overflow-hidden">
        <div className="border-b border-bb-gray-300 p-4">
          <h2 className="font-semibold text-bb-gray-900">Analise por Plano</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bb-gray-300 bg-bb-gray-100">
                <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Plano</th>
                <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Assinantes</th>
                <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Receita</th>
                <th className="px-4 py-3 text-right font-medium text-bb-gray-500">% do Total</th>
              </tr>
            </thead>
            <tbody>
              {data.planAnalysis.map((plan) => (
                <tr key={plan.plan_id} className="border-b border-bb-gray-100">
                  <td className="px-4 py-3 font-medium text-bb-gray-900">{plan.plan_name}</td>
                  <td className="px-4 py-3 text-right text-bb-gray-700">{plan.subscriber_count}</td>
                  <td className="px-4 py-3 text-right font-semibold text-bb-gray-900">
                    R$ {plan.revenue.toLocaleString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-2 w-20 rounded-full bg-bb-gray-100">
                        <div
                          className="h-2 rounded-full bg-bb-red"
                          style={{ width: `${plan.pct_of_total}%` }}
                        />
                      </div>
                      <span className="text-bb-gray-500">{plan.pct_of_total}%</span>
                    </div>
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
