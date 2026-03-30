import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';
import type { GuardianLink, GuardianLinkCreateDTO, GuardianLinkPermissions } from '@/lib/types/guardian';

// ────────────────────────────────────────────────────────────
// Service: Guardian Links
// ────────────────────────────────────────────────────────────

export async function getGuardianLinks(guardianId: string): Promise<GuardianLink[]> {
  try {
    if (isMock()) {
      const { mockGetGuardianLinks } = await import('@/lib/mocks/guardian-links.mock');
      return mockGetGuardianLinks(guardianId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('guardian_links')
      .select(`
        *,
        child:profiles!child_id(display_name, role, avatar)
      `)
      .eq('guardian_id', guardianId);

    if (error) throw error;

    return (data ?? []).map((row: Record<string, unknown>) => ({
      ...row,
      child_name: (row.child as Record<string, unknown>)?.display_name as string,
      child_role: (row.child as Record<string, unknown>)?.role as string,
      child_avatar_url: (row.child as Record<string, unknown>)?.avatar as string | null,
    })) as GuardianLink[];
  } catch (error) {
    handleServiceError(error, 'guardian-links.getGuardianLinks');
  }
}

export async function getChildGuardian(childId: string): Promise<GuardianLink | null> {
  try {
    if (isMock()) {
      const { mockGetChildGuardian } = await import('@/lib/mocks/guardian-links.mock');
      return mockGetChildGuardian(childId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('guardian_links')
      .select(`
        *,
        guardian:profiles!guardian_id(display_name)
      `)
      .eq('child_id', childId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      ...data,
      guardian_name: (data.guardian as Record<string, unknown>)?.display_name as string,
    } as GuardianLink;
  } catch (error) {
    handleServiceError(error, 'guardian-links.getChildGuardian');
  }
}

export async function createGuardianLink(dto: GuardianLinkCreateDTO): Promise<GuardianLink> {
  try {
    if (isMock()) {
      const { mockCreateGuardianLink } = await import('@/lib/mocks/guardian-links.mock');
      return mockCreateGuardianLink(dto);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('guardian_links')
      .insert({
        guardian_id: dto.guardian_id,
        child_id: dto.child_id,
        relationship: dto.relationship,
      })
      .select()
      .single();

    if (error) throw error;
    return data as GuardianLink;
  } catch (error) {
    handleServiceError(error, 'guardian-links.createGuardianLink');
  }
}

export async function updateGuardianPermissions(
  linkId: string,
  permissions: GuardianLinkPermissions,
): Promise<GuardianLink> {
  try {
    if (isMock()) {
      const { mockUpdateGuardianPermissions } = await import('@/lib/mocks/guardian-links.mock');
      return mockUpdateGuardianPermissions(linkId, permissions);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('guardian_links')
      .update(permissions)
      .eq('id', linkId)
      .select()
      .single();

    if (error) throw error;
    return data as GuardianLink;
  } catch (error) {
    handleServiceError(error, 'guardian-links.updateGuardianPermissions');
  }
}

export async function removeGuardianLink(linkId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockRemoveGuardianLink } = await import('@/lib/mocks/guardian-links.mock');
      return mockRemoveGuardianLink(linkId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('guardian_links')
      .delete()
      .eq('id', linkId);

    if (error) throw error;
  } catch (error) {
    handleServiceError(error, 'guardian-links.removeGuardianLink');
  }
}
