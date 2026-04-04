import { AchievementType } from '@/lib/types';
import type { Achievement } from '@/lib/types';
import type { ConquistaDTO } from '@/lib/api/conquistas.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

const ALL_CONQUISTAS: ConquistaDTO[] = [
  { id: 'ach-1', name: 'Primeira Aula', description: 'Completou sua primeira aula', type: AchievementType.ClassMilestone, icon: '🥋', granted_at: '2025-06-01', is_earned: true },
  { id: 'ach-2', name: '10 Aulas', description: 'Completou 10 aulas', type: AchievementType.ClassMilestone, icon: '💪', granted_at: '2025-07-15', is_earned: true },
  { id: 'ach-3', name: '50 Aulas', description: 'Completou 50 aulas', type: AchievementType.ClassMilestone, icon: '🏆', granted_at: '2026-03-10', is_earned: true },
  { id: 'ach-4', name: '100 Aulas', description: 'Completou 100 aulas', type: AchievementType.ClassMilestone, icon: '⭐', granted_at: null, is_earned: false },
  { id: 'ach-5', name: 'Streak 7 Dias', description: '7 dias consecutivos de presença', type: AchievementType.AttendanceStreak, icon: '🔥', granted_at: '2026-02-20', is_earned: true },
  { id: 'ach-6', name: 'Streak 30 Dias', description: '30 dias consecutivos de presença', type: AchievementType.AttendanceStreak, icon: '🔥🔥', granted_at: null, is_earned: false },
  { id: 'ach-7', name: 'Streak 90 Dias', description: '90 dias consecutivos de presença', type: AchievementType.AttendanceStreak, icon: '🔥🔥🔥', granted_at: null, is_earned: false },
  { id: 'ach-8', name: 'Faixa Cinza', description: 'Promovido à faixa cinza', type: AchievementType.BeltPromotion, icon: '🥈', granted_at: '2025-03-15', is_earned: true },
  { id: 'ach-9', name: 'Faixa Amarela', description: 'Promovido à faixa amarela', type: AchievementType.BeltPromotion, icon: '🟡', granted_at: '2025-06-20', is_earned: true },
  { id: 'ach-10', name: 'Faixa Laranja', description: 'Promovido à faixa laranja', type: AchievementType.BeltPromotion, icon: '🟠', granted_at: '2025-09-10', is_earned: true },
  { id: 'ach-11', name: 'Faixa Verde', description: 'Promovido à faixa verde', type: AchievementType.BeltPromotion, icon: '🟢', granted_at: '2025-11-30', is_earned: true },
  { id: 'ach-12', name: 'Faixa Azul', description: 'Promovido à faixa azul', type: AchievementType.BeltPromotion, icon: '🔵', granted_at: '2026-02-01', is_earned: true },
  { id: 'ach-13', name: 'Nota Máxima', description: 'Avaliação com nota 100', type: AchievementType.Custom, icon: '💯', granted_at: null, is_earned: false },
];

export async function mockListByAluno(_studentId: string): Promise<ConquistaDTO[]> {
  await delay();
  return ALL_CONQUISTAS;
}

export async function mockListAvailable(_studentId: string): Promise<ConquistaDTO[]> {
  await delay();
  return ALL_CONQUISTAS.filter((c) => !c.is_earned);
}

export async function mockGrant(studentId: string, type: AchievementType, granterId: string): Promise<Achievement> {
  await delay();
  const now = new Date().toISOString();
  return {
    id: `ach-new-${Date.now()}`,
    student_id: studentId,
    type,
    granted_at: now,
    granted_by: granterId,
    created_at: now,
    updated_at: now,
  };
}
