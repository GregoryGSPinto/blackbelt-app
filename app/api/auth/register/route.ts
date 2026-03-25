import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';

// ── Types ──────────────────────────────────────────────────────────────

interface RegisterBody {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
  dataNascimento?: string;
  inviteToken?: string;
  responsavel?: {
    nome: string;
    email: string;
    telefone?: string;
    parentesco: string;
  };
}

interface RegisterResponse {
  userId: string;
  profileId: string;
  role: string;
  academyId: string | null;
}

// ── Validation helpers ─────────────────────────────────────────────────

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(pw: string): boolean {
  return (
    pw.length >= 8 &&
    /[A-Z]/.test(pw) &&
    /[a-z]/.test(pw) &&
    /\d/.test(pw)
  );
}

// ── POST handler ───────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RegisterBody;

    // ── 1. Validate required fields ────────────────────────────────
    const errors: string[] = [];

    if (!body.nome?.trim()) errors.push('Nome e obrigatorio');
    if (!body.email?.trim()) errors.push('Email e obrigatorio');
    else if (!isValidEmail(body.email)) errors.push('Email invalido');
    if (!body.senha) errors.push('Senha e obrigatoria');
    else if (!isStrongPassword(body.senha)) errors.push('Senha muito fraca (min 8 chars, maiuscula, minuscula, numero)');

    if (body.responsavel) {
      if (!body.responsavel.nome?.trim()) errors.push('Nome do responsavel e obrigatorio');
      if (!body.responsavel.email?.trim()) errors.push('Email do responsavel e obrigatorio');
      else if (!isValidEmail(body.responsavel.email)) errors.push('Email do responsavel invalido');
      if (!body.responsavel.parentesco) errors.push('Parentesco do responsavel e obrigatorio');
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: errors[0], errors }, { status: 400 });
    }

    // ── 2. Check if mock mode ──────────────────────────────────────
    const isMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

    if (isMock) {
      // Mock implementation: return success with fake IDs
      const mockResponse: RegisterResponse = {
        userId: `user_${Date.now()}`,
        profileId: `profile_${Date.now()}`,
        role: 'aluno_adulto',
        academyId: body.inviteToken ? `academy_${Date.now()}` : null,
      };

      return NextResponse.json(mockResponse, { status: 201 });
    }

    // ── 3. Real Supabase implementation ────────────────────────────
    const admin = getAdminClient();

    // 3a. If inviteToken: validate it
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let invite: Record<string, any> | null = null;
    if (body.inviteToken) {
      const { data: inviteData, error: inviteError } = await admin
        .from('invite_tokens')
        .select('*')
        .eq('code', body.inviteToken)
        .eq('is_active', true)
        .single();

      if (inviteError || !inviteData) {
        return NextResponse.json({ error: 'Convite invalido ou expirado.' }, { status: 400 });
      }

      const now = new Date();
      const expires = inviteData.expires_at ? new Date(inviteData.expires_at) : null;
      if (expires && now > expires) {
        return NextResponse.json({ error: 'Convite expirado.' }, { status: 400 });
      }
      if (inviteData.max_uses && inviteData.uses_count >= inviteData.max_uses) {
        return NextResponse.json({ error: 'Limite de usos atingido.' }, { status: 400 });
      }

      invite = inviteData;
    }

    // 3b. Create user in Supabase Auth
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: body.email.trim().toLowerCase(),
      password: body.senha,
      email_confirm: true,
      user_metadata: {
        name: body.nome.trim(),
        phone: body.telefone,
      },
    });

    if (authError || !authData.user) {
      console.error('[POST /api/auth/register] createUser error:', authError?.message);
      const msg = authError?.message?.includes('already registered')
        ? 'Este email ja esta cadastrado.'
        : `Erro ao criar conta: ${authError?.message ?? 'unknown'}`;
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    // 3c. The DB trigger auto-creates a profile; fetch or create it
    const { data: profileData } = await admin
      .from('profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .limit(1)
      .maybeSingle();

    let profileId: string;
    if (profileData) {
      profileId = profileData.id;
      // Update role if invite specifies one
      if (invite?.target_role) {
        await admin
          .from('profiles')
          .update({ role: invite.target_role, display_name: body.nome.trim() })
          .eq('id', profileId);
      }
    } else {
      // Trigger didn't fire; create profile manually
      const role = invite?.target_role ?? 'aluno_adulto';
      const { data: newProfile, error: profileError } = await admin
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          role,
          display_name: body.nome.trim(),
        })
        .select()
        .single();
      if (profileError || !newProfile) {
        console.error('[POST /api/auth/register] create profile error:', profileError?.message);
        return NextResponse.json({ error: 'Erro ao criar perfil.' }, { status: 500 });
      }
      profileId = newProfile.id;
    }

    // 3d. Create membership if invite has academy_id
    let academyId: string | null = null;
    if (invite?.academy_id) {
      academyId = invite.academy_id;
      const { error: memberError } = await admin
        .from('memberships')
        .insert({
          profile_id: profileId,
          academy_id: invite.academy_id,
          role: invite.target_role ?? 'aluno_adulto',
          status: 'active',
        });
      if (memberError) {
        console.error('[POST /api/auth/register] create membership error:', memberError.message);
      }
    }

    // 3e. If student role: create student record
    const role = invite?.target_role ?? 'aluno_adulto';
    if (['aluno_adulto', 'aluno_teen', 'aluno_kids'].includes(role) && academyId) {
      const { error: studentError } = await admin
        .from('students')
        .insert({
          profile_id: profileId,
          academy_id: academyId,
          name: body.nome.trim(),
          email: body.email.trim().toLowerCase(),
          phone: body.telefone ?? null,
          birth_date: body.dataNascimento ?? null,
          belt_rank: 'white',
          stripes: 0,
        });
      if (studentError) {
        console.error('[POST /api/auth/register] create student error:', studentError.message);
        // Non-fatal — continue
      }
    }

    // 3f. If minor with guardian: create guardian link
    if (body.responsavel && profileId) {
      const { error: guardianError } = await admin
        .from('guardian_links')
        .insert({
          student_profile_id: profileId,
          guardian_name: body.responsavel.nome.trim(),
          guardian_email: body.responsavel.email.trim().toLowerCase(),
          guardian_phone: body.responsavel.telefone ?? null,
          relationship: body.responsavel.parentesco,
        });
      if (guardianError) {
        console.error('[POST /api/auth/register] create guardian error:', guardianError.message);
        // Non-fatal
      }
    }

    // 3g. If inviteToken: increment uses_count
    if (invite) {
      await admin
        .from('invite_tokens')
        .update({ uses_count: (invite.uses_count ?? 0) + 1 })
        .eq('id', invite.id);
    }

    // 3h. Return response
    return NextResponse.json({
      userId: authData.user.id,
      profileId,
      role,
      academyId,
    } satisfies RegisterResponse, { status: 201 });
  } catch (error) {
    console.error('[POST /api/auth/register]', error);
    return NextResponse.json(
      { error: 'Erro interno ao criar conta.' },
      { status: 500 },
    );
  }
}
