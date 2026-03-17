import { type NextRequest } from 'next/server';
import { paginatedResponse } from '../helpers';
import { authenticateRequest } from '../auth-guard';

export async function GET(request: NextRequest) {
  const result = await authenticateRequest(request);
  if ('error' in result) return result.error;
  const { auth } = result;

  const limit = Math.min(Number(request.nextUrl.searchParams.get('limit') ?? 20), 100);

  // In production: query classes filtered by auth.academyId
  const classes = [
    { id: 'cl-1', name: 'BJJ Fundamental', modality: 'bjj', schedule: 'Seg/Qua/Sex 19:00', capacity: 25, enrolled: 18, academyId: auth.academyId },
    { id: 'cl-2', name: 'Muay Thai', modality: 'muay_thai', schedule: 'Ter/Qui 20:00', capacity: 20, enrolled: 15, academyId: auth.academyId },
  ];

  return paginatedResponse(classes, 2, limit, '/api/v1/classes', null);
}
