import { type NextRequest } from 'next/server';
import { errorResponse, paginatedResponse } from '../helpers';

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get('X-API-Key');
  if (!apiKey) return errorResponse('Missing X-API-Key header', 401);

  const limit = Math.min(Number(request.nextUrl.searchParams.get('limit') ?? 20), 100);

  const invoices = [
    { id: 'inv-1', studentId: 'st-1', amount: 15000, currency: 'BRL', status: 'paid', dueDate: '2025-07-10', paidAt: '2025-07-08T10:00:00Z' },
    { id: 'inv-2', studentId: 'st-2', amount: 15000, currency: 'BRL', status: 'pending', dueDate: '2025-07-15', paidAt: null },
  ];

  return paginatedResponse(invoices, 2, limit, '/api/v1/invoices', null);
}
