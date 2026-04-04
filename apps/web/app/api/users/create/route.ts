import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getAdminClient } from '@/lib/supabase/admin';

const ALLOWED_ROLES = [
  'admin',
  'professor',
  'recepcao',
  'aluno_adulto',
  'aluno_teen',
  'aluno_kids',
  'responsavel',
];

export async function POST(req: NextRequest) {
  try {
    // ── 1. Auth check — get caller from cookies ───────────────
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
        },
      },
    );
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json(
        { error: 'Nao autenticado' },
        { status: 401 },
      );

    // ── 2. Check admin role via memberships ───────────────────
    const { data: membership } = await supabase
      .from('memberships')
      .select('academy_id, role, profile_id')
      .eq('status', 'active')
      .limit(1)
      .single();

    if (
      !membership ||
      !['admin', 'superadmin'].includes(membership.role)
    ) {
      return NextResponse.json(
        { error: 'Sem permissao' },
        { status: 403 },
      );
    }

    const academyId = membership.academy_id;
    if (!academyId)
      return NextResponse.json(
        { error: 'Sem academia vinculada' },
        { status: 400 },
      );

    // ── 3. Parse body ─────────────────────────────────────────
    const body = await req.json();
    const { name, email, phone, role } = body;

    if (!name || !email || !role) {
      return NextResponse.json(
        { error: 'Nome, email e perfil sao obrigatorios' },
        { status: 400 },
      );
    }

    // ── 4. Block superadmin/franqueador creation ──────────────
    if (!ALLOWED_ROLES.includes(role)) {
      return NextResponse.json(
        { error: 'Nao e possivel criar este perfil' },
        { status: 403 },
      );
    }

    // ── 5. Use service role key ───────────────────────────────
    const supabaseAdmin = getAdminClient();

    // ── 6. Check if auth user already exists ──────────────────
    const { data: existingUsers } =
      await supabaseAdmin.auth.admin.listUsers();
    const existing = existingUsers?.users?.find(
      (u) => u.email === email,
    );

    let authUserId: string;

    if (existing) {
      authUserId = existing.id;
    } else {
      const { data: authUser, error: authError } =
        await supabaseAdmin.auth.admin.createUser({
          email,
          email_confirm: false,
          user_metadata: { display_name: name, role },
        });

      if (authError) {
        return NextResponse.json(
          { error: authError.message },
          { status: 400 },
        );
      }
      authUserId = authUser.user.id;
    }

    // ── 7. Create/check profile ───────────────────────────────
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('user_id', authUserId)
      .eq('role', role)
      .maybeSingle();

    let profileId: string;

    if (existingProfile) {
      profileId = existingProfile.id;
      // Update display_name in case it changed
      await supabaseAdmin
        .from('profiles')
        .update({ display_name: name })
        .eq('id', profileId);
    } else {
      // If a trigger already created a default profile, check for it
      const { data: defaultProfile } = await supabaseAdmin
        .from('profiles')
        .select('id, role')
        .eq('user_id', authUserId)
        .maybeSingle();

      if (defaultProfile && defaultProfile.role !== role) {
        // Update the auto-created profile to the desired role
        await supabaseAdmin
          .from('profiles')
          .update({ role, display_name: name })
          .eq('id', defaultProfile.id);
        profileId = defaultProfile.id;
      } else if (defaultProfile) {
        await supabaseAdmin
          .from('profiles')
          .update({ display_name: name })
          .eq('id', defaultProfile.id);
        profileId = defaultProfile.id;
      } else {
        const { data: newProfile, error: profileError } =
          await supabaseAdmin
            .from('profiles')
            .insert({
              user_id: authUserId,
              role,
              display_name: name,
            })
            .select('id')
            .single();

        if (profileError || !newProfile) {
          return NextResponse.json(
            {
              error: `Erro ao criar perfil: ${profileError?.message ?? 'desconhecido'}`,
            },
            { status: 400 },
          );
        }
        profileId = newProfile.id;
      }
    }

    // ── 8. Create membership ──────────────────────────────────
    const { error: membershipError } = await supabaseAdmin
      .from('memberships')
      .upsert(
        {
          profile_id: profileId,
          academy_id: academyId,
          role,
          status: 'active',
        },
        { onConflict: 'profile_id,academy_id,role' },
      );

    if (membershipError) {
      console.error(
        '[users/create] Membership error:',
        membershipError.message,
      );
    }

    // ── 9. If student role, create students record ────────────
    if (['aluno_adulto', 'aluno_teen', 'aluno_kids'].includes(role)) {
      const { data: existingStudent } = await supabaseAdmin
        .from('students')
        .select('id')
        .eq('profile_id', profileId)
        .eq('academy_id', academyId)
        .maybeSingle();

      if (!existingStudent) {
        await supabaseAdmin.from('students').insert({
          profile_id: profileId,
          academy_id: academyId,
          belt: 'white',
        });
      }
    }

    // ── 10. Generate magic link ───────────────────────────────
    const { data: linkData } =
      await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://blackbelts.com.br'}/selecionar-perfil`,
        },
      });

    const magicLink = linkData?.properties?.action_link || '';

    return NextResponse.json({
      success: true,
      user: { id: authUserId, email, name, role, phone },
      magicLink,
      message: `Usuario ${name} criado com sucesso!`,
    });
  } catch (error) {
    console.error('[users/create] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Erro interno ao criar usuario' },
      { status: 500 },
    );
  }
}
