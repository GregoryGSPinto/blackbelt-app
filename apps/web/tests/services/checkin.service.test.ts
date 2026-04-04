import { describe, it, expect, vi, beforeAll } from 'vitest';
import { AttendanceMethod } from '@/lib/types';

beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_USE_MOCK', 'true');
});

describe('checkin.service', () => {
  // ── doCheckin ──────────────────────────────────────────────

  describe('doCheckin', () => {
    it('retorna presença válida com dados corretos', async () => {
      const { doCheckin } = await import('@/lib/api/checkin.service');

      const result = await doCheckin('new-student-99', 'class-bjj-manha', AttendanceMethod.QrCode);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.student_id).toBe('new-student-99');
      expect(result.class_id).toBe('class-bjj-manha');
      expect(result.method).toBe(AttendanceMethod.QrCode);
      expect(result.checked_at).toBeDefined();
    });

    it('retorna campos de auditoria preenchidos', async () => {
      const { doCheckin } = await import('@/lib/api/checkin.service');

      const result = await doCheckin('new-student-100', 'class-judo-manha', AttendanceMethod.Manual);

      expect(result.created_at).toBeDefined();
      expect(result.updated_at).toBeDefined();
    });
  });

  // ── getHistory ─────────────────────────────────────────────

  describe('getHistory', () => {
    it('retorna array de presenças para aluno com histórico', async () => {
      const { getHistory } = await import('@/lib/api/checkin.service');

      const result = await getHistory('stu-1');

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });

    it('retorna array vazio para aluno sem histórico', async () => {
      const { getHistory } = await import('@/lib/api/checkin.service');

      const result = await getHistory('aluno-inexistente');

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(0);
    });

    it('filtra presenças por período quando informado', async () => {
      const { getHistory } = await import('@/lib/api/checkin.service');

      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await getHistory('stu-1', {
        from: thirtyDaysAgo.toISOString(),
        to: now.toISOString(),
      });

      expect(result).toBeInstanceOf(Array);
      for (const att of result) {
        const checkedAt = new Date(att.checked_at).getTime();
        expect(checkedAt).toBeGreaterThanOrEqual(thirtyDaysAgo.getTime());
        expect(checkedAt).toBeLessThanOrEqual(now.getTime());
      }
    });
  });

  // ── getStats ───────────────────────────────────────────────

  describe('getStats', () => {
    it('retorna estatísticas com todos os campos numéricos', async () => {
      const { getStats } = await import('@/lib/api/checkin.service');

      const result = await getStats('stu-1');

      expect(result.total).toBeGreaterThanOrEqual(0);
      expect(result.this_month).toBeGreaterThanOrEqual(0);
      expect(result.this_week).toBeGreaterThanOrEqual(0);
      expect(result.streak).toBeGreaterThanOrEqual(0);
      expect(typeof result.weekly_average).toBe('number');
    });

    it('total é maior ou igual a this_month', async () => {
      const { getStats } = await import('@/lib/api/checkin.service');

      const result = await getStats('stu-1');

      expect(result.total).toBeGreaterThanOrEqual(result.this_month);
    });
  });
});
