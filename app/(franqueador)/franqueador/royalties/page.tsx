'use client';

import { useEffect, useState } from 'react';
import {
  getRoyaltyHistory,
  generateRoyaltyInvoice,
  type RoyaltyHistorySummary,
  type RoyaltyStatus,
} from '@/lib/api/royalties.service';
import { getMyNetwork, getNetworkUnits, type NetworkUnit } from '@/lib/api/franchise.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/lib/hooks/useToast';
import { useAuth } from '@/lib/hooks/useAuth';
import { EmptyState } from '@/components/ui/EmptyState';
import { translateError } from '@/lib/utils/error-translator';

const STATUS_LABEL: Record<RoyaltyStatus, string> = { pendente: 'Pendente', pago: 'Pago', atrasado: 'Atrasado', parcial: 'Parcial' };
const STATUS_STYLE: Record<RoyaltyStatus, React.CSSProperties> = {
  pendente: { background: 'color-mix(in srgb, var(--bb-warning) 15%, transparent)', color: 'var(--bb-warning)' },
  pago: { background: 'color-mix(in srgb, var(--bb-success) 15%, transparent)', color: 'var(--bb-success)' },
  atrasado: { background: 'color-mix(in srgb, var(--bb-danger) 15%, transparent)', color: 'var(--bb-danger)' },
  parcial: { background: 'color-mix(in srgb, var(--bb-warning) 25%, transparent)', color: 'var(--bb-warning)' },
};

type ViewTab = 'resumo' | 'detalhes' | 'gerar';

export default function RoyaltiesFranqueadorPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [academies, setAcademies] = useState<{ id: string; name: string }[]>([]);
  const [tab, setTab] = useState<ViewTab>('resumo');
  const [history, setHistory] = useState<RoyaltyHistorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<RoyaltyStatus | ''>('');
  const [filterAcademy, setFilterAcademy] = useState('');
  const [generateModal, setGenerateModal] = useState(false);
  const [genAcademy, setGenAcademy] = useState('');
  const [genMonth, setGenMonth] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    async function load() {
      if (!profile?.id) return;
      try {
        const network = await getMyNetwork(profile.id);
        if (!network) return;
        const [hist, units] = await Promise.all([
          getRoyaltyHistory(network.id),
          getNetworkUnits(network.id),
        ]);
        setHistory(hist);
        const unitList = units.map((u: NetworkUnit) => ({ id: u.id, name: u.name }));
        setAcademies(unitList);
        if (unitList.length > 0) setGenAcademy(unitList[0].id);
      } catch (err) {
        toast(translateError(err), 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [profile?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleGenerate() {
    if (!genMonth) return;
    setGenerating(true);
    try {
      await generateRoyaltyInvoice(genAcademy, genMonth);
      setGenerateModal(false);
      toast('Cobranca gerada com sucesso', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setGenerating(false);
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!history) return <div className="p-6 text-bb-gray-500">Erro ao carregar dados.</div>;

  const filtered = history.calculations.filter((c) => {
    if (filterStatus && c.status !== filterStatus) return false;
    if (filterAcademy && c.academy_id !== filterAcademy) return false;
    return true;
  });

  // Monthly aggregation for chart
  const monthlyMap = new Map<string, { month: string; total: number; paid: number; pending: number }>();
  for (const calc of history.calculations) {
    const entry = monthlyMap.get(calc.month) ?? { month: calc.month, total: 0, paid: 0, pending: 0 };
    entry.total += calc.total_due;
    if (calc.status === 'pago') entry.paid += calc.total_due;
    else entry.pending += calc.total_due;
    monthlyMap.set(calc.month, entry);
  }
  const monthlyData = Array.from(monthlyMap.values());

  const TABS: { id: ViewTab; label: string }[] = [
    { id: 'resumo', label: 'Resumo' },
    { id: 'detalhes', label: 'Detalhes' },
    { id: 'gerar', label: 'Gerar Cobrancas' },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-bb-black">Royalties da Rede</h1>
        <Button onClick={() => setGenerateModal(true)}>Gerar Cobranca Mensal</Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-bb-gray-100 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              tab === t.id ? 'text-bb-black shadow-sm' : 'text-bb-gray-500 hover:text-bb-black'
            }`}
            style={tab === t.id ? { background: 'var(--bb-depth-1)' } : undefined}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Resumo */}
      {tab === 'resumo' && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="p-4">
              <p className="text-xs text-bb-gray-500">Total Arrecadado</p>
              <p className="mt-1 text-2xl font-bold" style={{ color: 'var(--bb-success)' }}>R$ {history.total_collected.toLocaleString('pt-BR')}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-bb-gray-500">Pendente</p>
              <p className="mt-1 text-2xl font-bold" style={{ color: 'var(--bb-warning)' }}>R$ {history.total_pending.toLocaleString('pt-BR')}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-bb-gray-500">Em Atraso</p>
              <p className="mt-1 text-2xl font-bold" style={{ color: 'var(--bb-danger)' }}>R$ {history.total_overdue.toLocaleString('pt-BR')}</p>
            </Card>
          </div>

          {/* Monthly chart */}
          <Card className="p-4">
            <h2 className="mb-4 font-semibold text-bb-black">Royalties por Mes</h2>
            <div className="space-y-2">
              {monthlyData.map((m) => {
                const maxTotal = Math.max(...monthlyData.map((d) => d.total));
                const paidPct = maxTotal > 0 ? (m.paid / maxTotal) * 100 : 0;
                const pendingPct = maxTotal > 0 ? (m.pending / maxTotal) * 100 : 0;
                return (
                  <div key={m.month} className="flex items-center gap-3">
                    <span className="w-16 text-xs text-bb-gray-500">{m.month}</span>
                    <div className="flex flex-1 h-5 rounded bg-bb-gray-200 overflow-hidden">
                      <div className="h-full" style={{ width: `${paidPct}%`, backgroundColor: 'var(--bb-success)' }} />
                      <div className="h-full" style={{ width: `${pendingPct}%`, backgroundColor: 'var(--bb-warning)' }} />
                    </div>
                    <span className="w-24 text-right text-xs font-medium text-bb-gray-500">
                      R$ {(m.total / 1000).toFixed(1)}k
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex gap-4 text-xs text-bb-gray-500">
              <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded" style={{ backgroundColor: 'var(--bb-success)' }} /> Pago</span>
              <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded" style={{ backgroundColor: 'var(--bb-warning)' }} /> Pendente</span>
            </div>
          </Card>
        </>
      )}

      {/* Tab: Detalhes */}
      {tab === 'detalhes' && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={filterAcademy}
              onChange={(e) => setFilterAcademy(e.target.value)}
              className="rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Todas Academias</option>
              {academies.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            <div className="flex gap-1">
              {['', 'pago', 'pendente', 'atrasado'].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s as RoyaltyStatus | '')}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${filterStatus === s ? 'bg-bb-red text-white' : 'bg-bb-gray-100 text-bb-gray-500'}`}
                >
                  {s ? STATUS_LABEL[s as RoyaltyStatus] : 'Todos'}
                </button>
              ))}
            </div>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-bb-gray-300 bg-bb-gray-100">
                    <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Franquia</th>
                    <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Mes</th>
                    <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Receita Bruta</th>
                    <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Royalty (8%)</th>
                    <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Fundo Mkt (2%)</th>
                    <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Total</th>
                    <th className="px-4 py-3 text-center font-medium text-bb-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={7}>
                      <EmptyState
                        icon="💰"
                        title="Nenhum royalty encontrado"
                        description={filterStatus || filterAcademy ? "Nenhum resultado para os filtros selecionados." : "Gere cobranças mensais para visualizar o histórico de royalties."}
                        variant={filterStatus || filterAcademy ? "search" : "first-time"}
                      />
                    </td></tr>
                  )}
                  {filtered.slice(0, 30).map((calc) => (
                    <tr key={calc.id} className="border-b border-bb-gray-100" style={calc.status === 'atrasado' ? { background: 'color-mix(in srgb, var(--bb-danger) 5%, transparent)' } : undefined}>
                      <td className="px-4 py-3 font-medium text-bb-black">{calc.academy_name}</td>
                      <td className="px-4 py-3 text-bb-gray-500">{calc.month}</td>
                      <td className="px-4 py-3 text-right text-bb-gray-500">R$ {calc.gross_revenue.toLocaleString('pt-BR')}</td>
                      <td className="px-4 py-3 text-right text-bb-gray-500">R$ {calc.royalty_amount.toLocaleString('pt-BR')}</td>
                      <td className="px-4 py-3 text-right text-bb-gray-500">R$ {calc.marketing_fund_amount.toLocaleString('pt-BR')}</td>
                      <td className="px-4 py-3 text-right font-bold text-bb-black">R$ {calc.total_due.toLocaleString('pt-BR')}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-block rounded-full px-2 py-0.5 text-xs font-medium" style={STATUS_STYLE[calc.status]}>
                          {STATUS_LABEL[calc.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* Tab: Gerar Cobrancas */}
      {tab === 'gerar' && (
        <Card className="p-6">
          <h2 className="mb-4 font-semibold text-bb-black">Gerar Cobrancas Mensais</h2>
          <p className="mb-4 text-sm text-bb-gray-500">
            Gere as cobranças de royalties e fundo de marketing para todas as franquias ou uma franquia especifica.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-bb-black">Academia</label>
              <select
                value={genAcademy}
                onChange={(e) => setGenAcademy(e.target.value)}
                className="mt-1 w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
              >
                {academies.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-bb-black">Mes de Referencia</label>
              <input
                type="month"
                value={genMonth}
                onChange={(e) => setGenMonth(e.target.value)}
                className="mt-1 w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <Button onClick={handleGenerate} loading={generating} disabled={!genMonth}>
              Gerar Cobranca
            </Button>
          </div>
        </Card>
      )}

      {/* Generate Modal */}
      <Modal open={generateModal} onClose={() => setGenerateModal(false)} title="Gerar Cobranca de Royalties">
        <div className="space-y-3">
          <p className="text-sm text-bb-gray-500">Selecione a academia e o mes para gerar a cobranca.</p>
          <select
            value={genAcademy}
            onChange={(e) => setGenAcademy(e.target.value)}
            className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
          >
            {academies.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          <input
            type="month"
            value={genMonth}
            onChange={(e) => setGenMonth(e.target.value)}
            className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => setGenerateModal(false)}>Cancelar</Button>
            <Button className="flex-1" loading={generating} onClick={handleGenerate} disabled={!genMonth}>Gerar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
