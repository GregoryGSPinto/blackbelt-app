'use client';

import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { ReportResult } from '@/lib/api/relatorios.service';

const COLORS = ['#D72638', '#1B1B1E', '#f59e0b', '#10b981', '#6366f1', '#ec4899', '#8b5cf6', '#14b8a6'];

interface ReportChartProps {
  report: ReportResult;
}

export default function ReportChart({ report }: ReportChartProps) {
  const data = report.data;

  if (report.type === 'presenca' || report.type === 'performance') {
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={50} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: number) => `${v}%`} />
            <Tooltip formatter={(v) => `${v}%`} />
            <Bar dataKey="value" fill="#D72638" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (report.type === 'evolucao') {
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="value" name="Promoções" fill="#D72638" radius={[4, 4, 0, 0]} />
            <Bar dataKey="value2" name="Avaliações" fill="#1B1B1E" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (report.type === 'financeiro') {
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v, name) => [`R$ ${Number(v).toLocaleString('pt-BR')}`, name === 'value' ? 'Receita' : 'Inadimplência']} />
            <Line type="monotone" dataKey="value" name="Receita" stroke="#D72638" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="value2" name="Inadimplência" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (report.type === 'retencao') {
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="value" name="Ativos" stroke="#D72638" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="value2" name="Churn" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Fallback pie
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={80} label>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
