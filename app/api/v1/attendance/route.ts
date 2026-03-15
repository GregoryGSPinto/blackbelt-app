import { type NextRequest } from 'next/server';
import { jsonResponse, errorResponse, paginatedResponse } from '../helpers';

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get('X-API-Key');
  if (!apiKey) return errorResponse('Missing X-API-Key header', 401);

  const limit = Math.min(Number(request.nextUrl.searchParams.get('limit') ?? 20), 100);

  const records = [
    { id: 'att-1', studentId: 'st-1', classId: 'cl-1', date: '2025-07-10', checkinAt: '2025-07-10T19:02:00Z' },
    { id: 'att-2', studentId: 'st-2', classId: 'cl-1', date: '2025-07-10', checkinAt: '2025-07-10T19:05:00Z' },
  ];

  return paginatedResponse(records, 2, limit, '/api/v1/attendance', null);
}

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('X-API-Key');
  if (!apiKey) return errorResponse('Missing X-API-Key header', 401);

  const body = await request.json();
  if (!body.studentId || !body.classId) return errorResponse('studentId and classId are required', 400);

  return jsonResponse({ data: { id: `att-${Date.now()}`, ...body, checkinAt: new Date().toISOString() } }, 201);
}
