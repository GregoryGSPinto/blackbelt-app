# BLACKBELT v2 — MIGRATIONS REAIS + SEED + TESTES E2E
## Tudo Funcional no Supabase Real — Zero Mock

> **OBJETIVO:** Aplicar TODAS as migrations pendentes no Supabase real,
> popular com dados de teste realistas, desligar mock mode, e testar
> cada fluxo principal com dados reais.
>
> **SUPABASE PROJECT:** `tdplmmodmumryzdosmpv`
> **DEPLOY:** `blackbelts.com.br`
> **REGRA:** Este prompt usa `SUPABASE_SERVICE_ROLE_KEY` para operações admin.
> Essa chave DEVE ser rotacionada depois dos testes.

---

## PRÉ-EXECUÇÃO: VERIFICAR VARIÁVEIS

```bash
echo "=== VERIFICAÇÃO DE AMBIENTE ==="

# Carregar env
set -a && source .env.local && set +a

# Verificar variáveis críticas
[ -z "$NEXT_PUBLIC_SUPABASE_URL" ] && echo "❌ NEXT_PUBLIC_SUPABASE_URL não configurada" && exit 1
[ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ] && echo "❌ NEXT_PUBLIC_SUPABASE_ANON_KEY não configurada" && exit 1
[ -z "$SUPABASE_SERVICE_ROLE_KEY" ] && echo "❌ SUPABASE_SERVICE_ROLE_KEY não configurada" && exit 1

echo "✅ SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL:0:40}..."
echo "✅ ANON_KEY: ${NEXT_PUBLIC_SUPABASE_ANON_KEY:0:20}..."
echo "✅ SERVICE_ROLE: ${SUPABASE_SERVICE_ROLE_KEY:0:20}..."

# Verificar se o Supabase responde
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/" \
  -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}")
echo "✅ Supabase respondeu: HTTP $HTTP_CODE"

# Verificar formato da anon key (DEVE ser JWT, não sb_publishable_*)
if echo "$NEXT_PUBLIC_SUPABASE_ANON_KEY" | grep -q "^sb_"; then
  echo "❌ ANON KEY está no formato sb_publishable_* — NÃO FUNCIONA com @supabase/ssr"
  echo "Vá em Supabase Dashboard → Settings → API → copie a anon key no formato JWT (eyJ...)"
  exit 1
fi
echo "✅ Anon key em formato JWT — OK"
```

Se qualquer verificação falhar, PARAR e reportar ao Gregory.

---

## AGENTE 1 — INVENTÁRIO DE MIGRATIONS

**Missão:** Listar TODAS as migrations, verificar quais já foram aplicadas no banco, e quais faltam.

```bash
echo "=== INVENTÁRIO DE MIGRATIONS ==="

# Listar todas as migrations
echo "--- Migrations no código ---"
ls -1 supabase/migrations/*.sql | sort

# Contar
TOTAL=$(ls -1 supabase/migrations/*.sql | wc -l)
echo "Total de arquivos de migration: $TOTAL"

# Verificar quais tabelas JÁ existem no banco
echo ""
echo "--- Tabelas que JÁ existem no Supabase ---"
EXISTING=$(curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/" \
  -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print('\n'.join(sorted(d.keys())) if isinstance(d,dict) else 'Erro: resposta não é objeto')" 2>/dev/null)

if [ -z "$EXISTING" ]; then
  # Alternativa: verificar via SQL
  echo "Tentando via SQL..."
  curl -s -X POST "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/get_tables" \
    -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Content-Type: application/json" \
    -d '{}' 2>/dev/null
fi

echo "$EXISTING" | wc -l
echo "$EXISTING"
```

### Estratégia de aplicação

NÃO rodar migration por migration no SQL Editor (são 87 arquivos — inviável manual).
Em vez disso, criar um SCRIPT que consolida e aplica:

