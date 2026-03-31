import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

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

const TEMP_PASSWORD = 'Temp#BlackBelt2026';

function normalizeRelationship(input: string | undefined): 'pai' | 'mae' | 'tutor' {
  const normalized = (input ?? '').trim().toLowerCase();
  if (normalized.startsWith('pai')) return 'pai';
  if (normalized.startsWith('m')) return 'mae';
  return 'tutor';
}

function normalizeRecurrence(interval: string | null | undefined): string {
  switch (interval) {
    case 'quarterly':
    case 'semiannual':
    case 'annual':
      return interval;
    default:
      return 'monthly';
  }
}

function normalizeMembershipRecurrence(interval: string | null | undefined): string {
  switch (interval) {
    case 'quarterly':
      return 'trimestral';
    case 'semiannual':
      return 'semestral';
    case 'annual':
      return 'anual';
    default:
      return 'mensal';
  }
}

function currentMonthReference(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export async function POST(req: NextRequest) {
  try {
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
    const role = ROLE_MAP[body.tipoAluno] ?? 'aluno_adulto';

    let academyId = body.academyId;
    if (!academyId) {
      const { data: actorProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      const { data: actorMembership } = actorProfile?.id
        ? await supabase
          .from('memberships')
          .select('academy_id')
          .eq('profile_id', actorProfile.id)
          .eq('status', 'active')
          .limit(1)
          .maybeSingle()
        : { data: null };

      academyId = actorMembership?.academy_id ?? '';
    }

    if (!academyId) {
      return NextResponse.json({ error: 'Academia ativa não identificada' }, { status: 400 });
    }

    const { data: plan } = body.planoId
      ? await supabase
        .from('plans')
        .select('id, price, interval')
        .eq('id', body.planoId)
        .eq('academy_id', academyId)
        .maybeSingle()
      : { data: null };

    const normalizedEmail = body.email.trim().toLowerCase();
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((candidate) => candidate.email === normalizedEmail) ?? null;

    let authUserId = existingUser?.id ?? null;
    if (!authUserId) {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: normalizedEmail,
        password: TEMP_PASSWORD,
        email_confirm: true,
        user_metadata: {
          display_name: body.nome,
          needs_password_change: true,
        },
      });

      if (authError || !authData.user) {
        console.error('[createStudent] Auth error:', authError?.message);
        return NextResponse.json(
          { error: `Erro ao criar usuário: ${authError?.message ?? 'unknown'}` },
          { status: 400 },
        );
      }
      authUserId = authData.user.id;
    }

    if (!authUserId) {
      return NextResponse.json({ error: 'Email é obrigatório para criar aluno' }, { status: 400 });
    }

    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, person_id')
      .eq('user_id', authUserId)
      .eq('role', role)
      .maybeSingle();

    let profileId = existingProfile?.id ?? '';
    let personId = existingProfile?.person_id ?? null;

    if (existingProfile?.id) {
      await supabase
        .from('profiles')
        .update({
          role,
          display_name: body.nome,
          phone: body.telefone || null,
          cpf: body.cpf || null,
          needs_password_change: true,
        })
        .eq('id', existingProfile.id);
    } else {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authUserId,
          role,
          display_name: body.nome,
          phone: body.telefone || null,
          cpf: body.cpf || null,
          needs_password_change: true,
        })
        .select('id, person_id')
        .single();

      if (profileError || !profile) {
        console.error('[createStudent] Profile error:', profileError?.message);
        return NextResponse.json(
          { error: `Erro ao criar perfil: ${profileError?.message ?? 'unknown'}` },
          { status: 400 },
        );
      }
      profileId = profile.id;
      personId = profile.person_id;
    }

    if (!personId) {
      const { data: existingPerson } = await supabase
        .from('people')
        .select('id')
        .eq('account_id', authUserId)
        .maybeSingle();

      personId = existingPerson?.id ?? null;

      if (personId) {
        await supabase
          .from('people')
          .update({
            full_name: body.nome,
            email: normalizedEmail,
            phone: body.telefone || null,
            birth_date: body.dataNascimento || null,
            cpf: body.cpf || null,
          })
          .eq('id', personId);
      } else {
        const { data: createdPerson, error: personError } = await supabase
          .from('people')
          .insert({
            account_id: authUserId,
            full_name: body.nome,
            email: normalizedEmail,
            phone: body.telefone || null,
            birth_date: body.dataNascimento || null,
            cpf: body.cpf || null,
          })
          .select('id')
          .single();

        if (!personError && createdPerson?.id) {
          personId = createdPerson.id;
        }
      }

      if (personId) {
        await supabase.from('profiles').update({ person_id: personId }).eq('id', profileId);
      }
    }

    const membershipPayload = {
      profile_id: profileId,
      academy_id: academyId,
      role,
      status: 'active',
      monthly_amount: body.tipo === 'matricula' ? plan?.price ?? null : null,
      billing_type: body.tipo === 'matricula' ? 'particular' : 'cortesia',
      billing_status: body.tipo === 'matricula' ? 'em_dia' : 'cortesia',
      payment_method: body.tipo === 'matricula' ? 'pix' : null,
      recurrence: body.tipo === 'matricula' ? normalizeMembershipRecurrence(plan?.interval) : 'avulso',
      billing_day: body.tipo === 'matricula' ? 10 : null,
    };

    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .upsert(membershipPayload, { onConflict: 'profile_id,academy_id,role' })
      .select('id')
      .single();

    if (membershipError || !membership) {
      console.error('[createStudent] Membership error:', membershipError?.message);
    }

    const { data: existingStudent } = await supabase
      .from('students')
      .select('id')
      .eq('profile_id', profileId)
      .eq('academy_id', academyId)
      .maybeSingle();

    let studentId = existingStudent?.id ?? '';
    if (!existingStudent?.id) {
      const { data: student, error: studentError } = await supabase
        .from('students')
        .insert({
          profile_id: profileId,
          academy_id: academyId,
          belt: 'white',
          parental_consent: body.tipoAluno === 'adulto' ? true : null,
        })
        .select('id')
        .single();

      if (studentError || !student) {
        console.error('[createStudent] Student error:', studentError?.message);
        return NextResponse.json(
          { error: `Erro ao criar aluno: ${studentError?.message ?? 'unknown'}` },
          { status: 400 },
        );
      }
      studentId = student.id;
    }

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
        console.error('[createStudent] Enrollment error:', enrollError.message);
      }
    }

    if (body.responsavel?.email) {
      const guardianEmail = body.responsavel.email.trim().toLowerCase();
      let guardianUser = existingUsers?.users?.find((candidate) => candidate.email === guardianEmail) ?? null;

      if (!guardianUser) {
        const { data: createdGuardianUser, error: guardianAuthError } = await supabase.auth.admin.createUser({
          email: guardianEmail,
          password: TEMP_PASSWORD,
          email_confirm: true,
          user_metadata: {
            display_name: body.responsavel.nome,
            needs_password_change: true,
          },
        });

        if (guardianAuthError || !createdGuardianUser.user) {
          console.error('[createStudent] Guardian auth error:', guardianAuthError?.message);
        } else {
          guardianUser = createdGuardianUser.user;
        }
      }

      if (guardianUser) {
        const { data: existingGuardianProfile } = await supabase
          .from('profiles')
          .select('id, person_id')
          .eq('user_id', guardianUser.id)
          .eq('role', 'responsavel')
          .maybeSingle();

        let guardianProfileId = existingGuardianProfile?.id ?? '';
        let guardianPersonId = existingGuardianProfile?.person_id ?? null;

        if (guardianProfileId) {
          await supabase
            .from('profiles')
            .update({
              display_name: body.responsavel.nome,
              phone: body.responsavel.telefone || null,
              needs_password_change: true,
            })
            .eq('id', guardianProfileId);
        } else {
          const { data: guardianProfile, error: guardianProfileError } = await supabase
            .from('profiles')
            .insert({
              user_id: guardianUser.id,
              role: 'responsavel',
              display_name: body.responsavel.nome,
              phone: body.responsavel.telefone || null,
              needs_password_change: true,
            })
            .select('id, person_id')
            .single();

          if (guardianProfileError || !guardianProfile) {
            console.error('[createStudent] Guardian profile error:', guardianProfileError?.message);
          } else {
            guardianProfileId = guardianProfile.id;
            guardianPersonId = guardianProfile.person_id;
          }
        }

        if (guardianProfileId) {
          if (!guardianPersonId) {
            const { data: guardianPerson } = await supabase
              .from('people')
              .insert({
                account_id: guardianUser.id,
                full_name: body.responsavel.nome,
                email: guardianEmail,
                phone: body.responsavel.telefone || null,
              })
              .select('id')
              .single();

            guardianPersonId = guardianPerson?.id ?? null;
            if (guardianPersonId) {
              await supabase.from('profiles').update({ person_id: guardianPersonId }).eq('id', guardianProfileId);
            }
          }

          await supabase.from('memberships').upsert(
            {
              profile_id: guardianProfileId,
              academy_id: academyId,
              role: 'responsavel',
              status: 'active',
            },
            { onConflict: 'profile_id,academy_id,role' },
          );

          const relation = normalizeRelationship(body.responsavel.parentesco);

          const { error: guardiansTableError } = await supabase
            .from('guardians')
            .upsert(
              {
                guardian_profile_id: guardianProfileId,
                student_id: studentId,
                relation,
              },
              { onConflict: 'guardian_profile_id,student_id' },
            );
          if (guardiansTableError) {
            console.error('[createStudent] Guardian relation error:', guardiansTableError.message);
          }

          const { error: guardianLinkError } = await supabase
            .from('guardian_links')
            .upsert(
              {
                guardian_id: guardianProfileId,
                child_id: profileId,
                relationship: 'parent',
                can_manage_payments: true,
                can_precheckin: true,
                can_view_grades: true,
              },
              { onConflict: 'guardian_id,child_id' },
            );
          if (guardianLinkError) {
            console.error('[createStudent] Guardian link error:', guardianLinkError.message);
          }
        }
      }
    }

    if (membership?.id) {
      const baseAmount = body.tipo === 'matricula' ? plan?.price ?? 0 : 0;
      const recurrence = body.tipo === 'matricula' ? normalizeRecurrence(plan?.interval) : 'none';

      const { error: financialProfileError } = await supabase
        .from('student_financial_profiles')
        .upsert(
          {
            academy_id: academyId,
            membership_id: membership.id,
            profile_id: profileId,
            financial_model: body.tipo === 'matricula' ? 'particular' : 'cortesia',
            charge_mode: body.tipo === 'matricula' ? 'manual' : 'hybrid',
            payment_method_default: body.tipo === 'matricula' ? 'pix' : 'none',
            recurrence,
            amount_cents: baseAmount,
            due_day: body.tipo === 'matricula' ? 10 : null,
            next_due_date: body.tipo === 'matricula' ? `${currentMonthReference()}-10` : null,
            financial_status: body.tipo === 'matricula' ? 'em_dia' : 'isento',
            monthly_checkin_minimum: 0,
          },
          { onConflict: 'membership_id' },
        );

      if (financialProfileError) {
        console.error('[createStudent] Financial profile error:', financialProfileError.message);
      }
    }

    await supabase.from('audit_log').insert({
      academy_id: academyId,
      action: 'create',
      entity_type: 'student',
      entity_id: studentId,
      new_data: { name: body.nome, email: normalizedEmail, role, tipo: body.tipo, origem: body.origem },
    }).then(({ error: auditErr }) => {
      if (auditErr) console.error('[createStudent] Audit error:', auditErr.message);
    });

    return NextResponse.json({
      alunoId: studentId,
      profileId,
      tipo: body.tipo,
      loginTemporario: {
        email: normalizedEmail,
        senhaTemporaria: TEMP_PASSWORD,
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
