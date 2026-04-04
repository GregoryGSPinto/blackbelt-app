import { describe, it, expect, vi, beforeAll } from 'vitest';

beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_USE_MOCK', 'true');
});

describe('aluno.service', () => {
  describe('getAlunoDashboard', () => {
    it('retorna dashboard com dados do aluno', async () => {
      const { getAlunoDashboard } = await import('@/lib/api/aluno.service');

      const result = await getAlunoDashboard('stu-1');

      expect(result).toBeDefined();
      expect(result.student_name).toBeDefined();
      expect(typeof result.ranking_position).toBe('number');
      expect(typeof result.total_academy_students).toBe('number');
    });

    it('retorna progresso de faixa com percentual válido', async () => {
      const { getAlunoDashboard } = await import('@/lib/api/aluno.service');

      const result = await getAlunoDashboard('stu-1');

      const progresso = result.progressoFaixa;
      expect(progresso.faixa_atual).toBeDefined();
      expect(progresso.proxima_faixa).toBeDefined();
      expect(progresso.percentual).toBeGreaterThanOrEqual(0);
      expect(progresso.percentual).toBeLessThanOrEqual(100);
      expect(progresso.requisitos).toBeInstanceOf(Array);
      expect(progresso.requisitos.length).toBeGreaterThan(0);
    });

    it('retorna frequência do mês com dados numéricos', async () => {
      const { getAlunoDashboard } = await import('@/lib/api/aluno.service');

      const result = await getAlunoDashboard('stu-1');

      const freq = result.frequenciaMes;
      expect(typeof freq.total_aulas).toBe('number');
      expect(typeof freq.presencas).toBe('number');
      expect(freq.dias_presentes).toBeInstanceOf(Array);
      expect(freq.mes_label).toBeDefined();
    });

    it('retorna semana com 6 dias (Seg-Sáb)', async () => {
      const { getAlunoDashboard } = await import('@/lib/api/aluno.service');

      const result = await getAlunoDashboard('stu-1');

      expect(result.semana).toBeInstanceOf(Array);
      expect(result.semana.length).toBe(6);

      for (const dia of result.semana) {
        expect(dia.day_label).toBeDefined();
        expect(dia.day_short).toBeDefined();
        expect(dia.date).toBeDefined();
        expect(['done', 'scheduled', 'rest', 'missed']).toContain(dia.status);
        expect(dia.classes).toBeInstanceOf(Array);
      }
    });

    it('retorna conquistas recentes como array', async () => {
      const { getAlunoDashboard } = await import('@/lib/api/aluno.service');

      const result = await getAlunoDashboard('stu-1');

      expect(result.ultimasConquistas).toBeInstanceOf(Array);
      for (const conquista of result.ultimasConquistas) {
        expect(conquista.id).toBeDefined();
        expect(conquista.name).toBeDefined();
        expect(conquista.type).toBeDefined();
      }
    });

    it('retorna conteúdo recomendado como array', async () => {
      const { getAlunoDashboard } = await import('@/lib/api/aluno.service');

      const result = await getAlunoDashboard('stu-1');

      expect(result.conteudoRecomendado).toBeInstanceOf(Array);
    });
  });
});
