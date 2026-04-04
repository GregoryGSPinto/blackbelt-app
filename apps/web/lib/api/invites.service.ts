import { isMock } from '@/lib/env';
import type { Role } from '@/lib/types';
import { logServiceError } from '@/lib/api/errors';

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
  if (isMock()) {
    const { mockListStaff } = await import('@/lib/mocks/invites.mock');
    return mockListStaff(academyId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  const { data, error } = await supabase
    .from('memberships')
    .select('id, role, status, profiles!inner(id, display_name)')
    .eq('academy_id', academyId)
    .in('role', ['admin', 'professor', 'receptionist']);

  if (error) {
    logServiceError(error, 'invites');
    return [];
  }

  return (data ?? []).map((m: Record<string, unknown>) => {
    const profile = m.profiles as Record<string, unknown> | null;
    return {
      id: m.id as string,
      name: (profile?.display_name as string) ?? '',
      email: '',
      role: m.role as Role,
      units: [],
      status: m.status as 'active' | 'inactive',
      lastAccessAt: null,
    };
  });
}

export async function sendInvite(email: string, role: Role, unitIds: string[]): Promise<InviteDTO> {
  if (isMock()) {
    const { mockSendInvite } = await import('@/lib/mocks/invites.mock');
    return mockSendInvite(email, role, unitIds);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  const { data, error } = await supabase
    .from('invites')
    .insert({ email, role, unit_ids: unitIds, status: 'pending' })
    .select()
    .single();

  if (error) {
    logServiceError(error, 'invites');
    throw new Error(`[sendInvite] ${error.message}`);
  }

  return data as unknown as InviteDTO;
}

export async function getActiveInvites(academyId: string): Promise<InviteDTO[]> {
  if (isMock()) {
    const { mockGetActiveInvites } = await import('@/lib/mocks/invites.mock');
    return mockGetActiveInvites(academyId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  const { data, error } = await supabase
    .from('invites')
    .select('*')
    .eq('academy_id', academyId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    logServiceError(error, 'invites');
    return [];
  }

  return (data ?? []) as unknown as InviteDTO[];
}

export async function cancelInvite(inviteId: string): Promise<void> {
  if (isMock()) {
    const { mockCancelInvite } = await import('@/lib/mocks/invites.mock');
    return mockCancelInvite(inviteId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  const { error } = await supabase
    .from('invites')
    .update({ status: 'cancelled' })
    .eq('id', inviteId);

  if (error) {
    logServiceError(error, 'invites');
    throw new Error(`[cancelInvite] ${error.message}`);
  }
}

export async function resendInvite(inviteId: string): Promise<void> {
  if (isMock()) {
    const { mockResendInvite } = await import('@/lib/mocks/invites.mock');
    return mockResendInvite(inviteId);
  }

  const { createBrowserClient } = await import('@/lib/supabase/client');
  const supabase = createBrowserClient();

  const { error } = await supabase
    .from('invites')
    .update({ status: 'pending', updated_at: new Date().toISOString() })
    .eq('id', inviteId);

  if (error) {
    logServiceError(error, 'invites');
    throw new Error(`[resendInvite] ${error.message}`);
  }
}
