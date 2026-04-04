import { describe, it, expect, vi, beforeAll } from 'vitest';

beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_USE_MOCK', 'true');
});

describe('health-score.service', () => {
  // ── getStudentHealthScores ─────────────────────────────────

  describe('getStudentHealthScores', () => {
    it('retorna array de scores para academia válida', async () => {
      const { getStudentHealthScores } = await import('@/lib/api/health-score.service');

      const result = await getStudentHealthScores('academy-1');

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });

    it('cada score possui valor entre 0 e 100', async () => {
      const { getStudentHealthScores } = await import('@/lib/api/health-score.service');

      const result = await getStudentHealthScores('academy-1');

      for (const student of result) {
        expect(student.score).toBeGreaterThanOrEqual(0);
        expect(student.score).toBeLessThanOrEqual(100);
      }
    });

    it('cada sub-score possui valor entre 0 e 100', async () => {
      const { getStudentHealthScores } = await import('@/lib/api/health-score.service');

      const result = await getStudentHealthScores('academy-1');

      for (const student of result) {
        expect(student.frequency_score).toBeGreaterThanOrEqual(0);
        expect(student.frequency_score).toBeLessThanOrEqual(100);
        expect(student.financial_score).toBeGreaterThanOrEqual(0);
        expect(student.financial_score).toBeLessThanOrEqual(100);
        expect(student.evolution_score).toBeGreaterThanOrEqual(0);
        expect(student.evolution_score).toBeLessThanOrEqual(100);
        expect(student.engagement_score).toBeGreaterThanOrEqual(0);
        expect(student.engagement_score).toBeLessThanOrEqual(100);
        expect(student.social_score).toBeGreaterThanOrEqual(0);
        expect(student.social_score).toBeLessThanOrEqual(100);
      }
    });

    it('risk possui valor válido para cada aluno', async () => {
      const { getStudentHealthScores } = await import('@/lib/api/health-score.service');

      const result = await getStudentHealthScores('academy-1');
      const validRisks = ['low', 'medium', 'high', 'critical'];

      for (const student of result) {
        expect(validRisks).toContain(student.risk);
      }
    });

    it('cada aluno possui campos obrigatórios preenchidos', async () => {
      const { getStudentHealthScores } = await import('@/lib/api/health-score.service');

      const result = await getStudentHealthScores('academy-1');

      for (const student of result) {
        expect(student.student_id).toBeDefined();
        expect(student.display_name).toBeDefined();
        expect(student.belt).toBeDefined();
        expect(student.subscription_status).toBeDefined();
      }
    });
  });

  // ── getAcademyHealth ───────────────────────────────────────

  describe('getAcademyHealth', () => {
    it('retorna resumo de saúde da academia', async () => {
      const { getAcademyHealth } = await import('@/lib/api/health-score.service');

      const result = await getAcademyHealth('academy-1');

      expect(result.total_students).toBeGreaterThan(0);
      expect(result.average_score).toBeGreaterThanOrEqual(0);
      expect(result.average_score).toBeLessThanOrEqual(100);
    });

    it('soma das categorias é igual ao total de alunos', async () => {
      const { getAcademyHealth } = await import('@/lib/api/health-score.service');

      const result = await getAcademyHealth('academy-1');

      const soma = result.healthy + result.at_risk + result.critical;
      expect(soma).toBe(result.total_students);
    });
  });
});
