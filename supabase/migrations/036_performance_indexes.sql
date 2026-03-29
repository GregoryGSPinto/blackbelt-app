-- ═══════════════════════════════════════════════════════════════════
-- Migration 036: Performance Indexes + updated_at Triggers
-- Agent 04 — Data Integrity Master
--
-- 1. Missing indexes for multi-tenant academy_id lookups
-- 2. User lookups (user_id, student_id, profile_id)
-- 3. Date-based queries (attendance, payments, created_at)
-- 4. Email lookups
-- 5. Compete module additional indexes
-- 6. Soft delete filters (deleted_at)
-- 7. updated_at trigger function + triggers on all tables that have updated_at
-- ═══════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────
-- PART 1: MISSING INDEXES
-- ─────────────────────────────────────────────────────────────────

-- ── Multi-tenant academy_id lookups ──────────────────────────────

-- academy_members
CREATE INDEX IF NOT EXISTS idx_academy_members_academy ON public.academy_members(academy_id);
CREATE INDEX IF NOT EXISTS idx_academy_members_profile ON public.academy_members(profile_id);

-- products (flagged in review)
CREATE INDEX IF NOT EXISTS idx_products_academy ON public.products(academy_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);

-- orders — no academy_id column, index user_id + status
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- devedores
CREATE INDEX IF NOT EXISTS idx_devedores_academy ON public.devedores(academy_id);
CREATE INDEX IF NOT EXISTS idx_devedores_status ON public.devedores(status_cobranca);

-- mensalidades
CREATE INDEX IF NOT EXISTS idx_mensalidades_academy ON public.mensalidades(academy_id);
CREATE INDEX IF NOT EXISTS idx_mensalidades_student ON public.mensalidades(student_id);
CREATE INDEX IF NOT EXISTS idx_mensalidades_status ON public.mensalidades(status);
CREATE INDEX IF NOT EXISTS idx_mensalidades_due_date ON public.mensalidades(due_date);

-- contratos (PT-BR)
CREATE INDEX IF NOT EXISTS idx_contratos_academy ON public.contratos(academy_id);
CREATE INDEX IF NOT EXISTS idx_contratos_aluno ON public.contratos(aluno_id);
CREATE INDEX IF NOT EXISTS idx_contratos_status ON public.contratos(status);

-- contrato_templates
CREATE INDEX IF NOT EXISTS idx_contrato_templates_academy ON public.contrato_templates(academy_id);

-- estoque
CREATE INDEX IF NOT EXISTS idx_estoque_academy ON public.estoque(academy_id);
CREATE INDEX IF NOT EXISTS idx_estoque_status ON public.estoque(status);

-- inventory_items
CREATE INDEX IF NOT EXISTS idx_inventory_items_academy ON public.inventory_items(academy_id);

-- billing tables
CREATE INDEX IF NOT EXISTS idx_billing_config_academy ON public.billing_config(academy_id);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_academy ON public.billing_invoices(academy_id);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_status ON public.billing_invoices(status);
CREATE INDEX IF NOT EXISTS idx_billing_summaries_academy ON public.billing_summaries(academy_id);
CREATE INDEX IF NOT EXISTS idx_billing_alerts_academy ON public.billing_alerts(academy_id);
CREATE INDEX IF NOT EXISTS idx_billing_usage_metrics_academy ON public.billing_usage_metrics(academy_id);

-- academy_branding
CREATE INDEX IF NOT EXISTS idx_academy_branding_academy ON public.academy_branding(academy_id);

-- academy_events
CREATE INDEX IF NOT EXISTS idx_academy_events_academy ON public.academy_events(academy_id);
CREATE INDEX IF NOT EXISTS idx_academy_events_date ON public.academy_events(date);

-- academy_usage
CREATE INDEX IF NOT EXISTS idx_academy_usage_academy ON public.academy_usage(academy_id);

-- insights
CREATE INDEX IF NOT EXISTS idx_insights_academy ON public.insights(academy_id);

-- seasons (gamification)
CREATE INDEX IF NOT EXISTS idx_seasons_academy ON public.seasons(academy_id);
CREATE INDEX IF NOT EXISTS idx_seasons_status ON public.seasons(status);

