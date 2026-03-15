import type { StoreReward, RedemptionDTO, RewardsStoreData } from '@/lib/api/rewards-store.service';

const delay = () => new Promise((r) => setTimeout(r, 400));

const REWARDS: StoreReward[] = [
  // desconto
  { id: 'rw-1', name: '10% na mensalidade', description: 'Desconto de 10% na próxima mensalidade', image_url: '/rewards/desconto-10.jpg', cost_points: 500, category: 'desconto', stock: 50, status: 'available' },
  { id: 'rw-2', name: '20% na loja', description: 'Cupom de 20% em qualquer produto da loja', image_url: '/rewards/desconto-loja.jpg', cost_points: 300, category: 'desconto', stock: 100, status: 'available' },
  // experiencia
  { id: 'rw-3', name: 'Aula particular', description: 'Uma aula particular com o professor principal', image_url: '/rewards/aula-particular.jpg', cost_points: 1500, category: 'experiencia', stock: 5, status: 'available' },
  { id: 'rw-4', name: 'Workshop exclusivo', description: 'Vaga em workshop de defesa pessoal', image_url: '/rewards/workshop.jpg', cost_points: 800, category: 'experiencia', stock: 10, status: 'available' },
  // produto
  { id: 'rw-5', name: 'Camiseta da academia', description: 'Camiseta oficial com logo da academia', image_url: '/rewards/camiseta.jpg', cost_points: 600, category: 'produto', stock: 30, status: 'available' },
  { id: 'rw-6', name: 'Rashguard treino', description: 'Rashguard de treino com design exclusivo', image_url: '/rewards/rashguard.jpg', cost_points: 1200, category: 'produto', stock: 15, status: 'available' },
  { id: 'rw-7', name: 'Faixa personalizada', description: 'Faixa bordada com seu nome', image_url: '/rewards/faixa.jpg', cost_points: 2000, category: 'produto', stock: 0, status: 'out_of_stock' },
  // digital
  { id: 'rw-8', name: 'Badge exclusivo', description: 'Badge "Colecionador" exclusivo para seu perfil', image_url: '/rewards/badge-colecionador.jpg', cost_points: 200, category: 'digital', stock: 999, status: 'available' },
  { id: 'rw-9', name: 'Destaque no ranking', description: 'Seu perfil em destaque no ranking por 7 dias', image_url: '/rewards/destaque.jpg', cost_points: 400, category: 'digital', stock: 999, status: 'available' },
  // prioridade
  { id: 'rw-10', name: 'Vaga prioritária', description: 'Reserva prioritária em turmas lotadas por 30 dias', image_url: '/rewards/prioridade.jpg', cost_points: 700, category: 'prioridade', stock: 20, status: 'available' },
];

const REDEMPTIONS: RedemptionDTO[] = [
  { id: 'red-1', reward_id: 'rw-8', reward_name: 'Badge exclusivo', cost_points: 200, redeemed_at: '2026-03-01T14:30:00Z', status: 'delivered', user_id: 'student-1', user_name: 'Lucas Silva' },
  { id: 'red-2', reward_id: 'rw-2', reward_name: '20% na loja', cost_points: 300, redeemed_at: '2026-03-05T10:15:00Z', status: 'delivered', user_id: 'student-1', user_name: 'Lucas Silva' },
  { id: 'red-3', reward_id: 'rw-5', reward_name: 'Camiseta da academia', cost_points: 600, redeemed_at: '2026-03-10T16:45:00Z', status: 'pending', user_id: 'student-1', user_name: 'Lucas Silva' },
  { id: 'red-4', reward_id: 'rw-1', reward_name: '10% na mensalidade', cost_points: 500, redeemed_at: '2026-03-02T09:00:00Z', status: 'delivered', user_id: 'student-2', user_name: 'Pedro Oliveira' },
  { id: 'red-5', reward_id: 'rw-3', reward_name: 'Aula particular', cost_points: 1500, redeemed_at: '2026-03-08T11:20:00Z', status: 'pending', user_id: 'student-3', user_name: 'Gabriel Santos' },
];

export async function mockGetRewardsStore(_academyId: string): Promise<RewardsStoreData> {
  await delay();
  return {
    rewards: REWARDS.map((r) => ({ ...r })),
    user_points_balance: 2820,
  };
}

export async function mockRedeemReward(userId: string, rewardId: string): Promise<{ success: boolean; message: string; redemption: RedemptionDTO }> {
  await delay();
  const reward = REWARDS.find((r) => r.id === rewardId);
  if (!reward || reward.stock <= 0) {
    return { success: false, message: 'Recompensa indisponível', redemption: null as unknown as RedemptionDTO };
  }
  reward.stock -= 1;
  const redemption: RedemptionDTO = {
    id: `red-${Date.now()}`,
    reward_id: rewardId,
    reward_name: reward.name,
    cost_points: reward.cost_points,
    redeemed_at: new Date().toISOString(),
    status: 'pending',
    user_id: userId,
    user_name: 'Lucas Silva',
  };
  REDEMPTIONS.push(redemption);
  return { success: true, message: `${reward.name} resgatado com sucesso!`, redemption };
}

export async function mockGetMyRedemptions(_userId: string): Promise<RedemptionDTO[]> {
  await delay();
  return REDEMPTIONS.filter((r) => r.user_id === 'student-1').map((r) => ({ ...r }));
}

export async function mockCreateStoreReward(_academyId: string, data: Omit<StoreReward, 'id' | 'status'>): Promise<StoreReward> {
  await delay();
  const reward: StoreReward = { ...data, id: `rw-${Date.now()}`, status: 'available' };
  REWARDS.push(reward);
  return reward;
}

export async function mockUpdateStoreReward(rewardId: string, data: Partial<StoreReward>): Promise<StoreReward> {
  await delay();
  const idx = REWARDS.findIndex((r) => r.id === rewardId);
  if (idx >= 0) Object.assign(REWARDS[idx], data);
  return { ...REWARDS[idx] };
}

export async function mockDeleteStoreReward(rewardId: string): Promise<void> {
  await delay();
  const idx = REWARDS.findIndex((r) => r.id === rewardId);
  if (idx >= 0) REWARDS.splice(idx, 1);
}

export async function mockGetAllRedemptions(_academyId: string): Promise<RedemptionDTO[]> {
  await delay();
  return REDEMPTIONS.map((r) => ({ ...r }));
}
