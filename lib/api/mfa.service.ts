import { isMock } from '@/lib/env';
import { logger } from '@/lib/monitoring/logger';

// ── Types ─────────────────────────────────────────────────────

export interface MFASetupData {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface MFAStatus {
  enabled: boolean;
  method: 'totp' | null;
  backupCodesRemaining: number;
  lastVerified: string | null;
}

// ── Service ───────────────────────────────────────────────────

export async function getMFAStatus(userId: string): Promise<MFAStatus> {
  try {
    if (isMock()) {
      return {
        enabled: false,
        method: null,
        backupCodesRemaining: 0,
        lastVerified: null,
      };
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('user_preferences')
      .select('mfa_enabled, mfa_methods, mfa_last_verified')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      console.error('[getMFAStatus] error:', error?.message ?? 'not found');
      return { enabled: false, method: null, backupCodesRemaining: 0, lastVerified: null };
    }

    const prefs = data as Record<string, unknown>;
    return {
      enabled: (prefs.mfa_enabled as boolean) ?? false,
      method: prefs.mfa_enabled ? 'totp' : null,
      backupCodesRemaining: 0,
      lastVerified: (prefs.mfa_last_verified as string) ?? null,
    };
  } catch (error) {
    console.error('[getMFAStatus] Fallback:', error);
    return { enabled: false, method: null, backupCodesRemaining: 0, lastVerified: null };
  }
}

export async function setupMFA(userId: string): Promise<MFASetupData> {
  try {
    if (isMock()) {
      logger.debug('[MOCK] MFA setup for user', { userId });
      return {
        secret: 'JBSWY3DPEHPK3PXP',
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/BlackBelt:${userId}?secret=JBSWY3DPEHPK3PXP&issuer=BlackBelt`,
        backupCodes: [
          'A1B2-C3D4', 'E5F6-G7H8', 'I9J0-K1L2', 'M3N4-O5P6', 'Q7R8-S9T0',
          'U1V2-W3X4', 'Y5Z6-A7B8', 'C9D0-E1F2', 'G3H4-I5J6', 'K7L8-M9N0',
        ],
      };
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Try Supabase MFA enrollment if available
    try {
      const { data: enrollData, error: enrollError } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
      if (!enrollError && enrollData) {
        return {
          secret: enrollData.totp.secret,
          qrCodeUrl: enrollData.totp.uri,
          backupCodes: [],
        };
      }
    } catch {
      // Supabase MFA not available, fallback
    }

    // Fallback: update user_preferences
    await supabase
      .from('user_preferences')
      .upsert({ user_id: userId, mfa_enabled: true }, { onConflict: 'user_id' });

    console.error('[setupMFA] Supabase MFA not available, using preference flag');
    return { secret: '', qrCodeUrl: '', backupCodes: [] };
  } catch (error) {
    console.error('[setupMFA] Fallback:', error);
    return { secret: '', qrCodeUrl: '', backupCodes: [] };
  }
}

export async function verifyMFA(userId: string, code: string): Promise<{ valid: boolean }> {
  try {
    if (isMock()) {
      const valid = code === '123456' || code.length === 6;
      logger.debug('[MOCK] MFA verify', { userId, valid });
      return { valid };
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Try Supabase MFA verification
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      if (factors && factors.totp && factors.totp.length > 0) {
        const factorId = factors.totp[0].id;
        const { data: challenge } = await supabase.auth.mfa.challenge({ factorId });
        if (challenge) {
          const { error: verifyError } = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.id, code });
          return { valid: !verifyError };
        }
      }
    } catch {
      // Supabase MFA not available
    }

    console.error('[verifyMFA] Supabase MFA not available, verification not possible');
    return { valid: false };
  } catch (error) {
    console.error('[verifyMFA] Fallback:', error);
    return { valid: false };
  }
}

export async function disableMFA(userId: string, _code: string): Promise<{ success: boolean }> {
  try {
    if (isMock()) {
      logger.debug('[MOCK] MFA disabled for user', { userId });
      return { success: true };
    }
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    // Try Supabase MFA unenroll
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      if (factors && factors.totp && factors.totp.length > 0) {
        const { error } = await supabase.auth.mfa.unenroll({ factorId: factors.totp[0].id });
        if (!error) return { success: true };
      }
    } catch {
      // Supabase MFA not available
    }

    // Fallback: update user_preferences
    const { error } = await supabase
      .from('user_preferences')
      .upsert({ user_id: userId, mfa_enabled: false }, { onConflict: 'user_id' });

    if (error) {
      console.error('[disableMFA] error:', error.message);
      return { success: false };
    }
    return { success: true };
  } catch (error) {
    console.error('[disableMFA] Fallback:', error);
    return { success: false };
  }
}

export async function regenerateBackupCodes(userId: string): Promise<{ codes: string[] }> {
  try {
    if (isMock()) {
      return {
        codes: [
          'X1Y2-Z3A4', 'B5C6-D7E8', 'F9G0-H1I2', 'J3K4-L5M6', 'N7O8-P9Q0',
          'R1S2-T3U4', 'V5W6-X7Y8', 'Z9A0-B1C2', 'D3E4-F5G6', 'H7I8-J9K0',
        ],
      };
    }
    // Backup codes are not natively supported by Supabase MFA
    console.error('[regenerateBackupCodes] Backup codes not available for user:', userId);
    return { codes: [] };
  } catch (error) {
    console.error('[regenerateBackupCodes] Fallback:', error);
    return { codes: [] };
  }
}