-- hall_of_fame
CREATE INDEX IF NOT EXISTS idx_hall_of_fame_academy ON public.hall_of_fame(academy_id);

-- store_rewards
CREATE INDEX IF NOT EXISTS idx_store_rewards_academy ON public.store_rewards(academy_id);

-- reward_redemptions
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_academy ON public.reward_redemptions(academy_id);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_user ON public.reward_redemptions(user_id);

-- sentiment_trends
CREATE INDEX IF NOT EXISTS idx_sentiment_trends_academy ON public.sentiment_trends(academy_id);

-- suggestions
CREATE INDEX IF NOT EXISTS idx_suggestions_academy ON public.suggestions(academy_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_user ON public.suggestions(user_id);

-- notification_logs
CREATE INDEX IF NOT EXISTS idx_notification_logs_academy ON public.notification_logs(academy_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_user ON public.notification_logs(user_id);

-- substitutions
CREATE INDEX IF NOT EXISTS idx_substitutions_academy ON public.substitutions(academy_id);
CREATE INDEX IF NOT EXISTS idx_substitutions_date ON public.substitutions(date);

-- class_schedule
CREATE INDEX IF NOT EXISTS idx_class_schedule_academy ON public.class_schedule(academy_id);

-- trial_classes
CREATE INDEX IF NOT EXISTS idx_trial_classes_academy ON public.trial_classes(academy_id);
CREATE INDEX IF NOT EXISTS idx_trial_classes_status ON public.trial_classes(status);

-- curricula
CREATE INDEX IF NOT EXISTS idx_curricula_academy ON public.curricula(academy_id);

-- professor_reports
CREATE INDEX IF NOT EXISTS idx_professor_reports_academy ON public.professor_reports(academy_id);
CREATE INDEX IF NOT EXISTS idx_professor_reports_professor ON public.professor_reports(professor_id);

-- promotion_candidates
CREATE INDEX IF NOT EXISTS idx_promotion_candidates_academy ON public.promotion_candidates(academy_id);

-- referral_stats
CREATE INDEX IF NOT EXISTS idx_referral_stats_academy ON public.referral_stats(academy_id);

-- royalty_calculations
CREATE INDEX IF NOT EXISTS idx_royalty_calculations_academy ON public.royalty_calculations(academy_id);

-- royalty_invoices
CREATE INDEX IF NOT EXISTS idx_royalty_invoices_academy ON public.royalty_invoices(academy_id);

-- wizard_progress
CREATE INDEX IF NOT EXISTS idx_wizard_progress_academy ON public.wizard_progress(academy_id);

-- storage_stats
CREATE INDEX IF NOT EXISTS idx_storage_stats_academy ON public.storage_stats(academy_id);

-- video_series
CREATE INDEX IF NOT EXISTS idx_video_series_academy ON public.video_series(academy_id);

-- streaming_trails
CREATE INDEX IF NOT EXISTS idx_streaming_trails_academy ON public.streaming_trails(academy_id);

-- ── User / Profile lookups ───────────────────────────────────────

-- courses (flagged in review)
CREATE INDEX IF NOT EXISTS idx_courses_creator ON public.courses(creator_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON public.courses(status);

-- course_modules
CREATE INDEX IF NOT EXISTS idx_course_modules_course ON public.course_modules(course_id);

-- course_lessons
CREATE INDEX IF NOT EXISTS idx_course_lessons_course ON public.course_lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_module ON public.course_lessons(module_id);

-- course_analytics
CREATE INDEX IF NOT EXISTS idx_course_analytics_course ON public.course_analytics(course_id);
CREATE INDEX IF NOT EXISTS idx_course_analytics_creator ON public.course_analytics(creator_id);

-- battle_pass_progress
CREATE INDEX IF NOT EXISTS idx_battle_pass_progress_user ON public.battle_pass_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_battle_pass_progress_season ON public.battle_pass_progress(season_id);

-- season_leaderboard
CREATE INDEX IF NOT EXISTS idx_season_leaderboard_season ON public.season_leaderboard(season_id);
CREATE INDEX IF NOT EXISTS idx_season_leaderboard_student ON public.season_leaderboard(student_id);

-- season_progress
CREATE INDEX IF NOT EXISTS idx_season_progress_season ON public.season_progress(season_id);
CREATE INDEX IF NOT EXISTS idx_season_progress_student ON public.season_progress(student_id);

-- league_standings
CREATE INDEX IF NOT EXISTS idx_league_standings_league ON public.league_standings(league_id);
CREATE INDEX IF NOT EXISTS idx_league_standings_academy ON public.league_standings(academy_id);

-- user_titles
CREATE INDEX IF NOT EXISTS idx_user_titles_user ON public.user_titles(user_id);

-- reward_balances
CREATE INDEX IF NOT EXISTS idx_reward_balances_user ON public.reward_balances(user_id);

-- reward_transactions
CREATE INDEX IF NOT EXISTS idx_reward_transactions_user ON public.reward_transactions(user_id);

-- teen_desafios
CREATE INDEX IF NOT EXISTS idx_teen_desafios_student ON public.teen_desafios(student_id);

-- guardian_dashboards
CREATE INDEX IF NOT EXISTS idx_guardian_dashboards_profile ON public.guardian_dashboards(profile_id);

-- guardian_notifications
CREATE INDEX IF NOT EXISTS idx_guardian_notifications_guardian ON public.guardian_notifications(guardian_id);
CREATE INDEX IF NOT EXISTS idx_guardian_notifications_read ON public.guardian_notifications(read);

-- family_calendar
CREATE INDEX IF NOT EXISTS idx_family_calendar_profile ON public.family_calendar(profile_id);

-- family_monthly_reports
CREATE INDEX IF NOT EXISTS idx_family_monthly_reports_profile ON public.family_monthly_reports(profile_id);

-- kids tables
CREATE INDEX IF NOT EXISTS idx_kids_profiles_student ON public.kids_profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_kids_albums_student ON public.kids_albums(student_id);
CREATE INDEX IF NOT EXISTS idx_kids_estrelas_historico_student ON public.kids_estrelas_historico(student_id);
CREATE INDEX IF NOT EXISTS idx_kids_faixas_student ON public.kids_faixas(student_id);
CREATE INDEX IF NOT EXISTS idx_kids_personalizacao_student ON public.kids_personalizacao(student_id);
CREATE INDEX IF NOT EXISTS idx_kids_recompensas_student ON public.kids_recompensas(student_id);
CREATE INDEX IF NOT EXISTS idx_kids_resgates_student ON public.kids_resgates(student_id);

-- student progress tables
CREATE INDEX IF NOT EXISTS idx_student_progress_student ON public.student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_journeys_student ON public.student_journeys(student_id);
CREATE INDEX IF NOT EXISTS idx_student_curriculum_progress_student ON public.student_curriculum_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_belt_history_student ON public.belt_history(student_id);
CREATE INDEX IF NOT EXISTS idx_belt_requirements_student ON public.belt_requirements(student_id);

-- agenda_slots
CREATE INDEX IF NOT EXISTS idx_agenda_slots_professor ON public.agenda_slots(professor_id);

-- diarios_aula
CREATE INDEX IF NOT EXISTS idx_diarios_aula_professor ON public.diarios_aula(professor_id);
CREATE INDEX IF NOT EXISTS idx_diarios_aula_turma ON public.diarios_aula(turma_id);
CREATE INDEX IF NOT EXISTS idx_diarios_aula_data ON public.diarios_aula(data);

-- relatorios_aula
CREATE INDEX IF NOT EXISTS idx_relatorios_aula_professor ON public.relatorios_aula(professor_id);
CREATE INDEX IF NOT EXISTS idx_relatorios_aula_turma ON public.relatorios_aula(turma_id);
CREATE INDEX IF NOT EXISTS idx_relatorios_aula_data ON public.relatorios_aula(data);

-- professor_alerts
CREATE INDEX IF NOT EXISTS idx_professor_alerts_professor ON public.professor_alerts(professor_id);
CREATE INDEX IF NOT EXISTS idx_professor_alerts_lido ON public.professor_alerts(lido);

-- notas_aluno
CREATE INDEX IF NOT EXISTS idx_notas_aluno_professor ON public.notas_aluno(professor_id);
CREATE INDEX IF NOT EXISTS idx_notas_aluno_aluno ON public.notas_aluno(aluno_id);

-- lesson_requests
CREATE INDEX IF NOT EXISTS idx_lesson_requests_professor ON public.lesson_requests(professor_id);

-- class_students
CREATE INDEX IF NOT EXISTS idx_class_students_class ON public.class_students(class_id);
CREATE INDEX IF NOT EXISTS idx_class_students_student ON public.class_students(student_id);

-- exercise_logs
CREATE INDEX IF NOT EXISTS idx_exercise_logs_plan ON public.exercise_logs(plan_id);

-- stock_movements
CREATE INDEX IF NOT EXISTS idx_stock_movements_item ON public.stock_movements(item_id);

-- shipments
CREATE INDEX IF NOT EXISTS idx_shipments_order ON public.shipments(order_id);

-- contatos_cobranca
CREATE INDEX IF NOT EXISTS idx_contatos_cobranca_devedor ON public.contatos_cobranca(devedor_id);

-- campaign_metrics
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_campaign ON public.campaign_metrics(campaign_id);

-- reviews
CREATE INDEX IF NOT EXISTS idx_reviews_course ON public.reviews(course_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON public.reviews(user_id);

-- wishlist
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON public.wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product ON public.wishlist(product_id);

-- streaming tables
CREATE INDEX IF NOT EXISTS idx_streaming_series_category ON public.streaming_series(category);
CREATE INDEX IF NOT EXISTS idx_streaming_episodes_series ON public.streaming_episodes(series_id);
CREATE INDEX IF NOT EXISTS idx_streaming_library_profile ON public.streaming_library(profile_id);
CREATE INDEX IF NOT EXISTS idx_streaming_certificates_student ON public.streaming_certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_streaming_trail_progress_student ON public.streaming_trail_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_streaming_trail_progress_trail ON public.streaming_trail_progress(trail_id);
CREATE INDEX IF NOT EXISTS idx_streaming_watch_progress_student ON public.streaming_watch_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_streaming_watch_progress_episode ON public.streaming_watch_progress(episode_id);

-- ── Date-based queries ───────────────────────────────────────────

-- messages (flagged in review — already has idx_messages_created in 007 but ensure compound)
CREATE INDEX IF NOT EXISTS idx_messages_channel_created ON public.messages(channel, created_at DESC);

-- leads
CREATE INDEX IF NOT EXISTS idx_leads_created ON public.leads(created_at DESC);

-- notifications — compound for unread queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, read, created_at DESC);

-- feed_posts
CREATE INDEX IF NOT EXISTS idx_feed_posts_academy_created ON public.feed_posts(academy_id, created_at DESC);

-- events
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);

-- challenges
CREATE INDEX IF NOT EXISTS idx_challenges_academy ON public.challenges(academy_id);
CREATE INDEX IF NOT EXISTS idx_challenges_dates ON public.challenges(start_date, end_date);

-- nps_responses
CREATE INDEX IF NOT EXISTS idx_nps_responses_academy ON public.nps_responses(academy_id);

-- webhook_logs
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created ON public.webhook_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_processed ON public.webhook_logs(processed);

-- error_logs
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON public.error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_created ON public.error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON public.error_logs(is_resolved);

-- ── Email lookups ────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_experimentais_email ON public.experimentais(email);
CREATE INDEX IF NOT EXISTS idx_trial_classes_email ON public.trial_classes(lead_email);

-- ── Compete module (extra coverage) ──────────────────────────────

-- tournament_registrations — email lookup for guest athletes
CREATE INDEX IF NOT EXISTS idx_treg_email ON public.tournament_registrations(athlete_email)
  WHERE athlete_email IS NOT NULL;

-- tournament_registrations — cpf lookup
CREATE INDEX IF NOT EXISTS idx_treg_cpf ON public.tournament_registrations(athlete_cpf)
  WHERE athlete_cpf IS NOT NULL;

-- tournaments — search by name
CREATE INDEX IF NOT EXISTS idx_t_name ON public.tournaments(name);

-- ── Soft delete filter ───────────────────────────────────────────

-- messaging_system uses deleted_at — partial index for non-deleted rows
-- (table from 20240320000002_messaging_system.sql)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'messaging_conversations'
    AND column_name = 'deleted_at') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_messaging_conversations_active
      ON public.messaging_conversations(deleted_at) WHERE deleted_at IS NULL';
  END IF;
END $$;


-- ─────────────────────────────────────────────────────────────────
-- PART 2: updated_at TRIGGER FUNCTION (ensure it exists)
-- ─────────────────────────────────────────────────────────────────

-- The function was created in 001_auth_profiles.sql as public.update_updated_at()
-- Ensure it exists (CREATE OR REPLACE is safe)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────────────────────────
-- PART 3: Apply updated_at triggers on tables that have the column
-- but no trigger yet. Uses DO block to skip if trigger exists.
-- ─────────────────────────────────────────────────────────────────

-- Helper: create trigger only if it does not already exist
CREATE OR REPLACE FUNCTION public._create_updated_at_trigger(p_table text)
RETURNS void AS $$
DECLARE
  trigger_name text := p_table || '_set_updated_at';
BEGIN
  -- Check if table has updated_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = p_table AND column_name = 'updated_at'
  ) THEN
    RETURN;
  END IF;

  -- Check if any updated_at trigger already exists on this table
  IF EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE event_object_schema = 'public'
    AND event_object_table = p_table
    AND action_statement LIKE '%update_updated_at%'
  ) THEN
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE event_object_schema = 'public'
    AND event_object_table = p_table
    AND action_statement LIKE '%set_updated_at%'
  ) THEN
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE event_object_schema = 'public'
    AND event_object_table = p_table
    AND action_statement LIKE '%updated_at_column%'
  ) THEN
    RETURN;
  END IF;

  -- Create the trigger using set_updated_at (our new function)
  EXECUTE format(
    'CREATE TRIGGER %I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()',
    trigger_name, p_table
  );
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables that have updated_at but may lack a trigger
-- Core tables (already have triggers from 001-008, but safe to re-check)
SELECT public._create_updated_at_trigger('profiles');
SELECT public._create_updated_at_trigger('academies');
SELECT public._create_updated_at_trigger('units');
SELECT public._create_updated_at_trigger('memberships');
SELECT public._create_updated_at_trigger('modalities');
SELECT public._create_updated_at_trigger('students');
SELECT public._create_updated_at_trigger('guardians');
SELECT public._create_updated_at_trigger('classes');
SELECT public._create_updated_at_trigger('class_enrollments');
SELECT public._create_updated_at_trigger('attendance');
SELECT public._create_updated_at_trigger('progressions');
SELECT public._create_updated_at_trigger('evaluations');
SELECT public._create_updated_at_trigger('videos');
SELECT public._create_updated_at_trigger('series');
SELECT public._create_updated_at_trigger('achievements');
SELECT public._create_updated_at_trigger('messages');
SELECT public._create_updated_at_trigger('plans');
SELECT public._create_updated_at_trigger('subscriptions');
SELECT public._create_updated_at_trigger('invoices');
SELECT public._create_updated_at_trigger('leads');
SELECT public._create_updated_at_trigger('events');
SELECT public._create_updated_at_trigger('class_notes');

