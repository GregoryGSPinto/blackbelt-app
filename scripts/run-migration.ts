import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load .env.local
const envPath = resolve(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  process.env[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  const migrationPath = process.argv[2] || 'supabase/migrations/017_go_live_fixes.sql';
  const sql = readFileSync(resolve(process.cwd(), migrationPath), 'utf-8');

  // Split SQL into individual statements
  const statements = sql
    .split(/;\s*$/m)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`Running ${statements.length} statements from ${migrationPath}...\n`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const preview = stmt.replace(/\n/g, ' ').substring(0, 80);

    try {
      const { error } = await supabase.rpc('exec_sql', { sql_text: stmt + ';' });
      if (error) {
        // Try direct approach
        const { error: err2 } = await supabase.from('_migration_runner').select('*');
        // Supabase JS doesn't support raw SQL, use REST API
        throw new Error(error.message);
      }
      console.log(`  ✅ [${i + 1}] ${preview}`);
      success++;
    } catch (err) {
      console.log(`  ⚠️ [${i + 1}] ${preview}`);
      console.log(`     Error: ${(err as Error).message}`);
      failed++;
    }
  }

  console.log(`\nDone: ${success} success, ${failed} failed`);
}

main().catch(console.error);
