import { NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';
import { logger } from '@/lib/monitoring/logger';

const DELETE_CONFIRM_TEXT = 'EXCLUIR';

export async function DELETE(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const admin = createServiceRoleClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const requestedProfileId = typeof body.profile_id === 'string' ? body.profile_id : null;
    const confirm = typeof body.confirm === 'string' ? body.confirm.trim().toUpperCase() : '';

    if (confirm !== DELETE_CONFIRM_TEXT) {
      return NextResponse.json({ error: 'Confirmacao invalida' }, { status: 400 });
    }

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
      logger.warn('Account deletion requested without valid profile', { userId: user.id, profileId: requestedProfileId ?? 'auto' });
      return NextResponse.json({ error: 'Perfil nao encontrado' }, { status: 404 });
    }

    const scheduledDeletionAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await admin
      .from('data_deletion_requests')
      .insert({
        user_id: profile.id,
        status: 'pending',
        scheduled_at: scheduledDeletionAt,
      })
      .select('id, status, created_at, scheduled_at')
      .single();

    if (error || !data) {
      logger.error('Account deletion request failed', { userId: user.id, profileId: profile.id, error: error?.message });
      return NextResponse.json({ error: 'Nao foi possivel registrar a exclusao da conta.' }, { status: 500 });
    }

    await supabase.auth.signOut();

    logger.info('Account deletion request created', { userId: user.id, profileId: profile.id, requestId: data.id });

    return NextResponse.json({
      id: data.id,
      status: data.status,
      requestedAt: data.created_at,
      scheduledDeletionAt: data.scheduled_at ?? scheduledDeletionAt,
    });
  } catch (error) {
    logger.error('Delete account route crashed', {
      error: error instanceof Error ? error.message : 'unknown',
    });
    return NextResponse.json({ error: 'Erro interno ao solicitar a exclusao da conta.' }, { status: 500 });
  }
}
