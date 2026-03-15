import type { InviteDTO, StaffMember } from '@/lib/api/invites.service';
import { Role } from '@/lib/types';

const delay = () => new Promise((r) => setTimeout(r, 200));

const STAFF: StaffMember[] = [
  { id: 'staff-1', name: 'Carlos Admin', email: 'carlos@academia.com', role: Role.Admin, units: ['Sede Principal'], status: 'active', lastAccessAt: '2026-03-15T10:00:00Z' },
  { id: 'staff-2', name: 'Prof. Silva', email: 'silva@academia.com', role: Role.Professor, units: ['Sede Principal', 'Filial Norte'], status: 'active', lastAccessAt: '2026-03-15T09:30:00Z' },
  { id: 'staff-3', name: 'Prof. Santos', email: 'santos@academia.com', role: Role.Professor, units: ['Sede Principal'], status: 'active', lastAccessAt: '2026-03-14T18:00:00Z' },
  { id: 'staff-4', name: 'Prof. Costa', email: 'costa@academia.com', role: Role.Professor, units: ['Filial Norte'], status: 'inactive', lastAccessAt: '2026-02-20T15:00:00Z' },
];

const INVITES: InviteDTO[] = [
  { id: 'inv-1', email: 'novo.prof@gmail.com', role: Role.Professor, unitIds: ['unit-1'], status: 'pending', createdAt: '2026-03-13T10:00:00Z', expiresAt: '2026-03-20T10:00:00Z' },
];

export async function mockListStaff(_academyId: string): Promise<StaffMember[]> {
  await delay();
  return STAFF.map((s) => ({ ...s }));
}

export async function mockSendInvite(email: string, role: Role, unitIds: string[]): Promise<InviteDTO> {
  await delay();
  const invite: InviteDTO = {
    id: `inv-${Date.now()}`,
    email,
    role,
    unitIds,
    status: 'pending',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
  INVITES.push(invite);
  return invite;
}

export async function mockGetActiveInvites(_academyId: string): Promise<InviteDTO[]> {
  await delay();
  return INVITES.filter((i) => i.status === 'pending').map((i) => ({ ...i }));
}

export async function mockCancelInvite(inviteId: string): Promise<void> {
  await delay();
  const inv = INVITES.find((i) => i.id === inviteId);
  if (inv) inv.status = 'cancelled';
}

export async function mockResendInvite(_inviteId: string): Promise<void> {
  await delay();
}
