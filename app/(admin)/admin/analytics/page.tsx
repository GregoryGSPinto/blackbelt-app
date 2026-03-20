'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getRetentionCohort, getChurnRisk, getRevenueForecasting, getProfessorPerformance, getClassOccupancy } from '@/lib/api/analytics.service';
import type { CohortData, ChurnRiskDTO, ForecastDTO, ProfessorMetricsDTO, OccupancyDTO } from '@/lib/api/analytics.service';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { PlanGate } from '@/components/plans/PlanGate';

const AnalyticsCharts = dynamic(() => import('./AnalyticsCharts'), { ssr: false });

const TABS = ['Retenção', 'Churn Risk', 'Receita', 'Performance', 'Ocupação'];

export default function AdminAnalyticsPage() {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cohort, setCohort] = useState<CohortData[]>([]);
  const [churn, setChurn] = useState<ChurnRiskDTO[]>([]);
  const [forecast, setForecast] = useState<ForecastDTO | null>(null);
  const [professors, setProfessors] = useState<ProfessorMetricsDTO[]>([]);
  const [occupancy, setOccupancy] = useState<OccupancyDTO[]>([]);

  useEffect(() => {
    Promise.all([
      getRetentionCohort('academy-1', 12),
      getChurnRisk('academy-1'),
      getRevenueForecasting('academy-1', 6),
      getProfessorPerformance('academy-1'),
      getClassOccupancy('academy-1'),
    ]).then(([c, ch, f, p, o]) => {
      setCohort(c); setChurn(ch); setForecast(f); setProfessors(p); setOccupancy(o);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-4 p-6"><Skeleton variant="text" className="h-8 w-48" /><Skeleton variant="card" className="h-96" /></div>;

  return (
    <PlanGate module="relatorios">
    <div className="space-y-6 p-6">
      <h1 className="text-xl font-bold text-bb-black">Analytics</h1>
      <div className="flex flex-wrap gap-2">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} className={`rounded-lg px-4 py-2 text-sm font-medium ${tab === i ? 'bg-bb-red text-white' : 'bg-bb-gray-100 text-bb-gray-500'}`}>{t}</button>
        ))}
      </div>

      {tab === 0 && (
        <Card className="overflow-x-auto p-4">
          <h2 className="mb-4 font-semibold text-bb-black">Retenção por Coorte</h2>
          <table className="w-full text-xs">
            <thead><tr className="border-b border-bb-gray-300">
              <th className="px-2 py-2 text-left font-medium text-bb-gray-500">Mês</th>
              <th className="px-2 py-2 text-right font-medium text-bb-gray-500">Alunos</th>
              {Array.from({ length: 12 }, (_, i) => <th key={i} className="px-2 py-2 text-center font-medium text-bb-gray-500">M{i}</th>)}
            </tr></thead>
            <tbody>{cohort.map((c) => (
              <tr key={c.cohort_month} className="border-b border-bb-gray-100">
                <td className="px-2 py-2 font-medium text-bb-black">{c.cohort_month}</td>
                <td className="px-2 py-2 text-right text-bb-gray-500">{c.total_students}</td>
                {Array.from({ length: 12 }, (_, i) => (
                  <td key={i} className="px-2 py-2 text-center" style={{ backgroundColor: c.retention[i] != null ? `rgba(215,38,56,${(c.retention[i] / 100) * 0.6})` : undefined, color: c.retention[i] != null && c.retention[i] > 60 ? 'white' : undefined }}>
                    {c.retention[i] != null ? `${c.retention[i]}%` : ''}
                  </td>
                ))}
              </tr>
            ))}</tbody>
          </table>
        </Card>
      )}

      {tab === 1 && (
        <Card className="overflow-hidden">
          <div className="p-4"><h2 className="font-semibold text-bb-black">Alunos em Risco de Churn</h2></div>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-bb-gray-300 bg-bb-gray-100">
              <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Aluno</th>
              <th className="px-4 py-3 text-center font-medium text-bb-gray-500">Faixa</th>
              <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Dias Ausente</th>
              <th className="px-4 py-3 text-center font-medium text-bb-gray-500">Tendência</th>
              <th className="px-4 py-3 text-center font-medium text-bb-gray-500">Risco</th>
            </tr></thead>
            <tbody>{churn.map((s) => (
              <tr key={s.student_id} className="border-b border-bb-gray-100">
                <td className="px-4 py-3 font-medium text-bb-black">{s.student_name}</td>
                <td className="px-4 py-3 text-center capitalize text-bb-gray-500">{s.belt}</td>
                <td className="px-4 py-3 text-right text-bb-gray-500">{s.days_absent}</td>
                <td className="px-4 py-3 text-center">{s.frequency_trend === 'declining' ? '📉' : s.frequency_trend === 'improving' ? '📈' : '➡️'}</td>
                <td className="px-4 py-3 text-center"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.risk_level === 'high' ? 'bg-red-100 text-red-700' : s.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{s.risk_level === 'high' ? 'Alto' : s.risk_level === 'medium' ? 'Médio' : 'Baixo'}</span></td>
              </tr>
            ))}</tbody>
          </table>
        </Card>
      )}

      {tab === 2 && forecast && <AnalyticsCharts type="revenue" forecast={forecast} />}
      {tab === 3 && <AnalyticsCharts type="professors" professors={professors} />}
      {tab === 4 && <AnalyticsCharts type="occupancy" occupancy={occupancy} />}
    </div>
    </PlanGate>
  );
}
