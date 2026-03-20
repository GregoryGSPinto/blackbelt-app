'use client';

import { useState, useEffect } from 'react';
import { getChurnPredictions } from '@/lib/api/analytics.service';
import type { ChurnPrediction } from '@/lib/types/analytics';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  AlertTriangleIcon,
  UserIcon,
  ClockIcon,
  DollarIcon,
} from '@/components/shell/icons';
import { PlanGate } from '@/components/plans/PlanGate';
import { EmptyState } from '@/components/ui/EmptyState';

const RISK_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  critical: { label: 'Crítico', color: '#EF4444', bg: '#EF444420' },
  high: { label: 'Alto', color: '#F59E0B', bg: '#F59E0B20' },
  medium: { label: 'Médio', color: '#3B82F6', bg: '#3B82F620' },
  low: { label: 'Baixo', color: '#22C55E', bg: '#22C55E20' },
};

export default function ChurnPredictionPage() {
  const [predictions, setPredictions] = useState<ChurnPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRisk, setFilterRisk] = useState<string>('');

  useEffect(() => {
    getChurnPredictions('academy-1')
      .then(setPredictions)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filterRisk
    ? predictions.filter((p) => p.risk === filterRisk)
    : predictions;

  const riskCounts = {
    critical: predictions.filter((p) => p.risk === 'critical').length,
    high: predictions.filter((p) => p.risk === 'high').length,
    medium: predictions.filter((p) => p.risk === 'medium').length,
    low: predictions.filter((p) => p.risk === 'low').length,
  };

  return (
    <PlanGate module="churn_prediction">
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--bb-ink-100)' }}>
          Previsão de Churn
        </h1>
        <p className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
          Algoritmo de risco de evasão baseado em frequência, tendência, inadimplência e engajamento.
        </p>
      </div>

      {/* Risk summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(Object.entries(riskCounts) as [string, number][]).map(([risk, count]) => {
          const config = RISK_CONFIG[risk];
          return (
            <button
              key={risk}
              onClick={() => setFilterRisk(filterRisk === risk ? '' : risk)}
              className="rounded-xl border p-3 text-center transition-all"
              style={{
                background: filterRisk === risk ? config.bg : 'var(--bb-depth-2)',
                borderColor: filterRisk === risk ? config.color : 'var(--bb-glass-border)',
              }}
            >
              <p className="text-2xl font-bold" style={{ color: config.color }}>{count}</p>
              <p className="text-xs font-medium" style={{ color: 'var(--bb-ink-60)' }}>{config.label}</p>
            </button>
          );
        })}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="card" className="h-24" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 && predictions.length === 0 && (
            <EmptyState
              icon="📉"
              title="Nenhuma previsão de churn"
              description="Quando houver dados suficientes de frequência e engajamento, as previsões de evasão aparecerão aqui."
              variant="first-time"
            />
          )}
          {filtered.length === 0 && predictions.length > 0 && (
            <EmptyState
              icon="🔍"
              title="Nenhum aluno neste filtro"
              description="Não há alunos com o nível de risco selecionado. Tente outro filtro."
              variant="search"
            />
          )}
          {filtered.map((pred) => {
            const config = RISK_CONFIG[pred.risk];
            return (
              <div
                key={pred.studentId}
                className="rounded-xl border p-4"
                style={{
                  background: 'var(--bb-depth-2)',
                  borderColor: 'var(--bb-glass-border)',
                  borderLeft: `4px solid ${config.color}`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full"
                      style={{ background: config.bg }}
                    >
                      <AlertTriangleIcon className="h-5 w-5" style={{ color: config.color }} />
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
                        {pred.studentName}
                      </p>
                      <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                        <span className="flex items-center gap-1">
                          <ClockIcon className="h-3 w-3" />
                          {pred.daysSinceLastVisit}d sem treinar
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarIcon className="h-3 w-3" />
                          {pred.paymentStatus === 'ok' ? 'Em dia' : pred.paymentStatus === 'late' ? 'Atrasado' : 'Inadimplente'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold" style={{ color: config.color }}>
                      {pred.score}
                    </p>
                    <span
                      className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ background: config.bg, color: config.color }}
                    >
                      {config.label}
                    </span>
                  </div>
                </div>

                {/* Factor bars */}
                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
                  <FactorBar label="Frequência" value={pred.factors.frequencyScore} weight="40%" />
                  <FactorBar label="Tendência" value={pred.factors.trendScore} weight="25%" />
                  <FactorBar label="Inadimplência" value={pred.factors.delinquencyScore} weight="20%" />
                  <FactorBar label="Engajamento" value={pred.factors.engagementScore} weight="15%" />
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    className="rounded-lg px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-80"
                    style={{ background: 'var(--bb-brand)', color: 'white' }}
                  >
                    <UserIcon className="mr-1 inline h-3 w-3" />
                    Enviar Mensagem
                  </button>
                  <button
                    className="rounded-lg px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-80"
                    style={{ background: 'var(--bb-depth-4)', color: 'var(--bb-ink-80)' }}
                  >
                    Ver Perfil
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
    </PlanGate>
  );
}

function FactorBar({ label, value, weight }: { label: string; value: number; weight: string }) {
  const color = value < 30 ? '#22C55E' : value < 60 ? '#F59E0B' : '#EF4444';
  return (
    <div>
      <div className="flex justify-between text-[10px]" style={{ color: 'var(--bb-ink-40)' }}>
        <span>{label}</span>
        <span>{weight}</span>
      </div>
      <div className="mt-0.5 h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--bb-depth-4)' }}>
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}
