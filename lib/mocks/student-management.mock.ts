import { BeltLevel } from '@/lib/types/domain';
import type {
  AdminStudentItem,
  StudentManagementStats,
  StudentManagementStatus,
} from '@/lib/types/student-management';

const STUDENTS: AdminStudentItem[] = [
  { id: 's-1', profile_id: 'p-1', display_name: 'João Pedro Almeida', email: 'joao.pedro@email.com', phone: '11999001001', belt: BeltLevel.Blue, turmas: ['BJJ All Levels', 'BJJ Avançado'], attendance_rate: 92, mensalidade_status: 'em_dia', status: 'active', started_at: '2024-03-15', avatar_url: null },
  { id: 's-2', profile_id: 'p-2', display_name: 'Marina Silva Costa', email: 'marina.silva@email.com', phone: '11999001002', belt: BeltLevel.White, turmas: ['BJJ Fundamentos'], attendance_rate: 85, mensalidade_status: 'em_dia', status: 'active', started_at: '2025-09-10', avatar_url: null },
  { id: 's-3', profile_id: 'p-3', display_name: 'Rafael Costa Santos', email: 'rafael.costa@email.com', phone: '11999001003', belt: BeltLevel.Purple, turmas: ['BJJ Avançado', 'BJJ Noturno'], attendance_rate: 96, mensalidade_status: 'em_dia', status: 'active', started_at: '2022-01-20', avatar_url: null },
  { id: 's-4', profile_id: 'p-4', display_name: 'Luciana Ferreira Lima', email: 'luciana.ferreira@email.com', phone: '11999001004', belt: BeltLevel.Blue, turmas: ['BJJ All Levels'], attendance_rate: 88, mensalidade_status: 'pendente', status: 'active', started_at: '2024-06-05', avatar_url: null },
  { id: 's-5', profile_id: 'p-5', display_name: 'Sophia Nakamura', email: 'sophia.nakamura@email.com', phone: '11999001005', belt: BeltLevel.Green, turmas: ['BJJ Fundamentos', 'Judô Adulto'], attendance_rate: 78, mensalidade_status: 'em_dia', status: 'active', started_at: '2025-01-12', avatar_url: null },
  { id: 's-6', profile_id: 'p-6', display_name: 'Lucas Almeida Ribeiro', email: 'lucas.almeida@email.com', phone: '11999001006', belt: BeltLevel.White, turmas: ['BJJ Fundamentos'], attendance_rate: 65, mensalidade_status: 'atrasado', status: 'active', started_at: '2025-11-01', avatar_url: null },
  { id: 's-7', profile_id: 'p-7', display_name: 'Ana Paula Vieira', email: 'ana.paula@email.com', phone: '11999001007', belt: BeltLevel.Blue, turmas: ['BJJ All Levels', 'Judô Adulto'], attendance_rate: 91, mensalidade_status: 'em_dia', status: 'active', started_at: '2023-08-22', avatar_url: null },
  { id: 's-8', profile_id: 'p-8', display_name: 'Marcos Vieira Neto', email: 'marcos.vieira@email.com', phone: '11999001008', belt: BeltLevel.White, turmas: ['BJJ Fundamentos'], attendance_rate: 20, mensalidade_status: 'atrasado', status: 'inactive', started_at: '2025-06-15', avatar_url: null },
  { id: 's-9', profile_id: 'p-9', display_name: 'Carolina Lima Souza', email: 'carolina.lima@email.com', phone: '11999001009', belt: BeltLevel.Yellow, turmas: ['BJJ Fundamentos'], attendance_rate: 30, mensalidade_status: 'atrasado', status: 'inactive', started_at: '2025-04-10', avatar_url: null },
  { id: 's-10', profile_id: 'p-10', display_name: 'Pedro Santos Oliveira', email: 'pedro.santos@email.com', phone: '11999001010', belt: BeltLevel.Brown, turmas: ['BJJ Avançado', 'BJJ Noturno'], attendance_rate: 97, mensalidade_status: 'em_dia', status: 'active', started_at: '2020-02-14', avatar_url: null },
  { id: 's-11', profile_id: 'p-11', display_name: 'Gustavo Ribeiro Dias', email: 'gustavo.ribeiro@email.com', phone: '11999001011', belt: BeltLevel.Blue, turmas: ['BJJ All Levels'], attendance_rate: 82, mensalidade_status: 'em_dia', status: 'active', started_at: '2024-01-08', avatar_url: null },
  { id: 's-12', profile_id: 'p-12', display_name: 'Beatriz Nunes Rocha', email: 'beatriz.nunes@email.com', phone: '11999001012', belt: BeltLevel.White, turmas: ['BJJ Fundamentos', 'Judô Adulto'], attendance_rate: 75, mensalidade_status: 'em_dia', status: 'active', started_at: '2025-07-20', avatar_url: null },
  { id: 's-13', profile_id: 'p-13', display_name: 'Thiago Fernandes', email: 'thiago.fernandes@email.com', phone: '11999001013', belt: BeltLevel.Purple, turmas: ['BJJ Avançado'], attendance_rate: 94, mensalidade_status: 'em_dia', status: 'active', started_at: '2021-11-03', avatar_url: null },
  { id: 's-14', profile_id: 'p-14', display_name: 'Camila Rodrigues', email: 'camila.rodrigues@email.com', phone: '11999001014', belt: BeltLevel.Blue, turmas: ['BJJ All Levels', 'BJJ Noturno'], attendance_rate: 87, mensalidade_status: 'em_dia', status: 'active', started_at: '2023-05-17', avatar_url: null },
  { id: 's-15', profile_id: 'p-15', display_name: 'Bruno Alves Martins', email: 'bruno.alves@email.com', phone: '11999001015', belt: BeltLevel.White, turmas: ['BJJ Fundamentos'], attendance_rate: 40, mensalidade_status: 'atrasado', status: 'active', started_at: '2025-10-05', avatar_url: null },
  { id: 's-16', profile_id: 'p-16', display_name: 'Julia Rocha Mendes', email: 'julia.rocha@email.com', phone: '11999001016', belt: BeltLevel.White, turmas: ['BJJ Fundamentos'], attendance_rate: 55, mensalidade_status: 'pendente', status: 'active', started_at: '2025-12-01', avatar_url: null },
  { id: 's-17', profile_id: 'p-17', display_name: 'Felipe Gonçalves', email: 'felipe.goncalves@email.com', phone: '11999001017', belt: BeltLevel.Green, turmas: ['Judô Adulto'], attendance_rate: 80, mensalidade_status: 'em_dia', status: 'active', started_at: '2024-09-12', avatar_url: null },
  { id: 's-18', profile_id: 'p-18', display_name: 'Isabela Moreira', email: 'isabela.moreira@email.com', phone: '11999001018', belt: BeltLevel.White, turmas: ['BJJ Fundamentos'], attendance_rate: 0, mensalidade_status: 'pendente', status: 'pending', started_at: '2026-03-15', avatar_url: null },
  { id: 's-19', profile_id: 'p-19', display_name: 'Daniel Pereira Castro', email: 'daniel.pereira@email.com', phone: '11999001019', belt: BeltLevel.Blue, turmas: ['BJJ All Levels', 'BJJ Avançado'], attendance_rate: 89, mensalidade_status: 'em_dia', status: 'active', started_at: '2023-03-28', avatar_url: null },
  { id: 's-20', profile_id: 'p-20', display_name: 'Fernanda Lopes Dias', email: 'fernanda.lopes@email.com', phone: '11999001020', belt: BeltLevel.Orange, turmas: ['BJJ Fundamentos'], attendance_rate: 72, mensalidade_status: 'em_dia', status: 'active', started_at: '2025-02-14', avatar_url: null },
];

