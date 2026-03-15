import type { BillingCycleResult } from '@/lib/api/billing-automation.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

export async function mockRunBillingCycle(_academyId: string): Promise<BillingCycleResult> {
  await delay();
  return {
    invoicesGenerated: 42,
    remindersSet: 38,
    overdueMarked: 4,
    alertsSent: 2,
  };
}
