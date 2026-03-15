import { isMock } from '@/lib/env';
import { ServiceError, handleServiceError } from '@/lib/api/errors';
import type { Attendance } from '@/lib/types';

export interface QRCodeData {
  qrData: string;
  expiresAt: string;
}

export interface QRValidationResult {
  valid: boolean;
  attendance?: Attendance;
  error?: string;
}

export async function generateQR(classId: string, expiresInMinutes: number = 5): Promise<QRCodeData> {
  try {
    if (isMock()) {
      const { mockGenerateQR } = await import('@/lib/mocks/qrcode.mock');
      return mockGenerateQR(classId, expiresInMinutes);
    }
    const res = await fetch('/api/qr/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ classId, expiresInMinutes }),
    });
    if (!res.ok) throw new ServiceError(res.status, 'qrcode.generate');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'qrcode.generate');
  }
}

export async function validateQR(qrData: string, studentId: string): Promise<QRValidationResult> {
  try {
    if (isMock()) {
      const { mockValidateQR } = await import('@/lib/mocks/qrcode.mock');
      return mockValidateQR(qrData, studentId);
    }
    const res = await fetch('/api/qr/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qrData, studentId }),
    });
    if (!res.ok) throw new ServiceError(res.status, 'qrcode.validate');
    return res.json();
  } catch (error) {
    handleServiceError(error, 'qrcode.validate');
  }
}