```bash
# Criar script consolidado que aplica todas as migrations
cat > scripts/apply-all-migrations.ts << 'SCRIPT'
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function applyMigrations() {
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`\n🔄 Aplicando ${files.length} migrations...\n`);

  let applied = 0;
  let skipped = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    let sql = fs.readFileSync(filePath, 'utf-8');

    // Pular arquivos vazios ou só com comentários
    const cleanSql = sql.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
    if (!cleanSql) {
      console.log(`⏭️  ${file} (vazio/só comentários)`);
      skipped++;
      continue;
    }

    // Wrap em IF NOT EXISTS onde possível para idempotência
    // Muitas migrations já usam IF NOT EXISTS — rodar direto

    try {
      const { error } = await supabase.rpc('exec_sql', { sql_text: sql });

      if (error) {
        // Tentar via fetch direto com SQL Editor endpoint
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sql_text: sql }),
        });

        if (!response.ok) {
          // Erros comuns que são OK:
          const errText = await response.text();
          if (errText.includes('already exists') || errText.includes('duplicate key')) {
            console.log(`✅ ${file} (já aplicada)`);
            skipped++;
            continue;
          }
          throw new Error(`${response.status}: ${errText.substring(0, 200)}`);
        }
      }

      console.log(`✅ ${file}`);
      applied++;
    } catch (err: any) {
      const msg = err.message || String(err);
      if (msg.includes('already exists') || msg.includes('duplicate')) {
        console.log(`✅ ${file} (já existia)`);
        skipped++;
      } else {
        console.log(`❌ ${file}: ${msg.substring(0, 150)}`);
        errors.push(`${file}: ${msg.substring(0, 200)}`);
        failed++;
      }
    }
  }

  console.log(`\n════════════════════════════════`);
  console.log(`✅ Aplicadas: ${applied}`);
  console.log(`⏭️  Já existiam: ${skipped}`);
  console.log(`❌ Falharam: ${failed}`);
  if (errors.length > 0) {
    console.log(`\nErros:`);
    errors.forEach(e => console.log(`  - ${e}`));
  }
  console.log(`════════════════════════════════\n`);
}

applyMigrations().catch(console.error);
SCRIPT
```

**ALTERNATIVA MAIS SEGURA — Usar a função SQL do Supabase:**

Antes de rodar o script acima, criar a função `exec_sql` no banco (via SQL Editor ou curl):

```bash
# Criar função exec_sql no Supabase (precisa ser feito UMA VEZ)
curl -s -X POST "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{}'

# Se não funcionar, o Gregory precisa rodar isso no SQL Editor:
echo "
════════════════════════════════════════════════════════
AÇÃO MANUAL — Gregory precisa colar no SQL Editor:

URL: https://supabase.com/dashboard/project/tdplmmodmumryzdosmpv/sql

SQL para colar:

CREATE OR REPLACE FUNCTION exec_sql(sql_text TEXT)
RETURNS VOID AS \$\$
BEGIN
  EXECUTE sql_text;
END;
\$\$ LANGUAGE plpgsql SECURITY DEFINER;
════════════════════════════════════════════════════════
"
```

**SE o script automático não funcionar** (Supabase free tier não permite exec_sql), usar abordagem de CONSOLIDAÇÃO:

```bash
# Consolidar TODAS as migrations em UM arquivo
cat > scripts/consolidate-migrations.sh << 'BASH'
#!/bin/bash
OUTPUT="supabase/migrations/CONSOLIDATED_ALL.sql"
echo "-- CONSOLIDATED MIGRATIONS — BlackBelt v2" > $OUTPUT
echo "-- Gerado em $(date)" >> $OUTPUT
echo "" >> $OUTPUT

for f in $(ls supabase/migrations/*.sql | sort | grep -v CONSOLIDATED); do
  echo "" >> $OUTPUT
  echo "-- ========================================" >> $OUTPUT
  echo "-- $f" >> $OUTPUT
  echo "-- ========================================" >> $OUTPUT
  cat "$f" >> $OUTPUT
  echo "" >> $OUTPUT
done

echo "✅ Consolidado em $OUTPUT ($(wc -l < $OUTPUT) linhas)"
echo ""
echo "INSTRUÇÕES:"
echo "1. Abra https://supabase.com/dashboard/project/tdplmmodmumryzdosmpv/sql"
echo "2. Cole o conteúdo de $OUTPUT"
echo "3. Rode"
echo ""
echo "⚠️  Se o SQL Editor reclamar que é muito grande, divida em partes:"
echo "   - Migrations 001-030"
echo "   - Migrations 031-060"
echo "   - Migrations 061-087"
BASH

chmod +x scripts/consolidate-migrations.sh
bash scripts/consolidate-migrations.sh
```

