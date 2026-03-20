'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  getMacrocycle,
  type MacrocycleDTO,
  PHASE_LABEL,
  PHASE_COLOR,
} from '@/lib/api/periodization.service';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';

const LineChart = dynamic(() => import('recharts').then((m) => m.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then((m) => m.Line), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then((m) => m.ResponsiveContainer), { ssr: false });

export default function PeriodizacaoPage() {
  const { toast } = useToast();
  const [macro, setMacro] = useState<MacrocycleDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMacrocycle('student-1')
      .then(setMacro)
      .catch((err) => toast(translateError(err), 'error'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  if (!macro) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-bb-gray-500">Nenhum macrociclo ativo.</p>
        <p className="mt-1 text-xs text-bb-gray-400">Seu professor definirá a periodização para sua próxima competição.</p>
      </div>
    );
  }

  const today = new Date();
  const competitionDate = new Date(macro.competition_date);
  const daysUntil = Math.max(0, Math.ceil((competitionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  // Find current phase
  const currentPhase = macro.phases.find((p) => today >= new Date(p.start_date) && today <= new Date(p.end_date));
  const currentPhaseIdx = currentPhase ? macro.phases.indexOf(currentPhase) : -1;

  // Calculate week within current phase
  const currentWeekInPhase = currentPhase
    ? Math.ceil((today.getTime() - new Date(currentPhase.start_date).getTime()) / (1000 * 60 * 60 * 24 * 7))
    : 0;

  // Chart data
  const chartData = macro.phases.map((phase) => ({
    name: PHASE_LABEL[phase.name],
    Intensidade: phase.intensity,
    Volume: phase.volume,
  }));

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-xl font-bold text-bb-black">Minha Periodização</h1>

      {/* Competition Countdown */}
      <Card className="bg-gradient-to-r from-bb-primary to-blue-600 p-4 text-white">
        <p className="text-sm font-medium opacity-90">Competição</p>
        <h2 className="text-lg font-bold">{macro.competition_name}</h2>
        <div className="mt-2 flex items-end justify-between">
          <p className="text-sm opacity-90">{competitionDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
          <div className="text-right">
            <p className="text-3xl font-bold">{daysUntil}</p>
            <p className="text-xs opacity-80">dias restantes</p>
          </div>
        </div>
      </Card>

      {/* Current Phase */}
      {currentPhase && (
        <Card className={`border-l-4 p-4 ${PHASE_COLOR[currentPhase.name].replace('bg-', 'border-l-').split(' ')[0].replace('border-l-', 'border-l-') || 'border-l-bb-primary'}`}>
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PHASE_COLOR[currentPhase.name]}`}>
              Fase Atual
            </span>
            <span className="text-sm font-bold text-bb-black">{PHASE_LABEL[currentPhase.name]}</span>
          </div>
          <p className="mt-2 text-sm text-bb-black">
            Semana {currentWeekInPhase} de {currentPhase.weeks}
          </p>
          {/* Phase week progress */}
          <div className="mt-2 h-2 w-full rounded-full bg-bb-gray-200">
            <div
              className="h-full rounded-full bg-bb-primary transition-all"
              style={{ width: `${(currentWeekInPhase / currentPhase.weeks) * 100}%` }}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-1">
            {currentPhase.focus.map((f, i) => (
              <span key={i} className="rounded-full bg-bb-gray-100 px-2 py-0.5 text-[10px] text-bb-gray-600">{f}</span>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-center">
            <div>
              <p className="text-xs text-bb-gray-500">Intensidade</p>
              <p className="text-lg font-bold text-red-500">{currentPhase.intensity}/10</p>
            </div>
            <div>
              <p className="text-xs text-bb-gray-500">Volume</p>
              <p className="text-lg font-bold text-blue-500">{currentPhase.volume}/10</p>
            </div>
          </div>
        </Card>
      )}

      {/* Phase Timeline */}
      <Card className="p-4">
        <h3 className="mb-3 text-sm font-semibold text-bb-black">Fases do Macrociclo</h3>
        <div className="space-y-2">
          {macro.phases.map((phase, idx) => {
            const isCurrent = idx === currentPhaseIdx;
            const isPast = today > new Date(phase.end_date);
            return (
              <div
                key={phase.id}
                className={`flex items-center gap-3 rounded-lg border p-3 ${isCurrent ? 'border-bb-primary bg-blue-50' : isPast ? 'border-green-200 bg-green-50' : 'border-bb-gray-200'}`}
              >
                <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${isCurrent ? 'bg-bb-primary text-white' : isPast ? 'bg-green-500 text-white' : 'bg-bb-gray-200 text-bb-gray-500'}`}>
                  {isPast ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-bb-black">{PHASE_LABEL[phase.name]}</p>
                  <p className="text-xs text-bb-gray-500">
                    {new Date(phase.start_date).toLocaleDateString('pt-BR')} — {new Date(phase.end_date).toLocaleDateString('pt-BR')} ({phase.weeks}sem)
                  </p>
                </div>
                {isCurrent && <span className="rounded-full bg-bb-primary px-2 py-0.5 text-[10px] font-bold text-white">AGORA</span>}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Intensity Chart */}
      <Card className="p-4">
        <h3 className="mb-3 text-sm font-semibold text-bb-black">Intensidade x Volume</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="Intensidade" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Volume" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex justify-center gap-4 text-xs">
          <div className="flex items-center gap-1"><span className="inline-block h-2 w-4 rounded bg-red-500" /> Intensidade</div>
          <div className="flex items-center gap-1"><span className="inline-block h-2 w-4 rounded bg-blue-500" /> Volume</div>
        </div>
      </Card>
    </div>
  );
}
