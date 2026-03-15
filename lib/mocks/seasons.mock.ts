import type { SeasonDTO, SeasonProgress, LeaderboardEntry, SeasonRewardTier } from '@/lib/api/seasons.service';

const delay = () => new Promise((r) => setTimeout(r, 350));

const SEASONS: SeasonDTO[] = [
  {
    id: 'season-3',
    academy_id: 'academy-1',
    name: 'Season 3 — Guerreiros de Tatame',
    start_date: '2026-02-01',
    end_date: '2026-04-30',
    status: 'active',
    theme: 'guerreiros',
    rewards: [
      { rank_range: '1', reward_type: 'produto', reward_value: 'Quimono exclusivo Season 3 + 500 XP' },
      { rank_range: '2-3', reward_type: 'desconto', reward_value: '50% desconto na loja + 300 XP' },
      { rank_range: '4-10', reward_type: 'digital', reward_value: 'Badge Guerreiro Lendário + 200 XP' },
      { rank_range: '11-20', reward_type: 'experiencia', reward_value: 'Badge Guerreiro de Tatame + 100 XP' },
    ],
  },
  {
    id: 'season-2',
    academy_id: 'academy-1',
    name: 'Season 2 — Caminho do Samurai',
    start_date: '2025-11-01',
    end_date: '2026-01-31',
    status: 'ended',
    theme: 'samurai',
    rewards: [
      { rank_range: '1', reward_type: 'produto', reward_value: 'Faixa personalizada + 500 XP' },
      { rank_range: '2-3', reward_type: 'desconto', reward_value: '40% desconto na loja + 300 XP' },
      { rank_range: '4-10', reward_type: 'digital', reward_value: 'Badge Samurai + 200 XP' },
    ],
  },
  {
    id: 'season-1',
    academy_id: 'academy-1',
    name: 'Season 1 — Primeira Luta',
    start_date: '2025-08-01',
    end_date: '2025-10-31',
    status: 'ended',
    theme: 'luta',
    rewards: [
      { rank_range: '1', reward_type: 'produto', reward_value: 'Rashguard exclusivo + 500 XP' },
      { rank_range: '2-5', reward_type: 'desconto', reward_value: '30% desconto na loja + 200 XP' },
    ],
  },
];

const NAMES = [
  'Lucas Silva', 'Pedro Oliveira', 'Gabriel Santos', 'Rafael Costa', 'Matheus Souza',
  'Bruno Ferreira', 'Thiago Almeida', 'Felipe Pereira', 'André Lima', 'Gustavo Ribeiro',
  'João Carvalho', 'Diego Martins', 'Vinícius Rocha', 'Ricardo Gomes', 'Leonardo Araújo',
  'Caio Nascimento', 'Daniel Barbosa', 'Henrique Correia', 'Marcos Vieira', 'Eduardo Dias',
];

const TIERS: Array<'diamond' | 'gold' | 'silver' | 'bronze'> = ['diamond', 'gold', 'gold', 'silver', 'silver', 'silver', 'bronze', 'bronze', 'bronze', 'bronze'];

const LEADERBOARD: LeaderboardEntry[] = NAMES.map((name, i) => ({
  student_id: `student-${i + 1}`,
  student_name: name,
  avatar_url: `/avatars/${i + 1}.jpg`,
  points: Math.max(100, 2800 - i * 130 + Math.floor(Math.random() * 50)),
  rank: i + 1,
  tier: TIERS[Math.min(i, TIERS.length - 1)] as LeaderboardEntry['tier'],
}));

const MY_PROGRESS: SeasonProgress = {
  season_id: 'season-3',
  student_id: 'student-1',
  season_points: 2820,
  rank: 1,
  tier: 'diamond',
  achievements_this_season: ['Guerreiro da Semana', 'Streak de 14 Dias', 'Maratona de Vídeos', 'Nota Máxima'],
  streak_this_season: 14,
  classes_attended_this_season: 38,
};

export async function mockGetCurrentSeason(_academyId: string): Promise<SeasonDTO> {
  await delay();
  const active = SEASONS.find((s) => s.status === 'active');
  return { ...active! };
}

export async function mockGetSeasonLeaderboard(_seasonId: string, _category?: string): Promise<LeaderboardEntry[]> {
  await delay();
  return LEADERBOARD.map((e) => ({ ...e }));
}

export async function mockGetSeasonRewards(seasonId: string): Promise<SeasonRewardTier[]> {
  await delay();
  const season = SEASONS.find((s) => s.id === seasonId);
  return season ? season.rewards.map((r) => ({ ...r })) : [];
}

export async function mockGetMySeasonProgress(_studentId: string, _seasonId: string): Promise<SeasonProgress> {
  await delay();
  return { ...MY_PROGRESS };
}

export { SEASONS };
