// ============================================================
// BlackBelt v2 — Bulk Operations Service
// Batch actions for students, attendance, communications, videos
// ============================================================

import { isMock } from '@/lib/env';
import { logServiceError } from '@/lib/api/errors';

// ── Types ──────────────────────────────────────────────────────────

export interface BulkResult {
  success: number;
  failed: number;
  errors: string[];
}

export type AttendanceStatus = 'present' | 'absent' | 'justified';

// ── Bulk Update Students ───────────────────────────────────────────

export async function bulkUpdateStudents(
  studentIds: string[],
  updates: Record<string, unknown>,
): Promise<BulkResult> {
  try {
    if (isMock()) {
      const { mockBulkUpdateStudents } = await import('@/lib/mocks/bulk.mock');
      return mockBulkUpdateStudents(studentIds, updates);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const id of studentIds) {
      const { error } = await supabase
        .from('students')
        .update(updates)
        .eq('id', id);
      if (error) {
        failed++;
        errors.push(`Student ${id}: ${error.message}`);
      } else {
        success++;
      }
    }

    return { success, failed, errors };
  } catch (error) {
    logServiceError(error, 'bulk');
    return { success: 0, failed: studentIds.length, errors: ['Bulk update failed'] };
  }
}

// ── Bulk Send Communication ────────────────────────────────────────

export async function bulkSendCommunication(
  studentIds: string[],
  message: string,
): Promise<BulkResult> {
  try {
    if (isMock()) {
      const { mockBulkSendCommunication } = await import('@/lib/mocks/bulk.mock');
      return mockBulkSendCommunication(studentIds, message);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const rows = studentIds.map((sid) => ({
      student_id: sid,
      message,
      type: 'bulk',
      sent_at: new Date().toISOString(),
    }));

    const { error, count } = await supabase
      .from('communications')
      .insert(rows);

    if (error) {
      logServiceError(error, 'bulk');
      return { success: 0, failed: studentIds.length, errors: [error.message] };
    }

    return { success: count ?? studentIds.length, failed: 0, errors: [] };
  } catch (error) {
    logServiceError(error, 'bulk');
    return { success: 0, failed: studentIds.length, errors: ['Bulk communication failed'] };
  }
}

// ── Bulk Mark Attendance ───────────────────────────────────────────

export async function bulkMarkAttendance(
  classId: string,
  date: string,
  statuses: Record<string, AttendanceStatus>,
): Promise<BulkResult> {
  try {
    if (isMock()) {
      const { mockBulkMarkAttendance } = await import('@/lib/mocks/bulk.mock');
      return mockBulkMarkAttendance(classId, date, statuses);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const [studentId, status] of Object.entries(statuses)) {
      const { error } = await supabase
        .from('attendance')
        .upsert({
          class_id: classId,
          student_id: studentId,
          date,
          status,
          checked_in_at: status === 'present' ? new Date().toISOString() : null,
        }, { onConflict: 'class_id,student_id,date' });

      if (error) {
        failed++;
        errors.push(`Student ${studentId}: ${error.message}`);
      } else {
        success++;
      }
    }

    return { success, failed, errors };
  } catch (error) {
    logServiceError(error, 'bulk');
    return { success: 0, failed: Object.keys(statuses).length, errors: ['Bulk attendance failed'] };
  }
}

// ── Bulk Publish Videos ────────────────────────────────────────────

export async function bulkPublishVideos(videoIds: string[]): Promise<BulkResult> {
  try {
    if (isMock()) {
      const { mockBulkPublishVideos } = await import('@/lib/mocks/bulk.mock');
      return mockBulkPublishVideos(videoIds);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error, count } = await supabase
      .from('videos')
      .update({ published: true })
      .in('id', videoIds);

    if (error) {
      logServiceError(error, 'bulk');
      return { success: 0, failed: videoIds.length, errors: [error.message] };
    }

    return { success: count ?? videoIds.length, failed: 0, errors: [] };
  } catch (error) {
    logServiceError(error, 'bulk');
    return { success: 0, failed: videoIds.length, errors: ['Bulk publish failed'] };
  }
}

// ── Bulk Unpublish Videos ──────────────────────────────────────────

export async function bulkUnpublishVideos(videoIds: string[]): Promise<BulkResult> {
  try {
    if (isMock()) {
      const { mockBulkUnpublishVideos } = await import('@/lib/mocks/bulk.mock');
      return mockBulkUnpublishVideos(videoIds);
    }

    const { createBrowserClient } = await import('@/lib/supabase/client');
    const supabase = createBrowserClient();

    const { error, count } = await supabase
      .from('videos')
      .update({ published: false })
      .in('id', videoIds);

    if (error) {
      logServiceError(error, 'bulk');
      return { success: 0, failed: videoIds.length, errors: [error.message] };
    }

    return { success: count ?? videoIds.length, failed: 0, errors: [] };
  } catch (error) {
    logServiceError(error, 'bulk');
    return { success: 0, failed: videoIds.length, errors: ['Bulk unpublish failed'] };
  }
}
