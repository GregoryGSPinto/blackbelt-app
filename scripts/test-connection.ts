import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load .env.local manually
const envPath = resolve(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx);
  const val = trimmed.slice(eqIdx + 1);
  process.env[key] = val;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  console.log('Testing connection to:', process.env.NEXT_PUBLIC_SUPABASE_URL);

  const { data, error } = await supabase.from('profiles').select('count');
  if (error && error.code === '42P01') {
    console.log('✅ Conexão OK. Tabelas ainda não existem (normal).');
  } else if (error) {
    console.error('❌ Erro:', error.message, error.code);
  } else {
    console.log('✅ Conexão OK. Profiles:', data);
  }

  // Test plans table
  const { data: plans, error: plansErr } = await supabase.from('plans').select('*');
  if (plansErr) {
    console.log('Plans table error:', plansErr.message);
  } else {
    console.log('✅ Plans:', plans?.length, 'registros');
  }

  // Test academies
  const { data: acads, error: acadsErr } = await supabase.from('academies').select('*');
  if (acadsErr) {
    console.log('Academies table error:', acadsErr.message);
  } else {
    console.log('✅ Academies:', acads?.length, 'registros');
  }
}

main().catch(console.error);
