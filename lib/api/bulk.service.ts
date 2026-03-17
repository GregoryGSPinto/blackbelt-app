import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

// ── Types ─────────────────────────────────────────────────────

export interface BulkResult {
  success: number;
  failed: number;
  errors: string[];
}

export type AttendanceStatus = 'present' | 'absent' | 'justified';

// ── Bulk Operations ─────────────────────────────────────────

export async function bulkUpdateStudents(
  studentIds: string[],
  updates: Record<string, unknown>,
): Promise<BulkResult> {
  try {
    if (isMock()) {
      console.log(`[MOCK] Bulk update ${studentIds.length} students:`, updates);
      return { success: studentIds.length, failed: 0, errors: [] };
    }
    const res = await fetch('/api/students/bulk', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: studentIds, updates }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    handleServiceError(error, 'bulk.updateStudents');
  }
}

export async function bulkSendCommunication(
  studentIds: string[],
  message: string,
): Promise<BulkResult> {
  try {
    if (isMock()) {
      console.log(`[MOCK] Bulk send to ${studentIds.length} students: "${message.slice(0, 50)}..."`);
      return { success: studentIds.length, failed: 0, errors: [] };
    }
    const res = await fetch('/api/communications/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_ids: studentIds, message }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    handleServiceError(error, 'bulk.sendCommunication');
  }
}

export async function bulkMarkAttendance(
  classId: string,
  date: string,
  statuses: Record<string, AttendanceStatus>,
): Promise<BulkResult> {
  try {
    if (isMock()) {
      const count = Object.keys(statuses).length;
      console.log(`[MOCK] Bulk attendance for class ${classId} on ${date}: ${count} students`);
      return { success: count, failed: 0, errors: [] };
    }
    const res = await fetch('/api/attendance/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ class_id: classId, date, statuses }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    handleServiceError(error, 'bulk.markAttendance');
  }
}

export async function bulkPublishVideos(videoIds: string[]): Promise<BulkResult> {
  try {
    if (isMock()) {
      console.log(`[MOCK] Bulk publish ${videoIds.length} videos`);
      return { success: videoIds.length, failed: 0, errors: [] };
    }
    const res = await fetch('/api/videos/bulk/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: videoIds }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    handleServiceError(error, 'bulk.publishVideos');
  }
}

export async function bulkUnpublishVideos(videoIds: string[]): Promise<BulkResult> {
  try {
    if (isMock()) {
      console.log(`[MOCK] Bulk unpublish ${videoIds.length} videos`);
      return { success: videoIds.length, failed: 0, errors: [] };
    }
    const res = await fetch('/api/videos/bulk/unpublish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: videoIds }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (error) {
    handleServiceError(error, 'bulk.unpublishVideos');
  }
}
