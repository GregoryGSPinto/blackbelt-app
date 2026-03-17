// ============================================================
// BlackBelt v2 — Class (Turma) Types
//
// Tipos de dominio para CRUD de turmas.
// Usa ClassItem (nao Class) para evitar conflito com domain.ts.
// ============================================================

export interface DaySchedule {
  day_of_week: number; // 0=Sun, 1=Mon, ..., 6=Sat
  start_time: string; // "19:00"
  end_time: string; // "20:30"
}

export type ClassStatus = 'active' | 'inactive' | 'archived';

export interface ClassItem {
  id: string;
  academy_id: string;
  name: string;
  modality: string;
  professor_id: string;
  professor_name: string;
  schedule: DaySchedule[];
  capacity: number;
  enrolled_count: number;
  status: ClassStatus;
  room: string;
  min_belt: string;
  max_belt: string;
  description: string;
}

export interface ClassStudent {
  id: string;
  student_id: string;
  student_name: string;
  belt: string;
  enrolled_at: string;
  attendance_rate: number;
}

export interface CreateClassDTO {
  academy_id: string;
  name: string;
  modality: string;
  professor_id: string;
  schedule: DaySchedule[];
  capacity: number;
  room: string;
  min_belt: string;
  max_belt: string;
  description: string;
}

export interface UpdateClassDTO {
  name?: string;
  modality?: string;
  professor_id?: string;
  schedule?: DaySchedule[];
  capacity?: number;
  room?: string;
  min_belt?: string;
  max_belt?: string;
  description?: string;
  status?: ClassStatus;
}

export interface ClassFilters {
  modality?: string;
  status?: ClassStatus;
  professor_id?: string;
}

export interface ScheduleEntry {
  class_id: string;
  class_name: string;
  modality: string;
  professor_name: string;
  room: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}
