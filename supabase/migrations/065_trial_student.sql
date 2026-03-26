-- ============================================================
-- BlackBelt v2 — Migration 065: Trial Student System
-- Experimental student journey: registration, tracking, conversion
-- ============================================================

-- ══════════════════════════════════════════════════════════════
-- MEMBERSHIP STATUS: add 'trial' + 'expired' + 'cancelled'
-- ══════════════════════════════════════════════════════════════

DO $$
BEGIN
  ALTER TABLE public.memberships DROP CONSTRAINT IF EXISTS memberships_status_check;
  ALTER TABLE public.memberships ADD CONSTRAINT memberships_status_check
    CHECK (status IN ('active','inactive','suspended','cancelled','trial','expired','pending'));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Update get_my_academy_ids to also include 'trial' memberships
-- so trial students can access the app through RLS
CREATE OR REPLACE FUNCTION public.get_my_academy_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT m.academy_id
  FROM public.memberships m
  JOIN public.profiles p ON p.id = m.profile_id
  WHERE p.user_id = auth.uid()
  AND m.status IN ('active', 'trial');
$$;

-- ══════════════════════════════════════════════════════════════
-- TRIAL STUDENTS
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.trial_students (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE NOT NULL,

  -- Contact data (before account creation)
  name text NOT NULL,
  email text,
  phone text NOT NULL,
  birth_date date,

  -- How they arrived
  source text DEFAULT 'walk_in' CHECK (source IN (
    'walk_in',
    'website',
    'instagram',
    'facebook',
    'google',
    'referral',
    'event',
    'whatsapp',
    'other'
  )),
  referred_by_profile_id uuid REFERENCES public.profiles(id),

  -- Interest
  modalities_interest text[] DEFAULT '{}',
  experience_level text DEFAULT 'beginner' CHECK (experience_level IN ('beginner','some_experience','intermediate','advanced')),
  goals text,
  how_heard_about text,

  -- Health (simplified for trial)
  has_health_issues boolean DEFAULT false,
  health_notes text,

  -- Trial period
  trial_start_date date NOT NULL DEFAULT CURRENT_DATE,
  trial_end_date date NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '7 days')::date,
  trial_classes_attended int DEFAULT 0,
  trial_classes_limit int DEFAULT 99,

  -- Account link (when/if created)
  profile_id uuid REFERENCES public.profiles(id),
  membership_id uuid REFERENCES public.memberships(id),

  -- Conversion
  status text DEFAULT 'active' CHECK (status IN ('active','converted','expired','cancelled','no_show')),
  converted_at timestamptz,
  converted_plan text,
  expiry_notified boolean DEFAULT false,

  -- Trial feedback
  rating smallint CHECK (rating BETWEEN 1 AND 5),
  feedback text,
  would_recommend boolean,

  -- Admin notes
  admin_notes text,
  assigned_professor_id uuid REFERENCES public.profiles(id),
  follow_up_date date,
  follow_up_done boolean DEFAULT false,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.trial_students ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS academy_trial ON public.trial_students;
CREATE POLICY academy_trial ON public.trial_students FOR ALL
  USING (academy_id IN (SELECT public.get_my_academy_ids()));

-- ══════════════════════════════════════════════════════════════
-- TRIAL ACTIVITY LOG
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.trial_activity_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  trial_student_id uuid REFERENCES public.trial_students(id) ON DELETE CASCADE NOT NULL,
  academy_id uuid NOT NULL,
  activity_type text NOT NULL CHECK (activity_type IN (
    'registered',
    'first_visit',
    'class_attended',
    'checkin',
    'viewed_schedule',
    'viewed_modality',
    'opened_app',
    'watched_video',
    'met_professor',
    'received_belt',
    'feedback_given',
    'plan_viewed',
    'conversion_started',
    'converted',
    'expired',
    'follow_up_call',
    'follow_up_whatsapp'
  )),
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.trial_activity_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS academy_trial_log ON public.trial_activity_log;
CREATE POLICY academy_trial_log ON public.trial_activity_log FOR ALL
  USING (academy_id IN (SELECT public.get_my_academy_ids()));

-- ══════════════════════════════════════════════════════════════
-- TRIAL CONFIG (per academy)
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.trial_config (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE NOT NULL UNIQUE,

  trial_duration_days int DEFAULT 7,
  trial_classes_limit int DEFAULT 99,
  require_health_declaration boolean DEFAULT true,
  require_phone boolean DEFAULT true,
  require_email boolean DEFAULT false,
  auto_create_account boolean DEFAULT true,

  -- Customizable messages
  welcome_message text DEFAULT 'Bem-vindo à nossa academia! Você tem 7 dias para conhecer tudo. Aproveite!',
  expiry_warning_message text DEFAULT 'Seu período experimental termina em breve. Que tal se matricular e continuar evoluindo?',
  expired_message text DEFAULT 'Seu período experimental terminou. Adoramos ter você aqui! Vamos conversar sobre seu plano?',

  -- Automations
  send_welcome_whatsapp boolean DEFAULT true,
  send_day3_reminder boolean DEFAULT true,
  send_day5_reminder boolean DEFAULT true,
  send_expiry_notification boolean DEFAULT true,
  send_post_expiry_offer boolean DEFAULT true,

  -- Special conversion offer
  conversion_discount_percent numeric(5,2) DEFAULT 0,
  conversion_discount_valid_days int DEFAULT 3,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.trial_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS academy_trial_config ON public.trial_config;
CREATE POLICY academy_trial_config ON public.trial_config FOR ALL
  USING (academy_id IN (SELECT public.get_my_academy_ids()));

-- ══════════════════════════════════════════════════════════════
-- INDICES
-- ══════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_trial_academy ON public.trial_students(academy_id);
CREATE INDEX IF NOT EXISTS idx_trial_status ON public.trial_students(status);
CREATE INDEX IF NOT EXISTS idx_trial_dates ON public.trial_students(trial_start_date, trial_end_date);
CREATE INDEX IF NOT EXISTS idx_trial_phone ON public.trial_students(phone);
CREATE INDEX IF NOT EXISTS idx_trial_log ON public.trial_activity_log(trial_student_id);
CREATE INDEX IF NOT EXISTS idx_trial_log_academy ON public.trial_activity_log(academy_id);
CREATE INDEX IF NOT EXISTS idx_trial_config_academy ON public.trial_config(academy_id);
