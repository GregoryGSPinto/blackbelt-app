# BLACKBELT v2 — Pós-Migrations: Seed + Verificação

## CONTEXTO

As migrations 053–060 foram criadas mas ainda NÃO foram executadas no Supabase.
Gregory vai executá-las manualmente no SQL Editor ANTES de rodar este prompt.
Este prompt assume que as migrations JÁ ESTÃO no banco.

---

## PRÉ-REQUISITO (Gregory faz manualmente ANTES de rodar este prompt)

1. Abra https://supabase.com/dashboard → projeto `tdplmmodmumryzdosmpv` → SQL Editor
2. Execute em ordem (copie o conteúdo de cada arquivo e rode):
   - `supabase/migrations/053_auth_trigger_aluno_default.sql`
   - `supabase/migrations/054_missing_tables_final.sql`
   - `supabase/migrations/055_tables_academy_config.sql`
   - `supabase/migrations/056_tables_financial.sql`
   - `supabase/migrations/057_tables_training.sql`
   - `supabase/migrations/058_tables_communication.sql`
   - `supabase/migrations/059_tables_gamification.sql`
   - `supabase/migrations/060_tables_misc.sql`
3. Confirme que todas rodaram sem erro

---

## EXECUÇÃO — 5 BLOCOS

### BLOCO 1 — Verificar Schema

Rode o script de verificação para confirmar que TODAS as tabelas existem no banco:

```bash
npx tsx scripts/verify-schema.ts
```

Se houver tabelas faltantes, PARE e reporte. Gregory precisa rodar a migration correspondente.

Se tudo estiver presente, continue.

---

### BLOCO 2 — Rodar Seed

O seed precisa da `SUPABASE_SERVICE_ROLE_KEY`. Verifique se está no `.env.local`:

```bash
grep "SUPABASE_SERVICE_ROLE_KEY" .env.local
```

Se NÃO estiver, PARE e peça para Gregory adicionar. Ele encontra a key em:
Supabase Dashboard → Settings → API → service_role (secret)

Se estiver presente, rode o seed:

```bash
npx tsx scripts/seed-full-academy.ts 2>&1
```

**Se o seed falhar:**
1. Leia o erro com atenção
2. Se for erro de tabela faltante → a migration não foi executada, PARE
3. Se for erro de constraint/FK → ajuste o seed para respeitar a ordem de inserção
4. Se for erro de permissão → verifique se está usando service_role_key
5. Se for erro de duplicata → rode a seção de cleanup do seed primeiro:
   ```bash
   # O seed já tem cleanup integrado, mas se precisar rodar separado:
   npx tsx -e "
     const { createClient } = require('@supabase/supabase-js');
     const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
     // delete in reverse dependency order
     await s.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
     await s.auth.admin.listUsers().then(r => r.data.users.forEach(u => s.auth.admin.deleteUser(u.id)));
   "
   ```

**Resultado esperado do seed:**
- 33 users criados (super admin + 32 da academia)
- Academia "Guerreiros do Tatame" com units, modalities, classes
- Attendance records, achievements, invoices, notifications
- Mensagem final: "Seed completo: N+ registros criados"

---

### BLOCO 3 — Criar Script de Smoke Test

Crie um script que verifica os fluxos críticos consultando o banco diretamente:

```bash
cat > scripts/smoke-test.ts << 'SCRIPT'
#!/usr/bin/env tsx
/**
 * BlackBelt v2 — Smoke Test
 * Verifica que os dados do seed estão acessíveis e os fluxos críticos funcionam.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Faltam NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY');
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
    console.log(`✅ ${name}: ${detail}`);
  } catch (err: any) {
    results.push({ name, passed: false, detail: err.message });
    console.log(`❌ ${name}: ${err.message}`);
  }
}

async function main() {
  console.log('🔍 BlackBelt v2 — Smoke Test\n');

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
  await test('Notificações', async () => {
    const { data } = await supabase.from('notifications').select('*').limit(5);
    if (!data || data.length === 0) throw new Error('Nenhuma notificação encontrada');
    return `${data.length}+ notificações`;
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
    console.log('\n❌ Testes falharam:');
    results.filter(r => !r.passed).forEach(r => console.log(`   - ${r.name}: ${r.detail}`));
    process.exit(1);
  } else {
    console.log('\n🎉 Todos os testes passaram! O banco está pronto para demo.');
  }
}

main();
SCRIPT
```

Rode o smoke test:

```bash
npx tsx scripts/smoke-test.ts
```

Se todos os 10 testes passarem, continue. Se algum falhar, investigue e corrija.

---

### BLOCO 4 — Verificar Deploy na Vercel

```bash
# Verificar que o deploy mais recente está OK
curl -s -o /dev/null -w "%{http_code}" https://blackbelts.com.br
# Deve retornar 200

curl -s -o /dev/null -w "%{http_code}" https://blackbelts.com.br/login
# Deve retornar 200
```

Se retornar 200, o deploy está OK.

Se retornar 500 ou outro erro, verifique:
1. Vercel Dashboard → Deployments → logs do build mais recente
2. Se as env vars estão configuradas no Vercel

---

### BLOCO 5 — Commit + Push + Report

```bash
git add scripts/smoke-test.ts
git commit -m "feat: smoke test script — 10 verificações de dados e auth

- Super admin, academia, profiles por role, memberships
- Turmas, check-ins, notificações
- Auth users, login super admin, login admin academia
- Roda com: npx tsx scripts/smoke-test.ts"

git push origin main
```

Reporte o resultado final no formato:

```
=== RESULTADO FINAL ===
verify-schema: X/Y tabelas presentes
seed: Z registros criados
smoke-test: N/10 testes passaram
vercel: HTTP [status]
```

---

## SE ALGO DER ERRADO

### Erro: "relation does not exist"
→ A migration correspondente não foi executada. Gregory precisa rodar no SQL Editor.

### Erro: "permission denied for table"
→ RLS está bloqueando. O seed DEVE usar service_role_key (bypassa RLS).

### Erro: "duplicate key value violates unique constraint"
→ O seed foi rodado duas vezes sem cleanup. O cleanup no início do seed deveria resolver. Se persistir, delete manualmente:
```sql
-- No SQL Editor do Supabase:
DELETE FROM public.memberships;
DELETE FROM public.profiles;
-- Depois rode o seed novamente
```

### Erro: "foreign key constraint"
→ Uma tabela referencia outra que não existe. Verifique se TODAS as migrations 001–060 foram executadas.
