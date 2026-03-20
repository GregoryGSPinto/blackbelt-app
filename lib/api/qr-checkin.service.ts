import { isMock } from '@/lib/env';
import { logger } from '@/lib/monitoring/logger';

// ── Types ─────────────────────────────────────────────────────

export interface QRCheckInCode {
  classId: string;
  className: string;
  date: string;
  code: string;
  expiresAt: string;
  qrDataUrl: string;
}

export interface QRValidationResult {
  valid: boolean;
  message: string;
  studentName?: string;
  className?: string;
  timestamp?: string;
}

// ── Service ───────────────────────────────────────────────────

export async function generateQRCode(classId: string): Promise<QRCheckInCode> {
  try {
    if (isMock()) {
      const today = new Date().toISOString().slice(0, 10);
      const code = `bb_${classId}_${today}_${Math.random().toString(36).slice(2, 8)}`;
      return {
        classId,
        className: 'BJJ Fundamentos',
        date: today,
        code,
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        qrDataUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(code)}`,
      };
    }
    try {
      const res = await fetch('/api/checkin/qr/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId }),
      });
      if (!res.ok) {
        console.warn('[generateQRCode] error:', `HTTP ${res.status}`);
        return { classId, className: '', date: '', code: '', expiresAt: '', qrDataUrl: '' };
      }
      return res.json();
    } catch {
      console.warn('[qr-checkin.generateQRCode] API not available, using fallback');
      return { classId, className: '', date: '', code: '', expiresAt: '', qrDataUrl: '' };
    }
  } catch (error) {
    console.warn('[generateQRCode] Fallback:', error);
    return { classId, className: '', date: '', code: '', expiresAt: '', qrDataUrl: '' };
  }
}

export async function validateQRCode(
  code: string,
  studentId: string,
): Promise<QRValidationResult> {
  try {
    if (isMock()) {
      logger.debug('[MOCK] QR Check-in scanned', { studentId, code });
      if (!code.startsWith('bb_')) {
        return { valid: false, message: 'Código QR inválido.' };
      }
      return {
        valid: true,
        message: 'Check-in realizado com sucesso!',
        studentName: 'Aluno Mock',
        className: 'BJJ Fundamentos',
        timestamp: new Date().toISOString(),
      };
    }
    try {
      const res = await fetch('/api/checkin/qr/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, studentId }),
      });
      if (!res.ok) {
        console.warn('[validateQRCode] error:', `HTTP ${res.status}`);
        return { valid: false, message: 'Erro ao validar QR code' };
      }
      return res.json();
    } catch {
      console.warn('[qr-checkin.validateQRCode] API not available, using fallback');
      return { valid: false, message: 'Erro ao validar QR code' };
    }
  } catch (error) {
    console.warn('[validateQRCode] Fallback:', error);
    return { valid: false, message: 'Erro ao validar QR code' };
  }
}

export async function getActiveQRCodes(academyId: string): Promise<QRCheckInCode[]> {
  try {
    if (isMock()) {
      const today = new Date().toISOString().slice(0, 10);
      return [
        {
          classId: 'class-1',
          className: 'BJJ Fundamentos',
          date: today,
          code: `bb_class-1_${today}_abc123`,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          qrDataUrl: '',
        },
        {
          classId: 'class-2',
          className: 'Muay Thai',
          date: today,
          code: `bb_class-2_${today}_def456`,
          expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          qrDataUrl: '',
        },
      ];
    }
    try {
      const res = await fetch(`/api/checkin/qr/active?academyId=${academyId}`);
      if (!res.ok) {
        console.warn('[getActiveQRCodes] error:', `HTTP ${res.status}`);
        return [];
      }
      return res.json();
    } catch {
      console.warn('[qr-checkin.getActiveQRCodes] API not available, using fallback');
      return [];
    }
  } catch (error) {
    console.warn('[getActiveQRCodes] Fallback:', error);
    return [];
  }
}
