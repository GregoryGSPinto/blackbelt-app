import { isNative } from '@/lib/platform';

interface InAppNotification {
  title: string;
  body?: string;
}

export async function initPushNotifications(userId: string): Promise<void> {
  if (!isNative()) return;

  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');

    const permission = await PushNotifications.requestPermissions();
    if (permission.receive !== 'granted') return;

    await PushNotifications.register();

    PushNotifications.addListener('registration', async (token) => {
      await savePushToken(userId, token.value);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      showInAppNotification({
        title: notification.title ?? 'BlackBelt',
        body: notification.body ?? undefined,
      });
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      const url = action.notification.data?.url as string | undefined;
      if (url && typeof window !== 'undefined') {
        window.location.href = url;
      }
    });
  } catch (err) {
    console.warn('[Push] Not available:', err);
  }
}

export async function savePushToken(userId: string, token: string): Promise<void> {
  try {
    await fetch('/api/push-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        token,
        platform: (await import('@/lib/platform')).isIOS() ? 'ios' : 'android',
      }),
    });
  } catch {
    console.warn('[Push] Failed to save token');
  }
}

export function showInAppNotification(notification: InAppNotification): void {
  if (!isNative()) return;

  try {
    import('@capacitor/toast').then(({ Toast }) => {
      Toast.show({
        text: notification.body
          ? `${notification.title}: ${notification.body}`
          : notification.title,
        duration: 'long',
        position: 'top',
      });
    }).catch(() => {
      // Toast plugin not available
    });
  } catch {
    // Not available
  }
}