export function mockListStudents(
  _academyId: string,
  filters?: { search?: string; belt?: string; status?: string; turma?: string },
): AdminStudentItem[] {
  let result = [...STUDENTS];

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (s) =>
        s.display_name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q),
    );
  }
  if (filters?.belt) {
    result = result.filter((s) => s.belt === filters.belt);
  }
  if (filters?.status) {
    result = result.filter((s) => s.status === filters.status);
  }
  if (filters?.turma) {
    result = result.filter((s) => s.turmas.includes(filters.turma!));
  }

  return result.sort((a, b) => a.display_name.localeCompare(b.display_name, 'pt-BR'));
}

export function mockGetStudentManagementStats(_academyId: string): StudentManagementStats {
  const active = STUDENTS.filter((s) => s.status === 'active').length;
  const inactive = STUDENTS.filter((s) => s.status === 'inactive').length;
  const newThisMonth = STUDENTS.filter((s) => {
    const d = new Date(s.started_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const byBelt: Record<string, number> = {};
  for (const s of STUDENTS) {
    byBelt[s.belt] = (byBelt[s.belt] ?? 0) + 1;
  }

  return { total_active: active, new_this_month: newThisMonth, inactive, by_belt: byBelt };
}

export function mockDeactivateStudent(studentId: string): AdminStudentItem {
  const s = STUDENTS.find((st) => st.id === studentId);
  if (!s) throw new Error('Student not found');
  return { ...s, status: 'inactive' as StudentManagementStatus };
}
