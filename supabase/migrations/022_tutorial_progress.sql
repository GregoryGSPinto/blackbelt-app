-- Tutorial progress tracking for first-access guided tours
CREATE TABLE IF NOT EXISTS tutorial_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tutorial_id VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','skipped')),
  current_step INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  skipped_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, tutorial_id)
);

CREATE INDEX idx_tutorial_user ON tutorial_progress(user_id);

ALTER TABLE tutorial_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tutorial_own_read" ON tutorial_progress FOR SELECT USING (
  user_id = auth.uid()
);
CREATE POLICY "tutorial_own_write" ON tutorial_progress FOR INSERT WITH CHECK (
  user_id = auth.uid()
);
CREATE POLICY "tutorial_own_update" ON tutorial_progress FOR UPDATE USING (
  user_id = auth.uid()
);
