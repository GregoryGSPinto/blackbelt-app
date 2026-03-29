import { isMock } from '@/lib/env';
import type { Achievement, AchievementType } from '@/lib/types';
import { logServiceError } from '@/lib/api/errors';

export interface ConquistaDTO {
  id: string;
  name: string;
  description: string;
  type: AchievementType;
  icon: string;
  granted_at: string | null;
  is_earned: boolean;
}

export async function listByAluno(studentId: string): Promise<ConquistaDTO[]> {
  if (isMock()) {
    const { mockListByAluno } = await import('@/lib/mocks/conquistas.mock');
    return mockListByAluno(studentId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  const { data, error } = await supabase
    .from('achievements')
    .select('id, type, granted_at, achievement_definitions(name, description, icon)')
    .eq('student_id', studentId);

  if (error) {
    logServiceError(error, 'conquistas');
    return [];
  }

  return (data ?? []).map((row: Record<string, unknown>) => {
    const def = (row.achievement_definitions ?? {}) as Record<string, unknown>;
    return {
      id: String(row.id ?? ''),
      name: String(def.name ?? ''),
      description: String(def.description ?? ''),
      type: row.type as AchievementType,
      icon: String(def.icon ?? ''),
      granted_at: row.granted_at ? String(row.granted_at) : null,
      is_earned: true,
    };
  });
}

export async function listAvailable(studentId: string): Promise<ConquistaDTO[]> {
  if (isMock()) {
    const { mockListAvailable } = await import('@/lib/mocks/conquistas.mock');
    return mockListAvailable(studentId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  // Fetch all achievement definitions
  const { data: allDefs, error: defError } = await supabase
    .from('achievement_definitions')
    .select('id, name, description, type, icon');

  if (defError) {
    logServiceError(defError, 'conquistas');
    return [];
  }

  // Fetch earned achievement types for the student
  const { data: earned } = await supabase
    .from('achievements')
    .select('type')
    .eq('student_id', studentId);

  const earnedTypes = new Set((earned ?? []).map((e: Record<string, unknown>) => String(e.type)));

  return (allDefs ?? []).map((def: Record<string, unknown>) => ({
    id: String(def.id ?? ''),
    name: String(def.name ?? ''),
    description: String(def.description ?? ''),
    type: def.type as AchievementType,
    icon: String(def.icon ?? ''),
    granted_at: null,
    is_earned: earnedTypes.has(String(def.type)),
  }));
}

export async function grant(studentId: string, type: AchievementType, granterId: string): Promise<Achievement> {
  if (isMock()) {
    const { mockGrant } = await import('@/lib/mocks/conquistas.mock');
    return mockGrant(studentId, type, granterId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  const { data, error } = await supabase
    .from('achievements')
    .insert({
      student_id: studentId,
      type,
      granted_by: granterId,
      granted_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error || !data) {
    logServiceError(error, 'conquistas');
    throw new Error(`[grant] ${error?.message ?? 'No data returned'}`);
  }

  return data as Achievement;
}
