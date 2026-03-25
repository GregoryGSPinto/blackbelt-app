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
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      // Look up class name
      const { data: cls } = await supabase
        .from('classes')
        .select('name')
        .eq('id', classId)
        .single();

      const today = new Date().toISOString().slice(0, 10);
      const code = `bb_${classId}_${today}_${Math.random().toString(36).slice(2, 8)}`;
      const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

      // Store the QR code in academy_settings JSONB under active_qr_codes
      // First get the academy_id via the class
      const { data: classInfo } = await supabase
        .from('classes')
        .select('academy_id')
        .eq('id', classId)
        .single();

      if (classInfo?.academy_id) {
        const { data: settings } = await supabase
          .from('academy_settings')
          .select('settings')
          .eq('academy_id', classInfo.academy_id)
          .single();

        const currentSettings = (settings?.settings as Record<string, unknown>) ?? {};
        const activeQR = (currentSettings.active_qr_codes as Array<{ code: string; classId: string; expiresAt: string }>) ?? [];
        // Remove expired codes and add the new one
        const now = new Date().toISOString();
        const filtered = activeQR.filter((q: { expiresAt: string }) => q.expiresAt > now);
        filtered.push({ code, classId, expiresAt });

        await supabase
          .from('academy_settings')
          .upsert(
            { academy_id: classInfo.academy_id, settings: { ...currentSettings, active_qr_codes: filtered } },
            { onConflict: 'academy_id' }
          );
      }

      const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(code)}`;
      return {
        classId,
        className: cls?.name ?? '',
        date: today,
        code,
        expiresAt,
        qrDataUrl,
      };
    } catch (err) {
      console.error('[qr-checkin.generateQRCode] error, using fallback:', err);
      return { classId, className: '', date: '', code: '', expiresAt: '', qrDataUrl: '' };
    }
  } catch (error) {
    console.error('[generateQRCode] Fallback:', error);
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
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      // Parse classId from the code format: bb_{classId}_{date}_{random}
      if (!code.startsWith('bb_')) {
        return { valid: false, message: 'Código QR inválido.' };
      }
      const parts = code.split('_');
      const classId = parts[1] ?? '';
      if (!classId) {
        return { valid: false, message: 'Código QR inválido — turma não identificada.' };
      }

      // Verify the code exists in academy_settings and is not expired
      const { data: cls } = await supabase
        .from('classes')
        .select('name, academy_id')
        .eq('id', classId)
        .single();
      if (!cls) {
        return { valid: false, message: 'Turma não encontrada.' };
      }

      const { data: settings } = await supabase
        .from('academy_settings')
        .select('settings')
        .eq('academy_id', cls.academy_id)
        .single();

      const currentSettings = (settings?.settings as Record<string, unknown>) ?? {};
      const activeQR = (currentSettings.active_qr_codes as Array<{ code: string; classId: string; expiresAt: string }>) ?? [];
      const qrEntry = activeQR.find((q: { code: string }) => q.code === code);
      if (!qrEntry || new Date(qrEntry.expiresAt) < new Date()) {
        return { valid: false, message: 'Código QR expirado ou inválido.' };
      }

      // Get student name
      const { data: student } = await supabase
        .from('students')
        .select('profile:profiles!students_profile_id_fkey(display_name)')
        .eq('id', studentId)
        .single();

      // Insert attendance record
      const { error: attErr } = await supabase
        .from('attendance')
        .insert({
          student_id: studentId,
          class_id: classId,
          method: 'qr_code',
          checked_at: new Date().toISOString(),
        });
      if (attErr) {
        // Unique constraint violation = already checked in today
        if (attErr.code === '23505') {
          return { valid: false, message: 'Check-in já realizado para esta aula hoje.' };
        }
        console.error('[validateQRCode] insert error:', attErr.message);
        return { valid: false, message: 'Erro ao registrar presença.' };
      }

      const studentName = (student?.profile as { display_name: string } | null)?.display_name ?? 'Aluno';
      return {
        valid: true,
        message: 'Check-in realizado com sucesso!',
        studentName,
        className: cls.name ?? '',
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      console.error('[qr-checkin.validateQRCode] error, using fallback:', err);
      return { valid: false, message: 'Erro ao validar QR code' };
    }
  } catch (error) {
    console.error('[validateQRCode] Fallback:', error);
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
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();

      const { data: settings } = await supabase
        .from('academy_settings')
        .select('settings')
        .eq('academy_id', academyId)
        .single();

      const currentSettings = (settings?.settings as Record<string, unknown>) ?? {};
      const activeQR = (currentSettings.active_qr_codes as Array<{ code: string; classId: string; expiresAt: string }>) ?? [];

      // Filter out expired codes
      const now = new Date().toISOString();
      const validCodes = activeQR.filter((q: { expiresAt: string }) => q.expiresAt > now);

      // Resolve class names
      const classIds = validCodes.map((q: { classId: string }) => q.classId);
      const { data: classes } = await supabase
        .from('classes')
        .select('id, name')
        .in('id', classIds.length > 0 ? classIds : ['__none__']);

      const classMap: Record<string, string> = {};
      for (const c of (classes ?? []) as Array<{ id: string; name: string }>) {
        classMap[c.id] = c.name;
      }

      return validCodes.map((q: { code: string; classId: string; expiresAt: string }) => ({
        classId: q.classId,
        className: classMap[q.classId] ?? '',
        date: new Date().toISOString().slice(0, 10),
        code: q.code,
        expiresAt: q.expiresAt,
        qrDataUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(q.code)}`,
      }));
    } catch (err) {
      console.error('[qr-checkin.getActiveQRCodes] error, using fallback:', err);
      return [];
    }
  } catch (error) {
    console.error('[getActiveQRCodes] Fallback:', error);
    return [];
  }
}
