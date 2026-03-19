-- ═══════════════════════════════════════════════════════════════════
-- Migration 035: BlackBelt Compete — Full Tournament Platform
-- 10 tables: circuits, tournaments, categories, registrations,
-- brackets, matches, athlete_profiles, academy_stats, predictions, feed.
-- Safe: uses IF NOT EXISTS and DO blocks throughout.
-- ═══════════════════════════════════════════════════════════════════

-- Drop old tables if they exist from previous version of this migration
-- (reverse dependency order to avoid FK errors)
DROP TABLE IF EXISTS tournament_feed CASCADE;
DROP TABLE IF EXISTS tournament_predictions CASCADE;
DROP TABLE IF EXISTS academy_tournament_stats CASCADE;
DROP TABLE IF EXISTS athlete_profiles CASCADE;
DROP TABLE IF EXISTS tournament_matches CASCADE;
DROP TABLE IF EXISTS tournament_brackets CASCADE;
DROP TABLE IF EXISTS tournament_registrations CASCADE;
DROP TABLE IF EXISTS tournament_categories CASCADE;
DROP TABLE IF EXISTS tournaments CASCADE;
DROP TABLE IF EXISTS tournament_circuits CASCADE;


-- ─────────────────────────────────────────────────────────────────
-- 1. tournament_circuits — Series of tournaments (created FIRST)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tournament_circuits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM now())::INTEGER,
  banner_url TEXT,
  scoring_system JSONB DEFAULT '{"gold": 9, "silver": 3, "bronze": 1}'::JSONB,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tournament_circuits ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS idx_tc_slug ON tournament_circuits(slug);
