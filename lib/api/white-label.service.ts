import { isMock } from '@/lib/env';
import { logger } from '@/lib/monitoring/logger';
import { logServiceError } from '@/lib/api/errors';

// ── Types ─────────────────────────────────────────────────────

export interface WhiteLabelConfig {
  academyId: string;
  brandName: string;
  primaryColor: string;
  primaryColorDeep: string;
  primaryColorLight: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  customDomain: string | null;
  emailFromName: string;
  emailFromAddress: string;
  hidePoweredBy: boolean;
}

// ── Service ───────────────────────────────────────────────────

export async function getWhiteLabelConfig(academyId: string): Promise<WhiteLabelConfig> {
  try {
    if (isMock()) {
      return {
        academyId,
        brandName: 'Guerreiros BJJ',
        primaryColor: '#EF4444',
        primaryColorDeep: '#B91C1C',
        primaryColorLight: '#FCA5A5',
        logoUrl: null,
        faviconUrl: null,
        customDomain: null,
        emailFromName: 'Guerreiros BJJ',
        emailFromAddress: 'contato@guerreirosbjj.com',
        hidePoweredBy: false,
      };
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from('academy_settings')
        .select('value')
        .eq('academy_id', academyId)
        .eq('key', 'white_label')
        .single();
      if (error || !data) {
        logServiceError(error, 'white-label');
        return { academyId, brandName: '', primaryColor: '#EF4444', primaryColorDeep: '#B91C1C', primaryColorLight: '#FCA5A5', logoUrl: null, faviconUrl: null, customDomain: null, emailFromName: '', emailFromAddress: '', hidePoweredBy: false };
      }
      const value = (data.value as Record<string, unknown>) || {};
      return {
        academyId,
        brandName: (value.brandName as string) || '',
        primaryColor: (value.primaryColor as string) || '#EF4444',
        primaryColorDeep: (value.primaryColorDeep as string) || '#B91C1C',
        primaryColorLight: (value.primaryColorLight as string) || '#FCA5A5',
        logoUrl: (value.logoUrl as string) || null,
        faviconUrl: (value.faviconUrl as string) || null,
        customDomain: (value.customDomain as string) || null,
        emailFromName: (value.emailFromName as string) || '',
        emailFromAddress: (value.emailFromAddress as string) || '',
        hidePoweredBy: (value.hidePoweredBy as boolean) || false,
      };
    } catch (error) {
      logServiceError(error, 'white-label');
      return { academyId, brandName: '', primaryColor: '#EF4444', primaryColorDeep: '#B91C1C', primaryColorLight: '#FCA5A5', logoUrl: null, faviconUrl: null, customDomain: null, emailFromName: '', emailFromAddress: '', hidePoweredBy: false };
    }
  } catch (error) {
    logServiceError(error, 'white-label');
    return { academyId, brandName: '', primaryColor: '#EF4444', primaryColorDeep: '#B91C1C', primaryColorLight: '#FCA5A5', logoUrl: null, faviconUrl: null, customDomain: null, emailFromName: '', emailFromAddress: '', hidePoweredBy: false };
  }
}

export async function updateWhiteLabelConfig(
  config: Partial<WhiteLabelConfig> & { academyId: string },
): Promise<void> {
  try {
    if (isMock()) {
      logger.debug('[MOCK] White-label config updated', { config });
      return;
    }
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      const { error } = await supabase
        .from('academy_settings')
        .upsert({
          academy_id: config.academyId,
          key: 'white_label',
          value: config,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'academy_id,key' });
      if (error) {
        logServiceError(error, 'white-label');
      }
    } catch (error) {
      logServiceError(error, 'white-label');
    }
  } catch (error) {
    logServiceError(error, 'white-label');
  }
}

export function applyWhiteLabelTheme(config: WhiteLabelConfig): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.style.setProperty('--bb-brand', config.primaryColor);
  root.style.setProperty('--bb-brand-deep', config.primaryColorDeep);
  root.style.setProperty('--bb-brand-light', config.primaryColorLight);

  // Derived colors
  const hex = config.primaryColor;
  root.style.setProperty('--bb-brand-surface', `${hex}0F`);
  root.style.setProperty('--bb-brand-surface-hover', `${hex}1F`);
  root.style.setProperty('--bb-brand-glow', `0 0 40px ${hex}26`);
  root.style.setProperty('--bb-brand-gradient', `linear-gradient(135deg, ${hex} 0%, ${config.primaryColorDeep} 100%)`);
}
