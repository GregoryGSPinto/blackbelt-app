import { type NextRequest } from 'next/server';
import { jsonResponse, errorResponse, paginatedResponse } from '../helpers';

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get('X-API-Key');
  if (!apiKey) return errorResponse('Missing X-API-Key header', 401);

  const params = request.nextUrl.searchParams;
  const limit = Math.min(Number(params.get('limit') ?? 20), 100);
  const status = params.get('status');

  // In production, validate API key and query database
  // For now, return mock structure
  const students = [
    { id: 'st-1', name: 'João Silva', email: 'joao@email.com', belt: 'blue', status: 'active' },
    { id: 'st-2', name: 'Maria Santos', email: 'maria@email.com', belt: 'white', status: status ?? 'active' },
  ];

  return paginatedResponse(students, 2, limit, '/api/v1/students', null);
}

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('X-API-Key');
  if (!apiKey) return errorResponse('Missing X-API-Key header', 401);

  const body = await request.json();
  if (!body.name || !body.email) return errorResponse('name and email are required', 400);

  return jsonResponse({ data: { id: `st-${Date.now()}`, ...body, status: 'active', createdAt: new Date().toISOString() } }, 201);
}
