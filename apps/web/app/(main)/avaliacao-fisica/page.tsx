'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  getHistory,
  compareAssessments,
  type PhysicalAssessmentDTO,
  type AssessmentComparison,
  type Measurements,
  type FitnessTests,
} from '@/lib/api/physical-assessment.service';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';
import { ComingSoon } from '@/components/shared/ComingSoon';

const LineChart = dynamic(() => import('recharts').then((m) => m.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then((m) => m.Line), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then((m) => m.ResponsiveContainer), { ssr: false });

const MEASUREMENT_LABELS: Record<keyof Measurements, string> = {
  weight_kg: 'Peso (kg)',
  height_cm: 'Altura (cm)',
  body_fat_pct: 'Gordura (%)',
  flexibility_score: 'Flexibilidade',
  grip_strength_kg: 'Grip (kg)',
};

const FITNESS_LABELS: Record<keyof FitnessTests, string> = {
  pushups_1min: 'Flexões',
  situps_1min: 'Abdominais',
  plank_seconds: 'Prancha (s)',
  beep_test_level: 'Beep Test',
  squat_max_kg: 'Agachamento (kg)',
  deadlift_max_kg: 'Terra (kg)',
  vo2max_estimate: 'VO2max',
};

type ChartMetric = 'weight_kg' | 'body_fat_pct' | 'pushups_1min' | 'plank_seconds' | 'vo2max_estimate' | 'grip_strength_kg';

const CHART_OPTIONS: { value: ChartMetric; label: string }[] = [
  { value: 'weight_kg', label: 'Peso' },
  { value: 'body_fat_pct', label: 'Gordura %' },
  { value: 'pushups_1min', label: 'Flexões' },
  { value: 'plank_seconds', label: 'Prancha' },
  { value: 'vo2max_estimate', label: 'VO2max' },
  { value: 'grip_strength_kg', label: 'Grip' },
];

export default function AvaliacaoFisicaPage() {
  const { toast } = useToast();
  const [comingSoonTimeout, setComingSoonTimeout] = useState(false);
  const [assessments, setAssessments] = useState<PhysicalAssessmentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartMetric, setChartMetric] = useState<ChartMetric>('weight_kg');
  const [comparison, setComparison] = useState<AssessmentComparison | null>(null);

  useEffect(() => { const t = setTimeout(() => setComingSoonTimeout(true), 4000); return () => clearTimeout(t); }, []);
  useEffect(() => {
    getHistory('student-1')
      .then(setAssessments)
      .catch((err) => toast(translateError(err), 'error'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (assessments.length >= 2) {
      compareAssessments('student-1', assessments[0].id, assessments[assessments.length - 1].id)
        .then(setComparison)
        .catch(() => {});
    }
  }, [assessments]);

  if (loading && comingSoonTimeout) return <ComingSoon backHref="/dashboard" backLabel="Voltar ao Dashboard" />;
  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  if (assessments.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-bb-gray-500">Nenhuma avaliação física registrada.</p>
        <p className="mt-1 text-xs text-bb-gray-400">Seu professor realizará sua avaliação em breve.</p>
      </div>
    );
  }

  const latest = assessments[assessments.length - 1];

  // Chart data
  const chartData = assessments.map((a) => {
    const isMeasurement = chartMetric in a.measurements;
    return {
      date: new Date(a.date).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
      valor: isMeasurement
        ? a.measurements[chartMetric as keyof Measurements]
        : a.fitness_tests[chartMetric as keyof FitnessTests],
    };
  });

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-xl font-bold text-bb-black">Avaliação Física</h1>

      {/* Latest Summary */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-bb-black">Última avaliação</p>
          <p className="text-xs text-bb-gray-500">{new Date(latest.date).toLocaleDateString('pt-BR')}</p>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-lg font-bold text-bb-black">{latest.measurements.weight_kg}</p>
            <p className="text-[10px] text-bb-gray-500">Peso (kg)</p>
          </div>
          <div>
            <p className="text-lg font-bold text-bb-black">{latest.measurements.body_fat_pct}%</p>
            <p className="text-[10px] text-bb-gray-500">Gordura</p>
          </div>
          <div>
            <p className="text-lg font-bold text-bb-black">{latest.fitness_tests.vo2max_estimate}</p>
            <p className="text-[10px] text-bb-gray-500">VO2max</p>
          </div>
        </div>
      </Card>

      {/* Evolution Chart */}
      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-bb-black">Evolução</h3>
          <select
            value={chartMetric}
            onChange={(e) => setChartMetric(e.target.value as ChartMetric)}
            className="rounded-lg border border-bb-gray-300 px-2 py-1 text-xs"
          >
            {CHART_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="valor" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Comparison Table (first vs latest) */}
      {comparison && (
        <Card className="p-4">
          <h3 className="mb-3 text-sm font-semibold text-bb-black">
            Evolução Total ({new Date(comparison.previous.date).toLocaleDateString('pt-BR')} → {new Date(comparison.current.date).toLocaleDateString('pt-BR')})
          </h3>

          <div className="mb-3">
            <p className="mb-1 text-xs font-medium text-bb-gray-500">Medidas</p>
            <div className="space-y-1">
              {(Object.keys(MEASUREMENT_LABELS) as (keyof Measurements)[]).map((key) => {
                const delta = comparison.deltas.measurements[key];
                const isGood = key === 'body_fat_pct' || key === 'weight_kg' ? delta <= 0 : delta >= 0;
                return (
                  <div key={key} className="flex items-center justify-between text-xs">
                    <span className="text-bb-gray-500">{MEASUREMENT_LABELS[key]}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-bb-gray-400">{comparison.previous.measurements[key]}</span>
                      <span className="text-bb-gray-300">→</span>
                      <span className="font-medium text-bb-black">{comparison.current.measurements[key]}</span>
                      <span className={`w-12 text-right font-bold ${delta === 0 ? 'text-bb-gray-400' : isGood ? 'text-green-600' : 'text-red-500'}`}>
                        {delta > 0 ? '+' : ''}{delta}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-1 text-xs font-medium text-bb-gray-500">Testes Físicos</p>
            <div className="space-y-1">
              {(Object.keys(FITNESS_LABELS) as (keyof FitnessTests)[]).map((key) => {
                const delta = comparison.deltas.fitness_tests[key];
                return (
                  <div key={key} className="flex items-center justify-between text-xs">
                    <span className="text-bb-gray-500">{FITNESS_LABELS[key]}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-bb-gray-400">{comparison.previous.fitness_tests[key]}</span>
                      <span className="text-bb-gray-300">→</span>
                      <span className="font-medium text-bb-black">{comparison.current.fitness_tests[key]}</span>
                      <span className={`w-12 text-right font-bold ${delta === 0 ? 'text-bb-gray-400' : delta > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {delta > 0 ? '+' : ''}{delta}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Assessment History */}
      <Card className="p-4">
        <h3 className="mb-3 text-sm font-semibold text-bb-black">Histórico</h3>
        <div className="space-y-2">
          {[...assessments].reverse().map((a) => (
            <div key={a.id} className="rounded-lg border border-bb-gray-200 p-3">
              <p className="text-xs font-medium text-bb-black">
                {new Date(a.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
              <p className="mt-0.5 text-[10px] text-bb-gray-500">{a.notes}</p>
              <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-bb-gray-500">
                <span>{a.measurements.weight_kg}kg</span>
                <span>{a.measurements.body_fat_pct}% gordura</span>
                <span>{a.fitness_tests.pushups_1min} flexões</span>
                <span>{a.fitness_tests.plank_seconds}s prancha</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
