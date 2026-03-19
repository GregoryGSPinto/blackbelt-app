-- ═══════════════════════════════════════════════════════
-- Migration 035: BlackBelt Compete — Tournament Platform
-- Tables for tournaments, circuits, categories, brackets,
-- matches, athlete profiles, predictions, and feed.
-- Safe: uses IF NOT EXISTS and DO blocks throughout.
-- ═══════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────
-- 1. tournament_circuits — circuit/series of tournaments
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tournament_circuits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug VARCHAR(120) NOT NULL,
  description TEXT,
  season VARCHAR(20) NOT NULL,
  region VARCHAR(60),
  organizer_id UUID REFERENCES profiles(id),
  total_stages INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tournament_circuits ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS idx_tc_slug ON tournament_circuits(slug);
CREATE INDEX IF NOT EXISTS idx_tc_season ON tournament_circuits(season);
CREATE INDEX IF NOT EXISTS idx_tc_organizer ON tournament_circuits(organizer_id);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_circuits' AND policyname = 'tc_select_public') THEN
    CREATE POLICY "tc_select_public" ON tournament_circuits FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_circuits' AND policyname = 'tc_insert_organizer') THEN
    CREATE POLICY "tc_insert_organizer" ON tournament_circuits FOR INSERT
      WITH CHECK (auth.uid() = organizer_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_circuits' AND policyname = 'tc_update_organizer') THEN
    CREATE POLICY "tc_update_organizer" ON tournament_circuits FOR UPDATE
      USING (auth.uid() = organizer_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_circuits' AND policyname = 'tc_delete_organizer') THEN
    CREATE POLICY "tc_delete_organizer" ON tournament_circuits FOR DELETE
      USING (auth.uid() = organizer_id);
  END IF;
END $$;

-- ─────────────────────────────────────────────────────
-- 2. tournaments — main tournament entity
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug VARCHAR(120) NOT NULL,
  description TEXT,
  rules TEXT,
  date DATE NOT NULL,
  end_date DATE,
  venue TEXT NOT NULL,
  address TEXT,
  city VARCHAR(60),
  state VARCHAR(2),
  organizer_id UUID REFERENCES profiles(id),
  academy_id UUID REFERENCES academies(id),
  circuit_id UUID REFERENCES tournament_circuits(id),
  circuit_stage INTEGER,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'registration_open', 'registration_closed', 'in_progress', 'completed', 'cancelled')),
  modality VARCHAR(30) DEFAULT 'BJJ',
  registration_fee DECIMAL(10,2) DEFAULT 0,
  registration_deadline DATE,
  max_registrations INTEGER,
  total_registrations INTEGER DEFAULT 0,
  total_academies INTEGER DEFAULT 0,
  total_areas INTEGER DEFAULT 3,
  banner_url TEXT,
  logo_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS idx_t_slug ON tournaments(slug);
