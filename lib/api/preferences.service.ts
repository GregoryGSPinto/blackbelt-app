import { isMock } from '@/lib/env';
import type { UserPreferences, AcademySettings } from '@/lib/types/preferences';

// ── Re-export types ──────────────────────────────────────────────────
export type { UserPreferences, AcademySettings } from '@/lib/types/preferences';

// ── User Preferences ─────────────────────────────────────────────────

export async function getUserPreferences(
  profileId: string,
): Promise<UserPreferences> {
  try {
    if (isMock()) {
      const { mockGetUserPreferences } = await import(
        '@/lib/mocks/preferences.mock'
      );
      return mockGetUserPreferences(profileId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('user_preferences')
      .select('preferences')
      .eq('profile_id', profileId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[getUserPreferences] Supabase error:', error.message);
    }

    return (data?.preferences ?? {}) as UserPreferences;
  } catch (error) {
    console.error('[getUserPreferences] Fallback:', error);
    return {} as UserPreferences;
  }
}

export async function updateUserPreferences(
  profileId: string,
  partial: Partial<UserPreferences>,
): Promise<void> {
  try {
    if (isMock()) {
      const { mockUpdateUserPreferences } = await import(
        '@/lib/mocks/preferences.mock'
      );
      return mockUpdateUserPreferences(profileId, partial);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase.from('user_preferences').upsert(
      {
        profile_id: profileId,
        preferences: partial,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'profile_id' },
    );

    if (error) {
      console.error('[updateUserPreferences] Supabase error:', error.message);
    }
  } catch (error) {
    console.error('[updateUserPreferences] Fallback:', error);
  }
}

// ── Academy Settings ─────────────────────────────────────────────────

export async function getAcademySettings(
  academyId: string,
): Promise<AcademySettings> {
  try {
    if (isMock()) {
      const { mockGetAcademySettings } = await import(
        '@/lib/mocks/preferences.mock'
      );
      return mockGetAcademySettings(academyId);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('academy_settings')
      .select('settings')
      .eq('academy_id', academyId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[getAcademySettings] Supabase error:', error.message);
    }

    return (data?.settings ?? {}) as AcademySettings;
  } catch (error) {
    console.error('[getAcademySettings] Fallback:', error);
    return {} as AcademySettings;
  }
}

export async function updateAcademySettings(
  academyId: string,
  partial: Partial<AcademySettings>,
): Promise<void> {
  try {
    if (isMock()) {
      const { mockUpdateAcademySettings } = await import(
        '@/lib/mocks/preferences.mock'
      );
      return mockUpdateAcademySettings(academyId, partial);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase.from('academy_settings').upsert(
      {
        academy_id: academyId,
        settings: partial,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'academy_id' },
    );

    if (error) {
      console.error('[updateAcademySettings] Supabase error:', error.message);
    }
  } catch (error) {
    console.error('[updateAcademySettings] Fallback:', error);
  }
}

// ── Security ─────────────────────────────────────────────────────────

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  try {
    if (isMock()) {
      const { mockChangePassword } = await import(
        '@/lib/mocks/preferences.mock'
      );
      return mockChangePassword(currentPassword, newPassword);
    }

    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });

    if (!res.ok) {
      console.error('[changePassword] API error:', res.status);
    }
  } catch (error) {
    console.error('[changePassword] Fallback:', error);
  }
}

// ── Data Export & Account ────────────────────────────────────────────

export async function exportUserData(
  profileId: string,
): Promise<{ url: string }> {
  try {
    if (isMock()) {
      const { mockExportUserData } = await import(
        '@/lib/mocks/preferences.mock'
      );
      return mockExportUserData(profileId);
    }

    const res = await fetch('/api/lgpd/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: profileId }),
    });

    if (!res.ok) {
      console.error('[exportUserData] API error:', res.status);
      return { url: '' };
    }
    return res.json();
  } catch (error) {
    console.error('[exportUserData] Fallback:', error);
    return { url: '' };
  }
}

export async function deleteAccount(
  profileId: string,
  confirmText: string,
): Promise<void> {
  try {
    if (isMock()) {
      const { mockDeleteAccount } = await import(
        '@/lib/mocks/preferences.mock'
      );
      return mockDeleteAccount(profileId, confirmText);
    }

    const res = await fetch('/api/auth/delete-account', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: profileId, confirm: confirmText }),
    });

    if (!res.ok) {
      console.error('[deleteAccount] API error:', res.status);
    }
  } catch (error) {
    console.error('[deleteAccount] Fallback:', error);
  }
}

