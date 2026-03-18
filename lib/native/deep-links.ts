import { isNative } from '@/lib/platform';

export function initDeepLinks(navigate: (path: string) => void): () => void {
  if (!isNative()) return () => {};

  let cleanup: (() => void) | undefined;

  import('@capacitor/app').then(({ App }) => {
    App.addListener('appUrlOpen', (event) => {
      try {
        const url = new URL(event.url);
        const path = url.pathname;
        if (path && path !== '/') {
          navigate(path);
        }
      } catch {
        // Invalid URL
      }
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
