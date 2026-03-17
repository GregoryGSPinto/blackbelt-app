import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';
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
    const res = await fetch(`/api/auth/mfa/status?userId=${userId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    handleServiceError(error, 'mfa.status');
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
    const res = await fetch('/api/auth/mfa/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    handleServiceError(error, 'mfa.setup');
  }
}

export async function verifyMFA(userId: string, code: string): Promise<{ valid: boolean }> {
  try {
    if (isMock()) {
      const valid = code === '123456' || code.length === 6;
      logger.debug('[MOCK] MFA verify', { userId, valid });
      return { valid };
    }
    const res = await fetch('/api/auth/mfa/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, code }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    handleServiceError(error, 'mfa.verify');
  }
}

export async function disableMFA(userId: string, code: string): Promise<{ success: boolean }> {
  try {
    if (isMock()) {
      logger.debug('[MOCK] MFA disabled for user', { userId });
      return { success: true };
    }
    const res = await fetch('/api/auth/mfa/disable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, code }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    handleServiceError(error, 'mfa.disable');
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
    const res = await fetch('/api/auth/mfa/backup-codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    handleServiceError(error, 'mfa.regenerateBackupCodes');
  }
}
