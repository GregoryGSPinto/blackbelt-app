import { isMock } from '@/lib/env';
import type { Attendance, AttendanceMethod } from '@/lib/types';
import { logServiceError } from '@/lib/api/errors';

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
  student_id: string; // students table id (for attendance insert)
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
  { child_id: 'sophia', child_name: 'Sophia', class_id: 'class-bjj-teen', class_name: 'BJJ Teen Avancado', time: '16:00', checked_in: false, checked_at: null, student_id: 'stu-sophia' },
  { child_id: 'helena', child_name: 'Helena', class_id: 'class-bjj-kids', class_name: 'BJJ Kids', time: '15:00', checked_in: false, checked_at: null, student_id: 'stu-helena' },
];

function generateMockHistory(): ParentCheckinHistory[] {
  const history: ParentCheckinHistory[] = [];
  const children = [
    { name: 'Sophia', classes: ['BJJ Teen Avancado'] },
    { name: 'Helena', classes: ['BJJ Kids', 'Judo Kids'] },
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

    // 1. Get children's profile IDs
    const { data: links } = await supabase
      .from('guardian_links')
      .select('child_id')
      .eq('guardian_id', guardianId);

    const childIds = (links ?? []).map((l: { child_id: string }) => l.child_id);
    if (childIds.length === 0) return [];

    // 2. Get children's profiles and student records
    const { data: students } = await supabase
      .from('students')
      .select('id, profile_id')
      .in('profile_id', childIds);

    if (!students || students.length === 0) return [];

    const profileToStudent = new Map(
      (students as Array<{ id: string; profile_id: string }>).map(s => [s.profile_id, s.id])
    );

    // 3. Get children names
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name')
      .in('id', childIds);

    const profileNames = new Map(
      ((profiles ?? []) as Array<{ id: string; display_name: string }>).map(p => [p.id, p.display_name])
    );

    // 4. Get active class enrollments
    const studentIds = (students as Array<{ id: string }>).map(s => s.id);
    const { data: enrollments } = await supabase
      .from('class_enrollments')
      .select('student_id, class_id')
      .in('student_id', studentIds)
      .eq('status', 'active');

    if (!enrollments || enrollments.length === 0) return [];

    // 5. Get class info
    const classIds = [...new Set((enrollments as Array<{ class_id: string }>).map(e => e.class_id))];
    const { data: classes } = await supabase
      .from('classes')
      .select('id, name, schedule')
      .in('id', classIds);

    const classMap = new Map(
      ((classes ?? []) as Array<{ id: string; name: string; schedule: Array<{ day_of_week: number; start_time: string }> }>)
        .map(c => [c.id, c])
    );

    // 6. Filter to today's day_of_week
    const today = new Date();
    const todayDow = today.getDay(); // 0=Sun, 1=Mon, etc.

    // 7. Check today's attendance
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    const { data: todayAttendance } = await supabase
      .from('attendance')
      .select('student_id, class_id, checked_at')
      .in('student_id', studentIds)
      .gte('checked_at', todayStart.toISOString());

    const attendanceSet = new Set(
      ((todayAttendance ?? []) as Array<{ student_id: string; class_id: string }>)
        .map(a => `${a.student_id}-${a.class_id}`)
    );
    const attendanceMap = new Map(
      ((todayAttendance ?? []) as Array<{ student_id: string; class_id: string; checked_at: string }>)
        .map(a => [`${a.student_id}-${a.class_id}`, a.checked_at])
    );

    // 8. Build result
    const result: ParentChildClass[] = [];
    for (const enrollment of (enrollments as Array<{ student_id: string; class_id: string }>)) {
      const cls = classMap.get(enrollment.class_id);
      if (!cls) continue;

      // Check if class runs today
      const todaySchedule = (cls.schedule ?? []).find(
        (s: { day_of_week: number }) => s.day_of_week === todayDow
      );
      if (!todaySchedule) continue;

      // Find child's profile_id from student_id
      const childProfileId = [...profileToStudent.entries()]
        .find(([, sId]) => sId === enrollment.student_id)?.[0];
      if (!childProfileId) continue;

      const key = `${enrollment.student_id}-${enrollment.class_id}`;
      result.push({
        child_id: childProfileId,
        child_name: profileNames.get(childProfileId) ?? 'Filho',
        class_id: enrollment.class_id,
        class_name: cls.name,
        time: todaySchedule.start_time,
        checked_in: attendanceSet.has(key),
        checked_at: attendanceMap.get(key) ?? null,
        student_id: enrollment.student_id,
      });
    }

    return result.sort((a, b) => a.time.localeCompare(b.time));
  } catch (error) {
    logServiceError(error, 'parent-checkin');
    return [];
  }
}

