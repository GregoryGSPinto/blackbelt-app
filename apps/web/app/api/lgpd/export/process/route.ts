import { NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';
import { isMock } from '@/lib/env';
import { logger } from '@/lib/monitoring/logger';

// Mock data for development
function getMockExportData(profileId: string) {
  return {
    exportedAt: new Date().toISOString(),
    profileId,
    profile: {
      id: profileId,
      display_name: 'Usuario Teste',
      role: 'aluno_adulto',
      created_at: '2025-01-01T00:00:00Z',
    },
    person: {
      full_name: 'Usuario de Teste',
      email: 'teste@exemplo.com',
      phone: '+5531999999999',
      birth_date: '1990-01-15',
    },
    access_events: [
      { event_type: 'login', created_at: '2026-03-28T10:00:00Z', ip_address: '***' },
      { event_type: 'login', created_at: '2026-03-27T08:30:00Z', ip_address: '***' },
    ],
    consent_records: [
      { consent_type: 'privacy_policy', granted: true, created_at: '2025-01-01T00:00:00Z' },
      { consent_type: 'terms_of_use', granted: true, created_at: '2025-01-01T00:00:00Z' },
    ],
  };
}

export async function POST(request: Request) {
  try {
    // --- Mock mode ---
    if (isMock()) {
      const body = await request.json().catch(() => ({}));
      const requestId = typeof body.request_id === 'string' ? body.request_id : 'mock-req-1';
      const profileId = typeof body.profile_id === 'string' ? body.profile_id : 'mock-profile-1';

      const exportData = getMockExportData(profileId);

      return NextResponse.json({
        id: requestId,
        status: 'ready',
        completedAt: new Date().toISOString(),
        downloadUrl: `data:application/json;base64,${Buffer.from(JSON.stringify(exportData, null, 2)).toString('base64')}`,
        recordCount: {
          profile: 1,
          person: 1,
          access_events: exportData.access_events.length,
          consent_records: exportData.consent_records.length,
        },
      });
    }

    // --- Real Supabase mode ---
    const supabase = await createServerSupabaseClient();
    const admin = createServiceRoleClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const requestId = typeof body.request_id === 'string' ? body.request_id : null;

    if (!requestId) {
      return NextResponse.json({ error: 'request_id e obrigatorio' }, { status: 400 });
    }

    // Fetch the pending export request — must belong to this user
    const { data: exportReq, error: reqError } = await admin
      .from('data_export_requests')
      .select('id, user_id, status, format')
      .eq('id', requestId)
      .maybeSingle();

    if (reqError || !exportReq) {
      logger.warn('Export process: request not found', { requestId, userId: user.id });
      return NextResponse.json({ error: 'Solicitacao nao encontrada' }, { status: 404 });
    }

    // Verify ownership: the export request user_id is a profile id, check it belongs to this auth user
    const { data: ownerProfile } = await admin
      .from('profiles')
      .select('id, user_id')
      .eq('id', exportReq.user_id)
      .eq('user_id', user.id)
      .maybeSingle();

    // Allow if user owns the profile OR user is admin/superadmin
    const { data: adminProfile } = await admin
      .from('profiles')
      .select('id, role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'superadmin'])
      .limit(1)
      .maybeSingle();

    if (!ownerProfile && !adminProfile) {
      logger.warn('Export process: unauthorized', { requestId, userId: user.id });
      return NextResponse.json({ error: 'Sem permissao para processar esta solicitacao' }, { status: 403 });
    }

    if (exportReq.status === 'ready') {
      return NextResponse.json({ error: 'Exportacao ja foi processada' }, { status: 409 });
    }

    const profileId = exportReq.user_id;

    // Update status to processing
    await admin
      .from('data_export_requests')
      .update({ status: 'processing' })
      .eq('id', requestId);

    // Collect user data from all relevant tables
    const [profileRes, personRes, accessRes, consentRes] = await Promise.all([
      admin
        .from('profiles')
        .select('id, user_id, role, display_name, avatar, created_at, updated_at')
        .eq('id', profileId)
        .maybeSingle(),
      admin
        .from('people')
        .select('id, full_name, email, phone, birth_date, cpf, address_city, address_state, created_at')
        .eq('profile_id', profileId)
        .maybeSingle(),
      admin
        .from('access_events')
        .select('id, event_type, created_at, ip_address, user_agent')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false })
        .limit(500),
      admin
        .from('consent_records')
        .select('id, consent_type, granted, version, created_at')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false }),
    ]);

    // Mask sensitive fields for privacy
    const accessEvents = (accessRes.data ?? []).map((evt) => ({
      ...evt,
      ip_address: evt.ip_address ? evt.ip_address.replace(/\d+$/, '***') : null,
      user_agent: evt.user_agent ? evt.user_agent.substring(0, 50) + '...' : null,
    }));

    const exportData = {
      exportedAt: new Date().toISOString(),
      format: 'LGPD Art. 18 — Portabilidade de Dados',
      profileId,
      profile: profileRes.data ?? null,
      person: personRes.data ?? null,
      access_events: accessEvents,
      consent_records: consentRes.data ?? [],
    };

    // Store as JSON in Supabase Storage
    const fileName = `exports/${profileId}/${requestId}.json`;
    const fileContent = JSON.stringify(exportData, null, 2);

    const { error: uploadError } = await admin.storage
      .from('lgpd-exports')
      .upload(fileName, fileContent, {
        contentType: 'application/json',
        upsert: true,
      });

    if (uploadError) {
      logger.error('Export process: upload failed', {
        requestId,
        profileId,
        error: uploadError.message,
      });

      // Fall back: mark as failed
      await admin
        .from('data_export_requests')
        .update({ status: 'failed' })
        .eq('id', requestId);

      return NextResponse.json({ error: 'Falha ao gerar arquivo de exportacao' }, { status: 500 });
    }

    // Generate signed download URL (valid for 7 days)
    const { data: signedUrlData, error: signedUrlError } = await admin.storage
      .from('lgpd-exports')
      .createSignedUrl(fileName, 60 * 60 * 24 * 7);

    if (signedUrlError || !signedUrlData?.signedUrl) {
      logger.error('Export process: signed URL failed', {
        requestId,
        profileId,
        error: signedUrlError?.message,
      });

      await admin
        .from('data_export_requests')
        .update({ status: 'failed' })
        .eq('id', requestId);

      return NextResponse.json({ error: 'Falha ao gerar URL de download' }, { status: 500 });
    }

    // Mark as ready
    const now = new Date().toISOString();
    await admin
      .from('data_export_requests')
      .update({
        status: 'ready',
        completed_at: now,
        download_url: signedUrlData.signedUrl,
      })
      .eq('id', requestId);

    logger.info('Export process: completed', {
      requestId,
      profileId,
      recordCount: {
        profile: profileRes.data ? 1 : 0,
        person: personRes.data ? 1 : 0,
        access_events: accessEvents.length,
        consent_records: (consentRes.data ?? []).length,
      },
    });

    return NextResponse.json({
      id: requestId,
      status: 'ready',
      completedAt: now,
      downloadUrl: signedUrlData.signedUrl,
      recordCount: {
        profile: profileRes.data ? 1 : 0,
        person: personRes.data ? 1 : 0,
        access_events: accessEvents.length,
        consent_records: (consentRes.data ?? []).length,
      },
    });
  } catch (error) {
    logger.error('Export process route crashed', {
      error: error instanceof Error ? error.message : 'unknown',
    });
    return NextResponse.json({ error: 'Erro interno ao processar a exportacao.' }, { status: 500 });
  }
}
