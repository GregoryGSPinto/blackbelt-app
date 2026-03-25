-- ============================================================
-- BlackBelt v2 — Migration 055: Academy Config & Platform Tables
-- ============================================================

-- ── academy_branding ──
CREATE TABLE IF NOT EXISTS public.academy_branding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  logo_url text,
  primary_color text NOT NULL DEFAULT '#C62828',
  accent_color text NOT NULL DEFAULT '#1565C0',
  academy_name text NOT NULL DEFAULT '',
  custom_domain text,
  favicon_url text,
  login_background text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.academy_branding ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS academy_branding_isolation ON public.academy_branding FOR ALL USING (academy_id IN (SELECT m.academy_id FROM public.memberships m JOIN public.profiles p ON p.id = m.profile_id WHERE p.user_id = auth.uid()));

-- ── academy_events ──
CREATE TABLE IF NOT EXISTS public.academy_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  date date NOT NULL,
  location text DEFAULT '',
  type text DEFAULT 'seminar',
  max_participants integer DEFAULT 0,
  enrolled integer DEFAULT 0,
  modalities jsonb DEFAULT '[]'::jsonb,
  min_belt text DEFAULT 'white',
  fee numeric(12,2) DEFAULT 0,
  status text DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.academy_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS academy_events_isolation ON public.academy_events FOR ALL USING (academy_id IN (SELECT m.academy_id FROM public.memberships m JOIN public.profiles p ON p.id = m.profile_id WHERE p.user_id = auth.uid()));

-- ── academy_plans ──
CREATE TABLE IF NOT EXISTS public.academy_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  plan_tier text NOT NULL DEFAULT 'free',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.academy_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS academy_plans_isolation ON public.academy_plans FOR ALL USING (academy_id IN (SELECT m.academy_id FROM public.memberships m JOIN public.profiles p ON p.id = m.profile_id WHERE p.user_id = auth.uid()));

-- ── academy_platform_plans ──
CREATE TABLE IF NOT EXISTS public.academy_platform_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  platform_plan_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.academy_platform_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS academy_platform_plans_isolation ON public.academy_platform_plans FOR ALL USING (academy_id IN (SELECT m.academy_id FROM public.memberships m JOIN public.profiles p ON p.id = m.profile_id WHERE p.user_id = auth.uid()));

-- ── academy_usage ──
CREATE TABLE IF NOT EXISTS public.academy_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  plan text DEFAULT 'free',
  students_active integer DEFAULT 0,
  units integer DEFAULT 0,
  classes integer DEFAULT 0,
  usage_percent numeric(12,2) DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.academy_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS academy_usage_isolation ON public.academy_usage FOR ALL USING (academy_id IN (SELECT m.academy_id FROM public.memberships m JOIN public.profiles p ON p.id = m.profile_id WHERE p.user_id = auth.uid()));

-- ── billing_plans ──
CREATE TABLE IF NOT EXISTS public.billing_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  price_monthly integer DEFAULT 0,
  price_yearly integer DEFAULT 0,
  limits jsonb DEFAULT '{}'::jsonb,
  overage jsonb DEFAULT '{}'::jsonb,
  modules jsonb DEFAULT '{}'::jsonb,
  support_level text DEFAULT 'email',
  is_popular boolean DEFAULT false,
  badge_color text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.billing_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS billing_plans_read ON public.billing_plans FOR SELECT USING (true);

-- ── billing_config ──
CREATE TABLE IF NOT EXISTS public.billing_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  auto_charge boolean DEFAULT false,
  due_day_of_month integer DEFAULT 5,
  reminder_days_before integer DEFAULT 3,
  block_after_days integer DEFAULT 10,
  gateway text DEFAULT 'mock',
  gateway_api_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.billing_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS billing_config_isolation ON public.billing_config FOR ALL USING (academy_id IN (SELECT m.academy_id FROM public.memberships m JOIN public.profiles p ON p.id = m.profile_id WHERE p.user_id = auth.uid()));

