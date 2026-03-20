-- ══════════════════════════════════════════
-- BETA INFRASTRUCTURE — Soft Launch Tables
-- ══════════════════════════════════════════

-- 1. Feedback dos usuários beta
CREATE TABLE IF NOT EXISTS beta_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID REFERENCES academies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT,
  user_role TEXT,

  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('bug', 'feature_request', 'usability', 'praise', 'general')),

  title TEXT NOT NULL,
  description TEXT NOT NULL,
  screenshot_url TEXT,
  page_url TEXT,
  device_info JSONB,

  priority TEXT DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'in_progress', 'resolved', 'wont_fix', 'duplicate')),
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. NPS (Net Promoter Score) surveys
CREATE TABLE IF NOT EXISTS beta_nps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID REFERENCES academies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT,
  user_role TEXT,

  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
  reason TEXT,
  what_would_improve TEXT,
  favorite_feature TEXT,

  survey_trigger TEXT DEFAULT 'scheduled' CHECK (survey_trigger IN ('scheduled', 'manual', '7_day', '30_day', 'post_onboarding')),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Sessões de uso (analytics simplificado)
CREATE TABLE IF NOT EXISTS beta_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID REFERENCES academies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_role TEXT,

  session_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_end TIMESTAMPTZ,
  pages_visited JSONB DEFAULT '[]'::jsonb,
  actions_count INTEGER DEFAULT 0,
  device_type TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Feature usage tracking
CREATE TABLE IF NOT EXISTS beta_feature_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID REFERENCES academies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_role TEXT,

  feature_name TEXT NOT NULL,
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Beta program — academias participantes
CREATE TABLE IF NOT EXISTS beta_academies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID REFERENCES academies(id) ON DELETE CASCADE,

  beta_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  beta_end_date DATE,
  plan_override TEXT DEFAULT 'pro',
  discount_percent INTEGER DEFAULT 50,
  discount_duration TEXT DEFAULT 'lifetime',

  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT NOT NULL,

  status TEXT DEFAULT 'active' CHECK (status IN ('invited', 'onboarding', 'active', 'paused', 'churned', 'converted')),
  onboarding_completed_at TIMESTAMPTZ,
  first_real_usage_at TIMESTAMPTZ,

  metrics_snapshot JSONB DEFAULT '{}'::jsonb,

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Changelog / Release notes
CREATE TABLE IF NOT EXISTS beta_changelog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  changes JSONB NOT NULL DEFAULT '[]'::jsonb,
  published_at TIMESTAMPTZ,
  is_draft BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_beta_feedback_academy ON beta_feedback(academy_id);
CREATE INDEX idx_beta_feedback_status ON beta_feedback(status);
CREATE INDEX idx_beta_feedback_type ON beta_feedback(feedback_type);
CREATE INDEX idx_beta_feedback_created ON beta_feedback(created_at DESC);
CREATE INDEX idx_beta_nps_academy ON beta_nps(academy_id);
CREATE INDEX idx_beta_nps_created ON beta_nps(created_at DESC);
CREATE INDEX idx_beta_sessions_academy ON beta_sessions(academy_id);
CREATE INDEX idx_beta_sessions_user ON beta_sessions(user_id);
CREATE INDEX idx_beta_feature_usage_feature ON beta_feature_usage(feature_name);
CREATE INDEX idx_beta_feature_usage_created ON beta_feature_usage(created_at DESC);

-- RLS
ALTER TABLE beta_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_nps ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_feature_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_academies ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_changelog ENABLE ROW LEVEL SECURITY;

-- Feedback: users da academia podem criar, super admin e admin da academia podem ver todos
CREATE POLICY "Users can create own feedback" ON beta_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view academy feedback" ON beta_feedback FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'super_admin' OR (role = 'admin' AND academy_id = beta_feedback.academy_id)))
);
CREATE POLICY "Super admin full access feedback" ON beta_feedback FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- NPS
CREATE POLICY "Users can create own nps" ON beta_nps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Super admin full access nps" ON beta_nps FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- Sessions e Feature Usage: insert livre, select só super admin
CREATE POLICY "Users can insert sessions" ON beta_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Super admin view sessions" ON beta_sessions FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);
CREATE POLICY "Users can insert feature usage" ON beta_feature_usage FOR INSERT WITH CHECK (true);
CREATE POLICY "Super admin view feature usage" ON beta_feature_usage FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- Beta academies: só super admin
CREATE POLICY "Super admin manage beta academies" ON beta_academies FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- Changelog: todos podem ler publicados, super admin gerencia
CREATE POLICY "Anyone can read published changelog" ON beta_changelog FOR SELECT USING (is_draft = false);
CREATE POLICY "Super admin manage changelog" ON beta_changelog FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- Storage bucket para screenshots de feedback
INSERT INTO storage.buckets (id, name, public) VALUES ('beta-screenshots', 'beta-screenshots', true)
ON CONFLICT (id) DO NOTHING;