CREATE INDEX IF NOT EXISTS idx_tc_year ON tournament_circuits(year);
CREATE INDEX IF NOT EXISTS idx_tc_status ON tournament_circuits(status);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_circuits' AND policyname = 'tc_select_public') THEN
    CREATE POLICY "tc_select_public" ON tournament_circuits FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_circuits' AND policyname = 'tc_insert_authenticated') THEN
    CREATE POLICY "tc_insert_authenticated" ON tournament_circuits FOR INSERT
      WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_circuits' AND policyname = 'tc_update_authenticated') THEN
    CREATE POLICY "tc_update_authenticated" ON tournament_circuits FOR UPDATE
      USING (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_circuits' AND policyname = 'tc_delete_authenticated') THEN
    CREATE POLICY "tc_delete_authenticated" ON tournament_circuits FOR DELETE
      USING (auth.uid() IS NOT NULL);
  END IF;
END $$;


-- ─────────────────────────────────────────────────────────────────
-- 2. tournaments — Main tournament table
--    Status flow: aguardando_aprovacao → draft → published →
--    registration_open → registration_closed → weigh_in →
--    live → completed → cancelled
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Identity
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(120) NOT NULL,
  description TEXT,
  rules TEXT, -- markdown

  -- Organizer
  organizer_academy_id UUID REFERENCES academies(id) ON DELETE SET NULL,
  organizer_name VARCHAR(200),
  organizer_phone VARCHAR(30),
  organizer_email VARCHAR(200),

  -- BlackBelt official
  is_blackbelt_official BOOLEAN DEFAULT false,
  circuit_id UUID REFERENCES tournament_circuits(id) ON DELETE SET NULL,
  circuit_order INTEGER,

  -- Date & venue
  event_date DATE NOT NULL,
  event_end_date DATE,
  event_time VARCHAR(10),
  venue_name VARCHAR(200),
  venue_address TEXT,
  venue_city VARCHAR(100),
  venue_state VARCHAR(2),
  venue_lat DECIMAL(10,7),
  venue_lng DECIMAL(10,7),
  venue_map_url TEXT,

  -- Visual
  banner_url TEXT,
  logo_url TEXT,
  primary_color VARCHAR(10) DEFAULT '#EF4444',
  secondary_color VARCHAR(10) DEFAULT '#1A1A2E',

  -- Registration
  registration_open BOOLEAN DEFAULT false,
  registration_deadline TIMESTAMPTZ,
  registration_fee DECIMAL(10,2) DEFAULT 0,
  early_bird_fee DECIMAL(10,2),
  early_bird_deadline TIMESTAMPTZ,
  max_athletes INTEGER,
  allow_individual BOOLEAN DEFAULT true,
  allow_academy_batch BOOLEAN DEFAULT true,

  -- Config
  modalities TEXT[] DEFAULT ARRAY['BJJ']::TEXT[],
  weigh_in_required BOOLEAN DEFAULT true,
  areas_count INTEGER DEFAULT 4,
  match_duration_seconds INTEGER DEFAULT 300,
  bracket_type VARCHAR(30) DEFAULT 'single_elimination' CHECK (bracket_type IN ('single_elimination', 'double_elimination', 'round_robin')),

  -- Prize
  prize_description TEXT,
  trophies BOOLEAN DEFAULT true,
  certificates BOOLEAN DEFAULT true,

  -- Sponsors
  sponsors JSONB DEFAULT '[]'::JSONB,

  -- Status — aguardando_aprovacao is FIRST (default for academy-created tournaments)
  status VARCHAR(20) DEFAULT 'aguardando_aprovacao' CHECK (
    status IN (
      'aguardando_aprovacao',
      'draft',
      'published',
      'registration_open',
      'registration_closed',
      'weigh_in',
      'live',
      'completed',
      'cancelled'
    )
  ),

  -- Metrics
  total_registrations INTEGER DEFAULT 0,
  total_academies INTEGER DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,

  -- Approval
  approved_at TIMESTAMPTZ,
  approved_by UUID,
  rejection_reason TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS idx_t_slug ON tournaments(slug);
CREATE INDEX IF NOT EXISTS idx_t_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_t_event_date ON tournaments(event_date);
CREATE INDEX IF NOT EXISTS idx_t_organizer_academy ON tournaments(organizer_academy_id);
CREATE INDEX IF NOT EXISTS idx_t_circuit ON tournaments(circuit_id);
CREATE INDEX IF NOT EXISTS idx_t_official ON tournaments(is_blackbelt_official, status);
CREATE INDEX IF NOT EXISTS idx_t_city_state ON tournaments(venue_city, venue_state);
CREATE INDEX IF NOT EXISTS idx_t_registration_deadline ON tournaments(registration_deadline) WHERE registration_open = true;
CREATE INDEX IF NOT EXISTS idx_t_approved_by ON tournaments(approved_by) WHERE approved_by IS NOT NULL;

DO $$ BEGIN
  -- Public reads for published / registration_open / registration_closed / weigh_in / live / completed
  -- Organizer reads own tournaments in any status (including aguardando_aprovacao, draft)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournaments' AND policyname = 't_select_published') THEN
    CREATE POLICY "t_select_published" ON tournaments FOR SELECT
      USING (
        status IN ('published', 'registration_open', 'registration_closed', 'weigh_in', 'live', 'completed')
        OR organizer_academy_id IN (
          SELECT m.academy_id FROM memberships m WHERE m.profile_id = auth.uid()
        )
      );
  END IF;

  -- Organizer insert (academy members can create tournaments for their academy)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournaments' AND policyname = 't_insert_organizer') THEN
    CREATE POLICY "t_insert_organizer" ON tournaments FOR INSERT
      WITH CHECK (
        organizer_academy_id IN (
          SELECT m.academy_id FROM memberships m WHERE m.profile_id = auth.uid()
        )
      );
  END IF;

  -- Organizer update (only for own academy's tournaments)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournaments' AND policyname = 't_update_organizer') THEN
    CREATE POLICY "t_update_organizer" ON tournaments FOR UPDATE
      USING (
        organizer_academy_id IN (
          SELECT m.academy_id FROM memberships m WHERE m.profile_id = auth.uid()
        )
      );
  END IF;

  -- Organizer delete (only for own academy's tournaments)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournaments' AND policyname = 't_delete_organizer') THEN
    CREATE POLICY "t_delete_organizer" ON tournaments FOR DELETE
      USING (
        organizer_academy_id IN (
          SELECT m.academy_id FROM memberships m WHERE m.profile_id = auth.uid()
        )
      );
  END IF;
END $$;


-- ─────────────────────────────────────────────────────────────────
-- 3. tournament_categories — Weight/belt/age divisions per tournament
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tournament_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  gender VARCHAR(20) DEFAULT 'masculino' CHECK (gender IN ('masculino', 'feminino', 'misto')),
  age_min INTEGER,
  age_max INTEGER,
  age_group VARCHAR(50), -- e.g. 'adulto', 'master', 'juvenil'
  belt_min VARCHAR(30),
  belt_max VARCHAR(30),
  belt_range VARCHAR(60), -- display string e.g. 'branca-azul'
  weight_min DECIMAL(5,2),
  weight_max DECIMAL(5,2),
  weight_class VARCHAR(50), -- e.g. 'leve', 'meio-pesado', 'absoluto'
  modality VARCHAR(30) DEFAULT 'BJJ',
  gi_nogi VARCHAR(10) DEFAULT 'gi' CHECK (gi_nogi IN ('gi', 'nogi', 'both')),
  match_duration_seconds INTEGER DEFAULT 300,
  total_registrations INTEGER DEFAULT 0,
  max_athletes INTEGER,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'in_progress', 'completed', 'cancelled')),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tournament_categories ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_tcat_tournament ON tournament_categories(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tcat_status ON tournament_categories(status);
CREATE INDEX IF NOT EXISTS idx_tcat_gender ON tournament_categories(tournament_id, gender);
CREATE INDEX IF NOT EXISTS idx_tcat_modality ON tournament_categories(tournament_id, modality);
CREATE INDEX IF NOT EXISTS idx_tcat_display ON tournament_categories(tournament_id, display_order);

DO $$ BEGIN
  -- Public reads
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_categories' AND policyname = 'tcat_select_public') THEN
    CREATE POLICY "tcat_select_public" ON tournament_categories FOR SELECT USING (true);
  END IF;

  -- Organizer insert
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_categories' AND policyname = 'tcat_insert_organizer') THEN
    CREATE POLICY "tcat_insert_organizer" ON tournament_categories FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM tournaments t
          JOIN memberships m ON m.academy_id = t.organizer_academy_id
          WHERE t.id = tournament_id AND m.profile_id = auth.uid()
        )
      );
  END IF;

  -- Organizer update
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_categories' AND policyname = 'tcat_update_organizer') THEN
    CREATE POLICY "tcat_update_organizer" ON tournament_categories FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM tournaments t
          JOIN memberships m ON m.academy_id = t.organizer_academy_id
          WHERE t.id = tournament_id AND m.profile_id = auth.uid()
        )
      );
  END IF;

  -- Organizer delete
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_categories' AND policyname = 'tcat_delete_organizer') THEN
    CREATE POLICY "tcat_delete_organizer" ON tournament_categories FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM tournaments t
          JOIN memberships m ON m.academy_id = t.organizer_academy_id
          WHERE t.id = tournament_id AND m.profile_id = auth.uid()
        )
      );
  END IF;
