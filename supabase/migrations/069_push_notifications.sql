-- ================================================================
-- 069 — Push Notification Device Tokens
-- ================================================================

CREATE TABLE IF NOT EXISTS device_tokens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token text NOT NULL,
  platform text NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(profile_id, platform)
);

CREATE INDEX idx_device_tokens_profile ON device_tokens(profile_id);

ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "device_tokens_own" ON device_tokens
  FOR ALL USING (profile_id IN (SELECT public.get_my_profile_ids()));
