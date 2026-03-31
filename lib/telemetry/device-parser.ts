// ═══════════════════════════════════════════════════════
// Device Parser — Recognizes top 20 phones sold in Brazil
// ═══════════════════════════════════════════════════════

export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop' | 'tv' | 'unknown';
  os: string;
  osVersion: string;
  browser: string;
  browserVersion: string;
  deviceModel: string;
  deviceVendor: string;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  touchscreen: boolean;
  connectionType: string;
  connectionSpeed: string;
  effectiveType?: string;
  downlink?: number;
  isPWA: boolean;
  isCapacitor: boolean;
  serviceWorkerActive: boolean;
}

// iPhone screen-size → model mapping
const IPHONE_MODELS: Record<string, string> = {
  '320x568': 'iPhone 5/SE (1st)',
  '375x667': 'iPhone 6/7/8/SE (2nd/3rd)',
  '375x812': 'iPhone X/XS/11 Pro/12 Mini/13 Mini',
  '390x844': 'iPhone 12/13/14',
  '393x852': 'iPhone 14 Pro/15/15 Pro',
  '414x736': 'iPhone 6+/7+/8+',
  '414x896': 'iPhone XR/XS Max/11/11 Pro Max',
  '428x926': 'iPhone 12/13/14 Pro Max',
  '430x932': 'iPhone 15 Plus/15 Pro Max/16 Pro Max',
};

// Top 20 Samsung models in Brazil (regex on SM- model codes)
const SAMSUNG_MODELS: [RegExp, string][] = [
  [/SM-S928/i, 'Galaxy S24 Ultra'],
  [/SM-S926/i, 'Galaxy S24+'],
  [/SM-S921/i, 'Galaxy S24'],
  [/SM-S918/i, 'Galaxy S23 Ultra'],
  [/SM-S916/i, 'Galaxy S23+'],
  [/SM-S911/i, 'Galaxy S23'],
  [/SM-A546/i, 'Galaxy A54'],
  [/SM-A556/i, 'Galaxy A55'],
  [/SM-A346/i, 'Galaxy A34'],
  [/SM-A356/i, 'Galaxy A35'],
  [/SM-A256/i, 'Galaxy A25'],
  [/SM-A155/i, 'Galaxy A15'],
  [/SM-A057/i, 'Galaxy A05s'],
  [/SM-A145/i, 'Galaxy A14'],
  [/SM-M146/i, 'Galaxy M14'],
  [/SM-S90/i, 'Galaxy S series'],
  [/SM-A/i, 'Galaxy A series'],
  [/SM-M/i, 'Galaxy M series'],
  [/SM-G/i, 'Galaxy S (older)'],
  [/SM-N/i, 'Galaxy Note'],
];

// Xiaomi models
const XIAOMI_MODELS: [RegExp, string][] = [
  [/Redmi Note 13 Pro/i, 'Redmi Note 13 Pro'],
  [/Redmi Note 13/i, 'Redmi Note 13'],
  [/Redmi Note 12 Pro/i, 'Redmi Note 12 Pro'],
  [/Redmi Note 12/i, 'Redmi Note 12'],
  [/Redmi 13C/i, 'Redmi 13C'],
  [/Redmi 12/i, 'Redmi 12'],
  [/POCO X6/i, 'POCO X6'],
  [/POCO X5/i, 'POCO X5'],
  [/POCO M5/i, 'POCO M5'],
  [/Redmi/i, 'Redmi (outro)'],
  [/POCO/i, 'POCO (outro)'],
];

// Motorola models
const MOTOROLA_MODELS: [RegExp, string][] = [
  [/moto g84/i, 'Moto G84'],
  [/moto g73/i, 'Moto G73'],
  [/moto g54/i, 'Moto G54'],
  [/moto g34/i, 'Moto G34'],
  [/moto g24/i, 'Moto G24'],
  [/moto g14/i, 'Moto G14'],
  [/moto e22/i, 'Moto E22'],
  [/moto edge 40/i, 'Moto Edge 40'],
  [/moto edge 30/i, 'Moto Edge 30'],
  [/moto g/i, 'Moto G series'],
  [/moto e/i, 'Moto E series'],
  [/moto/i, 'Motorola (outro)'],
];

