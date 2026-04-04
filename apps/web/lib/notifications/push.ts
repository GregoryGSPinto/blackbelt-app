import { Capacitor } from '@capacitor/core';

interface PushToken {
  value: string;
  platform: 'ios' | 'android' | 'web';
}

export async function requestPushPermission(): Promise<PushToken | null> {
  if (Capacitor.isNativePlatform()) {
    return requestNativePush();
  }
  return requestWebPush();
}

async function requestNativePush(): Promise<PushToken | null> {
  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');
    const permission = await PushNotifications.requestPermissions();
    if (permission.receive !== 'granted') return null;

    return new Promise((resolve) => {
      PushNotifications.addListener('registration', (token) => {
        resolve({
          value: token.value,
          platform: Capacitor.getPlatform() as 'ios' | 'android',
        });
      });
      PushNotifications.addListener('registrationError', () => {
        resolve(null);
      });
      PushNotifications.register();
    });
  } catch {
    return null;
  }
}

async function requestWebPush(): Promise<PushToken | null> {
  try {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return null;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    });

    return {
      value: JSON.stringify(subscription),
      platform: 'web',
    };
  } catch {
    return null;
  }
}

export async function registerToken(_userId: string, _token: string, _platform: string): Promise<void> {
  // In mock mode, no-op. In real mode, saves to Supabase.
  // Will be implemented when Supabase is connected.
}

export function setupPushListeners(onNotification: (title: string, body: string) => void): () => void {
  if (Capacitor.isNativePlatform()) {
    let cleanup = () => {};
    import('@capacitor/push-notifications').then(({ PushNotifications }) => {
      const listener = PushNotifications.addListener('pushNotificationReceived', (notification) => {
        onNotification(notification.title || '', notification.body || '');
      });
      cleanup = () => { listener.then((l) => l.remove()); };
    });
    return () => cleanup();
  }

  // Web: listen for SW messages
  const handler = (event: MessageEvent) => {
    if (event.data?.type === 'push-notification') {
      onNotification(event.data.title, event.data.body);
    }
  };
  navigator.serviceWorker?.addEventListener('message', handler);
  return () => navigator.serviceWorker?.removeEventListener('message', handler);
}
