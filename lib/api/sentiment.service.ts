import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

export interface SentimentResult {
  score: number; // -1 to 1
  label: 'positive' | 'neutral' | 'negative';
}

export interface SentimentTrend {
  month: string;
  positive: number;
  neutral: number;
  negative: number;
}

const POSITIVE_WORDS = ['obrigado', 'parabéns', 'excelente', 'ótimo', 'muito bom', 'adorei', 'gostei', 'incrível', 'top', 'show', 'amei', 'feliz', 'legal', 'maravilhoso'];
const NEGATIVE_WORDS = ['ruim', 'péssimo', 'horrível', 'não gostei', 'decepcionado', 'triste', 'reclamação', 'problema', 'insatisfeito', 'cancelar', 'chateado', 'frustrado'];

export function analyzeSentimentLocal(message: string): SentimentResult {
  const lower = message.toLowerCase();
  let score = 0;
  for (const word of POSITIVE_WORDS) { if (lower.includes(word)) score += 0.2; }
  for (const word of NEGATIVE_WORDS) { if (lower.includes(word)) score -= 0.3; }
  score = Math.max(-1, Math.min(1, score));
  const label = score > 0.1 ? 'positive' : score < -0.1 ? 'negative' : 'neutral';
  return { score, label };
}

export async function getSentimentTrend(academyId: string): Promise<SentimentTrend[]> {
  try {
    if (isMock()) {
      const { mockGetSentimentTrend } = await import('@/lib/mocks/sentiment.mock');
      return mockGetSentimentTrend(academyId);
    }
    try {
      const res = await fetch(`/api/sentiment/trend?academyId=${academyId}`);
      return res.json();
    } catch {
      console.warn('[sentiment.getSentimentTrend] API not available, using mock fallback');
      const { mockGetSentimentTrend } = await import('@/lib/mocks/sentiment.mock');
      return mockGetSentimentTrend(academyId);
    }
  } catch (error) { handleServiceError(error, 'sentiment.trend'); }
}
