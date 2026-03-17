import { type NextRequest } from 'next/server';
import { jsonResponse, errorResponse, paginatedResponse } from '../helpers';
import { authenticateRequest } from '../auth-guard';

export async function GET(request: NextRequest) {
  const result = await authenticateRequest(request);
  if ('error' in result) return result.error;
  const { auth } = result;

  const limit = Math.min(Number(request.nextUrl.searchParams.get('limit') ?? 20), 100);

  // In production: query attendance filtered by auth.academyId
  const records = [
    { id: 'att-1', studentId: 'st-1', classId: 'cl-1', date: '2025-07-10', checkinAt: '2025-07-10T19:02:00Z', academyId: auth.academyId },
    { id: 'att-2', studentId: 'st-2', classId: 'cl-1', date: '2025-07-10', checkinAt: '2025-07-10T19:05:00Z', academyId: auth.academyId },
  ];

  return paginatedResponse(records, 2, limit, '/api/v1/attendance', null);
}

export async function POST(request: NextRequest) {
  const result = await authenticateRequest(request);
  if ('error' in result) return result.error;
  const { auth } = result;

  if (!['admin', 'professor'].includes(auth.role)) {
    return errorResponse('Only admins and professors can record attendance.', 403);
  }

  const body = await request.json();
  if (!body.studentId || !body.classId) return errorResponse('studentId and classId are required', 400);

  return jsonResponse({ data: { id: `att-${Date.now()}`, ...body, academyId: auth.academyId, checkinAt: new Date().toISOString() } }, 201);
}
