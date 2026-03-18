import { NextRequest, NextResponse } from 'next/server';

// ── Types ──────────────────────────────────────────────────────────────

interface ResetChildPasswordBody {
  childUserId: string;
  newPassword: string;
}

// ── Validation helpers ─────────────────────────────────────────────────

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
    const body = (await request.json()) as ResetChildPasswordBody;

    // ── 1. Validate input ──────────────────────────────────────────
    if (!body.childUserId?.trim()) {
      return NextResponse.json(
        { error: 'ID do aluno e obrigatorio.' },
        { status: 400 },
      );
    }

    if (!body.newPassword) {
      return NextResponse.json(
        { error: 'Nova senha e obrigatoria.' },
        { status: 400 },
      );
    }

    if (!isStrongPassword(body.newPassword)) {
      return NextResponse.json(
        { error: 'Senha muito fraca. Minimo 8 caracteres com maiuscula, minuscula e numero.' },
        { status: 400 },
      );
    }

    // ── 2. Check if mock mode ──────────────────────────────────────
    const isMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

    if (isMock) {
      // Mock implementation: validate structure and return success
      return NextResponse.json(
        { success: true, message: 'Senha do aluno atualizada com sucesso.' },
        { status: 200 },
      );
    }

    // ── 3. Real Supabase implementation ────────────────────────────
    // Steps for production:
    //
    // 3a. Authenticate requester — get session from cookies
    //     const { createServerClient } = await import('@/lib/supabase/client');
    //     // Or use the cookie-based approach from middleware
    //     const supabase = createServerClient(cookies);
    //     const { data: { user: requester } } = await supabase.auth.getUser();
    //     if (!requester) {
    //       return NextResponse.json({ error: 'Nao autenticado.' }, { status: 401 });
    //     }
    //
    // 3b. Verify requester is parent/guardian of the child
    //     const { getAdminClient } = await import('@/lib/supabase/admin');
    //     const admin = getAdminClient();
    //
    //     // Find requester's profile
    //     const { data: requesterProfile } = await admin
    //       .from('profiles')
    //       .select('id, role')
    //       .eq('user_id', requester.id)
    //       .single();
    //
    //     // Check guardian_links table
    //     const { data: guardianLink } = await admin
    //       .from('guardian_links')
    //       .select('id')
    //       .eq('guardian_profile_id', requesterProfile.id)
    //       .eq('student_user_id', body.childUserId)
    //       .single();
    //
    //     if (!guardianLink) {
    //       return NextResponse.json(
    //         { error: 'Voce nao e responsavel deste aluno.' },
    //         { status: 403 },
    //       );
    //     }
    //
    // 3c. Verify child is actually a minor
    //     const { data: childProfile } = await admin
    //       .from('profiles')
    //       .select('role')
    //       .eq('user_id', body.childUserId)
    //       .single();
    //
    //     if (!['aluno_kids', 'aluno_teen'].includes(childProfile?.role)) {
    //       return NextResponse.json(
    //         { error: 'Este usuario nao e um aluno menor de idade.' },
    //         { status: 400 },
    //       );
    //     }
    //
    // 3d. Update the child's password
    //     const { error: updateError } = await admin.auth.admin.updateUserById(
    //       body.childUserId,
    //       { password: body.newPassword },
    //     );
    //
    //     if (updateError) {
    //       console.error('[reset-child-password] updateUser error:', updateError);
    //       return NextResponse.json(
    //         { error: 'Erro ao atualizar senha.' },
    //         { status: 500 },
    //       );
    //     }
    //
    // 3e. Optionally: log audit event
    //     await admin.from('audit_logs').insert({
    //       action: 'reset_child_password',
    //       actor_id: requester.id,
    //       target_id: body.childUserId,
    //       metadata: { timestamp: new Date().toISOString() },
    //     });
    //
    // return NextResponse.json(
    //   { success: true, message: 'Senha do aluno atualizada com sucesso.' },
    //   { status: 200 },
    // );

    // Fallback for non-mock without Supabase configured
    return NextResponse.json(
      { error: 'Supabase nao configurado. Ative NEXT_PUBLIC_USE_MOCK=true para testes.' },
      { status: 503 },
    );
  } catch (error) {
    console.error('[POST /api/auth/reset-child-password]', error);
    return NextResponse.json(
      { error: 'Erro interno ao redefinir senha.' },
      { status: 500 },
    );
  }
}
