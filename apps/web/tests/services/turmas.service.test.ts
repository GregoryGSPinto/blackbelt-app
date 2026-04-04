import { describe, it, expect, vi, beforeAll } from 'vitest';

beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_USE_MOCK', 'true');
});

describe('turmas.service', () => {
  // ── listClasses ────────────────────────────────────────────

  describe('listClasses', () => {
    it('retorna array de turmas', async () => {
      const { listClasses } = await import('@/lib/api/turmas.service');

      const result = await listClasses('academy-1');

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });

    it('cada turma possui campos obrigatórios', async () => {
      const { listClasses } = await import('@/lib/api/turmas.service');

      const result = await listClasses('academy-1');

      for (const turma of result) {
        expect(turma.id).toBeDefined();
        expect(turma.modality_name).toBeDefined();
        expect(turma.professor_name).toBeDefined();
        expect(turma.unit_name).toBeDefined();
        expect(typeof turma.enrolled_count).toBe('number');
        expect(typeof turma.max_students).toBe('number');
      }
    });

    it('filtra por modalidade quando informado', async () => {
      const { listClasses } = await import('@/lib/api/turmas.service');

      const result = await listClasses('academy-1', { modalityId: 'mod-bjj' });

      expect(result.length).toBeGreaterThan(0);
      for (const turma of result) {
        expect(turma.modality_id).toBe('mod-bjj');
      }
    });

    it('filtra por professor quando informado', async () => {
      const { listClasses } = await import('@/lib/api/turmas.service');

      const result = await listClasses('academy-1', { professorId: 'prof-1' });

      expect(result.length).toBeGreaterThan(0);
      for (const turma of result) {
        expect(turma.professor_id).toBe('prof-1');
      }
    });
  });

  // ── getClassById ───────────────────────────────────────────

  describe('getClassById', () => {
    it('retorna detalhes da turma por ID', async () => {
      const { getClassById } = await import('@/lib/api/turmas.service');

      const result = await getClassById('class-bjj-manha');

      expect(result.id).toBe('class-bjj-manha');
      expect(result.modality_name).toBeDefined();
      expect(result.enrolled_students).toBeInstanceOf(Array);
    });

    it('lança erro para turma inexistente', async () => {
      const { getClassById } = await import('@/lib/api/turmas.service');

      await expect(getClassById('turma-inexistente')).rejects.toThrow();
    });
  });

  // ── getClassesByProfessor ──────────────────────────────────

  describe('getClassesByProfessor', () => {
    it('retorna turmas do professor', async () => {
      const { getClassesByProfessor } = await import('@/lib/api/turmas.service');

      const result = await getClassesByProfessor('prof-1');

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      for (const turma of result) {
        expect(turma.professor_id).toBe('prof-1');
      }
    });

    it('retorna array vazio para professor sem turmas', async () => {
      const { getClassesByProfessor } = await import('@/lib/api/turmas.service');

      const result = await getClassesByProfessor('prof-inexistente');

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(0);
    });
  });
});
