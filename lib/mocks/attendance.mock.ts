import type { AttendanceRecord, AttendanceSummary, HeatmapDay } from '@/lib/types/attendance';

const STUDENTS = [
  { id: 'student-1', name: 'João Pedro' },
  { id: 'student-2', name: 'Marina Silva' },
  { id: 'student-3', name: 'Rafael Costa' },
  { id: 'student-4', name: 'Luciana Ferreira' },
  { id: 'student-5', name: 'Sophia Nakamura' },
  { id: 'student-6', name: 'Lucas Almeida' },
  { id: 'student-7', name: 'Ana Paula' },
  { id: 'student-8', name: 'Marcos Vieira' },
  { id: 'student-9', name: 'Carolina Lima' },
  { id: 'student-10', name: 'Pedro Santos' },
  { id: 'student-11', name: 'Gustavo Ribeiro' },
  { id: 'student-12', name: 'Beatriz Nunes' },
];

const CLASSES = [
  { id: 'class-1', name: 'BJJ Fundamentos' },
  { id: 'class-2', name: 'BJJ All Levels' },
  { id: 'class-3', name: 'Judô Adulto' },
  { id: 'class-4', name: 'BJJ Avançado' },
  { id: 'class-5', name: 'BJJ Noturno' },
];

export function mockCheckIn(
  studentId: string,
  classId: string,
  method: 'manual' | 'qrcode',
): AttendanceRecord {
  const student = STUDENTS.find((s) => s.id === studentId);
  return {
    id: `att-${Date.now()}`,
    student_id: studentId,
    student_name: student?.name ?? 'Aluno',
    class_id: classId,
    date: new Date().toISOString().slice(0, 10),
    status: 'present',
    checked_in_at: new Date().toISOString(),
    method,
  };
}

export function mockMarkAbsent(
  studentId: string,
  classId: string,
  date: string,
): AttendanceRecord {
  const student = STUDENTS.find((s) => s.id === studentId);
  return {
    id: `att-abs-${Date.now()}`,
    student_id: studentId,
    student_name: student?.name ?? 'Aluno',
    class_id: classId,
    date,
    status: 'absent',
    checked_in_at: null,
    method: 'manual',
  };
}

export function mockListAttendanceRecord(classId: string, date: string): AttendanceRecord[] {
  return STUDENTS.map((s, i) => ({
    id: `att-${classId}-${date}-${i}`,
    student_id: s.id,
    student_name: s.name,
    class_id: classId,
    date,
    status: (i < 8 ? 'present' : i < 10 ? 'absent' : 'justified') as AttendanceRecord['status'],
    checked_in_at: i < 8 ? `${date}T19:00:00Z` : null,
    method: (i % 3 === 0 ? 'qrcode' : 'manual') as AttendanceRecord['method'],
  }));
}

export function mockGetStudentAttendanceRecord(studentId: string): AttendanceRecord[] {
  const student = STUDENTS.find((s) => s.id === studentId);
  const result: AttendanceRecord[] = [];
  const now = new Date();

  for (let d = 90; d >= 0; d--) {
    if (d % 2 === 0 || d % 3 === 0) continue; // skip some days
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().slice(0, 10);
    const cls = CLASSES[d % CLASSES.length];

    result.push({
      id: `att-hist-${studentId}-${d}`,
      student_id: studentId,
      student_name: student?.name ?? 'Aluno',
      class_id: cls.id,
      date: dateStr,
      status: d > 5 ? 'present' : (d === 3 ? 'absent' : 'present'),
      checked_in_at: d > 5 || d !== 3 ? `${dateStr}T19:00:00Z` : null,
      method: d % 4 === 0 ? 'qrcode' : 'manual',
    });
  }

  return result;
}

export function mockGetAttendanceSummary(_academyId: string): AttendanceSummary {
  return {
    total_classes: 72,
    total_present: 58,
    total_absent: 10,
    total_justified: 4,
    attendance_rate: 80.6,
    current_streak: 5,
    best_streak: 14,
  };
}

export function mockGetHeatmap(_studentId: string): HeatmapDay[] {
  const days: HeatmapDay[] = [];
  const now = new Date();

  for (let d = 180; d >= 0; d--) {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    const dow = date.getDay();

    if (dow === 0) {
      days.push({ date: date.toISOString().slice(0, 10), status: 'no_class' });
    } else if (dow === 6) {
      days.push({ date: date.toISOString().slice(0, 10), status: Math.random() > 0.5 ? 'present' : 'no_class' });
    } else {
      const rand = Math.random();
      days.push({
        date: date.toISOString().slice(0, 10),
        status: rand > 0.2 ? 'present' : rand > 0.1 ? 'absent' : 'no_class',
      });
    }
  }

  return days;
}

export function mockGetAbsentAlerts(
  _academyId: string,
  _days: number,
): { student_name: string; days_absent: number; last_attendance: string }[] {
  return [
    { student_name: 'Marcos Vieira', days_absent: 16, last_attendance: '2026-03-01' },
    { student_name: 'Carolina Lima', days_absent: 12, last_attendance: '2026-03-05' },
    { student_name: 'Pedro Santos', days_absent: 10, last_attendance: '2026-03-07' },
    { student_name: 'Ana Costa', days_absent: 9, last_attendance: '2026-03-08' },
  ];
}
