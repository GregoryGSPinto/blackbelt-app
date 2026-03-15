import { type NextRequest } from 'next/server';
import { errorResponse, paginatedResponse } from '../helpers';

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get('X-API-Key');
  if (!apiKey) return errorResponse('Missing X-API-Key header', 401);

  const limit = Math.min(Number(request.nextUrl.searchParams.get('limit') ?? 20), 100);

  const classes = [
    { id: 'cl-1', name: 'BJJ Fundamental', modality: 'bjj', schedule: 'Seg/Qua/Sex 19:00', capacity: 25, enrolled: 18 },
    { id: 'cl-2', name: 'Muay Thai', modality: 'muay_thai', schedule: 'Ter/Qui 20:00', capacity: 20, enrolled: 15 },
  ];

  return paginatedResponse(classes, 2, limit, '/api/v1/classes', null);
}
