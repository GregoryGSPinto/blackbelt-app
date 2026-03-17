import type { Branch, CreateBranchPayload, BranchStats } from '@/lib/types/branch';

const BRANCHES: Branch[] = [
  {
    id: 'branch-1',
    academyId: 'academy-1',
    name: 'Guerreiros BJJ — Matriz',
    address: 'Rua das Artes Marciais, 100',
    city: 'São Paulo',
    state: 'SP',
    phone: '+5511999001001',
    managerName: 'Roberto Silva',
    managerId: 'prof-1',
    totalStudents: 98,
    totalProfessors: 3,
    totalClasses: 14,
    active: true,
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'branch-2',
    academyId: 'academy-1',
    name: 'Guerreiros BJJ — Zona Sul',
    address: 'Av. Santo Amaro, 2500',
    city: 'São Paulo',
    state: 'SP',
    phone: '+5511999002002',
    managerName: 'Fernanda Costa',
    managerId: 'prof-2',
    totalStudents: 52,
    totalProfessors: 2,
    totalClasses: 8,
    active: true,
    createdAt: '2025-06-01T00:00:00Z',
  },
  {
    id: 'branch-3',
    academyId: 'academy-1',
    name: 'Guerreiros BJJ — Campinas',
    address: 'Rua do Tatame, 42',
    city: 'Campinas',
    state: 'SP',
    phone: '+5519999003003',
    managerName: 'Thiago Mendes',
    managerId: 'prof-3',
    totalStudents: 22,
    totalProfessors: 1,
    totalClasses: 4,
    active: true,
    createdAt: '2026-01-10T00:00:00Z',
  },
];

export function mockListBranches(_academyId: string): Branch[] {
  return BRANCHES;
}

export function mockGetBranch(branchId: string): Branch {
  return BRANCHES.find((b) => b.id === branchId) ?? BRANCHES[0];
}

export function mockCreateBranch(academyId: string, payload: CreateBranchPayload): Branch {
  return {
    id: `branch-${Date.now()}`,
    academyId,
    name: payload.name,
    address: payload.address,
    city: payload.city,
    state: payload.state,
    phone: payload.phone,
    managerName: 'Novo Gestor',
    managerId: payload.managerId,
    totalStudents: 0,
    totalProfessors: 0,
    totalClasses: 0,
    active: true,
    createdAt: new Date().toISOString(),
  };
}

export function mockBranchStats(_academyId: string): BranchStats[] {
  return [
    { branchId: 'branch-1', branchName: 'Matriz', students: 98, revenue: 28500, retention: 95.2, attendance: 82 },
    { branchId: 'branch-2', branchName: 'Zona Sul', students: 52, revenue: 14200, retention: 93.1, attendance: 78 },
    { branchId: 'branch-3', branchName: 'Campinas', students: 22, revenue: 5190, retention: 88.5, attendance: 71 },
  ];
}