export async function doParentCheckin(
  childStudentId: string,
  classId: string,
  method: AttendanceMethod,
): Promise<Attendance> {
  try {
    if (isMock()) {
      await new Promise((r) => setTimeout(r, 400));
      const key = `${childStudentId}-${classId}`;
      if (sessionCheckins.has(key)) {
        throw new Error('Check-in ja realizado para esta aula hoje.');
      }
      sessionCheckins.add(key);
      return {
        id: `att-parent-${Date.now()}`,
        student_id: childStudentId,
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
        student_id: childStudentId,
        class_id: classId,
        method,
        checked_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      logServiceError(error, 'parent-checkin');
      throw new Error(error.message);
    }
    return data as Attendance;
  } catch (error) {
    if (error instanceof Error) throw error;
    logServiceError(error, 'parent-checkin');
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

    // 1. Get children's profile IDs
    const { data: links } = await supabase
      .from('guardian_links')
      .select('child_id')
      .eq('guardian_id', guardianId);

    const childIds = (links ?? []).map((l: { child_id: string }) => l.child_id);
    if (childIds.length === 0) return [];

    // 2. Get children names
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name')
      .in('id', childIds);

    const profileNames = new Map(
      ((profiles ?? []) as Array<{ id: string; display_name: string }>).map(p => [p.id, p.display_name])
    );

    // 3. Get student IDs for children
    const { data: students } = await supabase
      .from('students')
      .select('id, profile_id')
      .in('profile_id', childIds);

    if (!students || students.length === 0) return [];

    const studentToProfile = new Map(
      (students as Array<{ id: string; profile_id: string }>).map(s => [s.id, s.profile_id])
    );
    const studentIds = (students as Array<{ id: string }>).map(s => s.id);

    // 4. Get recent attendance
    const { data: attendance } = await supabase
      .from('attendance')
      .select('id, student_id, class_id, checked_at, method')
      .in('student_id', studentIds)
      .order('checked_at', { ascending: false })
      .limit(30);

    if (!attendance || attendance.length === 0) return [];

    // 5. Get class names
    const classIds = [...new Set((attendance as Array<{ class_id: string }>).map(a => a.class_id))];
    const { data: classes } = await supabase
      .from('classes')
      .select('id, name')
      .in('id', classIds);

    const classNames = new Map(
      ((classes ?? []) as Array<{ id: string; name: string }>).map(c => [c.id, c.name])
    );

    // 6. Build result
    return (attendance as Array<{ id: string; student_id: string; class_id: string; checked_at: string; method: string }>).map(a => ({
      id: a.id,
      child_name: profileNames.get(studentToProfile.get(a.student_id) ?? '') ?? 'Filho',
      class_name: classNames.get(a.class_id) ?? 'Aula',
      checked_at: a.checked_at,
      method: a.method as AttendanceMethod,
    }));
  } catch (error) {
    logServiceError(error, 'parent-checkin');
    return [];
  }
}

/**
 * Get upcoming classes for guardian's children (for pre-check-in).
 * Returns classes scheduled in the next 7 days.
 */
export async function getUpcomingClasses(guardianId: string): Promise<Array<{
  id: string;
  child_id: string;
  child_name: string;
  student_id: string;
  class_id: string;
  class_name: string;
  date: string;
  time: string;
  day_label: string;
}>> {
  try {
    if (isMock()) {
      return [
        { id: 'uc-1', child_id: 'sophia', child_name: 'Sophia', student_id: 'stu-sophia', class_id: 'class-bjj-teen', class_name: 'BJJ Teen Avancado', date: '2026-03-31', time: '16:00', day_label: 'Terca, 31/03' },
        { id: 'uc-2', child_id: 'sophia', child_name: 'Sophia', student_id: 'stu-sophia', class_id: 'class-bjj-teen', class_name: 'BJJ Teen Avancado', date: '2026-04-02', time: '16:00', day_label: 'Quinta, 02/04' },
        { id: 'uc-3', child_id: 'helena', child_name: 'Helena', student_id: 'stu-helena', class_id: 'class-bjj-kids', class_name: 'BJJ Kids', date: '2026-03-31', time: '15:00', day_label: 'Terca, 31/03' },
      ];
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // 1. Get children
    const { data: linksData } = await supabase
      .from('guardian_links')
      .select('child_id')
      .eq('guardian_id', guardianId);

    const childIds = (linksData ?? []).map((l: { child_id: string }) => l.child_id);
    if (childIds.length === 0) return [];

    // 2. Profiles + students
    const [profilesRes, studentsRes] = await Promise.all([
      supabase.from('profiles').select('id, display_name').in('id', childIds),
      supabase.from('students').select('id, profile_id').in('profile_id', childIds),
    ]);

    const profileNames = new Map(
      ((profilesRes.data ?? []) as Array<{ id: string; display_name: string }>).map(p => [p.id, p.display_name])
    );
    const studentsData = (studentsRes.data ?? []) as Array<{ id: string; profile_id: string }>;
    if (studentsData.length === 0) return [];

    const profileToStudent = new Map(studentsData.map(s => [s.profile_id, s.id]));
    const studentIds = studentsData.map(s => s.id);

    // 3. Get enrollments + classes
    const { data: enrollments } = await supabase
      .from('class_enrollments')
      .select('student_id, class_id')
      .in('student_id', studentIds)
      .eq('status', 'active');

    if (!enrollments || enrollments.length === 0) return [];

    const classIds = [...new Set((enrollments as Array<{ class_id: string }>).map(e => e.class_id))];
    const { data: classes } = await supabase
      .from('classes')
      .select('id, name, schedule')
      .in('id', classIds);

    const classMap = new Map(
      ((classes ?? []) as Array<{ id: string; name: string; schedule: Array<{ day_of_week: number; start_time: string }> }>)
        .map(c => [c.id, c])
    );

    // 4. Generate upcoming dates (next 7 days)
    const DAY_NAMES = ['Domingo', 'Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado'];
    const result: Array<{
      id: string;
      child_id: string;
      child_name: string;
      student_id: string;
      class_id: string;
      class_name: string;
      date: string;
      time: string;
      day_label: string;
    }> = [];

    const now = new Date();
    for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
      const d = new Date(now);
      d.setDate(d.getDate() + dayOffset);
      const dow = d.getDay();
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = `${DAY_NAMES[dow]}, ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;

      for (const enrollment of (enrollments as Array<{ student_id: string; class_id: string }>)) {
        const cls = classMap.get(enrollment.class_id);
        if (!cls) continue;

        const scheduleMatch = (cls.schedule ?? []).find(
          (s: { day_of_week: number }) => s.day_of_week === dow
        );
        if (!scheduleMatch) continue;

        const childProfileId = [...profileToStudent.entries()]
          .find(([, sId]) => sId === enrollment.student_id)?.[0];
        if (!childProfileId) continue;

        result.push({
          id: `${enrollment.student_id}-${enrollment.class_id}-${dateStr}`,
          child_id: childProfileId,
          child_name: profileNames.get(childProfileId) ?? 'Filho',
          student_id: enrollment.student_id,
          class_id: enrollment.class_id,
          class_name: cls.name,
          date: dateStr,
          time: scheduleMatch.start_time,
          day_label: dayLabel,
        });
      }
    }

    return result.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  } catch (error) {
    logServiceError(error, 'parent-checkin');
    return [];
  }
}