```bash
git add scripts/apply-all-migrations.ts scripts/consolidate-migrations.sh
git commit -m "tools: scripts para aplicar migrations no Supabase real"
```

---

## AGENTE 2 — SEED COMPLETO

**Missão:** Popular o banco com dados realistas da academia demo "Guerreiros do Tatame".

Criar/atualizar `scripts/seed-complete.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function seed() {
  console.log('🌱 Seed BlackBelt v2 — Guerreiros do Tatame\n');

  // ════════════════════════════════════════════
  // 1. CRIAR USUÁRIOS NO AUTH
  // ════════════════════════════════════════════

  const users = [
    { email: 'greg@email.com', password: 'BlackBelt@Greg1994', role: 'superadmin' },
    { email: 'admin@guerreiros.com', password: 'BlackBelt@2026', role: 'admin' },
    { email: 'professor@guerreiros.com', password: 'BlackBelt@2026', role: 'professor' },
    { email: 'recepcionista@guerreiros.com', password: 'BlackBelt@2026', role: 'recepcionista' },
    { email: 'aluno@guerreiros.com', password: 'BlackBelt@2026', role: 'aluno_adulto' },
    { email: 'teen@guerreiros.com', password: 'BlackBelt@2026', role: 'aluno_teen' },
    { email: 'kids@guerreiros.com', password: 'BlackBelt@2026', role: 'aluno_kids' },
    { email: 'responsavel@guerreiros.com', password: 'BlackBelt@2026', role: 'responsavel' },
    { email: 'franqueador@email.com', password: 'BlackBelt@2026', role: 'franqueador' },
  ];

  console.log('👤 Criando usuários no Auth...');
  const userIds: Record<string, string> = {};

  for (const u of users) {
    // Tentar criar — se já existe, buscar o id
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { role: u.role },
    });

    if (error) {
      if (error.message.includes('already been registered') || error.message.includes('already exists')) {
        // Buscar o user existente
        const { data: listData } = await supabase.auth.admin.listUsers();
        const existing = listData?.users?.find(user => user.email === u.email);
        if (existing) {
          userIds[u.role] = existing.id;
          console.log(`  ✅ ${u.email} (já existia: ${existing.id.substring(0, 8)}...)`);

          // Atualizar senha para garantir que está correta
          await supabase.auth.admin.updateUserById(existing.id, { password: u.password });
        } else {
          console.log(`  ❌ ${u.email}: ${error.message}`);
        }
      } else {
        console.log(`  ❌ ${u.email}: ${error.message}`);
      }
    } else if (data?.user) {
      userIds[u.role] = data.user.id;
      console.log(`  ✅ ${u.email} (criado: ${data.user.id.substring(0, 8)}...)`);
    }
  }

  // ════════════════════════════════════════════
  // 2. CRIAR ACADEMIA
  // ════════════════════════════════════════════

  console.log('\n🏛️ Criando academia...');

  // Verificar se já existe
  const { data: existingAcademy } = await supabase
    .from('academies')
    .select('id')
    .eq('slug', 'guerreiros-do-tatame')
    .single();

  let academyId: string;

  if (existingAcademy) {
    academyId = existingAcademy.id;
    console.log(`  ✅ Guerreiros do Tatame já existe: ${academyId.substring(0, 8)}...`);
  } else {
    const { data: newAcademy, error } = await supabase
      .from('academies')
      .insert({
        name: 'Guerreiros do Tatame',
        slug: 'guerreiros-do-tatame',
        cnpj: '12.345.678/0001-90',
        phone: '(31) 99999-1234',
        email: 'contato@guerreiros.com',
        address_street: 'Rua das Artes Marciais, 100',
        address_city: 'Vespasiano',
        address_state: 'MG',
        address_zip: '33200-000',
        plan_tier: 'pro',
        status: 'active',
        trial_ends_at: null,
        modalities: ['bjj', 'judo', 'karate', 'mma'],
        max_students: 200,
        max_professors: null, // ilimitado no Pro
        max_units: 2,
        accent_color: '#C62828',
      })
      .select('id')
      .single();

    if (error) {
      console.log(`  ❌ Erro ao criar academia: ${error.message}`);
      // Tentar nome alternativo da tabela
      console.log(`  Tentando tabela 'academy'...`);
      // Adaptar conforme nome real da tabela
    } else {
      academyId = newAcademy!.id;
      console.log(`  ✅ Guerreiros do Tatame criada: ${academyId.substring(0, 8)}...`);
    }
  }

  // ════════════════════════════════════════════
  // 3. CRIAR PROFILES
  // ════════════════════════════════════════════

  console.log('\n👥 Criando profiles...');

  const profiles = [
    { user_id: userIds['superadmin'], name: 'Gregory Pinto', role: 'superadmin', email: 'greg@email.com', academy_id: null },
    { user_id: userIds['admin'], name: 'Roberto Silva', role: 'admin', email: 'admin@guerreiros.com', academy_id: academyId! },
    { user_id: userIds['professor'], name: 'André Nakamura', role: 'professor', email: 'professor@guerreiros.com', academy_id: academyId!, belt: 'preta', specialties: ['bjj', 'mma'] },
    { user_id: userIds['recepcionista'], name: 'Carla Souza', role: 'recepcionista', email: 'recepcionista@guerreiros.com', academy_id: academyId! },
    { user_id: userIds['aluno_adulto'], name: 'João Mendes', role: 'aluno_adulto', email: 'aluno@guerreiros.com', academy_id: academyId!, belt: 'azul' },
    { user_id: userIds['aluno_teen'], name: 'Lucas Oliveira', role: 'aluno_teen', email: 'teen@guerreiros.com', academy_id: academyId!, belt: 'amarela' },
    { user_id: userIds['aluno_kids'], name: 'Maria Silva', role: 'aluno_kids', email: 'kids@guerreiros.com', academy_id: academyId!, belt: 'branca' },
    { user_id: userIds['responsavel'], name: 'Paulo Oliveira', role: 'responsavel', email: 'responsavel@guerreiros.com', academy_id: academyId! },
    { user_id: userIds['franqueador'], name: 'Carlos Ferreira', role: 'franqueador', email: 'franqueador@email.com', academy_id: null },
  ];

  for (const p of profiles) {
    const { error } = await supabase
      .from('profiles')
      .upsert(p, { onConflict: 'user_id' });

    if (error) {
      // Tentar sem onConflict
      const { error: err2 } = await supabase.from('profiles').insert(p);
      if (err2 && !err2.message.includes('duplicate')) {
        console.log(`  ❌ ${p.name}: ${err2.message}`);
      } else {
        console.log(`  ✅ ${p.name} (${p.role})`);
      }
    } else {
      console.log(`  ✅ ${p.name} (${p.role})`);
    }
  }

  // ════════════════════════════════════════════
  // 4. CRIAR TURMAS
  // ════════════════════════════════════════════

  console.log('\n📚 Criando turmas...');

  const { data: professorProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', 'professor@guerreiros.com')
    .single();

  const classes = [
    { name: 'BJJ Adulto Manhã', modality: 'bjj', schedule: 'Seg/Qua/Sex 07:00', max_students: 25, professor_id: professorProfile?.id, academy_id: academyId! },
    { name: 'BJJ Adulto Noite', modality: 'bjj', schedule: 'Seg/Qua/Sex 19:00', max_students: 30, professor_id: professorProfile?.id, academy_id: academyId! },
    { name: 'Judô Adulto', modality: 'judo', schedule: 'Ter/Qui 18:00', max_students: 20, professor_id: professorProfile?.id, academy_id: academyId! },
    { name: 'BJJ Kids', modality: 'bjj', schedule: 'Sáb 09:00', max_students: 15, professor_id: professorProfile?.id, academy_id: academyId! },
    { name: 'BJJ Teen', modality: 'bjj', schedule: 'Ter/Qui 17:00', max_students: 15, professor_id: professorProfile?.id, academy_id: academyId! },
    { name: 'MMA', modality: 'mma', schedule: 'Seg/Qua/Sex 20:30', max_students: 20, professor_id: professorProfile?.id, academy_id: academyId! },
    { name: 'Karatê Infantil', modality: 'karate', schedule: 'Sáb 10:00', max_students: 15, professor_id: professorProfile?.id, academy_id: academyId! },
  ];

  for (const c of classes) {
    const { error } = await supabase.from('classes').insert(c);
    if (error && !error.message.includes('duplicate')) {
      console.log(`  ❌ ${c.name}: ${error.message}`);
    } else {
      console.log(`  ✅ ${c.name}`);
    }
  }

  // ════════════════════════════════════════════
  // 5. CRIAR PLANOS (fonte de verdade)
  // ════════════════════════════════════════════

  console.log('\n💰 Criando planos...');

  const plans = [
    { tier: 'starter', name: 'Starter', price_monthly: 7900, max_alunos: 50, max_professores: 2, max_unidades: 1, is_popular: false, sort_order: 1 },
    { tier: 'essencial', name: 'Essencial', price_monthly: 14900, max_alunos: 100, max_professores: 5, max_unidades: 1, is_popular: false, sort_order: 2 },
    { tier: 'pro', name: 'Pro', price_monthly: 24900, max_alunos: 200, max_professores: null, max_unidades: 2, is_popular: true, sort_order: 3 },
    { tier: 'blackbelt', name: 'Black Belt', price_monthly: 39700, max_alunos: null, max_professores: null, max_unidades: null, is_popular: false, sort_order: 4 },
    { tier: 'enterprise', name: 'Enterprise', price_monthly: 0, is_custom_price: true, max_alunos: null, max_professores: null, max_unidades: null, is_popular: false, sort_order: 5 },
  ];

  for (const p of plans) {
    const { error } = await supabase.from('plans').insert(p);
    if (error && !error.message.includes('duplicate')) {
      console.log(`  ❌ ${p.name}: ${error.message}`);
    } else {
      console.log(`  ✅ ${p.name} — R$ ${(p.price_monthly / 100).toFixed(0)}/mês`);
    }
  }

  // ════════════════════════════════════════════
  // 6. VINCULAR RESPONSÁVEL AOS FILHOS
  // ════════════════════════════════════════════

  console.log('\n👨‍👧‍👦 Vinculando responsável aos filhos...');

  const { data: guardianProfile } = await supabase.from('profiles').select('id').eq('email', 'responsavel@guerreiros.com').single();
  const { data: teenProfile } = await supabase.from('profiles').select('id').eq('email', 'teen@guerreiros.com').single();
  const { data: kidsProfile } = await supabase.from('profiles').select('id').eq('email', 'kids@guerreiros.com').single();

  if (guardianProfile && teenProfile) {
    const { error } = await supabase.from('guardian_links').insert({
      guardian_id: guardianProfile.id,
      child_id: teenProfile.id,
      relationship: 'parent',
    });
    if (!error || error.message.includes('duplicate')) console.log('  ✅ Paulo → Lucas (teen)');
    else console.log(`  ❌ ${error.message}`);
  }

  if (guardianProfile && kidsProfile) {
    const { error } = await supabase.from('guardian_links').insert({
      guardian_id: guardianProfile.id,
      child_id: kidsProfile.id,
      relationship: 'parent',
    });
    if (!error || error.message.includes('duplicate')) console.log('  ✅ Paulo → Maria (kids)');
    else console.log(`  ❌ ${error.message}`);
  }

  // ════════════════════════════════════════════
  // 7. CRIAR CHECK-INS RECENTES (60 dias)
  // ════════════════════════════════════════════

  console.log('\n✅ Criando check-ins dos últimos 60 dias...');

  const { data: allStudents } = await supabase
    .from('profiles')
    .select('id, role')
    .in('role', ['aluno_adulto', 'aluno_teen', 'aluno_kids'])
    .eq('academy_id', academyId!);

  if (allStudents && allStudents.length > 0) {
    const checkins: any[] = [];
    const now = new Date();

    for (let d = 60; d >= 0; d--) {
      const date = new Date(now);
      date.setDate(date.getDate() - d);
      const dayOfWeek = date.getDay();

      // Pular domingos
      if (dayOfWeek === 0) continue;

      for (const student of allStudents) {
        // 70% chance de presença
        if (Math.random() > 0.7) continue;

        checkins.push({
          profile_id: student.id,
          academy_id: academyId!,
          checked_in_at: date.toISOString(),
          checkin_type: 'self',
        });
      }
    }

    // Insert em batches de 50
    for (let i = 0; i < checkins.length; i += 50) {
      const batch = checkins.slice(i, i + 50);
      const { error } = await supabase.from('checkins').insert(batch);
      if (error) console.log(`  ❌ Batch ${i}: ${error.message}`);
    }
    console.log(`  ✅ ${checkins.length} check-ins criados`);
  }

  // ════════════════════════════════════════════
  // 8. CRIAR FATURAS (últimos 3 meses)
  // ════════════════════════════════════════════

  console.log('\n💳 Criando faturas...');

  if (allStudents) {
    const invoices: any[] = [];
    const months = ['2026-01', '2026-02', '2026-03'];

    for (const student of allStudents) {
      for (const month of months) {
        const isPaid = Math.random() > 0.2; // 80% pagos
        invoices.push({
          profile_id: student.id,
          academy_id: academyId!,
          amount: 14900, // R$149 Essencial
          status: isPaid ? 'paid' : (month === '2026-03' ? 'pending' : 'overdue'),
          reference_month: month,
          due_date: `${month}-10`,
          paid_at: isPaid ? `${month}-08` : null,
          manual_payment: isPaid && Math.random() > 0.5,
          payment_method: isPaid ? (['pix', 'dinheiro', 'cartao', 'transferencia'][Math.floor(Math.random() * 4)]) : null,
        });
      }
    }

    for (let i = 0; i < invoices.length; i += 20) {
      const batch = invoices.slice(i, i + 20);
      const { error } = await supabase.from('invoices').insert(batch);
      if (error) console.log(`  ❌ Faturas batch ${i}: ${error.message}`);
    }
    console.log(`  ✅ ${invoices.length} faturas criadas`);
  }

  // ════════════════════════════════════════════
  // 9. VERIFICAÇÃO FINAL
  // ════════════════════════════════════════════

  console.log('\n════════════════════════════════');
  console.log('VERIFICAÇÃO FINAL');
  console.log('════════════════════════════════\n');

  const tables = ['profiles', 'academies', 'classes', 'plans', 'checkins', 'invoices', 'guardian_links'];
  for (const t of tables) {
    const { data, error, count } = await supabase.from(t).select('id', { count: 'exact', head: true });
    if (error) {
      console.log(`❌ ${t}: ${error.message}`);
    } else {
      console.log(`✅ ${t}: ${count} registros`);
    }
  }

  // Verificar que consegue logar com credenciais demo
  console.log('\n🔑 Testando login...');
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: 'admin@guerreiros.com',
    password: 'BlackBelt@2026',
  });
  if (loginError) {
    console.log(`❌ Login admin: ${loginError.message}`);
  } else {
    console.log(`✅ Login admin OK: ${loginData.user?.id.substring(0, 8)}...`);
  }

  console.log('\n🎉 Seed completo!');
  console.log('Teste em: https://blackbelts.com.br/login');
}

seed().catch(console.error);
```

