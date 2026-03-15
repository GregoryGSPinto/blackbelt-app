import { type NextRequest } from 'next/server';
import { errorResponse, paginatedResponse } from '../helpers';

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get('X-API-Key');
  if (!apiKey) return errorResponse('Missing X-API-Key header', 401);

  const plans = [
    { id: 'plan-1', name: 'Mensal', price: 15000, currency: 'BRL', interval: 'monthly', active: true },
    { id: 'plan-2', name: 'Trimestral', price: 40000, currency: 'BRL', interval: 'quarterly', active: true },
    { id: 'plan-3', name: 'Anual', price: 144000, currency: 'BRL', interval: 'yearly', active: true },
  ];

  return paginatedResponse(plans, 3, 20, '/api/v1/plans', null);
}
