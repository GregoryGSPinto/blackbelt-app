import { NextResponse } from 'next/server';
import { isMock } from '@/lib/env';

export async function GET() {
  const mockValue = process.env.NEXT_PUBLIC_USE_MOCK;
  const isMockResult = isMock();

  // Test mock import
  let mockImportResult = 'not tested';
  let mockDataResult = 'not tested';
  try {
    const { mockGetDashboardData } = await import('@/lib/mocks/admin-dashboard.mock');
    mockImportResult = 'success';
    const data = mockGetDashboardData('academy-1');
    mockDataResult = data ? `ok (${data.greeting.academy_name})` : 'returned null';
  } catch (err) {
    mockImportResult = `error: ${err instanceof Error ? err.message : String(err)}`;
  }

  return NextResponse.json({
    NEXT_PUBLIC_USE_MOCK: mockValue ?? 'undefined',
    isMock: isMockResult,
    mockImport: mockImportResult,
    mockData: mockDataResult,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
}