END $$;


-- ─────────────────────────────────────────────────────────────────
-- 4. tournament_registrations — Athlete sign-ups
--    user_id is NULLABLE to support guest athletes (non-platform users)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tournament_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES tournament_categories(id) ON DELETE CASCADE,

  -- Athlete identity (user_id nullable for guest athletes)
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  athlete_name VARCHAR(200) NOT NULL,
  athlete_email VARCHAR(200),
  athlete_phone VARCHAR(30),
  athlete_cpf VARCHAR(14),
  athlete_birth_date DATE,

  -- Academy
  academy_id UUID REFERENCES academies(id) ON DELETE SET NULL,
  academy_name VARCHAR(200),

  -- Competition data
  belt VARCHAR(30),
  weight DECIMAL(5,2),
  seed INTEGER,

  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (
    status IN ('pending', 'confirmed', 'paid', 'checked_in', 'weighed_in', 'cancelled', 'no_show')
  ),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (
    payment_status IN ('pending', 'paid', 'refunded', 'waived')
  ),
  payment_ref TEXT,
  payment_amount DECIMAL(10,2),

  -- Check-in & weigh-in
  checked_in_at TIMESTAMPTZ,
  weighed_in_at TIMESTAMPTZ,
  weigh_in_value DECIMAL(5,2),

  -- Batch registration reference
  batch_id UUID, -- groups athletes registered together by an academy
  registered_by UUID REFERENCES profiles(id), -- who registered this athlete

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tournament_registrations ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_treg_tournament ON tournament_registrations(tournament_id);
CREATE INDEX IF NOT EXISTS idx_treg_category ON tournament_registrations(category_id);
CREATE INDEX IF NOT EXISTS idx_treg_user ON tournament_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_treg_academy ON tournament_registrations(academy_id);
CREATE INDEX IF NOT EXISTS idx_treg_status ON tournament_registrations(status);
CREATE INDEX IF NOT EXISTS idx_treg_payment ON tournament_registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_treg_batch ON tournament_registrations(batch_id) WHERE batch_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_treg_unique ON tournament_registrations(tournament_id, category_id, user_id)
  WHERE user_id IS NOT NULL;

