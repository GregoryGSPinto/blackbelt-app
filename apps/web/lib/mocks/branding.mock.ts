import type { BrandingDTO } from '@/lib/api/branding.service';

const delay = () => new Promise((r) => setTimeout(r, 200));

let mockBranding: BrandingDTO = {
  logoUrl: null,
  primaryColor: '#C62828',
  accentColor: '#1565C0',
  academyName: 'Academia Demo',
  customDomain: null,
  faviconUrl: null,
  loginBackground: null,
};

export async function mockGetBranding(_academyId: string): Promise<BrandingDTO> {
  await delay();
  return { ...mockBranding };
}

export async function mockUpdateBranding(_academyId: string, data: Partial<BrandingDTO>): Promise<BrandingDTO> {
  await delay();
  mockBranding = { ...mockBranding, ...data };
  return { ...mockBranding };
}
