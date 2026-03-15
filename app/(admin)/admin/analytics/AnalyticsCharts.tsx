'use client';

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { ForecastDTO, ProfessorMetricsDTO, OccupancyDTO } from '@/lib/api/analytics.service';
import { Card } from '@/components/ui/Card';

interface Props {
  type: 'revenue' | 'professors' | 'occupancy';
  forecast?: ForecastDTO;
  professors?: ProfessorMetricsDTO[];
  occupancy?: OccupancyDTO[];
}

export default function AnalyticsCharts({ type, forecast, professors, occupancy }: Props) {
  if (type === 'revenue' && forecast) {
    const data = forecast.months.map((m, i) => ({ month: m, mrr: forecast.projected_mrr[i] }));
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card className="p-4"><p className="text-xs text-bb-gray-500">MRR Atual</p><p className="mt-1 text-2xl font-bold text-bb-black">R$ {forecast.current_mrr.toLocaleString('pt-BR')}</p></Card>
          <Card className="p-4"><p className="text-xs text-bb-gray-500">MRR Projetado (3m)</p><p className="mt-1 text-2xl font-bold text-bb-black">R$ {forecast.projected_mrr[2]?.toLocaleString('pt-BR')}</p></Card>
          <Card className="p-4"><p className="text-xs text-bb-gray-500">Growth Rate</p><p className="mt-1 text-2xl font-bold text-green-600">{forecast.growth_rate}%</p></Card>
          <Card className="p-4"><p className="text-xs text-bb-gray-500">Churn Rate</p><p className="mt-1 text-2xl font-bold text-bb-error">{forecast.churn_rate}%</p></Card>
        </div>
        <Card className="p-4">
          <h2 className="mb-4 font-semibold text-bb-black">Projeção de Receita</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${(Number(v) / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => `R$ ${Number(v).toLocaleString('pt-BR')}`} />
                <Line type="monotone" dataKey="mrr" stroke="#D72638" strokeWidth={2} dot={{ r: 4 }} strokeDasharray={data.length > 1 ? `${100 / data.length * 2} ${100 / data.length}` : undefined} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    );
  }

  if (type === 'professors' && professors) {
    const data = professors.map((p) => ({ name: p.professor_name.replace('Prof. ', ''), presenca: p.avg_attendance, retencao: p.retention_rate, avaliacao: p.avg_evaluation }));
    return (
      <Card className="p-4">
        <h2 className="mb-4 font-semibold text-bb-black">Performance dos Professores</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Bar dataKey="presenca" name="Presença" fill="#D72638" radius={[4, 4, 0, 0]} />
              <Bar dataKey="retencao" name="Retenção" fill="#1B1B1E" radius={[4, 4, 0, 0]} />
              <Bar dataKey="avaliacao" name="Avaliação" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    );
  }

  if (type === 'occupancy' && occupancy) {
    const DAYS = ['', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return (
      <Card className="overflow-hidden">
        <div className="p-4"><h2 className="font-semibold text-bb-black">Ocupação por Turma</h2></div>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-bb-gray-300 bg-bb-gray-100">
            <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Turma</th>
            <th className="px-4 py-3 text-center font-medium text-bb-gray-500">Dia</th>
            <th className="px-4 py-3 text-center font-medium text-bb-gray-500">Horário</th>
            <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Matr.</th>
            <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Cap.</th>
            <th className="px-4 py-3 text-right font-medium text-bb-gray-500">Ocupação</th>
          </tr></thead>
          <tbody>{occupancy.map((o) => (
            <tr key={o.class_id} className={`border-b border-bb-gray-100 ${o.occupancy_rate < 50 ? 'bg-yellow-50' : ''}`}>
              <td className="px-4 py-3 font-medium text-bb-black">{o.class_name}</td>
              <td className="px-4 py-3 text-center text-bb-gray-500">{DAYS[o.day_of_week]}</td>
              <td className="px-4 py-3 text-center text-bb-gray-500">{o.time}</td>
              <td className="px-4 py-3 text-right text-bb-gray-500">{o.enrolled}</td>
              <td className="px-4 py-3 text-right text-bb-gray-500">{o.capacity}</td>
              <td className="px-4 py-3 text-right"><span className={`font-medium ${o.occupancy_rate >= 90 ? 'text-green-600' : o.occupancy_rate < 50 ? 'text-bb-error' : 'text-bb-gray-500'}`}>{o.occupancy_rate}%</span></td>
            </tr>
          ))}</tbody>
        </table>
      </Card>
    );
  }

  return null;
}
