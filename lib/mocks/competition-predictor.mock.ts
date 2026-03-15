import type { Prediction, MatchupAnalysis, CategoryRecommendation } from '@/lib/api/competition-predictor.service';

const delay = () => new Promise((r) => setTimeout(r, 400));

export async function mockPredictPerformance(_studentId: string, championshipId: string): Promise<Prediction> {
  await delay();
  return {
    student_id: 'student-1',
    championship_id: championshipId,
    podium_probability: 68,
    gold_probability: 32,
    silver_probability: 22,
    bronze_probability: 14,
    strengths: [
      'Jogo de guarda acima da média da categoria (top 20%)',
      'Excelente taxa de finalização — 60% das vitórias por submissão',
      'Condicionamento físico superior — mantém ritmo alto em lutas longas',
      'Boa consistência de treino — 4x/semana nos últimos 3 meses',
      'Experiência competitiva recente — 3 campeonatos nos últimos 6 meses',
    ],
    risks: [
      'Takedowns defensivos — já perdeu por pontos após queda nos últimos 2 campeonatos',
      'Peso acima da categoria — risco de corte forçado (-2.5kg em 28 dias)',
      'Passagem de guarda ofensiva abaixo da média — tende a ficar embaixo',
      'Nunca enfrentou atletas da academia X, que domina a categoria na região',
    ],
    preparation_suggestions: [
      'Intensificar treino de wrestling — 2 sessões extras por semana de takedown defense',
      'Iniciar controle de peso imediato — dieta de 2200kcal/dia com acompanhamento',
      'Sparring posicional focado em passagem de guarda — 3x por semana',
      'Estudar vídeos dos atletas da academia X — principal concorrência',
      'Simulação de competição completa no sábado anterior — com pesagem e aquecimento',
      'Sessão de mentalização e visualização — 10 min/dia antes de dormir',
    ],
    similar_athletes: [
      {
        id: 'sim-1',
        name: 'Rodrigo Ferreira',
        belt: 'Azul',
        academy: 'Gracie Barra SP',
        similarity_score: 87,
        recent_results: ['Ouro — Copa SP 2025', 'Prata — Brasileiro 2025', 'Ouro — Estadual RJ 2026'],
      },
      {
        id: 'sim-2',
        name: 'Felipe Andrade',
        belt: 'Azul',
        academy: 'Alliance RJ',
        similarity_score: 82,
        recent_results: ['Bronze — Brasileiro 2025', 'Ouro — Copa Regional 2025'],
      },
      {
        id: 'sim-3',
        name: 'Thiago Mendes',
        belt: 'Azul',
        academy: 'CheckMat MG',
        similarity_score: 78,
        recent_results: ['Prata — Estadual MG 2026', 'Ouro — Copa Interior 2025'],
      },
    ],
    confidence_level: 74,
    generated_at: new Date().toISOString(),
  };
}

export async function mockGetMatchup(_studentId: string, _opponentId: string): Promise<MatchupAnalysis> {
  await delay();
  return {
    student_id: 'student-1',
    opponent_id: 'opponent-1',
    opponent_name: 'Carlos Eduardo Lima',
    head_to_head: { wins: 1, losses: 2, draws: 0 },
    win_probability: 45,
    style_comparison: [
      { attribute: 'Takedowns', student_score: 65, opponent_score: 82 },
      { attribute: 'Guarda', student_score: 85, opponent_score: 70 },
      { attribute: 'Passagem', student_score: 60, opponent_score: 75 },
      { attribute: 'Finalizações', student_score: 78, opponent_score: 65 },
      { attribute: 'Condicionamento', student_score: 80, opponent_score: 72 },
      { attribute: 'Jogo em pé', student_score: 55, opponent_score: 80 },
    ],
    recommendation: 'Contra Carlos Eduardo, a estratégia ideal é puxar guarda cedo e impor seu jogo de baixo. Ele é superior no jogo em pé e passagem, mas sua guarda e finalizações são melhores. Evite a troca em pé — se ficar de pé por mais de 30s, provavelmente ele vai pontuar. No chão, busque triângulo e armlock do fechado, onde você tem vantagem clara. Use seu condicionamento superior para pressionar no final da luta.',
    key_advantages: [
      'Guarda significativamente melhor (+15 pontos)',
      'Finalizações mais eficientes (+13 pontos)',
      'Condicionamento superior — aproveitar final da luta',
    ],
    key_vulnerabilities: [
      'Jogo em pé muito inferior (-25 pontos)',
      'Passagem de guarda abaixo (-15 pontos)',
      'Histórico negativo: 1-2 contra ele',
    ],
  };
}

export async function mockGetOptimalCategory(_studentId: string, _championshipId: string): Promise<CategoryRecommendation> {
  await delay();
  return {
    student_id: 'student-1',
    championship_id: 'champ-1',
    current_weight: 78.5,
    recommended_category: 'Meio-Pesado',
    recommended_weight_range: '76.1kg — 82.3kg',
    alternative_category: 'Pesado',
    alternative_weight_range: '82.4kg — 88.3kg',
    reasoning: 'Sua categoria natural é Meio-Pesado (76.1-82.3kg). Com 78.5kg, você está confortavelmente dentro do peso sem necessidade de corte. No entanto, se optar por descer para Médio (69.1-76kg), seria necessário perder 2.5kg em 28 dias — viável mas desconfortável. A recomendação é competir no Meio-Pesado, onde seu peso natural te coloca no meio da faixa, com boa força relativa e sem risco de desidratação.',
    weight_adjustment_needed: 0,
    days_until_competition: 28,
    feasibility: 'easy',
  };
}