DO $$ BEGIN
  -- Anyone can INSERT (guest athletes too — no auth required for insert)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_registrations' AND policyname = 'treg_insert_public') THEN
    CREATE POLICY "treg_insert_public" ON tournament_registrations FOR INSERT
      WITH CHECK (true);
  END IF;

  -- User reads own registrations; organizer reads all for their tournament
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_registrations' AND policyname = 'treg_select_own_or_organizer') THEN
    CREATE POLICY "treg_select_own_or_organizer" ON tournament_registrations FOR SELECT
      USING (
        auth.uid() = user_id
        OR auth.uid() = registered_by
        OR EXISTS (
          SELECT 1 FROM tournaments t
          JOIN memberships m ON m.academy_id = t.organizer_academy_id
          WHERE t.id = tournament_id AND m.profile_id = auth.uid()
        )
      );
  END IF;

  -- User updates own; organizer updates all for their tournament
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_registrations' AND policyname = 'treg_update') THEN
    CREATE POLICY "treg_update" ON tournament_registrations FOR UPDATE
      USING (
        auth.uid() = user_id
        OR auth.uid() = registered_by
        OR EXISTS (
          SELECT 1 FROM tournaments t
          JOIN memberships m ON m.academy_id = t.organizer_academy_id
          WHERE t.id = tournament_id AND m.profile_id = auth.uid()
        )
      );
  END IF;

  -- User deletes own; organizer deletes for their tournament
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_registrations' AND policyname = 'treg_delete') THEN
    CREATE POLICY "treg_delete" ON tournament_registrations FOR DELETE
      USING (
        auth.uid() = user_id
        OR auth.uid() = registered_by
        OR EXISTS (
          SELECT 1 FROM tournaments t
          JOIN memberships m ON m.academy_id = t.organizer_academy_id
          WHERE t.id = tournament_id AND m.profile_id = auth.uid()
        )
      );
  END IF;
END $$;


