-- ============================================================
-- BlackBelt v2 — Migration 059: Gamification, Rankings, Seasons
-- ============================================================

-- ── battle_pass_seasons ──
CREATE TABLE IF NOT EXISTS public.battle_pass_seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  is_premium boolean DEFAULT false,
  premium_price numeric(12,2) DEFAULT 0,
  start_date date,
  end_date date,
  status text DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.battle_pass_seasons ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS battle_pass_seasons_read ON public.battle_pass_seasons FOR SELECT USING (true);

-- ── battle_pass_progress ──
CREATE TABLE IF NOT EXISTS public.battle_pass_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  season_id uuid NOT NULL REFERENCES public.battle_pass_seasons(id) ON DELETE CASCADE,
  current_level integer DEFAULT 0,
  current_xp integer DEFAULT 0,
  xp_to_next_level integer DEFAULT 0,
  is_premium boolean DEFAULT false,
  total_rewards_claimed integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.battle_pass_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS battle_pass_progress_own ON public.battle_pass_progress FOR ALL USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- ── seasons ──
CREATE TABLE IF NOT EXISTS public.seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE,
  name text,
  start_date date,
  end_date date,
  status text DEFAULT 'upcoming',
  theme text,
  rewards jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS seasons_isolation ON public.seasons FOR ALL USING (academy_id IN (SELECT m.academy_id FROM public.memberships m JOIN public.profiles p ON p.id = m.profile_id WHERE p.user_id = auth.uid()));

-- ── season_leaderboard ──
CREATE TABLE IF NOT EXISTS public.season_leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id uuid REFERENCES public.seasons(id) ON DELETE CASCADE,
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_name text,
  avatar_url text,
  points integer DEFAULT 0,
  rank integer DEFAULT 0,
  tier text DEFAULT 'bronze',
  category text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.season_leaderboard ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS season_leaderboard_read ON public.season_leaderboard FOR SELECT USING (true);

-- ── season_progress ──
CREATE TABLE IF NOT EXISTS public.season_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id uuid REFERENCES public.seasons(id) ON DELETE CASCADE,
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  season_points integer DEFAULT 0,
  rank integer DEFAULT 0,
  tier text DEFAULT 'bronze',
  achievements_this_season jsonb DEFAULT '[]'::jsonb,
  streak_this_season integer DEFAULT 0,
  classes_attended_this_season integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.season_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS season_progress_own ON public.season_progress FOR ALL USING (student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- ── leagues ──
CREATE TABLE IF NOT EXISTS public.leagues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  season_id text,
  rules text,
  start_date timestamptz,
  end_date timestamptz,
  prizes jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS leagues_read ON public.leagues FOR SELECT USING (true);

-- ── league_standings ──
CREATE TABLE IF NOT EXISTS public.league_standings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE,
  league_id uuid REFERENCES public.leagues(id) ON DELETE CASCADE,
  name text,
  logo text,
  total_points integer DEFAULT 0,
  student_count integer DEFAULT 0,
  per_capita_avg numeric(12,2),
  rank integer DEFAULT 0,
  opted_in boolean DEFAULT false,
  top_contributors jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.league_standings ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS league_standings_read ON public.league_standings FOR SELECT USING (true);

-- ── hall_of_fame ──
CREATE TABLE IF NOT EXISTS public.hall_of_fame (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  category text,
  title text,
  holder_name text,
  holder_avatar text,
  value text,
  description text,
  achieved_at timestamptz DEFAULT now(),
  modality text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.hall_of_fame ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS hall_of_fame_isolation ON public.hall_of_fame FOR ALL USING (academy_id IN (SELECT m.academy_id FROM public.memberships m JOIN public.profiles p ON p.id = m.profile_id WHERE p.user_id = auth.uid()));

-- ── titles ──
CREATE TABLE IF NOT EXISTS public.titles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  description text,
  rarity text DEFAULT 'common',
  requirement text,
  icon_url text,
  color text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.titles ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS titles_read ON public.titles FOR SELECT USING (true);

-- ── user_titles ──
CREATE TABLE IF NOT EXISTS public.user_titles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  title_id uuid REFERENCES public.titles(id) ON DELETE CASCADE,
  is_equipped boolean DEFAULT false,
  is_unlocked boolean DEFAULT false,
  unlocked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_titles ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS user_titles_own ON public.user_titles FOR ALL USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- ── store_rewards ──
CREATE TABLE IF NOT EXISTS public.store_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE,
  name text,
  description text,
  image_url text,
  cost_points integer DEFAULT 0,
  category text DEFAULT 'produto',
  stock integer DEFAULT 0,
  status text DEFAULT 'available',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.store_rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS store_rewards_isolation ON public.store_rewards FOR ALL USING (academy_id IN (SELECT m.academy_id FROM public.memberships m JOIN public.profiles p ON p.id = m.profile_id WHERE p.user_id = auth.uid()));

-- ── reward_balances ──
CREATE TABLE IF NOT EXISTS public.reward_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  points integer DEFAULT 0,
  value_brl numeric(12,2) DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.reward_balances ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS reward_balances_own ON public.reward_balances FOR ALL USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- ── reward_redemptions ──
CREATE TABLE IF NOT EXISTS public.reward_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  reward_id uuid REFERENCES public.store_rewards(id) ON DELETE CASCADE,
  academy_id uuid REFERENCES public.academies(id) ON DELETE CASCADE,
  reward_name text,
  cost_points integer DEFAULT 0,
  status text DEFAULT 'pending',
  user_name text,
  redeemed_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS reward_redemptions_own ON public.reward_redemptions FOR ALL USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- ── reward_transactions ──
CREATE TABLE IF NOT EXISTS public.reward_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  points integer DEFAULT 0,
  description text,
  reference_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.reward_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS reward_transactions_own ON public.reward_transactions FOR ALL USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- ── teen_desafios ──
CREATE TABLE IF NOT EXISTS public.teen_desafios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text,
  description text,
  emoji text,
  type text DEFAULT 'diario',
  xp_reward integer DEFAULT 0,
  progress integer DEFAULT 0,
  target integer DEFAULT 0,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  expires_at timestamptz,
  claimed boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.teen_desafios ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS teen_desafios_own ON public.teen_desafios FOR ALL USING (student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- ── reviews ──
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name text,
  user_belt text,
  rating integer DEFAULT 0,
  text text,
  creator_response text,
  helpful_count integer DEFAULT 0,
  reported boolean DEFAULT false,
  report_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS reviews_read ON public.reviews FOR SELECT USING (true);
