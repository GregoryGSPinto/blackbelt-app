'use client';

// ═══════════════════════════════════════════════════════
// Platform Detection — Capacitor vs Web
// ═══════════════════════════════════════════════════════

let _isNative = false;
let _platform = 'web';

// Dynamic import to avoid breaking web build
try {
  if (typeof window !== 'undefined') {
    const cap = (window as Window & { Capacitor?: { isNativePlatform: () => boolean; getPlatform: () => string } }).Capacitor;
    if (cap) {
      _isNative = cap.isNativePlatform();
      _platform = cap.getPlatform();
    }
  }
} catch {
  // Not in Capacitor environment
}

let _capacitor: typeof import('@capacitor/core').Capacitor | null = null;

async function getCapacitor() {
  if (_capacitor) return _capacitor;
  try {
    const mod = await import('@capacitor/core');
    _capacitor = mod.Capacitor;
    return _capacitor;
  } catch {
    return null;
  }
}

export function isNative(): boolean {
  return _isNative;
}

export function isIOS(): boolean {
  return _platform === 'ios';
}

export function isAndroid(): boolean {
  return _platform === 'android';
}

export function isWeb(): boolean {
  return _platform === 'web';
}

export function isMobileBuild(): boolean {
  return process.env.NEXT_PUBLIC_PLATFORM === 'mobile';
}

export function isNativeBuild(): boolean {
  return (
    process.env.NEXT_PUBLIC_CAPACITOR === 'true' ||
    process.env.NEXT_PUBLIC_PLATFORM === 'mobile'
  );
}

export function isNativeApp(): boolean {
  if (isNativeBuild()) return true;
  return isNative();
}

export function getPlatform(): string {
  return _platform;
}

export { getCapacitor };
