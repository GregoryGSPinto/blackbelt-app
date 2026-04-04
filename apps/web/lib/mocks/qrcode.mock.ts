import { AttendanceMethod } from '@/lib/types';
import type { Attendance } from '@/lib/types';
import type { QRCodeData, QRValidationResult } from '@/lib/api/qrcode.service';

const delay = () => new Promise((r) => setTimeout(r, 300));

export async function mockGenerateQR(classId: string, expiresInMinutes: number): Promise<QRCodeData> {
  await delay();
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString();
  const qrData = btoa(JSON.stringify({ classId, expiresAt, nonce: Math.random().toString(36) }));
  return { qrData, expiresAt };
}

export async function mockValidateQR(qrData: string, studentId: string): Promise<QRValidationResult> {
  await delay();
  try {
    const parsed = JSON.parse(atob(qrData));
    if (new Date(parsed.expiresAt) < new Date()) {
      return { valid: false, error: 'QR Code expirado' };
    }

    const attendance: Attendance = {
      id: `att-qr-${Date.now()}`,
      student_id: studentId,
      class_id: parsed.classId,
      checked_at: new Date().toISOString(),
      method: AttendanceMethod.QrCode,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return { valid: true, attendance };
  } catch {
    return { valid: false, error: 'QR Code inválido' };
  }
}
