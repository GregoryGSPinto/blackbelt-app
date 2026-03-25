-- ============================================================
-- BlackBelt v2 — Migration 054: Missing Tables (Final Consolidation)
-- ============================================================
-- Creates tables referenced by services but not yet in migrations.
-- All use CREATE IF NOT EXISTS to be safe to re-run.
-- All have RLS enabled.

-- ── Announcements ──
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  target_roles text[] DEFAULT '{}',
  created_by uuid REFERENCES public.profiles(id),
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY announcements_select ON public.announcements FOR SELECT USING (true);
CREATE POLICY announcements_manage ON public.announcements FOR ALL USING (
  EXISTS (SELECT 1 FROM public.memberships m JOIN public.profiles p ON p.id = m.profile_id
    WHERE p.user_id = auth.uid() AND m.academy_id = announcements.academy_id AND m.role IN ('admin', 'gestor'))
);

CREATE TABLE IF NOT EXISTS public.announcement_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id uuid NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  read_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(announcement_id, profile_id)
);
ALTER TABLE public.announcement_reads ENABLE ROW LEVEL SECURITY;
CREATE POLICY announcement_reads_own ON public.announcement_reads FOR ALL USING (
  profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- ── Certificates ──
CREATE TABLE IF NOT EXISTS public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'graduation',
  title text NOT NULL,
  description text,
  belt_rank text,
  issued_at timestamptz NOT NULL DEFAULT now(),
  pdf_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY certificates_select ON public.certificates FOR SELECT USING (true);
CREATE POLICY certificates_manage ON public.certificates FOR ALL USING (
  EXISTS (SELECT 1 FROM public.memberships m JOIN public.profiles p ON p.id = m.profile_id
    WHERE p.user_id = auth.uid() AND m.academy_id = certificates.academy_id AND m.role IN ('admin', 'professor'))
);

-- ── Championships (simple, not tournament module) ──
CREATE TABLE IF NOT EXISTS public.championships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  location text,
  start_date date,
  end_date date,
  status text DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.championships ENABLE ROW LEVEL SECURITY;
CREATE POLICY championships_select ON public.championships FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.championship_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  championship_id uuid NOT NULL REFERENCES public.championships(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category text,
  weight_class text,
  status text DEFAULT 'registered',
  registered_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(championship_id, profile_id)
);
ALTER TABLE public.championship_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY champ_reg_select ON public.championship_registrations FOR SELECT USING (true);

-- ── Brackets ──
CREATE TABLE IF NOT EXISTS public.brackets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  championship_id uuid REFERENCES public.championships(id) ON DELETE CASCADE,
  tournament_id uuid REFERENCES public.tournaments(id) ON DELETE CASCADE,
  category text,
  size integer DEFAULT 8,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.brackets ENABLE ROW LEVEL SECURITY;
CREATE POLICY brackets_select ON public.brackets FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.bracket_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bracket_id uuid NOT NULL REFERENCES public.brackets(id) ON DELETE CASCADE,
  round integer NOT NULL DEFAULT 1,
  position integer NOT NULL DEFAULT 0,
  athlete_a uuid REFERENCES public.profiles(id),
  athlete_b uuid REFERENCES public.profiles(id),
  winner_id uuid REFERENCES public.profiles(id),
  score_a text,
  score_b text,
  status text DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.bracket_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY bracket_matches_select ON public.bracket_matches FOR SELECT USING (true);

-- ── Physical Assessments ──
CREATE TABLE IF NOT EXISTS public.physical_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assessed_by uuid REFERENCES public.profiles(id),
  weight_kg numeric,
  height_cm numeric,
  body_fat_pct numeric,
  flexibility_score numeric,
  endurance_score numeric,
  strength_score numeric,
  notes text,
  assessed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.physical_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY phys_assess_select ON public.physical_assessments FOR SELECT USING (
  profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.memberships m JOIN public.profiles p ON p.id = m.profile_id
    WHERE p.user_id = auth.uid() AND m.academy_id = physical_assessments.academy_id AND m.role IN ('admin', 'professor'))
);

