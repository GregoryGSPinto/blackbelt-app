import { isMock } from '@/lib/env';
// handleServiceError removed — graceful console.warn fallback pattern
import type { Achievement, AchievementType } from '@/lib/types';

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
  try {
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
      console.warn('[listByAluno] Supabase error:', error.message);
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
  } catch (error) {
    console.warn('[listByAluno] Fallback:', error);
    return [];
  }
}

export async function listAvailable(studentId: string): Promise<ConquistaDTO[]> {
  try {
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
      console.warn('[listAvailable] Supabase error fetching definitions:', defError.message);
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
  } catch (error) {
    console.warn('[listAvailable] Fallback:', error);
    return [];
  }
}

export async function grant(studentId: string, type: AchievementType, granterId: string): Promise<Achievement> {
  try {
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
      console.warn('[grant] Supabase error:', error?.message);
      return {
        id: crypto.randomUUID(),
        student_id: studentId,
        type,
        granted_at: new Date().toISOString(),
        granted_by: granterId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    return data as Achievement;
  } catch (error) {
    console.warn('[grant] Fallback:', error);
    return {
      id: crypto.randomUUID(),
      student_id: studentId,
      type,
      granted_at: new Date().toISOString(),
      granted_by: granterId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
}
