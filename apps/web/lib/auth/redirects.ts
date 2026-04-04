import { isNative } from '@/lib/platform';
import { getPublicAppUrl } from '@/lib/config/legal';

function getWindowOrigin(): string | null {
  if (typeof window === 'undefined') return null;

  const origin = window.location.origin;
  if (!origin) return null;

  return origin.replace(/\/$/, '');
}

export function getAuthRedirectUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (isNative()) {
    return `${getPublicAppUrl()}${normalizedPath}`;
  }

  const origin = getWindowOrigin();
  return `${origin ?? getPublicAppUrl()}${normalizedPath}`;
}
