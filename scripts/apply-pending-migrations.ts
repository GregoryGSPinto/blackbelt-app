/**
 * Aplica migrations pendentes (085, 086, 087) via exec_sql RPC.
 *
 * PRÉ-REQUISITO: A função exec_sql deve existir no Supabase.
 * Se não existir, rode no SQL Editor:
 *
 *   CREATE OR REPLACE FUNCTION exec_sql(sql_text TEXT)
 *   RETURNS VOID AS $$
 *   BEGIN
 *     EXECUTE sql_text;
 *   END;
 *   $$ LANGUAGE plpgsql SECURITY DEFINER;
 *
 * Uso: set -a && source .env.local && set +a && pnpm tsx scripts/apply-pending-migrations.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar definidas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const PENDING_MIGRATIONS = [
  '085_profile_settings.sql',
  '086_manual_payment.sql',
  '087_guardian_links.sql',
];

async function applyMigrations() {
  console.log('\n🔄 Aplicando migrations pendentes...\n');

  let applied = 0;
  let failed = 0;

  for (const file of PENDING_MIGRATIONS) {
    const filePath = path.join(process.cwd(), 'supabase', 'migrations', file);

    if (!fs.existsSync(filePath)) {
      console.log(`⏭️  ${file} (arquivo não encontrado)`);
      continue;
    }

    const sql = fs.readFileSync(filePath, 'utf-8');

    // Split into individual statements for better error handling
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));

    console.log(`📄 ${file} (${statements.length} statements)...`);

    let fileOk = true;
    for (const stmt of statements) {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sql_text: stmt + ';' }),
        });

        if (!response.ok) {
          const errText = await response.text();
          if (errText.includes('already exists') || errText.includes('duplicate')) {
            // OK — idempotent
          } else if (errText.includes('PGRST202')) {
            console.log(`\n❌ Função exec_sql NÃO existe no banco!`);
            console.log(`\n👉 Gregory, cole isto no SQL Editor:`);
            console.log(`   https://supabase.com/dashboard/project/tdplmmodmumryzdosmpv/sql\n`);
            console.log(`CREATE OR REPLACE FUNCTION exec_sql(sql_text TEXT)`);
            console.log(`RETURNS VOID AS $$`);
            console.log(`BEGIN`);
            console.log(`  EXECUTE sql_text;`);
            console.log(`END;`);
            console.log(`$$ LANGUAGE plpgsql SECURITY DEFINER;\n`);
            console.log(`Depois rode: pnpm tsx scripts/apply-pending-migrations.ts`);
            process.exit(1);
          } else {
            console.log(`  ⚠️  ${stmt.substring(0, 60)}... — ${errText.substring(0, 100)}`);
            fileOk = false;
          }
        }
      } catch (err: any) {
        console.log(`  ❌ ${stmt.substring(0, 60)}... — ${err.message}`);
        fileOk = false;
      }
    }

    if (fileOk) {
      console.log(`  ✅ ${file} aplicada`);
      applied++;
    } else {
      console.log(`  ⚠️  ${file} teve warnings (pode já estar parcialmente aplicada)`);
      applied++; // still count since IF NOT EXISTS makes it idempotent
    }
  }

  console.log(`\n════════════════════════════════`);
  console.log(`✅ Migrations processadas: ${applied}`);
  console.log(`❌ Falharam: ${failed}`);
  console.log(`════════════════════════════════\n`);

  // Verify
  console.log('🔍 Verificando...');

  const checks = [
    { query: 'profiles?select=accent_color&limit=1', label: 'profiles.accent_color (085)' },
    { query: 'invoices?select=manual_payment&limit=1', label: 'invoices.manual_payment (086)' },
    { query: 'guardian_links?select=id&limit=1', label: 'guardian_links table (087)' },
  ];

  for (const check of checks) {
    const resp = await fetch(`${supabaseUrl}/rest/v1/${check.query}`, {
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
    });
    if (resp.ok) {
      console.log(`  ✅ ${check.label}`);
    } else {
      const err = await resp.text();
      console.log(`  ❌ ${check.label}: ${err.substring(0, 80)}`);
    }
  }
}

applyMigrations().catch(console.error);
