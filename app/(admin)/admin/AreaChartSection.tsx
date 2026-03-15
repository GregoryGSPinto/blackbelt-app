'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/Card';

interface AreaChartSectionProps {
  data: { date: string; count: number }[];
}

export default function AreaChartSection({ data }: AreaChartSectionProps) {
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
  }));

  return (
    <Card className="p-4">
      <h2 className="mb-3 font-semibold text-bb-black">Presença (últimos 30 dias)</h2>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={formatted}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={4} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Area type="monotone" dataKey="count" stroke="#C62828" fill="#C62828" fillOpacity={0.15} name="Presenças" />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
