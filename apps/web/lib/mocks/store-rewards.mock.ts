import type { RewardBalance, RewardTransaction } from '@/lib/api/store-rewards.service';

const delay = () => new Promise((r) => setTimeout(r, 300 + Math.random() * 200));

const BALANCE: RewardBalance = {
  points: 1350,
  value_brl: 13.50,
};

const HISTORY: RewardTransaction[] = [
  { id: 'rw-1', user_id: 'user-1', type: 'checkin', points: 10, description: 'Check-in na aula de BJJ Avançado', reference_id: 'chk-101', created_at: '2026-03-15T07:30:00Z' },
  { id: 'rw-2', user_id: 'user-1', type: 'checkin', points: 10, description: 'Check-in na aula de BJJ Fundamentos', reference_id: 'chk-100', created_at: '2026-03-14T08:00:00Z' },
  { id: 'rw-3', user_id: 'user-1', type: 'purchase', points: 25, description: 'Compra na loja - Pedido #ord-2 (5% de R$ 489,70)', reference_id: 'ord-2', created_at: '2026-03-01T09:00:00Z' },
  { id: 'rw-4', user_id: 'user-1', type: 'checkin', points: 10, description: 'Check-in na aula de Muay Thai', reference_id: 'chk-98', created_at: '2026-02-28T18:00:00Z' },
  { id: 'rw-5', user_id: 'user-1', type: 'checkin', points: 10, description: 'Check-in na aula de BJJ Competição', reference_id: 'chk-97', created_at: '2026-02-27T07:00:00Z' },
  { id: 'rw-6', user_id: 'user-1', type: 'bonus', points: 100, description: 'Bônus de boas-vindas ao programa de recompensas', created_at: '2026-02-01T10:00:00Z' },
  { id: 'rw-7', user_id: 'user-1', type: 'redemption', points: -500, description: 'Resgate de R$ 5,00 no pedido #ord-1', reference_id: 'ord-1', created_at: '2026-02-10T14:30:00Z' },
  { id: 'rw-8', user_id: 'user-1', type: 'purchase', points: 20, description: 'Compra na loja - Pedido #ord-1 (5% de R$ 389,90)', reference_id: 'ord-1', created_at: '2026-02-10T14:30:00Z' },
  { id: 'rw-9', user_id: 'user-1', type: 'checkin', points: 10, description: 'Check-in na aula de No-Gi', reference_id: 'chk-85', created_at: '2026-02-08T19:00:00Z' },
  { id: 'rw-10', user_id: 'user-1', type: 'checkin', points: 10, description: 'Check-in na aula de BJJ Avançado', reference_id: 'chk-84', created_at: '2026-02-07T07:30:00Z' },
];

export async function mockGetBalance(_userId: string): Promise<RewardBalance> {
  await delay();
  return { ...BALANCE };
}

export async function mockGetHistory(_userId: string): Promise<RewardTransaction[]> {
  await delay();
  return HISTORY.map((t) => ({ ...t }));
}

export async function mockRedeemPoints(_userId: string, amount: number, orderId: string): Promise<RewardTransaction> {
  await delay();
  const transaction: RewardTransaction = {
    id: `rw-${Date.now()}`,
    user_id: _userId,
    type: 'redemption',
    points: -amount,
    description: `Resgate de R$ ${(amount / 100).toFixed(2).replace('.', ',')} no pedido #${orderId}`,
    reference_id: orderId,
    created_at: new Date().toISOString(),
  };
  BALANCE.points -= amount;
  BALANCE.value_brl = BALANCE.points / 100;
  HISTORY.unshift(transaction);
  return { ...transaction };
}
