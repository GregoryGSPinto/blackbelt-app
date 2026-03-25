import { isMock } from '@/lib/env';
import type { Attendance, AttendanceMethod } from '@/lib/types';

// ────────────────────────────────────────────────────────────
// DTOs
// ────────────────────────────────────────────────────────────

export interface ParentChildClass {
  child_id: string;
  child_name: string;
  class_id: string;
  class_name: string;
  time: string;
  checked_in: boolean;
  checked_at: string | null;
}

export interface ParentCheckinHistory {
  id: string;
  child_name: string;
  class_name: string;
  checked_at: string;
  method: AttendanceMethod;
}

// ────────────────────────────────────────────────────────────
// Mock Data
// ────────────────────────────────────────────────────────────

const MOCK_TODAY_CLASSES: ParentChildClass[] = [
  { child_id: 'sophia', child_name: 'Sophia', class_id: 'class-bjj-teen', class_name: 'BJJ Teen Avançado', time: '16:00', checked_in: false, checked_at: null },
  { child_id: 'helena', child_name: 'Helena', class_id: 'class-bjj-kids', class_name: 'BJJ Kids', time: '15:00', checked_in: false, checked_at: null },
];

function generateMockHistory(): ParentCheckinHistory[] {
  const history: ParentCheckinHistory[] = [];
  const children = [
    { name: 'Sophia', classes: ['BJJ Teen Avançado'] },
    { name: 'Helena', classes: ['BJJ Kids', 'Judô Kids'] },
  ];
  const now = new Date();
  for (let i = 1; i <= 14; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    if (date.getDay() === 0) continue;
    for (const child of children) {
      if (Math.random() > 0.3) {
        const cls = child.classes[Math.floor(Math.random() * child.classes.length)];
        date.setHours(14 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 60));
        history.push({
          id: `ph-${i}-${child.name}`,
          child_name: child.name,
          class_name: cls,
          checked_at: date.toISOString(),
          method: 'manual' as AttendanceMethod,
        });
      }
    }
  }
  return history.sort((a, b) => new Date(b.checked_at).getTime() - new Date(a.checked_at).getTime());
}

const MOCK_HISTORY = generateMockHistory();

// Track mock check-ins within session
const sessionCheckins = new Set<string>();

// ────────────────────────────────────────────────────────────
// Service
// ────────────────────────────────────────────────────────────

export async function getTodayClasses(guardianId: string): Promise<ParentChildClass[]> {
  try {
    if (isMock()) {
      await new Promise((r) => setTimeout(r, 300));
      return MOCK_TODAY_CLASSES.map((c) => ({
        ...c,
        checked_in: sessionCheckins.has(`${c.child_id}-${c.class_id}`),
        checked_at: sessionCheckins.has(`${c.child_id}-${c.class_id}`) ? new Date().toISOString() : null,
      }));
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('parent_today_classes')
      .select('*')
      .eq('guardian_id', guardianId)
      .gte('class_date', todayStart.toISOString());

    if (error) {
      console.error('[getTodayClasses] Supabase error:', error.message);
      return MOCK_TODAY_CLASSES;
    }
    return (data ?? []) as unknown as ParentChildClass[];
  } catch (error) {
    console.error('[getTodayClasses] Fallback:', error);
    return MOCK_TODAY_CLASSES;
  }
}

export async function doParentCheckin(
  childId: string,
  classId: string,
  method: AttendanceMethod,
): Promise<Attendance> {
  try {
    if (isMock()) {
      await new Promise((r) => setTimeout(r, 400));
      const key = `${childId}-${classId}`;
      if (sessionCheckins.has(key)) {
        throw new Error('Check-in já realizado para esta aula hoje.');
      }
      sessionCheckins.add(key);
      return {
        id: `att-parent-${Date.now()}`,
        student_id: childId,
        class_id: classId,
        checked_at: new Date().toISOString(),
        method,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('attendance')
      .insert({
        student_id: childId,
        class_id: classId,
        method,
        checked_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('[doParentCheckin] Supabase error:', error.message);
      throw new Error(error.message);
    }
    return data as Attendance;
  } catch (error) {
    if (error instanceof Error) throw error;
    console.error('[doParentCheckin] Fallback:', error);
    throw new Error('Erro ao realizar check-in.');
  }
}

export async function getCheckinHistory(guardianId: string): Promise<ParentCheckinHistory[]> {
  try {
    if (isMock()) {
      await new Promise((r) => setTimeout(r, 300));
      return MOCK_HISTORY;
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('parent_checkin_history')
      .select('*')
      .eq('guardian_id', guardianId)
      .order('checked_at', { ascending: false })
      .limit(30);

    if (error) {
      console.error('[getCheckinHistory] Supabase error:', error.message);
      return MOCK_HISTORY;
    }
    return (data ?? []) as unknown as ParentCheckinHistory[];
  } catch (error) {
    console.error('[getCheckinHistory] Fallback:', error);
    return MOCK_HISTORY;
  }
}
