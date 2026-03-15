'use client';

import { useEffect, useState } from 'react';
import { getPlatformRevenue, getTopCreators, getPendingApprovals, type PlatformRevenue, type TopCreator, type PendingApproval } from '@/lib/api/marketplace-payment.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/lib/hooks/useToast';

export default function AdminMarketplacePage() {
  const { toast } = useToast();
  const [revenue, setRevenue] = useState<PlatformRevenue | null>(null);
  const [topCreators, setTopCreators] = useState<TopCreator[]>([]);
  const [pending, setPending] = useState<PendingApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [commissionRate, setCommissionRate] = useState(20);
  const [tab, setTab] = useState<'overview' | 'creators' | 'approvals'>('overview');

  useEffect(() => {
    Promise.all([
      getPlatformRevenue('6m'),
      getTopCreators(),
      getPendingApprovals(),
    ])
      .then(([r, tc, p]) => {
        setRevenue(r);
        setTopCreators(tc);
        setPending(p);
        if (r) setCommissionRate(r.commission_rate);
      })
      .finally(() => setLoading(false));
  }, []);

  function handleApproveCourse(courseId: string) {
    setPending((prev) => prev.filter((p) => p.course_id !== courseId));
    toast('Curso aprovado!', 'success');
  }

  function handleRejectCourse(courseId: string) {
    setPending((prev) => prev.filter((p) => p.course_id !== courseId));
    toast('Curso rejeitado', 'success');
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!revenue) return null;

  const TABS: { id: typeof tab; label: string }[] = [
    { id: 'overview', label: 'Visão Geral' },
    { id: 'creators', label: 'Criadores' },
    { id: 'approvals', label: `Aprovações (${pending.length})` },
  ];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-xl font-bold text-bb-black">Marketplace - Admin</h1>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-bb-gray-100 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-white text-bb-black shadow-sm' : 'text-bb-gray-500 hover:text-bb-black'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: 'Receita Total', value: `R$ ${revenue.total_revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
              { label: 'Comissão Plataforma', value: `R$ ${revenue.platform_commission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
              { label: 'Repasses Criadores', value: `R$ ${revenue.creator_payouts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
              { label: 'Taxa de Comissão', value: `${revenue.commission_rate}%` },
            ].map((kpi) => (
              <Card key={kpi.label} className="p-4">
                <p className="text-xs text-bb-gray-500">{kpi.label}</p>
                <p className="mt-1 text-2xl font-bold text-bb-black">{kpi.value}</p>
              </Card>
            ))}
          </div>

          {/* Revenue Chart */}
          <Card className="p-4">
            <h2 className="mb-4 font-semibold text-bb-black">Receita x Comissão (6 meses)</h2>
            <div className="flex items-end gap-3 h-48">
              {revenue.monthly_data.map((m, i) => {
                const maxRev = Math.max(...revenue.monthly_data.map((d) => d.revenue), 1);
                const revHeight = (m.revenue / maxRev) * 100;
                const comHeight = (m.commission / maxRev) * 100;
                return (
                  <div key={i} className="group relative flex-1 flex flex-col items-center">
                    <div className="flex w-full gap-0.5">
                      <div
                        className="flex-1 rounded-t bg-bb-red/20"
                        style={{ height: `${Math.max(revHeight, 2)}%` }}
                      />
                      <div
                        className="flex-1 rounded-t bg-bb-red"
                        style={{ height: `${Math.max(comHeight, 2)}%` }}
                      />
                    </div>
                    <span className="mt-1 text-[10px] text-bb-gray-500">{m.month}</span>
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap rounded bg-bb-black px-2 py-1 text-[10px] text-white">
                      <div>Receita: R$ {m.revenue.toLocaleString('pt-BR')}</div>
                      <div>Comissão: R$ {m.commission.toLocaleString('pt-BR')}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex gap-4 text-xs text-bb-gray-500">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-bb-red/20" /> Receita Total</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-bb-red" /> Comissão</span>
            </div>
          </Card>

          {/* Commission Config */}
          <Card className="p-4">
            <h2 className="mb-3 font-semibold text-bb-black">Configuração de Comissão</h2>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-bb-black">Taxa de Comissão (%)</label>
                <input
                  type="number"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Number(e.target.value))}
                  min={0}
                  max={100}
                  className="mt-1 w-32 rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
                />
                <p className="mt-1 text-xs text-bb-gray-500">Percentual retido pela plataforma em cada venda</p>
              </div>
              <Button onClick={() => toast('Comissão atualizada!', 'success')}>
                Salvar
              </Button>
            </div>
          </Card>
        </>
      )}

      {/* Creators Tab */}
      {tab === 'creators' && (
        <Card className="overflow-hidden">
          <div className="border-b border-bb-gray-300 p-4">
            <h2 className="font-semibold text-bb-black">Top Criadores</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-bb-gray-300 bg-bb-gray-100">
                  <th className="px-4 py-3 text-left font-medium text-bb-gray-500">#</th>
                  <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Criador</th>
                  <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Academia</th>
                  <th className="px-4 py-3 text-center font-medium text-bb-gray-500">Cursos</th>
                  <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Vendas</th>
                  <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Receita</th>
                </tr>
              </thead>
              <tbody>
                {topCreators.map((creator, i) => (
                  <tr key={creator.creator_id} className="border-b border-bb-gray-100">
                    <td className="px-4 py-3 font-bold text-bb-gray-500">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-bb-black">{creator.creator_name}</td>
                    <td className="px-4 py-3 text-bb-gray-500">{creator.academy}</td>
                    <td className="px-4 py-3 text-center text-bb-gray-500">{creator.courses_count}</td>
                    <td className="px-4 py-3 text-right text-bb-gray-500">{creator.total_sales.toLocaleString('pt-BR')}</td>
                    <td className="px-4 py-3 text-right font-medium text-bb-black">
                      R$ {creator.total_revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Approvals Tab */}
      {tab === 'approvals' && (
        <div className="space-y-3">
          {pending.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-bb-gray-500">Nenhum curso pendente de aprovação</p>
            </Card>
          ) : (
            pending.map((course) => (
              <Card key={course.course_id} className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-bb-black">{course.title}</h3>
                    <p className="text-sm text-bb-gray-500">
                      {course.creator_name} · {course.modality.toUpperCase()} · Enviado em {new Date(course.submitted_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">Revisar</Button>
                    <Button variant="danger" size="sm" onClick={() => handleRejectCourse(course.course_id)}>
                      Rejeitar
                    </Button>
                    <Button size="sm" onClick={() => handleApproveCourse(course.course_id)}>
                      Aprovar
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
