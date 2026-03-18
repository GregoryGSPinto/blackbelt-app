import { isNative } from '@/lib/platform';

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
      console.log('[Push] Received in foreground:', notification.title);
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

async function savePushToken(userId: string, token: string): Promise<void> {
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