```bash
pnpm tsx scripts/seed-complete.ts
```

```bash
git add scripts/seed-complete.ts scripts/apply-all-migrations.ts scripts/consolidate-migrations.sh
git commit -m "tools: seed completo + scripts de migration — dados reais Guerreiros do Tatame"
git push origin main
```

---

## AGENTE 3 — TESTAR FLUXOS REAIS

**Missão:** Após seed, testar os 10 fluxos principais via service calls reais.

```bash
cat > scripts/test-real-flows.ts << 'SCRIPT'
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function testFlows() {
  let pass = 0;
  let fail = 0;

  function assert(name: string, condition: boolean, detail?: string) {
    if (condition) {
      console.log(`  ✅ ${name}`);
      pass++;
    } else {
      console.log(`  ❌ ${name}${detail ? ': ' + detail : ''}`);
      fail++;
    }
  }

  // FLUXO 1 — Login
  console.log('\n=== FLUXO 1: Login ===');
  const { data: login } = await supabase.auth.signInWithPassword({
    email: 'admin@guerreiros.com', password: 'BlackBelt@2026'
  });
  assert('Login admin', !!login?.user);

  // FLUXO 2 — Buscar profile
  console.log('\n=== FLUXO 2: Profile ===');
  const { data: profile } = await supabase.from('profiles').select('*').eq('email', 'admin@guerreiros.com').single();
  assert('Profile existe', !!profile);
  assert('Profile tem academy_id', !!profile?.academy_id);
  assert('Profile role é admin', profile?.role === 'admin');

  // FLUXO 3 — Buscar academia
  console.log('\n=== FLUXO 3: Academia ===');
  if (profile?.academy_id) {
    const { data: academy } = await supabase.from('academies').select('*').eq('id', profile.academy_id).single();
    assert('Academia existe', !!academy);
    assert('Academia tem nome', !!academy?.name);
    assert('Academia status ativa', academy?.status === 'active');
  }

  // FLUXO 4 — Listar turmas
  console.log('\n=== FLUXO 4: Turmas ===');
  const { data: turmas } = await supabase.from('classes').select('*').eq('academy_id', profile?.academy_id);
  assert('Turmas existem', (turmas?.length || 0) > 0);
  assert('Tem pelo menos 5 turmas', (turmas?.length || 0) >= 5);

  // FLUXO 5 — Listar alunos
  console.log('\n=== FLUXO 5: Alunos ===');
  const { data: alunos } = await supabase.from('profiles').select('*')
    .eq('academy_id', profile?.academy_id)
    .in('role', ['aluno_adulto', 'aluno_teen', 'aluno_kids']);
  assert('Alunos existem', (alunos?.length || 0) > 0);

  // FLUXO 6 — Check-ins
  console.log('\n=== FLUXO 6: Check-ins ===');
  const { data: checkins, count } = await supabase.from('checkins').select('*', { count: 'exact' })
    .eq('academy_id', profile?.academy_id).limit(5);
  assert('Check-ins existem', (count || 0) > 0);
  assert('Tem pelo menos 50 check-ins', (count || 0) >= 50);

  // FLUXO 7 — Faturas
  console.log('\n=== FLUXO 7: Faturas ===');
  const { data: faturas, count: fCount } = await supabase.from('invoices').select('*', { count: 'exact' })
    .eq('academy_id', profile?.academy_id).limit(5);
  assert('Faturas existem', (fCount || 0) > 0);

  // FLUXO 8 — Planos
  console.log('\n=== FLUXO 8: Planos ===');
  const { data: planos } = await supabase.from('plans').select('*').eq('is_active', true);
  assert('Planos existem', (planos?.length || 0) > 0);
  assert('Tem 5 planos', (planos?.length || 0) === 5);
  const pro = planos?.find(p => p.tier === 'pro');
  assert('Pro custa R$249', pro?.price_monthly === 24900);

  // FLUXO 9 — Guardian links
  console.log('\n=== FLUXO 9: Guardian links ===');
  const { data: links } = await supabase.from('guardian_links').select('*');
  assert('Guardian links existem', (links?.length || 0) > 0);

  // FLUXO 10 — Multi-profile
  console.log('\n=== FLUXO 10: Multi-profile ===');
  const { data: superLogin } = await supabase.auth.signInWithPassword({
    email: 'greg@email.com', password: 'BlackBelt@Greg1994'
  });
  assert('Login superadmin', !!superLogin?.user);

  // RESULTADO
  console.log('\n════════════════════════════════');
  console.log(`✅ Passou: ${pass}`);
  console.log(`❌ Falhou: ${fail}`);
  console.log(`📊 Score: ${Math.round((pass / (pass + fail)) * 100)}%`);
  console.log('════════════════════════════════\n');
}

testFlows().catch(console.error);
SCRIPT

set -a && source .env.local && set +a
pnpm tsx scripts/test-real-flows.ts
```

