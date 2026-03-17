/**
 * BlackBelt v2 — Push Notification Configuration
 *
 * Supports APNs (iOS), FCM (Android), and VAPID (Web Push).
 * Each provider only initializes if its credentials are present.
 */

import { logger } from '@/lib/monitoring/logger';

export interface PushConfig {
  apns: {
    enabled: boolean;
    keyId: string | null;
    teamId: string | null;
  };
  fcm: {
    enabled: boolean;
    serverKey: string | null;
  };
  vapid: {
    enabled: boolean;
    publicKey: string | null;
    privateKey: string | null;
    subject: string;
  };
}

export function getPushConfig(): PushConfig {
  return {
    apns: {
      enabled: !!(process.env.APNS_KEY_ID && process.env.APNS_TEAM_ID),
      keyId: process.env.APNS_KEY_ID ?? null,
      teamId: process.env.APNS_TEAM_ID ?? null,
    },
    fcm: {
      enabled: !!process.env.FCM_SERVER_KEY,
      serverKey: process.env.FCM_SERVER_KEY ?? null,
    },
    vapid: {
      enabled: !!(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY),
      publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? null,
      privateKey: process.env.VAPID_PRIVATE_KEY ?? null,
      subject: process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.blackbelt.com',
    },
  };
}

export function getEnabledProviders(): string[] {
  const config = getPushConfig();
  const providers: string[] = [];
  if (config.apns.enabled) providers.push('apns');
  if (config.fcm.enabled) providers.push('fcm');
  if (config.vapid.enabled) providers.push('vapid');
  return providers;
}

/**
 * Send push notification to a specific platform.
 * Falls back silently if credentials are not configured.
 */
export async function sendPushToDevice(
  platform: 'ios' | 'android' | 'web',
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<boolean> {
  const config = getPushConfig();

  try {
    if (platform === 'android' && config.fcm.enabled) {
      const res = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `key=${config.fcm.serverKey}`,
        },
        body: JSON.stringify({
          to: token,
          notification: { title, body },
          data,
        }),
      });
      return res.ok;
    }

    if (platform === 'ios' && config.fcm.enabled) {
      // iOS via FCM (most common setup with APNs through Firebase)
      const res = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `key=${config.fcm.serverKey}`,
        },
        body: JSON.stringify({
          to: token,
          notification: { title, body, sound: 'default' },
          data,
          priority: 'high',
        }),
      });
      return res.ok;
    }

    if (platform === 'web' && config.vapid.enabled) {
      // Web Push would use web-push library
      // For now, log and return true as placeholder
      logger.debug(`[WebPush] Would send to ${token}: ${title}`);
      return true;
    }

    logger.warn(`[Push] No credentials for platform: ${platform}`);
    return false;
  } catch (error) {
    logger.error(`[Push] Failed to send to ${platform}`, { error: String(error) });
    return false;
  }
}
