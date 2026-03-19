-- ═══════════════════════════════════════════════════════
-- 025 — App Stores (Push Tokens + Parental Consent)
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform VARCHAR(10) NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, token)
);

CREATE INDEX IF NOT EXISTS idx_push_tokens_user ON push_tokens(user_id);
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'push_tokens' AND column_name = 'is_active') THEN
    CREATE INDEX IF NOT EXISTS idx_push_tokens_active ON push_tokens(is_active) WHERE is_active = true;
  END IF;
END $$;

ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "push_tokens_own" ON push_tokens FOR ALL USING (user_id = auth.uid());

-- Parental consent fields on students (if table exists, add columns)
-- These are safe with IF NOT EXISTS
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'students') THEN
    ALTER TABLE students ADD COLUMN IF NOT EXISTS parental_consent BOOLEAN DEFAULT false;
    ALTER TABLE students ADD COLUMN IF NOT EXISTS parental_consent_at TIMESTAMPTZ;
    ALTER TABLE students ADD COLUMN IF NOT EXISTS parental_consent_by UUID;
  END IF;
END $$;