-- ── Training Plans ──
CREATE TABLE IF NOT EXISTS public.training_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_by uuid REFERENCES public.profiles(id),
  title text NOT NULL,
  description text,
  start_date date,
  end_date date,
  plan_data jsonb DEFAULT '{}',
  status text DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.training_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY training_plans_select ON public.training_plans FOR SELECT USING (
  profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.memberships m JOIN public.profiles p ON p.id = m.profile_id
    WHERE p.user_id = auth.uid() AND m.academy_id = training_plans.academy_id AND m.role IN ('admin', 'professor'))
);

-- ── Notification Preferences ──
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  channel text NOT NULL DEFAULT 'push',
  category text NOT NULL DEFAULT 'general',
  enabled boolean NOT NULL DEFAULT true,
  UNIQUE(profile_id, channel, category)
);
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY notif_prefs_own ON public.notification_preferences FOR ALL USING (
  profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- ── Goals ──
CREATE TABLE IF NOT EXISTS public.goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  target_value numeric,
  current_value numeric DEFAULT 0,
  unit text,
  deadline date,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY goals_own ON public.goals FOR ALL USING (
  profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- ── Diary Entries (class journals) ──
CREATE TABLE IF NOT EXISTS public.diary_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  author_id uuid NOT NULL REFERENCES public.profiles(id),
  date date NOT NULL DEFAULT CURRENT_DATE,
  content text,
  techniques text[],
  observations text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY diary_entries_select ON public.diary_entries FOR SELECT USING (true);
CREATE POLICY diary_entries_manage ON public.diary_entries FOR ALL USING (
  author_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- ── Campaigns (marketing) ──
CREATE TABLE IF NOT EXISTS public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text DEFAULT 'email',
  status text DEFAULT 'draft',
  target_audience jsonb DEFAULT '{}',
  content jsonb DEFAULT '{}',
  sent_count integer DEFAULT 0,
  open_count integer DEFAULT 0,
  scheduled_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY campaigns_manage ON public.campaigns FOR ALL USING (
  EXISTS (SELECT 1 FROM public.memberships m JOIN public.profiles p ON p.id = m.profile_id
    WHERE p.user_id = auth.uid() AND m.academy_id = campaigns.academy_id AND m.role IN ('admin', 'gestor'))
);

-- ── Calendar Events ──
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  start_at timestamptz NOT NULL,
  end_at timestamptz,
  all_day boolean DEFAULT false,
  type text DEFAULT 'event',
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY calendar_events_select ON public.calendar_events FOR SELECT USING (true);

-- ── Contracts ──
CREATE TABLE IF NOT EXISTS public.contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES public.plans(id),
  status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled', 'expired')),
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  monthly_value numeric,
  payment_day integer DEFAULT 10,
  signed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY contracts_select ON public.contracts FOR SELECT USING (
  profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.memberships m JOIN public.profiles p ON p.id = m.profile_id
    WHERE p.user_id = auth.uid() AND m.academy_id = contracts.academy_id AND m.role IN ('admin', 'gestor'))
);

-- ── Indexes for new tables ──
CREATE INDEX IF NOT EXISTS idx_announcements_academy ON public.announcements(academy_id);
CREATE INDEX IF NOT EXISTS idx_certificates_academy ON public.certificates(academy_id);
CREATE INDEX IF NOT EXISTS idx_certificates_profile ON public.certificates(profile_id);
CREATE INDEX IF NOT EXISTS idx_championships_academy ON public.championships(academy_id);
CREATE INDEX IF NOT EXISTS idx_physical_assessments_profile ON public.physical_assessments(profile_id);
CREATE INDEX IF NOT EXISTS idx_training_plans_profile ON public.training_plans(profile_id);
CREATE INDEX IF NOT EXISTS idx_goals_profile ON public.goals(profile_id);
CREATE INDEX IF NOT EXISTS idx_diary_entries_academy ON public.diary_entries(academy_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_academy ON public.campaigns(academy_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_academy ON public.calendar_events(academy_id);
CREATE INDEX IF NOT EXISTS idx_contracts_academy ON public.contracts(academy_id);
CREATE INDEX IF NOT EXISTS idx_contracts_profile ON public.contracts(profile_id);
