import { isMock } from '@/lib/env';

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

const POSITIVE_WORDS = ['obrigado', 'parab\u00e9ns', 'excelente', '\u00f3timo', 'muito bom', 'adorei', 'gostei', 'incr\u00edvel', 'top', 'show', 'amei', 'feliz', 'legal', 'maravilhoso'];
const NEGATIVE_WORDS = ['ruim', 'p\u00e9ssimo', 'horr\u00edvel', 'n\u00e3o gostei', 'decepcionado', 'triste', 'reclama\u00e7\u00e3o', 'problema', 'insatisfeito', 'cancelar', 'chateado', 'frustrado'];

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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('sentiment_trends')
      .select('*')
      .eq('academy_id', academyId)
      .order('month', { ascending: true });
    if (error) {
      console.warn('[getSentimentTrend] Supabase error:', error.message);
      return [];
    }
    return (data ?? []) as SentimentTrend[];
  } catch (error) {
    console.warn('[getSentimentTrend] Fallback:', error);
    return [];
  }
}
