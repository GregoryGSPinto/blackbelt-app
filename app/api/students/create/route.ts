import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getAdminClient } from '@/lib/supabase/admin';

interface CreateStudentBody {
  nome: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  cpf?: string;
  tipoAluno: 'adulto' | 'teen' | 'kids';
  turmaId?: string;
  planoId?: string;
  academyId: string;
  origem: string;
  tipo: 'matricula' | 'experimental' | 'lead';
  responsavel?: {
    nome: string;
    email: string;
    telefone: string;
    parentesco: string;
  };
}

const ROLE_MAP: Record<string, string> = {
  adulto: 'aluno_adulto',
  teen: 'aluno_teen',
  kids: 'aluno_kids',
};

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const authSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get(name: string) { return req.cookies.get(name)?.value; }, set() {}, remove() {} } },
    );
    const { data: { user } } = await authSupabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = (await req.json()) as CreateStudentBody;
    const supabase = getAdminClient();

    // ── 1. Create auth user ───────────────────────────────────
    let authUserId: string | null = null;

    if (body.email) {
      // Check if user already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existing = existingUsers?.users?.find(
        (u) => u.email === body.email,
      );

      if (existing) {
        authUserId = existing.id;
      } else {
        const { data: authData, error: authError } =
          await supabase.auth.admin.createUser({
            email: body.email,
            password: 'TEMP_CHANGE_ME_ON_FIRST_LOGIN',
            email_confirm: true,
            user_metadata: { display_name: body.nome },
          });

        if (authError) {
          console.error('[createStudent] Auth error:', authError.message);
          return NextResponse.json(
            { error: `Erro ao criar usuário: ${authError.message}` },
            { status: 400 },
          );
        }
        authUserId = authData.user.id;
      }
    }

    if (!authUserId) {
      return NextResponse.json(
        { error: 'Email é obrigatório para criar aluno' },
        { status: 400 },
      );
    }

    // ── 2. Create profile ─────────────────────────────────────
    const role = ROLE_MAP[body.tipoAluno] ?? 'aluno_adulto';

    // Check if profile already exists for this user+role
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', authUserId)
      .eq('role', role)
      .maybeSingle();

    let profileId: string;

    if (existingProfile) {
      profileId = existingProfile.id;
    } else {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authUserId,
          role,
          display_name: body.nome,
        })
        .select('id')
        .single();

      if (profileError || !profile) {
        console.error(
          '[createStudent] Profile error:',
          profileError?.message,
        );
        return NextResponse.json(
          {
            error: `Erro ao criar perfil: ${profileError?.message ?? 'unknown'}`,
          },
          { status: 400 },
        );
      }
      profileId = profile.id;
    }

    // ── 3. Create membership ──────────────────────────────────
    const { error: membershipError } = await supabase
      .from('memberships')
      .upsert(
        {
          profile_id: profileId,
          academy_id: body.academyId,
          role,
          status: 'active',
        },
        { onConflict: 'profile_id,academy_id,role' },
      );

    if (membershipError) {
      console.error(
        '[createStudent] Membership error:',
        membershipError.message,
      );
    }

    // ── 4. Create student record ──────────────────────────────
    const { data: existingStudent } = await supabase
      .from('students')
      .select('id')
      .eq('profile_id', profileId)
      .eq('academy_id', body.academyId)
      .maybeSingle();

    let studentId: string;

    if (existingStudent) {
      studentId = existingStudent.id;
    } else {
      const { data: student, error: studentError } = await supabase
        .from('students')
        .insert({
          profile_id: profileId,
          academy_id: body.academyId,
          belt: 'white',
        })
        .select('id')
        .single();

      if (studentError || !student) {
        console.error(
          '[createStudent] Student error:',
          studentError?.message,
        );
        return NextResponse.json(
          {
            error: `Erro ao criar aluno: ${studentError?.message ?? 'unknown'}`,
          },
          { status: 400 },
        );
      }
      studentId = student.id;
    }

    // ── 5. Create class enrollment (if turma selected) ────────
    if (body.turmaId) {
      const { error: enrollError } = await supabase
        .from('class_enrollments')
        .upsert(
          {
            student_id: studentId,
            class_id: body.turmaId,
            status: 'active',
          },
          { onConflict: 'student_id,class_id' },
        );

      if (enrollError) {
        console.error(
          '[createStudent] Enrollment error:',
          enrollError.message,
        );
      }
    }

    // ── 6. Create guardian link (if minor with responsavel) ───
    if (body.responsavel && body.responsavel.email) {
      // Find or create guardian profile
      const { data: guardianUsers } = await supabase.auth.admin.listUsers();
      const guardianUser = guardianUsers?.users?.find(
        (u) => u.email === body.responsavel!.email,
      );

      if (guardianUser) {
        const { data: guardianProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', guardianUser.id)
          .eq('role', 'responsavel')
          .maybeSingle();

        if (guardianProfile) {
          const { error: guardianError } = await supabase
            .from('guardians')
            .upsert(
              {
                guardian_profile_id: guardianProfile.id,
                student_id: studentId,
                relation:
                  body.responsavel.parentesco === 'Pai'
                    ? 'pai'
                    : body.responsavel.parentesco === 'Mãe'
                      ? 'mae'
                      : 'tutor',
              },
              { onConflict: 'guardian_profile_id,student_id' },
            );

          if (guardianError) {
            console.error(
              '[createStudent] Guardian error:',
              guardianError.message,
            );
          }
        }
      }
    }

    // ── 7. Audit log ──────────────────────────────────────────
    await supabase.from('audit_log').insert({
      academy_id: body.academyId,
      action: 'create',
      entity_type: 'student',
      entity_id: studentId,
      new_data: { name: body.nome, email: body.email, role, tipo: body.tipo },
    }).then(({ error: auditErr }) => {
      if (auditErr) console.error('[createStudent] Audit error:', auditErr.message);
    });

    // ── 8. Return result ──────────────────────────────────────
    return NextResponse.json({
      alunoId: studentId,
      profileId,
      tipo: body.tipo,
      loginTemporario: {
        email: body.email,
        senhaTemporaria: 'TEMP_CHANGE_ME_ON_FIRST_LOGIN',
      },
    });
  } catch (error) {
    console.error('[createStudent] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Erro interno ao criar aluno' },
      { status: 500 },
    );
  }
}
