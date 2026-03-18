import { NextRequest, NextResponse } from 'next/server';

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
    // Steps for production (implement when connecting real Supabase):
    //
    // 3a. If inviteToken: validate it
    //     - Fetch invite_tokens where token = inviteToken
    //     - Check is_active = true
    //     - Check expires_at > now() or null
    //     - Check current_uses < max_uses or max_uses is null
    //     - If invalid: return 400 with specific error
    //
    // 3b. Create user in Supabase Auth
    //     const { data: authData, error: authError } = await admin.auth.admin.createUser({
    //       email: body.email,
    //       password: body.senha,
    //       email_confirm: true, // auto-confirm for invite flow
    //       user_metadata: { nome: body.nome, telefone: body.telefone },
    //     });
    //
    // 3c. Create profile in profiles table
    //     const { data: profile } = await admin.from('profiles').insert({
    //       user_id: authData.user.id,
    //       academy_id: invite?.academy_id ?? null,
    //       role: invite?.target_role ?? 'aluno_adulto',
    //       name: body.nome,
    //       email: body.email,
    //       phone: body.telefone,
    //       birth_date: body.dataNascimento,
    //     }).select().single();
    //
    // 3d. Create membership (academy_members)
    //     if (invite?.academy_id) {
    //       await admin.from('academy_members').insert({
    //         profile_id: profile.id,
    //         academy_id: invite.academy_id,
    //         role: invite.target_role,
    //         status: 'active',
    //       });
    //     }
    //
    // 3e. If student role: create student record
    //     if (['aluno_adulto', 'aluno_teen', 'aluno_kids'].includes(invite?.target_role)) {
    //       await admin.from('students').insert({
    //         profile_id: profile.id,
    //         academy_id: invite.academy_id,
    //         belt_level: 'white',
    //         stripes: 0,
    //       });
    //     }
    //
    // 3f. If minor with guardian: create guardian_link
    //     if (body.responsavel) {
    //       await admin.from('guardian_links').insert({
    //         student_profile_id: profile.id,
    //         guardian_name: body.responsavel.nome,
    //         guardian_email: body.responsavel.email,
    //         guardian_phone: body.responsavel.telefone,
    //         relationship: body.responsavel.parentesco,
    //       });
    //     }
    //
    // 3g. If inviteToken: increment current_uses
    //     await admin.from('invite_tokens')
    //       .update({ current_uses: invite.current_uses + 1 })
    //       .eq('id', invite.id);
    //
    // 3h. Return response
    //     return NextResponse.json({
    //       userId: authData.user.id,
    //       profileId: profile.id,
    //       role: profile.role,
    //       academyId: profile.academy_id,
    //     }, { status: 201 });

    // Fallback for non-mock without Supabase configured
    return NextResponse.json(
      { error: 'Supabase nao configurado. Ative NEXT_PUBLIC_USE_MOCK=true para testes.' },
      { status: 503 },
    );
  } catch (error) {
    console.error('[POST /api/auth/register]', error);
    return NextResponse.json(
      { error: 'Erro interno ao criar conta.' },
      { status: 500 },
    );
  }
}
