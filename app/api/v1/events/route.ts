import { type NextRequest } from 'next/server';
import { paginatedResponse } from '../helpers';
import { authenticateRequest } from '../auth-guard';

export async function GET(request: NextRequest) {
  const result = await authenticateRequest(request);
  if ('error' in result) return result.error;
  const { auth } = result;

  // In production: query events filtered by auth.academyId
  const events = [
    { id: 'ev-1', name: 'Campeonato Interno BJJ', type: 'tournament', date: '2025-08-15', capacity: 60, enrolled: 42, academyId: auth.academyId },
    { id: 'ev-2', name: 'Seminário com Mestre', type: 'seminar', date: '2025-08-20', capacity: 40, enrolled: 35, academyId: auth.academyId },
  ];

  return paginatedResponse(events, 2, 20, '/api/v1/events', null);
}