-- ─────────────────────────────────────────────────────────────────
-- 5. tournament_brackets — Bracket metadata per category
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tournament_brackets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES tournament_categories(id) ON DELETE CASCADE,
  method VARCHAR(30) DEFAULT 'single_elimination' CHECK (
    method IN ('single_elimination', 'double_elimination', 'round_robin')
  ),
  total_rounds INTEGER DEFAULT 0,
  total_athletes INTEGER DEFAULT 0,
  seed_data JSONB, -- stores seeding order
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tournament_brackets ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_tbr_tournament ON tournament_brackets(tournament_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tbr_category ON tournament_brackets(category_id);
CREATE INDEX IF NOT EXISTS idx_tbr_status ON tournament_brackets(status);

DO $$ BEGIN
  -- Public reads
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_brackets' AND policyname = 'tbr_select_public') THEN
    CREATE POLICY "tbr_select_public" ON tournament_brackets FOR SELECT USING (true);
  END IF;

  -- Organizer insert
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_brackets' AND policyname = 'tbr_insert_organizer') THEN
    CREATE POLICY "tbr_insert_organizer" ON tournament_brackets FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM tournaments t
          JOIN memberships m ON m.academy_id = t.organizer_academy_id
          WHERE t.id = tournament_id AND m.profile_id = auth.uid()
        )
      );
  END IF;

  -- Organizer update
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_brackets' AND policyname = 'tbr_update_organizer') THEN
    CREATE POLICY "tbr_update_organizer" ON tournament_brackets FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM tournaments t
          JOIN memberships m ON m.academy_id = t.organizer_academy_id
          WHERE t.id = tournament_id AND m.profile_id = auth.uid()
        )
      );
  END IF;

  -- Organizer delete
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_brackets' AND policyname = 'tbr_delete_organizer') THEN
    CREATE POLICY "tbr_delete_organizer" ON tournament_brackets FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM tournaments t
          JOIN memberships m ON m.academy_id = t.organizer_academy_id
          WHERE t.id = tournament_id AND m.profile_id = auth.uid()
        )
      );
  END IF;
END $$;


-- ─────────────────────────────────────────────────────────────────
-- 6. tournament_matches — Individual fights/matches
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tournament_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bracket_id UUID NOT NULL REFERENCES tournament_brackets(id) ON DELETE CASCADE,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES tournament_categories(id) ON DELETE CASCADE,

  -- Position in bracket
  round INTEGER NOT NULL,
  position INTEGER NOT NULL,
  next_match_id UUID REFERENCES tournament_matches(id) ON DELETE SET NULL,

  -- Fighters (nullable for bye / TBD slots)
  fighter_a_id UUID REFERENCES profiles(id),
  fighter_a_name VARCHAR(200),
  fighter_a_academy VARCHAR(200),
  fighter_b_id UUID REFERENCES profiles(id),
  fighter_b_name VARCHAR(200),
  fighter_b_academy VARCHAR(200),

  -- Result
  winner_id UUID REFERENCES profiles(id),
  winner_name VARCHAR(200),
  method VARCHAR(30) CHECK (
    method IS NULL OR method IN (
      'submission', 'points', 'advantages', 'penalties',
      'dq', 'walkover', 'referee_decision', 'draw', 'wo'
    )
  ),
  submission_name VARCHAR(100),

  -- Score
  score_a INTEGER DEFAULT 0,
  score_b INTEGER DEFAULT 0,
  advantages_a INTEGER DEFAULT 0,
  advantages_b INTEGER DEFAULT 0,
  penalties_a INTEGER DEFAULT 0,
  penalties_b INTEGER DEFAULT 0,

  -- Timing
  duration_seconds INTEGER,
  mat_number INTEGER,
  area_number INTEGER,
  scheduled_time TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,

  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (
    status IN ('pending', 'called', 'in_progress', 'completed', 'cancelled', 'bye')
  ),

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
CREATE INDEX IF NOT EXISTS idx_tm_next ON tournament_matches(next_match_id) WHERE next_match_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tm_scheduled ON tournament_matches(scheduled_time) WHERE scheduled_time IS NOT NULL;

