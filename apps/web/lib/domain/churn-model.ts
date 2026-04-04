// ── ML Churn Prediction Model (P-085) ─────────────────────────
// Simple logistic regression for churn prediction.
// In production, use TensorFlow.js or Supabase Edge Function.

export interface ChurnFeatures {
  frequencyTrend: number;      // -1 to 1 (decline to growth)
  daysSinceLastVisit: number;  // 0-90+
  paymentDelinquency: number;  // 0-1 (0 = ok, 1 = severely overdue)
  quizEngagement: number;      // 0-1 (quiz scores and completion rate)
  monthsOnPlan: number;        // 0-60+
  videoWatchRate: number;      // 0-1 (percentage of assigned content watched)
}

export interface ChurnPredictionResult {
  probability: number;           // 0-1
  score: number;                 // 0-100
  risk: 'low' | 'medium' | 'high' | 'critical';
  mainReason: string;
  factors: Record<string, { weight: number; contribution: number }>;
}

// Weights derived from domain knowledge
const WEIGHTS = {
  frequencyTrend: -2.5,       // Negative trend = higher churn
  daysSinceLastVisit: 0.08,   // More days = higher churn
  paymentDelinquency: 3.0,    // Overdue = high churn
  quizEngagement: -1.5,       // Engagement = lower churn
  monthsOnPlan: -0.03,        // Longer tenure = lower churn
  videoWatchRate: -1.2,        // Content consumption = lower churn
};

const BIAS = -0.5;

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

export function predictChurn(features: ChurnFeatures): ChurnPredictionResult {
  // Normalize features
  const normalized = {
    frequencyTrend: features.frequencyTrend,
    daysSinceLastVisit: Math.min(features.daysSinceLastVisit / 90, 1),
    paymentDelinquency: features.paymentDelinquency,
    quizEngagement: features.quizEngagement,
    monthsOnPlan: Math.min(features.monthsOnPlan / 24, 1),
    videoWatchRate: features.videoWatchRate,
  };

  // Calculate contributions
  const contributions: Record<string, { weight: number; contribution: number }> = {};
  let logit = BIAS;

  for (const [key, weight] of Object.entries(WEIGHTS)) {
    const featureValue = normalized[key as keyof typeof normalized];
    const contribution = weight * featureValue;
    logit += contribution;
    contributions[key] = { weight, contribution };
  }

  const probability = sigmoid(logit);
  const score = Math.round(probability * 100);

  let risk: 'low' | 'medium' | 'high' | 'critical';
  if (score < 25) risk = 'low';
  else if (score < 50) risk = 'medium';
  else if (score < 75) risk = 'high';
  else risk = 'critical';

  // Determine main reason
  const sortedFactors = Object.entries(contributions)
    .filter(([, v]) => v.contribution > 0)
    .sort((a, b) => b[1].contribution - a[1].contribution);

  const reasonMap: Record<string, string> = {
    frequencyTrend: 'Queda de frequência',
    daysSinceLastVisit: 'Muitos dias sem treinar',
    paymentDelinquency: 'Mensalidade atrasada',
    quizEngagement: 'Baixo engajamento com conteúdo',
    monthsOnPlan: 'Aluno recente (pouca fidelização)',
    videoWatchRate: 'Não assiste conteúdo disponível',
  };

  const mainReason = sortedFactors.length > 0
    ? reasonMap[sortedFactors[0][0]] || 'Múltiplos fatores'
    : 'Sem risco identificado';

  return { probability, score, risk, mainReason, factors: contributions };
}
