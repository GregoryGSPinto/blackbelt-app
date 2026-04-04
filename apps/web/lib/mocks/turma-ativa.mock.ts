import { BeltLevel, AttendanceMethod } from '@/lib/types';
import type { Attendance } from '@/lib/types';
import type { ActiveClassDTO, ActiveClassStudent, SaveAttendanceRequest } from '@/lib/api/turma-ativa.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

const MOCK_ACTIVE_CLASS_STUDENTS: ActiveClassStudent[] = [
  { student_id: 'stu-1', display_name: 'João Mendes', avatar: null, belt: BeltLevel.Blue, is_present: false, checked_in_via_qr: false },
  { student_id: 'stu-2', display_name: 'Maria Oliveira', avatar: null, belt: BeltLevel.Purple, is_present: true, checked_in_via_qr: true },
  { student_id: 'stu-3', display_name: 'Pedro Santos', avatar: null, belt: BeltLevel.White, is_present: false, checked_in_via_qr: false },
  { student_id: 'stu-4', display_name: 'Ana Costa', avatar: null, belt: BeltLevel.Yellow, is_present: false, checked_in_via_qr: false },
  { student_id: 'stu-5', display_name: 'Lucas Ferreira', avatar: null, belt: BeltLevel.Green, is_present: true, checked_in_via_qr: true },
  { student_id: 'stu-6', display_name: 'Bruna Alves', avatar: null, belt: BeltLevel.Orange, is_present: false, checked_in_via_qr: false },
  { student_id: 'stu-7', display_name: 'Rafael Souza', avatar: null, belt: BeltLevel.Brown, is_present: false, checked_in_via_qr: false },
  { student_id: 'stu-8', display_name: 'Camila Lima', avatar: null, belt: BeltLevel.Blue, is_present: false, checked_in_via_qr: false },
  { student_id: 'stu-9', display_name: 'Diego Rocha', avatar: null, belt: BeltLevel.White, is_present: false, checked_in_via_qr: false },
  { student_id: 'stu-10', display_name: 'Juliana Martins', avatar: null, belt: BeltLevel.Gray, is_present: false, checked_in_via_qr: false },
  { student_id: 'stu-12', display_name: 'Patrícia Gomes', avatar: null, belt: BeltLevel.Green, is_present: false, checked_in_via_qr: false },
  { student_id: 'stu-13', display_name: 'Fernando Dias', avatar: null, belt: BeltLevel.Yellow, is_present: false, checked_in_via_qr: false },
];

export async function mockGetActiveClass(_professorId: string): Promise<ActiveClassDTO | null> {
  await delay();
  return {
    class_id: 'class-bjj-noite',
    modality_name: 'Brazilian Jiu-Jitsu',
    unit_name: 'Unidade Centro',
    start_time: '19:00',
    end_time: '20:30',
    students: MOCK_ACTIVE_CLASS_STUDENTS,
  };
}

export async function mockSaveAttendance(data: SaveAttendanceRequest): Promise<Attendance[]> {
  await delay();
  const now = new Date().toISOString();
  return data.present_student_ids.map((studentId) => ({
    id: `att-save-${studentId}-${Date.now()}`,
    student_id: studentId,
    class_id: data.class_id,
    checked_at: now,
    method: AttendanceMethod.Manual,
    created_at: now,
    updated_at: now,
  }));
}