```bash
git add scripts/test-real-flows.ts
git commit -m "test: 10 fluxos E2E contra Supabase real — login, profiles, turmas, checkins, faturas, planos"
git push origin main
```

---

## AGENTE 4 — VERIFICAR E DESLIGAR MOCK MODE

**Missão:** Confirmar que o app está rodando com dados reais e não mocks.

```bash
# Verificar como isMock() funciona
grep -rn 'function isMock\|const isMock\|export.*isMock' lib/ --include='*.ts' | head -5

# Verificar o que determina mock vs real
cat $(grep -rn 'function isMock\|const isMock' lib/ --include='*.ts' -l | head -1)
```

O `isMock()` provavelmente verifica se `NEXT_PUBLIC_SUPABASE_URL` está definida. Se as env vars estão setadas na Vercel, o deploy real já roda em modo real.

**Verificar na Vercel:**
```bash
# Listar env vars da Vercel (se CLI disponível)
npx vercel env ls 2>/dev/null || echo "Vercel CLI não disponível — verificar manualmente no dashboard"
```

Se `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` estão na Vercel, o app em produção já deveria estar em modo real.

**Se o app AINDA está em mock mode em produção**, verificar e corrigir:

```bash
# Verificar se há override forçando mock
grep -rn 'NEXT_PUBLIC_USE_MOCK\|FORCE_MOCK\|MOCK_MODE' lib/ .env* --include='*.ts' | head -10
```

