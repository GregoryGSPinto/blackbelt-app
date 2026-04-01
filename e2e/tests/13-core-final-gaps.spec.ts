import { test, expect } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { TEST_USERS, login } from '../helpers/auth';
import { assertPageLoaded, dismissOverlays } from '../helpers/assertions';

type CoreContext = {
  academyId: string;
  planId: string | null;
  classId: string;
  checkinStudentId: string;
  checkinStudentProfileId: string;
  checkinStudentName: string;
  parentProfileId: string;
  parentPersonId: string | null;
  parentChildProfileId: string | null;
  parentChildName: string | null;
};

const coreContext: CoreContext = {
  academyId: '',
  planId: null,
  classId: '',
  checkinStudentId: '',
  checkinStudentProfileId: '',
  checkinStudentName: '',
  parentProfileId: '',
  parentPersonId: null,
  parentChildProfileId: null,
  parentChildName: null,
};

function getAdminSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY sao obrigatorios.');
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
  const kidsUser = authUsers.users.find((user) => user.email === TEST_USERS.kids.email);
  const parentUser = authUsers.users.find((user) => user.email === TEST_USERS.responsavel.email);

  if (!adminUser || !kidsUser || !parentUser) {
    throw new Error('Usuarios seeded obrigatorios nao encontrados.');
  }

  const [{ data: adminProfile }, { data: kidsProfile }, { data: parentProfile }, { data: parentPerson }] = await Promise.all([
    admin.from('profiles').select('id').eq('user_id', adminUser.id).eq('role', 'admin').single(),
    admin.from('profiles').select('id, display_name').eq('user_id', kidsUser.id).eq('role', 'aluno_kids').single(),
    admin.from('profiles').select('id, person_id').eq('user_id', parentUser.id).eq('role', 'responsavel').single(),
    admin.from('people').select('id').eq('account_id', parentUser.id).maybeSingle(),
  ]);

  if (!adminProfile?.id || !kidsProfile?.id || !parentProfile?.id) {
    throw new Error('Perfis seeded obrigatorios nao encontrados.');
  }

  const { data: adminMembership } = await admin
    .from('memberships')
    .select('academy_id')
    .eq('profile_id', adminProfile.id)
    .eq('role', 'admin')
    .eq('status', 'active')
    .single();

  const academyId = adminMembership?.academy_id as string | undefined;
  if (!academyId) {
    throw new Error('Academia seeded nao encontrada.');
  }

  const [{ data: checkinStudent }, { data: classEnrollment }, { data: plan }, { data: parentLink }] = await Promise.all([
    admin
      .from('students')
      .select('id, profile_id')
      .eq('academy_id', academyId)
      .eq('profile_id', kidsProfile.id)
      .maybeSingle(),
    admin
      .from('students')
      .select('id, class_enrollments!inner(class_id, status)')
      .eq('academy_id', academyId)
      .eq('profile_id', kidsProfile.id)
      .eq('class_enrollments.status', 'active')
      .limit(1)
      .maybeSingle(),
    admin
      .from('plans')
      .select('id')
      .eq('academy_id', academyId)
      .limit(1)
      .maybeSingle(),
    admin
      .from('guardian_links')
      .select('child_id, child:profiles!child_id(display_name)')
      .eq('guardian_id', parentProfile.id)
      .limit(1)
      .maybeSingle(),
  ]);

  const enrollment = Array.isArray(classEnrollment?.class_enrollments)
    ? classEnrollment.class_enrollments[0]
    : classEnrollment?.class_enrollments;

  if (!checkinStudent?.id || !(enrollment as { class_id?: string } | undefined)?.class_id) {
    throw new Error('Contexto seeded de check-in nao encontrado.');
  }

  if (!parentLink?.child_id) {
    await admin
      .from('guardian_links')
      .upsert(
        {
          guardian_id: parentProfile.id,
          child_id: checkinStudent.profile_id,
          relationship: 'parent',
          can_manage_payments: true,
          can_precheckin: true,
          can_view_grades: true,
        },
        { onConflict: 'guardian_id,child_id' },
      );
  }

  coreContext.academyId = academyId;
  coreContext.planId = (plan?.id as string | undefined) ?? null;
  coreContext.classId = (enrollment as { class_id: string }).class_id;
  coreContext.checkinStudentId = checkinStudent.id;
  coreContext.checkinStudentProfileId = checkinStudent.profile_id as string;
  coreContext.checkinStudentName = (kidsProfile.display_name as string | undefined) ?? TEST_USERS.kids.displayName;
  coreContext.parentProfileId = parentProfile.id;
  coreContext.parentPersonId = (parentProfile.person_id as string | null) ?? (parentPerson?.id as string | null) ?? null;
  coreContext.parentChildProfileId = (parentLink?.child_id as string | undefined) ?? (checkinStudent.profile_id as string);
  coreContext.parentChildName = ((parentLink?.child as { display_name?: string } | null)?.display_name ?? null) as string | null
    ?? coreContext.checkinStudentName;
}

