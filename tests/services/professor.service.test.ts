import { describe, it, expect, vi, beforeAll } from 'vitest';

beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_USE_MOCK', 'true');
});

describe('professor.service', () => {
  describe('getProfessorDashboard', () => {
    it('retorna dashboard do professor com dados completos', async () => {
      const { getProfessorDashboard } = await import('@/lib/api/professor.service');

      const result = await getProfessorDashboard('prof-1');

      expect(result).toBeDefined();
      expect(result.minhasTurmas).toBeInstanceOf(Array);
      expect(result.meusAlunos).toBeInstanceOf(Array);
      expect(result.mensagensRecentes).toBeInstanceOf(Array);
    });

    it('retorna turmas com campos obrigatórios', async () => {
      const { getProfessorDashboard } = await import('@/lib/api/professor.service');

      const result = await getProfessorDashboard('prof-1');

      expect(result.minhasTurmas.length).toBeGreaterThan(0);
      for (const turma of result.minhasTurmas) {
        expect(turma.class_id).toBeDefined();
        expect(turma.modality_name).toBeDefined();
        expect(typeof turma.enrolled_count).toBe('number');
        expect(turma.schedule_text).toBeDefined();
      }
    });

    it('retorna alunos com dados de perfil', async () => {
      const { getProfessorDashboard } = await import('@/lib/api/professor.service');

      const result = await getProfessorDashboard('prof-1');

      expect(result.meusAlunos.length).toBeGreaterThan(0);
      for (const aluno of result.meusAlunos) {
        expect(aluno.student_id).toBeDefined();
        expect(aluno.display_name).toBeDefined();
        expect(aluno.belt).toBeDefined();
      }
    });

    it('retorna próxima aula quando disponível', async () => {
      const { getProfessorDashboard } = await import('@/lib/api/professor.service');

      const result = await getProfessorDashboard('prof-1');

      if (result.proximaAula) {
        expect(result.proximaAula.class_id).toBeDefined();
        expect(result.proximaAula.modality_name).toBeDefined();
        expect(result.proximaAula.start_time).toBeDefined();
        expect(result.proximaAula.end_time).toBeDefined();
      }
    });
  });
});
