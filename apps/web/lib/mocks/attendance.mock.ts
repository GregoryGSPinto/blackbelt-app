import type { AttendanceRecord, AttendanceSummary, HeatmapDay, AttendanceAnalytics } from '@/lib/types/attendance';

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

export function mockGetAttendanceAnalytics(
  _academyId: string,
  _period: string,
): AttendanceAnalytics {
  return {
    byClass: [
      { classId: 'class-1', className: 'BJJ Fundamentos', totalCheckins: 312, enrolledStudents: 28, attendanceRate: 82 },
      { classId: 'class-2', className: 'BJJ All Levels', totalCheckins: 245, enrolledStudents: 22, attendanceRate: 78 },
      { classId: 'class-4', className: 'BJJ Avancado', totalCheckins: 198, enrolledStudents: 18, attendanceRate: 85 },
      { classId: 'class-3', className: 'Judo Adulto', totalCheckins: 156, enrolledStudents: 15, attendanceRate: 72 },
      { classId: 'class-5', className: 'BJJ Noturno', totalCheckins: 134, enrolledStudents: 14, attendanceRate: 68 },
    ],
    byDayOfWeek: [
      { day: 'Domingo', dayIndex: 0, avgCheckins: 0 },
      { day: 'Segunda', dayIndex: 1, avgCheckins: 24.3 },
      { day: 'Terca', dayIndex: 2, avgCheckins: 26.1 },
      { day: 'Quarta', dayIndex: 3, avgCheckins: 23.8 },
      { day: 'Quinta', dayIndex: 4, avgCheckins: 25.5 },
      { day: 'Sexta', dayIndex: 5, avgCheckins: 20.2 },
      { day: 'Sabado', dayIndex: 6, avgCheckins: 14.7 },
    ],
    peakHours: [
      { hour: '06:00', checkins: 87 },
      { hour: '07:00', checkins: 142 },
      { hour: '08:00', checkins: 56 },
      { hour: '10:00', checkins: 98 },
      { hour: '11:00', checkins: 45 },
      { hour: '17:00', checkins: 67 },
      { hour: '18:00', checkins: 178 },
      { hour: '19:00', checkins: 213 },
      { hour: '20:00', checkins: 156 },
      { hour: '21:00', checkins: 89 },
    ],
    topStudents: [
      { studentId: 'student-1', studentName: 'Joao Pedro', checkins: 28, attendanceRate: 93 },
      { studentId: 'student-5', studentName: 'Sophia Nakamura', checkins: 26, attendanceRate: 87 },
      { studentId: 'student-3', studentName: 'Rafael Costa', checkins: 25, attendanceRate: 83 },
      { studentId: 'student-6', studentName: 'Lucas Almeida', checkins: 24, attendanceRate: 80 },
      { studentId: 'student-4', studentName: 'Luciana Ferreira', checkins: 23, attendanceRate: 77 },
      { studentId: 'student-12', studentName: 'Beatriz Nunes', checkins: 22, attendanceRate: 73 },
      { studentId: 'student-7', studentName: 'Ana Paula', checkins: 21, attendanceRate: 70 },
      { studentId: 'student-11', studentName: 'Gustavo Ribeiro', checkins: 20, attendanceRate: 67 },
      { studentId: 'student-2', studentName: 'Marina Silva', checkins: 19, attendanceRate: 63 },
      { studentId: 'student-9', studentName: 'Carolina Lima', checkins: 18, attendanceRate: 60 },
    ],
    bottomStudents: [
      { studentId: 'student-8', studentName: 'Marcos Vieira', checkins: 4, attendanceRate: 13 },
      { studentId: 'student-10', studentName: 'Pedro Santos', checkins: 6, attendanceRate: 20 },
      { studentId: 'student-13', studentName: 'Felipe Rodrigues', checkins: 7, attendanceRate: 23 },
      { studentId: 'student-14', studentName: 'Amanda Lopes', checkins: 8, attendanceRate: 27 },
      { studentId: 'student-15', studentName: 'Thiago Nascimento', checkins: 9, attendanceRate: 30 },
      { studentId: 'student-16', studentName: 'Camila Oliveira', checkins: 10, attendanceRate: 33 },
      { studentId: 'student-17', studentName: 'Bruno Alves', checkins: 10, attendanceRate: 33 },
      { studentId: 'student-18', studentName: 'Julia Rocha', checkins: 11, attendanceRate: 37 },
      { studentId: 'student-19', studentName: 'Diego Santos', checkins: 12, attendanceRate: 40 },
      { studentId: 'student-20', studentName: 'Fernanda Lima', checkins: 13, attendanceRate: 43 },
    ],
  };
}
