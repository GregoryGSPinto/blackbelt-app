import { isNative } from '@/lib/platform';

const BASE_URL = 'https://blackbeltv2.vercel.app';

export async function openSubscriptionPage(): Promise<void> {
  if (isNative()) {
    try {
      const { Browser } = await import('@capacitor/browser');
      await Browser.open({ url: `${BASE_URL}/precos` });
    } catch {
      window.open(`${BASE_URL}/precos`, '_blank');
    }
  } else {
    window.location.href = '/precos';
  }
}

export async function openManagePlan(): Promise<void> {
  if (isNative()) {
    try {
      const { Browser } = await import('@capacitor/browser');
      await Browser.open({ url: `${BASE_URL}/admin/plano` });
    } catch {
      window.open(`${BASE_URL}/admin/plano`, '_blank');
    }
  } else {
    window.location.href = '/admin/plano';
  }
}

export async function openExternalUrl(url: string): Promise<void> {
  if (isNative()) {
    try {
      const { Browser } = await import('@capacitor/browser');
      await Browser.open({ url });
    } catch {
      window.open(url, '_blank');
    }
  } else {
    window.open(url, '_blank');
  }
}
