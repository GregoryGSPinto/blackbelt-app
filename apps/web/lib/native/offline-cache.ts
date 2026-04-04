import { isNative } from '@/lib/platform';

export async function isOnline(): Promise<boolean> {
  if (!isNative()) return navigator.onLine;
  try {
    const { Network } = await import('@capacitor/network');
    const status = await Network.getStatus();
    return status.connected;
  } catch {
    return navigator.onLine;
  }
}

export async function initNetworkListener(
  onOnline: () => void,
  onOffline: () => void,
): Promise<() => void> {
  if (!isNative()) {
    const handleOnline = () => onOnline();
    const handleOffline = () => onOffline();
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }

  try {
    const { Network } = await import('@capacitor/network');
    const handle = await Network.addListener('networkStatusChange', (status) => {
      if (status.connected) onOnline();
      else onOffline();
    });
    return () => handle.remove();
  } catch {
    return () => {};
  }
}

export async function cacheData(key: string, data: unknown): Promise<void> {
  if (!isNative()) {
    try {
      localStorage.setItem(`bb_cache_${key}`, JSON.stringify({ data, cachedAt: new Date().toISOString() }));
    } catch { /* storage full */ }
    return;
  }

  try {
    const { Preferences } = await import('@capacitor/preferences');
    await Preferences.set({
      key: `bb_cache_${key}`,
      value: JSON.stringify({ data, cachedAt: new Date().toISOString() }),
    });
  } catch { /* not available */ }
}

export async function getCachedData<T>(key: string): Promise<{ data: T; cachedAt: string } | null> {
  if (!isNative()) {
    try {
      const raw = localStorage.getItem(`bb_cache_${key}`);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  try {
    const { Preferences } = await import('@capacitor/preferences');
    const result = await Preferences.get({ key: `bb_cache_${key}` });
    if (!result.value) return null;
    return JSON.parse(result.value);
  } catch {
    return null;
  }
}