-- Tables from 038+: likely missing triggers
SELECT public._create_updated_at_trigger('academy_members');
SELECT public._create_updated_at_trigger('achievement_definitions');
SELECT public._create_updated_at_trigger('products');
SELECT public._create_updated_at_trigger('orders');

-- Tables from 050: enterprise consolidation
-- (belt_progressions has no updated_at, guardian_links has no updated_at)

-- Tables from 054: missing_tables_final
SELECT public._create_updated_at_trigger('announcements');
SELECT public._create_updated_at_trigger('championships');
SELECT public._create_updated_at_trigger('training_plans');
SELECT public._create_updated_at_trigger('goals');
SELECT public._create_updated_at_trigger('campaigns');
SELECT public._create_updated_at_trigger('contracts');

-- Tables from 055: academy config
SELECT public._create_updated_at_trigger('academy_branding');
SELECT public._create_updated_at_trigger('academy_events');
SELECT public._create_updated_at_trigger('academy_plans');
SELECT public._create_updated_at_trigger('academy_platform_plans');
SELECT public._create_updated_at_trigger('academy_usage');
SELECT public._create_updated_at_trigger('billing_config');

-- Tables from 056: financial
SELECT public._create_updated_at_trigger('products');
SELECT public._create_updated_at_trigger('orders');

