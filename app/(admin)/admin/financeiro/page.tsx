'use client';

import { useState, useEffect, useCallback } from 'react';
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
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);
    getFinanceiroData('academy-1')
      .then(setData)
      .catch((err) => {
        const msg = err instanceof Error ? err.message : 'Erro desconhecido';
        console.error('[financeiro] Falha ao carregar:', msg, err);
        setError(msg);
        toast('Erro ao carregar dados financeiros', 'error');
      })
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
        <p className="text-lg font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
          Erro ao carregar dados financeiros
        </p>
        <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          {error ?? 'Dados indisponiveis'}
        </p>
        <Button onClick={loadData}>Tentar novamente</Button>
      </div>
    );
  }

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
      <div
        className="rounded-xl p-6"
        style={{ background: 'var(--bb-brand-gradient)', color: '#fff' }}
      >
        <p className="text-sm font-medium uppercase tracking-wide opacity-80">
          Receita Marco
        </p>
        <p className="mt-1 text-4xl font-extrabold tracking-tight">
          R$ {data.receitaMes.toLocaleString('pt-BR')}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
          <span className={trendUp ? 'opacity-90' : 'opacity-70'}>
            {trendUp ? '\u2191' : '\u2193'}{Math.abs(trendPct)}% vs fev
          </span>
          <span className="opacity-60">|</span>
          <span className={goalPct >= 90 ? 'opacity-90' : 'opacity-70'}>
            {goalPct}% da meta
          </span>
          {/* Progress bar */}
          <div className="flex flex-1 items-center gap-2">
            <div className="h-2 flex-1 rounded-full bg-white/20">
              <div
                className="h-2 rounded-full bg-white/80 transition-all"
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
            <p className="text-xs font-medium uppercase text-[var(--bb-ink-60)]">{kpi.label}</p>
            <p className={`mt-1 text-2xl font-bold ${kpi.danger ? 'text-[var(--bb-brand)]' : 'text-[var(--bb-ink-100)]'}`}>
              {kpi.value}
            </p>
            <p className="mt-0.5 text-xs text-[var(--bb-ink-60)]">{kpi.sub}</p>
          </Card>
        ))}
      </div>

      {/* ── RED: Quem esta devendo ──────────────────────────────────── */}
      {data.debtors.length > 0 && (
        <div className="rounded-xl border-2 border-[var(--bb-brand)] bg-[var(--bb-brand-surface)] p-5">
          <h2 className="mb-3 text-lg font-bold text-[var(--bb-brand)]">
            QUEM ESTA DEVENDO ({data.debtors.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--bb-brand)]/20">
                  <th className="px-3 py-2 text-left font-medium text-[var(--bb-brand)]">Nome</th>
                  <th className="px-3 py-2 text-left font-medium text-[var(--bb-brand)]">Plano</th>
                  <th className="px-3 py-2 text-right font-medium text-[var(--bb-brand)]">Valor</th>
                  <th className="px-3 py-2 text-right font-medium text-[var(--bb-brand)]">Dias atraso</th>
                  <th className="px-3 py-2 text-right font-medium text-[var(--bb-brand)]">Acao</th>
                </tr>
              </thead>
              <tbody>
                {data.debtors.map((d) => (
                  <tr key={d.student_id} className="border-b border-[var(--bb-brand)]/10">
                    <td className="px-3 py-3 font-medium text-[var(--bb-ink-100)]">{d.name}</td>
                    <td className="px-3 py-3 text-[var(--bb-ink-80)]">{d.plan}</td>
                    <td className="px-3 py-3 text-right font-semibold text-[var(--bb-ink-100)]">
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
        <h2 className="mb-4 font-semibold text-[var(--bb-ink-100)]">Receita - Ultimos 6 Meses</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.monthlyRevenue} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bb-ink-20)" strokeOpacity={0.5} vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'var(--bb-ink-40)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--bb-ink-40)', fontSize: 12 }} tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}k`} />
              <Tooltip
                formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, 'Receita']}
                contentStyle={{ backgroundColor: 'var(--bb-depth-4)', border: '1px solid var(--bb-glass-border)', borderRadius: 12, color: 'var(--bb-ink-100)' }}
              />
              <Bar dataKey="receita" fill="var(--bb-brand)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* ── Payments Table ──────────────────────────────────────────── */}
      <Card className="overflow-hidden">
        <div className="border-b border-[var(--bb-glass-border)] p-4">
          <h2 className="font-semibold text-[var(--bb-ink-100)]">Pagamentos Recentes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--bb-glass-border)] bg-[var(--bb-depth-4)]">
                <th className="px-4 py-3 text-left font-medium text-[var(--bb-ink-60)]">Nome</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--bb-ink-60)]">Plano</th>
                <th className="px-4 py-3 text-right font-medium text-[var(--bb-ink-60)]">Valor</th>
                <th className="px-4 py-3 text-center font-medium text-[var(--bb-ink-60)]">Metodo</th>
                <th className="px-4 py-3 text-right font-medium text-[var(--bb-ink-60)]">Data</th>
              </tr>
            </thead>
            <tbody>
              {data.recentPayments.map((p) => (
                <tr key={p.id} className="border-b border-[var(--bb-glass-border)]">
                  <td className="px-4 py-3 font-medium text-[var(--bb-ink-100)]">{p.name}</td>
                  <td className="px-4 py-3 text-[var(--bb-ink-60)]">{p.plan}</td>
                  <td className="px-4 py-3 text-right text-[var(--bb-ink-100)]">
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
                  <td className="px-4 py-3 text-right text-[var(--bb-ink-60)]">
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
        <div className="border-b border-[var(--bb-glass-border)] p-4">
          <h2 className="font-semibold text-[var(--bb-ink-100)]">Analise por Plano</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--bb-glass-border)] bg-[var(--bb-depth-4)]">
                <th className="px-4 py-3 text-left font-medium text-[var(--bb-ink-60)]">Plano</th>
                <th className="px-4 py-3 text-right font-medium text-[var(--bb-ink-60)]">Assinantes</th>
                <th className="px-4 py-3 text-right font-medium text-[var(--bb-ink-60)]">Receita</th>
                <th className="px-4 py-3 text-right font-medium text-[var(--bb-ink-60)]">% do Total</th>
              </tr>
            </thead>
            <tbody>
              {data.planAnalysis.map((plan) => (
                <tr key={plan.plan_id} className="border-b border-[var(--bb-glass-border)]">
                  <td className="px-4 py-3 font-medium text-[var(--bb-ink-100)]">{plan.plan_name}</td>
                  <td className="px-4 py-3 text-right text-[var(--bb-ink-80)]">{plan.subscriber_count}</td>
                  <td className="px-4 py-3 text-right font-semibold text-[var(--bb-ink-100)]">
                    R$ {plan.revenue.toLocaleString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-2 w-20 rounded-full bg-[var(--bb-depth-4)]">
                        <div
                          className="h-2 rounded-full bg-[var(--bb-brand)]"
                          style={{ width: `${plan.pct_of_total}%` }}
                        />
                      </div>
                      <span className="text-[var(--bb-ink-60)]">{plan.pct_of_total}%</span>
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