-- ── billing_alerts ──
CREATE TABLE IF NOT EXISTS public.billing_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  resource text NOT NULL,
  level text DEFAULT 'normal',
  message text DEFAULT '',
  percent numeric(12,2) DEFAULT 0,
  dismissed boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.billing_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS billing_alerts_isolation ON public.billing_alerts FOR ALL USING (academy_id IN (SELECT m.academy_id FROM public.memberships m JOIN public.profiles p ON p.id = m.profile_id WHERE p.user_id = auth.uid()));

-- ── billing_invoices ──
CREATE TABLE IF NOT EXISTS public.billing_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  period text NOT NULL,
  base_cost_cents integer DEFAULT 0,
  overage_details jsonb DEFAULT '[]'::jsonb,
  overage_total_cents integer DEFAULT 0,
  total_cents integer DEFAULT 0,
  status text DEFAULT 'pending',
  paid_at timestamptz,
  pdf_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.billing_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS billing_invoices_isolation ON public.billing_invoices FOR ALL USING (academy_id IN (SELECT m.academy_id FROM public.memberships m JOIN public.profiles p ON p.id = m.profile_id WHERE p.user_id = auth.uid()));

-- ── billing_overage_projections ──
CREATE TABLE IF NOT EXISTS public.billing_overage_projections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  base_cost_cents integer DEFAULT 0,
  overage_students jsonb DEFAULT '{}'::jsonb,
  overage_professors jsonb DEFAULT '{}'::jsonb,
  overage_classes jsonb DEFAULT '{}'::jsonb,
  overage_storage jsonb DEFAULT '{}'::jsonb,
  total_overage_cents integer DEFAULT 0,
  total_cents integer DEFAULT 0,
  upgrade_suggestion jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.billing_overage_projections ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS billing_overage_projections_isolation ON public.billing_overage_projections FOR ALL USING (academy_id IN (SELECT m.academy_id FROM public.memberships m JOIN public.profiles p ON p.id = m.profile_id WHERE p.user_id = auth.uid()));

-- ── billing_previews ──
CREATE TABLE IF NOT EXISTS public.billing_previews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  total_invoices integer DEFAULT 0,
  total_amount numeric(12,2) DEFAULT 0,
  next_due_date date,
  subscriptions_affected integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.billing_previews ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS billing_previews_isolation ON public.billing_previews FOR ALL USING (academy_id IN (SELECT m.academy_id FROM public.memberships m JOIN public.profiles p ON p.id = m.profile_id WHERE p.user_id = auth.uid()));

-- ── billing_summaries ──
CREATE TABLE IF NOT EXISTS public.billing_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  plan jsonb DEFAULT '{}'::jsonb,
  billing_cycle text DEFAULT 'monthly',
  cycle_start date NOT NULL DEFAULT CURRENT_DATE,
  cycle_end date NOT NULL DEFAULT CURRENT_DATE,
  base_cost_cents integer DEFAULT 0,
  overage_cost_cents integer DEFAULT 0,
  total_cost_cents integer DEFAULT 0,
  usage jsonb DEFAULT '[]'::jsonb,
  trial jsonb DEFAULT '{}'::jsonb,
  next_invoice_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.billing_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS billing_summaries_isolation ON public.billing_summaries FOR ALL USING (academy_id IN (SELECT m.academy_id FROM public.memberships m JOIN public.profiles p ON p.id = m.profile_id WHERE p.user_id = auth.uid()));

-- ── billing_downgrade_requests ──
CREATE TABLE IF NOT EXISTS public.billing_downgrade_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  plan_slug text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.billing_downgrade_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS billing_downgrade_requests_isolation ON public.billing_downgrade_requests FOR ALL USING (academy_id IN (SELECT m.academy_id FROM public.memberships m JOIN public.profiles p ON p.id = m.profile_id WHERE p.user_id = auth.uid()));

