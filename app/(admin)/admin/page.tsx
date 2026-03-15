'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getAdminDashboard, getAdminMetrics } from '@/lib/api/admin.service';
import type { AdminDashboardDTO, AdminMetrics } from '@/lib/api/admin.service';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

const AreaChartSection = dynamic(() => import('./AreaChartSection'), { ssr: false });

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<AdminDashboardDTO | null>(null);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [d, m] = await Promise.all([
          getAdminDashboard('academy-1'),
          getAdminMetrics('academy-1'),
        ]);
        setDashboard(d);
        setMetrics(m);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} variant="card" className="h-24" />)}
        </div>
        <Skeleton variant="card" className="h-64" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton variant="card" className="h-48" />
          <Skeleton variant="card" className="h-48" />
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  const receitaTrend = metrics?.receitaPorMes ? (() => {
    const arr = metrics.receitaPorMes;
    if (arr.length < 2) return 0;
    const curr = arr[arr.length - 1].receita;
    const prev = arr[arr.length - 2].receita;
    return Math.round(((curr - prev) / prev) * 100);
  })() : 0;

  return (
    <div className="space-y-6 p-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-sm text-bb-gray-500">Alunos Ativos</p>
          <p className="text-2xl font-bold text-bb-black">{dashboard.alunosAtivos}</p>
          <p className="text-xs text-bb-success">+{dashboard.novosEsteMes} este mês</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-bb-gray-500">Receita Mensal</p>
          <p className="text-2xl font-bold text-bb-black">
            R$ {dashboard.receitaMensal.toLocaleString('pt-BR')}
          </p>
          <p className={`text-xs ${receitaTrend >= 0 ? 'text-bb-success' : 'text-bb-error'}`}>
            {receitaTrend >= 0 ? '+' : ''}{receitaTrend}% vs mês anterior
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-bb-gray-500">Presença Média</p>
          <p className="text-2xl font-bold text-bb-black">{dashboard.presencaMedia}%</p>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-bb-gray-300">
            <div
              className={`h-full rounded-full ${dashboard.presencaMedia >= 70 ? 'bg-bb-success' : 'bg-bb-warning'}`}
              style={{ width: `${dashboard.presencaMedia}%` }}
            />
          </div>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-bb-gray-500">Inadimplência</p>
          <p className={`text-2xl font-bold ${dashboard.inadimplencia > 10 ? 'text-bb-error' : 'text-bb-black'}`}>
            {dashboard.inadimplencia}%
          </p>
          {dashboard.inadimplencia > 10 && (
            <p className="text-xs text-bb-error">Acima do limite!</p>
          )}
        </Card>
      </div>

      {/* Chart */}
      {metrics && <AreaChartSection data={metrics.presencaPorDia} />}

      {/* Two columns */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Próximas aulas */}
        <Card className="p-4">
          <h2 className="mb-3 font-semibold text-bb-black">Próximas Aulas</h2>
          <div className="space-y-2">
            {dashboard.proximasAulas.map((aula, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-bb-gray-100 px-3 py-2 text-sm">
                <div>
                  <p className="font-medium text-bb-black">{aula.class_name}</p>
                  <p className="text-xs text-bb-gray-500">{aula.professor_name}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-bb-black">{aula.time}</p>
                  <p className="text-xs text-bb-gray-500">{aula.enrolled} alunos</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Alertas */}
        <Card className="p-4">
          <h2 className="mb-3 font-semibold text-bb-black">Alertas</h2>
          <div className="space-y-2">
            {dashboard.alertas.map((alerta, i) => (
              <div key={i} className={`rounded-lg px-3 py-2 text-sm ${
                alerta.severity === 'error' ? 'bg-bb-error/10 text-bb-error' :
                alerta.severity === 'warning' ? 'bg-bb-warning/10 text-bb-warning' :
                'bg-bb-info/10 text-bb-info'
              }`}>
                {alerta.message}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Últimos check-ins */}
      <Card className="p-4">
        <h2 className="mb-3 font-semibold text-bb-black">Últimos Check-ins</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bb-gray-300">
                <th className="py-2 text-left font-medium text-bb-gray-500">Aluno</th>
                <th className="py-2 text-left font-medium text-bb-gray-500">Turma</th>
                <th className="py-2 text-right font-medium text-bb-gray-500">Horário</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.ultimosCheckins.map((checkin, i) => (
                <tr key={i} className="border-b border-bb-gray-100">
                  <td className="py-2 text-bb-black">{checkin.student_name}</td>
                  <td className="py-2 text-bb-gray-700">{checkin.class_name}</td>
                  <td className="py-2 text-right text-bb-gray-500">{checkin.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
