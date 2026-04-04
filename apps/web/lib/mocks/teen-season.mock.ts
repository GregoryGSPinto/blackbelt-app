import type { TeenSeasonPass, SeasonReward, SeasonRankEntry } from '@/lib/api/teen-season.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

const REWARDS: SeasonReward[] = [
  // Bronze tier
  {
    id: 'sr-1',
    tier_required: 'bronze',
    name: 'Adesivo Guerreiro',
    description: 'Adesivo exclusivo da Season 3 para seu perfil.',
    unlocked: true,
    claimed: true,
  },
  {
    id: 'sr-2',
    tier_required: 'bronze',
    name: 'Moldura de Avatar Bronze',
    description: 'Moldura especial bronze para destacar seu avatar.',
    unlocked: true,
    claimed: true,
  },
  // Silver tier
  {
    id: 'sr-3',
    tier_required: 'silver',
    name: 'Titulo "Guerreiro do Tatame"',
    description: 'Titulo exclusivo exibido no ranking e perfil.',
    unlocked: true,
    claimed: true,
  },
  {
    id: 'sr-4',
    tier_required: 'silver',
    name: 'Emoji Exclusivo',
    description: 'Emoji personalizado para usar no chat da academia.',
    unlocked: true,
    claimed: false,
  },
  // Gold tier
  {
    id: 'sr-5',
    tier_required: 'gold',
    name: 'Camiseta Season 3',
    description: 'Camiseta exclusiva "Guerreiros de Tatame" na academia.',
    unlocked: true,
    claimed: false,
  },
  {
    id: 'sr-6',
    tier_required: 'gold',
    name: 'Moldura de Avatar Gold',
    description: 'Moldura dourada animada para seu avatar.',
    unlocked: true,
    claimed: false,
  },
  // Diamond tier
  {
    id: 'sr-7',
    tier_required: 'diamond',
    name: 'Aula Particular',
    description: '1 aula particular com o sensei de sua escolha.',
    unlocked: false,
    claimed: false,
  },
  {
    id: 'sr-8',
    tier_required: 'diamond',
    name: 'Trofeu Season 3',
    description: 'Trofeu fisico exclusivo para os melhores da season.',
    unlocked: false,
    claimed: false,
  },
];

const LEADERBOARD: SeasonRankEntry[] = [
  { rank: 1, student_name: 'Sophia Martins', avatar: null, points: 4850, tier: 'diamond', is_current_user: false },
  { rank: 2, student_name: 'Valentina Rocha', avatar: null, points: 4200, tier: 'diamond', is_current_user: false },
  { rank: 3, student_name: 'Lucas Ferreira', avatar: null, points: 3600, tier: 'gold', is_current_user: true },
  { rank: 4, student_name: 'Pedro Almeida', avatar: null, points: 3100, tier: 'gold', is_current_user: false },
  { rank: 5, student_name: 'Ana Silva', avatar: null, points: 2800, tier: 'gold', is_current_user: false },
  { rank: 6, student_name: 'Gabriel Costa', avatar: null, points: 2450, tier: 'silver', is_current_user: false },
  { rank: 7, student_name: 'Julia Santos', avatar: null, points: 2200, tier: 'silver', is_current_user: false },
  { rank: 8, student_name: 'Matheus Lima', avatar: null, points: 1950, tier: 'silver', is_current_user: false },
  { rank: 9, student_name: 'Isabella Souza', avatar: null, points: 1700, tier: 'silver', is_current_user: false },
  { rank: 10, student_name: 'Rafael Oliveira', avatar: null, points: 1500, tier: 'bronze', is_current_user: false },
  { rank: 11, student_name: 'Camila Pereira', avatar: null, points: 1350, tier: 'bronze', is_current_user: false },
  { rank: 12, student_name: 'Bruno Nascimento', avatar: null, points: 1100, tier: 'bronze', is_current_user: false },
  { rank: 13, student_name: 'Larissa Mendes', avatar: null, points: 900, tier: 'bronze', is_current_user: false },
  { rank: 14, student_name: 'Thiago Barbosa', avatar: null, points: 650, tier: 'bronze', is_current_user: false },
  { rank: 15, student_name: 'Fernanda Dias', avatar: null, points: 400, tier: 'bronze', is_current_user: false },
];

export async function mockGetTeenSeasonPass(_studentId: string): Promise<TeenSeasonPass> {
  await delay();

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 42);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 48);

  return {
    season: {
      id: 'season-3',
      name: 'Season 3',
      theme: 'Guerreiros de Tatame',
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      days_remaining: 42,
    },
    my_progress: {
      points: 3600,
      rank: 3,
      tier: 'gold',
      next_tier_at: 4000,
      achievements_count: 14,
    },
    rewards: REWARDS,
    leaderboard: LEADERBOARD,
  };
}

export async function mockClaimSeasonReward(_rewardId: string): Promise<void> {
  await delay();
}
