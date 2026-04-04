import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  createSupportFeedbackComment,
  getPlatformCentralSnapshot,
  updateSupportFeedbackItem,
} from '@/lib/server/platform-central';

async function getSuperadminActor() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .eq('role', 'superadmin')
    .maybeSingle();

  if (!profile) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return {
    actor: {
      userId: user.id,
      profileId: profile.id as string,
    },
  };
}

export async function GET(request: NextRequest) {
  const auth = await getSuperadminActor();
  if ('error' in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const periodDays = Number(searchParams.get('periodDays') ?? '30');
  const normalizedPeriod = Number.isFinite(periodDays) ? Math.min(Math.max(periodDays, 7), 90) : 30;

  try {
    const snapshot = await getPlatformCentralSnapshot(normalizedPeriod);
    return NextResponse.json(snapshot);
  } catch (error) {
    console.error('[platform-central] GET failed', error);
    return NextResponse.json({ error: 'Failed to load platform central snapshot' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await getSuperadminActor();
  if ('error' in auth) return auth.error;

  try {
    const body = (await request.json()) as {
      itemId?: string;
      status?: 'new' | 'triaged' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed' | 'archived';
      severity?: 'low' | 'medium' | 'high' | 'critical';
      assignedProfileId?: string | null;
      tagSlugs?: string[];
    };

    if (!body.itemId) {
      return NextResponse.json({ error: 'itemId is required' }, { status: 400 });
    }

    const updated = await updateSupportFeedbackItem(
      body.itemId,
      {
        status: body.status,
        severity: body.severity,
        assignedProfileId: body.assignedProfileId === '__me__' ? auth.actor.profileId : body.assignedProfileId,
        tagSlugs: body.tagSlugs,
      },
      auth.actor,
    );

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[platform-central] PATCH failed', error);
    return NextResponse.json({ error: 'Failed to update support feedback item' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await getSuperadminActor();
  if ('error' in auth) return auth.error;

  try {
    const body = (await request.json()) as {
      itemId?: string;
      body?: string;
      isInternal?: boolean;
    };

    if (!body.itemId || !body.body?.trim()) {
      return NextResponse.json({ error: 'itemId and body are required' }, { status: 400 });
    }

    const comment = await createSupportFeedbackComment(
      body.itemId,
      body.body.trim(),
      body.isInternal ?? true,
      auth.actor,
    );

    return NextResponse.json(comment);
  } catch (error) {
    console.error('[platform-central] POST failed', error);
    return NextResponse.json({ error: 'Failed to create support feedback comment' }, { status: 500 });
  }
}
