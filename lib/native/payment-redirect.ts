import { isNative } from '@/lib/platform';
import { getAppUrl } from '@/lib/config/domains';

const BASE_URL = getAppUrl();

export async function openSubscriptionPage(): Promise<void> {
  if (isNative()) {
    try {
      const { Browser } = await import('@capacitor/browser');
      await Browser.open({ url: `${BASE_URL}/cadastrar-academia` });
    } catch {
      window.open(`${BASE_URL}/cadastrar-academia`, '_blank');
    }
  } else {
    window.location.href = '/cadastrar-academia';
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
