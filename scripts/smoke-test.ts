#!/usr/bin/env tsx
/**
 * BlackBelt v2 — Smoke Test
 * Verifica que os dados do seed estão acessíveis e os fluxos críticos funcionam.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Faltam NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

interface TestResult {
  name: string;
  passed: boolean;
  detail: string;
}

const results: TestResult[] = [];

async function test(name: string, fn: () => Promise<string>) {
  try {
    const detail = await fn();
    results.push({ name, passed: true, detail });
    console.log(`  PASS  ${name}: ${detail}`);
  } catch (err: any) {
    results.push({ name, passed: false, detail: err.message });
    console.log(`  FAIL  ${name}: ${err.message}`);
  }
}

async function main() {
  console.log('BlackBelt v2 — Smoke Test\n');

  // 1. Super Admin existe
  await test('Super Admin', async () => {
    const { data } = await supabase.from('profiles').select('*').eq('role', 'superadmin');
    if (!data || data.length === 0) throw new Error('Nenhum superadmin encontrado');
    return `${data.length} superadmin(s): ${data.map((p: any) => p.display_name).join(', ')}`;
  });

  // 2. Academia existe
  await test('Academia', async () => {
    const { data } = await supabase.from('academies').select('*');
    if (!data || data.length === 0) throw new Error('Nenhuma academia encontrada');
    return `${data.length} academia(s): ${data.map((a: any) => a.name).join(', ')}`;
  });

  // 3. Profiles por role
  await test('Profiles por role', async () => {
    const { data } = await supabase.from('profiles').select('role');
    if (!data || data.length === 0) throw new Error('Nenhum profile encontrado');
    const roles: Record<string, number> = {};
    data.forEach((p: any) => { roles[p.role] = (roles[p.role] || 0) + 1; });
    return Object.entries(roles).map(([r, c]) => `${r}: ${c}`).join(', ');
  });

  // 4. Memberships (profiles vinculados a academies)
  await test('Memberships', async () => {
    const { data } = await supabase.from('memberships').select('*');
    if (!data || data.length === 0) throw new Error('Nenhum membership encontrado');
    return `${data.length} memberships`;
  });

  // 5. Classes/Turmas
  await test('Turmas', async () => {
    const { data } = await supabase.from('classes').select('*');
    if (!data || data.length === 0) throw new Error('Nenhuma turma encontrada');
    return `${data.length} turma(s)`;
  });

  // 6. Attendance records
  await test('Check-ins', async () => {
    const { data } = await supabase.from('attendance').select('*').limit(5);
    if (!data || data.length === 0) throw new Error('Nenhum check-in encontrado');
    return `${data.length}+ check-ins (limitado a 5)`;
  });

  // 7. Notifications
  await test('Notificacoes', async () => {
    const { data } = await supabase.from('notifications').select('*').limit(5);
    if (!data || data.length === 0) throw new Error('Nenhuma notificacao encontrada');
    return `${data.length}+ notificacoes`;
  });

  // 8. Auth users (via admin API)
  await test('Auth users', async () => {
    const { data } = await supabase.auth.admin.listUsers();
    if (!data || data.users.length === 0) throw new Error('Nenhum auth user');
    return `${data.users.length} auth users`;
  });

  // 9. Login funciona (super admin)
  await test('Login super admin', async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'gregoryguimaraes12@gmail.com',
      password: '@Greg1994',
    });
    if (error) throw error;
    if (!data.session) throw new Error('Sem session');
    return `Token obtido, expires_at: ${new Date(data.session.expires_at! * 1000).toISOString()}`;
  });

  // 10. Login funciona (admin academia)
  await test('Login admin academia', async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'roberto@guerreiros.com',
      password: 'BlackBelt@2026',
    });
    if (error) throw error;
    if (!data.session) throw new Error('Sem session');
    return `Token obtido para roberto@guerreiros.com`;
  });

  // Summary
  console.log('\n=== RESULTADO ===');
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  console.log(`${passed}/${total} testes passaram`);

  if (passed < total) {
    console.log('\nTestes falharam:');
    results.filter(r => !r.passed).forEach(r => console.log(`   - ${r.name}: ${r.detail}`));
    process.exit(1);
  } else {
    console.log('\nTodos os testes passaram! O banco esta pronto para demo.');
  }
}

main();