-- ── billing_upgrade_requests ──
CREATE TABLE IF NOT EXISTS public.billing_upgrade_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  plan_slug text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.billing_upgrade_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS billing_upgrade_requests_isolation ON public.billing_upgrade_requests FOR ALL USING (academy_id IN (SELECT m.academy_id FROM public.memberships m JOIN public.profiles p ON p.id = m.profile_id WHERE p.user_id = auth.uid()));

-- ── billing_usage_metrics ──
CREATE TABLE IF NOT EXISTS public.billing_usage_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  resource text NOT NULL,
  label text DEFAULT '',
  icon text DEFAULT '',
  current_val numeric(12,2) DEFAULT 0,
  limit_val numeric(12,2) DEFAULT 0,
  percent numeric(12,2) DEFAULT 0,
  status text DEFAULT 'normal',
  overage_count integer DEFAULT 0,
  overage_cost_cents integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.billing_usage_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS billing_usage_metrics_isolation ON public.billing_usage_metrics FOR ALL USING (academy_id IN (SELECT m.academy_id FROM public.memberships m JOIN public.profiles p ON p.id = m.profile_id WHERE p.user_id = auth.uid()));

-- ── wizard_progress ──
CREATE TABLE IF NOT EXISTS public.wizard_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE,
  current_step integer DEFAULT 0,
  completed_steps jsonb DEFAULT '[]'::jsonb,
  steps_data jsonb DEFAULT '{}'::jsonb,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.wizard_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS wizard_progress_isolation ON public.wizard_progress FOR ALL USING (academy_id IN (SELECT m.academy_id FROM public.memberships m JOIN public.profiles p ON p.id = m.profile_id WHERE p.user_id = auth.uid()));

-- ── insights ──
CREATE TABLE IF NOT EXISTS public.insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  type text,
  severity text DEFAULT 'info',
  title text,
  description text,
  action_url text,
  data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS insights_isolation ON public.insights FOR ALL USING (academy_id IN (SELECT m.academy_id FROM public.memberships m JOIN public.profiles p ON p.id = m.profile_id WHERE p.user_id = auth.uid()));

-- ── error_logs ──
CREATE TABLE IF NOT EXISTS public.error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  severity text DEFAULT 'error',
  message text,
  stack text,
  page text,
  count integer DEFAULT 0,
  first_seen timestamptz DEFAULT now(),
  last_seen timestamptz DEFAULT now(),
  affected_users integer DEFAULT 0,
  affected_sessions integer DEFAULT 0,
  browser text,
  os text,
  is_resolved boolean DEFAULT false,
  type text,
  endpoint text,
  method text,
  status_code integer,
  avg_response_time_ms integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS error_logs_read ON public.error_logs FOR SELECT USING (true);

-- ── storage_stats ──
CREATE TABLE IF NOT EXISTS public.storage_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE,
  total_videos integer DEFAULT 0,
  total_size_gb numeric(12,2) DEFAULT 0,
  limit_gb numeric(12,2) DEFAULT 50,
  usage_percent numeric(12,2) DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.storage_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS storage_stats_isolation ON public.storage_stats FOR ALL USING (academy_id IN (SELECT m.academy_id FROM public.memberships m JOIN public.profiles p ON p.id = m.profile_id WHERE p.user_id = auth.uid()));

-- ── spaces ──
CREATE TABLE IF NOT EXISTS public.spaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid REFERENCES public.units(id) ON DELETE CASCADE,
  name text,
  capacity integer DEFAULT 0,
  equipment jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'available',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS spaces_read ON public.spaces FOR SELECT USING (true);

-- ── space_schedules ──
CREATE TABLE IF NOT EXISTS public.space_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid REFERENCES public.units(id) ON DELETE CASCADE,
  space_id uuid REFERENCES public.spaces(id) ON DELETE CASCADE,
  space_name text,
  day integer DEFAULT 0,
  start_time text,
  end_time text,
  class_name text,
  professor text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.space_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS space_schedules_read ON public.space_schedules FOR SELECT USING (true);