export async function deactivateAcademy(academyId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockDeactivateAcademy } = await import(
        '@/lib/mocks/preferences.mock'
      );
      return mockDeactivateAcademy(academyId);
    }

    const res = await fetch(`/api/academy/${academyId}/deactivate`, {
      method: 'POST',
    });

    if (!res.ok) {
      console.error('[deactivateAcademy] API error:', res.status);
    }
  } catch (error) {
    console.error('[deactivateAcademy] Fallback:', error);
  }
}

export async function deleteAcademy(
  academyId: string,
  confirmText: string,
): Promise<void> {
  try {
    if (isMock()) {
      const { mockDeleteAcademy } = await import(
        '@/lib/mocks/preferences.mock'
      );
      return mockDeleteAcademy(academyId, confirmText);
    }

    const res = await fetch(`/api/academy/${academyId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirm: confirmText }),
    });

    if (!res.ok) {
      console.error('[deleteAcademy] API error:', res.status);
    }
  } catch (error) {
    console.error('[deleteAcademy] Fallback:', error);
  }
}

// ── Tutorials & Onboarding ──────────────────────────────────────────

export async function resetTutorial(profileId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockResetTutorial } = await import(
        '@/lib/mocks/preferences.mock'
      );
      return mockResetTutorial(profileId);
    }

    const res = await fetch('/api/tutorial/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: profileId }),
    });

    if (!res.ok) {
      console.error('[resetTutorial] API error:', res.status);
    }
  } catch (error) {
    console.error('[resetTutorial] Fallback:', error);
  }
}

export async function resetChecklist(profileId: string): Promise<void> {
  try {
    if (isMock()) {
      const { mockResetChecklist } = await import(
        '@/lib/mocks/preferences.mock'
      );
      return mockResetChecklist(profileId);
    }

    const res = await fetch('/api/checklist/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: profileId }),
    });

    if (!res.ok) {
      console.error('[resetChecklist] API error:', res.status);
    }
  } catch (error) {
    console.error('[resetChecklist] Fallback:', error);
  }
}

// ── File Uploads ─────────────────────────────────────────────────────

export async function uploadAvatar(
  profileId: string,
  file: File,
): Promise<string> {
  try {
    if (isMock()) {
      const { mockUploadAvatar } = await import(
        '@/lib/mocks/preferences.mock'
      );
      return mockUploadAvatar(profileId, file);
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('profile_id', profileId);

    const res = await fetch('/api/upload/avatar', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      console.error('[uploadAvatar] API error:', res.status);
      return '';
    }
    const result = await res.json();
    return result.url as string;
  } catch (error) {
    console.error('[uploadAvatar] Fallback:', error);
    return '';
  }
}

export async function uploadAcademyLogo(
  academyId: string,
  file: File,
): Promise<string> {
  try {
    if (isMock()) {
      const { mockUploadAcademyLogo } = await import(
        '@/lib/mocks/preferences.mock'
      );
      return mockUploadAcademyLogo(academyId, file);
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('academy_id', academyId);

    const res = await fetch('/api/upload/academy-logo', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      console.error('[uploadAcademyLogo] API error:', res.status);
      return '';
    }
    const result = await res.json();
    return result.url as string;
  } catch (error) {
    console.error('[uploadAcademyLogo] Fallback:', error);
    return '';
  }
}
