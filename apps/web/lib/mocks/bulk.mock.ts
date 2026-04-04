// ============================================================
// BlackBelt v2 — Bulk Operations Mock
// ============================================================

import type { BulkResult, AttendanceStatus } from '@/lib/api/bulk.service';

function delay(ms = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function mockBulkUpdateStudents(
  ids: string[],
  _updates: Record<string, unknown>,
): Promise<BulkResult> {
  await delay();
  return {
    success: ids.length,
    failed: 0,
    errors: [],
  };
}

export async function mockBulkSendCommunication(
  studentIds: string[],
  _message: string,
): Promise<BulkResult> {
  await delay(600);
  const failed = studentIds.length > 5 ? 1 : 0;
  return {
    success: studentIds.length - failed,
    failed,
    errors: failed > 0 ? ['Falha ao enviar para aluno ID student-99 — email invalido'] : [],
  };
}

export async function mockBulkMarkAttendance(
  _classId: string,
  _date: string,
  statuses: Record<string, AttendanceStatus>,
): Promise<BulkResult> {
  await delay();
  const count = Object.keys(statuses).length;
  return {
    success: count,
    failed: 0,
    errors: [],
  };
}

export async function mockBulkPublishVideos(
  videoIds: string[],
): Promise<BulkResult> {
  await delay();
  return {
    success: videoIds.length,
    failed: 0,
    errors: [],
  };
}

export async function mockBulkUnpublishVideos(
  videoIds: string[],
): Promise<BulkResult> {
  await delay();
  return {
    success: videoIds.length,
    failed: 0,
    errors: [],
  };
}