CREATE INDEX IF NOT EXISTS idx_t_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_t_date ON tournaments(date);
CREATE INDEX IF NOT EXISTS idx_t_organizer ON tournaments(organizer_id);
CREATE INDEX IF NOT EXISTS idx_t_academy ON tournaments(academy_id);
CREATE INDEX IF NOT EXISTS idx_t_circuit ON tournaments(circuit_id);
CREATE INDEX IF NOT EXISTS idx_t_featured ON tournaments(is_featured, status);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournaments' AND policyname = 't_select_published') THEN
    CREATE POLICY "t_select_published" ON tournaments FOR SELECT
      USING (status != 'draft' OR auth.uid() = organizer_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournaments' AND policyname = 't_insert_organizer') THEN
    CREATE POLICY "t_insert_organizer" ON tournaments FOR INSERT
      WITH CHECK (auth.uid() = organizer_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournaments' AND policyname = 't_update_organizer') THEN
    CREATE POLICY "t_update_organizer" ON tournaments FOR UPDATE
      USING (auth.uid() = organizer_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournaments' AND policyname = 't_delete_organizer') THEN
    CREATE POLICY "t_delete_organizer" ON tournaments FOR DELETE
      USING (auth.uid() = organizer_id);
  END IF;
END $$;

-- ─────────────────────────────────────────────────────
-- 3. tournament_categories — weight/belt/age divisions
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tournament_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  belt_range VARCHAR(40),
  weight_range VARCHAR(40),
  age_range VARCHAR(40),
  gender VARCHAR(20) DEFAULT 'masculino',
  modality VARCHAR(30) DEFAULT 'BJJ',
  match_duration_seconds INTEGER DEFAULT 300,
  total_registrations INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tournament_categories ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_tcat_tournament ON tournament_categories(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tcat_status ON tournament_categories(status);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_categories' AND policyname = 'tcat_select_public') THEN
    CREATE POLICY "tcat_select_public" ON tournament_categories FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_categories' AND policyname = 'tcat_insert_organizer') THEN
    CREATE POLICY "tcat_insert_organizer" ON tournament_categories FOR INSERT
      WITH CHECK (
        EXISTS (SELECT 1 FROM tournaments t WHERE t.id = tournament_id AND t.organizer_id = auth.uid())
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_categories' AND policyname = 'tcat_update_organizer') THEN
    CREATE POLICY "tcat_update_organizer" ON tournament_categories FOR UPDATE
      USING (
        EXISTS (SELECT 1 FROM tournaments t WHERE t.id = tournament_id AND t.organizer_id = auth.uid())
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_categories' AND policyname = 'tcat_delete_organizer') THEN
    CREATE POLICY "tcat_delete_organizer" ON tournament_categories FOR DELETE
      USING (
        EXISTS (SELECT 1 FROM tournaments t WHERE t.id = tournament_id AND t.organizer_id = auth.uid())
      );
  END IF;
END $$;

-- ─────────────────────────────────────────────────────
-- 4. tournament_registrations — athlete sign-ups
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tournament_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES tournament_categories(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES profiles(id),
  athlete_name TEXT NOT NULL,
  academy_id UUID REFERENCES academies(id),
  academy_name TEXT,
  belt VARCHAR(30),
  weight DECIMAL(5,2),
  seed INTEGER,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid', 'checked_in', 'weighed_in', 'cancelled', 'no_show')),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'waived')),
  payment_ref TEXT,
  checked_in_at TIMESTAMPTZ,
  weighed_in_at TIMESTAMPTZ,
  weigh_in_value DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tournament_registrations ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_treg_tournament ON tournament_registrations(tournament_id);
CREATE INDEX IF NOT EXISTS idx_treg_category ON tournament_registrations(category_id);
CREATE INDEX IF NOT EXISTS idx_treg_athlete ON tournament_registrations(athlete_id);
CREATE INDEX IF NOT EXISTS idx_treg_academy ON tournament_registrations(academy_id);
CREATE INDEX IF NOT EXISTS idx_treg_status ON tournament_registrations(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_treg_unique ON tournament_registrations(tournament_id, category_id, athlete_id);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_registrations' AND policyname = 'treg_select_own') THEN
    CREATE POLICY "treg_select_own" ON tournament_registrations FOR SELECT
      USING (
        auth.uid() = athlete_id
        OR EXISTS (SELECT 1 FROM tournaments t WHERE t.id = tournament_id AND t.organizer_id = auth.uid())
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_registrations' AND policyname = 'treg_insert') THEN
    CREATE POLICY "treg_insert" ON tournament_registrations FOR INSERT
      WITH CHECK (
        auth.uid() = athlete_id
        OR EXISTS (SELECT 1 FROM tournaments t WHERE t.id = tournament_id AND t.organizer_id = auth.uid())
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_registrations' AND policyname = 'treg_update') THEN
    CREATE POLICY "treg_update" ON tournament_registrations FOR UPDATE
      USING (
        auth.uid() = athlete_id
        OR EXISTS (SELECT 1 FROM tournaments t WHERE t.id = tournament_id AND t.organizer_id = auth.uid())
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_registrations' AND policyname = 'treg_delete') THEN
    CREATE POLICY "treg_delete" ON tournament_registrations FOR DELETE
      USING (
        auth.uid() = athlete_id
        OR EXISTS (SELECT 1 FROM tournaments t WHERE t.id = tournament_id AND t.organizer_id = auth.uid())
      );
  END IF;
END $$;

-- ─────────────────────────────────────────────────────
-- 5. tournament_brackets — bracket metadata per category
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tournament_brackets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES tournament_categories(id) ON DELETE CASCADE,
  method VARCHAR(30) DEFAULT 'single_elimination' CHECK (method IN ('single_elimination', 'double_elimination', 'round_robin')),
  total_rounds INTEGER DEFAULT 0,
  total_athletes INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tournament_brackets ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_tbr_tournament ON tournament_brackets(tournament_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tbr_category ON tournament_brackets(category_id);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_brackets' AND policyname = 'tbr_select_public') THEN
    CREATE POLICY "tbr_select_public" ON tournament_brackets FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_brackets' AND policyname = 'tbr_insert_organizer') THEN
    CREATE POLICY "tbr_insert_organizer" ON tournament_brackets FOR INSERT
      WITH CHECK (
        EXISTS (SELECT 1 FROM tournaments t WHERE t.id = tournament_id AND t.organizer_id = auth.uid())
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_brackets' AND policyname = 'tbr_update_organizer') THEN
    CREATE POLICY "tbr_update_organizer" ON tournament_brackets FOR UPDATE
      USING (
        EXISTS (SELECT 1 FROM tournaments t WHERE t.id = tournament_id AND t.organizer_id = auth.uid())
      );
  END IF;
END $$;

-- ─────────────────────────────────────────────────────
-- 6. tournament_matches — individual fights
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tournament_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bracket_id UUID NOT NULL REFERENCES tournament_brackets(id) ON DELETE CASCADE,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES tournament_categories(id) ON DELETE CASCADE,
  round INTEGER NOT NULL,
  position INTEGER NOT NULL,
  fighter_a_id UUID REFERENCES profiles(id),
  fighter_a_name TEXT,
  fighter_b_id UUID REFERENCES profiles(id),
  fighter_b_name TEXT,
  winner_id UUID REFERENCES profiles(id),
  winner_name TEXT,
  method VARCHAR(30) CHECK (method IS NULL OR method IN ('submission', 'points', 'dq', 'walkover', 'referee_decision', 'draw')),
  submission_name TEXT,
  score_a INTEGER DEFAULT 0,
  score_b INTEGER DEFAULT 0,
  advantages_a INTEGER DEFAULT 0,
  advantages_b INTEGER DEFAULT 0,
  penalties_a INTEGER DEFAULT 0,
  penalties_b INTEGER DEFAULT 0,
  duration_seconds INTEGER,
  mat_number INTEGER,
  area_number INTEGER,
  scheduled_time TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'called', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tournament_matches ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_tm_bracket ON tournament_matches(bracket_id);
CREATE INDEX IF NOT EXISTS idx_tm_tournament ON tournament_matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tm_category ON tournament_matches(category_id);
CREATE INDEX IF NOT EXISTS idx_tm_status ON tournament_matches(status);
CREATE INDEX IF NOT EXISTS idx_tm_area ON tournament_matches(area_number, status);
CREATE INDEX IF NOT EXISTS idx_tm_round ON tournament_matches(bracket_id, round, position);
CREATE INDEX IF NOT EXISTS idx_tm_fighters ON tournament_matches(fighter_a_id, fighter_b_id);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_matches' AND policyname = 'tm_select_public') THEN
    CREATE POLICY "tm_select_public" ON tournament_matches FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_matches' AND policyname = 'tm_insert_organizer') THEN
    CREATE POLICY "tm_insert_organizer" ON tournament_matches FOR INSERT
      WITH CHECK (
        EXISTS (SELECT 1 FROM tournaments t WHERE t.id = tournament_id AND t.organizer_id = auth.uid())
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_matches' AND policyname = 'tm_update_organizer') THEN
    CREATE POLICY "tm_update_organizer" ON tournament_matches FOR UPDATE
      USING (
        EXISTS (SELECT 1 FROM tournaments t WHERE t.id = tournament_id AND t.organizer_id = auth.uid())
      );
  END IF;
END $$;

-- ─────────────────────────────────────────────────────
-- 7. athlete_profiles — competitive profile of athletes
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS athlete_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  nickname TEXT,
  photo_url TEXT,
  belt VARCHAR(30),
  weight DECIMAL(5,2),
  weight_class VARCHAR(30),
  age_group VARCHAR(30),
  academy_id UUID REFERENCES academies(id),
  academy_name TEXT,
  modality VARCHAR(30) DEFAULT 'BJJ',
  total_fights INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  submissions INTEGER DEFAULT 0,
  submissions_suffered INTEGER DEFAULT 0,
  gold_medals INTEGER DEFAULT 0,
  silver_medals INTEGER DEFAULT 0,
  bronze_medals INTEGER DEFAULT 0,
  ranking_points INTEGER DEFAULT 0,
  ranking_position INTEGER,
  win_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE athlete_profiles ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS idx_ap_user ON athlete_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_ap_academy ON athlete_profiles(academy_id);
CREATE INDEX IF NOT EXISTS idx_ap_ranking ON athlete_profiles(ranking_points DESC);
CREATE INDEX IF NOT EXISTS idx_ap_belt ON athlete_profiles(belt);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'athlete_profiles' AND policyname = 'ap_select_public') THEN
    CREATE POLICY "ap_select_public" ON athlete_profiles FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'athlete_profiles' AND policyname = 'ap_insert_own') THEN
    CREATE POLICY "ap_insert_own" ON athlete_profiles FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'athlete_profiles' AND policyname = 'ap_update_own') THEN
    CREATE POLICY "ap_update_own" ON athlete_profiles FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- ─────────────────────────────────────────────────────
-- 8. academy_tournament_stats — academy performance
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS academy_tournament_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  academy_name TEXT NOT NULL,
  total_athletes INTEGER DEFAULT 0,
  gold INTEGER DEFAULT 0,
  silver INTEGER DEFAULT 0,
  bronze INTEGER DEFAULT 0,
  total_fights INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  submissions INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  ranking_position INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE academy_tournament_stats ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS idx_ats_unique ON academy_tournament_stats(academy_id, tournament_id);
CREATE INDEX IF NOT EXISTS idx_ats_tournament ON academy_tournament_stats(tournament_id);
CREATE INDEX IF NOT EXISTS idx_ats_points ON academy_tournament_stats(tournament_id, points DESC);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'academy_tournament_stats' AND policyname = 'ats_select_public') THEN
    CREATE POLICY "ats_select_public" ON academy_tournament_stats FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'academy_tournament_stats' AND policyname = 'ats_insert_organizer') THEN
    CREATE POLICY "ats_insert_organizer" ON academy_tournament_stats FOR INSERT
      WITH CHECK (
        EXISTS (SELECT 1 FROM tournaments t WHERE t.id = tournament_id AND t.organizer_id = auth.uid())
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'academy_tournament_stats' AND policyname = 'ats_update_organizer') THEN
    CREATE POLICY "ats_update_organizer" ON academy_tournament_stats FOR UPDATE
      USING (
        EXISTS (SELECT 1 FROM tournaments t WHERE t.id = tournament_id AND t.organizer_id = auth.uid())
      );
  END IF;
END $$;

-- ─────────────────────────────────────────────────────
-- 9. tournament_predictions — user predictions/bolão
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tournament_predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  match_id UUID REFERENCES tournament_matches(id) ON DELETE CASCADE,
  category_id UUID REFERENCES tournament_categories(id),
  predicted_winner_id UUID REFERENCES profiles(id),
  predicted_method VARCHAR(30),
  is_correct BOOLEAN,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tournament_predictions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_tp_tournament ON tournament_predictions(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tp_user ON tournament_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_tp_match ON tournament_predictions(match_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tp_unique ON tournament_predictions(user_id, match_id);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_predictions' AND policyname = 'tp_select_own') THEN
    CREATE POLICY "tp_select_own" ON tournament_predictions FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_predictions' AND policyname = 'tp_insert_own') THEN
    CREATE POLICY "tp_insert_own" ON tournament_predictions FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_predictions' AND policyname = 'tp_update_own') THEN
    CREATE POLICY "tp_update_own" ON tournament_predictions FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- ─────────────────────────────────────────────────────
-- 10. tournament_feed — announcements, results, photos
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tournament_feed (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL CHECK (type IN ('result', 'announcement', 'photo', 'bracket_update', 'schedule_change', 'medal_ceremony')),
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  match_id UUID REFERENCES tournament_matches(id),
  category_id UUID REFERENCES tournament_categories(id),
  author_id UUID REFERENCES profiles(id),
  author_name TEXT,
  pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tournament_feed ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_tf_tournament ON tournament_feed(tournament_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tf_type ON tournament_feed(tournament_id, type);
CREATE INDEX IF NOT EXISTS idx_tf_pinned ON tournament_feed(tournament_id, pinned, created_at DESC);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_feed' AND policyname = 'tf_select_public') THEN
    CREATE POLICY "tf_select_public" ON tournament_feed FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_feed' AND policyname = 'tf_insert_organizer') THEN
    CREATE POLICY "tf_insert_organizer" ON tournament_feed FOR INSERT
      WITH CHECK (
        EXISTS (SELECT 1 FROM tournaments t WHERE t.id = tournament_id AND t.organizer_id = auth.uid())
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_feed' AND policyname = 'tf_update_organizer') THEN
    CREATE POLICY "tf_update_organizer" ON tournament_feed FOR UPDATE
      USING (
        EXISTS (SELECT 1 FROM tournaments t WHERE t.id = tournament_id AND t.organizer_id = auth.uid())
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_feed' AND policyname = 'tf_delete_organizer') THEN
    CREATE POLICY "tf_delete_organizer" ON tournament_feed FOR DELETE
      USING (
        EXISTS (SELECT 1 FROM tournaments t WHERE t.id = tournament_id AND t.organizer_id = auth.uid())
      );
  END IF;
END $$;
