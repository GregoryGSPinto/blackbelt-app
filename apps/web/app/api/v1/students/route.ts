import { type NextRequest } from 'next/server';
import { jsonResponse, errorResponse, paginatedResponse } from '../helpers';
import { authenticateRequest } from '../auth-guard';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const result = await authenticateRequest(request);
  if ('error' in result) return result.error;
  const { auth } = result;

  const params = request.nextUrl.searchParams;
  const limit = Math.min(Number(params.get('limit') ?? 20), 100);
  const status = params.get('status');

  // In production: query students filtered by auth.academyId
  const students = [
    { id: 'st-1', name: 'João Silva', email: 'joao@email.com', belt: 'blue', status: 'active', academyId: auth.academyId },
    { id: 'st-2', name: 'Maria Santos', email: 'maria@email.com', belt: 'white', status: status ?? 'active', academyId: auth.academyId },
  ];

  return paginatedResponse(students, 2, limit, '/api/v1/students', null);
}

export async function POST(request: NextRequest) {
  const result = await authenticateRequest(request);
  if ('error' in result) return result.error;
  const { auth } = result;

  if (!['admin', 'gestor'].includes(auth.role)) {
    return errorResponse('Only admins can create students.', 403);
  }

  const body = await request.json();
  if (!body.name || !body.email) return errorResponse('name and email are required', 400);

  return jsonResponse({ data: { id: `st-${Date.now()}`, ...body, academyId: auth.academyId, status: 'active', createdAt: new Date().toISOString() } }, 201);
}