DO $$ BEGIN
  -- Public reads
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_matches' AND policyname = 'tm_select_public') THEN
    CREATE POLICY "tm_select_public" ON tournament_matches FOR SELECT USING (true);
  END IF;

  -- Organizer insert
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_matches' AND policyname = 'tm_insert_organizer') THEN
    CREATE POLICY "tm_insert_organizer" ON tournament_matches FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM tournaments t
          JOIN memberships m ON m.academy_id = t.organizer_academy_id
          WHERE t.id = tournament_id AND m.profile_id = auth.uid()
        )
      );
  END IF;

  -- Organizer update
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_matches' AND policyname = 'tm_update_organizer') THEN
    CREATE POLICY "tm_update_organizer" ON tournament_matches FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM tournaments t
          JOIN memberships m ON m.academy_id = t.organizer_academy_id
          WHERE t.id = tournament_id AND m.profile_id = auth.uid()
        )
      );
  END IF;

  -- Organizer delete
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_matches' AND policyname = 'tm_delete_organizer') THEN
    CREATE POLICY "tm_delete_organizer" ON tournament_matches FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM tournaments t
          JOIN memberships m ON m.academy_id = t.organizer_academy_id
          WHERE t.id = tournament_id AND m.profile_id = auth.uid()
        )
      );
  END IF;
END $$;


-- ─────────────────────────────────────────────────────────────────
-- 7. athlete_profiles — Athlete career/competitive profiles
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS athlete_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  full_name VARCHAR(200) NOT NULL,
  nickname VARCHAR(100),
  photo_url TEXT,
  belt VARCHAR(30),
  weight DECIMAL(5,2),
  weight_class VARCHAR(50),
  age_group VARCHAR(50),
  academy_id UUID REFERENCES academies(id) ON DELETE SET NULL,
  academy_name VARCHAR(200),
  modality VARCHAR(30) DEFAULT 'BJJ',

  -- Career stats
  total_fights INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  submissions INTEGER DEFAULT 0,
  submissions_suffered INTEGER DEFAULT 0,
  gold_medals INTEGER DEFAULT 0,
  silver_medals INTEGER DEFAULT 0,
  bronze_medals INTEGER DEFAULT 0,

  -- Ranking
  ranking_points INTEGER DEFAULT 0,
  ranking_position INTEGER,
  win_rate DECIMAL(5,2) DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE athlete_profiles ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS idx_ap_user ON athlete_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_ap_academy ON athlete_profiles(academy_id);
CREATE INDEX IF NOT EXISTS idx_ap_ranking ON athlete_profiles(ranking_points DESC);
CREATE INDEX IF NOT EXISTS idx_ap_belt ON athlete_profiles(belt);
CREATE INDEX IF NOT EXISTS idx_ap_weight_class ON athlete_profiles(weight_class);
CREATE INDEX IF NOT EXISTS idx_ap_modality ON athlete_profiles(modality);

DO $$ BEGIN
  -- Public reads
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'athlete_profiles' AND policyname = 'ap_select_public') THEN
    CREATE POLICY "ap_select_public" ON athlete_profiles FOR SELECT USING (true);
  END IF;

  -- User manages own profile
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'athlete_profiles' AND policyname = 'ap_insert_own') THEN
    CREATE POLICY "ap_insert_own" ON athlete_profiles FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'athlete_profiles' AND policyname = 'ap_update_own') THEN
    CREATE POLICY "ap_update_own" ON athlete_profiles FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;


-- ─────────────────────────────────────────────────────────────────
-- 8. academy_tournament_stats — Academy rankings per tournament
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS academy_tournament_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  academy_name VARCHAR(200) NOT NULL,

  -- Athlete count
  total_athletes INTEGER DEFAULT 0,

  -- Medal count
  gold INTEGER DEFAULT 0,
  silver INTEGER DEFAULT 0,
  bronze INTEGER DEFAULT 0,

  -- Fight stats
  total_fights INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  submissions INTEGER DEFAULT 0,

  -- Scoring
  points INTEGER DEFAULT 0,
  ranking_position INTEGER,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE academy_tournament_stats ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS idx_ats_unique ON academy_tournament_stats(academy_id, tournament_id);
CREATE INDEX IF NOT EXISTS idx_ats_tournament ON academy_tournament_stats(tournament_id);
CREATE INDEX IF NOT EXISTS idx_ats_points ON academy_tournament_stats(tournament_id, points DESC);
CREATE INDEX IF NOT EXISTS idx_ats_academy ON academy_tournament_stats(academy_id);

