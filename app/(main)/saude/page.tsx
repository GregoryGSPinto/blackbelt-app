'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  getHealthHistory,
  getTrainingSession,
  getRealtimeMetrics,
  type HealthDataPoint,
  type WearableSession,
  type RealtimeMetrics,
} from '@/lib/api/wearable.service';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';

const AreaChart = dynamic(() => import('recharts').then((m) => m.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then((m) => m.Area), { ssr: false });
const BarChart = dynamic(() => import('recharts').then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then((m) => m.Bar), { ssr: false });
const LineChart = dynamic(() => import('recharts').then((m) => m.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then((m) => m.Line), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then((m) => m.ResponsiveContainer), { ssr: false });

function generateHRCurve(): { minute: number; bpm: number }[] {
  const points: { minute: number; bpm: number }[] = [];
  for (let i = 0; i <= 60; i++) {
    let hr: number;
    if (i < 5) hr = 70 + (i / 5) * 30;
    else if (i < 15) hr = 100 + ((i - 5) / 10) * 40;
    else if (i < 45) hr = 140 + Math.sin(i * 0.3) * 20;
    else if (i < 55) hr = 150 + Math.sin(i * 0.5) * 15;
    else hr = 160 - ((i - 55) / 5) * 80;
    points.push({ minute: i, bpm: Math.round(Math.max(60, Math.min(180, hr))) });
  }
  return points;
}

export default function SaudePage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<WearableSession[]>([]);
  const [history, setHistory] = useState<HealthDataPoint[]>([]);
  const [metrics, setMetrics] = useState<RealtimeMetrics | null>(null);
  const [hasWearable, setHasWearable] = useState(true);

  useEffect(() => {
    Promise.all([
      getTrainingSession('student-1'),
      getHealthHistory('student-1', '30d'),
      getRealtimeMetrics('student-1'),
    ])
      .then(([s, h, m]) => {
        setSessions(s);
        setHistory(h);
        setMetrics(m);
        setHasWearable(m.device_connected);
      })
      .catch((err) => toast(translateError(err), 'error'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  if (!hasWearable || sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="mb-4 text-5xl">&#9201;</div>
        <h2 className="text-lg font-bold text-bb-black">Conecte seu relógio</h2>
        <p className="mt-2 max-w-sm text-sm text-bb-gray-500">
          Conecte seu Apple Watch ou WearOS para acompanhar frequência cardíaca, calorias e intensidade dos treinos em tempo real.
        </p>
        <Button className="mt-6" variant="primary">Conectar Dispositivo</Button>
      </div>
    );
  }

  const lastSession = sessions[0];
  const hrData = generateHRCurve();

  // HR zones for the last session
  const lastDayData = history[history.length - 1];
  const zones = lastDayData?.heart_rate_zones;
  const zoneData = zones
    ? [
        { zone: 'Repouso', minutes: zones.rest_minutes, color: '#94a3b8' },
        { zone: 'Queima', minutes: zones.fat_burn_minutes, color: '#facc15' },
        { zone: 'Cardio', minutes: zones.cardio_minutes, color: '#f97316' },
        { zone: 'Pico', minutes: zones.peak_minutes, color: '#ef4444' },
      ]
    : [];

  // Monthly totals
  const totalCalories = history.reduce((acc, d) => acc + d.calories_burned, 0);
  const totalActive = history.reduce((acc, d) => acc + d.active_minutes, 0);
  const totalSteps = history.reduce((acc, d) => acc + d.steps, 0);
  const trainingDays = history.filter((d) => d.active_minutes > 40).length;
  const consistencyScore = Math.round((trainingDays / 30) * 100);

  // Trend data
  const caloriesTrend = history.map((d) => ({
    date: new Date(d.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    calorias: d.calories_burned,
  }));

  const hrTrend = history.map((d) => ({
    date: new Date(d.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    bpm: d.heart_rate_bpm,
  }));

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-xl font-bold text-bb-black">Saúde &amp; Desempenho</h1>

      {/* Device Info */}
      {metrics && (
        <div className="flex items-center gap-3 rounded-xl bg-green-50 px-4 py-3">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <p className="text-xs text-green-800">
            {metrics.device_name} conectado — Bateria {metrics.battery_pct}%
          </p>
        </div>
      )}

      {/* Last Training */}
      <Card className="p-4">
        <h2 className="mb-3 text-sm font-semibold text-bb-black">Último Treino</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-bb-black">{lastSession.duration_minutes}</p>
            <p className="text-[10px] text-bb-gray-500">min</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-500">{lastSession.calories}</p>
            <p className="text-[10px] text-bb-gray-500">kcal</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-500">{lastSession.avg_heart_rate}</p>
            <p className="text-[10px] text-bb-gray-500">BPM médio</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-700">{lastSession.max_heart_rate}</p>
            <p className="text-[10px] text-bb-gray-500">BPM máx</p>
          </div>
        </div>

        {/* HR during class */}
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-bb-gray-500">Frequência Cardíaca durante a Aula</p>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hrData}>
                <defs>
                  <linearGradient id="hrGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="minute" tick={{ fontSize: 10 }} label={{ value: 'min', position: 'insideBottomRight', fontSize: 10 }} />
                <YAxis domain={[50, 190]} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => [`${v} bpm`, 'FC']} />
                <Area type="monotone" dataKey="bpm" stroke="#ef4444" fill="url(#hrGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* HR Zones Bar */}
        {zoneData.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-bb-gray-500">Zonas de Frequência Cardíaca</p>
            <div className="flex gap-2">
              {zoneData.map((z) => (
                <div key={z.zone} className="flex-1 text-center">
                  <div
                    className="mx-auto mb-1 rounded"
                    style={{ backgroundColor: z.color, height: `${Math.max(8, z.minutes * 1.5)}px`, width: '100%' }}
                  />
                  <p className="text-[10px] font-bold text-bb-black">{z.minutes}min</p>
                  <p className="text-[9px] text-bb-gray-500">{z.zone}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between text-[10px] text-bb-gray-400">
          <span>Intensidade: {lastSession.intensity_score}/100</span>
          <span>{new Date(lastSession.start).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </Card>

      {/* Trends */}
      <Card className="p-4">
        <h2 className="mb-3 text-sm font-semibold text-bb-black">Tendências (30 dias)</h2>

        <div className="mb-4">
          <p className="mb-2 text-xs font-medium text-bb-gray-500">Calorias Queimadas</p>
          <div className="h-36 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={caloriesTrend}>
                <XAxis dataKey="date" tick={{ fontSize: 8 }} interval={4} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="calorias" fill="#f97316" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-bb-gray-500">Frequência Cardíaca Média</p>
          <div className="h-36 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hrTrend}>
                <XAxis dataKey="date" tick={{ fontSize: 8 }} interval={4} />
                <YAxis domain={[50, 160]} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="bpm" stroke="#ef4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Overview */}
      <Card className="p-4">
        <h2 className="mb-3 text-sm font-semibold text-bb-black">Visão Geral do Mês</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-orange-50 p-3 text-center">
            <p className="text-xl font-bold text-orange-600">{totalCalories.toLocaleString('pt-BR')}</p>
            <p className="text-[10px] text-bb-gray-500">kcal totais</p>
          </div>
          <div className="rounded-lg bg-blue-50 p-3 text-center">
            <p className="text-xl font-bold text-blue-600">{totalActive.toLocaleString('pt-BR')}</p>
            <p className="text-[10px] text-bb-gray-500">min ativos</p>
          </div>
          <div className="rounded-lg bg-green-50 p-3 text-center">
            <p className="text-xl font-bold text-green-600">{totalSteps.toLocaleString('pt-BR')}</p>
            <p className="text-[10px] text-bb-gray-500">passos</p>
          </div>
          <div className="rounded-lg bg-purple-50 p-3 text-center">
            <p className="text-xl font-bold text-purple-600">{consistencyScore}%</p>
            <p className="text-[10px] text-bb-gray-500">consistência</p>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-bb-gray-500">Dias de treino</span>
            <span className="font-bold text-bb-black">{trainingDays} de 30</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-bb-gray-100">
            <div className="h-full rounded-full bg-purple-500" style={{ width: `${consistencyScore}%` }} />
          </div>
        </div>
      </Card>

      {/* Session History */}
      <Card className="p-4">
        <h3 className="mb-3 text-sm font-semibold text-bb-black">Histórico de Treinos</h3>
        <div className="space-y-2">
          {sessions.map((s, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border border-bb-gray-200 p-3">
              <div>
                <p className="text-xs font-medium text-bb-black">
                  {new Date(s.start).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </p>
                <p className="text-[10px] text-bb-gray-500">{s.duration_minutes}min — {s.calories}kcal</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-red-500">{s.avg_heart_rate} bpm</p>
                <p className="text-[10px] text-bb-gray-400">Intensidade {s.intensity_score}/100</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
