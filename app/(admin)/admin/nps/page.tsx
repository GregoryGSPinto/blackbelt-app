'use client';

import { useEffect, useState } from 'react';
import {
  getNPSData,
  type NPSDataDTO,
  type NPSFeedback,
} from '@/lib/api/nps.service';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';

function npsColor(score: number): string {
  if (score >= 50) return '#22c55e';
  if (score >= 0) return '#eab308';
  return '#ef4444';
}

function npsLabel(score: number): string {
  if (score >= 75) return 'Excelente';
  if (score >= 50) return 'Muito Bom';
  if (score >= 0) return 'Razoavel';
  return 'Critico';
}

function categoryColor(category: NPSFeedback['category']): string {
  switch (category) {
    case 'promoter':
      return 'bg-green-100 text-green-700';
    case 'passive':
      return 'bg-yellow-100 text-yellow-700';
    case 'detractor':
      return 'bg-red-100 text-red-700';
  }
}

function categoryLabel(category: NPSFeedback['category']): string {
  switch (category) {
    case 'promoter':
      return 'Promotor';
    case 'passive':
      return 'Passivo';
    case 'detractor':
      return 'Detrator';
  }
}

function scoreBarColor(score: number): string {
  if (score >= 9) return 'bg-green-500';
  if (score >= 7) return 'bg-yellow-500';
  return 'bg-red-500';
}