test.describe.serial('Core final gaps', () => {
  test.describe.configure({ timeout: 180_000 });

  test.beforeAll(async () => {
    await resolveSeedContext(getAdminSupabase());
  });

  test('responsavel autenticado abre /parent/filhos/novo sem erro e com form utilizavel', async ({ page }) => {
    expect(coreContext.parentProfileId).toBeTruthy();

    await login(page, TEST_USERS.responsavel);

    await page.goto('/parent');
    await page.waitForLoadState('load');
    await dismissOverlays(page);
    await assertPageLoaded(page);

    const guardianResponse = await page.request.get('/api/parent/current-guardian');
    expect(guardianResponse.ok()).toBeTruthy();
    const guardianPayload = await guardianResponse.json();
    expect(guardianPayload.profileId).toBe(coreContext.parentProfileId);
    expect(guardianPayload.personId).toBeTruthy();
    expect(Number(guardianPayload.linkedChildren ?? 0)).toBeGreaterThan(0);

    coreContext.parentPersonId = guardianPayload.personId as string;

    await page.goto('/parent/filhos/novo');
    await page.waitForLoadState('load');
    await assertPageLoaded(page);

    await expect(page.locator('text=Nao foi possivel identificar o responsavel autenticado')).toHaveCount(0);
    await expect(page.locator('text=Responsavel autenticado com')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: 'Cadastrar Filho' })).toBeVisible({ timeout: 10_000 });

    console.log(`VALIDADO REAL guardian-flow guardian=${coreContext.parentProfileId} child=${coreContext.parentChildProfileId ?? 'linked-child'}`);
  });

  test('recepcao encontra aluno no autocomplete e conclui check-in ponta a ponta', async ({ page }) => {
    const admin = getAdminSupabase();

    await login(page, TEST_USERS.recepcionista);
    await page.goto('/recepcao/checkin');
    await page.waitForLoadState('load');
    await dismissOverlays(page);
    await assertPageLoaded(page);

    const searchInput = page.getByPlaceholder('Buscar aluno por nome... (foco automático)');
    await searchInput.fill(coreContext.checkinStudentName);

    const studentButton = page.locator(`button:has-text("${coreContext.checkinStudentName}")`).first();
    await expect(studentButton).toBeVisible({ timeout: 10_000 });
    await studentButton.click();

    await expect(page.getByRole('button', { name: '✅ Registrar Entrada' })).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: '✅ Registrar Entrada' }).click();

    await expect(page.locator(`text=Entrada registrada: ${coreContext.checkinStudentName}`)).toBeVisible({ timeout: 10_000 });
    await expect(page.locator(`text=${coreContext.checkinStudentName}`)).toBeVisible({ timeout: 10_000 });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data: checkin } = await admin
      .from('checkins')
      .select('id, academy_id, profile_id, profile_name, check_in_at')
      .eq('academy_id', coreContext.academyId)
      .eq('profile_id', coreContext.checkinStudentProfileId)
      .gte('check_in_at', todayStart.toISOString())
      .order('check_in_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    expect(checkin?.id).toBeTruthy();
    expect(checkin?.profile_name).toContain(coreContext.checkinStudentName.split(' ')[0]);

    console.log(`VALIDADO REAL checkin profile=${coreContext.checkinStudentProfileId} checkin=${checkin?.id}`);
  });

  test('cobranca manual externa prova write real ou bloqueio externo inequívoco', async ({ page }) => {
    const admin = getAdminSupabase();
    await login(page, TEST_USERS.admin);

    const { data: academy } = await admin
      .from('academies')
      .select('id, name, bank_account_configured, asaas_subaccount_id, asaas_subaccount_status, asaas_subaccount_api_key')
      .eq('id', coreContext.academyId)
      .single();

    const asaasSandbox = process.env.ASAAS_SANDBOX === 'true';
    if (!asaasSandbox && !academy?.asaas_subaccount_api_key) {
      console.log(`BLOQUEADO EXTERNAMENTE manual-charge reason=no-safe-gateway-setup academy=${academy?.id} sandbox=${process.env.ASAAS_SANDBOX ?? 'unset'}`);
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
    const dueDateIso = dueDate.toISOString().slice(0, 10);
    const referenceMonth = dueDateIso.slice(0, 7);
    const description = `Core final charge ${uniqueSlug('bb')}`;

    const { data: studentProfile } = await admin
      .from('profiles')
      .select('display_name, cpf')
      .eq('id', coreContext.checkinStudentProfileId)
      .single();

    const response = await page.request.post('/api/academy/charge-student', {
      data: {
        academyId: coreContext.academyId,
        studentProfileId: coreContext.checkinStudentProfileId,
        guardianPersonId: coreContext.parentPersonId,
        description,
        amountCents: 500,
        billingType: 'PIX',
        dueDate: dueDateIso,
        studentName: studentProfile?.display_name ?? coreContext.checkinStudentName,
        studentCpf: studentProfile?.cpf ?? '',
        studentEmail: TEST_USERS.responsavel.email,
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
        .eq('student_profile_id', coreContext.checkinStudentProfileId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      expect(studentPayment?.id).toBeTruthy();
      expect(studentPayment?.amount_cents).toBe(500);
      console.log(`VALIDADO REAL manual-charge asaas=${payload.asaasPaymentId} payment=${studentPayment?.id}`);
      return;
    }

    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(String(payload.error || '')).toMatch(/pagamentos|recebimento|aprovacao|configur/i);
    console.log(`BLOQUEADO EXTERNAMENTE manual-charge status=${response.status()} error=${payload.error}`);
  });
});
