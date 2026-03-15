import type { BalanceDTO, WithdrawalRecord, PlatformRevenue, TopCreator, PendingApproval } from '@/lib/api/marketplace-payment.service';

const delay = () => new Promise((r) => setTimeout(r, 300 + Math.random() * 200));

const WITHDRAWALS: WithdrawalRecord[] = [
  { id: 'wd-1', creator_id: 'prof-1', amount: 5000.00, status: 'completed', requested_at: '2026-02-01T10:00:00Z', completed_at: '2026-02-03T14:00:00Z', bank_info: 'Banco do Brasil - Ag 1234 - CC 56789-0' },
  { id: 'wd-2', creator_id: 'prof-1', amount: 8500.00, status: 'completed', requested_at: '2026-01-05T09:00:00Z', completed_at: '2026-01-07T11:00:00Z', bank_info: 'Banco do Brasil - Ag 1234 - CC 56789-0' },
  { id: 'wd-3', creator_id: 'prof-1', amount: 3200.00, status: 'completed', requested_at: '2025-12-02T08:00:00Z', completed_at: '2025-12-04T10:00:00Z', bank_info: 'Banco do Brasil - Ag 1234 - CC 56789-0' },
  { id: 'wd-4', creator_id: 'prof-1', amount: 6800.00, status: 'processing', requested_at: '2026-03-10T14:00:00Z', bank_info: 'Banco do Brasil - Ag 1234 - CC 56789-0' },
  { id: 'wd-5', creator_id: 'prof-1', amount: 4200.00, status: 'completed', requested_at: '2025-11-05T09:30:00Z', completed_at: '2025-11-07T12:00:00Z', bank_info: 'Banco do Brasil - Ag 1234 - CC 56789-0' },
  { id: 'wd-6', creator_id: 'prof-1', amount: 7100.00, status: 'completed', requested_at: '2025-10-03T11:00:00Z', completed_at: '2025-10-05T15:00:00Z', bank_info: 'Banco do Brasil - Ag 1234 - CC 56789-0' },
];

export async function mockGetPlatformRevenue(_period: string): Promise<PlatformRevenue> {
  await delay();
  const months = ['Out/25', 'Nov/25', 'Dez/25', 'Jan/26', 'Fev/26', 'Mar/26'];
  const monthlyRevenues = [42500, 48700, 55200, 61800, 68300, 74500];
  return {
    total_revenue: monthlyRevenues.reduce((s, v) => s + v, 0),
    platform_commission: monthlyRevenues.reduce((s, v) => s + v * 0.20, 0),
    creator_payouts: monthlyRevenues.reduce((s, v) => s + v * 0.80, 0),
    commission_rate: 20,
    monthly_data: months.map((month, i) => ({
      month,
      revenue: monthlyRevenues[i],
      commission: Math.round(monthlyRevenues[i] * 0.20),
      payouts: Math.round(monthlyRevenues[i] * 0.80),
    })),
  };
}

export async function mockGetCreatorBalance(_creatorId: string): Promise<BalanceDTO> {
  await delay();
  return {
    available: 12450.80,
    pending: 6800.00,
    total_earned: 241222.72,
    total_withdrawn: 34800.00,
  };
}

export async function mockRequestWithdrawal(creatorId: string, amount: number): Promise<WithdrawalRecord> {
  await delay();
  const record: WithdrawalRecord = {
    id: `wd-${Date.now()}`,
    creator_id: creatorId,
    amount,
    status: 'pending',
    requested_at: new Date().toISOString(),
    bank_info: 'Banco do Brasil - Ag 1234 - CC 56789-0',
  };
  WITHDRAWALS.unshift(record);
  return record;
}

export async function mockGetWithdrawalHistory(_creatorId: string): Promise<WithdrawalRecord[]> {
  await delay();
  return WITHDRAWALS.map((w) => ({ ...w }));
}

export async function mockGetTopCreators(): Promise<TopCreator[]> {
  await delay();
  return [
    { creator_id: 'prof-1', creator_name: 'Prof. Ricardo Almeida', academy: 'Alliance BJJ SP', courses_count: 3, total_sales: 1301, total_revenue: 301528.40 },
    { creator_id: 'prof-2', creator_name: 'Prof. Marcos Souza', academy: 'Gracie Barra RJ', courses_count: 2, total_sales: 1144, total_revenue: 462353.00 },
    { creator_id: 'prof-5', creator_name: 'Prof. Kátia Fernandes', academy: 'Nova União Feminino', courses_count: 2, total_sales: 1076, total_revenue: 194460.00 },
    { creator_id: 'prof-7', creator_name: 'Prof. Diego Brandão', academy: 'Chute Boxe Academy', courses_count: 2, total_sales: 955, total_revenue: 173457.50 },
    { creator_id: 'prof-3', creator_name: 'Sensei Takeshi Yamamoto', academy: 'Judô Clube Paulista', courses_count: 2, total_sales: 657, total_revenue: 102028.50 },
    { creator_id: 'prof-8', creator_name: 'Prof. Roberto Cyborg', academy: 'Fight Sports Brasil', courses_count: 2, total_sales: 843, total_revenue: 210174.00 },
  ];
}

export async function mockGetPendingApprovals(): Promise<PendingApproval[]> {
  await delay();
  return [
    { course_id: 'pending-1', title: 'Arm Drag System - Entradas Criativas', creator_name: 'Prof. Felipe Gomes', submitted_at: '2026-03-13T10:00:00Z', modality: 'bjj' },
    { course_id: 'pending-2', title: 'Ashi-Waza - Técnicas de Pé no Judô', creator_name: 'Sensei Akira Sato', submitted_at: '2026-03-12T14:00:00Z', modality: 'judo' },
    { course_id: 'pending-3', title: 'Combos de Cotovelo para Muay Thai', creator_name: 'Prof. Wanderlei Santos', submitted_at: '2026-03-11T09:00:00Z', modality: 'muay_thai' },
  ];
}
