-- ═══════════════════════════════════════════════════
-- BLACKBELT v2 — Enterprise Consolidation
-- Garante que TODAS as tabelas necessárias existem
-- Safe: IF NOT EXISTS em tudo, DO/EXCEPTION para policies
-- ═══════════════════════════════════════════════════

-- ═══ GUARDIAN LINKS ═══
CREATE TABLE IF NOT EXISTS guardian_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  relationship TEXT DEFAULT 'responsavel',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(guardian_profile_id, student_profile_id)
);

-- ═══ BELT PROGRESSIONS ═══
CREATE TABLE IF NOT EXISTS belt_progressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  from_belt TEXT,
  from_stripes INTEGER,
  to_belt TEXT NOT NULL,
  to_stripes INTEGER DEFAULT 0,
  promoted_by UUID REFERENCES profiles(id),
  promoted_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  ceremony_date DATE
);

-- ═══ STUDENT ACHIEVEMENTS ═══
CREATE TABLE IF NOT EXISTS student_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievement_definitions(id),
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, achievement_id)
);

-- ═══ XP LEDGER ═══
CREATE TABLE IF NOT EXISTS xp_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ FRANCHISE NETWORKS ═══
CREATE TABLE IF NOT EXISTS franchise_networks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_profile_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ WEBHOOK LOGS ═══
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════
-- INDEXES (IF NOT EXISTS)
-- ═══════════════════════════════

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_memberships_profile ON memberships(profile_id);
CREATE INDEX IF NOT EXISTS idx_memberships_academy ON memberships(academy_id);
CREATE INDEX IF NOT EXISTS idx_students_profile ON students(profile_id);
CREATE INDEX IF NOT EXISTS idx_students_academy ON students(academy_id);
CREATE INDEX IF NOT EXISTS idx_classes_academy ON classes(academy_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(checked_at);
CREATE INDEX IF NOT EXISTS idx_invoices_student ON invoices(student_id);
CREATE INDEX IF NOT EXISTS idx_invoices_academy ON invoices(academy_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_notifications_profile ON notifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_messages_academy ON messages(academy_id);
CREATE INDEX IF NOT EXISTS idx_xp_ledger_student ON xp_ledger(student_id);
CREATE INDEX IF NOT EXISTS idx_belt_progressions_student ON belt_progressions(student_id);
CREATE INDEX IF NOT EXISTS idx_belt_progressions_academy ON belt_progressions(academy_id);

-- ═══════════════════════════════
-- RLS — novas tabelas
-- ═══════════════════════════════

ALTER TABLE guardian_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE belt_progressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE franchise_networks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════
-- POLICIES
-- ═══════════════════════════════

-- Helper functions (safe create or replace)
CREATE OR REPLACE FUNCTION get_user_academy_id()
RETURNS UUID AS $$
  SELECT m.academy_id FROM memberships m
  JOIN profiles p ON p.id = m.profile_id
  WHERE p.user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Guardian links
DO $$ BEGIN
  CREATE POLICY guardian_links_select ON guardian_links FOR SELECT USING (
    guardian_profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR student_profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR get_user_role() IN ('super_admin', 'admin')
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Belt progressions
DO $$ BEGIN
  CREATE POLICY belt_progressions_select ON belt_progressions FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid()))
    OR academy_id = get_user_academy_id()
    OR get_user_role() = 'super_admin'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY belt_progressions_insert ON belt_progressions FOR INSERT WITH CHECK (
    academy_id = get_user_academy_id()
    OR get_user_role() IN ('super_admin', 'admin', 'professor')
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Student achievements
DO $$ BEGIN
  CREATE POLICY student_achievements_select ON student_achievements FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid()))
    OR get_user_role() IN ('super_admin', 'admin', 'professor')
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- XP ledger
DO $$ BEGIN
  CREATE POLICY xp_select ON xp_ledger FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid()))
    OR get_user_role() IN ('super_admin', 'admin', 'professor')
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Franchise networks
DO $$ BEGIN
  CREATE POLICY franchise_select ON franchise_networks FOR SELECT USING (
    owner_profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR get_user_role() = 'super_admin'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Webhook logs
DO $$ BEGIN
  CREATE POLICY webhook_logs_select ON webhook_logs FOR SELECT USING (
    get_user_role() IN ('super_admin', 'admin')
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ═══════════════════════════════
-- UPDATED_AT TRIGGER
-- ═══════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER academies_updated_at BEFORE UPDATE ON academies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
