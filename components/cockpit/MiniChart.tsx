'use client';

import { BarChart, Bar, LineChart, Line, ResponsiveContainer } from 'recharts';

interface MiniChartProps {
  data: Array<{ value: number }>;
  type?: 'line' | 'bar';
  height?: number;
  color?: string;
}

export function MiniChart({
  data,
  type = 'line',
  height = 60,
  color = 'var(--bb-brand)',
}: MiniChartProps) {
  if (!data.length) return null;

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        {type === 'bar' ? (
          <BarChart data={data}>
            <Bar dataKey="value" fill={color} radius={[2, 2, 0, 0]} />
          </BarChart>
        ) : (
          <LineChart data={data}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