function parseOS(ua: string): { os: string; osVersion: string } {
  // iOS
  const iosMatch = ua.match(/OS (\d+[_\.]\d+[_\.]?\d*) like Mac OS X/i);
  if (iosMatch) {
    const ver = iosMatch[1].replace(/_/g, '.');
    return { os: 'iOS', osVersion: ver };
  }

  // iPadOS
  if (/iPad/i.test(ua) || (/Macintosh/i.test(ua) && 'ontouchend' in (globalThis.document || {}))) {
    const match = ua.match(/Version\/(\d+\.\d+)/);
    return { os: 'iPadOS', osVersion: match?.[1] ?? 'unknown' };
  }

  // Android
  const androidMatch = ua.match(/Android (\d+\.?\d*\.?\d*)/i);
  if (androidMatch) {
    return { os: 'Android', osVersion: androidMatch[1] };
  }

  // Windows
  const winMatch = ua.match(/Windows NT (\d+\.\d+)/);
  if (winMatch) {
    const ver = winMatch[1];
    const map: Record<string, string> = { '10.0': '10/11', '6.3': '8.1', '6.2': '8', '6.1': '7' };
    return { os: 'Windows', osVersion: map[ver] ?? ver };
  }

  // macOS
  const macMatch = ua.match(/Mac OS X (\d+[_\.]\d+[_\.]?\d*)/);
  if (macMatch) {
    return { os: 'macOS', osVersion: macMatch[1].replace(/_/g, '.') };
  }

  // Linux
  if (/Linux/i.test(ua)) {
    return { os: 'Linux', osVersion: '' };
  }

  return { os: 'unknown', osVersion: '' };
}

function parseBrowser(ua: string): { browser: string; browserVersion: string } {
  // Edge
  const edgeMatch = ua.match(/Edg\/(\d+\.\d+)/);
  if (edgeMatch) return { browser: 'Edge', browserVersion: edgeMatch[1] };

  // Chrome
  const chromeMatch = ua.match(/Chrome\/(\d+\.\d+)/);
  if (chromeMatch && !/Edg/.test(ua)) return { browser: 'Chrome', browserVersion: chromeMatch[1] };

  // Safari
  const safariMatch = ua.match(/Version\/(\d+\.\d+).*Safari/);
  if (safariMatch) return { browser: 'Safari', browserVersion: safariMatch[1] };

  // Firefox
  const ffMatch = ua.match(/Firefox\/(\d+\.\d+)/);
  if (ffMatch) return { browser: 'Firefox', browserVersion: ffMatch[1] };

  // Samsung Internet
  const samsungMatch = ua.match(/SamsungBrowser\/(\d+\.\d+)/);
  if (samsungMatch) return { browser: 'Samsung Internet', browserVersion: samsungMatch[1] };

  return { browser: 'unknown', browserVersion: '' };
}

