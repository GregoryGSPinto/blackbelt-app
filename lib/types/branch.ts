// ── Multi-branch types (P-059) ────────────────────────────────

export interface Branch {
  id: string;
  academyId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  managerName: string;
  managerId: string;
  totalStudents: number;
  totalProfessors: number;
  totalClasses: number;
  active: boolean;
  createdAt: string;
}

export interface CreateBranchPayload {
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  managerId: string;
}

export interface BranchStats {
  branchId: string;
  branchName: string;
  students: number;
  revenue: number;
  retention: number;
  attendance: number;
}
