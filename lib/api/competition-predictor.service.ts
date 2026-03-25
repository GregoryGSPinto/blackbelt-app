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
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Fetch student stats
    const { data: student } = await supabase
      .from('students')
      .select('name, belt, stripes')
      .eq('id', studentId)
      .single();

    const { count: attendanceCount } = await supabase
      .from('attendance')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', studentId);

    // Simple statistical model based on attendance and belt
    const total = attendanceCount ?? 0;
    const belt = student?.belt ?? 'branca';
    const beltMultiplier: Record<string, number> = { branca: 0.3, azul: 0.5, roxa: 0.65, marrom: 0.8, preta: 0.9 };
    const baseProbability = Math.min(0.95, (beltMultiplier[belt] ?? 0.3) * Math.min(1, total / 100));
    const confidence = Math.min(0.9, total / 200);

    return {
      student_id: studentId,
      championship_id: championshipId,
      podium_probability: Math.round(baseProbability * 100) / 100,
      gold_probability: Math.round(baseProbability * 0.4 * 100) / 100,
      silver_probability: Math.round(baseProbability * 0.35 * 100) / 100,
      bronze_probability: Math.round(baseProbability * 0.25 * 100) / 100,
      strengths: total > 50 ? ['Frequência alta de treinos', 'Experiência em tatame'] : ['Dedicação ao treinamento'],
      risks: total < 30 ? ['Pouca experiência competitiva'] : [],
      preparation_suggestions: ['Manter frequência de treinos', 'Focar em sparring competitivo'],
      similar_athletes: [],
      confidence_level: Math.round(confidence * 100) / 100,
      generated_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[predictPerformance] Fallback:', error);
    return emptyPrediction(studentId, championshipId);
  }
}

export async function getMatchup(studentId: string, opponentId: string): Promise<MatchupAnalysis> {
  try {
    if (isMock()) {
      const { mockGetMatchup } = await import('@/lib/mocks/competition-predictor.mock');
      return mockGetMatchup(studentId, opponentId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: opponent } = await supabase
      .from('students')
      .select('name, belt')
      .eq('id', opponentId)
      .single();

    const { count: studentAttendance } = await supabase
      .from('attendance')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', studentId);

    const { count: opponentAttendance } = await supabase
      .from('attendance')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', opponentId);

    const sAtt = studentAttendance ?? 0;
    const oAtt = opponentAttendance ?? 0;
    const totalAtt = sAtt + oAtt || 1;
    const winProb = Math.round((sAtt / totalAtt) * 100) / 100;

    return {
      student_id: studentId,
      opponent_id: opponentId,
      opponent_name: opponent?.name ?? '',
      head_to_head: { wins: 0, losses: 0, draws: 0 },
      win_probability: winProb,
      style_comparison: [
        { attribute: 'Frequência', student_score: Math.min(10, sAtt / 10), opponent_score: Math.min(10, oAtt / 10) },
      ],
      recommendation: sAtt > oAtt
        ? 'Vantagem na frequência de treinos. Mantenha o ritmo.'
        : 'Adversário com maior frequência. Intensifique os treinos.',
      key_advantages: sAtt > oAtt ? ['Maior frequência de treinos'] : [],
      key_vulnerabilities: sAtt < oAtt ? ['Menor frequência de treinos'] : [],
    };
  } catch (error) {
    console.error('[getMatchup] Fallback:', error);
    return emptyMatchup(studentId, opponentId);
  }
}

export async function getOptimalCategory(studentId: string, championshipId: string): Promise<CategoryRecommendation> {
  try {
    if (isMock()) {
      const { mockGetOptimalCategory } = await import('@/lib/mocks/competition-predictor.mock');
      return mockGetOptimalCategory(studentId, championshipId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data: student } = await supabase
      .from('students')
      .select('name, belt, weight')
      .eq('id', studentId)
      .single();

    const { data: tournament } = await supabase
      .from('tournaments')
      .select('event_date')
      .eq('id', championshipId)
      .single();

    const weight = (student?.weight as number) ?? 0;
    const eventDate = tournament?.event_date ? new Date(tournament.event_date) : new Date();
    const daysUntil = Math.max(0, Math.ceil((eventDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)));

    return {
      student_id: studentId,
      championship_id: championshipId,
      current_weight: weight,
      recommended_category: weight > 0 ? `Até ${Math.ceil(weight / 5) * 5}kg` : '',
      recommended_weight_range: weight > 0 ? `${Math.floor(weight / 5) * 5}-${Math.ceil(weight / 5) * 5}kg` : '',
      alternative_category: weight > 0 ? `Até ${Math.ceil(weight / 5) * 5 + 5}kg` : '',
      alternative_weight_range: weight > 0 ? `${Math.ceil(weight / 5) * 5}-${Math.ceil(weight / 5) * 5 + 5}kg` : '',
      reasoning: weight > 0
        ? `Baseado no peso atual de ${weight}kg.`
        : 'Peso não registrado. Atualize o cadastro do aluno.',
      weight_adjustment_needed: 0,
      days_until_competition: daysUntil,
      feasibility: 'easy' as const,
    };
  } catch (error) {
    console.error('[getOptimalCategory] Fallback:', error);
    return emptyCategory(studentId, championshipId);
  }
}
