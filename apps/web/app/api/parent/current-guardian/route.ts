import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/app/api/v1/auth-guard';
import { getAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  if ('error' in authResult) {
    return authResult.error;
  }

  const { auth } = authResult;
  const admin = getAdminClient();

  let profileId = auth.profileId;
  let role = auth.role;

  if (role !== 'responsavel') {
    const { data: fallbackProfile } = await admin
      .from('profiles')
      .select('id, role, person_id')
      .eq('user_id', auth.userId)
      .eq('role', 'responsavel')
      .maybeSingle();

    if (!fallbackProfile?.id) {
      return NextResponse.json({ error: 'Perfil de responsavel nao encontrado.' }, { status: 403 });
    }

    profileId = fallbackProfile.id;
    role = fallbackProfile.role;

    if (fallbackProfile.person_id) {
      const { count } = await admin
        .from('guardian_links')
        .select('child_id', { count: 'exact', head: true })
        .eq('guardian_id', profileId);

      return NextResponse.json({
        profileId,
        personId: fallbackProfile.person_id,
        role,
        linkedChildren: count ?? 0,
      });
    }
  }

  const { data: profile } = await admin
    .from('profiles')
    .select('id, user_id, role, person_id')
    .eq('id', profileId)
    .maybeSingle();

  if (!profile?.id) {
    return NextResponse.json({ error: 'Perfil autenticado nao encontrado.' }, { status: 404 });
  }

  let personId = profile.person_id ?? null;
  if (!personId) {
    const { data: person } = await admin
      .from('people')
      .select('id')
      .eq('account_id', profile.user_id)
      .maybeSingle();

    personId = person?.id ?? null;
    if (!personId) {
      const { data: authUser } = await admin.auth.admin.getUserById(auth.userId);
      const { data: createdPerson } = await admin
        .from('people')
        .insert({
          account_id: profile.user_id,
          full_name: authUser.user?.user_metadata?.name
            ?? authUser.user?.user_metadata?.display_name
            ?? 'Responsavel BlackBelt',
          email: authUser.user?.email ?? null,
          phone: authUser.user?.phone || null,
        })
        .select('id')
        .single();

      personId = createdPerson?.id ?? null;
    }

    if (personId) {
      await admin.from('profiles').update({ person_id: personId }).eq('id', profile.id);
    }
  }

  if (!personId) {
    return NextResponse.json({ error: 'Responsavel autenticado nao possui person_id resolvido.' }, { status: 404 });
  }

  const { count } = await admin
    .from('guardian_links')
    .select('child_id', { count: 'exact', head: true })
    .eq('guardian_id', profile.id);

  return NextResponse.json({
    profileId: profile.id,
    personId,
    role: profile.role,
    linkedChildren: count ?? 0,
  });
}
