import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

export interface SimilarAthlete {
  id: string;
  name: string;
  belt: string;
  academy: string;
  similarity_score: number;
  recent_results: string[];
}

export interface Prediction {
  student_id: string;
  championship_id: string;
  podium_probability: number;
  gold_probability: number;
  silver_probability: number;
  bronze_probability: number;
  strengths: string[];
  risks: string[];
  preparation_suggestions: string[];
  similar_athletes: SimilarAthlete[];
  confidence_level: number;
  generated_at: string;
}

export interface StyleComparison {
  attribute: string;
  student_score: number;
  opponent_score: number;
}

export interface MatchupAnalysis {
  student_id: string;
  opponent_id: string;
  opponent_name: string;
  head_to_head: { wins: number; losses: number; draws: number };
  win_probability: number;
  style_comparison: StyleComparison[];
  recommendation: string;
  key_advantages: string[];
  key_vulnerabilities: string[];
}

export interface CategoryRecommendation {
  student_id: string;
  championship_id: string;
  current_weight: number;
  recommended_category: string;
  recommended_weight_range: string;
  alternative_category: string;
  alternative_weight_range: string;
  reasoning: string;
  weight_adjustment_needed: number;
  days_until_competition: number;
  feasibility: 'easy' | 'moderate' | 'difficult' | 'not_recommended';
}

export async function predictPerformance(studentId: string, championshipId: string): Promise<Prediction> {
  try {
    if (isMock()) {
      const { mockPredictPerformance } = await import('@/lib/mocks/competition-predictor.mock');
      return mockPredictPerformance(studentId, championshipId);
    }
    try {
      const res = await fetch('/api/ai/competition-predictor/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, championshipId }),
      });
      return res.json();
    } catch {
      console.warn('[competition-predictor.predictPerformance] API not available, using mock fallback');
      const { mockPredictPerformance } = await import('@/lib/mocks/competition-predictor.mock');
      return mockPredictPerformance(studentId, championshipId);
    }
  } catch (error) {
    handleServiceError(error, 'competitionPredictor.predict');
  }
}

export async function getMatchup(studentId: string, opponentId: string): Promise<MatchupAnalysis> {
  try {
    if (isMock()) {
      const { mockGetMatchup } = await import('@/lib/mocks/competition-predictor.mock');
      return mockGetMatchup(studentId, opponentId);
    }
    try {
      const res = await fetch('/api/ai/competition-predictor/matchup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, opponentId }),
      });
      return res.json();
    } catch {
      console.warn('[competition-predictor.getMatchup] API not available, using fallback');
      return { style_comparison: { area: "", student: 0, opponent: 0 }, strengths: [], vulnerabilities: [], game_plan: "" } as unknown as MatchupAnalysis;
    }
  } catch (error) {
    handleServiceError(error, 'competitionPredictor.matchup');
  }
}

export async function getOptimalCategory(studentId: string, championshipId: string): Promise<CategoryRecommendation> {
  try {
    if (isMock()) {
      const { mockGetOptimalCategory } = await import('@/lib/mocks/competition-predictor.mock');
      return mockGetOptimalCategory(studentId, championshipId);
    }
    try {
      const res = await fetch('/api/ai/competition-predictor/category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, championshipId }),
      });
      return res.json();
    } catch {
      console.warn('[competition-predictor.getOptimalCategory] API not available, using mock fallback');
      const { mockGetOptimalCategory } = await import('@/lib/mocks/competition-predictor.mock');
      return mockGetOptimalCategory(studentId, championshipId);
    }
  } catch (error) {
    handleServiceError(error, 'competitionPredictor.optimalCategory');
  }
}
