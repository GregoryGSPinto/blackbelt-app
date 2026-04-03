const DEFAULT_SITE_URL = 'https://blackbeltv2.vercel.app';
const DEFAULT_APP_URL = 'https://blackbeltv2.vercel.app';
const DEFAULT_API_URL = 'https://blackbeltv2.vercel.app';

function trimUrl(value: string | undefined, fallback: string): string {
  const normalized = value?.trim();
  if (!normalized) return fallback;
  return normalized.replace(/\/$/, '');
}

export function getSiteUrl(): string {
  return trimUrl(process.env.NEXT_PUBLIC_SITE_URL, DEFAULT_SITE_URL);
}

export function getAppUrl(): string {
  return trimUrl(process.env.NEXT_PUBLIC_APP_URL, DEFAULT_APP_URL);
}

export function getApiUrl(): string {
  return trimUrl(process.env.NEXT_PUBLIC_API_URL, DEFAULT_API_URL);
}

export function getMarketingRedirect(path = ''): string {
  return `${getSiteUrl()}${path.startsWith('/') ? path : `/${path}`}`;
}
