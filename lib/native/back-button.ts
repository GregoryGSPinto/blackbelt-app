import { isNative, isAndroid } from '@/lib/platform';

/**
 * Registers the Android hardware back button handler.
 * - If the webview can go back, navigates history.
 * - On root screen, does nothing (avoids accidental app exit).
 */
export function initBackButton(): () => void {
  if (!isNative() || !isAndroid()) return () => {};

  let cleanup: (() => void) | undefined;

  import('@capacitor/app').then(({ App }) => {
    App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      }
      // On root screen, do nothing — prevent accidental exit
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
