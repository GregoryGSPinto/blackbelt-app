import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

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
    const res = await fetch(`/api/white-label/config?academyId=${academyId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    handleServiceError(error, 'whiteLabel.getConfig');
  }
}

export async function updateWhiteLabelConfig(
  config: Partial<WhiteLabelConfig> & { academyId: string },
): Promise<void> {
  try {
    if (isMock()) {
      console.log('[MOCK] White-label config updated:', config);
      return;
    }
    const res = await fetch('/api/white-label/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (error) {
    handleServiceError(error, 'whiteLabel.updateConfig');
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
