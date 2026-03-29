-- UGC Moderation — blocked_users + message visibility
-- Apple Guideline 1.2 + Google Policy 4.19

-- 1. Blocked users table
CREATE TABLE IF NOT EXISTS blocked_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY blocked_own_select ON blocked_users FOR SELECT USING (auth.uid() = blocker_id);
CREATE POLICY blocked_own_insert ON blocked_users FOR INSERT WITH CHECK (auth.uid() = blocker_id);
CREATE POLICY blocked_own_delete ON blocked_users FOR DELETE USING (auth.uid() = blocker_id);
CREATE INDEX idx_blocked_blocker ON blocked_users(blocker_id);
CREATE INDEX idx_blocked_blocked ON blocked_users(blocked_id);

-- 2. Add hidden_at column to messages if the messages table exists
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages' AND table_schema = 'public') THEN
    ALTER TABLE messages ADD COLUMN IF NOT EXISTS hidden_at TIMESTAMPTZ;
    ALTER TABLE messages ADD COLUMN IF NOT EXISTS hidden_by UUID REFERENCES auth.users(id);
  END IF;
END $$;
