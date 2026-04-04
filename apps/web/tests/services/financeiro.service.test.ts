import { describe, it, expect, vi, beforeAll } from 'vitest';

beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_USE_MOCK', 'true');
});

describe('financeiro.service', () => {
  describe('getFinanceiroData', () => {
    it('retorna dados financeiros completos', async () => {
      const { getFinanceiroData } = await import('@/lib/api/financeiro.service');

      const result = await getFinanceiroData('academy-1');

      expect(result).toBeDefined();
      expect(typeof result.receitaMes).toBe('number');
      expect(typeof result.receitaMesAnterior).toBe('number');
      expect(typeof result.metaMes).toBe('number');
      expect(typeof result.mrr).toBe('number');
      expect(typeof result.ticketMedio).toBe('number');
      expect(typeof result.inadimplenciaPct).toBe('number');
      expect(typeof result.previsaoProximoMes).toBe('number');
    });

    it('retorna devedores como array', async () => {
      const { getFinanceiroData } = await import('@/lib/api/financeiro.service');

      const result = await getFinanceiroData('academy-1');

      expect(result.debtors).toBeInstanceOf(Array);
      for (const debtor of result.debtors) {
        expect(debtor.student_id).toBeDefined();
        expect(debtor.name).toBeDefined();
        expect(typeof debtor.amount).toBe('number');
        expect(typeof debtor.days_overdue).toBe('number');
      }
    });

    it('retorna pagamentos recentes como array', async () => {
      const { getFinanceiroData } = await import('@/lib/api/financeiro.service');

      const result = await getFinanceiroData('academy-1');

      expect(result.recentPayments).toBeInstanceOf(Array);
      expect(result.recentPayments.length).toBeGreaterThan(0);
      for (const payment of result.recentPayments) {
        expect(payment.id).toBeDefined();
        expect(payment.name).toBeDefined();
        expect(['PIX', 'boleto', 'cartao']).toContain(payment.method);
      }
    });

    it('retorna análise de planos com porcentagens válidas', async () => {
      const { getFinanceiroData } = await import('@/lib/api/financeiro.service');

      const result = await getFinanceiroData('academy-1');

      expect(result.planAnalysis).toBeInstanceOf(Array);
      expect(result.planAnalysis.length).toBeGreaterThan(0);

      const totalPct = result.planAnalysis.reduce((sum, plan) => sum + plan.pct_of_total, 0);
      expect(totalPct).toBe(100);
    });

    it('retorna receita mensal com 6 meses', async () => {
      const { getFinanceiroData } = await import('@/lib/api/financeiro.service');

      const result = await getFinanceiroData('academy-1');

      expect(result.monthlyRevenue).toBeInstanceOf(Array);
      expect(result.monthlyRevenue.length).toBe(6);
    });
  });
});
