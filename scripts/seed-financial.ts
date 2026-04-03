/**
 * seed-financial.ts
 *
 * Generates 6 months of historical student_payments for the
 * Guerreiros do Tatame academy (demo data).
 *
 * ~127 students × 6 months ≈ 762 invoices
 * 90% paid, 7% pending, 3% overdue
 * Amounts: R$79 to R$249 depending on student plan
 *
 * Run with:  npx tsx scripts/seed-financial.ts
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { readFileSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve(__dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  const val = trimmed.slice(eqIdx + 1).trim();
  if (!process.env[key]) process.env[key] = val;
}

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const PLAN_AMOUNTS = [7900, 9900, 12900, 14900, 17900, 19900, 24900];
const PAYMENT_METHODS = ['pix', 'credit_card', 'boleto', 'cash', 'bank_transfer'];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

async function seedFinancial() {
  console.log('💰 Seed financeiro — 6 meses de faturas históricas\n');

  // ═══ Find academy ═══
  const { data: academy } = await supabase
    .from('academies')
    .select('id, name')
    .ilike('name', '%guerreiros%')
    .single();

  if (!academy) {
    console.error('❌ Academia "Guerreiros do Tatame" não encontrada.');
    process.exit(1);
  }
  console.log(`  Academia: ${academy.name} (${academy.id})`);

  // ═══ Get financial profiles with direct charge ═══
  const { data: profiles } = await supabase
    .from('student_financial_profiles')
    .select('id, academy_id, membership_id, profile_id, financial_model, amount_cents, due_day, payment_method_default')
    .eq('academy_id', academy.id);

  if (!profiles || profiles.length === 0) {
    // Fallback: get memberships directly if no financial profiles exist
    console.log('  ⚠ Nenhum perfil financeiro — buscando memberships diretamente...');
    const { data: memberships } = await supabase
      .from('memberships')
      .select('id, profile_id, academy_id')
      .eq('academy_id', academy.id)
      .in('role', ['aluno_adulto', 'aluno_kids', 'aluno_teen'])
      .eq('status', 'active');

    if (!memberships || memberships.length === 0) {
      console.error('❌ Nenhum aluno encontrado. Execute seed-full-academy.ts primeiro.');
      process.exit(1);
    }

    console.log(`  ${memberships.length} memberships encontradas`);
    await generateFromMemberships(academy.id, memberships);
    return;
  }

  // Filter out exempt models (cortesia, funcionario, gympass, totalpass)
  const billableProfiles = profiles.filter(
    (p: any) => !['cortesia', 'funcionario', 'gympass', 'totalpass'].includes(p.financial_model),
  );

  console.log(`  ${profiles.length} perfis financeiros (${billableProfiles.length} com cobrança direta)`);

  if (billableProfiles.length === 0) {
    console.log('  ⚠ Nenhum perfil com cobrança direta — usando todos perfis...');
    await generatePayments(academy.id, profiles);
  } else {
    await generatePayments(academy.id, billableProfiles);
  }
}

async function generateFromMemberships(
  academyId: string,
  memberships: Array<{ id: string; profile_id: string; academy_id: string }>,
) {
  const fakeProfiles = memberships.map((m) => ({
    membership_id: m.id,
    profile_id: m.profile_id,
    financial_model: 'particular',
    amount_cents: pickRandom(PLAN_AMOUNTS),
    due_day: 10,
    payment_method_default: 'pix',
  }));
  await generatePayments(academyId, fakeProfiles);
}

async function generatePayments(
  academyId: string,
  profiles: Array<{
    membership_id: string;
    profile_id: string;
    financial_model: string;
    amount_cents: number;
    due_day: number | null;
    payment_method_default: string | null;
  }>,
) {
  const now = new Date();
  const months: Date[] = [];
  for (let i = 5; i >= 0; i--) {
    months.push(new Date(now.getFullYear(), now.getMonth() - i, 1));
  }

  const payments: Array<Record<string, unknown>> = [];

  for (const month of months) {
    const reference = monthKey(month);
    const isCurrentMonth = reference === monthKey(now);

    for (const profile of profiles) {
      const amount = profile.amount_cents > 0 ? profile.amount_cents : pickRandom(PLAN_AMOUNTS);
      const dueDay = profile.due_day ?? 10;
      const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
      const effectiveDueDay = Math.min(dueDay, lastDay);
      const dueDate = `${reference}-${String(effectiveDueDay).padStart(2, '0')}`;

      // 90% paid, 7% pending, 3% overdue — current month has more pending
      const roll = Math.random();
      let status: string;
      let paidAt: string | null = null;
      let paidAmount: number | null = null;

      if (isCurrentMonth) {
        // Current month: 60% paid, 25% pending, 15% overdue
        if (roll < 0.60) {
          status = 'RECEIVED';
        } else if (roll < 0.85) {
          status = 'PENDING';
        } else {
          status = 'OVERDUE';
        }
      } else {
        // Past months: 90% paid, 7% pending, 3% overdue
        if (roll < 0.90) {
          status = 'RECEIVED';
        } else if (roll < 0.97) {
          status = 'PENDING';
        } else {
          status = 'OVERDUE';
        }
      }

      if (status === 'RECEIVED') {
        const payDate = new Date(`${dueDate}T12:00:00`);
        payDate.setDate(payDate.getDate() + Math.floor(Math.random() * 5));
        paidAt = payDate.toISOString();
        paidAmount = amount;
      }

      payments.push({
        academy_id: academyId,
        student_profile_id: profile.profile_id,
        membership_id: profile.membership_id,
        description: `Mensalidade ${reference}`,
        amount_cents: amount,
        due_date: dueDate,
        status,
        paid_at: paidAt,
        paid_amount_cents: paidAmount,
        reference_month: reference,
        payment_method: status === 'RECEIVED' ? pickRandom(PAYMENT_METHODS) : null,
        billing_type: profile.financial_model || 'particular',
        source: 'seed_financial',
      });
    }
  }

  console.log(`\n  ${payments.length} faturas a inserir...`);

  // ═══ Clean previous seed data ═══
  const { error: deleteError } = await supabase
    .from('student_payments')
    .delete()
    .eq('academy_id', academyId)
    .eq('source', 'seed_financial');

  if (deleteError) {
    console.warn(`  ⚠ Erro ao limpar dados anteriores: ${deleteError.message}`);
  } else {
    console.log('  🧹 Dados anteriores de seed limpos');
  }

  // ═══ Insert in batches ═══
  const BATCH = 100;
  let inserted = 0;
  for (let i = 0; i < payments.length; i += BATCH) {
    const batch = payments.slice(i, i + BATCH);
    const { error } = await supabase.from('student_payments').insert(batch);
    if (error) {
      console.error(`  ❌ Erro no batch ${Math.floor(i / BATCH) + 1}: ${error.message}`);
    } else {
      inserted += batch.length;
    }
  }

  // ═══ Report ═══
  const paid = payments.filter((p) => p.status === 'RECEIVED').length;
  const pending = payments.filter((p) => p.status === 'PENDING').length;
  const overdue = payments.filter((p) => p.status === 'OVERDUE').length;

  console.log(`\n✅ ${inserted} faturas inseridas com sucesso!`);
  console.log(`  Pagas: ${paid} (${Math.round((paid / payments.length) * 100)}%)`);
  console.log(`  Pendentes: ${pending} (${Math.round((pending / payments.length) * 100)}%)`);
  console.log(`  Atrasadas: ${overdue} (${Math.round((overdue / payments.length) * 100)}%)`);

  console.log('\n📊 Receita por mês:');
  for (const month of months.map(monthKey)) {
    const monthPayments = payments.filter((p) => p.reference_month === month);
    const monthReceived = monthPayments
      .filter((p) => p.status === 'RECEIVED')
      .reduce((sum, p) => sum + (p.amount_cents as number), 0);
    console.log(
      `  ${month}: ${monthPayments.length} faturas, R$ ${(monthReceived / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} recebidos`,
    );
  }
}

seedFinancial().catch(console.error);
