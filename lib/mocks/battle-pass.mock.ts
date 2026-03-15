import type { BattlePassDTO, BattlePassLevel, BattlePassProgress, BattlePassReward } from '@/lib/api/battle-pass.service';

const delay = () => new Promise((r) => setTimeout(r, 400));

function freeReward(level: number): BattlePassReward | null {
  const rewards: Record<number, BattlePassReward> = {
    1: { type: 'xp_bonus', label: '+50 XP', icon: '⚡' },
    3: { type: 'badge', label: 'Badge Iniciante S3', icon: '🏅' },
    5: { type: 'xp_bonus', label: '+100 XP', icon: '⚡' },
    7: { type: 'store_discount', label: '5% desconto na loja', icon: '🏷️' },
    9: { type: 'xp_bonus', label: '+150 XP', icon: '⚡' },
    11: { type: 'badge', label: 'Badge Guerreiro Bronze', icon: '🥉' },
    13: { type: 'xp_bonus', label: '+200 XP', icon: '⚡' },
    15: { type: 'store_discount', label: '10% desconto na loja', icon: '🏷️' },
    17: { type: 'xp_bonus', label: '+250 XP', icon: '⚡' },
    19: { type: 'badge', label: 'Badge Guerreiro Prata', icon: '🥈' },
    21: { type: 'xp_bonus', label: '+300 XP', icon: '⚡' },
    23: { type: 'store_discount', label: '15% desconto na loja', icon: '🏷️' },
    25: { type: 'xp_bonus', label: '+400 XP', icon: '⚡' },
    27: { type: 'badge', label: 'Badge Guerreiro Ouro', icon: '🥇' },
    29: { type: 'xp_bonus', label: '+500 XP', icon: '⚡' },
  };
  return rewards[level] ?? null;
}

function premiumReward(level: number): BattlePassReward | null {
  const rewards: Record<number, BattlePassReward> = {
    2: { type: 'xp_bonus', label: '+100 XP Premium', icon: '💎' },
    4: { type: 'badge', label: 'Badge Premium Exclusivo', icon: '✨' },
    6: { type: 'store_discount', label: '15% desconto premium', icon: '💰' },
    8: { type: 'special_title', label: 'Título: Guerreiro Premium', icon: '👑' },
    10: { type: 'ranking_highlight', label: 'Destaque no ranking 7 dias', icon: '🌟' },
    12: { type: 'xp_bonus', label: '+300 XP Premium', icon: '💎' },
    14: { type: 'badge', label: 'Badge Tatame de Ouro', icon: '🏆' },
    16: { type: 'store_discount', label: '25% desconto premium', icon: '💰' },
    18: { type: 'private_lesson', label: 'Aula particular grátis', icon: '🥋' },
    20: { type: 'special_title', label: 'Título: Samurai Lendário', icon: '👑' },
    22: { type: 'ranking_highlight', label: 'Destaque no ranking 14 dias', icon: '🌟' },
    24: { type: 'xp_bonus', label: '+500 XP Premium', icon: '💎' },
    26: { type: 'badge', label: 'Badge Centurião', icon: '🦅' },
    28: { type: 'store_discount', label: '40% desconto premium', icon: '💰' },
    30: { type: 'exclusive_gi', label: 'Quimono Exclusivo Season 3', icon: '🥋' },
  };
  return rewards[level] ?? null;
}

const LEVELS: BattlePassLevel[] = Array.from({ length: 30 }, (_, i) => {
  const lvl = i + 1;
  return {
    level: lvl,
    xp_required: lvl * 200,
    free_reward: freeReward(lvl),
    premium_reward: premiumReward(lvl),
    claimed_free: lvl <= 11,
    claimed_premium: lvl <= 11,
  };
});

const BATTLE_PASS: BattlePassDTO = {
  season_id: 'season-3',
  levels: LEVELS,
  is_premium: false,
  premium_price: 29.90,
};

const MY_PROGRESS: BattlePassProgress = {
  user_id: 'student-1',
  season_id: 'season-3',
  current_level: 12,
  current_xp: 2150,
  xp_to_next_level: 450,
  is_premium: false,
  total_rewards_claimed: 6,
};

export async function mockGetBattlePass(_seasonId: string): Promise<BattlePassDTO> {
  await delay();
  return { ...BATTLE_PASS, levels: LEVELS.map((l) => ({ ...l })) };
}

export async function mockGetMyProgress(_userId: string, _seasonId: string): Promise<BattlePassProgress> {
  await delay();
  return { ...MY_PROGRESS };
}

export async function mockClaimReward(_userId: string, levelId: number): Promise<{ success: boolean; message: string }> {
  await delay();
  const level = LEVELS.find((l) => l.level === levelId);
  if (level) {
    level.claimed_free = true;
  }
  return { success: true, message: `Recompensa do nível ${levelId} resgatada com sucesso!` };
}

export async function mockUpgradeToPremium(_userId: string, _seasonId: string): Promise<{ success: boolean; message: string }> {
  await delay();
  BATTLE_PASS.is_premium = true;
  MY_PROGRESS.is_premium = true;
  return { success: true, message: 'Upgrade para Premium realizado com sucesso!' };
}
