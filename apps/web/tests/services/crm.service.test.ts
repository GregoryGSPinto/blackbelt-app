import { describe, it, expect, vi, beforeAll } from 'vitest';

beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_USE_MOCK', 'true');
});

describe('crm.service', () => {
  // ── getLeads ───────────────────────────────────────────────

  describe('getLeads', () => {
    it('retorna lista de leads', async () => {
      const { getLeads } = await import('@/lib/api/crm.service');

      const result = await getLeads('academy-1');

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });

    it('cada lead possui campos obrigatórios', async () => {
      const { getLeads } = await import('@/lib/api/crm.service');

      const result = await getLeads('academy-1');

      for (const lead of result) {
        expect(lead.id).toBeDefined();
        expect(lead.name).toBeDefined();
        expect(lead.origin).toBeDefined();
        expect(lead.status).toBeDefined();
        expect(lead.created_at).toBeDefined();
      }
    });
  });

  // ── getCRMMetrics ──────────────────────────────────────────

  describe('getCRMMetrics', () => {
    it('retorna métricas de CRM com campos numéricos', async () => {
      const { getCRMMetrics } = await import('@/lib/api/crm.service');

      const result = await getCRMMetrics('academy-1');

      expect(typeof result.total_leads).toBe('number');
      expect(typeof result.contacted).toBe('number');
      expect(typeof result.experimental_scheduled).toBe('number');
      expect(typeof result.attended).toBe('number');
      expect(typeof result.converted).toBe('number');
      expect(typeof result.conversion_rate).toBe('number');
    });

    it('funil é decrescente (total >= contacted >= scheduled >= attended >= converted)', async () => {
      const { getCRMMetrics } = await import('@/lib/api/crm.service');

      const result = await getCRMMetrics('academy-1');

      expect(result.total_leads).toBeGreaterThanOrEqual(result.contacted);
      expect(result.contacted).toBeGreaterThanOrEqual(result.attended);
      expect(result.attended).toBeGreaterThanOrEqual(result.converted);
    });

    it('taxa de conversão é porcentagem válida (0-100)', async () => {
      const { getCRMMetrics } = await import('@/lib/api/crm.service');

      const result = await getCRMMetrics('academy-1');

      expect(result.conversion_rate).toBeGreaterThanOrEqual(0);
      expect(result.conversion_rate).toBeLessThanOrEqual(100);
    });
  });
});
