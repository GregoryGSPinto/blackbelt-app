import { isNative, isAndroid } from '@/lib/platform';

export async function configureStatusBar(darkMode: boolean): Promise<void> {
  if (!isNative()) return;

  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: darkMode ? Style.Dark : Style.Light });

    if (isAndroid()) {
      await StatusBar.setBackgroundColor({ color: darkMode ? '#0A0A0A' : '#FFFFFF' });
    }
  } catch {
    // Not available
  }
}

export async function hideStatusBar(): Promise<void> {
  if (!isNative()) return;
  try {
    const { StatusBar } = await import('@capacitor/status-bar');
    await StatusBar.hide();
  } catch { /* not available */ }
}

export async function showStatusBar(): Promise<void> {
  if (!isNative()) return;
  try {
    const { StatusBar } = await import('@capacitor/status-bar');
    await StatusBar.show();
  } catch { /* not available */ }
}
