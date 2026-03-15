import { AttendanceMethod } from '@/lib/types';
import type { Attendance } from '@/lib/types';
import type { AttendanceStats, DateRange } from '@/lib/api/checkin.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

function generateAttendanceHistory(): Attendance[] {
  const history: Attendance[] = [];
  const classIds = ['class-bjj-manha', 'class-bjj-noite', 'class-judo-manha', 'class-karate-manha'];
  const now = new Date();

  for (let i = 0; i < 90; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayOfWeek = date.getDay();

    if (dayOfWeek === 0) continue;

    if (Math.random() > 0.25) {
      const classId = classIds[i % classIds.length];
      const hours = 7 + Math.floor(Math.random() * 14);
      date.setHours(hours, Math.floor(Math.random() * 60), 0, 0);

      history.push({
        id: `att-${i}`,
        student_id: 'stu-1',
        class_id: classId,
        checked_at: date.toISOString(),
        method: Math.random() > 0.3 ? AttendanceMethod.QrCode : AttendanceMethod.Manual,
        created_at: date.toISOString(),
        updated_at: date.toISOString(),
      });
    }
  }

  return history.sort((a, b) => new Date(b.checked_at).getTime() - new Date(a.checked_at).getTime());
}

const ATTENDANCE_HISTORY = generateAttendanceHistory();

export async function mockDoCheckin(studentId: string, classId: string, method: AttendanceMethod): Promise<Attendance> {
  await delay();
  const today = new Date().toISOString().split('T')[0];
  const existing = ATTENDANCE_HISTORY.find(
    (a) => a.student_id === studentId && a.class_id === classId && a.checked_at.startsWith(today),
  );
  if (existing) throw new Error('Você já fez check-in nesta aula hoje.');

  return {
    id: `att-${Date.now()}`,
    student_id: studentId,
    class_id: classId,
    checked_at: new Date().toISOString(),
    method,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function mockGetHistory(studentId: string, dateRange?: DateRange): Promise<Attendance[]> {
  await delay();
  let result = ATTENDANCE_HISTORY.filter((a) => a.student_id === studentId);
  if (dateRange) {
    const from = new Date(dateRange.from).getTime();
    const to = new Date(dateRange.to).getTime();
    result = result.filter((a) => {
      const t = new Date(a.checked_at).getTime();
      return t >= from && t <= to;
    });
  }
  return result;
}

export async function mockGetStats(_studentId: string): Promise<AttendanceStats> {
  await delay();
  const now = new Date();
  const thisMonth = ATTENDANCE_HISTORY.filter((a) => {
    const d = new Date(a.checked_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const thisWeek = ATTENDANCE_HISTORY.filter((a) => new Date(a.checked_at) >= weekAgo);

  let streak = 0;
  const sorted = [...ATTENDANCE_HISTORY].sort((a, b) => new Date(b.checked_at).getTime() - new Date(a.checked_at).getTime());
  const seenDates = new Set<string>();
  for (const att of sorted) {
    seenDates.add(att.checked_at.split('T')[0]);
  }
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (d.getDay() === 0) continue;
    const dateStr = d.toISOString().split('T')[0];
    if (seenDates.has(dateStr)) {
      streak++;
    } else {
      break;
    }
  }

  return {
    total: ATTENDANCE_HISTORY.length,
    this_month: thisMonth.length,
    this_week: thisWeek.length,
    streak,
    weekly_average: Math.round((ATTENDANCE_HISTORY.length / 13) * 10) / 10,
  };
}

export async function mockGetTodayByClass(classId: string): Promise<Attendance[]> {
  await delay();
  const today = new Date().toISOString().split('T')[0];
  return ATTENDANCE_HISTORY.filter((a) => a.class_id === classId && a.checked_at.startsWith(today));
}
