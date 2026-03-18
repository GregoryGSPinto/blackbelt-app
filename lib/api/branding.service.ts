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
    try {
      const res = await fetch(`/api/branding?academyId=${academyId}`);
      if (!res.ok) throw new ServiceError(res.status, 'branding.get');
      return res.json();
    } catch {
      console.warn('[branding.getBranding] API not available, using fallback');
      return { logoUrl: null, primaryColor: '', accentColor: '', academyName: '', customDomain: null, faviconUrl: null, loginBackground: null } as BrandingDTO;
    }
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
      console.warn('[branding.updateBranding] API not available, using fallback');
      return { logoUrl: null, primaryColor: '', accentColor: '', academyName: '', customDomain: null, faviconUrl: null, loginBackground: null } as BrandingDTO;
    }
  } catch (error) { handleServiceError(error, 'branding.update'); }
}
