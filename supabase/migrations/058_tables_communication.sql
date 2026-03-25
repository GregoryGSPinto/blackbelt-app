-- ============================================================
-- BlackBelt v2 — Migration 058: Communication, Notifications, Family
-- ============================================================

-- ── campaign_metrics ──
CREATE TABLE IF NOT EXISTS public.campaign_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES public.campaigns(id) ON DELETE CASCADE,
  sent integer DEFAULT 0,
  opened integer DEFAULT 0,
  open_rate numeric(12,2) DEFAULT 0,
  converted integer DEFAULT 0,
  conversion_rate numeric(12,2) DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.campaign_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS campaign_metrics_read ON public.campaign_metrics FOR SELECT USING (true);

-- ── notification_logs ──
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel text,
  recipient text,
  subject text,
  template_name text,
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE,
  user_id uuid,
  status text DEFAULT 'pending',
  provider_message_id text,
  error_message text,
  sent_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS notification_logs_isolation ON public.notification_logs FOR ALL USING (academy_id IN (SELECT m.academy_id FROM public.memberships m JOIN public.profiles p ON p.id = m.profile_id WHERE p.user_id = auth.uid()));

-- ── notification_prefs ──
CREATE TABLE IF NOT EXISTS public.notification_prefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  push_enabled boolean DEFAULT false,
  email_enabled boolean DEFAULT false,
  types jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notification_prefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS notification_prefs_own ON public.notification_prefs FOR ALL USING (user_id = auth.uid());

-- ── guardian_dashboards ──
CREATE TABLE IF NOT EXISTS public.guardian_dashboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  guardian_name text,
  children jsonb DEFAULT '[]'::jsonb,
  consolidated jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.guardian_dashboards ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS guardian_dashboards_own ON public.guardian_dashboards FOR ALL USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- ── guardian_notifications ──
CREATE TABLE IF NOT EXISTS public.guardian_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text DEFAULT 'mensagem',
  title text,
  body text,
  student_name text,
  read boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.guardian_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS guardian_notifications_own ON public.guardian_notifications FOR ALL USING (guardian_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- ── family_calendar ──
CREATE TABLE IF NOT EXISTS public.family_calendar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_start date,
  week_end date,
  events jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.family_calendar ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS family_calendar_own ON public.family_calendar FOR ALL USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- ── family_monthly_reports ──
CREATE TABLE IF NOT EXISTS public.family_monthly_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  month text NOT NULL,
  month_label text,
  children jsonb DEFAULT '[]'::jsonb,
  payments jsonb DEFAULT '[]'::jsonb,
  total_paid numeric(12,2) DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.family_monthly_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS family_monthly_reports_own ON public.family_monthly_reports FOR ALL USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- ── parent_checkin_history ──
CREATE TABLE IF NOT EXISTS public.parent_checkin_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_id uuid,
  child_name text,
  class_name text,
  checked_at timestamptz DEFAULT now(),
  method text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.parent_checkin_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS parent_checkin_history_read ON public.parent_checkin_history FOR SELECT USING (true);

-- ── parent_today_classes ──
CREATE TABLE IF NOT EXISTS public.parent_today_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_id uuid,
  child_id uuid,
  child_name text,
  class_id uuid,
  class_name text,
  class_date timestamptz,
  time text,
  checked_in boolean DEFAULT false,
  checked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.parent_today_classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS parent_today_classes_read ON public.parent_today_classes FOR SELECT USING (true);

-- ── sentiment_trends ──
CREATE TABLE IF NOT EXISTS public.sentiment_trends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE,
  month text NOT NULL,
  positive integer DEFAULT 0,
  neutral integer DEFAULT 0,
  negative integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.sentiment_trends ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS sentiment_trends_isolation ON public.sentiment_trends FOR ALL USING (academy_id IN (SELECT m.academy_id FROM public.memberships m JOIN public.profiles p ON p.id = m.profile_id WHERE p.user_id = auth.uid()));

-- ── suggestions ──
CREATE TABLE IF NOT EXISTS public.suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE,
  role text,
  category text,
  priority text DEFAULT 'medium',
  title text,
  description text,
  action_label text,
  action_url text,
  icon text,
  dismissed_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS suggestions_own ON public.suggestions FOR ALL USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- ── event_enrollments ──
CREATE TABLE IF NOT EXISTS public.event_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.event_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS event_enrollments_read ON public.event_enrollments FOR SELECT USING (true);

-- ── tournament_enrollments ──
CREATE TABLE IF NOT EXISTS public.tournament_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid REFERENCES public.tournaments(id) ON DELETE CASCADE,
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tournament_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS tournament_enrollments_read ON public.tournament_enrollments FOR SELECT USING (true);
