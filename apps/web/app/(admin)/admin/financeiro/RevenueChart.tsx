'use client';

import { Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart } from 'recharts';

interface RevenueChartProps {
  data: Array<{ month: string; receita: number; inadimplencia: number }>;
}

export default function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="left" tick={{ fontSize: 12 }} tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} tickFormatter={(v: number) => `${v}%`} />
          <Tooltip formatter={(value, name) => [name === 'receita' ? `R$ ${Number(value).toLocaleString('pt-BR')}` : `${value}%`, name === 'receita' ? 'Receita' : 'Inadimplência']} />
          <Area yAxisId="left" type="monotone" dataKey="receita" stroke="#D72638" fill="#D72638" fillOpacity={0.1} />
          <Line yAxisId="right" type="monotone" dataKey="inadimplencia" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
