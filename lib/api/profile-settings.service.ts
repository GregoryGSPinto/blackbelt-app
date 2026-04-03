import { isMock } from '@/lib/env';
import { handleServiceError, logServiceError } from '@/lib/api/errors';
import { deleteAccount } from '@/lib/api/preferences.service';
import type { ProfileRole, ProfileSettingsData } from '@/lib/mocks/profile-settings.mock';

export type { ProfileRole, ProfileSettingsData } from '@/lib/mocks/profile-settings.mock';

// ── Get profile settings ────────────────────────────────────────────

export async function getProfileSettings(role: ProfileRole): Promise<ProfileSettingsData> {
  if (isMock()) {
    const { mockGetProfileSettings } = await import('@/lib/mocks/profile-settings.mock');
    return mockGetProfileSettings(role);
  }

  try {
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Nao autenticado');

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      role,
      display_name: data.display_name ?? '',
      email: user.email ?? '',
      phone: data.phone ?? '',
      cpf: data.cpf ?? '',
      avatar_url: data.avatar_url,
      notification_push: data.notification_push ?? true,
      notification_email: data.notification_email ?? true,
      notification_sms: data.notification_sms ?? false,
      theme_preference: data.theme_preference ?? 'system',
      bio: data.bio ?? '',
      specialties: data.specialties ?? [],
      weight: data.weight,
      height: data.height,
      objective: data.objective,
      injuries: data.injuries,
      cref: data.cref,
      nickname: data.nickname,
      favorite_color: data.favorite_color,
      favorite_emoji: data.favorite_emoji,
      created_at: data.created_at,
    };
  } catch (error) {
    logServiceError(error, 'profileSettings.get');
    return null as unknown as ProfileSettingsData;
  }
}

// ── Update profile settings ─────────────────────────────────────────

export async function updateProfileSettings(
  role: ProfileRole,
  partial: Partial<ProfileSettingsData>,
): Promise<{ success: boolean }> {
  if (isMock()) {
    const { mockUpdateProfileSettings } = await import('@/lib/mocks/profile-settings.mock');
    return mockUpdateProfileSettings(role, partial);
  }

  try {
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Nao autenticado');

    const { error } = await supabase
      .from('profiles')
      .update(partial)
      .eq('user_id', user.id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    handleServiceError(error, 'profileSettings.update');
  }
}

// ── Change password ─────────────────────────────────────────────────

export async function changeProfilePassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ success: boolean }> {
  if (isMock()) {
    const { mockChangePassword } = await import('@/lib/mocks/profile-settings.mock');
    return mockChangePassword(currentPassword, newPassword);
  }

  try {
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return { success: true };
  } catch (error) {
    handleServiceError(error, 'profileSettings.changePassword');
  }
}

// ── Export user data (LGPD) ─────────────────────────────────────────

export async function exportProfileData(): Promise<object> {
  if (isMock()) {
    const { mockExportUserData } = await import('@/lib/mocks/profile-settings.mock');
    return mockExportUserData();
  }

  try {
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Nao autenticado');

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return { exportado_em: new Date().toISOString(), dados: data };
  } catch (error) {
    logServiceError(error, 'profileSettings.export');
    return {};
  }
}

// ── Delete account ──────────────────────────────────────────────────

export async function deleteProfileAccount(): Promise<{ success: boolean }> {
  if (isMock()) {
    const { mockDeleteAccount } = await import('@/lib/mocks/profile-settings.mock');
    return mockDeleteAccount();
  }

  try {
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Nao autenticado');

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (error || !profile?.id) throw new Error('Perfil nao encontrado');

    await deleteAccount(profile.id, 'EXCLUIR MINHA CONTA');
    return { success: true };
  } catch (error) {
    handleServiceError(error, 'profileSettings.delete');
  }
}