function parseDeviceModel(ua: string, screenW: number, screenH: number): { model: string; vendor: string } {
  // iPhone
  if (/iPhone/i.test(ua)) {
    const key = `${Math.min(screenW, screenH)}x${Math.max(screenW, screenH)}`;
    return { model: IPHONE_MODELS[key] ?? 'iPhone', vendor: 'Apple' };
  }

  // iPad
  if (/iPad/i.test(ua)) {
    return { model: 'iPad', vendor: 'Apple' };
  }

  // Samsung
  for (const [rx, name] of SAMSUNG_MODELS) {
    if (rx.test(ua)) return { model: name, vendor: 'Samsung' };
  }

  // Xiaomi
  for (const [rx, name] of XIAOMI_MODELS) {
    if (rx.test(ua)) return { model: name, vendor: 'Xiaomi' };
  }

  // Motorola
  for (const [rx, name] of MOTOROLA_MODELS) {
    if (rx.test(ua)) return { model: name, vendor: 'Motorola' };
  }

  // Huawei
  if (/HUAWEI|HarmonyOS/i.test(ua)) return { model: 'Huawei', vendor: 'Huawei' };

  // Generic Android — try to extract model from Build/
  const buildMatch = ua.match(/;\s*([^;)]+)\s*Build\//);
  if (buildMatch) return { model: buildMatch[1].trim(), vendor: 'Android' };

  // Desktop
  return { model: `Desktop`, vendor: '—' };
}

function getDeviceType(ua: string, screenW: number): 'mobile' | 'tablet' | 'desktop' | 'tv' | 'unknown' {
  if (/smart-tv|smarttv|googletv|appletv|hbbtv|netcast|viera|tizen|web0s|webos|tv/i.test(ua)) {
    return 'tv';
  }
  if (/iPad|Android(?!.*Mobile)/i.test(ua) || (screenW >= 600 && screenW < 1024 && 'ontouchend' in (globalThis.document || {}))) {
    return 'tablet';
  }
  if (/Mobile|iPhone|Android.*Mobile/i.test(ua) || screenW < 600) {
    return 'mobile';
  }
  if (screenW >= 1920 && /CrKey|AFT|TV/i.test(ua)) {
    return 'tv';
  }
  return screenW > 0 ? 'desktop' : 'unknown';
}

function getConnectionInfo(): { type: string; speed: string; effectiveType?: string; downlink?: number } {
  const nav = globalThis.navigator as Navigator & { connection?: { effectiveType?: string; downlink?: number; type?: string } };
  const conn = nav?.connection;
  if (!conn) return { type: 'unknown', speed: 'unknown' };

  const effectiveType = conn.effectiveType ?? 'unknown';
  const downlink = conn.downlink;

  let speed = 'medium';
  if (effectiveType === '4g' && (downlink ?? 10) > 5) speed = 'fast';
  else if (effectiveType === '3g' || (downlink ?? 10) < 1) speed = 'slow';
  else if (effectiveType === '2g') speed = 'slow';

  return {
    type: conn.type ?? effectiveType,
    speed,
    effectiveType,
    downlink,
  };
}

export function parseDevice(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      type: 'desktop', os: 'unknown', osVersion: '', browser: 'unknown', browserVersion: '',
      deviceModel: 'SSR', deviceVendor: '—', screenWidth: 0, screenHeight: 0, pixelRatio: 1,
      touchscreen: false, connectionType: 'unknown', connectionSpeed: 'unknown',
      isPWA: false, isCapacitor: false, serviceWorkerActive: false,
    };
  }

  const ua = navigator.userAgent;
  const screenW = window.screen.width;
  const screenH = window.screen.height;

  const { os, osVersion } = parseOS(ua);
  const { browser, browserVersion } = parseBrowser(ua);
  const { model, vendor } = parseDeviceModel(ua, screenW, screenH);
  const conn = getConnectionInfo();

  const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;

  return {
    type: getDeviceType(ua, screenW),
    os,
    osVersion,
    browser,
    browserVersion,
    deviceModel: model,
    deviceVendor: vendor,
    screenWidth: screenW,
    screenHeight: screenH,
    pixelRatio: window.devicePixelRatio ?? 1,
    touchscreen: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    connectionType: conn.type,
    connectionSpeed: conn.speed,
    effectiveType: conn.effectiveType,
    downlink: conn.downlink,
    isPWA,
    isCapacitor: !!(window as Window & { Capacitor?: unknown }).Capacitor,
    serviceWorkerActive: !!navigator.serviceWorker?.controller,
  };
}
