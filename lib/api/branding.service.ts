import { isMock } from '@/lib/env';

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
  const fallback: BrandingDTO = { logoUrl: null, primaryColor: '', accentColor: '', academyName: '', customDomain: null, faviconUrl: null, loginBackground: null };
  try {
    if (isMock()) {
      const { mockGetBranding } = await import('@/lib/mocks/branding.mock');
      return mockGetBranding(academyId);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('academy_branding')
      .select('*')
      .eq('academy_id', academyId)
      .single();
    if (error || !data) {
      console.error('[getBranding] Supabase error:', error?.message);
      return fallback;
    }
    return data as unknown as BrandingDTO;
  } catch (error) {
    console.error('[getBranding] Fallback:', error);
    return fallback;
  }
}

export async function updateBranding(academyId: string, data: Partial<BrandingDTO>): Promise<BrandingDTO> {
  const fallback: BrandingDTO = { logoUrl: null, primaryColor: '', accentColor: '', academyName: '', customDomain: null, faviconUrl: null, loginBackground: null };
  try {
    if (isMock()) {
      const { mockUpdateBranding } = await import('@/lib/mocks/branding.mock');
      return mockUpdateBranding(academyId, data);
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();
    const { data: row, error } = await supabase
      .from('academy_branding')
      .update(data)
      .eq('academy_id', academyId)
      .select()
      .single();
    if (error || !row) {
      console.error('[updateBranding] Supabase error:', error?.message);
      return fallback;
    }
    return row as unknown as BrandingDTO;
  } catch (error) {
    console.error('[updateBranding] Fallback:', error);
    return fallback;
  }
}
