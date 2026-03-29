import type { RankedAthleteDTO, RankedAcademyDTO, AthleteProfileDTO, RankingFilters, AthleteCompetitionHistory } from '@/lib/api/federation-ranking.service';

const delay = () => new Promise((r) => setTimeout(r, 350 + Math.random() * 150));

const FIRST_NAMES = [
  'Lucas', 'Rafael', 'Pedro', 'Matheus', 'Gabriel', 'Bruno', 'Thiago', 'Diego',
  'Felipe', 'André', 'Rodrigo', 'Vinícius', 'Gustavo', 'Leandro', 'Marcelo', 'Eduardo',
  'Ana Paula', 'Juliana', 'Camila', 'Bianca', 'Fernanda', 'Patrícia', 'Isabela', 'Letícia',
  'Carlos', 'Ricardo', 'Alexandre', 'Daniel', 'Roberto', 'Paulo', 'João', 'Marcos',
];

const LAST_NAMES = [
  'Ferreira', 'Santos', 'Oliveira', 'Costa', 'Almeida', 'Lima', 'Nascimento', 'Ribeiro',
  'Souza', 'Martins', 'Campos', 'Rocha', 'Pereira', 'Silva', 'Barbosa', 'Mendes',
  'Soares', 'Moreira', 'Teixeira', 'Araújo', 'Cardoso', 'Nunes', 'Correia', 'Monteiro',
  'Yamamoto', 'Tanaka', 'Fujimoto', 'Watanabe', 'Takahashi', 'Morimoto', 'Nakamura', 'Sato',
];

const ACADEMIES = [
  'Academia Tatame Centro', 'Team Kime Norte', 'Escola Ippon Sul', 'Equipe Dragão Leste',
  'Academia Vitória Oeste', 'Team Bushido Moema', 'Equipe Samurai Jardins', 'Academia Leão Pinheiros',
  'Judô Nippon', 'Budokan SP', 'Kodokan Brasil', 'Fight Club RJ',
  'Team Alpha', 'Brotherhood BJJ', 'Kioto JJ', 'Escola Templo',
  'Infight JJ', 'Team Fênix', 'Brasa CTA', 'Zenith BJJ',
];

const BELTS = ['Branca', 'Azul', 'Roxa', 'Marrom', 'Preta'];
const WEIGHTS = ['Galo (até 57kg)', 'Pluma (até 64kg)', 'Pena (até 70kg)', 'Leve (até 76kg)', 'Médio (até 82kg)', 'Meio-Pesado (até 88kg)', 'Pesado (até 94kg)', 'Super-Pesado (até 100kg)'];
const REGIONS = ['São Paulo', 'Rio de Janeiro', 'Minas Gerais', 'Paraná', 'Santa Catarina', 'Bahia', 'Pernambuco', 'Rio Grande do Sul'];

// Generate 100 athletes
const ATHLETE_RANKING: RankedAthleteDTO[] = Array.from({ length: 100 }, (_, i) => {
  const gold = Math.max(0, 5 - Math.floor(i / 10) + Math.floor(Math.random() * 3));
  const silver = Math.max(0, 3 - Math.floor(i / 15) + Math.floor(Math.random() * 3));
  const bronze = Math.max(0, 2 + Math.floor(Math.random() * 4));
  const points = Math.max(1, 270 - i * 2.5 + Math.floor(Math.random() * 20));

  return {
    position: i + 1,
    athlete_id: `ath-rank-${i + 1}`,
    athlete_name: `${FIRST_NAMES[i % FIRST_NAMES.length]} ${LAST_NAMES[i % LAST_NAMES.length]}`,
    academy: ACADEMIES[i % ACADEMIES.length],
    belt: BELTS[Math.min(4, Math.floor(i / 20) + Math.floor(Math.random() * 2))],
    weight_class: WEIGHTS[i % WEIGHTS.length],
    region: REGIONS[i % REGIONS.length],
    points: Math.round(points),
    gold,
    silver,
    bronze,
    events_count: 3 + Math.floor(Math.random() * 8),
  };
});

// Generate 20 academy rankings
const ACADEMY_RANKING: RankedAcademyDTO[] = ACADEMIES.map((name, i) => ({
  position: i + 1,
  academy_id: `ac-rank-${i + 1}`,
  academy_name: name,
  region: REGIONS[i % REGIONS.length],
  total_points: Math.round(1200 - i * 55 + Math.random() * 40),
  athletes_count: 15 + Math.floor(Math.random() * 40),
  gold: Math.max(0, 8 - i + Math.floor(Math.random() * 3)),
  silver: Math.max(0, 5 - Math.floor(i / 2) + Math.floor(Math.random() * 3)),
  bronze: 2 + Math.floor(Math.random() * 6),
}));

const CHAMPIONSHIPS_HISTORY = [
  'Copa Paulista de Jiu-Jitsu 2026', 'Brasileiro de Judô 2026', 'Grand Slam Rio 2026',
  'Open Nordeste 2025', 'Copa Sul 2025', 'Estadual SP 2025',
  'Copa Brasil 2025', 'Open Nacional 2025', 'Grand Prix MG 2025',
];

