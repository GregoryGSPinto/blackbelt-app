import { type NextRequest } from 'next/server';
import { paginatedResponse } from '../helpers';
import { authenticateRequest } from '../auth-guard';

export async function GET(request: NextRequest) {
  const result = await authenticateRequest(request);
  if ('error' in result) return result.error;
  const { auth } = result;

  // In production: query plans filtered by auth.academyId
  const plans = [
    { id: 'plan-1', name: 'Mensal', price: 15000, currency: 'BRL', interval: 'monthly', active: true, academyId: auth.academyId },
    { id: 'plan-2', name: 'Trimestral', price: 40000, currency: 'BRL', interval: 'quarterly', active: true, academyId: auth.academyId },
    { id: 'plan-3', name: 'Anual', price: 144000, currency: 'BRL', interval: 'yearly', active: true, academyId: auth.academyId },
  ];

  return paginatedResponse(plans, 3, 20, '/api/v1/plans', null);
}
