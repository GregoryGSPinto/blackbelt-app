-- ═══════════════════════════════════════════════════════════════════════
-- User Preferences & Academy Settings
-- ═══════════════════════════════════════════════════════════════════════

-- ── user_preferences ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  preferences JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(profile_id)
);

-- ── academy_settings ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS academy_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  settings JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(academy_id)
);

-- ── RLS ──────────────────────────────────────────────────────────────
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_settings ENABLE ROW LEVEL SECURITY;

-- Users can read/write their own preferences
CREATE POLICY "users_own_preferences_select" ON user_preferences
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "users_own_preferences_insert" ON user_preferences
  FOR INSERT WITH CHECK (profile_id = auth.uid());

CREATE POLICY "users_own_preferences_update" ON user_preferences
  FOR UPDATE USING (profile_id = auth.uid());

-- Academy admins can read/write academy settings
CREATE POLICY "academy_admin_settings_select" ON academy_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.academy_id = academy_settings.academy_id
        AND m.profile_id = auth.uid()
        AND m.role IN ('admin', 'owner')
    )
  );

CREATE POLICY "academy_admin_settings_insert" ON academy_settings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.academy_id = academy_settings.academy_id
        AND m.profile_id = auth.uid()
        AND m.role IN ('admin', 'owner')
    )
  );

CREATE POLICY "academy_admin_settings_update" ON academy_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.academy_id = academy_settings.academy_id
        AND m.profile_id = auth.uid()
        AND m.role IN ('admin', 'owner')
    )
  );

-- ── Auto-update triggers ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_academy_settings_updated_at
  BEFORE UPDATE ON academy_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ── Indexes ──────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_user_preferences_profile_id ON user_preferences(profile_id);
CREATE INDEX IF NOT EXISTS idx_academy_settings_academy_id ON academy_settings(academy_id);
