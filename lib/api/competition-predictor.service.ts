import { isMock } from '@/lib/env';

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

const emptyPrediction = (studentId: string, championshipId: string): Prediction => ({
  student_id: studentId, championship_id: championshipId, podium_probability: 0, gold_probability: 0, silver_probability: 0, bronze_probability: 0, strengths: [], risks: [], preparation_suggestions: [], similar_athletes: [], confidence_level: 0, generated_at: '',
});

const emptyMatchup = (studentId: string, opponentId: string): MatchupAnalysis => ({
  student_id: studentId, opponent_id: opponentId, opponent_name: '', head_to_head: { wins: 0, losses: 0, draws: 0 }, win_probability: 0, style_comparison: [], recommendation: '', key_advantages: [], key_vulnerabilities: [],
});

const emptyCategory = (studentId: string, championshipId: string): CategoryRecommendation => ({
  student_id: studentId, championship_id: championshipId, current_weight: 0, recommended_category: '', recommended_weight_range: '', alternative_category: '', alternative_weight_range: '', reasoning: '', weight_adjustment_needed: 0, days_until_competition: 0, feasibility: 'easy',
});

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
      if (!res.ok) {
        console.warn('[predictPerformance] API error:', res.status);
        return emptyPrediction(studentId, championshipId);
      }
      return res.json();
    } catch {
      console.warn('[competition-predictor.predictPerformance] API not available — feature em desenvolvimento');
      return emptyPrediction(studentId, championshipId);
    }
  } catch (error) {
    console.warn('[predictPerformance] Fallback:', error);
    return emptyPrediction(studentId, championshipId);
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
      if (!res.ok) {
        console.warn('[getMatchup] API error:', res.status);
        return emptyMatchup(studentId, opponentId);
      }
      return res.json();
    } catch {
      console.warn('[competition-predictor.getMatchup] API not available — feature em desenvolvimento');
      return emptyMatchup(studentId, opponentId);
    }
  } catch (error) {
    console.warn('[getMatchup] Fallback:', error);
    return emptyMatchup(studentId, opponentId);
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
      if (!res.ok) {
        console.warn('[getOptimalCategory] API error:', res.status);
        return emptyCategory(studentId, championshipId);
      }
      return res.json();
    } catch {
      console.warn('[competition-predictor.getOptimalCategory] API not available — feature em desenvolvimento');
      return emptyCategory(studentId, championshipId);
    }
  } catch (error) {
    console.warn('[getOptimalCategory] Fallback:', error);
    return emptyCategory(studentId, championshipId);
  }
}
