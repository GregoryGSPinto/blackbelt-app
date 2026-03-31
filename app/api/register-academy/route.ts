import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

interface RegisterAcademyBody {
  academy: {
    name: string;
    cnpj?: string;
    phone?: string;
    address?: string;
  };
  admin: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  };
  platformPlan?: string;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RegisterAcademyBody;
    const academy = body.academy;
    const adminData = body.admin;

    if (!academy?.name?.trim()) {
      return NextResponse.json({ error: 'Nome da academia é obrigatório.' }, { status: 400 });
    }
    if (!adminData?.name?.trim()) {
      return NextResponse.json({ error: 'Nome do administrador é obrigatório.' }, { status: 400 });
    }
    if (!adminData?.email?.trim() || !isValidEmail(adminData.email)) {
      return NextResponse.json({ error: 'Email do administrador inválido.' }, { status: 400 });
    }
    if ((adminData.password ?? '').length < 8) {
      return NextResponse.json({ error: 'A senha deve ter pelo menos 8 caracteres.' }, { status: 400 });
    }

    const admin = getAdminClient();
    const normalizedEmail = adminData.email.trim().toLowerCase();

    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
      email: normalizedEmail,
      password: adminData.password,
      email_confirm: true,
      user_metadata: { display_name: adminData.name.trim(), role: 'admin' },
    });

    if (authError || !authUser.user) {
      const message = authError?.message?.includes('already registered')
        ? 'Este email já está cadastrado.'
        : authError?.message ?? 'Erro ao criar usuário administrador.';
      return NextResponse.json({ error: message }, { status: 400 });
    }

    await new Promise((resolve) => setTimeout(resolve, 300));

    const { data: existingProfile } = await admin
      .from('profiles')
      .select('id')
      .eq('user_id', authUser.user.id)
      .maybeSingle();

    let profileId = existingProfile?.id ?? null;
    if (profileId) {
      await admin
        .from('profiles')
        .update({
          role: 'admin',
          display_name: adminData.name.trim(),
          phone: adminData.phone?.trim() || null,
        })
        .eq('id', profileId);
    } else {
      const { data: createdProfile, error: profileError } = await admin
        .from('profiles')
        .insert({
          user_id: authUser.user.id,
          role: 'admin',
          display_name: adminData.name.trim(),
          phone: adminData.phone?.trim() || null,
        })
        .select('id')
        .single();

      if (profileError || !createdProfile) {
        return NextResponse.json({ error: 'Erro ao criar perfil do administrador.' }, { status: 500 });
      }
      profileId = createdProfile.id;
    }

    let platformPlanId: string | null = null;
    let trialDays = 7;
    let maxStudents: number | null = null;
    let maxProfessors: number | null = null;

    if (body.platformPlan?.trim()) {
      const { data: plan } = await admin
        .from('platform_plans')
        .select('id, trial_days, max_alunos, max_professores')
        .eq('tier', body.platformPlan.trim())
        .eq('is_active', true)
        .maybeSingle();

      if (plan) {
        platformPlanId = plan.id;
        trialDays = plan.trial_days ?? 7;
        maxStudents = plan.max_alunos ?? null;
        maxProfessors = plan.max_professores ?? null;
      }
    }

    const now = new Date();
    const { data: createdAcademy, error: academyError } = await admin
      .from('academies')
      .insert({
        name: academy.name.trim(),
        slug: slugify(academy.name),
        owner_id: authUser.user.id,
        owner_profile_id: profileId,
        plan_id: platformPlanId,
        max_students: maxStudents,
        max_professors: maxProfessors,
        status: 'trial',
        subscription_status: 'trialing',
        trial_starts_at: now.toISOString(),
        trial_ends_at: new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000).toISOString(),
        onboarded_at: now.toISOString(),
        billing_name: academy.name.trim(),
        billing_email: normalizedEmail,
        billing_phone: academy.phone?.trim() || adminData.phone?.trim() || null,
        billing_cpf_cnpj: academy.cnpj?.trim() || null,
      })
      .select('id, slug')
      .single();

    if (academyError || !createdAcademy) {
      return NextResponse.json({ error: academyError?.message ?? 'Erro ao criar academia.' }, { status: 400 });
    }

    const { error: unitError } = await admin.from('units').insert({
      academy_id: createdAcademy.id,
      name: 'Sede',
      address: academy.address?.trim() || 'Endereço pendente',
    });
    if (unitError) {
      return NextResponse.json({ error: unitError.message }, { status: 400 });
    }

    const { data: membership, error: membershipError } = await admin
      .from('memberships')
      .upsert(
        {
          profile_id: profileId,
          academy_id: createdAcademy.id,
          role: 'admin',
          status: 'active',
        },
        { onConflict: 'profile_id,academy_id,role' },
      )
      .select('id')
      .single();

    if (membershipError || !membership) {
      return NextResponse.json({ error: membershipError?.message ?? 'Erro ao criar vínculo do administrador.' }, { status: 400 });
    }

    return NextResponse.json(
      {
        academyId: createdAcademy.id,
        slug: createdAcademy.slug,
        adminProfileId: profileId,
        membershipId: membership.id,
      },
      { status: 201 },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao criar academia';
    console.error('[register-academy]', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
