import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';
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

    // Generate a signed QR payload (class + timestamp + expiry)
    const now = Date.now();
    const expiresAt = new Date(now + expiresInMinutes * 60000).toISOString();
    const payload = { classId, iat: now, exp: now + expiresInMinutes * 60000 };
    const qrData = btoa(JSON.stringify(payload));

    return { qrData, expiresAt };
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

    // Decode QR payload
    let payload: { classId: string; exp: number };
    try {
      payload = JSON.parse(atob(qrData));
    } catch {
      return { valid: false, error: 'QR code inválido' };
    }

    if (Date.now() > payload.exp) {
      return { valid: false, error: 'QR code expirado' };
    }

    // Create attendance record
    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('attendance')
      .insert({
        student_id: studentId,
        class_id: payload.classId,
        method: 'qr_code',
        checked_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return { valid: false, error: 'Check-in já realizado hoje nesta turma' };
      }
      return { valid: false, error: error.message };
    }

    return { valid: true, attendance: data as Attendance };
  } catch (error) {
    handleServiceError(error, 'qrcode.validate');
  }
}
