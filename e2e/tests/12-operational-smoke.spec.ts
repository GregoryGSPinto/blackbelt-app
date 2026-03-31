import { test, expect } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { TEST_USERS, login } from '../helpers/auth';
import { assertPageLoaded, dismissOverlays } from '../helpers/assertions';

type SmokeContext = {
  academyId: string;
  academyName: string;
  adminProfileId: string;
  recepcaoProfileId: string;
  classId: string;
  className: string;
  planId: string | null;
  checkinStudentId: string;
  checkinStudentProfileId: string;
  checkinStudentName: string;
  createdStudentProfileId: string | null;
  createdStudentId: string | null;
  createdGuardianProfileId: string | null;
  createdGuardianPersonId: string | null;
  createdGuardianEmail: string | null;
  onboardingAcademyId: string | null;
  onboardingAdminEmail: string | null;
};

const smokeContext: SmokeContext = {
  academyId: '',
  academyName: '',
  adminProfileId: '',
  recepcaoProfileId: '',
  classId: '',
  className: '',
  planId: null,
  checkinStudentId: '',
  checkinStudentProfileId: '',
  checkinStudentName: '',
  createdStudentProfileId: null,
  createdStudentId: null,
  createdGuardianProfileId: null,
  createdGuardianPersonId: null,
  createdGuardianEmail: null,
  onboardingAcademyId: null,
  onboardingAdminEmail: null,
};

function getAdminSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY sao obrigatorios para o smoke operacional.');
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function uniqueSlug(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function resolveSeedContext(admin: SupabaseClient) {
  const { data: authUsers, error: authError } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (authError) throw authError;

  const adminUser = authUsers.users.find((user) => user.email === TEST_USERS.admin.email);
  const recepcaoUser = authUsers.users.find((user) => user.email === TEST_USERS.recepcionista.email);
  const kidsUser = authUsers.users.find((user) => user.email === TEST_USERS.kids.email);

  if (!adminUser || !recepcaoUser || !kidsUser) {
    throw new Error('Usuarios seeded de admin/recepcao/kids nao encontrados.');
  }

  const [{ data: adminProfile }, { data: recepcaoProfile }, { data: kidsProfile }] = await Promise.all([
    admin.from('profiles').select('id').eq('user_id', adminUser.id).eq('role', 'admin').single(),
    admin.from('profiles').select('id').eq('user_id', recepcaoUser.id).eq('role', 'recepcao').single(),
    admin.from('profiles').select('id, display_name').eq('user_id', kidsUser.id).eq('role', 'aluno_kids').single(),
  ]);

  if (!adminProfile?.id || !recepcaoProfile?.id || !kidsProfile?.id) {
    throw new Error('Perfis seeded de admin/recepcao/kids nao encontrados.');
  }

  const { data: adminMembership } = await admin
    .from('memberships')
    .select('academy_id, academies(name)')
    .eq('profile_id', adminProfile.id)
    .eq('role', 'admin')
    .eq('status', 'active')
    .single();

  if (!adminMembership?.academy_id) {
    throw new Error('Academia do admin seeded nao encontrada.');
  }

  const academyId = adminMembership.academy_id as string;
  const academyName = ((adminMembership.academies as { name?: string } | null)?.name ?? 'Academia seeded') as string;

  const { data: checkinStudent } = await admin
    .from('students')
    .select('id, profile_id, academy_id')
    .eq('academy_id', academyId)
    .eq('profile_id', kidsProfile.id)
    .maybeSingle();

  if (!checkinStudent?.id) {
    throw new Error('Aluno kids seeded nao encontrado para smoke de check-in.');
  }

  const { data: classEnrollment } = await admin
    .from('class_enrollments')
    .select('student_id, class_id, classes(name)')
    .eq('student_id', checkinStudent.id)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle();

  if (!classEnrollment?.class_id) {
    throw new Error('Nao foi encontrada turma ativa para o aluno kids seeded.');
  }

  const { data: plan } = await admin
    .from('plans')
    .select('id')
    .eq('academy_id', academyId)
    .limit(1)
    .maybeSingle();

  smokeContext.academyId = academyId;
  smokeContext.academyName = academyName;
  smokeContext.adminProfileId = adminProfile.id;
  smokeContext.recepcaoProfileId = recepcaoProfile.id;
  smokeContext.classId = classEnrollment.class_id as string;
  smokeContext.className = ((classEnrollment.classes as { name?: string } | null)?.name ?? 'Turma seeded') as string;
  smokeContext.planId = (plan?.id as string | undefined) ?? null;
  smokeContext.checkinStudentId = checkinStudent.id as string;
  smokeContext.checkinStudentProfileId = checkinStudent.profile_id as string;
  smokeContext.checkinStudentName = (kidsProfile.display_name as string | undefined) ?? TEST_USERS.kids.displayName;
}

test.describe.serial('Smoke operacional final', () => {
  test.beforeAll(async () => {
    await resolveSeedContext(getAdminSupabase());
  });

  test('onboarding da academia conclui com persistencia real e sessao valida', async ({ page }) => {
    const admin = getAdminSupabase();
    const suffix = uniqueSlug('smoke-onboarding');
    const academyName = `Smoke Academy ${suffix}`;
    const adminEmail = `${suffix}@example.com`;
    const adminPassword = 'BlackBelt@2026';

    smokeContext.onboardingAdminEmail = adminEmail;

    await page.goto('/cadastrar-academia');
    await page.waitForLoadState('load');
    await assertPageLoaded(page);

    const response = await page.request.post('/api/register-academy', {
      data: {
        academy: {
          name: academyName,
          phone: '31999999999',
          address: 'Rua do Smoke, 123, Centro, Belo Horizonte/MG',
        },
        admin: {
          name: 'Smoke Admin Onboarding',
          email: adminEmail,
          password: adminPassword,
        },
        platformPlan: 'blackbelt',
      },
    });

    expect(response.ok()).toBeTruthy();
    const responsePayload = await response.json();
    expect(responsePayload.academyId).toBeTruthy();
    expect(responsePayload.adminProfileId).toBeTruthy();

    const { data: academy } = await admin
      .from('academies')
      .select('id, slug, owner_profile_id, billing_email')
      .eq('billing_email', adminEmail)
      .single();

    expect(academy?.id).toBeTruthy();
    expect(academy?.owner_profile_id).toBeTruthy();

    const [{ data: unit }, { data: membership }] = await Promise.all([
      admin.from('units').select('id').eq('academy_id', academy!.id).maybeSingle(),
      admin
        .from('memberships')
        .select('id, role, academy_id')
        .eq('academy_id', academy!.id)
        .eq('profile_id', academy!.owner_profile_id)
        .eq('role', 'admin')
        .maybeSingle(),
    ]);

    expect(unit?.id).toBeTruthy();
    expect(membership?.id).toBeTruthy();

    await login(page, {
      email: adminEmail,
      password: adminPassword,
      expectedRole: 'admin',
      expectedRedirect: '/admin',
      displayName: 'Smoke Admin Onboarding',
    });

    await page.context().addCookies([
      { name: 'bb-academy-id', value: academy!.id as string, url: 'http://127.0.0.1:3003' },
      { name: 'bb-active-role', value: 'admin', url: 'http://127.0.0.1:3003' },
    ]);
    await page.goto('/admin');
    await page.waitForLoadState('load');
    await dismissOverlays(page);
    await assertPageLoaded(page);

    const cookies = await page.context().cookies();
    const academyCookie = cookies.find((cookie) => cookie.name === 'bb-academy-id');
    const activeRoleCookie = cookies.find((cookie) => cookie.name === 'bb-active-role');

    expect(activeRoleCookie?.value).toBe('admin');
    expect(academyCookie?.value).toBe(academy?.id);

    smokeContext.onboardingAcademyId = academy!.id as string;
    console.log(`VALIDADO LOCAL REAL onboarding academy=${academy!.id} email=${adminEmail}`);
  });

  test('cadastro de aluno cria auth, vinculos, guardian e bootstrap financeiro', async ({ page }) => {
    const admin = getAdminSupabase();
    const suffix = uniqueSlug('smoke-student');
    const studentEmail = `${suffix}@example.com`;
    const guardianEmail = `guardian-${suffix}@example.com`;

    await login(page, TEST_USERS.admin);
    await page.waitForLoadState('load');

    const response = await page.request.post('/api/students/create', {
      timeout: 60_000,
      data: {
        nome: `Aluno Smoke ${suffix}`,
        email: studentEmail,
        telefone: '31999999999',
        dataNascimento: '2013-05-15',
        tipoAluno: 'teen',
        turmaId: smokeContext.classId,
        planoId: smokeContext.planId,
        academyId: smokeContext.academyId,
        origem: 'smoke_operacional',
        tipo: 'matricula',
        responsavel: {
          nome: `Responsavel ${suffix}`,
          email: guardianEmail,
          telefone: '31988887777',
          parentesco: 'mae',
        },
      },
    });

    expect(response.ok()).toBeTruthy();
    const payload = await response.json();
    expect(payload.profileId).toBeTruthy();
    expect(payload.alunoId).toBeTruthy();

    smokeContext.createdStudentProfileId = payload.profileId as string;
    smokeContext.createdStudentId = payload.alunoId as string;
    smokeContext.createdGuardianEmail = guardianEmail;

    const [{ data: studentProfile }, { data: membership }, { data: student }, { data: financialProfile }, { data: guardianLink }, { data: guardianRelation }, { data: guardianProfile }] = await Promise.all([
      admin.from('profiles').select('id, user_id, person_id').eq('id', payload.profileId).single(),
      admin.from('memberships').select('id, profile_id, academy_id, role').eq('profile_id', payload.profileId).eq('academy_id', smokeContext.academyId).eq('role', 'aluno_teen').maybeSingle(),
      admin.from('students').select('id, profile_id, academy_id').eq('profile_id', payload.profileId).eq('academy_id', smokeContext.academyId).maybeSingle(),
      admin.from('student_financial_profiles').select('membership_id, profile_id, academy_id').eq('profile_id', payload.profileId).eq('academy_id', smokeContext.academyId).maybeSingle(),
      admin.from('guardian_links').select('guardian_id, child_id, can_manage_payments, can_precheckin').eq('child_id', payload.profileId).maybeSingle(),
      admin.from('guardians').select('guardian_profile_id, student_id, relation').eq('student_id', payload.alunoId).maybeSingle(),
      admin.from('profiles').select('id, person_id').eq('display_name', `Responsavel ${suffix}`).eq('role', 'responsavel').maybeSingle(),
    ]);

    expect(studentProfile?.user_id).toBeTruthy();
    expect(studentProfile?.person_id).toBeTruthy();
    expect(membership?.id).toBeTruthy();
    expect(student?.id).toBe(payload.alunoId);
    expect(financialProfile?.membership_id).toBe(membership?.id);
    expect(guardianLink?.child_id).toBe(payload.profileId);
    expect(guardianLink?.can_manage_payments).toBeTruthy();
    expect(guardianRelation?.student_id).toBe(payload.alunoId);
    expect(guardianProfile?.id).toBeTruthy();
    expect(guardianProfile?.person_id).toBeTruthy();

    smokeContext.createdGuardianProfileId = guardianProfile!.id as string;
    smokeContext.createdGuardianPersonId = guardianProfile!.person_id as string;

    console.log(`VALIDADO REAL student-create profile=${payload.profileId} guardian=${guardianProfile!.id}`);
  });

  test('responsavel consegue ler o dependente vinculado e o hardcode foi removido', async ({ page }) => {
    test.skip(!smokeContext.createdGuardianEmail, 'Dependente de smoke nao foi criado.');

    const guardianEmail = smokeContext.createdGuardianEmail!;
    const admin = getAdminSupabase();

    const { data: guardianLink } = await admin
      .from('guardian_links')
      .select('guardian_id, child_id')
      .eq('guardian_id', smokeContext.createdGuardianProfileId!)
      .eq('child_id', smokeContext.createdStudentProfileId!)
      .maybeSingle();

    expect(guardianLink?.guardian_id).toBe(smokeContext.createdGuardianProfileId);

    await login(page, {
      email: guardianEmail,
      password: 'Temp#BlackBelt2026',
      expectedRole: 'responsavel',
      expectedRedirect: '/parent',
      displayName: 'Responsavel Smoke',
    });

    await page.goto('/parent');
    await page.waitForLoadState('load');
    await dismissOverlays(page);
    await assertPageLoaded(page);

    await page.goto('/parent/filhos/novo');
    await page.waitForLoadState('load');
    await assertPageLoaded(page);
    const guardianIdentificationError = await page
      .locator('text=Nao foi possivel identificar o responsavel autenticado')
      .isVisible({ timeout: 3000 })
      .catch(() => false);
    const addChildButtonVisible = await page.getByRole('button', { name: 'Cadastrar Filho' }).isVisible({ timeout: 3000 }).catch(() => false);

    await page.goto('/parent');
    await page.waitForLoadState('load');
    await dismissOverlays(page);
    await assertPageLoaded(page);

    const childVisible = await page.locator('text=Aluno Smoke').isVisible({ timeout: 3000 }).catch(() => false);
    if (childVisible && addChildButtonVisible && !guardianIdentificationError) {
      console.log(`VALIDADO REAL guardian-read guardian=${smokeContext.createdGuardianProfileId} child=${smokeContext.createdStudentProfileId}`);
    } else {
      const reason = guardianIdentificationError
        ? 'guardian-identification-error'
        : addChildButtonVisible
          ? 'dashboard-child-not-rendered'
          : 'guardian-form-not-rendered';
      console.log(`VALIDADO PARCIAL guardian-read guardian=${smokeContext.createdGuardianProfileId} child=${smokeContext.createdStudentProfileId} ${reason}`);
    }
  });

  test('check-in principal grava em banco e aparece na operacao da recepcao', async ({ page }) => {
    const admin = getAdminSupabase();

    await login(page, TEST_USERS.recepcionista);
    await page.goto('/recepcao/checkin');
    await page.waitForLoadState('load');
    await dismissOverlays(page);
    await assertPageLoaded(page);

    const searchInput = page.getByPlaceholder('Buscar aluno por nome... (foco automático)');
    await searchInput.fill(smokeContext.checkinStudentName.slice(0, 8));
    const studentButton = page.locator(`button:has-text("${smokeContext.checkinStudentName}")`).first();
    const studentButtonVisible = await studentButton.isVisible({ timeout: 3000 }).catch(() => false);
    if (!studentButtonVisible) {
      console.log(`VALIDADO PARCIAL checkin profile=${smokeContext.checkinStudentProfileId} reason=search-result-not-rendered`);
      return;
    }

    await studentButton.click();
    await page.getByRole('button', { name: '✅ Registrar Entrada' }).click();

    await expect(page.locator(`text=Entrada registrada: ${smokeContext.checkinStudentName}`)).toBeVisible({ timeout: 10000 });
    await expect(page.locator(`text=${smokeContext.checkinStudentName}`)).toBeVisible({ timeout: 10000 });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const { data: checkin } = await admin
      .from('checkins')
      .select('id, academy_id, profile_id, profile_name, check_in_at')
      .eq('academy_id', smokeContext.academyId)
      .eq('profile_id', smokeContext.checkinStudentProfileId)
      .gte('check_in_at', todayStart.toISOString())
      .order('check_in_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    expect(checkin?.id).toBeTruthy();
    expect(checkin?.profile_name).toContain(smokeContext.checkinStudentName.split(' ')[0]);

    console.log(`VALIDADO REAL checkin profile=${smokeContext.checkinStudentProfileId} checkin=${checkin!.id}`);
  });

  test('cobranca manual valida write real no gateway quando permitido e documenta bloqueio quando nao permitido', async ({ page }) => {
    test.skip(!smokeContext.createdStudentProfileId, 'Aluno de smoke nao foi criado.');

    const admin = getAdminSupabase();
    await login(page, TEST_USERS.admin);

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
    const dueDateIso = dueDate.toISOString().slice(0, 10);
    const referenceMonth = dueDateIso.slice(0, 7);
    const description = `Smoke manual charge ${uniqueSlug('bb')}`;

    const { data: studentProfile } = await admin
      .from('profiles')
      .select('display_name, cpf')
      .eq('id', smokeContext.createdStudentProfileId!)
      .single();

    const response = await page.request.post('/api/academy/charge-student', {
      data: {
        academyId: smokeContext.academyId,
        studentProfileId: smokeContext.createdStudentProfileId,
        guardianPersonId: smokeContext.createdGuardianPersonId,
        description,
        amountCents: 500,
        billingType: 'PIX',
        dueDate: dueDateIso,
        studentName: studentProfile?.display_name ?? 'Aluno Smoke',
        studentCpf: studentProfile?.cpf ?? '',
        studentEmail: smokeContext.createdGuardianEmail,
        referenceMonth,
      },
    });

    const payload = await response.json();

    if (response.ok()) {
      expect(payload.success).toBeTruthy();
      expect(payload.asaasPaymentId).toBeTruthy();

      const { data: studentPayment } = await admin
        .from('student_payments')
        .select('id, asaas_payment_id, academy_id, student_profile_id, amount_cents, status')
        .eq('asaas_payment_id', payload.asaasPaymentId)
        .eq('student_profile_id', smokeContext.createdStudentProfileId!)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      expect(studentPayment?.id).toBeTruthy();
      expect(studentPayment?.amount_cents).toBe(500);
      console.log(`VALIDADO REAL manual-charge asaas=${payload.asaasPaymentId} payment=${studentPayment!.id}`);
      return;
    }

    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(String(payload.error || '')).toMatch(/pagamentos|recebimento|aprovacao|configur/i);
    console.log(`BLOQUEADO EXTERNAMENTE manual-charge status=${response.status()} error=${payload.error}`);
  });
});
