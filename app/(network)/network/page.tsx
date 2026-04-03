'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import type { NetworkDashboardDTO, ConsolidatedFinancials } from '@/lib/api/network.service';
import { getNetworkDashboard, getNetworkFinancials, transferStudent } from '@/lib/api/network.service';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/lib/hooks/useToast';
import { Building2, DollarSign } from 'lucide-react';

export default function NetworkPage() {
  const [dashboard, setDashboard] = useState<NetworkDashboardDTO | null>(null);
  const [financials, setFinancials] = useState<ConsolidatedFinancials | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'financials' | 'transfer'>('overview');
  const [transferForm, setTransferForm] = useState({ studentId: '', fromAcademy: '', toAcademy: '' });
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([
      getNetworkDashboard('owner-1'),
      getNetworkFinancials('owner-1'),
    ]).then(([d, f]) => {
      setDashboard(d);
      setFinancials(f);
    }).catch((err) => {
      console.error('[NetworkPage]', err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  async function handleTransfer() {
    if (!transferForm.studentId || !transferForm.fromAcademy || !transferForm.toAcademy) return;
    await transferStudent(transferForm.studentId, transferForm.fromAcademy, transferForm.toAcademy);
    toast('Transferência realizada com sucesso!', 'success');
    setTransferForm({ studentId: '', fromAcademy: '', toAcademy: '' });
  }

  if (loading || !dashboard || !financials) return <div className="flex justify-center py-20"><Spinner /></div>;

  const tabs = [
    { key: 'overview' as const, label: 'Visão Geral' },
    { key: 'financials' as const, label: 'Financeiro' },
    { key: 'transfer' as const, label: 'Transferências' },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <PageHeader title="Rede de Academias" subtitle={`${dashboard.totalAcademies} academias na rede`} />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-bb-gray-200 p-4">
          <p className="text-sm text-bb-gray-500">Academias</p>
          <p className="text-2xl font-bold text-bb-gray-900">{dashboard.totalAcademies}</p>
        </div>
        <div className="rounded-xl border border-bb-gray-200 p-4">
          <p className="text-sm text-bb-gray-500">Total Alunos</p>
          <p className="text-2xl font-bold text-bb-gray-900">{dashboard.totalStudents}</p>
        </div>
        <div className="rounded-xl border border-bb-gray-200 p-4">
          <p className="text-sm text-bb-gray-500">Receita Total</p>
          <p className="text-2xl font-bold text-green-600">R$ {dashboard.totalRevenue.toLocaleString('pt-BR')}</p>
        </div>
        <div className="rounded-xl border border-bb-gray-200 p-4">
          <p className="text-sm text-bb-gray-500">Presença Média</p>
          <p className="text-2xl font-bold text-bb-gray-900">{dashboard.avgAttendance}%</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-bb-gray-200">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 text-sm font-medium ${tab === t.key ? 'border-b-2 border-bb-red text-bb-red' : 'text-bb-gray-500'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-4">
          <h3 className="font-medium text-bb-gray-900">Ranking de Academias</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-bb-gray-200 text-bb-gray-500">
                  <th className="pb-2 pr-4">#</th>
                  <th className="pb-2 pr-4">Academia</th>
                  <th className="pb-2 pr-4">Cidade</th>
                  <th className="pb-2 pr-4 text-right">Alunos</th>
                  <th className="pb-2 pr-4 text-right">Ativos</th>
                  <th className="pb-2 pr-4 text-right">Receita</th>
                  <th className="pb-2 text-right">Presença</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.academies.length === 0 && (
                  <tr><td colSpan={7}>
                    <EmptyState
                      icon={<Building2 className="h-12 w-12" />}
                      title="Nenhuma academia na rede"
                      description="Adicione academias para acompanhar o desempenho consolidado da rede."
                      variant="first-time"
                    />
                  </td></tr>
                )}
                {dashboard.academies.sort((a, b) => b.monthlyRevenue - a.monthlyRevenue).map((ac, i) => (
                  <tr key={ac.id} className="border-b border-bb-gray-100">
                    <td className="py-3 pr-4 text-bb-gray-400">{i + 1}</td>
                    <td className="py-3 pr-4 font-medium text-bb-gray-900">{ac.name}</td>
                    <td className="py-3 pr-4 text-bb-gray-500">{ac.city}</td>
                    <td className="py-3 pr-4 text-right">{ac.totalStudents}</td>
                    <td className="py-3 pr-4 text-right">{ac.activeStudents}</td>
                    <td className="py-3 pr-4 text-right text-green-600">R$ {ac.monthlyRevenue.toLocaleString('pt-BR')}</td>
                    <td className="py-3 text-right">{ac.attendanceRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'financials' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-bb-gray-200 p-4">
              <p className="text-sm text-bb-gray-500">MRR Total</p>
              <p className="text-2xl font-bold text-green-600">R$ {financials.totalMRR.toLocaleString('pt-BR')}</p>
            </div>
            <div className="rounded-xl border border-bb-gray-200 p-4">
              <p className="text-sm text-bb-gray-500">Inadimplência Total</p>
              <p className="text-2xl font-bold text-red-600">R$ {financials.totalOverdue.toLocaleString('pt-BR')}</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-bb-gray-200 text-bb-gray-500">
                  <th className="pb-2 pr-4">Academia</th>
                  <th className="pb-2 pr-4 text-right">MRR</th>
                  <th className="pb-2 pr-4 text-right">Inadimplência</th>
                  <th className="pb-2 text-right">Churn</th>
                </tr>
              </thead>
              <tbody>
                {financials.byAcademy.length === 0 && (
                  <tr><td colSpan={4}>
                    <EmptyState
                      icon={<DollarSign className="h-12 w-12" />}
                      title="Nenhum dado financeiro"
                      description="Os dados financeiros consolidados da rede aparecerão aqui."
                      variant="first-time"
                    />
                  </td></tr>
                )}
                {financials.byAcademy.map((ac) => (
                  <tr key={ac.id} className="border-b border-bb-gray-100">
                    <td className="py-3 pr-4 font-medium">{ac.name}</td>
                    <td className="py-3 pr-4 text-right text-green-600">R$ {ac.mrr.toLocaleString('pt-BR')}</td>
                    <td className="py-3 pr-4 text-right text-red-600">R$ {ac.overdue.toLocaleString('pt-BR')}</td>
                    <td className="py-3 text-right">{ac.churn}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'transfer' && (
        <div className="rounded-xl border border-bb-gray-200 p-4 space-y-4">
          <h3 className="font-medium text-bb-gray-900">Transferir Aluno entre Academias</h3>
          <input value={transferForm.studentId} onChange={(e) => setTransferForm({ ...transferForm, studentId: e.target.value })} placeholder="ID do aluno" className="w-full rounded-lg border border-bb-gray-200 px-3 py-2" />
          <div className="grid grid-cols-2 gap-4">
            <select value={transferForm.fromAcademy} onChange={(e) => setTransferForm({ ...transferForm, fromAcademy: e.target.value })} className="rounded-lg border border-bb-gray-200 px-3 py-2">
              <option value="">Academia de origem</option>
              {dashboard.academies.map((ac) => <option key={ac.id} value={ac.id}>{ac.name}</option>)}
            </select>
            <select value={transferForm.toAcademy} onChange={(e) => setTransferForm({ ...transferForm, toAcademy: e.target.value })} className="rounded-lg border border-bb-gray-200 px-3 py-2">
              <option value="">Academia de destino</option>
              {dashboard.academies.map((ac) => <option key={ac.id} value={ac.id}>{ac.name}</option>)}
            </select>
          </div>
          <Button variant="primary" onClick={handleTransfer}>Transferir</Button>
        </div>
      )}
    </div>
  );
}
