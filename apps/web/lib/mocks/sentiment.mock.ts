import type { SentimentTrend } from '@/lib/api/sentiment.service';

const delay = () => new Promise((r) => setTimeout(r, 200));

export async function mockGetSentimentTrend(_academyId: string): Promise<SentimentTrend[]> {
  await delay();
  return [
    { month: 'Out', positive: 72, neutral: 20, negative: 8 },
    { month: 'Nov', positive: 75, neutral: 18, negative: 7 },
    { month: 'Dez', positive: 68, neutral: 22, negative: 10 },
    { month: 'Jan', positive: 80, neutral: 15, negative: 5 },
    { month: 'Fev', positive: 78, neutral: 16, negative: 6 },
    { month: 'Mar', positive: 82, neutral: 14, negative: 4 },
  ];
}
