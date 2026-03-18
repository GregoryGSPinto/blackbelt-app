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

export function getPlatform(): string {
  return _platform;
}