export default function NPSPage() {
  const [data, setData] = useState<NPSDataDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackFilter, setFeedbackFilter] = useState<'all' | 'promoter' | 'passive' | 'detractor'>('all');

  useEffect(() => {
    getNPSData('academy-1')
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton variant="text" className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <Skeleton variant="card" className="h-64 lg:col-span-2" />
          <div className="grid grid-cols-2 gap-4 lg:col-span-3">
            <Skeleton variant="card" />
            <Skeleton variant="card" />
            <Skeleton variant="card" />
            <Skeleton variant="card" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-bb-gray-500">Erro ao carregar dados NPS</p>
      </div>
    );
  }

  const maxDistributionCount = Math.max(...data.distribution.map((d) => d.count), 1);
  const filteredFeedback =
    feedbackFilter === 'all'
      ? data.feedback
      : data.feedback.filter((f) => f.category === feedbackFilter);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-xl font-bold text-bb-black">NPS da Academia</h1>

      {/* NPS Gauge + Summary */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Gauge */}
        <Card className="flex flex-col items-center justify-center p-6 lg:col-span-2">
          <div className="relative h-40 w-40">
            <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="12"
              />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke={npsColor(data.nps_score)}
                strokeWidth="12"
                strokeDasharray={`${(data.nps_score / 100) * 327} 327`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-bb-black">{data.nps_score}</span>
              <span className="text-xs text-bb-gray-500">NPS Score</span>
            </div>
          </div>
          <p className="mt-2 text-sm font-semibold" style={{ color: npsColor(data.nps_score) }}>
            {npsLabel(data.nps_score)}
          </p>
          <p className="text-xs text-bb-gray-500">{data.total_responses} respostas</p>
        </Card>

        {/* Breakdown */}
        <div className="grid grid-cols-2 gap-4 lg:col-span-3">
          <Card className="p-4">
            <p className="text-xs text-bb-gray-500">Promotores (9-10)</p>
            <p className="mt-1 text-2xl font-bold text-green-600">{data.promoters_count}</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bb-gray-100">
              <div className="h-full rounded-full bg-green-500" style={{ width: `${data.promoters_pct}%` }} />
            </div>
            <p className="mt-1 text-xs text-bb-gray-500">{data.promoters_pct}%</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-bb-gray-500">Passivos (7-8)</p>
            <p className="mt-1 text-2xl font-bold text-yellow-600">{data.passives_count}</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bb-gray-100">
              <div className="h-full rounded-full bg-yellow-500" style={{ width: `${data.passives_pct}%` }} />
            </div>
            <p className="mt-1 text-xs text-bb-gray-500">{data.passives_pct}%</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-bb-gray-500">Detratores (0-6)</p>
            <p className="mt-1 text-2xl font-bold text-red-600">{data.detractors_count}</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bb-gray-100">
              <div className="h-full rounded-full bg-red-500" style={{ width: `${data.detractors_pct}%` }} />
            </div>
            <p className="mt-1 text-xs text-bb-gray-500">{data.detractors_pct}%</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-bb-gray-500">Total de Respostas</p>
            <p className="mt-1 text-2xl font-bold text-bb-black">{data.total_responses}</p>
            <p className="mt-2 text-xs text-bb-gray-500">
              Formula: %Promotores - %Detratores
            </p>
          </Card>
        </div>
      </div>

      {/* Distribution Chart (0-10) */}
      <Card className="p-6">
        <h2 className="mb-4 font-semibold text-bb-black">Distribuicao de Respostas</h2>
        <div className="flex items-end gap-2" style={{ height: '160px' }}>
          {data.distribution.map((d) => (
            <div key={d.score} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-xs font-medium text-bb-gray-700">{d.count}</span>
              <div
                className={`w-full rounded-t-md transition-all ${scoreBarColor(d.score)}`}
                style={{
                  height: `${maxDistributionCount > 0 ? (d.count / maxDistributionCount) * 120 : 0}px`,
                  minHeight: d.count > 0 ? '8px' : '2px',
                }}
              />
              <span className="text-xs text-bb-gray-500">{d.score}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-center gap-6 text-xs">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-red-500" /> Detratores (0-6)
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-yellow-500" /> Passivos (7-8)
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500" /> Promotores (9-10)
          </span>
        </div>
      </Card>

      {/* Trend over time */}
      <Card className="p-6">
        <h2 className="mb-4 font-semibold text-bb-black">Tendencia NPS</h2>
        <div className="flex items-end gap-4" style={{ height: '180px' }}>
          {data.trend.map((t) => {
            const normalizedHeight = Math.max(((t.score + 100) / 200) * 160, 8);
            return (
              <div key={t.month} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs font-bold" style={{ color: npsColor(t.score) }}>
                  {t.score}
                </span>
                <div
                  className="w-full rounded-t-md transition-all"
                  style={{
                    height: `${normalizedHeight}px`,
                    backgroundColor: npsColor(t.score),
                  }}
                />
                <span className="text-xs text-bb-gray-500">{t.month}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Feedback List */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-bb-gray-300 p-4">
          <h2 className="font-semibold text-bb-black">Feedback dos Alunos</h2>
          <div className="flex gap-1">
            {(['all', 'promoter', 'passive', 'detractor'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setFeedbackFilter(filter)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  feedbackFilter === filter
                    ? 'bg-bb-red text-bb-white'
                    : 'bg-bb-gray-100 text-bb-gray-500 hover:bg-bb-gray-300'
                }`}
              >
                {filter === 'all'
                  ? 'Todos'
                  : filter === 'promoter'
                    ? 'Promotores'
                    : filter === 'passive'
                      ? 'Passivos'
                      : 'Detratores'}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-bb-gray-100">
          {filteredFeedback.map((fb) => (
            <div key={fb.id} className="flex gap-4 p-4">
              <Avatar size="md" name={fb.respondent_name} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-bb-black">{fb.respondent_name}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${categoryColor(fb.category)}`}>
                    {categoryLabel(fb.category)}
                  </span>
                  <span className="ml-auto text-xs text-bb-gray-500">
                    {new Date(fb.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 10 }, (_, i) => (
                      <span
                        key={i}
                        className={`inline-block h-1.5 w-3 rounded-sm ${
                          i < fb.score ? scoreBarColor(fb.score) : 'bg-bb-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-bb-gray-700">{fb.score}/10</span>
                </div>
                <p className="mt-2 text-sm text-bb-gray-700">{fb.comment}</p>
              </div>
            </div>
          ))}

          {filteredFeedback.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm text-bb-gray-500">Nenhum feedback nesta categoria</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
