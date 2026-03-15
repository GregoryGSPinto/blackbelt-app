'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  predictPerformance,
  getOptimalCategory,
  type Prediction,
  type CategoryRecommendation,
} from '@/lib/api/competition-predictor.service';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';

const FEASIBILITY_COLORS: Record<string, string> = {
  easy: 'bg-green-100 text-green-700',
  moderate: 'bg-yellow-100 text-yellow-700',
  difficult: 'bg-orange-100 text-orange-700',
  not_recommended: 'bg-red-100 text-red-700',
};

const FEASIBILITY_LABELS: Record<string, string> = {
  easy: 'Tranquilo',
  moderate: 'Moderado',
  difficult: 'Difícil',
  not_recommended: 'Não Recomendado',
};

function ProbabilityGauge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center">
      <div className="relative mx-auto h-20 w-20">
        <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90">
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="3"
          />
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            className={color}
            strokeWidth="3"
            strokeDasharray={`${value}, 100`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-bb-black">{value}%</span>
        </div>
      </div>
      <p className="mt-1 text-xs font-medium text-bb-gray-500">{label}</p>
    </div>
  );
}

export default function PredicaoPage() {
  const params = useParams();
  const championshipId = params.championshipId as string;
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [category, setCategory] = useState<CategoryRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    Promise.all([
      predictPerformance('student-1', championshipId),
      getOptimalCategory('student-1', championshipId),
    ])
      .then(([pred, cat]) => { setPrediction(pred); setCategory(cat); })
      .finally(() => setLoading(false));
  }, [championshipId]);

  function toggleCheck(idx: number) {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!prediction) return <div className="p-4 text-center text-bb-gray-500">Predição não disponível</div>;

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-xl font-bold text-bb-black">Predição de Desempenho</h1>
      <p className="text-xs text-bb-gray-500">
        Confiança do modelo: {prediction.confidence_level}%
      </p>

      {/* Probability Gauges */}
      <Card className="p-4">
        <h2 className="mb-4 text-center text-sm font-semibold text-bb-black">Probabilidades</h2>
        <div className="grid grid-cols-4 gap-2">
          <ProbabilityGauge label="Pódio" value={prediction.podium_probability} color="stroke-blue-500" />
          <ProbabilityGauge label="Ouro" value={prediction.gold_probability} color="stroke-yellow-500" />
          <ProbabilityGauge label="Prata" value={prediction.silver_probability} color="stroke-gray-400" />
          <ProbabilityGauge label="Bronze" value={prediction.bronze_probability} color="stroke-amber-600" />
        </div>
      </Card>

      {/* Strengths & Risks */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="border-l-4 border-l-green-500 p-4">
          <h2 className="mb-2 text-sm font-semibold text-green-700">Pontos Fortes</h2>
          <ul className="space-y-2">
            {prediction.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-bb-gray-600">
                <span className="mt-0.5 flex-shrink-0 text-green-500">&#10003;</span>
                {s}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="border-l-4 border-l-red-500 p-4">
          <h2 className="mb-2 text-sm font-semibold text-red-700">Riscos</h2>
          <ul className="space-y-2">
            {prediction.risks.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-bb-gray-600">
                <span className="mt-0.5 flex-shrink-0 text-red-500">&#9888;</span>
                {r}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Preparation Checklist */}
      <Card className="p-4">
        <h2 className="mb-3 text-sm font-semibold text-bb-black">Checklist de Preparação</h2>
        <div className="space-y-2">
          {prediction.preparation_suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => toggleCheck(idx)}
              className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                checkedItems.has(idx)
                  ? 'border-green-300 bg-green-50'
                  : 'border-bb-gray-200 hover:bg-bb-gray-50'
              }`}
            >
              <span className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border text-xs ${
                checkedItems.has(idx)
                  ? 'border-green-500 bg-green-500 text-white'
                  : 'border-bb-gray-300'
              }`}>
                {checkedItems.has(idx) && '✓'}
              </span>
              <span className={`text-xs ${checkedItems.has(idx) ? 'text-bb-gray-400 line-through' : 'text-bb-gray-600'}`}>
                {suggestion}
              </span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-bb-gray-400">
          {checkedItems.size}/{prediction.preparation_suggestions.length} concluídos
        </p>
      </Card>

      {/* Similar Athletes */}
      <Card className="p-4">
        <h2 className="mb-3 text-sm font-semibold text-bb-black">Atletas Similares</h2>
        <p className="mb-3 text-xs text-bb-gray-500">
          Atletas com perfil e estilo semelhante ao seu
        </p>
        <div className="space-y-3">
          {prediction.similar_athletes.map((athlete) => (
            <div key={athlete.id} className="rounded-lg border border-bb-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-bb-black">{athlete.name}</p>
                  <p className="text-xs text-bb-gray-500">{athlete.academy} — Faixa {athlete.belt}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-bb-primary">{athlete.similarity_score}%</p>
                  <p className="text-[10px] text-bb-gray-400">similaridade</p>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {athlete.recent_results.map((result, i) => (
                  <span key={i} className="rounded-full bg-bb-gray-100 px-2 py-0.5 text-[10px] text-bb-gray-600">
                    {result}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Optimal Category */}
      {category && (
        <Card className="p-4">
          <h2 className="mb-3 text-sm font-semibold text-bb-black">Categoria Recomendada</h2>
          <div className="rounded-lg bg-blue-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-blue-700">{category.recommended_category}</p>
                <p className="text-xs text-blue-600">{category.recommended_weight_range}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${FEASIBILITY_COLORS[category.feasibility]}`}>
                {FEASIBILITY_LABELS[category.feasibility]}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-blue-600">
              <span>Peso atual: {category.current_weight}kg</span>
              {category.weight_adjustment_needed !== 0 && (
                <span>Ajuste: {category.weight_adjustment_needed > 0 ? '+' : ''}{category.weight_adjustment_needed}kg</span>
              )}
              <span>{category.days_until_competition} dias</span>
            </div>
          </div>

          {category.alternative_category && (
            <div className="mt-3 rounded-lg border border-dashed border-bb-gray-300 p-3">
              <p className="text-xs font-medium text-bb-gray-500">Alternativa</p>
              <p className="text-sm font-semibold text-bb-black">{category.alternative_category}</p>
              <p className="text-xs text-bb-gray-500">{category.alternative_weight_range}</p>
            </div>
          )}

          <p className="mt-3 text-xs leading-relaxed text-bb-gray-600">{category.reasoning}</p>
        </Card>
      )}
    </div>
  );
}
