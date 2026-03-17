import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

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

    const res = await fetch('/api/checkin/qr/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ classId }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    handleServiceError(error, 'qrCheckin.generate');
  }
}

export async function validateQRCode(
  code: string,
  studentId: string,
): Promise<QRValidationResult> {
  try {
    if (isMock()) {
      console.log(`[MOCK] QR Check-in: student ${studentId} scanned ${code}`);
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

    const res = await fetch('/api/checkin/qr/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, studentId }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    handleServiceError(error, 'qrCheckin.validate');
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

    const res = await fetch(`/api/checkin/qr/active?academyId=${academyId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    handleServiceError(error, 'qrCheckin.getActive');
  }
}