-- Tables from 057: training
SELECT public._create_updated_at_trigger('curricula');
SELECT public._create_updated_at_trigger('techniques');

-- Tables from 059: gamification
-- (most gamification tables only have created_at)

-- Tables from 060: content
-- (courses, streaming tables — most only have created_at)
SELECT public._create_updated_at_trigger('streaming_watch_progress');

-- Tournament tables from 035
SELECT public._create_updated_at_trigger('tournaments');
SELECT public._create_updated_at_trigger('tournament_registrations');
SELECT public._create_updated_at_trigger('athlete_profiles');
SELECT public._create_updated_at_trigger('academy_tournament_stats');

-- Clean up the helper function
DROP FUNCTION IF EXISTS public._create_updated_at_trigger(text);


-- ─────────────────────────────────────────────────────────────────
-- PART 4: Additional CHECK constraints for status columns
-- These are safe: ADD CONSTRAINT IF NOT EXISTS is not supported,
-- so we use DO blocks with exception handling.
-- ─────────────────────────────────────────────────────────────────

-- orders.status CHECK
DO $$ BEGIN
  ALTER TABLE public.orders ADD CONSTRAINT orders_status_check
    CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'));
EXCEPTION WHEN duplicate_object OR check_violation THEN NULL;
END $$;

-- products.status CHECK
DO $$ BEGIN
  ALTER TABLE public.products ADD CONSTRAINT products_status_check
    CHECK (status IN ('active', 'inactive', 'draft', 'archived'));