DO $$ BEGIN
  -- Public reads
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'academy_tournament_stats' AND policyname = 'ats_select_public') THEN
    CREATE POLICY "ats_select_public" ON academy_tournament_stats FOR SELECT USING (true);
  END IF;

  -- Organizer insert/update for their tournament
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'academy_tournament_stats' AND policyname = 'ats_insert_organizer') THEN
    CREATE POLICY "ats_insert_organizer" ON academy_tournament_stats FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM tournaments t
          JOIN memberships m ON m.academy_id = t.organizer_academy_id
          WHERE t.id = tournament_id AND m.profile_id = auth.uid()
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'academy_tournament_stats' AND policyname = 'ats_update_organizer') THEN
    CREATE POLICY "ats_update_organizer" ON academy_tournament_stats FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM tournaments t
          JOIN memberships m ON m.academy_id = t.organizer_academy_id
          WHERE t.id = tournament_id AND m.profile_id = auth.uid()
        )
      );
  END IF;
END $$;


-- ─────────────────────────────────────────────────────────────────
-- 9. tournament_predictions — Bracket prediction game (bolao)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tournament_predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  match_id UUID REFERENCES tournament_matches(id) ON DELETE CASCADE,
  category_id UUID REFERENCES tournament_categories(id) ON DELETE SET NULL,
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
CREATE INDEX IF NOT EXISTS idx_tp_leaderboard ON tournament_predictions(tournament_id, user_id, points_earned DESC);

DO $$ BEGIN
  -- User manages own predictions
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
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_predictions' AND policyname = 'tp_delete_own') THEN
    CREATE POLICY "tp_delete_own" ON tournament_predictions FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;


-- ─────────────────────────────────────────────────────────────────
-- 10. tournament_feed — Live feed items (results, announcements, etc)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tournament_feed (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL CHECK (
    type IN ('result', 'announcement', 'photo', 'bracket_update', 'schedule_change', 'medal_ceremony', 'call', 'live_score')
  ),
  title VARCHAR(300) NOT NULL,
  content TEXT,
  image_url TEXT,
  match_id UUID REFERENCES tournament_matches(id) ON DELETE SET NULL,
  category_id UUID REFERENCES tournament_categories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES profiles(id),
  author_name VARCHAR(200),
  pinned BOOLEAN DEFAULT false,
  metadata JSONB, -- extra structured data per feed type
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tournament_feed ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_tf_tournament ON tournament_feed(tournament_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tf_type ON tournament_feed(tournament_id, type);
CREATE INDEX IF NOT EXISTS idx_tf_pinned ON tournament_feed(tournament_id, pinned, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tf_match ON tournament_feed(match_id) WHERE match_id IS NOT NULL;

DO $$ BEGIN
  -- Public reads
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_feed' AND policyname = 'tf_select_public') THEN
    CREATE POLICY "tf_select_public" ON tournament_feed FOR SELECT USING (true);
  END IF;

  -- Organizer insert
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_feed' AND policyname = 'tf_insert_organizer') THEN
    CREATE POLICY "tf_insert_organizer" ON tournament_feed FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM tournaments t
          JOIN memberships m ON m.academy_id = t.organizer_academy_id
          WHERE t.id = tournament_id AND m.profile_id = auth.uid()
        )
      );
  END IF;

  -- Organizer update
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_feed' AND policyname = 'tf_update_organizer') THEN
    CREATE POLICY "tf_update_organizer" ON tournament_feed FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM tournaments t
          JOIN memberships m ON m.academy_id = t.organizer_academy_id
          WHERE t.id = tournament_id AND m.profile_id = auth.uid()
        )
      );
  END IF;

  -- Organizer delete
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tournament_feed' AND policyname = 'tf_delete_organizer') THEN
    CREATE POLICY "tf_delete_organizer" ON tournament_feed FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM tournaments t
          JOIN memberships m ON m.academy_id = t.organizer_academy_id
          WHERE t.id = tournament_id AND m.profile_id = auth.uid()
        )
      );
  END IF;
END $$;
