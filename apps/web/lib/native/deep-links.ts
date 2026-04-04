import { isNative } from '@/lib/platform';

export function resolveDeepLinkPath(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);
    const pathFromHash = url.hash.startsWith('#/')
      ? url.hash.slice(1)
      : null;

    const pathFromHost = url.protocol !== 'http:' && url.protocol !== 'https:'
      ? `/${url.host}${url.pathname === '/' ? '' : url.pathname}`
      : url.pathname;

    const path = pathFromHash ?? pathFromHost;
    if (!path || path === '/') return null;

    const search = url.search ?? '';
    const hash = pathFromHash ? '' : (url.hash ?? '');

    return `${path}${search}${hash}`;
  } catch {
    return null;
  }
}

export function initDeepLinks(navigate: (path: string) => void): () => void {
  if (!isNative()) return () => {};

  let cleanup: (() => void) | undefined;

  import('@capacitor/app').then(({ App }) => {
    const handleNavigation = (rawUrl?: string | null) => {
      const resolvedPath = rawUrl ? resolveDeepLinkPath(rawUrl) : null;
      if (resolvedPath) {
        navigate(resolvedPath);
      }
    };

    App.getLaunchUrl().then((launchUrl) => {
      handleNavigation(launchUrl?.url);
    }).catch(() => {
      // Launch URL not available
    });

    App.addListener('appUrlOpen', (event) => {
      handleNavigation(event.url);
    });

    cleanup = () => {
      App.removeAllListeners();
    };
  }).catch(() => {
    // Not available
  });

  return () => {
    cleanup?.();
  };
}
