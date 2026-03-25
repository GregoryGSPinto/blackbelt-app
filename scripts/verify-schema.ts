#!/usr/bin/env tsx
/**
 * BlackBelt v2 — Schema Verification Script
 * Connects to Supabase with service_role_key, lists existing tables,
 * compares with expected tables, reports missing ones.
 *
 * Usage: npx tsx scripts/verify-schema.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Core tables that MUST exist for the app to function
const CRITICAL_TABLES = [
  'profiles',
  'academies',
  'units',
  'memberships',
  'modalities',
  'classes',
  'class_enrollments',
  'attendance',
  'students',
  'progressions',
  'evaluations',
  'achievements',
  'student_achievements',
  'student_xp',
  'xp_ledger',
  'videos',
  'series',
  'messages',
  'conversations',
  'notifications',
  'plans',
  'subscriptions',
  'invoices',
  'leads',
  'invites',
  'invite_tokens',
  'beta_academies',
  'beta_feedback',
  'beta_nps',
  'push_tokens',
  'access_events',
  'feed_posts',
  'feed_comments',
  'feed_likes',
  'guardian_links',
  'guardians',
  'belt_promotions',
  'belt_criteria',
  'tournaments',
  'tournament_registrations',
  'tournament_categories',
  'tournament_matches',
  'tournament_brackets',
  'athlete_profiles',
  'academy_settings',
  'academy_subscriptions',
  'tutorial_progress',
  'telemetry_events',
  'telemetry_sessions',
  'contact_messages',
  'landing_page_configs',
  'landing_page_leads',
  'academy_onboard_tokens',
  'academy_onboard_uses',
  'pricing_tiers',
  'pricing_modules',
  'pricing_packages',
];

// Migration 055 — Academy Config & Platform
const ACADEMY_CONFIG_TABLES = [
  'academy_branding',
  'academy_events',
  'academy_plans',
  'academy_platform_plans',
  'academy_usage',
  'billing_plans',
  'billing_config',
  'billing_alerts',
  'billing_invoices',
  'billing_overage_projections',
  'billing_previews',
  'billing_summaries',
  'billing_downgrade_requests',
  'billing_upgrade_requests',
  'billing_usage_metrics',
  'wizard_progress',
  'insights',
  'error_logs',
  'storage_stats',
  'spaces',
  'space_schedules',
];

// Migration 056 — Financial, Payments, Contracts
const FINANCIAL_TABLES = [
  'devedores',
  'contatos_cobranca',
  'contrato_templates',
  'contratos',
  'inadimplentes_view',
  'mensalidades',
  'pagamentos',
  'products',
  'orders',
  'shipments',
  'royalty_calculations',
  'royalty_invoices',
  'referral_clicks',
  'referral_stats',
  'estoque',
  'movimentacoes_estoque',
  'inventory_items',
  'stock_movements',
];

// Migration 057 — Training & Professors
const TRAINING_TABLES = [
  'professors',
  'agenda_slots',
  'class_schedule',
  'class_students',
  'curricula',
  'curriculum_requirements',
  'diarios_aula',
  'exercise_logs',
  'experimentais',
  'lesson_requests',
  'notas_aluno',
  'professor_alerts',
  'professor_reports',
  'promotion_candidates',
  'relatorios_aula',
  'substitutions',
  'techniques',
  'tecnicas',
  'trial_classes',
  'belt_history',
  'belt_requirements',
  'student_curriculum_progress',
  'student_journeys',
  'student_progress',
  'match_analyses',
  'match_analysis_shares',
  'match_annotations',
];

// Migration 058 — Communication, Notifications, Family
const COMMUNICATION_TABLES = [
  'campaign_metrics',
  'notification_logs',
  'notification_prefs',
  'guardian_dashboards',
  'guardian_notifications',
  'family_calendar',
  'family_monthly_reports',
  'parent_checkin_history',
  'parent_today_classes',
  'sentiment_trends',
  'suggestions',
  'event_enrollments',
  'tournament_enrollments',
];

// Migration 059 — Gamification, Rankings, Seasons
const GAMIFICATION_TABLES = [
  'battle_pass_seasons',
  'battle_pass_progress',
  'seasons',
  'season_leaderboard',
  'season_progress',
  'leagues',
  'league_standings',
  'hall_of_fame',
  'titles',
  'user_titles',
  'store_rewards',
  'reward_balances',
  'reward_redemptions',
  'reward_transactions',
  'teen_desafios',
  'reviews',
];

// Migration 060 — Content, Streaming, Kids
const CONTENT_TABLES = [
  'courses',
  'course_modules',
  'course_lessons',
  'course_analytics',
  'streaming_trails',
  'streaming_series',
  'streaming_episodes',
  'streaming_library',
  'streaming_certificates',
  'streaming_trail_progress',
  'streaming_watch_progress',
  'video_series',
  'kids_profiles',
  'kids_albums',
  'kids_estrelas_historico',
  'kids_faixas',
  'kids_personalizacao',
  'kids_recompensas',
  'kids_resgates',
  'wishlist',
];

// Tables referenced by services but not yet in migrations (non-critical, gracefully fallback)
const OPTIONAL_TABLES = [
  'announcements',
  'announcement_reads',
  'certificates',
  'championships',
  'championship_registrations',
  'brackets',
  'bracket_matches',
  'physical_assessments',
  'training_plans',
  'notification_preferences',
  'goals',
  'diary_entries',
  'campaigns',
  'calendar_events',
  'contracts',
];

// All tables from migrations 055-060 combined
const MIGRATION_055_060_TABLES = [
  ...ACADEMY_CONFIG_TABLES,
  ...FINANCIAL_TABLES,
  ...TRAINING_TABLES,
  ...COMMUNICATION_TABLES,
  ...GAMIFICATION_TABLES,
  ...CONTENT_TABLES,
];

async function main() {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // Query information_schema for public tables
  const { data: tables, error } = await supabase
    .from('information_schema.tables' as string)
    .select('table_name')
    .eq('table_schema', 'public')
    .eq('table_type', 'BASE TABLE');

  if (error) {
    // Fallback: use RPC
    console.log('Direct information_schema query failed, trying RPC...');
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_public_tables' as string);
    if (rpcError) {
      console.error('Could not query tables:', rpcError.message);
      console.log('\nTo enable this script, run this SQL in Supabase SQL Editor:');
      console.log(`
CREATE OR REPLACE FUNCTION get_public_tables()
RETURNS TABLE(table_name text) AS $$
  SELECT tablename::text FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
$$ LANGUAGE sql SECURITY DEFINER;
      `);
      process.exit(1);
    }
    const existingTables = new Set((rpcData as { table_name: string }[]).map((r) => r.table_name));
    reportResults(existingTables);
    return;
  }

  const existingTables = new Set((tables as { table_name: string }[]).map((r) => r.table_name));
  reportResults(existingTables);
}

function reportResults(existingTables: Set<string>) {
  console.log(`\n=== BlackBelt v2 — Schema Verification ===\n`);
  console.log(`Total tables in database: ${existingTables.size}\n`);

  // Check critical tables
  const missingCritical = CRITICAL_TABLES.filter((t) => !existingTables.has(t));
  const presentCritical = CRITICAL_TABLES.filter((t) => existingTables.has(t));

  console.log(`CRITICAL TABLES: ${presentCritical.length}/${CRITICAL_TABLES.length} present`);
  if (missingCritical.length > 0) {
    console.log(`\n❌ MISSING CRITICAL TABLES (${missingCritical.length}):`);
    missingCritical.forEach((t) => console.log(`   - ${t}`));
  } else {
    console.log('✅ All critical tables present!\n');
  }

  // Check migration 055-060 tables
  const missing055_060 = MIGRATION_055_060_TABLES.filter((t) => !existingTables.has(t));
  const present055_060 = MIGRATION_055_060_TABLES.filter((t) => existingTables.has(t));

  console.log(`MIGRATION 055-060 TABLES: ${present055_060.length}/${MIGRATION_055_060_TABLES.length} present`);
  if (missing055_060.length > 0) {
    console.log(`\n⚠️  MISSING 055-060 TABLES (${missing055_060.length}):`);
    missing055_060.forEach((t) => console.log(`   - ${t}`));
    console.log('\nRun migrations 055-060 to create these tables.');
  } else {
    console.log('✅ All 055-060 tables present!\n');
  }

  // Check optional tables (migration 054)
  const missingOptional = OPTIONAL_TABLES.filter((t) => !existingTables.has(t));
  const presentOptional = OPTIONAL_TABLES.filter((t) => existingTables.has(t));

  console.log(`\nOPTIONAL TABLES (054): ${presentOptional.length}/${OPTIONAL_TABLES.length} present`);
  if (missingOptional.length > 0) {
    console.log(`\n⚠️  MISSING OPTIONAL TABLES (${missingOptional.length}):`);
    missingOptional.forEach((t) => console.log(`   - ${t}`));
    console.log('\nThese tables are non-critical — services return empty data gracefully.');
  }

  // Summary
  const totalExpected = CRITICAL_TABLES.length + MIGRATION_055_060_TABLES.length + OPTIONAL_TABLES.length;
  const totalPresent = presentCritical.length + present055_060.length + presentOptional.length;
  console.log('\n=== SUMMARY ===');
  console.log(`Critical:      ${presentCritical.length}/${CRITICAL_TABLES.length}`);
  console.log(`055-060:       ${present055_060.length}/${MIGRATION_055_060_TABLES.length}`);
  console.log(`Optional (054): ${presentOptional.length}/${OPTIONAL_TABLES.length}`);
  console.log(`Total:         ${totalPresent}/${totalExpected}`);

  if (missingCritical.length > 0) {
    console.log('\n⚠️  Run migration 054_missing_tables_final.sql to create missing tables.');
    process.exit(1);
  }
}

main().catch(console.error);
