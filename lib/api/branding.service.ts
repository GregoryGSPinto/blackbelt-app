import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';

export interface BrandingDTO {
  logoUrl: string | null;
  primaryColor: string;
  accentColor: string;
  academyName: string;
  customDomain: string | null;
  faviconUrl: string | null;
  loginBackground: string | null;
}

export async function getBranding(academyId: string): Promise<BrandingDTO> {
  try {
    if (isMock()) {
      const { mockGetBranding } = await import('@/lib/mocks/branding.mock');
      return mockGetBranding(academyId);
    }
    // API not yet implemented — use mock
    const { mockGetBranding } = await import('@/lib/mocks/branding.mock');
      return mockGetBranding(academyId);
  } catch (error) { handleServiceError(error, 'branding.get'); }
}

export async function updateBranding(academyId: string, data: Partial<BrandingDTO>): Promise<BrandingDTO> {
  try {
    if (isMock()) {
      const { mockUpdateBranding } = await import('@/lib/mocks/branding.mock');
      return mockUpdateBranding(academyId, data);
    }
    try {
      const res = await fetch(`/api/branding`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ academyId, ...data }),
      });
      if (!res.ok) throw new ServiceError(res.status, 'branding.update');
      return res.json();
    } catch {
      console.warn('[branding.updateBranding] API not available, using mock fallback');
      const { mockUpdateBranding } = await import('@/lib/mocks/branding.mock');
      return mockUpdateBranding(academyId, data);
    }
  } catch (error) { handleServiceError(error, 'branding.update'); }
}