EXCEPTION WHEN duplicate_object OR check_violation THEN NULL;
END $$;

-- campaigns.status CHECK
DO $$ BEGIN
  ALTER TABLE public.campaigns ADD CONSTRAINT campaigns_status_check
    CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled'));
EXCEPTION WHEN duplicate_object OR check_violation THEN NULL;
END $$;

-- experimentais.status CHECK
DO $$ BEGIN
  ALTER TABLE public.experimentais ADD CONSTRAINT experimentais_status_check
    CHECK (status IN ('agendada', 'confirmada', 'compareceu', 'matriculou', 'nao_compareceu', 'cancelada'));
EXCEPTION WHEN duplicate_object OR check_violation THEN NULL;
END $$;

-- trial_classes.status CHECK
DO $$ BEGIN
  ALTER TABLE public.trial_classes ADD CONSTRAINT trial_classes_status_check
    CHECK (status IN ('agendada', 'confirmada', 'compareceu', 'matriculou', 'nao_compareceu', 'cancelada'));
EXCEPTION WHEN duplicate_object OR check_violation THEN NULL;
END $$;

-- mensalidades.status CHECK
DO $$ BEGIN
  ALTER TABLE public.mensalidades ADD CONSTRAINT mensalidades_status_check
    CHECK (status IN ('pendente', 'pago', 'atrasado', 'cancelado'));
EXCEPTION WHEN duplicate_object OR check_violation THEN NULL;
END $$;

-- contratos.status CHECK
DO $$ BEGIN
  ALTER TABLE public.contratos ADD CONSTRAINT contratos_status_check
    CHECK (status IN ('rascunho', 'enviado', 'assinado', 'cancelado', 'expirado'));
EXCEPTION WHEN duplicate_object OR check_violation THEN NULL;
END $$;


-- ═══════════════════════════════════════════════════════════════════
-- END Migration 036
-- ═══════════════════════════════════════════════════════════════════
