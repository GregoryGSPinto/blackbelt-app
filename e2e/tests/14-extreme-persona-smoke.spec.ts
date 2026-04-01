import { test, expect } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { TEST_USERS, login } from '../helpers/auth';
import { assertPageLoaded, dismissOverlays } from '../helpers/assertions';

type PersonaContext = {
  academyId: string;
  checkinStudentName: string;
};

const personaContext: PersonaContext = {
  academyId: '',
  checkinStudentName: TEST_USERS.kids.displayName,
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

test.describe.serial('Extreme persona smoke', () => {
  test.beforeAll(async () => {
    const admin = getAdminSupabase();
    const { data: authUsers, error: authError } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (authError) throw authError;

    const adminUser = authUsers.users.find((user) => user.email === TEST_USERS.admin.email);
    const kidsUser = authUsers.users.find((user) => user.email === TEST_USERS.kids.email);
    if (!adminUser || !kidsUser) {
      throw new Error('Usuarios seeded obrigatorios nao encontrados.');
    }

    const [{ data: adminProfile }, { data: kidsProfile }] = await Promise.all([
      admin.from('profiles').select('id').eq('user_id', adminUser.id).eq('role', 'admin').single(),
      admin.from('profiles').select('display_name').eq('user_id', kidsUser.id).eq('role', 'aluno_kids').single(),
    ]);

    const { data: membership } = await admin
      .from('memberships')
      .select('academy_id')
      .eq('profile_id', adminProfile?.id ?? '')
      .eq('role', 'admin')
      .eq('status', 'active')
      .single();

    personaContext.academyId = (membership?.academy_id as string | undefined) ?? '';
    personaContext.checkinStudentName = (kidsProfile?.display_name as string | undefined) ?? TEST_USERS.kids.displayName;
  });

  test('aluno adulto navega no mobile sem tela muda nem contexto quebrado', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await login(page, TEST_USERS.aluno_adulto);
    await page.goto('/dashboard');
    await page.waitForLoadState('load');
    await dismissOverlays(page);
    await assertPageLoaded(page);

    await expect(page.locator('text=Nao foi possivel identificar seu cadastro')).toHaveCount(0);
    await expect(page.locator('#main-content')).toContainText(/Check-in|Proxima Aula|Descansa!/i);
  });

  test('responsavel opera no mobile sem erro de identidade ou contexto', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await login(page, TEST_USERS.responsavel);
    await page.goto('/parent');
    await page.waitForLoadState('load');
    await dismissOverlays(page);
    await assertPageLoaded(page);

    await expect(page.locator('text=Nao foi possivel identificar o responsavel')).toHaveCount(0);
    await expect(page.locator('text=Nao foi possivel carregar a rotina da familia')).toHaveCount(0);
    await expect(page.locator('#main-content')).toContainText(/Acompanhe a evolucao dos seus filhos|Nenhum filho vinculado/i);
  });

  test('professor navega em viewport de tablet sem perder a rotina principal', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await login(page, TEST_USERS.professor);
    await page.goto('/professor');
    await page.waitForLoadState('load');
    await dismissOverlays(page);
    await assertPageLoaded(page);

    await expect(page.locator('#main-content')).toContainText(/Dashboard|Modo Aula|Turmas/i);
  });

  test('recepcao recebe feedback claro para busca curta e busca sem resultado antes do check-in', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await login(page, TEST_USERS.recepcionista);
    await page.goto('/recepcao/checkin');
    await page.waitForLoadState('load');
    await dismissOverlays(page);
    await assertPageLoaded(page);

    const input = page.getByPlaceholder('Buscar aluno por nome... (foco automático)');
    await input.fill('h');
    await expect(page.locator('text=Continue digitando. Use pelo menos 2 letras para liberar o autocomplete.')).toBeVisible();

    await input.fill('zzzz-sem-resultado');
    await expect(page.locator('text=Nenhum aluno encontrado')).toBeVisible({ timeout: 10_000 });

    await input.fill(personaContext.checkinStudentName);
    await expect(page.locator(`button:has-text("${personaContext.checkinStudentName}")`).first()).toBeVisible({ timeout: 10_000 });
  });

  test('super admin abre a central sem fallback mudo no desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await login(page, TEST_USERS.superadmin);
    await page.goto('/superadmin');
    await page.waitForLoadState('load');
    await dismissOverlays(page);
    await assertPageLoaded(page, { timeout: 20_000 });

    await expect(page.locator('text=Mission Control')).toBeVisible({ timeout: 20_000 });
  });
});
