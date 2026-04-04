import { NextResponse } from 'next/server';
import { processAllAcademyTrialNotifications } from '@/lib/api/trial-notifications.service';

// Vercel Cron — runs daily at 09:00 BRT (12:00 UTC)
// Configure in vercel.json: { "crons": [{ "path": "/api/cron/trial-notifications", "schedule": "0 12 * * *" }] }

export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await processAllAcademyTrialNotifications();

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (err) {
    console.error('[cron/trial-notifications] Error:', err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