```bash
git add -A
git commit -m "verify: mock mode status + real flow tests"
git push origin main
```

---

## INSTRUÇÕES PARA O GREGORY (AÇÕES MANUAIS)

### Passo 1 — Criar função exec_sql no Supabase

1. Abra: https://supabase.com/dashboard/project/tdplmmodmumryzdosmpv/sql
2. Cole e rode:

```sql
CREATE OR REPLACE FUNCTION exec_sql(sql_text TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE sql_text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

3. Deve retornar "Success"

### Passo 2 — Rodar o script de migrations

Depois que a função existir, o Claude Code vai rodar:
```bash
set -a && source .env.local && set +a
pnpm tsx scripts/apply-all-migrations.ts
```

### Passo 3 — Se o script falhar (Supabase free tier pode bloquear exec_sql)

O Claude Code vai gerar o arquivo `CONSOLIDATED_ALL.sql`. Você cola no SQL Editor em partes:
- Migrations 001-030
- Migrations 031-060
- Migrations 061-087

### Passo 4 — Rodar seed

```bash
set -a && source .env.local && set +a
pnpm tsx scripts/seed-complete.ts
```

### Passo 5 — Testar no browser

Abra: https://blackbelts.com.br/login
Login: admin@guerreiros.com / BlackBelt@2026

---

## COMANDO PARA O CLAUDE CODE

```
Leia o BLACKBELT_MIGRATIONS_SEED_REAL.md nesta pasta. Execute os 4 agentes NA ORDEM:

AGENTE 1: Inventariar migrations, criar scripts de aplicação (apply-all-migrations.ts + consolidate-migrations.sh). Tentar aplicar via script. Se falhar, gerar CONSOLIDATED_ALL.sql + instruções manuais pro Gregory.

AGENTE 2: Rodar seed-complete.ts — criar users no auth, academia, profiles, turmas, planos, guardian_links, check-ins, faturas. Se tabelas não existem, reportar quais migrations faltam.

AGENTE 3: Rodar test-real-flows.ts — 10 fluxos E2E. Reportar score. Se algo falhou, diagnosticar e corrigir.

AGENTE 4: Verificar mock mode. Se o app está em mock quando deveria estar em real, corrigir. Commit e push.

Se o Agente 1 não conseguir aplicar migrations via script, PARAR e imprimir instruções para o Gregory aplicar manualmente no SQL Editor. Depois o Gregory roda novamente a partir do Agente 2.

Comece pelo Agente 1 agora.
```
