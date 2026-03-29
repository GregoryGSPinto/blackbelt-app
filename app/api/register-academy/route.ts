import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get(name: string) { return req.cookies.get(name)?.value; }, set() {}, remove() {} } },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await req.json();

    // Validate required fields
    if (!body.academyName || !body.email || !body.password || !body.name) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 });
    }

    // Dynamic import of admin client to avoid bundling service_role key
    const { getAdminClient } = await import('@/lib/supabase/admin');
    const admin = getAdminClient();

    // 1. Create auth user
    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
      user_metadata: { display_name: body.name, role: 'admin' },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // 2. Wait for trigger to create profile
    await new Promise(r => setTimeout(r, 500));

    // 3. Create academy
    const slug = body.academyName
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const { data: academy, error: acadError } = await admin.from('academies').insert({
      name: body.academyName,
      slug,
      owner_id: authUser.user.id,
      status: 'trial',
      trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }).select('id, name').single();

    if (acadError) {
      return NextResponse.json({ error: acadError.message }, { status: 400 });
    }

    // 4. Get auto-created profile and update it
    const { data: profile } = await admin
      .from('profiles')
      .select('id')
      .eq('user_id', authUser.user.id)
      .single();

    const profileId = profile?.id ?? authUser.user.id;

    await admin.from('profiles').update({
      role: 'admin',
      display_name: body.name,
      phone: body.phone || null,
    }).eq('id', profileId);

    // 5. Create membership
    await admin.from('memberships').insert({
      profile_id: profileId,
      academy_id: academy.id,
      role: 'admin',
      status: 'active',
    });

    return NextResponse.json({
      academy: { id: academy.id, name: academy.name },
      userId: authUser.user.id,
    }, { status: 201 });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao criar academia';
    console.error('[register-academy]', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
