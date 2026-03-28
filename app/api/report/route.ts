import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reporterId, academyId, reportedUserId, contentType, contentId, reason, description } = body;

    if (!reporterId || !reason || !contentType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { data, error } = await supabase.from('content_reports').insert({
      academy_id: academyId || null,
      reporter_id: reporterId,
      reported_user_id: reportedUserId || null,
      content_type: contentType,
      content_id: contentId || null,
      reason,
      description: description || null,
    }).select('id').single();

    if (error) {
      console.error('[report] Error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, reportId: data?.id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
