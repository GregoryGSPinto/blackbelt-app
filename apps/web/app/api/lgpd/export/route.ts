import { NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';
import { logger } from '@/lib/monitoring/logger';

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const admin = createServiceRoleClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const requestedProfileId = typeof body.profile_id === 'string' ? body.profile_id : null;

    let profileQuery = admin
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);

    if (requestedProfileId) {
      profileQuery = profileQuery.eq('id', requestedProfileId);
    }

    const { data: profile, error: profileError } = await profileQuery.maybeSingle();

    if (profileError || !profile?.id) {
      logger.warn('LGPD export requested without valid profile', { userId: user.id, profileId: requestedProfileId ?? 'auto' });
      return NextResponse.json({ error: 'Perfil nao encontrado' }, { status: 404 });
    }

    const { data, error } = await admin
      .from('data_export_requests')
      .insert({ user_id: profile.id, format: 'json', status: 'pending' })
      .select('id, status, created_at, completed_at, download_url')
      .single();

    if (error || !data) {
      logger.error('LGPD export request failed', { userId: user.id, profileId: profile.id, error: error?.message });
      return NextResponse.json({ error: 'Nao foi possivel registrar a solicitacao.' }, { status: 500 });
    }

    logger.info('LGPD export request created', { userId: user.id, profileId: profile.id, requestId: data.id });

    return NextResponse.json({
      id: data.id,
      status: data.status,
      requestedAt: data.created_at,
      completedAt: data.completed_at,
      downloadUrl: data.download_url,
    });
  } catch (error) {
    logger.error('LGPD export route crashed', {
      error: error instanceof Error ? error.message : 'unknown',
    });
    return NextResponse.json({ error: 'Erro interno ao solicitar a exportacao.' }, { status: 500 });
  }
}