function makeHistory(count: number): AthleteCompetitionHistory[] {
  const results: ('gold' | 'silver' | 'bronze' | 'eliminated')[] = ['gold', 'silver', 'bronze', 'eliminated'];
  const importances: ('local' | 'estadual' | 'nacional')[] = ['local', 'estadual', 'nacional'];
  const categories = ['Leve Azul Masc', 'Médio Roxa Masc', 'Pesado Preta Masc', 'Leve Azul Fem', 'Absoluto Preta Masc'];

  return Array.from({ length: count }, (_, i) => {
    const result = results[i % results.length];
    const importance = importances[i % importances.length];
    const baseMultiplier: Record<string, number> = { local: 1, estadual: 2, nacional: 3 };
    const basePoints: Record<string, number> = { gold: 9, silver: 3, bronze: 1, eliminated: 0 };
    const monthsAgo = i * 1.5;
    const date = new Date();
    date.setMonth(date.getMonth() - Math.floor(monthsAgo));

    return {
      championship_id: `champ-h-${i + 1}`,
      championship_name: CHAMPIONSHIPS_HISTORY[i % CHAMPIONSHIPS_HISTORY.length],
      date: date.toISOString().split('T')[0],
      category: categories[i % categories.length],
      result,
      points_earned: basePoints[result] * baseMultiplier[importance],
      importance,
    };
  });
}

// 3 athlete profiles with full history
const ATHLETE_PROFILES: AthleteProfileDTO[] = [
  {
    athlete_id: 'ath-rank-1', athlete_name: 'Lucas Ferreira', academy: 'Academia Tatame Centro',
    belt: 'Preta', weight_class: 'Leve (até 76kg)', region: 'São Paulo', age: 28,
    total_points: 270, ranking_position: 1, win_rate: 0.85, submission_rate: 0.62,
    total_fights: 47, total_wins: 40, total_losses: 7, gold: 8, silver: 3, bronze: 2,
    achievements: ['Campeão Paulista 2025', 'Campeão Brasileiro 2025', 'Melhor finalização do ano 2025', 'Atleta revelação 2024'],
    history: makeHistory(9),
  },
  {
    athlete_id: 'ath-rank-2', athlete_name: 'Rafael Santos', academy: 'Team Kime Norte',
    belt: 'Marrom', weight_class: 'Médio (até 82kg)', region: 'Rio de Janeiro', age: 26,
    total_points: 245, ranking_position: 2, win_rate: 0.78, submission_rate: 0.45,
    total_fights: 36, total_wins: 28, total_losses: 8, gold: 5, silver: 5, bronze: 3,
    achievements: ['Vice-Campeão Brasileiro 2025', 'Campeão Estadual RJ 2025', 'Top 5 ranking nacional 2024'],
    history: makeHistory(8),
  },
  {
    athlete_id: 'ath-rank-3', athlete_name: 'Pedro Oliveira', academy: 'Escola Ippon Sul',
    belt: 'Preta', weight_class: 'Pena (até 70kg)', region: 'Paraná', age: 30,
    total_points: 230, ranking_position: 3, win_rate: 0.82, submission_rate: 0.55,
    total_fights: 52, total_wins: 43, total_losses: 9, gold: 6, silver: 4, bronze: 5,
    achievements: ['Campeão Sul-Brasileiro 2025', 'Campeão Grand Slam Rio 2024', 'Melhor guarda do ano 2024'],
    history: makeHistory(10),
  },
];

export async function mockGetAthleteRanking(filters?: RankingFilters): Promise<RankedAthleteDTO[]> {
  await delay();
  let result = ATHLETE_RANKING.map((a) => ({ ...a }));
  if (filters?.belt) {
    result = result.filter((a) => a.belt === filters.belt);
  }
  if (filters?.weight) {
    result = result.filter((a) => a.weight_class.includes(filters.weight!));
  }
  if (filters?.region) {
    result = result.filter((a) => a.region === filters.region);
  }
  // Re-rank after filtering
  result.forEach((a, i) => { a.position = i + 1; });
  return result;
}

export async function mockGetAcademyRanking(filters?: { modality?: string; region?: string }): Promise<RankedAcademyDTO[]> {
  await delay();
  let result = ACADEMY_RANKING.map((a) => ({ ...a }));
  if (filters?.region) {
    result = result.filter((a) => a.region === filters.region);
  }
  result.forEach((a, i) => { a.position = i + 1; });
  return result;
}

export async function mockGetAthleteProfile(athleteId: string): Promise<AthleteProfileDTO> {
  await delay();
  const profile = ATHLETE_PROFILES.find((p) => p.athlete_id === athleteId);
  if (profile) {
    return { ...profile, history: profile.history.map((h) => ({ ...h })) };
  }
  // Generate a fallback profile from the ranking
  const ranked = ATHLETE_RANKING.find((a) => a.athlete_id === athleteId);
  if (!ranked) throw new Error('Athlete not found');
  return {
    athlete_id: ranked.athlete_id,
    athlete_name: ranked.athlete_name,
    academy: ranked.academy,
    belt: ranked.belt,
    weight_class: ranked.weight_class,
    region: ranked.region,
    age: 22 + Math.floor(Math.random() * 12),
    total_points: ranked.points,
    ranking_position: ranked.position,
    win_rate: 0.5 + Math.random() * 0.35,
    submission_rate: 0.2 + Math.random() * 0.5,
    total_fights: 10 + Math.floor(Math.random() * 30),
    total_wins: ranked.gold * 3 + ranked.silver * 2 + ranked.bronze,
    total_losses: Math.floor(Math.random() * 10),
    gold: ranked.gold,
    silver: ranked.silver,
    bronze: ranked.bronze,
    achievements: [],
    history: makeHistory(ranked.events_count),
  };
}
