import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
import type { NotificationPreferences } from '@/lib/types/notification';

export async function getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
  try {
    if (isMock()) {
      const { mockGetPreferences } = await import('@/lib/mocks/notification-preferences.mock');
      return mockGetPreferences(userId);
    }
    const res = await fetch(`/api/users/${userId}/notification-preferences`);
    if (!res.ok) throw new ServiceError(res.status, 'notificationPreferences.get');
    return res.json();
  } catch (error) { handleServiceError(error, 'notificationPreferences.get'); }
}

export async function updateNotificationPreferences(
  userId: string,
  prefs: Partial<NotificationPreferences>,
): Promise<NotificationPreferences> {
  try {
    if (isMock()) {
      const { mockUpdatePreferences } = await import('@/lib/mocks/notification-preferences.mock');
      return mockUpdatePreferences(userId, prefs);
    }
    const res = await fetch(`/api/users/${userId}/notification-preferences`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prefs),
    });
    if (!res.ok) throw new ServiceError(res.status, 'notificationPreferences.update');
    return res.json();
  } catch (error) { handleServiceError(error, 'notificationPreferences.update'); }
}
