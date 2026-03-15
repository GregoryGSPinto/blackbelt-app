import { type NextRequest } from 'next/server';
import { errorResponse, paginatedResponse } from '../helpers';

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get('X-API-Key');
  if (!apiKey) return errorResponse('Missing X-API-Key header', 401);

  const events = [
    { id: 'ev-1', name: 'Campeonato Interno BJJ', type: 'tournament', date: '2025-08-15', capacity: 60, enrolled: 42 },
    { id: 'ev-2', name: 'Seminário com Mestre', type: 'seminar', date: '2025-08-20', capacity: 40, enrolled: 35 },
  ];

  return paginatedResponse(events, 2, 20, '/api/v1/events', null);
}
