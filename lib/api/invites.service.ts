import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
import type { Role } from '@/lib/types';

export interface InviteDTO {
  id: string;
  email: string;
  role: Role;
  unitIds: string[];
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  createdAt: string;
  expiresAt: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  units: string[];
  status: 'active' | 'inactive';
  lastAccessAt: string | null;
}

export async function listStaff(academyId: string): Promise<StaffMember[]> {
  try {
    if (isMock()) {
      const { mockListStaff } = await import('@/lib/mocks/invites.mock');
      return mockListStaff(academyId);
    }
    const res = await fetch(`/api/staff?academyId=${academyId}`);
    if (!res.ok) throw new ServiceError(res.status, 'staff.list');
    return res.json();
  } catch (error) { handleServiceError(error, 'staff.list'); }
}

export async function sendInvite(email: string, role: Role, unitIds: string[]): Promise<InviteDTO> {
  try {
    if (isMock()) {
      const { mockSendInvite } = await import('@/lib/mocks/invites.mock');
      return mockSendInvite(email, role, unitIds);
    }
    const res = await fetch(`/api/invites`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, role, unitIds }) });
    if (!res.ok) throw new ServiceError(res.status, 'invites.send');
    return res.json();
  } catch (error) { handleServiceError(error, 'invites.send'); }
}

export async function getActiveInvites(academyId: string): Promise<InviteDTO[]> {
  try {
    if (isMock()) {
      const { mockGetActiveInvites } = await import('@/lib/mocks/invites.mock');
      return mockGetActiveInvites(academyId);
    }
    const res = await fetch(`/api/invites?academyId=${academyId}`);
    if (!res.ok) throw new ServiceError(res.status, 'invites.list');
    return res.json();
  } catch (error) { handleServiceError(error, 'invites.list'); }
}

export async function cancelInvite(inviteId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockCancelInvite } = await import('@/lib/mocks/invites.mock');
      return mockCancelInvite(inviteId);
    }
    const res = await fetch(`/api/invites/${inviteId}`, { method: 'DELETE' });
    if (!res.ok) throw new ServiceError(res.status, 'invites.cancel');
  } catch (error) { handleServiceError(error, 'invites.cancel'); }
}

export async function resendInvite(inviteId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockResendInvite } = await import('@/lib/mocks/invites.mock');
      return mockResendInvite(inviteId);
    }
    const res = await fetch(`/api/invites/${inviteId}/resend`, { method: 'POST' });
    if (!res.ok) throw new ServiceError(res.status, 'invites.resend');
  } catch (error) { handleServiceError(error, 'invites.resend'); }
}
