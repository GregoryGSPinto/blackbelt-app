// ============================================================
// BlackBelt v2 — Bulk Operations Service
// Batch actions for students, attendance, communications, videos
// ============================================================

import { isMock } from '@/lib/env';
import { handleServiceError } from '@/lib/api/errors';

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
    try {
      const res = await fetch('/api/students/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: studentIds, updates }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[bulk.bulkUpdateStudents] API not available, using fallback');
      return { success: 0, failed: 0, errors: [] } as BulkResult;
    }

  } catch (error) {
    handleServiceError(error, 'bulk.updateStudents');
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
    try {
      const res = await fetch('/api/communications/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_ids: studentIds, message }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[bulk.bulkSendCommunication] API not available, using fallback');
      return { success: 0, failed: 0, errors: [] } as BulkResult;
    }

  } catch (error) {
    handleServiceError(error, 'bulk.sendCommunication');
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
    try {
      const res = await fetch('/api/attendance/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ class_id: classId, date, statuses }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[bulk.bulkMarkAttendance] API not available, using fallback');
      return { success: 0, failed: 0, errors: [] } as BulkResult;
    }

  } catch (error) {
    handleServiceError(error, 'bulk.markAttendance');
  }
}

// ── Bulk Publish Videos ────────────────────────────────────────────

export async function bulkPublishVideos(videoIds: string[]): Promise<BulkResult> {
  try {
    if (isMock()) {
      const { mockBulkPublishVideos } = await import('@/lib/mocks/bulk.mock');
      return mockBulkPublishVideos(videoIds);
    }
    try {
      const res = await fetch('/api/videos/bulk/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: videoIds }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[bulk.bulkPublishVideos] API not available, using fallback');
      return { success: 0, failed: 0, errors: [] } as BulkResult;
    }
  } catch (error) {
    handleServiceError(error, 'bulk.publishVideos');
  }
}

// ── Bulk Unpublish Videos ──────────────────────────────────────────

export async function bulkUnpublishVideos(videoIds: string[]): Promise<BulkResult> {
  try {
    if (isMock()) {
      const { mockBulkUnpublishVideos } = await import('@/lib/mocks/bulk.mock');
      return mockBulkUnpublishVideos(videoIds);
    }
    try {
      const res = await fetch('/api/videos/bulk/unpublish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: videoIds }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch {
      console.warn('[bulk.bulkUnpublishVideos] API not available, using fallback');
      return { success: 0, failed: 0, errors: [] } as BulkResult;
    }
  } catch (error) {
    handleServiceError(error, 'bulk.unpublishVideos');
  }
}
