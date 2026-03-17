import { type NextRequest } from 'next/server';
import { errorResponse, paginatedResponse } from '../helpers';
import { authenticateRequest } from '../auth-guard';

export async function GET(request: NextRequest) {
  const result = await authenticateRequest(request);
  if ('error' in result) return result.error;
  const { auth } = result;

  if (!['admin', 'gestor'].includes(auth.role)) {
    return errorResponse('Only admins can access invoice data.', 403);
  }

  const limit = Math.min(Number(request.nextUrl.searchParams.get('limit') ?? 20), 100);

  // In production: query invoices filtered by auth.academyId via subscription → student → academy
  const invoices = [
    { id: 'inv-1', studentId: 'st-1', amount: 15000, currency: 'BRL', status: 'paid', dueDate: '2025-07-10', paidAt: '2025-07-08T10:00:00Z', academyId: auth.academyId },
    { id: 'inv-2', studentId: 'st-2', amount: 15000, currency: 'BRL', status: 'pending', dueDate: '2025-07-15', paidAt: null, academyId: auth.academyId },
  ];

  return paginatedResponse(invoices, 2, limit, '/api/v1/invoices', null);
}
